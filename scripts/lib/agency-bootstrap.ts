// AGENCY_BOOTSTRAP_V1 - alta idempotente del tenant de la agencia (fase 1).
//
// El dogfooding necesita que el tenant `agntia` exista con datos reales de la
// empresa: quien es, que vende, a quien, a que precio, con que tono y con que
// limites. Eso son memorias del tenant (las lee el kernel en cada turno) mas un
// schema de negocio para las consultas de las SOPs.
//
// Reglas que este modulo respeta:
//   - Todo se escribe con el prefijo de tenant (`<tenantId>:<owner>`), igual que
//     una peticion HTTP. Nunca en "default": el bug que estamos cerrando es
//     precisamente datos de empresa cayendo en el tenant por defecto.
//   - Idempotente: los ids de memoria son estables y se saltan si ya existen;
//     el registry conserva el createdAt original.
//   - No crea usuarios. El owner tiene que existir ya (admin:create o primer
//     login con Supabase). Sin owner no hay donde escribir.

import type { Store } from "../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../apps/server/src/db-tenant.ts";
import { TenantService } from "../../apps/server/src/engine/tenant.ts";
import type { Config } from "../../apps/server/src/config.ts";

export interface AgencyPricingTier {
  name: string;
  price: string;
  includes?: string;
}

export interface AgencyProfile {
  tenantId: string;
  displayName: string;
  domain?: string;
  offer?: string;
  icp?: string;
  pricing?: AgencyPricingTier[];
  tone?: string;
  boundaries?: string[];
  /** Filas de business-records opcionales (pipeline real del dogfooding). */
  pipeline?: Array<Record<string, unknown> & { id: string; type?: string }>;
}

export interface BootstrapAction {
  kind: "tenant-registry" | "membership" | "memory" | "business-schema" | "business-record";
  id: string;
  action: "created" | "updated" | "skipped";
}

export interface BootstrapResult {
  tenantId: string;
  owner: string;
  actions: BootstrapAction[];
}

/** Schema de negocio de una agencia: lo que las SOPs consultan con query_business. */
function agencySchema(tenantId: string) {
  const now = new Date().toISOString();
  return {
    id: "default",
    tenantId,
    entities: [
      {
        type: "lead",
        label: "Lead",
        fields: [
          { name: "name", label: "Negocio", type: "string", required: true },
          { name: "city", label: "Ciudad", type: "string", required: false },
          { name: "email", label: "Email", type: "string", required: false },
          { name: "phone", label: "Telefono", type: "string", required: false },
          { name: "source", label: "Origen", type: "string", required: false },
          { name: "status", label: "Estado", type: "string", required: false },
          { name: "value", label: "Valor mensual", type: "number", required: false },
        ],
      },
      {
        type: "client",
        label: "Cliente",
        fields: [
          { name: "name", label: "Negocio", type: "string", required: true },
          { name: "email", label: "Email", type: "string", required: false },
          { name: "status", label: "Estado", type: "string", required: false },
          { name: "monthly_fee", label: "Cuota mensual", type: "number", required: false },
          { name: "since", label: "Cliente desde", type: "string", required: false },
        ],
      },
      {
        type: "invoice",
        label: "Factura",
        fields: [
          { name: "client_id", label: "Cliente", type: "string", required: true },
          { name: "amount", label: "Importe", type: "number", required: true },
          { name: "status", label: "Estado", type: "string", required: false },
          { name: "month", label: "Mes", type: "string", required: false },
        ],
      },
      {
        type: "call",
        label: "Discovery call",
        fields: [
          { name: "lead_id", label: "Lead", type: "string", required: true },
          { name: "scheduled_at", label: "Fecha", type: "string", required: true },
          { name: "outcome", label: "Resultado", type: "string", required: false },
        ],
      },
    ],
    relations: [
      { type: "has_invoice", label: "Tiene factura", fromType: "client", toType: "invoice", cardinality: "one-to-many" },
      { type: "converted_to", label: "Convertido en", fromType: "lead", toType: "client", cardinality: "one-to-one" },
      { type: "booked_call", label: "Cita agendada", fromType: "lead", toType: "call", cardinality: "one-to-many" },
    ],
    updatedAt: now,
  };
}

/** Memorias del perfil. Ids estables: volver a ejecutar no duplica nada. */
function profileMemories(profile: AgencyProfile): Array<{ id: string; text: string }> {
  const rows: Array<{ id: string; text: string }> = [];
  if (profile.offer) rows.push({ id: "agencia-oferta", text: `Que vendemos: ${profile.offer}` });
  if (profile.icp) rows.push({ id: "agencia-icp", text: `A quien vendemos: ${profile.icp}` });
  if (profile.pricing?.length) {
    const tiers = profile.pricing
      .map((tier) => `${tier.name} ${tier.price}${tier.includes ? ` (${tier.includes})` : ""}`)
      .join("; ");
    rows.push({ id: "agencia-precios", text: `Precios y paquetes: ${tiers}` });
  }
  if (profile.tone) rows.push({ id: "agencia-tono", text: `Tono de comunicacion: ${profile.tone}` });
  if (profile.boundaries?.length) {
    rows.push({ id: "agencia-limites", text: `Limites: ${profile.boundaries.join(" ")}` });
  }
  if (profile.domain) rows.push({ id: "agencia-dominio", text: `Dominio publico: ${profile.domain}` });
  return rows;
}

export async function bootstrapAgency(
  db: Store,
  config: Config,
  owner: string,
  profile: AgencyProfile,
): Promise<BootstrapResult> {
  if (!/^[a-z0-9-]{1,64}$/.test(profile.tenantId)) {
    throw new Error(`tenantId invalido: ${profile.tenantId}`);
  }
  if (!owner.trim()) throw new Error("owner vacio: no hay usuario donde escribir el tenant");

  const actions: BootstrapAction[] = [];
  const tenantId = profile.tenantId;
  const scoped = new TenantScopedStore(db, async () => tenantId);
  const tenants = new TenantService(db, config);

  // 1) Registro de tenants (el que lista /api/admin/tenants).
  const registryId = tenantId;
  const registry = await db.get<{ createdAt?: string }>("system", "tenant-membership", registryId);
  await db.put("system", "tenant-membership", {
    id: registryId,
    tenantId,
    displayName: profile.displayName,
    ...(profile.domain ? { domain: profile.domain } : {}),
    createdAt: registry?.createdAt ?? new Date().toISOString(),
    createdBy: "bootstrap-agency",
  });
  actions.push({ kind: "tenant-registry", id: registryId, action: registry ? "updated" : "created" });

  // 2) Membership del owner: la unica (id="default") y la lista de empresas.
  await tenants.setMembership(owner, tenantId);
  await tenants.addMembership(owner, tenantId, "owner");
  actions.push({ kind: "membership", id: `${tenantId}:${owner}`, action: "updated" });

  // 3) Perfil como memorias del tenant.
  const now = new Date().toISOString();
  for (const memory of profileMemories(profile)) {
    const existing = await scoped.get(owner, "memories", memory.id);
    if (existing) {
      actions.push({ kind: "memory", id: memory.id, action: "skipped" });
      continue;
    }
    await scoped.put(owner, "memories", {
      id: memory.id,
      text: memory.text,
      source: "bootstrap-agency",
      category: "empresa",
      tags: ["perfil", "empresa"],
      createdAt: now,
    });
    actions.push({ kind: "memory", id: memory.id, action: "created" });
  }

  // 4) Schema de negocio (lo leen query_business, el workspace y los formularios).
  await scoped.put(owner, "business-schemas", agencySchema(tenantId));
  actions.push({ kind: "business-schema", id: "default", action: "updated" });

  // 5) Pipeline real, solo si el perfil lo trae (vacio en fase 1).
  for (const row of profile.pipeline ?? []) {
    if (!row.id) throw new Error("pipeline: cada fila necesita id");
    const existing = await scoped.get(owner, "business-records", row.id);
    await scoped.put(owner, "business-records", row as { id: string });
    actions.push({
      kind: "business-record",
      id: row.id,
      action: existing ? "updated" : "created",
    });
  }

  return { tenantId, owner, actions };
}
