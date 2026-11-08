// VERTICAL_SLICE_PROVISION_V1 - instalador reanudable del vertical slice.
//
// Por que existe: `bootstrapAgency` siembra perfil y SOPs, y `provision-agntia`
// crea el owner, pero no habia nadie que uniera las dos cosas con una clave de
// operacion. Sin esa clave, un fallo a mitad del alta dejaba un tenant a medias
// y reintentar duplicaba usuarios. Este modulo:
//
//   1. Reserva la instalacion ANTES de escribir datos de empresa: el registro
//      `system/vertical-slice-installations/<operationKey>` queda en
//      `incomplete` con su reservationId. Si la clave ya pertenece a otro
//      tenant, no se toca nada (nunca se reasigna una empresa a otra plantilla).
//   2. Aplica por pasos (`tenant` -> `actors` -> `complete`) y persiste cada
//      paso al terminar. Reanudar solo ejecuta lo que falta.
//   3. Crea el owner de la cuenta y una cuenta por persona del bundle: tres
//      actores por empresa, seis para A/B.
//   4. `check` emite el informe de estado y deja las credenciales Google como
//      consentimiento pendiente del operador: la conexion se referencia, no se
//      instala.
//
// Uso:
//   DATABASE_URL=... pnpm provision:slice plan  --bundle clientes/x/vertical-slice.json
//   DATABASE_URL=... pnpm provision:slice apply --bundle ... --owner owner@empresa.test
//   DATABASE_URL=... pnpm provision:slice check --bundle ...

import { randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Config } from "../apps/server/src/config.ts";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantService } from "../apps/server/src/engine/tenant.ts";
import { UserService } from "../apps/server/src/users.ts";
import type { SOP } from "../packages/domain/src/sop.ts";
import { bootstrapAgency } from "./lib/agency-bootstrap.ts";
import {
  bundleToAgencyProfile,
  normalizeCompanyName,
  parseVerticalSliceBundle,
  planVerticalSlice,
  type BundlePlan,
  type VerticalSliceBundle,
} from "./lib/vertical-slice-bundle.ts";

export const PROVISION_COLLECTION = "vertical-slice-installations";

export const PROVISION_STEPS = ["tenant", "actors", "complete"] as const;
export type ProvisionStep = (typeof PROVISION_STEPS)[number];

export interface InstallationActor {
  personId: string;
  name: string;
  email: string;
  userId: string;
  role: "owner" | "admin" | "member";
}

export interface InstallationRecord {
  id: string;
  operationKey: string;
  templateId: string;
  slug: string;
  tenantId: string;
  displayName: string;
  version: number;
  zone: string;
  status: "incomplete" | "complete";
  /** Pasos terminados: es el diario que permite reanudar sin repetir. */
  steps: Partial<Record<ProvisionStep, boolean>>;
  actors: InstallationActor[];
  /** Se relee tras la reserva: si no coincide, otro proceso la gano. */
  reservationId: string;
  error?: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ProvisionOptions {
  /** Usuario existente que sera owner de la empresa. */
  owner: string;
  sops?: SOP[];
  /** Inyeccion de fallo para probar la reanudacion (no se usa en produccion). */
  failAt?: ProvisionStep;
  /** Operaciones que el operador edito a mano: el plan las salta. */
  customized?: string[];
}

export interface ProvisionResult {
  record: InstallationRecord;
  /** true si la instalacion ya existia y solo se completo lo que faltaba. */
  resumed: boolean;
  actorsCreated: number;
}

export interface ProvisionCheck {
  ok: boolean;
  operationKey: string;
  tenantId: string;
  status: InstallationRecord["status"] | "missing";
  version: number | null;
  actors: InstallationActor[];
  incompleteSteps: ProvisionStep[];
  pendingConsent: Array<{ id: string; provider: string }>;
  problems: string[];
}

function nowIso(): string {
  return new Date().toISOString();
}

/** `system` es el owner de los registros de plataforma (igual que el registry). */
export function readInstallation(db: Store, operationKey: string): Promise<InstallationRecord | null> {
  return db.get<InstallationRecord>("system", PROVISION_COLLECTION, operationKey).catch(() => null);
}

function highestRole(roles: string[]): InstallationActor["role"] {
  if (roles.includes("owner")) return "owner";
  if (roles.includes("admin")) return "admin";
  return "member";
}

async function readClaimedNames(db: Store): Promise<Record<string, string>> {
  const installations = await db.list<InstallationRecord>("system", PROVISION_COLLECTION).catch(() => []);
  const claimed: Record<string, string> = {};
  for (const installation of installations) {
    if (!installation?.displayName) continue;
    claimed[normalizeCompanyName(installation.displayName)] = installation.templateId;
  }
  return claimed;
}

/**
 * VERTICAL_SLICE_PROVISION_PLAN_V1 - plan sin escrituras. Reutiliza el plan puro
 * de la campana 07 con la foto real del deployment (registry + instalaciones).
 */
export async function planProvision(
  db: Store,
  input: unknown,
  options: { customized?: string[] } = {},
): Promise<BundlePlan> {
  const parsed = parseVerticalSliceBundle(input);
  if (!parsed.ok) {
    throw new Error(`bundle invalido: ${parsed.errors.map((issue) => `${issue.code}: ${issue.message}`).join("; ")}`);
  }
  const bundle = parsed.bundle;
  const registry = await db
    .get<{ templateId?: string; bundleVersion?: number; displayName?: string; status?: string }>(
      "system",
      "tenant-membership",
      bundle.template.slug,
    )
    .catch(() => null);
  return planVerticalSlice(bundle, {
    ...(registry?.templateId ? { templateId: registry.templateId } : {}),
    ...(typeof registry?.bundleVersion === "number" ? { version: registry.bundleVersion } : {}),
    ...(registry?.displayName ? { displayName: registry.displayName } : {}),
    claimedNames: await readClaimedNames(db),
    ...(options.customized ? { customized: options.customized } : {}),
  });
}

/** Cuentas + memberships de las personas del bundle. Idempotente por email. */
async function ensureActors(
  db: Store,
  config: Config,
  bundle: VerticalSliceBundle,
  owner: string,
  previous: InstallationActor[],
): Promise<{ actors: InstallationActor[]; created: number }> {
  const users = new UserService(db);
  const tenants = new TenantService(db, config);
  const tenantId = bundle.template.slug;
  const known = new Map(previous.map((actor) => [actor.personId, actor]));
  const actors: InstallationActor[] = [];
  let created = 0;

  // El owner de la cuenta es el primer actor de la empresa.
  const ownerUser = await db
    .get<{ id: string; email?: string; name?: string }>("system", "users", owner)
    .catch(() => null);
  if (!ownerUser) throw new Error(`ACTOR_OWNER_AUSENTE: no existe el usuario ${owner}`);
  await tenants.setMembership(owner, tenantId);
  await tenants.addMembership(owner, tenantId, "owner");
  actors.push({
    personId: "owner",
    name: ownerUser.name ?? ownerUser.email ?? owner,
    email: ownerUser.email ?? "",
    userId: owner,
    role: "owner",
  });

  const roleByPerson = new Map<string, string[]>();
  for (const membership of bundle.memberships) {
    roleByPerson.set(membership.personId, [...(roleByPerson.get(membership.personId) ?? []), membership.role]);
  }

  for (const person of [...bundle.persons].sort((a, b) => a.id.localeCompare(b.id))) {
    if (!person.email?.trim()) {
      throw new Error(`ACTOR_SIN_EMAIL: la persona ${person.id} necesita email para tener cuenta`);
    }
    const email = person.email.toLowerCase().trim();
    const role = highestRole(roleByPerson.get(person.id) ?? []);
    const cached = known.get(person.id);
    let user = cached ? await db.get<{ id: string }>("system", "users", cached.userId).catch(() => null) : null;
    if (!user) user = await users.getByEmail(email);
    if (!user) {
      user = await users.create({
        email,
        name: person.name,
        // Igual que el alta del owner: la identidad la da el proveedor social.
        password: randomBytes(32).toString("base64url"),
        role: role === "member" ? "user" : "admin",
        authProviderId: `vertical-slice:${email}`,
      });
      created++;
    }
    await tenants.addMembership(user.id, tenantId, role);
    if (role === "owner") await tenants.setMembership(user.id, tenantId);
    actors.push({ personId: person.id, name: person.name, email, userId: user.id, role });
  }

  // Un usuario repetido en el bundle no debe aparecer dos veces como actor.
  const deduped = new Map<string, InstallationActor>();
  for (const actor of actors) deduped.set(actor.userId, actor);
  return { actors: [...deduped.values()], created };
}

/**
 * VERTICAL_SLICE_PROVISION_APPLY_V1 - reserva, aplica por pasos y deja diario.
 * Reanudable: un fallo a mitad no se arregla reescribiendo, se continua desde el
 * ultimo paso terminado.
 */
// PERSONA_OWNERS_V1 (campana 09) - la persona instalada solo inicia trabajo si
// detras hay un humano con membership en la empresa. El alta acaba de crear
// esas cuentas, asi que aqui se enlazan con la activacion ya escrita por el
// bootstrap. Reaplicar con los mismos actores no vuelve a escribir.
async function attachPersonaOwners(
  db: Store,
  tenantId: string,
  actors: Array<{ userId: string }>,
): Promise<void> {
  const owners = actors.map((actor) => actor.userId);
  const rows = await db.list<{
    id: string;
    activation?: { enabled?: boolean; sopIds?: string[]; owners?: string[] };
  }>("system", "persona-instances");
  for (const row of rows) {
    if (!row.id.startsWith(`${tenantId}:`)) continue;
    const activation = row.activation ?? {};
    if (
      Array.isArray(activation.owners) &&
      activation.owners.length === owners.length &&
      activation.owners.every((owner, index) => owner === owners[index])
    ) {
      continue;
    }
    await db.put("system", "persona-instances", {
      ...row,
      activation: {
        enabled: activation.enabled ?? true,
        sopIds: activation.sopIds ?? [],
        owners,
      },
    });
  }
}

export async function applyProvision(
  db: Store,
  config: Config,
  input: unknown,
  options: ProvisionOptions,
): Promise<ProvisionResult> {
  const parsed = parseVerticalSliceBundle(input);
  if (!parsed.ok) {
    throw new Error(`bundle invalido: ${parsed.errors.map((issue) => `${issue.code}: ${issue.message}`).join("; ")}`);
  }
  const bundle = parsed.bundle;
  if (!options.owner?.trim()) throw new Error("owner vacio: no hay usuario donde escribir la empresa");

  const existing = await readInstallation(db, bundle.operationKey);
  if (existing && existing.slug !== bundle.template.slug) {
    throw new Error(
      `RESERVA_CONFLICTO: la clave ${bundle.operationKey} ya pertenece a ${existing.slug}, no a ${bundle.template.slug}`,
    );
  }
  if (existing && existing.version > bundle.version) {
    throw new Error(`BUNDLE_OBSOLETO: la instalacion esta en v${existing.version} y el bundle es v${bundle.version}`);
  }
  // Nombre reclamado por otra plantilla: se rechaza, jamas se reasigna.
  const claimed = await readClaimedNames(db);
  const ownerOfName = claimed[normalizeCompanyName(bundle.profile.displayName)];
  if (ownerOfName && ownerOfName !== bundle.template.id) {
    throw new Error(`NOMBRE_DUPLICADO: ${bundle.profile.displayName} ya pertenece a la plantilla ${ownerOfName}`);
  }

  const tenantId = bundle.template.slug;
  const reservationId = existing?.reservationId ?? `res_${randomUUID()}`;
  // Una version nueva reabre los pasos que dependen del bundle (perfil y
  // cierre). Las cuentas ya creadas se conservan: no se recrean identidades.
  const versionChanged = Boolean(existing && existing.version !== bundle.version);
  const baseSteps: InstallationRecord["steps"] = versionChanged
    ? { ...(existing?.steps ?? {}), tenant: false, complete: false }
    : existing?.steps ?? {};
  let record: InstallationRecord =
    existing ??
    {
      id: bundle.operationKey,
      operationKey: bundle.operationKey,
      templateId: bundle.template.id,
      slug: tenantId,
      tenantId,
      displayName: bundle.profile.displayName,
      version: bundle.version,
      zone: bundle.zone,
      status: "incomplete",
      steps: baseSteps,
      actors: [],
      reservationId,
      startedAt: nowIso(),
      updatedAt: nowIso(),
    };

  if (versionChanged) record = { ...record, steps: baseSteps };

  const save = async (patch: Partial<InstallationRecord>) => {
    record = { ...record, ...patch, updatedAt: nowIso() };
    await db.put("system", PROVISION_COLLECTION, record);
  };

  // 1) Reserva: primero la clave, despues cualquier dato de empresa. Reaplicar
  //    una instalacion ya cerrada no la vuelve a dejar incompleta.
  await save({
    status: versionChanged || !existing || existing.status !== "complete" ? "incomplete" : "complete",
    reservationId,
    version: bundle.version,
  });
  const reserved = await readInstallation(db, bundle.operationKey);
  if (!reserved || reserved.reservationId !== reservationId) {
    throw new Error(`RESERVA_PERDIDA: otro proceso se quedo con ${bundle.operationKey}`);
  }

  const maybeFail = async (step: ProvisionStep) => {
    if (options.failAt !== step) return;
    await save({ error: `fallo inyectado tras ${step}` });
    throw new Error(`FALLO_INYECTADO: ${step}`);
  };
  const markDone = async (step: ProvisionStep, patch: Partial<InstallationRecord> = {}) => {
    await save({ steps: { ...record.steps, [step]: true }, ...patch });
    await maybeFail(step);
  };

  // Un nombre ya renombrado a mano por el operador se conserva al reaplicar.
  const currentRegistry = await db
    .get<{ displayName?: string; createdAt?: string; templateId?: string; bundleVersion?: number }>(
      "system",
      "tenant-membership",
      tenantId,
    )
    .catch(() => null);
  const displayName = currentRegistry?.displayName?.trim() || bundle.profile.displayName;

  // 2) Tenant + perfil + SOPs (bootstrap idempotente, marcado incompleto).
  if (!record.steps.tenant) {
    const profile = { ...bundleToAgencyProfile(bundle), displayName };
    await bootstrapAgency(db, config, options.owner, profile, {
      ...(options.sops ? { sops: options.sops } : {}),
      bundle,
      status: "incomplete",
    });
    await markDone("tenant", { displayName });
  }

  // 3) Actores: owner de la cuenta + una cuenta por persona.
  let actorsCreated = 0;
  if (!record.steps.actors) {
    const ensured = await ensureActors(db, config, bundle, options.owner, record.actors);
    actorsCreated = ensured.created;
    await markDone("actors", { actors: ensured.actors });
  }
  // PERSONA_OWNERS_V1 (campana 09): una persona instalada solo puede iniciar
  // trabajo si detras hay un humano de la empresa. El alta acaba de crearlos.
  await attachPersonaOwners(db, tenantId, record.actors);

  // 4) Cierre: el registro del tenant y la instalacion dejan de estar incompletos.
  if (!record.steps.complete) {
    const registry = await db.get<Record<string, unknown>>("system", "tenant-membership", tenantId);
    if (registry) {
      await db.put("system", "tenant-membership", {
        ...registry,
        id: tenantId,
        status: "complete",
        bundleVersion: bundle.version,
        templateId: bundle.template.id,
        operationKey: bundle.operationKey,
        updatedAt: nowIso(),
      });
    }
    await markDone("complete", { status: "complete", version: bundle.version, completedAt: nowIso() });
  }

  // Un alta terminada no debe arrastrar el motivo de un fallo anterior.
  if (record.error) {
    const { error: _stale, ...rest } = record;
    record = { ...rest, updatedAt: nowIso() };
    await db.put("system", PROVISION_COLLECTION, record);
  }

  return {
    record,
    resumed: Boolean(existing?.status === "incomplete"),
    actorsCreated,
  };
}

/** VERTICAL_SLICE_PROVISION_CHECK_V1 - informe de estado, sin escribir nada. */
export async function checkProvision(
  db: Store,
  config: Config,
  input: unknown,
): Promise<ProvisionCheck> {
  const parsed = parseVerticalSliceBundle(input);
  if (!parsed.ok) {
    throw new Error(`bundle invalido: ${parsed.errors.map((issue) => `${issue.code}: ${issue.message}`).join("; ")}`);
  }
  const bundle = parsed.bundle;
  const tenantId = bundle.template.slug;
  const problems: string[] = [];
  const installation = await readInstallation(db, bundle.operationKey);
  const registry = await db
    .get<{ displayName?: string; status?: string; bundleVersion?: number; templateId?: string }>(
      "system",
      "tenant-membership",
      tenantId,
    )
    .catch(() => null);

  if (!installation) problems.push(`sin instalacion para ${bundle.operationKey}`);
  if (!registry) problems.push(`tenant ${tenantId} sin registrar`);
  if (installation && installation.slug !== tenantId) {
    problems.push(`la instalacion apunta a ${installation.slug}`);
  }
  if (registry?.status && registry.status !== "complete") {
    problems.push(`tenant en estado ${registry.status}`);
  }
  if (typeof registry?.bundleVersion === "number" && registry.bundleVersion !== bundle.version) {
    problems.push(`version del tenant v${registry.bundleVersion} != bundle v${bundle.version}`);
  }

  const actors = installation?.actors ?? [];
  const tenants = new TenantService(db, config);
  for (const actor of actors) {
    const memberships = await tenants.membershipsFor(actor.userId);
    const inTenant = memberships.find((membership) => membership.tenantId === tenantId);
    if (!inTenant) problems.push(`actor ${actor.email || actor.userId} sin membership en ${tenantId}`);
    else if (inTenant.role !== actor.role) {
      problems.push(`actor ${actor.email || actor.userId}: rol ${inTenant.role} != ${actor.role}`);
    }
  }
  if (actors.length !== bundle.persons.length + 1) {
    problems.push(`actores ${actors.length}, se esperan ${bundle.persons.length + 1} (owner + personas)`);
  }

  const incompleteSteps = PROVISION_STEPS.filter((step) => !installation?.steps?.[step]);
  if (installation?.status !== "complete") {
    problems.push(`instalacion ${installation?.status ?? "missing"}; faltan pasos: ${incompleteSteps.join(", ") || "-"}`);
  }

  return {
    ok: problems.length === 0,
    operationKey: bundle.operationKey,
    tenantId,
    status: installation?.status ?? "missing",
    version: typeof registry?.bundleVersion === "number" ? registry.bundleVersion : installation?.version ?? null,
    actors,
    incompleteSteps,
    pendingConsent: bundle.connections
      .filter((connection) => connection.kind === "oauth")
      .map((connection) => ({ id: connection.id, provider: connection.provider })),
    problems,
  };
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const command = process.argv[2];
  const bundlePath = arg("bundle");
  if (!command || !["plan", "apply", "check"].includes(command) || !bundlePath) {
    console.error(
      "Uso: provision-vertical-slice <plan|apply|check> --bundle clientes/<cliente>/vertical-slice.json [--owner email]",
    );
    process.exit(2);
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Falta DATABASE_URL: el instalador escribe en la DB del deployment.");
    process.exit(2);
  }
  const input: unknown = JSON.parse(await readFile(resolve(process.cwd(), bundlePath), "utf8"));
  const db = await createStore({ databaseUrl });
  const config = {} as Config;
  try {
    if (command === "plan") {
      const plan = await planProvision(db, input);
      console.log(JSON.stringify(plan, null, 2));
      process.exit(plan.blocked ? 1 : 0);
      return;
    }
    const parsed = parseVerticalSliceBundle(input);
    if (!parsed.ok) {
      console.error(parsed.errors.map((issue) => `${issue.code}: ${issue.message}`).join("\n"));
      process.exit(1);
      return;
    }
    if (command === "check") {
      const report = await checkProvision(db, config, input);
      console.log(JSON.stringify(report, null, 2));
      process.exit(report.ok ? 0 : 1);
      return;
    }
    const ownerEmail = arg("owner");
    if (!ownerEmail) {
      console.error("Falta --owner: email del owner de la empresa.");
      process.exit(2);
    }
    const owner = await new UserService(db).getByEmail(ownerEmail);
    if (!owner) {
      console.error(`No existe el usuario ${ownerEmail}: crea el owner antes de aplicar.`);
      process.exit(1);
    }
    const result = await applyProvision(db, config, input, { owner: owner.id });
    console.log(JSON.stringify({ ...result, record: { ...result.record, actors: result.record.actors } }, null, 2));
    console.log(
      `${result.resumed ? "Reanudada" : "Instalada"} ${result.record.slug} v${result.record.version}: ` +
        `${result.record.actors.length} actores.`,
    );
  } finally {
    await db.close();
  }
}

const entry = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (entry && import.meta.url === entry) {
  main().catch((error) => {
    console.error("Provision fallida:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
