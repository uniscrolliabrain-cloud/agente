import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import pg from "pg";
import type { Store } from "../db.ts";
import { AppError } from "../errors.ts";

export interface BusinessQuery {
  source: "postgres" | "csv" | "api" | "sheets";
  query: string;
  params?: Record<string, unknown>;
}

const READ_ONLY_SQL = /^\s*(select|with)\b/i;
const FORBIDDEN_SQL =
  /\b(insert|update|delete|drop|alter|create|grant|revoke|truncate|merge|copy|reindex|vacuum|analyze|refresh|listen|notify|do|call|execute|prepare|set|reset|pg_sleep|pg_read_file|pg_ls_dir|lo_import|lo_export|dblink)\b/i;

/**
 * The SOP executor interpolates values into the query string before it reaches this
 * service, so the executor cannot help us protect the DB. We do best-effort defense
 * here: reject comments (`--`, `/*`) and any odd quote counts, which are the classic
 * vectors for a value like `' OR 1=1 --`. For defense-in-depth, configure a
 * dedicated PostgreSQL role with GRANT SELECT only.
 */
function rejectUnsafeSql(sql: string): void {
  if (sql.includes(";")) throw new AppError("Business query must be a single statement", 422);
  if (sql.includes("--") || sql.includes("/*") || sql.includes("*/"))
    throw new AppError("Business query must not contain SQL comments", 422);
  const singleQuotes = (sql.match(/'/g) ?? []).length;
  const doubleQuotes = (sql.match(/"/g) ?? []).length;
  if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0)
    throw new AppError("Business query has an unbalanced quote", 422);
}

function isPrivateIp(address: string): boolean {
  const family = isIP(address);
  if (family === 4) {
    const [a = 0, b = 0, c = 0] = address.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || (b === 0 && (c === 0 || c === 2)) || (b === 88 && c === 99))) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
      (a === 203 && b === 0 && c === 113)
    );
  }
  if (family !== 6 || address.includes(".")) return true;
  const lower = address.toLowerCase().replace(/^\[|\]$/g, "");
  if (lower === "::" || lower === "::1") return true;
  const halves = lower.split("::");
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const words =
    halves.length === 1
      ? left
      : [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right];
  if (words.length !== 8) return true;
  const first = Number.parseInt(words[0], 16);
  const second = Number.parseInt(words[1], 16);
  if (!Number.isFinite(first) || !Number.isFinite(second)) return true;
  if (first < 0x2000 || first > 0x3fff) return true;
  if (first === 0x2001 && second === 0xdb8) return true;
  return false;
}

/** Small adapter layer for beta. PostgreSQL is real; sample mode has a durable local dataset. */
export class BusinessDataService {
  constructor(private readonly db: Store, private readonly databaseUrl?: string) {}

  async query(owner: string, q: BusinessQuery) {
    if (q.source === "api") return this.queryApi(q.query);
    if (q.source === "postgres") return this.queryPostgres(owner, q);
    if (q.source === "csv" || q.source === "sheets") {
      const records = await this.db.list<Record<string, unknown>>(owner, "business-records");
      return { rows: records, summary: `Local beta dataset returned ${records.length} row(s)` };
    }
    throw new AppError(`Unsupported business source: ${q.source}`, 422);
  }

  private async queryApi(rawUrl: string) {
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new AppError("Business API URL is invalid", 422);
    }
    if (!["https:", "http:"].includes(url.protocol))
      throw new AppError("Business API must use HTTP(S)", 422);
    if (url.username || url.password)
      throw new AppError("Business API URL must not contain credentials", 422);
    const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (
      hostname === "localhost" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname.endsWith(".home")
    )
      throw new AppError("Business API host is not allowed", 422);

    let addresses: Array<{ address: string; family: number }>;
    if (isIP(hostname)) {
      addresses = [{ address: hostname, family: isIP(hostname) }];
    } else {
      try {
        addresses = await lookup(hostname, { all: true, verbatim: true });
      } catch {
        throw new AppError("Business API host could not be resolved", 502);
      }
    }
    if (!addresses.length || addresses.some((a) => isPrivateIp(a.address)))
      throw new AppError("Business API host resolves to a private address", 422);

    let response: Response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(10_000), redirect: "error" });
    } catch {
      throw new AppError("Business API request failed", 502);
    }
    if (!response.ok) throw new AppError(`Business API returned ${response.status}`, 502);
    const declared = Number(response.headers.get("content-length") ?? "0");
    if (declared > 10 * 1024 * 1024)
      throw new AppError("Business API response is too large", 502);
    const text = await response.text();
    if (text.length > 10 * 1024 * 1024)
      throw new AppError("Business API response is too large", 502);
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      throw new AppError("Business API did not return JSON", 502);
    }
    const rows = Array.isArray(value) ? value : [value];
    return { rows, summary: `Fetched ${rows.length} row(s) from API` };
  }

  private async queryPostgres(owner: string, q: BusinessQuery) {
    const sql = q.query.trim();
    if (!sql) throw new AppError("Business query is empty", 422);
    if (!READ_ONLY_SQL.test(sql))
      throw new AppError("Business query must be a SELECT or WITH", 422);
    if (FORBIDDEN_SQL.test(sql))
      throw new AppError("Business query contains a forbidden keyword", 422);
    rejectUnsafeSql(sql);

    if (this.databaseUrl) {
      const pool = new pg.Pool({ connectionString: this.databaseUrl, max: 1 });
      try {
        // The query is already a fully interpolated string; parameters are not usable here
        // without changing how the SOP executor builds the query. The role used must have
        // GRANT SELECT only for real defense-in-depth.
        const result = await pool.query(sql);
        return {
          rows: result.rows,
          summary: `PostgreSQL returned ${result.rowCount ?? result.rows.length} row(s)`,
        };
      } finally {
        await pool.end();
      }
    }

    // Beta fallback: emulate a tiny business table from durable records.
    const records = await this.db.list<Record<string, unknown>>(owner, "business-records");
    const match = sql.match(/where\s+([a-zA-Z_][\w]*)\s*=\s*['"]?([^'"\s]+)['"]?/i);
    const rows = match
      ? records.filter((row) => String(row[match[1]]) === String(match[2]))
      : records;
    return { rows, summary: `Local business dataset returned ${rows.length} row(s)` };
  }
}