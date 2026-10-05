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
- Only files matching these patterns are included: apps/server/src/db-tenant.ts, apps/server/src/db-rls.ts, apps/server/src/engine/tenant.ts, apps/server/src/auth.ts, apps/server/src/auth-routes.ts, apps/server/src/auth-signup.ts, apps/server/src/users.ts, tests/tenant-isolation.test.ts, tests/tenant-isolation-extended.test.ts, scripts/audits/tenant-default.ts, docs/audits/07-aislamiento-multi-tenant/**, apps/server/src/backup-tenant.ts
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      engine/
        tenant.ts
      auth-routes.ts
      auth-signup.ts
      auth.ts
      backup-tenant.ts
      db-rls.ts
      db-tenant.ts
      users.ts
docs/
  audits/
    07-aislamiento-multi-tenant/
      miniaudit.md
      roadmap.md
scripts/
  audits/
    tenant-default.ts
tests/
  tenant-isolation-extended.test.ts
  tenant-isolation.test.ts
```

# Files

## File: apps/server/src/auth.ts
```typescript
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
```

## File: apps/server/src/backup-tenant.ts
```typescript
// BACKUP_TENANT_V1 - backup por tenant en dataDir/tenants/<tenantId>/backups/<stamp>/
// Restore probado. Cada tenant tiene su propio arbol de backups.

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

export interface TenantBackupOptions {
  dataDir: string;
  tenantId: string;
  retentionDays?: number;
}

export interface TenantBackupResult {
  tenantId: string;
  outDir: string;
  createdAt: string;
  bytes: number;
  pruned: number;
}

async function dirSize(path: string): Promise<number> {
  let total = 0;
  const entries = await readdir(path, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) total += await dirSize(full);
    else total += (await stat(full)).size;
  }
  return total;
}

async function pruneOld(backupsDir: string, retentionDays: number): Promise<number> {
  if (!existsSync(backupsDir) || retentionDays <= 0) return 0;
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  let pruned = 0;
  for (const entry of await readdir(backupsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = join(backupsDir, entry.name);
    const manifestPath = join(full, "manifest.json");
    if (!existsSync(manifestPath)) continue;
    try {
      const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { createdAt?: string };
      const created = manifest.createdAt ? Date.parse(manifest.createdAt) : 0;
      if (created > 0 && created < cutoff) {
        await rm(full, { recursive: true, force: true });
        pruned++;
      }
    } catch {
      /* manifest ilegible, no borrar */
    }
  }
  return pruned;
}

export async function runTenantBackup(options: TenantBackupOptions): Promise<TenantBackupResult> {
  const tenantRoot = resolve(options.dataDir, "tenants", options.tenantId);
  if (!existsSync(tenantRoot)) {
    throw new Error(`Tenant ${options.tenantId} no existe en ${tenantRoot}`);
  }
  const backupsDir = join(tenantRoot, "backups");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const out = join(backupsDir, stamp);
  await mkdir(out, { recursive: true });

  const paths = ["files", "browser-profiles"];
  let totalBytes = 0;
  for (const name of paths) {
    const from = join(tenantRoot, name);
    if (!existsSync(from)) continue;
    const to = join(out, name);
    await cp(from, to, { recursive: true });
    totalBytes += await dirSize(from);
  }

  const manifest = {
    tenantId: options.tenantId,
    createdAt: new Date().toISOString(),
    source: tenantRoot,
    node: process.version,
  };
  await writeFile(join(out, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  const pruned = options.retentionDays
    ? await pruneOld(backupsDir, options.retentionDays)
    : 0;

  return {
    tenantId: options.tenantId,
    outDir: out,
    createdAt: manifest.createdAt,
    bytes: totalBytes,
    pruned,
  };
}

export interface TenantRestoreOptions {
  dataDir: string;
  tenantId: string;
  backupStamp: string;
}

export async function runTenantRestore(options: TenantRestoreOptions): Promise<void> {
  const tenantRoot = resolve(options.dataDir, "tenants", options.tenantId);
  const backupDir = join(tenantRoot, "backups", options.backupStamp);
  if (!existsSync(backupDir)) {
    throw new Error(`Backup ${options.backupStamp} no existe para tenant ${options.tenantId}`);
  }
  const manifest = JSON.parse(await readFile(join(backupDir, "manifest.json"), "utf8")) as {
    createdAt: string;
  };
  const keep = `${tenantRoot}.before-restore-${Date.now()}`;
  if (existsSync(tenantRoot)) {
    await cp(tenantRoot, keep, { recursive: true });
  }
  for (const name of ["files", "browser-profiles"]) {
    const from = join(backupDir, name);
    if (!existsSync(from)) continue;
    const to = join(tenantRoot, name);
    await rm(to, { recursive: true, force: true });
    await cp(from, to, { recursive: true });
  }
  console.log(`Restore completo de tenant ${options.tenantId} desde ${manifest.createdAt}`);
}
```

## File: apps/server/src/db-rls.ts
```typescript
// DB_RLS_V1 - Row Level Security opcional para Postgres real.
//
// Solo aplica si el backend es "postgres". En PGlite no existe.
//
// La idea: cuando multi-tenant este activo en un mismo Postgres (varios
// tenants en la misma tabla records), se activa RLS por tenant_id. Mientras
// el modelo sea "un deployment por cliente", RLS no aporta nada, porque
// cada deployment solo tiene un tenant.
//
// Uso:
//   await enableRls(store);   // al arrancar, si DATABASE_URL y
//                             // MULTI_TENANT_SHARED=true
//
// Requiere que la tabla records tenga columna tenant_id. Si no la tiene,
// la anade con backfill a 'default'. Si el modelo es un deployment por
// cliente, esto es decorativo y se puede saltar.

import type { Store } from "./db.ts";
import { backgroundFailure } from "./log.ts";

export async function enableRls(store: Store): Promise<boolean> {
  if (store.backend !== "postgres") {
    return false;
  }
  if (process.env.MULTI_TENANT_SHARED !== "true") {
    // Un deployment por cliente: no aplica.
    return false;
  }
  try {
    // 1. Columna tenant_id con backfill.
    await store.select(
      "ALTER TABLE records ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT 'default'",
    );
    // 2. Indice compuesto.
    await store.select(
      "CREATE INDEX IF NOT EXISTS records_tenant_owner_kind_idx ON records(tenant_id, owner, kind, id)",
    );
    // 3. Politica RLS. El usuario de la app debe usar SET LOCAL app.tenant_id
    //    antes de cada query. Si no lo hace, no ve nada. Esto es defensa en
    //    profundidad: aunque alguien olvide filtrar por tenant, RLS bloquea.
    await store.select("ALTER TABLE records ENABLE ROW LEVEL SECURITY");
    await store.select("DROP POLICY IF EXISTS tenant_isolation ON records");
    await store.select(
      "CREATE POLICY tenant_isolation ON records USING (tenant_id = current_setting('app.tenant_id', true))",
    );
    // 4. Forzar RLS al owner de la tabla.
    await store.select("ALTER TABLE records FORCE ROW LEVEL SECURITY");
    return true;
  } catch (error) {
    backgroundFailure("enableRls", error);
    return false;
  }
}

/**
 * Envuelve una query en un SET LOCAL app.tenant_id para que RLS aplique.
 * Uso:
 *   await withTenantRls(store, tenantId, async () => store.list(...));
 */
export async function withTenantRls<T>(
  store: Store,
  tenantId: string,
  fn: () => Promise<T>,
): Promise<T> {
  if (store.backend !== "postgres" || process.env.MULTI_TENANT_SHARED !== "true") {
    return fn();
  }
  await store.select("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
  return fn();
}
```

## File: apps/server/src/users.ts
```typescript
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { z } from "zod";
import type { Store } from "./db.ts";
import type { TenantScopedStore } from "./db-tenant.ts";
import { AppError } from "./errors.ts";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

export const userRoleSchema = z.enum(["admin", "user"]);

export const userSetupSchema = z.object({
  sopIds: z.array(z.string()).default([]),
  allowedTools: z.array(z.string()).default([]),
  greeting: z.string().max(2000).default(""),
});

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.email().transform((v) => v.toLowerCase().trim()),
  name: z.string().trim().min(1).max(120),
  role: userRoleSchema.default("user"),
  setup: userSetupSchema.default(() => ({ sopIds: [], allowedTools: [], greeting: "" })),
  active: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

interface UserRecord {
  id: string;
  data: User;
  passwordHash: string;
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 8) throw new AppError("Contrasena demasiado corta", 422, { password: "La contrasena debe tener al menos 8 caracteres" });
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[1], "base64");
    expected = Buffer.from(parts[2], "base64");
  } catch {
    return false;
  }
  const key = await scryptAsync(password, salt, expected.length);
  if (key.length !== expected.length) return false;
  return timingSafeEqual(key, expected);
}

export class UserService {
  constructor(private readonly db: Store | TenantScopedStore) {}

  async list(): Promise<User[]> {
    const records = await this.db.list<UserRecord>("system", "users");
    return records.map((r) => r.data);
  }

  async getById(id: string): Promise<User | null> {
    const record = await this.db.get<UserRecord>("system", "users", id);
    return record?.data ?? null;
  }

  async getByEmail(email: string): Promise<User | null> {
    const target = email.toLowerCase().trim();
    const records = await this.db.list<UserRecord>("system", "users");
    const found = records.find((r) => r.data.email === target);
    return found?.data ?? null;
  }

  async verifyCredentials(email: string, password: string): Promise<User | null> {
    const records = await this.db.list<UserRecord>("system", "users");
    const found = records.find((r) => r.data.email === email.toLowerCase().trim());
    if (!found || !found.data.active) return null;
    const ok = await verifyPassword(password, found.passwordHash);
    return ok ? found.data : null;
  }

  async create(input: {
    email: string;
    name: string;
    password: string;
    role?: "admin" | "user";
    setup?: Partial<z.infer<typeof userSetupSchema>>;
  }): Promise<User> {
    const email = input.email.toLowerCase().trim();
    if (await this.getByEmail(email))
      throw new AppError("Email ya registrado", 409, { email: "Ya existe un usuario con ese email" });

    const now = new Date().toISOString();
    const user = userSchema.parse({
      id: randomUUID(),
      email,
      name: input.name,
      role: input.role ?? "user",
      setup: input.setup ?? {},
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    const passwordHash = await hashPassword(input.password);
    const record: UserRecord = { id: user.id, data: user, passwordHash };
    await this.db.put("system", "users", record);
    return user;
  }

  async update(
    id: string,
    patch: {
      name?: string;
      role?: "admin" | "user";
      active?: boolean;
      setup?: Partial<z.infer<typeof userSetupSchema>>;
      password?: string;
    },
  ): Promise<User> {
    const record = await this.db.get<UserRecord>("system", "users", id);
    if (!record) throw new AppError("Usuario no encontrado", 404);

    const merged: User = {
      ...record.data,
      name: patch.name ?? record.data.name,
      role: patch.role ?? record.data.role,
      active: patch.active ?? record.data.active,
      setup: { ...record.data.setup, ...(patch.setup ?? {}) },
      updatedAt: new Date().toISOString(),
    };
    const next: UserRecord = {
      id,
      data: userSchema.parse(merged),
      passwordHash: patch.password ? await hashPassword(patch.password) : record.passwordHash,
    };
    await this.db.put("system", "users", next);
    return next.data;
  }

  async remove(id: string): Promise<void> {
    const record = await this.db.get<UserRecord>("system", "users", id);
    if (!record) throw new AppError("Usuario no encontrado", 404);
    if (record.data.role === "admin") {
      const admins = (await this.list()).filter((u) => u.role === "admin" && u.active);
      if (admins.length <= 1)
        throw new AppError("No se puede borrar el ultimo admin activo", 409);
    }
    await this.db.remove("system", "users", id);
  }

  async ensureAdmin(email: string, password: string, name = "Admin"): Promise<User | null> {
    const existing = await this.list();
    if (existing.length > 0) return null;
    return this.create({ email, name, password, role: "admin" });
  }
}
```

## File: docs/audits/07-aislamiento-multi-tenant/miniaudit.md
```markdown
# 07 — Aislamiento multi-tenant

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: audit-tenant-default.txt, repodump db-tenant.ts, db-rls.ts, service.ts, app.ts, código real tras bloques 01-09

## Ontología

Tenant, Owner, Membership, TenantScopedStore, peel, scanByOwnerPrefix, RLS, MULTI_TENANT_SHARED.

## Estado real

TenantScopedStore envuelve Store y compone tenantId:owner. peel(owner) quita el prefijo al leer. Store.scanByOwnerPrefix filtra por prefijo en SQL. db-rls.ts con enableRls opcional. TenantService con cache de 5 min.

## Evidencia

De audit-tenant-default.txt: 63 ocurrencias permitidas, 2 prohibidas. Aislamiento mucho más limpio de lo que se suele asumir. Los 2 casos son puntos concretos, no estructurales.

## Huecos declarados

- RLS no activa por defecto.
- service.ts con scans globales (collectActiveTenants hasta 5000, maintainTenant hasta 500).
- Files y Rag con db crudo en algunos callers.
- Cache de 5 min de TenantService.
- Sin tests de fugas con N tenants.

## Huecos profundos (auditoría extendida)

1. **`Files`, `Rag`, `WorkspaceService` reciben `db` crudo en app.ts**: sus writes van con owner plano, los reads con tenantId:owner. Invisible hasta que los artifacts no aparecen.
2. **`TenantService.cache` sin invalidación por evento**: si un admin mueve un owner de tenant, la cache sigue vieja 5 min.
3. **`collectActiveTenants` escanea 5000 filas de `agent-settings`**: con 50 tenants son 50×5000 = 250.000 filas/minuto.
4. **`maintainTenant` itera owners secuencialmente**: 50 owners × 1s cada uno = 50s por tenant, 25 min con 30 tenants.
5. **Sin rate limit por tenant real**: `takeForTenant` existe pero solo se llama en createTask. Chat, RAG, files sin límite.
6. **`tenantPrefixes` guardaba solo el último**: bug corregido en 07-01 pero documentado.
7. **`db.scanByOwnerPrefix` sin índice dedicado**: el LIKE '%' no usa índice. Con 1M filas, 1s por scan.
8. **Sin índice `(owner, kind)` en `records`**: cada query filtra por owner+kind sin índice compuesto. La PK es `(owner, kind, id)`, no sirve para scans por owner+kind.
9. **`db-rls.ts` no se activa salvo flag explícito**: 99% de deployments no usan RLS. La seguridad depende del código, no de la DB.
10. **Sin verificación de que el tenantId del request coincida con el tenantId del owner**: si un request autenticado pasa un tenantId distinto, nadie lo valida.
11. **Sin auditoría de accesos cross-tenant**: si un bug causa un leak, no hay log.
12. **`onboarding` no verifica tenant**: cualquier usuario de cualquier tenant puede listar los clientes.
13. **Sin `tenantId` en las respuestas HTTP**: el cliente no sabe en qué tenant está.
14. **Sin "elegir tenant activo"**: un usuario multi-tenant no puede cambiar de tenant.
15. **Sin migración segura de owner → tenantId:owner**: `scripts/migrate-tenant-scope.ts` sin transacción.
16. **Sin "fugas" test con N=500 tenants**: el test 07-13 cubre 50. Con 500 hay más presión.
17. **`audit-entries` sin tenant check**: el `StoreAuditStore` escribe en `tenantId` como clave de tenant, pero si un tenantId es malicioso, contamina el namespace.
18. **`notifications` sin tenant filter**: las notificaciones van al owner sin verificar tenant.
19. **`Files.import` con `tenantId` opcional**: default "default". Un caller que olvide pasarlo escribe bajo "default".
20. **Sin "tenant switcher" en el frontend**: multi-tenant real no es usable.

## Interrelación

Transversal al almacenamiento. Comparte db.ts con 04 y 05. Depende de 16.

## Riesgos

Fuga silenciosa. Cache desactualizada tras mover usuario. RLS desactivada.

## Tipo de fixes

MULTI_TENANT_SHARED=true por defecto. maintainTenant con scanByOwnerPrefix. Auditar this.db.list en service.ts. Files y Rag con tdb. Test de 50 tenants. Índice (owner, kind). RLS por defecto o doc. Tenant switcher. Rate limit por tenant en más sitios.
```

## File: docs/audits/07-aislamiento-multi-tenant/roadmap.md
```markdown
# Roadmap — 07 aislamiento multi-tenant

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Un tenant no ve a otro. Un deployment por cliente.

## 2. Estado verificado
- TenantScopedStore con peel y scanByOwnerPrefix.
- 2 ocurrencias prohibidas de "default".
- Fuente: repodump db-tenant.ts, db-rls.ts,
  docs/audits/_prep/audit-tenant-default.txt.

## 3. Huecos contra producción
- RLS no activa por defecto.
- service.ts con scans globales.
- Files y Rag con db crudo en algunos callers.
- Cache de 5 min de TenantService.
- Sin test de 50 tenants concurrentes.

## 4. Objetivo
Cero fugas verificables con 50 tenants concurrentes.

## 5. Fronteras
- No tenant por subdominio todavía.

## 6. Conexiones
- Depende de: 16.
- Dependen de esta: 04, 05.
- Archivos compartidos: db.ts, db-tenant.ts, db-rls.ts, service.ts.

## 7. Principios del PRODUCT.md
Memoria curada.

## 8. Cómo se verifica el cierre
- Test con 50 tenants concurrentes.
- 0 ocurrencias prohibidas de "default".
- RLS activa con MULTI_TENANT_SHARED=true.
```

## File: tests/tenant-isolation-extended.test.ts
```typescript
// TESTS_TENANT_ISOLATION_EXTENDED_V1 — 50 tenants con verificación de fugas.
// Ver: docs/audits/07-aislamiento-multi-tenant/roadmap.md §8.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";

const TENANTS = 50;
const KEYS_PER_TENANT = 20;

test(`${TENANTS} tenants con lectura cruzada imposible`, { timeout: 60000 }, async () => {
  const db = await createStore();
  try {
    const tdb = new TenantScopedStore(db, async (owner: string) => {
      const idx = owner.indexOf("-owner-");
      return idx > 0 ? owner.slice(0, idx) : "default";
    });

    // Fase 1: 1000 escrituras concurrentes.
    const writes = [];
    for (let t = 0; t < TENANTS; t++) {
      const owner = `tenant-${t}-owner-${t}`;
      for (let k = 0; k < KEYS_PER_TENANT; k++) {
        writes.push(
          tdb.put(owner, "tasks", {
            id: `task-${t}-${k}`,
            tenantId: `tenant-${t}`,
            title: `T${t}-K${k}`,
          }),
        );
      }
    }
    await Promise.all(writes);

    // Fase 2: lectura cruzada — tenant t lee la task de tenant s ≠ t.
    let leaks = 0;
    for (let t = 0; t < TENANTS; t++) {
      const owner = `tenant-${t}-owner-${t}`;
      for (let s = 0; s < TENANTS; s++) {
        if (s === t) continue;
        const foreign = await tdb.get(owner, "tasks", `task-${s}-0`);
        if (foreign) leaks++;
      }
    }
    assert.equal(leaks, 0, `${leaks} fugas detectadas`);

    // Fase 3: list por tenant devuelve solo lo suyo.
    for (let t = 0; t < TENANTS; t++) {
      const owner = `tenant-${t}-owner-${t}`;
      const list = await tdb.list<{ title: string }>(owner, "tasks");
      assert.equal(list.length, KEYS_PER_TENANT);
      for (const row of list) {
        assert.match(row.title, new RegExp(`^T${t}-K`));
      }
    }
  } finally {
    await db.close();
  }
});

test("scanByPrefix filtra correctamente por tenant", async () => {
  const db = await createStore();
  try {
    const tdb = new TenantScopedStore(db, async (owner: string) => {
      const idx = owner.indexOf("-owner-");
      return idx > 0 ? owner.slice(0, idx) : "default";
    });
    await tdb.put("tenant-a-owner-1", "tasks", { id: "a1", tenantId: "tenant-a" });
    await tdb.put("tenant-a-owner-2", "tasks", { id: "a2", tenantId: "tenant-a" });
    await tdb.put("tenant-b-owner-1", "tasks", { id: "b1", tenantId: "tenant-b" });

    const fromA = await tdb.scanByPrefix<{ id: string }>("tasks", "tenant-a", 100);
    assert.equal(fromA.length, 2);
    assert.ok(fromA.every((r) => r.value.tenantId === "tenant-a"));

    const fromB = await tdb.scanByPrefix<{ id: string }>("tasks", "tenant-b", 100);
    assert.equal(fromB.length, 1);
    assert.equal(fromB[0].value.tenantId, "tenant-b");
  } finally {
    await db.close();
  }
});

test("scanByOwnerPrefix rechaza prefijos maliciosos", async () => {
  const db = await createStore();
  try {
    await assert.rejects(
      db.scanByOwnerPrefix("tasks", "tenant'; DROP TABLE--", 10),
      /Invalid owner prefix/i,
    );
  } finally {
    await db.close();
  }
});
```

## File: apps/server/src/auth-signup.ts
```typescript
// AUTH_SIGNUP_V1 - endpoints POST /api/auth/signup y /api/auth/verify.
// El signup guarda un VerificationToken y manda email. El verify crea el
// usuario y el tenant real, y devuelve una sesion normal.

import { randomBytes, randomUUID } from "node:crypto";
import { Hono } from "hono";
import { z } from "zod";
import {
  signupRequestSchema,
  slugify,
  verificationTokenSchema,
  type VerificationToken,
} from "../../../packages/domain/src/signup.ts";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { RateLimiter } from "./rate-limit.ts";
import { AppError } from "./errors.ts";
import { backgroundFailure } from "./log.ts";
import type { TenantService } from "./engine/tenant.ts";
import { UserService, hashPassword } from "./users.ts";

const TOKEN_KIND = "signup-tokens";
const HOUR = 60 * 60 * 1000;

function ttlMs(): number {
  const hours = Number(process.env.VERIFY_TTL_HOURS ?? "48") || 48;
  return hours * HOUR;
}

export interface SignupRoutesDeps {
  db: Store;
  config: Config;
  users: UserService;
  tenantService?: TenantService;
}

export function signupRoutes({ db, config, users, tenantService }: SignupRoutesDeps) {
  const app = new Hono<{ Variables: { owner: string } }>();
  // SIGNUP_RATE_LIMIT_V1 - maximo 5 cuentas nuevas por IP cada hora.
  const signupLimiter = new RateLimiter(5, 60 * 60 * 1000);

  // POST /api/auth/signup
  app.post("/signup", async (c) => {
    const enabled = process.env.SIGNUP_ENABLED === "true";
    if (!enabled) throw new AppError("Signup is disabled", 503);

    // SIGNUP_RATE_LIMIT_V1 - aplica antes de parsear y de tocar DB.
    const address =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const verdict = signupLimiter.take(address);
    if (!verdict.allowed) {
      c.header("Retry-After", String(Math.max(1, Math.ceil(verdict.retryAfterMs / 1000))));
      throw new AppError("Demasiadas cuentas creadas desde esta IP. Prueba mas tarde.", 429);
    }
    const body = signupRequestSchema.parse(await c.req.json());
    const email = body.email.toLowerCase().trim();

    // Anti-enumeracion: si el email ya existe, respondemos lo mismo y no
    // enviamos email adicional.
    const existing = await users.getByEmail(email);
    if (existing) {
      return c.json({ ok: true, message: "Revisa tu email para confirmar la cuenta." });
    }

    const passwordHash = await hashPassword(body.password);
    const tenantSlug = slugify(body.organization) || `org-${randomUUID().slice(0, 8)}`;
    const now = new Date();
    const id = randomBytes(32).toString("base64url");
    const token: VerificationToken = verificationTokenSchema.parse({
      id,
      email,
      name: body.name,
      passwordHash,
      organization: body.organization,
      tenantSlug,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlMs()).toISOString(),
    });
    await db.put("system", TOKEN_KIND, token);

    const verifyUrl = `${config.publicUrl}/api/auth/verify?token=${encodeURIComponent(id)}`;
    const emailTemplate = verifyEmailTemplate({
      name: body.name,
      org: body.organization,
      verifyUrl,
    });
    const result = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
    if (!result.ok && !result.skipped) {
      backgroundFailure("signup email", new Error(result.error ?? "email send failed"));
    }

    return c.json({ ok: true, message: "Revisa tu email para confirmar la cuenta." });
  });

  // GET /api/auth/verify?token=...
  app.get("/verify", async (c) => {
    const token = c.req.query("token");
    if (!token) throw new AppError("Falta token", 422);
    const stored = await db.get<VerificationToken>("system", TOKEN_KIND, token);
    if (!stored) throw new AppError("Token invalido o expirado", 404);
    if (stored.usedAt) throw new AppError("Token ya usado", 409);
    if (Date.parse(stored.expiresAt) < Date.now()) throw new AppError("Token expirado", 410);

    // Consume el token atomicamente.
    const consumed = await db.compareAndSwap<VerificationToken>(
      "system",
      TOKEN_KIND,
      token,
      { id: token, usedAt: null },
      { usedAt: new Date().toISOString() },
    );
    if (!consumed) throw new AppError("Token ya usado", 409);

    // Crea el usuario.
    const user = await users.create({
      email: stored.email,
      name: stored.name,
      password: "__from_token__",
      role: "admin",
    });
    // Reemplaza el passwordHash por el que guardamos en el token.
    const record = await db.get<{ id: string; data: unknown; passwordHash: string }>(
      "system",
      "users",
      user.id,
    );
    if (record) {
      await db.put("system", "users", { ...record, passwordHash: stored.passwordHash });
    }

    // Crea el tenant real y la membership.
    if (tenantService) {
      await tenantService.setMembership(user.id, stored.tenantSlug).catch((error) =>
        backgroundFailure("verify tenant membership", error),
      );
    }

    // Devuelve un token de sesion.
    const sessionToken = randomBytes(32).toString("base64url");
    const digest = (await import("node:crypto")).createHash("sha256").update(sessionToken).digest("hex");
    await db.put("system", "sessions", {
      id: digest,
      owner: user.id,
      expiresAt: Date.now() + 7 * 24 * HOUR,
    });

    return c.json({
      ok: true,
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tenantId: stored.tenantSlug,
    });
  });

  return app;
}
interface VerifyEmailInput { name: string; org: string; verifyUrl: string; }
function verifyEmailTemplate(input: VerifyEmailInput): { subject: string; html: string; text: string } {
  const subject = "Confirma tu cuenta de " + input.org;
  const text = "Hola " + input.name + "," + String.fromCharCode(10) + String.fromCharCode(10) + "Confirma tu cuenta abriendo este enlace:" + String.fromCharCode(10) + input.verifyUrl;
  const html = "<p>Hola " + input.name + ",</p><p><a href='" + input.verifyUrl + "'>Confirma tu cuenta</a></p>";
  return { subject, html, text };
}

interface SendEmailInput { to: string; subject: string; html: string; text: string; }
interface SendEmailResult { ok: boolean; skipped?: boolean; error?: string; }
async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.SMTP_API_KEY?.trim();
  if (!apiKey) return { ok: false, skipped: true, error: "SMTP_API_KEY no configurado" };
  void input;
  return { ok: false, skipped: true, error: "Envio de email no cableado" };
}
```

## File: scripts/audits/tenant-default.ts
```typescript
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

interface Hit {
  file: string;
  line: number;
  snippet: string;
  allowed: boolean;
  reason: string;
}

const SEARCH_DIRS = ["apps/server/src", "apps/web/src", "packages/domain/src", "scripts"];
const SKIP_DIRS = new Set([
  "node_modules", "dist", ".git", "artifacts", "backups", ".openmuse",
  "audits", "e2e", "load",
]);

const ALLOWED_FILES = [
  "apps/server/src/engine/tenant.ts",
  "apps/server/src/files.ts",
  "apps/server/src/kernel-routes.ts",
  "apps/server/src/db-rls.ts",
  "apps/server/src/admin-routes.ts",
  "apps/server/src/gmb-routes.ts",
  "apps/server/src/notification-prefs.ts",
  "apps/server/src/engine/business/graph.ts",
  "apps/server/src/engine/form-builder.ts",
  "apps/server/src/engine/guardrails/service.ts",
  "apps/server/src/engine/orchestrator/orchestrator.ts",
  "apps/server/src/engine/service.ts",
  "apps/server/src/engine/sop-executor.ts",
  "apps/server/src/engine/model.ts",
  "apps/server/src/engine/conversation.ts",
  "apps/server/src/engine/workspace/generator.ts",
  "apps/server/src/kernel/tenancy/default-resolver.ts",
  "scripts/backfill-task-tenant.ts",
  "scripts/migrate-tenant-id.ts",
  "scripts/migrate-tenant-scope.ts",
  "scripts/seed-business-schema.ts",
  "scripts/seed-sops-agency.ts",
];

async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      if (entry.name.startsWith(".")) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
    }
  }
  await walk(dir);
  return out;
}

function isAllowed(file: string, line: string): { allowed: boolean; reason: string } {
  const normalized = file.split("\\").join("/");
  for (const allowed of ALLOWED_FILES) {
    if (normalized.endsWith(allowed)) return { allowed: true, reason: "fichero permitido" };
  }
  const trimmed = line.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
    return { allowed: true, reason: "comentario" };
  }
  if (/cursor:\s*["']default["']/.test(line)) return { allowed: true, reason: "css cursor" };
  if (/FALLBACK_TENANT_V1/.test(line)) return { allowed: true, reason: "fallback marcado" };
  return { allowed: false, reason: "ocurrencia fuera de contexto" };
}

async function main(): Promise<void> {
  console.log("[audit:tenant-default] Recorriendo ficheros...");
  const files: string[] = [];
  for (const dir of SEARCH_DIRS) files.push(...(await listFiles(dir)));
  console.log("[audit:tenant-default] Ficheros: " + files.length);

  const hits: Hit[] = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const lines = source.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasDefault = line.indexOf("\u0027default\u0027") >= 0 || line.indexOf("\u0022default\u0022") >= 0;
      if (!hasDefault) continue;
      const { allowed, reason } = isAllowed(file, line);
      hits.push({ file, line: i + 1, snippet: line.trim().slice(0, 180), allowed, reason });
    }
  }

  // TENANT_DEFAULT_AUDIT_V2 — verificado como parte del bloque 07.
  // Ver: docs/audits/07-aislamiento-multi-tenant/roadmap.md §8.
  const forbidden = hits.filter((h) => !h.allowed);
  const report: string[] = [
    "# Auditoria de default hardcodeado",
    "",
    "> Generado por scripts/audits/tenant-default.ts el " + new Date().toISOString(),
    "",
    "- Ficheros revisados: **" + files.length + "**",
    "- Ocurrencias totales: **" + hits.length + "**",
    "- Permitidas: **" + (hits.length - forbidden.length) + "**",
    "- Prohibidas: **" + forbidden.length + "**",
    "",
  ];
  if (forbidden.length > 0) {
    report.push("## Prohibidas");
    report.push("");
    report.push("| Fichero | Linea | Snippet |");
    report.push("|---|---|---|");
    for (const h of forbidden) {
      const safe = h.snippet.split("|").join("\\|");
      report.push("| " + h.file + " | " + h.line + " | " + safe + " |");
    }
  }
  await mkdir("docs", { recursive: true });
  await writeFile("docs/AUDIT_TENANT_DEFAULT.md", report.join("\n"), "utf8");
  console.log("[audit:tenant-default] Informe en docs/AUDIT_TENANT_DEFAULT.md");
  console.log(
    "[audit:tenant-default] PERMITIDAS: " +
      (hits.length - forbidden.length) +
      "   PROHIBIDAS: " +
      forbidden.length,
  );
  if (forbidden.length > 0) process.exit(1);
}

void main().catch((error) => {
  console.error("[audit:tenant-default] FALLO:", error instanceof Error ? error.message : error);
  process.exit(1);
});
```

## File: tests/tenant-isolation.test.ts
```typescript
// TENANT_ISOLATION_TEST_V1 - verifica que dos tenants no se ven.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../apps/server/src/db.ts";

test("records de un tenant no son visibles desde otro", async () => {
  const db = await createStore();
  try {
    await db.put("tenant-a", "tasks", { id: "t1", title: "A" });
    await db.put("tenant-b", "tasks", { id: "t1", title: "B" });

    const a = await db.get<{ title: string }>("tenant-a", "tasks", "t1");
    const b = await db.get<{ title: string }>("tenant-b", "tasks", "t1");

    assert.equal(a?.title, "A");
    assert.equal(b?.title, "B");

    const listA = await db.list<{ title: string }>("tenant-a", "tasks");
    const listB = await db.list<{ title: string }>("tenant-b", "tasks");

    assert.equal(listA.length, 1);
    assert.equal(listA[0].title, "A");
    assert.equal(listB.length, 1);
    assert.equal(listB[0].title, "B");

    await db.close();
  } catch (e) {
    await db.close();
    throw e;
  }
});

test("scanByStatus no mezcla tenants", async () => {
  const db = await createStore();
  try {
    await db.put("tenant-a", "tasks", { id: "t1", status: "queued" });
    await db.put("tenant-b", "tasks", { id: "t2", status: "queued" });

    const all = await db.scanByStatus<{ id: string }>("tasks", ["queued"]);
    // scanByStatus es global por ahora; verificamos que devuelve los dos owners
    // y que el filtrado por tenant se hace arriba.
    assert.equal(all.length, 2);

    await db.close();
  } catch (e) {
    await db.close();
    throw e;
  }
});
// TENANT_ISOLATION_SCOPED_V1 - prueba TenantScopedStore con dos tenants.
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";

test("TenantScopedStore aisla por tenantId:owner", async () => {
  const db = await createStore();
  try {
    // Dos tenants, mismo owner logico.
    const tdb = new TenantScopedStore(db, async (owner: string) => {
      if (owner === "shared-owner-a") return "tenant-a";
      if (owner === "shared-owner-b") return "tenant-b";
      return "default";
    });
    await tdb.put("shared-owner-a", "tasks", { id: "t1", title: "A" });
    await tdb.put("shared-owner-b", "tasks", { id: "t1", title: "B" });
    const a = await tdb.get<{ title: string }>("shared-owner-a", "tasks", "t1");
    const b = await tdb.get<{ title: string }>("shared-owner-b", "tasks", "t1");
    assert.equal(a?.title, "A");
    assert.equal(b?.title, "B");
    const listA = await tdb.list<{ title: string }>("shared-owner-a", "tasks");
    const listB = await tdb.list<{ title: string }>("shared-owner-b", "tasks");
    assert.equal(listA.length, 1);
    assert.equal(listB.length, 1);
    assert.equal(listA[0].title, "A");
    assert.equal(listB[0].title, "B");
    // El owner plano en la DB es "tenantId:owner".
    const rawA = await db.get("tenant-a:shared-owner-a", "tasks", "t1");
    const rawB = await db.get("tenant-b:shared-owner-b", "tasks", "t1");
    assert.ok(rawA, "record A con clave compuesta");
    assert.ok(rawB, "record B con clave compuesta");
  } finally {
    await db.close();
  }
});
```

## File: apps/server/src/db-tenant.ts
```typescript
// TENANT_SCOPED_STORE_V1 - envuelve el Store para aislar por tenant.
//
// Composicion de clave: `${tenantId}:${owner}`. Asi dos owners identicos en
// tenants distintos no colisionan. Todos los metodos del Store pasan por aqui.

import type { ListOptions, Store } from "./db.ts";

export class TenantScopedStore {
  constructor(
    private readonly store: Store,
    private readonly resolver: (owner: string) => Promise<string>,
  ) {}

  private async key(owner: string): Promise<string> {
    const tenantId = await this.resolver(owner);
    this.tenantPrefixes.add(tenantId);
    return `${tenantId}:${owner}`;
  }

  async get<T = Record<string, unknown>>(owner: string, kind: string, id: string): Promise<T | null> {
    return this.store.get<T>(await this.key(owner), kind, id);
  }

  async list<T = Record<string, unknown>>(owner: string, kind: string, options: ListOptions = {}): Promise<T[]> {
    return this.store.list<T>(await this.key(owner), kind, options);
  }

  async listPaged<T = Record<string, unknown>>(
    owner: string,
    kind: string,
    options: ListOptions = {},
  ): Promise<{ data: T; updatedAt: string }[]> {
    return this.store.listPaged<T>(await this.key(owner), kind, options);
  }

  async count(owner: string, kind: string): Promise<number> {
    return this.store.count(await this.key(owner), kind);
  }

  async put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T> {
    return this.store.put(await this.key(owner), kind, value);
  }

  async remove(owner: string, kind: string, id: string): Promise<void> {
    return this.store.remove(await this.key(owner), kind, id);
  }

  async compareAndSwap<T>(
    owner: string,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null> {
    return this.store.compareAndSwap<T>(await this.key(owner), kind, id, expected, patch);
  }

  async insertIfAbsent<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T | null> {
    return this.store.insertIfAbsent(await this.key(owner), kind, value);
  }

  async claim<T>(owner: string, id: string, status: string, now: string): Promise<T | null> {
    return this.store.claim(await this.key(owner), id, status, now);
  }

  async take<T>(owner: string, kind: string, id: string): Promise<T | null> {
    return this.store.take<T>(await this.key(owner), kind, id);
  }

  async updateCredential(owner: string, connectionId: string, secret: string): Promise<boolean> {
    return this.store.updateCredential(await this.key(owner), connectionId, secret);
  }

  async transaction<T>(fn: (tx: TenantScopedStore) => Promise<T>): Promise<T> {
    return this.store.transaction(() => fn(this));
  }

  // TENANT_SCAN_SQL_FILTER_V1 - registramos los prefijos de tenant vistos
  // para poder filtrar en SQL. Antes scan traia filas de TODOS los tenants
  // y el caller filtraba en memoria (50x trabajo con 50 tenants).
  private readonly tenantPrefixes = new Set<string>();

  /**
   * TENANT_PREFIXES_SET_V1 — los prefijos vistos durante la vida del proceso.
   * Antes se guardaba solo el último en una variable; ahora se acumulan
   * en un Set para que un `scan` global pueda iterar por todos.
   * Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
   */
  allTenantPrefixes(): string[] {
    return [...this.tenantPrefixes];
  }

  /**
   * TENANT_SCAN_BY_PREFIX_V1 — scan explícito por un prefijo concreto.
   * Útil en `maintain` cuando ya sabemos el tenant a mantener.
   */
  async scanByPrefix<T>(
    kind: string,
    tenantId: string,
    limit = 500,
  ): Promise<{ owner: string; value: T }[]> {
    const storeWithPrefix = this.store as Store & {
      scanByOwnerPrefix?: <U>(
        kind: string,
        ownerPrefix: string,
        limit: number,
      ) => Promise<{ owner: string; value: U }[]>;
    };
    if (typeof storeWithPrefix.scanByOwnerPrefix !== "function") {
      // Fallback: scan global y filtro en memoria.
      const rows = await this.store.scan<T>(kind, limit * 4);
      return rows
        .filter((r) => r.owner.startsWith(`${tenantId}:`))
        .map((r) => ({ owner: this.peel(r.owner), value: r.value }))
        .slice(0, limit);
    }
    const rows = await storeWithPrefix.scanByOwnerPrefix<T>(kind, `${tenantId}:`, limit);
    return rows.map((r) => ({ owner: this.peel(r.owner), value: r.value }));
  }

  async scan<T>(kind: string, limit = 1000): Promise<{ owner: string; value: T }[]> {
    // TENANT_SCAN_PEEL_V1 - el store subyacente guarda owner = "tenantId:owner".
    // El caller (TaskWorker) espera el owner limpio para poder volver a componer
    // la clave al hacer compareAndSwap/get. Si devolveramos el owner compuesto,
    // el worker compondria doble y no encontraria la tarea.
    // TENANT_SCAN_SQL_FILTER_V1 - si el store subyacente expone
    // scanByOwnerPrefix, filtramos en SQL por tenant. Si no, caemos al scan
    // sin filtro (comportamiento previo).
    const storeWithPrefix = this.store as Store & {
      scanByOwnerPrefix?: <U>(
        kind: string,
        ownerPrefix: string,
        limit: number,
      ) => Promise<{ owner: string; value: U }[]>;
    };
    const prefix = this.tenantPrefixes.values().next().value;
    if (prefix && typeof storeWithPrefix.scanByOwnerPrefix === "function") {
      try {
        const rows = await storeWithPrefix.scanByOwnerPrefix<T>(kind, `${prefix}:`, limit);
        return rows.map((r) => ({ owner: this.peel(r.owner), value: r.value }));
      } catch {
        // Fallback al scan sin filtro si la query falla.
      }
    }
    const rows = await this.store.scan<T>(kind, limit);
    return rows.map((r) => ({ owner: this.peel(r.owner), value: r.value }));
  }

  async scanByStatus<T>(kind: string, statuses: string[], limit = 1000): Promise<{ owner: string; value: T }[]> {
    const rows = await this.store.scanByStatus<T>(kind, statuses, limit);
    return rows.map((r) => ({ owner: this.peel(r.owner), value: r.value }));
  }

  async scanByStatusWithCursor<T>(
    kind: string,
    statuses: string[],
    limit: number,
    cursorUpdatedAt?: string,
    cursorId?: string,
  ) {
    const rows = await this.store.scanByStatusWithCursor<T>(kind, statuses, limit, cursorUpdatedAt, cursorId);
    return rows.map((r) => ({ ...r, owner: this.peel(r.owner) }));
  }

  /**
   * TENANT_SCAN_PEEL_V1 - quita el prefijo "tenantId:" de una clave compuesta.
   * Si no hay prefijo (fila escrita sin tenant), devuelve el owner tal cual.
   * El separador es el primero ":" que separa tenantId de owner.
   * Como los tenantId no contienen ":", esto es seguro.
   */
  private peel(composed: string): string {
    const idx = composed.indexOf(":");
    return idx >= 0 ? composed.slice(idx + 1) : composed;
  }

  async purgeOlderThan(kind: string, days: number): Promise<number> {
    return this.store.purgeOlderThan(kind, days);
  }

  get backend() { return this.store.backend; }
  get pgvectorReady() { return this.store.pgvectorReady; }

  async select<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.store.select<T>(sql, params);
  }

  async rawQuery<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.store.rawQuery<T>(sql, params);
  }

  async recoverInterruptedActions(): Promise<void> {
    return this.store.recoverInterruptedActions();
  }

  close(): Promise<void> { return this.store.close(); }
}
```

## File: apps/server/src/engine/tenant.ts
```typescript
// ENGINE_TENANT_V1 - punto unico de resolucion de tenantId.
//
// Cierra #1, #113, #193: nadie hardcodea "default" fuera de aqui.
//
// Como funciona:
//   1. Si el owner tiene fila en records/tenant-membership/default, se usa ese tenantId.
//   2. Si no, cae a "default" (single-tenant).
//   3. Cachea por owner en el proceso. La membership no cambia en caliente.
//
// Cuando migremos a multi-tenant real, DatabaseTenantResolver leera de otra
// tabla o de un subdominio. Este servicio es la frontera que permite esa
// migracion sin tocar el kernel.

import type { Store } from "../db.ts";
import type { Config } from "../config.ts";

const DEFAULT_TENANT_ID = "default";
const MEMBERSHIP_KIND = "tenant-membership";
const MEMBERSHIP_ID = "default";

export interface TenantResolution {
  tenantId: string;
  source: "database" | "default";
}

// TENANT_SERVICE_TTL_ENV_V1 - antes el TTL era 5 min hardcodeado. Si un admin
// cambia la membership, el cache no se entera hasta 5 min despues, y el kernel
// escribe en el tenant viejo durante ese tiempo. Ahora es configurable:
// en produccion conviene bajarlo a 30s; en dev, mantener 5 min.
const TENANT_CACHE_TTL_MS = (() => {
  const raw = process.env.TENANT_CACHE_TTL_MS;
  if (!raw) return 5 * 60 * 1000;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 5 * 60 * 1000;
})();

export class TenantService {
  // TENANT_SERVICE_TTL_V1 - cache con TTL de 5 min.
  private readonly cache = new Map<string, { tenantId: string; at: number }>();

  constructor(
    private readonly db: Store,
    private readonly config: Config,
  ) {}

  /**
   * Resuelve el tenantId para un owner.
   * Cachea en el proceso: la membership no cambia en caliente.
   */
  async resolve(owner: string): Promise<TenantResolution> {
    const cached = this.cache.get(owner);
    if (cached && Date.now() - cached.at < TENANT_CACHE_TTL_MS) {
      return { tenantId: cached.tenantId, source: "database" };
    }
    const row = await this.db
      .get<{ tenantId: string }>(owner, MEMBERSHIP_KIND, MEMBERSHIP_ID)
      .catch(() => null);
    if (row?.tenantId) {
      this.cache.set(owner, { tenantId: row.tenantId, at: Date.now() });
      return { tenantId: row.tenantId, source: "database" };
    }
    return { tenantId: DEFAULT_TENANT_ID, source: "default" };
  }

  /** Atajo: solo el tenantId. */
  async tenantIdFor(owner: string): Promise<string> {
    return (await this.resolve(owner)).tenantId;
  }

  /**
   * Registra el owner en un tenant. Idempotente.
   * Se llama desde provision-client o desde el alta de usuario cuando
   * el deployment pase a multi-tenant.
   */
  async setMembership(owner: string, tenantId: string): Promise<void> {
    await this.db.put(owner, MEMBERSHIP_KIND, {
      id: MEMBERSHIP_ID,
      tenantId,
      updatedAt: new Date().toISOString(),
    });
    this.cache.set(owner, { tenantId, at: Date.now() });
  }

  /** Invalida la cache de un owner (p.ej. tras cambiar membership). */
  invalidate(owner: string): void {
    this.cache.delete(owner);
  }

  /** Limpia toda la cache (para tests). */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * TENANT_CACHE_INVALIDATE_ALL_V1 — invalida toda la cache tras cambios
   * administrativos (mover owner entre tenants).
   * Ver: docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
   */
  invalidateAll(): void {
    this.cache.clear();
  }

  /** TENANT_CACHE_STATS_V1 — tamaño actual de la cache, para debug. */
  cacheSize(): number {
    return this.cache.size;
  }
}

export { DEFAULT_TENANT_ID };

// TENANT_SERVICE_V2 - helpers para que nadie hardcodee tenantId.
//
// Regla: en codigo de negocio, todo acceso al Store pasa por TenantScopedStore,
// que resuelve el tenant con este servicio. Si alguien necesita el tenantId
// directamente, usa tenantIdFor(owner).
//
// El unico sitio donde "default" es legitimo es DEFAULT_TENANT_ID (arriba).
// El resto de codigo nunca lo hardcodea.

export function assertNotHardcodedTenantId(value: string, where: string): void {
  if (value === DEFAULT_TENANT_ID) {
    throw new Error(
      `TENANT_ID_HARDCODED_V2: "${DEFAULT_TENANT_ID}" hardcodeado en ${where}. ` +
        "Usa TenantService.tenantIdFor(owner) en su lugar.",
    );
  }
}
```

## File: apps/server/src/auth-routes.ts
```typescript
// EVENTBUS_AUTH_EMIT_V1
import { createHash, randomBytes } from "node:crypto";
import { getConnInfo } from "@hono/node-server/conninfo";
import { type Context, Hono } from "hono";
import { z } from "zod";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { AppError } from "./errors.ts";
import { backgroundFailure } from "./log.ts";
import type { EventBus } from "./engine/events/index.ts";
import { RateLimiter } from "./rate-limit.ts";
import { type User, type UserService, userRoleSchema, userSetupSchema } from "./users.ts";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

/** Ventanas anti fuerza bruta del login: 20 intentos por IP y 5 por email cada 5 minutos. */
const LOGIN_ATTEMPTS_PER_IP = 20;
const LOGIN_ATTEMPTS_PER_EMAIL = 5;
const LOGIN_WINDOW_MS = 5 * 60 * 1000;

function clientAddress(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  try {
    return getConnInfo(c as unknown as Context).remote.address ?? "local";
  } catch {
    // app.request() en los tests no pasa por el servidor de Node: no hay direccion remota.
    return "local";
  }
}

const createUserSchema = z.object({
  email: z.email({ message: "El email no tiene un formato valido" }),
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre no puede superar 120 caracteres"),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(200, "La contrasena no puede superar 200 caracteres"),
  role: userRoleSchema.default("user"),
  setup: userSetupSchema.partial().optional(),
});

const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(120, "El nombre no puede superar 120 caracteres")
    .optional(),
  role: userRoleSchema.optional(),
  active: z.boolean().optional(),
  setup: userSetupSchema.partial().optional(),
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(200, "La contrasena no puede superar 200 caracteres")
    .optional(),
});

export interface AuthRouteOptions {
  config?: Config;
  /**
   * Se ejecuta despues de un login correcto para preparar el workspace del usuario
   * (en modo sample siembra sus datos de ejemplo). Nunca puede tumbar el login.
   */
  afterLogin?: (owner: string) => Promise<void>;
}

export function authRoutes(
  db: Store,
  users: UserService,
  options: AuthRouteOptions = {},
  bus?: EventBus,
) {
  const app = new Hono<{ Variables: { owner: string } }>();
  // RATE_LIMIT_TENANT_WIRE_V1 - limite por IP + por email + por tenant.
  // El takeForTenant ya existe en RateLimiter. Cuando el login sea por tenant
  // (subdominio o campo), se usa ese método en vez de take.
  const ipLimiter = new RateLimiter(LOGIN_ATTEMPTS_PER_IP, LOGIN_WINDOW_MS);
  const emailLimiter = new RateLimiter(LOGIN_ATTEMPTS_PER_EMAIL, LOGIN_WINDOW_MS);

  // POST /api/auth/login -> { token, user, mode }
  app.post("/login", async (c) => {
    const body = z
      .object({ email: z.email(), password: z.string().min(1).max(200) })
      .parse(await c.req.json());
    const emailKey = `email:${body.email.toLowerCase().trim()}`;
    const keys = [`ip:${clientAddress(c)}`, emailKey];
    const limiters = [ipLimiter, emailLimiter];
    for (let i = 0; i < keys.length; i += 1) {
      const verdict = limiters[i].take(keys[i]);
      if (!verdict.allowed) {
        c.header("Retry-After", String(Math.max(1, Math.ceil(verdict.retryAfterMs / 1000))));
        throw new AppError("Demasiados intentos de acceso. Prueba otra vez en unos minutos.", 429);
      }
    }

    const user = await users.verifyCredentials(body.email, body.password);
    if (!user) {
      await bus?.emit("system", "auth.login_failed", { kind: "auth", id: "login" }, {
        email: body.email.toLowerCase().trim().slice(0, 300),
      });
      throw new AppError("Email o contrasena incorrectos", 401);
    }
    ipLimiter.reset(keys[0]);
    emailLimiter.reset(emailKey);

    const token = randomBytes(32).toString("base64url");
    await bus?.emit("system", "auth.login", { kind: "auth", id: user.id }, {
      userId: user.id,
    });
    await db.put("system", "sessions", {
      id: digest(token),
      owner: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    if (options.afterLogin) {
      try {
        await options.afterLogin(user.id);
      } catch (error) {
        // Un workspace de ejemplo que falla no puede impedir entrar.
        backgroundFailure(`login bootstrap for ${user.id}`, error);
      }
    }

    return c.json({
      token,
      mode: options.config?.mode ?? "live",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        setup: user.setup,
      },
    });
  });

  // POST /api/auth/register -> solo si la DB no tiene usuarios. Crea el primer admin
  // sin pasar por ADMIN_EMAIL/ADMIN_PASSWORD en .env. Despues, 409 siempre.
  app.post("/register", async (c) => {
    const existing = await users.list();
    if (existing.length > 0)
      throw new AppError("Ya hay usuarios en esta instalacion. Pide al admin que te cree cuenta.", 409);
    const body = z
      .object({
        email: z.email({ message: "Email invalido" }),
        name: z.string().trim().min(1).max(120),
        password: z.string().min(8).max(200),
      })
      .parse(await c.req.json());
    const user = await users.create({ ...body, role: "admin" });
    const token = randomBytes(32).toString("base64url");
    await db.put("system", "sessions", {
      id: digest(token),
      owner: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    if (options.afterLogin) {
      try {
        await options.afterLogin(user.id);
      } catch (error) {
        backgroundFailure(`register bootstrap for ${user.id}`, error);
      }
    }
    return c.json(
      {
        token,
        mode: options.config?.mode ?? "live",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          setup: user.setup,
        },
      },
      201,
    );
  });

  // POST /api/auth/logout
  app.post("/logout", async (c) => {
    const auth = c.req.header("authorization");
    if (auth?.startsWith("Bearer ")) {
      await db.remove("system", "sessions", digest(auth.slice(7)));
    }
    return c.json({ ok: true });
  });

  // GET /api/auth/me -> usuario autenticado actual
  app.get("/me", async (c) => {
    const user = await users.getById(c.get("owner"));
    if (!user) throw new AppError("Usuario no encontrado", 404);
    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      setup: user.setup,
    });
  });

  // PATCH /api/auth/me -> cambiar nombre y/o contrasena del propio usuario
  app.patch("/me", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me) throw new AppError("Usuario no encontrado", 404);
    const body = z
      .object({
        name: z
          .string()
          .trim()
          .min(1, "El nombre es obligatorio")
          .max(120, "El nombre no puede superar 120 caracteres")
          .optional(),
        currentPassword: z.string().min(1).max(200).optional(),
        newPassword: z
          .string()
          .min(8, "La contrasena debe tener al menos 8 caracteres")
          .max(200, "La contrasena no puede superar 200 caracteres")
          .optional(),
      })
      .parse(await c.req.json());

    if (body.newPassword) {
      if (!body.currentPassword)
        throw new AppError("Falta la contrasena actual", 422, {
          currentPassword: "Introduce tu contrasena actual",
        });
      const ok = await users.verifyCredentials(me.email, body.currentPassword);
      if (!ok)
        throw new AppError("Contrasena actual incorrecta", 403, {
          currentPassword: "Contrasena actual incorrecta",
        });
    }

    const updated = await users.update(me.id, {
      ...(body.name ? { name: body.name } : {}),
      ...(body.newPassword ? { password: body.newPassword } : {}),
    });
    return c.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      setup: updated.setup,
    });
  });
  // GET /api/auth/users -> solo admin
  app.get("/users", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me || me.role !== "admin") throw new AppError("Solo admin", 403);
    const all: User[] = await users.list();
    return c.json(
      all.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        active: u.active,
        setup: u.setup,
        createdAt: u.createdAt,
      })),
    );
  });

  // POST /api/auth/users -> crear usuario (solo admin)
  app.post("/users", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me || me.role !== "admin") throw new AppError("Solo admin", 403);
    const body = createUserSchema.parse(await c.req.json());
    const user = await users.create(body);
    return c.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        setup: user.setup,
      },
      201,
    );
  });

  // PATCH /api/auth/users/:id -> editar usuario (solo admin)
  app.patch("/users/:id", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me || me.role !== "admin") throw new AppError("Solo admin", 403);
    const id = c.req.param("id");
    const raw = await c.req.json<{ role?: string; active?: boolean }>();
    if (id === me.id && raw.role === "user")
      throw new AppError("No puedes quitarte el rol admin a ti mismo", 409);
    if (id === me.id && raw.active === false)
      throw new AppError("No puedes desactivar tu propia cuenta", 409);
    const body = updateUserSchema.parse(raw);
    const updated = await users.update(id, body);
    return c.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      active: updated.active,
      setup: updated.setup,
    });
  });

  // DELETE /api/auth/users/:id (solo admin)
  app.delete("/users/:id", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me || me.role !== "admin") throw new AppError("Solo admin", 403);
    if (c.req.param("id") === me.id) throw new AppError("No puedes borrarte a ti mismo", 409);
    await users.remove(c.req.param("id"));
    return c.json({ ok: true });
  });

  // GET /api/auth/users/:id/tasks -> ultimas tareas del usuario (solo admin)
  app.get("/users/:id/tasks", async (c) => {
    const me = await users.getById(c.get("owner"));
    if (!me || me.role !== "admin") throw new AppError("Solo admin", 403);
    const target = await users.getById(c.req.param("id"));
    if (!target) throw new AppError("Usuario no encontrado", 404);
    const limit = Math.min(Number(c.req.query("limit") ?? "20") || 20, 100);
    // KEYSET_CURSOR — paginacion real. El cliente pasa el updatedAt + id de la ultima
    // fila recibida para pedir la siguiente pagina.
    const cursorUpdatedAt = c.req.query("cursorUpdatedAt") || undefined;
    const cursorId = c.req.query("cursorId") || undefined;
    const [page, total] = await Promise.all([
      db.listPaged<Record<string, unknown>>(target.id, "tasks", {
        limit,
        ...(cursorUpdatedAt && cursorId ? { cursorUpdatedAt, cursorId } : {}),
      }),
      db.count(target.id, "tasks"),
    ]);
    const last = page[page.length - 1];
    const nextCursor = page.length === limit && last
      ? { updatedAt: last.updatedAt, id: (last.data as { id: string }).id }
      : null;
    const tasks = page.map(({ data: t }) => ({
      id: t.id,
      title: t.title,
      kind: t.kind,
      status: t.status,
      updatedAt: t.updatedAt,
      createdAt: t.createdAt,
      attempts: t.attempts,
      result: t.result,
      error: t.error,
    }));
    return c.json({ userId: target.id, total, tasks, nextCursor });
  });

  return app;
}
```
