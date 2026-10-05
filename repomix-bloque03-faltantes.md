This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: apps/server/src/files.ts, apps/server/src/errors.ts, apps/server/src/rate-limit.ts
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      errors.ts
      files.ts
      rate-limit.ts
```

# Files

## File: apps/server/src/errors.ts
```typescript
export { AppError } from "../../../packages/domain/src/errors.ts";
```

## File: apps/server/src/rate-limit.ts
```typescript
// DISTRIBUTED_NOTE: en Fly multi-machine este limiter es por maquina. Para prod cliente-unico con min=1 basta. Si escalas a 2+ maquinas, mover a Redis.
/**
 * Limite de intentos en memoria, por clave arbitraria (IP, email...). Cada proceso del
 * API lleva su propia cuenta, que es lo que basta para frenar fuerza bruta contra
 * /api/auth/login en un deployment de un solo proceso sin anadir dependencias.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Milisegundos que faltan hasta que la ventana se reabra. 0 cuando se permite. */
  retryAfterMs: number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 5000,
  ) {}

  /**
   * RATE_LIMIT_TENANT_V1 - toma un intento scoped por tenant+usuario.
   * La key compuesta evita que un tenant agote el limite del otro.
   */
  takeForTenant(tenantId: string, userId: string, action: string): RateLimitResult {
    return this.take(`${tenantId}:${userId}:${action}`);
  }

  /**
   * RATE_LIMIT_USER_V1 — limit por usuario dentro del tenant.
   * Cierra el hueco del miniaudit 04 ("Sin rate limit por usuario").
   */
  takeForUser(userId: string, action: string): RateLimitResult {
    return this.take(`user:${userId}:${action}`);
  }

  /** Registra un intento. `allowed: false` significa que la clave agoto su ventana. */
  take(key: string): RateLimitResult {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.prune(now);
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, retryAfterMs: 0 };
    }
    if (bucket.count >= this.limit) return { allowed: false, retryAfterMs: bucket.resetAt - now };
    bucket.count += 1;
    return { allowed: true, retryAfterMs: 0 };
  }

  /** Un acceso correcto limpia la ventana de esa clave. */
  reset(key: string): void {
    this.buckets.delete(key);
  }

  private prune(now: number): void {
    if (this.buckets.size < this.maxKeys) return;
    for (const [key, bucket] of this.buckets)
      if (bucket.resetAt <= now) this.buckets.delete(key);
    // Still full: drop the oldest entries so a flood of keys cannot grow the map forever.
    while (this.buckets.size >= this.maxKeys) {
      const oldest = this.buckets.keys().next();
      if (oldest.done) return;
      this.buckets.delete(oldest.value);
    }
  }
}
```

## File: apps/server/src/files.ts
```typescript
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, rm, rename } from "node:fs/promises";
import { join } from "node:path";
import type { Artifact } from "../../../packages/domain/src/index.ts";
import { fillPdf, inspectPdf } from "../../../packages/integrations/src/pdf.ts";
import type { Auth } from "./auth.ts";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import { chunkText, embedTexts, RAG_MAX_CHUNKS_PER_SOURCE } from "./engine/rag.ts";

const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Extension → MIME. Conservative allowlist: solo tipos que un usuario humano
 * sube a un workspace. Nada de ejecutables, scripts, HTML con JS, ni binarios
 * opacos. Cada MIME aquí también tiene su extensión de almacenamiento.
 */
const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  json: "application/json",
  yml: "text/yaml",
  yaml: "text/yaml",
  xml: "application/xml",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  zip: "application/zip",
};

function extensionOf(name: string): string {
  const idx = name.lastIndexOf(".");
  if (idx < 0) return "";
  return name.slice(idx + 1).toLowerCase();
}

function mimeFromName(name: string): string | null {
  return MIME_BY_EXT[extensionOf(name)] ?? null;
}

function categoryFromMime(mime: string): "pdf" | "image" | "text" | "office" | "archive" | "other" {
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("text/")) return "text";
  if (
    mime.startsWith("application/vnd.openxmlformats") ||
    mime === "application/msword" ||
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.ms-powerpoint" ||
    mime.startsWith("application/vnd.oasis.opendocument")
  )
    return "office";
  if (mime === "application/zip") return "archive";
  return "other";
}

export class Files {
  constructor(
    // FILES_TENANT_STORE_V1 — acepta Store o TenantScopedStore.
    // Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
    private readonly db: Store | import("./db-tenant.ts").TenantScopedStore,
    private readonly config: Config,
    private readonly auth: Auth,
  ) {}

  async import(
    owner: string,
    name: string,
    bytes: Uint8Array,
    source: string,
    // FILES_TENANT_STRICT_V2 - tenantId obligatorio, ANTES de parentId para
    // respetar "required parameter cannot follow an optional parameter".
    tenantId: string,
    parentId?: string,
  ): Promise<Artifact> {
    if (bytes.length === 0) throw new AppError("Empty file", 422);
    if (bytes.length > MAX_BYTES) throw new AppError("Files must be 10 MB or smaller", 413);
    // PARENT_OWNED — si hay parentId, debe existir y ser del mismo owner.
    if (parentId !== undefined) await this.get(owner, parentId);

    const safeName = Array.from(name.split(/[\\/]/).at(-1) ?? "document")
      .filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) !== 127)
      .join("")
      .slice(0, 180);

    const mimeType = mimeFromName(safeName);
    if (!mimeType)
      throw new AppError(
        `Unsupported file type${extensionOf(safeName) ? ` (.${extensionOf(safeName)})` : ""}. Allowed: PDF, images, text, Office docs, zip.`,
        422,
      );

    const category = categoryFromMime(mimeType);

    let pageCount = 0;
    let fields: Artifact["fields"] = [];
    if (category === "pdf") {
      const metadata = await inspectPdf(bytes);
      if (metadata.pageCount > 500) throw new AppError("PDFs must have 500 pages or fewer", 422);
      pageCount = metadata.pageCount;
      fields = metadata.fields;
    }

    const id = randomUUID();
    const artifact: Artifact = {
      id,
      name: safeName,
      mimeType,
      size: bytes.length,
      pageCount,
      fields,
      url: "",
      createdAt: new Date().toISOString(),
      source,
      parentId,
    };

    // FILES_TENANT_STRICT_V2 - directorio por tenant real, sin fallback.
    const tenantSegment = tenantId;
    const directory = join(this.config.dataDir, "tenants", tenantSegment, "files");
    await mkdir(directory, { recursive: true, mode: 0o700 });
    // FILES_ATOMIC_WRITE_V1 - antes escribiamos el fichero con flag "wx"
    // y luego haciamos el put. Si el put fallaba, quedaba un fichero
    // huerfano en disco. Ahora escribimos a .tmp, hacemos el put, y
    // renombramos. Si algo falla entre medio, limpiamos el .tmp.
    const tmpPath = join(directory, `.${id}.tmp`);
    const finalPath = join(directory, `${id}.bin`);
    await writeFile(tmpPath, bytes, { mode: 0o600, flag: "wx" });
    try {
      await this.db.put(owner, "files", artifact);
    } catch (error) {
      await rm(tmpPath, { force: true }).catch(() => {});
      throw error;
    }
    await rename(tmpPath, finalPath);

    // Ingesta automatica en RAG para archivos de texto plano. Los embeddings van con
    // concurrencia acotada (embedTexts) y el numero de chunks tiene tope: antes era un bucle
    // serial, asi que un .txt de 500 KB (~600 chunks) bloqueaba la subida durante minutos.
    if (
      artifact.mimeType.startsWith("text/") ||
      artifact.mimeType === "application/json" ||
      artifact.mimeType === "application/xml"
    ) {
      try {
        const text = new TextDecoder("utf-8").decode(bytes);
        const chunks = chunkText(text).slice(0, RAG_MAX_CHUNKS_PER_SOURCE);
        const vectors = await embedTexts(chunks);
        const createdAt = new Date().toISOString();
        for (let i = 0; i < chunks.length; i += 1) {
          await this.db.put(owner, "rag-chunks", {
            id: `${id}-${i}`,
            sourceId: id,
            sourceName: artifact.name,
            chunkIndex: i,
            text: chunks[i],
            embedding: vectors[i],
            createdAt,
          });
        }
      } catch { /* ingesta opcional, no rompe la subida */ }
    }

    return this.signed(owner, artifact);
  }

  signed(owner: string, file: Artifact): Artifact {
    return { ...file, url: this.auth.sign(owner, `/api/files/${file.id}/content`) };
  }

  async list(owner: string) {
    return (await this.db.list<Artifact>(owner, "files")).map((file) => this.signed(owner, file));
  }

  async get(owner: string, id: string) {
    const file = await this.db.get<Artifact>(owner, "files", id);
    if (!file) throw new AppError("File not found", 404);
    return file;
  }

  /** Reads the stored bytes. Tries .bin first (current format), falls back to .pdf (legacy). */
  async bytes(owner: string, id: string, tenantId: string = "default") {
    await this.get(owner, id);
    // FILES_TENANT_STRICT_V2 - directorio por tenant real. El caller debe
    // pasar el tenantId resuelto; "default" es fallback de migracion.
    const tenantSegment = tenantId;
    const directory = join(this.config.dataDir, "tenants", tenantSegment, "files");
    try {
      return await readFile(join(directory, `${id}.bin`));
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
      return readFile(join(directory, `${id}.pdf`));
    }
  }

  async fill(owner: string, id: string, values: Record<string, string | boolean>) {
    const file = await this.get(owner, id);
    if (file.mimeType !== "application/pdf")
      throw new AppError("Only PDF forms can be filled", 422);
    const bytes = await this.bytes(owner, id);
    const output = await fillPdf(bytes, values);
    return this.import(
      owner,
      `${file.name.replace(/\.pdf$/i, "")} — filled.pdf`,
      output,
      `Filled from ${file.name}`,
      "default",
      id,
    );
  }
}
```
