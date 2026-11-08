// VERTICAL_SLICE_BUNDLE_V1 - contrato del bundle versionado de un cliente y su
// plan de instalación.
//
// Reglas (campaña 07):
//   - El bundle es dato de plantilla: perfil, zona, personas, membresías,
//     automatizaciones y *referencias* de conexión. Nunca secretos.
//   - El id de plantilla es opaco y la clave de operación es distinta del slug:
//     dos clientes con el mismo slug no pueden compartir clave.
//   - El plan se calcula sin escribir nada, es determinista y lista operaciones
//     identificables (`kind:id`) para que un runner las aplique.
//   - Un nombre de empresa ya reclamado por otra plantilla se rechaza; jamás se
//     reasigna la empresa existente a la plantilla nueva.

import type { AgencyProfile } from "./agency-bootstrap.ts";

export const BUNDLE_SCHEMA = "VERTICAL_SLICE_BUNDLE_V1" as const;

export interface BundleTemplate {
  /** Id opaco de plantilla (no el slug). */
  id: string;
  /** Slug legible y estable. */
  slug: string;
  name: string;
}

export interface BundlePricingTier {
  name: string;
  price: string;
  includes?: string;
}

export interface BundleProfile {
  displayName: string;
  domain?: string;
  offer?: string;
  icp?: string;
  pricing?: BundlePricingTier[];
  tone?: string;
  boundaries?: string[];
}

export interface BundlePerson {
  id: string;
  name: string;
  email?: string;
}

export type BundleRole = "owner" | "admin" | "member";

export interface BundleMembership {
  personId: string;
  role: BundleRole;
}

export interface BundleAutomation {
  id: string;
  /** SOP que la automatización ejecuta. */
  sopId: string;
  trigger?: string;
}

export interface BundleConnection {
  id: string;
  provider: string;
  kind: "oauth" | "api_key" | "dataset";
  required?: boolean;
}

export interface VerticalSliceBundle {
  schema: typeof BUNDLE_SCHEMA;
  version: number;
  template: BundleTemplate;
  /** Clave de operación: opaca y distinta del slug. */
  operationKey: string;
  zone: string;
  profile: BundleProfile;
  persons: BundlePerson[];
  memberships: BundleMembership[];
  automations: BundleAutomation[];
  connections: BundleConnection[];
}

export interface BundleIssue {
  code: string;
  message: string;
}

export type ParseResult =
  | { ok: true; bundle: VerticalSliceBundle; errors: [] }
  | { ok: false; bundle: null; errors: BundleIssue[] };

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const OPAQUE = /^[A-Za-z0-9_-]{16,}$/;
/** Claves que jamás pueden viajar en el bundle versionado. */
const SECRET_KEYS =
  /^(api[_-]?key|apikey|token|access[_-]?token|refresh[_-]?token|secret|client[_-]?secret|password|passwd|private[_-]?key|bearer|authorization|cookie|credentials?)$/i;

/** Ruta de cualquier material secreto dentro del bundle, si lo hay. */
export function findSecretPaths(value: unknown, path = "bundle", depth = 0): string[] {
  if (depth > 8 || value === null || typeof value !== "object") return [];
  const found: string[] = [];
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value as Record<string, unknown>);
  for (const [key, child] of entries) {
    const here = `${path}.${key}`;
    if (!Array.isArray(value) && SECRET_KEYS.test(key)) found.push(here);
    else found.push(...findSecretPaths(child, here, depth + 1));
  }
  return found;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * VERTICAL_SLICE_BUNDLE_PARSE_V1 - validación completa sin efectos.
 * Devuelve todos los errores, no el primero: un alta rota debe poder
 * corregirse de una vez.
 */
export function parseVerticalSliceBundle(input: unknown): ParseResult {
  const errors: BundleIssue[] = [];
  const fail = (code: string, message: string) => errors.push({ code, message });

  if (!isRecord(input)) {
    return { ok: false, bundle: null, errors: [{ code: "BUNDLE_NO_OBJETO", message: "el bundle debe ser un objeto" }] };
  }
  const raw = input as Record<string, unknown>;

  if (raw.schema !== BUNDLE_SCHEMA) {
    fail("BUNDLE_SCHEMA_INVALIDO", `se esperaba schema ${BUNDLE_SCHEMA}`);
  }
  if (typeof raw.version !== "number" || !Number.isInteger(raw.version) || raw.version < 1) {
    fail("BUNDLE_VERSION_INVALIDA", "version debe ser un entero >= 1");
  }

  const template = isRecord(raw.template) ? raw.template : null;
  if (!template) fail("TEMPLATE_AUSENTE", "falta template");
  if (template) {
    if (typeof template.id !== "string" || !OPAQUE.test(template.id)) {
      fail("TEMPLATE_ID_INVALIDO", "template.id debe ser opaco (16+ de [A-Za-z0-9_-])");
    }
    if (typeof template.slug !== "string" || !SLUG.test(template.slug)) {
      fail("TEMPLATE_SLUG_INVALIDO", `slug invalido: ${String(template.slug)}`);
    }
    if (typeof template.name !== "string" || !template.name.trim()) {
      fail("TEMPLATE_NOMBRE_VACIO", "template.name vacio");
    }
  }

  const operationKey = typeof raw.operationKey === "string" ? raw.operationKey : "";
  if (!OPAQUE.test(operationKey)) {
    fail("OPERATION_KEY_INVALIDA", "operationKey debe ser opaca (16+ de [A-Za-z0-9_-])");
  }
  if (template && typeof template.slug === "string" && operationKey === template.slug) {
    fail("OPERATION_KEY_IGUAL_SLUG", "la clave de operación no puede ser el slug");
  }
  if (template && typeof template.id === "string" && operationKey === template.id) {
    fail("OPERATION_KEY_IGUAL_TEMPLATE", "la clave de operación debe ser distinta del id de plantilla");
  }

  if (typeof raw.zone !== "string" || !raw.zone.trim()) {
    fail("ZONA_AUSENTE", "falta zone");
  }

  if (!isRecord(raw.profile)) {
    fail("PERFIL_AUSENTE", "falta profile");
  } else if (typeof raw.profile.displayName !== "string" || !raw.profile.displayName.trim()) {
    fail("PERFIL_SIN_NOMBRE", "profile.displayName vacio");
  }

  const persons = Array.isArray(raw.persons) ? raw.persons : [];
  const memberships = Array.isArray(raw.memberships) ? raw.memberships : [];
  const automations = Array.isArray(raw.automations) ? raw.automations : [];
  const connections = Array.isArray(raw.connections) ? raw.connections : [];
  if (persons.length !== 2) fail("PERSONAS_INVALIDAS", `se esperan 2 personas, hay ${persons.length}`);
  if (memberships.length !== 3) fail("MEMBRESIAS_INVALIDAS", `se esperan 3 membresías, hay ${memberships.length}`);
  if (automations.length !== 1) fail("AUTOMATIZACIONES_INVALIDAS", `se espera 1 automatización, hay ${automations.length}`);
  if (connections.length === 0) fail("CONEXIONES_AUSENTES", "se espera al menos una referencia de conexión");

  const personIds = new Set<string>();
  for (const person of persons) {
    if (!isRecord(person) || typeof person.id !== "string" || !person.id.trim()) {
      fail("PERSONA_INVALIDA", "cada persona necesita id");
      continue;
    }
    if (personIds.has(person.id)) fail("PERSONA_DUPLICADA", `persona repetida: ${person.id}`);
    personIds.add(person.id);
    if (typeof person.name !== "string" || !person.name.trim()) {
      fail("PERSONA_SIN_NOMBRE", `${person.id} sin nombre`);
    }
  }

  const roles = new Set<string>();
  for (const membership of memberships) {
    if (!isRecord(membership) || typeof membership.personId !== "string") {
      fail("MEMBRESIA_INVALIDA", "cada membresía necesita personId");
      continue;
    }
    if (!personIds.has(membership.personId)) {
      fail("REFERENCIA_INVALIDA", `membresía de persona inexistente: ${membership.personId}`);
    }
    if (membership.role !== "owner" && membership.role !== "admin" && membership.role !== "member") {
      fail("ROL_INVALIDO", `rol invalido en ${membership.personId}: ${String(membership.role)}`);
    } else {
      roles.add(membership.role);
    }
  }
  if (memberships.length === 3 && !roles.has("owner")) {
    fail("SIN_OWNER", "las tres membresías necesitan un owner");
  }

  const automationIds = new Set<string>();
  for (const automation of automations) {
    if (!isRecord(automation) || typeof automation.id !== "string" || !automation.id.trim()) {
      fail("AUTOMATIZACION_INVALIDA", "cada automatización necesita id");
      continue;
    }
    if (automationIds.has(automation.id)) fail("AUTOMATIZACION_DUPLICADA", `automatización repetida: ${automation.id}`);
    automationIds.add(automation.id);
    if (typeof automation.sopId !== "string" || !automation.sopId.trim()) {
      fail("REFERENCIA_INVALIDA", `automatización ${automation.id} sin sopId`);
    }
  }

  for (const connection of connections) {
    if (!isRecord(connection) || typeof connection.id !== "string" || !connection.id.trim()) {
      fail("CONEXION_INVALIDA", "cada conexión necesita id");
      continue;
    }
    if (typeof connection.provider !== "string" || !connection.provider.trim()) {
      fail("CONEXION_SIN_PROVEEDOR", `conexión ${connection.id} sin provider`);
    }
    if (connection.kind !== "oauth" && connection.kind !== "api_key" && connection.kind !== "dataset") {
      fail("CONEXION_KIND_INVALIDO", `conexión ${connection.id} con kind invalido`);
    }
  }

  const secretPaths = findSecretPaths(raw);
  for (const path of secretPaths) {
    fail("SECRETO_EN_BUNDLE", `material secreto en ${path}: los secretos no viven en el bundle`);
  }
  if ("private" in raw) {
    fail("DATO_PRIVADO_EN_BUNDLE", "private no viaja en la plantilla versionada");
  }

  if (errors.length > 0) return { ok: false, bundle: null, errors };
  return { ok: true, bundle: raw as unknown as VerticalSliceBundle, errors: [] };
}

/** Normaliza un nombre de empresa para compararlo sin acentos ni mayúsculas. */
export function normalizeCompanyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export interface BundleSnapshot {
  /** Plantilla ya instalada en este deployment, si la hay. */
  templateId?: string;
  version?: number;
  displayName?: string;
  /** nombre normalizado -> templateId que ya lo posee. */
  claimedNames?: Record<string, string>;
  /** SOPs existentes: contra esto se validan las referencias. */
  sopIds?: string[];
  /** Operaciones editadas a mano que no deben pisarse. */
  customized?: string[];
}

export type PlanAction = "create" | "update" | "skip";

export interface PlanOperation {
  /** Identificador estable: `<kind>:<id>`. */
  id: string;
  kind: "tenant" | "membership" | "automation" | "connection" | "profile" | "version";
  action: PlanAction;
  reason?: string;
}

export interface BundlePlan {
  templateId: string;
  operationKey: string;
  fromVersion: number | null;
  toVersion: number;
  operations: PlanOperation[];
  divergences: string[];
  missingReferences: string[];
  errors: BundleIssue[];
  blocked: boolean;
}

/**
 * VERTICAL_SLICE_BUNDLE_PLAN_V1 - plan puro: no recibe store ni escribe nada.
 * Determinista: mismas entradas, mismo JSON (las operaciones van ordenadas).
 */
export function planVerticalSlice(bundle: VerticalSliceBundle, snapshot: BundleSnapshot = {}): BundlePlan {
  const errors: BundleIssue[] = [];
  const missingReferences: string[] = [];
  const divergences: string[] = [];
  const operations: PlanOperation[] = [];

  const fromVersion = typeof snapshot.version === "number" ? snapshot.version : null;
  const sameTemplate = snapshot.templateId === bundle.template.id;
  const customized = new Set(snapshot.customized ?? []);

  // Nombre ya reclamado por otra plantilla: se rechaza, no se reasigna.
  const claimed = (snapshot.claimedNames ?? {})[normalizeCompanyName(bundle.profile.displayName)];
  const duplicateName = Boolean(claimed && claimed !== bundle.template.id);
  if (duplicateName) {
    errors.push({
      code: "NOMBRE_DUPLICADO",
      message: `${bundle.profile.displayName} ya pertenece a la plantilla ${claimed}`,
    });
  }
  if (sameTemplate && snapshot.displayName) {
    const current = normalizeCompanyName(snapshot.displayName);
    if (current !== normalizeCompanyName(bundle.profile.displayName)) {
      errors.push({
        code: "NOMBRE_DIVERGENTE",
        message: `el tenant ya instalado se llama ${snapshot.displayName}`,
      });
    }
  }

  if (fromVersion !== null && fromVersion > bundle.version) {
    errors.push({
      code: "BUNDLE_OBSOLETO",
      message: `la instalación está en v${fromVersion} y el bundle es v${bundle.version}`,
    });
  }

  const push = (kind: PlanOperation["kind"], id: string, base: PlanAction, extra: Partial<PlanOperation> = {}) => {
    const fullId = `${kind}:${id}`;
    if (customized.has(fullId)) {
      divergences.push(fullId);
      operations.push({ id: fullId, kind, action: "skip", reason: "divergencia local", ...extra });
      return;
    }
    operations.push({ id: fullId, kind, action: base, ...extra });
  };

  push(
    "tenant",
    bundle.template.slug,
    duplicateName ? "skip" : sameTemplate ? "update" : "create",
    duplicateName ? { reason: "nombre ya reclamado por otra plantilla" } : {},
  );
  push("profile", bundle.profile.displayName, sameTemplate ? "update" : "create");
  push("version", String(bundle.version), fromVersion === bundle.version ? "skip" : "update", {
    reason: fromVersion === null ? "instalación nueva" : `v${fromVersion} -> v${bundle.version}`,
  });

  for (const membership of bundle.memberships) {
    push("membership", `${membership.personId}:${membership.role}`, "create");
  }

  const knownSops = snapshot.sopIds ? new Set(snapshot.sopIds) : null;
  for (const automation of bundle.automations) {
    if (knownSops && !knownSops.has(automation.sopId)) {
      missingReferences.push(`automation:${automation.id}->sop:${automation.sopId}`);
      operations.push({
        id: `automation:${automation.id}`,
        kind: "automation",
        action: "skip",
        reason: `SOP ausente: ${automation.sopId}`,
      });
      continue;
    }
    push("automation", automation.id, "create");
  }

  for (const connection of bundle.connections) {
    // La conexión se referencia, no se instala: el secreto lo pone el operador.
    operations.push({
      id: `connection:${connection.id}`,
      kind: "connection",
      action: "skip",
      reason: `referencia ${connection.provider}/${connection.kind}`,
    });
  }

  operations.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return {
    templateId: bundle.template.id,
    operationKey: bundle.operationKey,
    fromVersion,
    toVersion: bundle.version,
    operations,
    divergences: divergences.sort(),
    missingReferences: missingReferences.sort(),
    errors,
    blocked: errors.length > 0 || missingReferences.length > 0,
  };
}

/** Perfil de agencia equivalente, para el bootstrap existente. */
export function bundleToAgencyProfile(bundle: VerticalSliceBundle): AgencyProfile {
  return {
    tenantId: bundle.template.slug,
    displayName: bundle.profile.displayName,
    ...(bundle.profile.domain ? { domain: bundle.profile.domain } : {}),
    ...(bundle.profile.offer ? { offer: bundle.profile.offer } : {}),
    ...(bundle.profile.icp ? { icp: bundle.profile.icp } : {}),
    ...(bundle.profile.pricing ? { pricing: bundle.profile.pricing } : {}),
    ...(bundle.profile.tone ? { tone: bundle.profile.tone } : {}),
    ...(bundle.profile.boundaries ? { boundaries: bundle.profile.boundaries } : {}),
  };
}
