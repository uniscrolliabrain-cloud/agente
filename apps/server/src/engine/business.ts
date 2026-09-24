import pg from "pg";
import type { Store } from "../db.ts";
import { AppError } from "../errors.ts";

export interface BusinessQuery {
  source: "postgres" | "csv" | "api" | "sheets";
  query: string;
  params?: Record<string, unknown>;
}

/** Small adapter layer for beta. PostgreSQL is real; sample mode has a durable local dataset. */
export class BusinessDataService {
  constructor(private readonly db: Store, private readonly databaseUrl?: string) {}

  async query(owner: string, q: BusinessQuery) {
    if (q.source === "api") {
      const url = new URL(q.query);
      if (!["https:", "http:"].includes(url.protocol)) throw new AppError("Business API must use HTTP(S)", 422);
      const response = await fetch(url);
      if (!response.ok) throw new AppError(`Business API returned ${response.status}`, 502);
      const value: unknown = await response.json();
      const rows = Array.isArray(value) ? value : [value];
      return { rows, summary: `Fetched ${rows.length} row(s) from API` };
    }
    if (q.source === "postgres") {
      if (this.databaseUrl) {
        const pool = new pg.Pool({ connectionString: this.databaseUrl, max: 1 });
        try {
          const result = await pool.query(q.query, Object.values(q.params ?? {}));
          return { rows: result.rows, summary: `PostgreSQL returned ${result.rowCount ?? result.rows.length} row(s)` };
        } finally {
          await pool.end();
        }
      }
      // Beta fallback: emulate a tiny business table from durable records.
      const records = await this.db.list<Record<string, unknown>>(owner, "business-records");
      const match = q.query.match(/where\s+([a-zA-Z_][\w]*)\s*=\s*['\"]?([^'\"\s]+)['\"]?/i);
      const rows = match
        ? records.filter((row) => String(row[match[1]]) === String(match[2]))
        : records;
      return { rows, summary: `Local business dataset returned ${rows.length} row(s)` };
    }
    if (q.source === "csv" || q.source === "sheets") {
      const records = await this.db.list<Record<string, unknown>>(owner, "business-records");
      return { rows: records, summary: `Local beta dataset returned ${records.length} row(s)` };
    }
    throw new AppError(`Unsupported business source: ${q.source}`, 422);
  }
}
