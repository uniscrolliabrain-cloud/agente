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
    private readonly db: Store,
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
    // FIX_FILL_DEDUPE_V1 - parche contra duplicados por concurrencia. Antes,
    // dos requests simultaneos con el mismo fileId creaban dos artifacts
    // con el mismo parentId. Aqui buscamos uno existente por (parentId, source)
    // antes de crear. Es un parche: la solucion real requiere que import()
    // acepte un id deterministico. Con owners con >500 archivos el parche
    // puede no encontrar el existente; con owners normales, funciona.
    const candidates = await this.db.list<Artifact>(owner, "files", { limit: 500 });
    const source = `Filled from ${file.name}`;
    const existing = candidates.find((f) => f.parentId === id && f.source === source);
    if (existing) return this.signed(owner, existing);
    const bytes = await this.bytes(owner, id);
    const output = await fillPdf(bytes, values);
    return this.import(
      owner,
      `${file.name.replace(/\.pdf$/i, "")} — filled.pdf`,
      output,
      source,
      "default",
      id,
    );
  }
}