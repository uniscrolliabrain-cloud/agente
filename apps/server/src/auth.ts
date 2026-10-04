import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";

const digest = (value: string) => createHash("sha256").update(value).digest();

export class Auth {
  constructor(
    private readonly db: Store,
    private readonly config: Config,
    private readonly signingKey: string,
  ) {}

  validateAccessKey(accessKey?: string): void {
    if (
      this.config.mode === "live" &&
      (!accessKey ||
        !this.config.accessKey ||
        !timingSafeEqual(digest(accessKey), digest(this.config.accessKey)))
    )
      throw new AppError("Access key is incorrect", 401);
  }

  async session(accessKey?: string, ownerId: string = "local-user") {
    this.validateAccessKey(accessKey);
    const token = randomBytes(32).toString("base64url");
    await this.db.put("system", "sessions", {
      id: digest(token).toString("hex"),
      owner: ownerId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    return { token, mode: this.config.mode, ownerId };
  }

  async owner(authorization?: string) {
    if (!authorization?.startsWith("Bearer ")) throw new AppError("Sign in to OpenMuse", 401);
    const session = await this.db.get<{ owner: string; expiresAt: number }>(
      "system",
      "sessions",
      digest(authorization.slice(7)).toString("hex"),
    );
    if (!session || session.expiresAt < Date.now())
      throw new AppError("Session expired. Sign in again.", 401);
    return session.owner;
  }

  sign(owner: string, path: string) {
    const expires = String(Date.now() + 15 * 60 * 1000);
    const signature = createHmac("sha256", this.signingKey)
      .update(`${owner}\n${path}\n${expires}`)
      .digest("hex");
    return `${this.config.publicUrl}${path}?owner=${encodeURIComponent(owner)}&expires=${expires}&signature=${signature}`;
  }

  verify(url: URL) {
    const owner = url.searchParams.get("owner") ?? "";
    const expires = url.searchParams.get("expires") ?? "";
    const signature = url.searchParams.get("signature") ?? "";
    if (
      !owner ||
      !/^\d+$/.test(expires) ||
      Number(expires) < Date.now() ||
      !/^\w{64}$/.test(signature)
    )
      throw new AppError("Document link expired; refresh the workspace", 401);
    const expected = createHmac("sha256", this.signingKey)
      .update(`${owner}\n${url.pathname}\n${expires}`)
      .digest("hex");
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature)))
      throw new AppError("Invalid access link", 403);
    return owner;
  }
}

export async function createAuth(db: Store, config: Config) {
  await mkdir(config.dataDir, { recursive: true, mode: 0o700 });
  const path = join(config.dataDir, "session-signing-key");
  let key: string;
  try {
    key = await readFile(path, "utf8");
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    key = randomBytes(32).toString("base64");
    await writeFile(path, key, { mode: 0o600, flag: "wx" });
  }
  // AUTH_KEY_ROTATION_V1 - si hay TOKEN_ENCRYPTION_KEY, guardamos y leemos la
  // clave de firma cifrada con AES-256-GCM. Si no, comportamiento previo
  // (texto plano en disco con permisos 0600).
  const encKey = process.env.TOKEN_ENCRYPTION_KEY?.trim();
  if (encKey) {
    const encPath = `${path}.enc`;
    try {
      const raw = await readFile(encPath, "utf8");
      // AUTH_VAULT_PATH_V1 - ruta corregida a 3 niveles.
      const { decryptSecret } = await import("../../../packages/integrations/src/vault.ts");
      key = decryptSecret(raw.trim(), encKey);
    } catch {
      const { encryptSecret } = await import("../../../packages/integrations/src/vault.ts");
      await writeFile(encPath, encryptSecret(key, encKey), { mode: 0o600, flag: "w" });
    }
  }
  return new Auth(db, config, key);
}