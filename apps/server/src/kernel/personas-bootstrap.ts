// KERNEL_PERSONAS_BOOTSTRAP_REGISTRY_V1
import { join } from "node:path";
import { PersonaRegistry } from "../engine/agents/personas/registry.ts";
import { bootstrapAllPersonas } from "../engine/agents/personas/bootstrap.ts";

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

export function clientsDirFrom(dataDir: string): string {
  // CLIENTS_DIR_ENV_HONORED_V1 - app.ts ya lee OPENMUSE_CLIENTS_DIR, pero este
  // helper lo ignoraba: en produccion el bootstrap del kernel seguia buscando
  // /clientes (raiz de la imagen, inexistente) aunque la variable estuviera
  // puesta. Sin la variable se mantiene el layout de desarrollo
  // (DATA_DIR=.openmuse -> <repo>/clientes).
  return process.env.OPENMUSE_CLIENTS_DIR ?? join(dataDir, "..", "clientes");
}