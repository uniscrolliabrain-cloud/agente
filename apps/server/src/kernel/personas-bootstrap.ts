// KERNEL_PERSONAS_BOOTSTRAP_REGISTRY_V1
import { join } from "node:path";
import { PersonaRegistry, type PersonaActivation } from "../engine/agents/personas/registry.ts";
import { bootstrapAllPersonas } from "../engine/agents/personas/bootstrap.ts";
import {
  agentPersonaSchema,
  agentStatsSchema,
  type AgentStats,
} from "../../../../packages/domain/src/agent-persona.ts";
import type { Store } from "../db.ts";

export interface PersonaBootstrapReport {
  tenants: string[];
  loaded: number;
  failed: number;
  errors: string[];
}

export async function wirePersonaBootstrap(
  registry: PersonaRegistry,
  tenants: string[],
  clientsDir: string,
): Promise<PersonaBootstrapReport> {
  const reports = await bootstrapAllPersonas(registry, tenants, clientsDir);
  const loaded = reports.reduce((n, r) => n + r.loaded, 0);
  const failed = reports.reduce((n, r) => n + r.failed, 0);
  const errors = reports.flatMap((r) => r.errors);
  // PERSONAS_BOOTSTRAP_WARN_EMPTY_V1 - fail-loud por tenant si loaded === 0.
  if (loaded === 0) {
    console.warn(
      `[kernel/personas] 0 personas cargadas para tenants=${tenants.join(",")} ` +
        `(failed=${failed}, errors=${errors.length}). Revisa clientes/<tenant>/personas/*.json`,
    );
  }
  return { tenants, loaded, failed, errors };
}

// PERSONA_INSTANCES_LOAD_V1 - las empresas instaladas no tienen carpeta en
// `clientes/`: su compilacion de personas vive en el store. Se cargan en la
// MISMA registry que consume el chat, con la activacion que fijo el alta.
export interface InstalledPersonaRecord {
  id: string;
  tenantId: string;
  personaId: string;
  persona: unknown;
  stats?: unknown;
  activation?: Partial<PersonaActivation>;
}

export interface InstalledPersonaReport {
  loaded: number;
  skipped: number;
  errors: string[];
}

export async function loadInstalledPersonas(
  registry: PersonaRegistry,
  db: Store,
  tenants?: string[],
): Promise<InstalledPersonaReport> {
  const rows = await db.list<InstalledPersonaRecord>("system", "persona-instances");
  const report: InstalledPersonaReport = { loaded: 0, skipped: 0, errors: [] };
  for (const row of rows) {
    if (tenants && !tenants.includes(row.tenantId)) {
      report.skipped += 1;
      continue;
    }
    const persona = agentPersonaSchema.safeParse(row.persona);
    if (!persona.success) {
      report.errors.push(`${row.id}: ${persona.error.issues[0]?.message ?? "persona invalida"}`);
      continue;
    }
    const stats: AgentStats = agentStatsSchema.safeParse(row.stats).success
      ? (agentStatsSchema.parse(row.stats))
      : agentStatsSchema.parse({ archetype: "assistant", status: "idle" });
    registry.register(row.tenantId, persona.data, stats, row.activation);
    report.loaded += 1;
  }
  return report;
}

export function clientsDirFrom(dataDir: string): string {
  // CLIENTS_DIR_ENV_HONORED_V1 - app.ts ya lee OPENMUSE_CLIENTS_DIR, pero este
  // helper lo ignoraba: en produccion el bootstrap del kernel seguia buscando
  // /clientes (raiz de la imagen, inexistente) aunque la variable estuviera
  // puesta. Sin la variable se mantiene el layout de desarrollo
  // (DATA_DIR=.openmuse -> <repo>/clientes).
  return process.env.OPENMUSE_CLIENTS_DIR ?? join(dataDir, "..", "clientes");
}