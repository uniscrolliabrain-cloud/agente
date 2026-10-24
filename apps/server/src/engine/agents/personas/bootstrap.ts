// PERSONAS_BOOTSTRAP_V1 - carga personas desde disco al arrancar.
//
// El bootstrap del server llama a bootstrapPersonas() una vez por tenant
// activo. Carga todos los persona.json + stats.json, los valida, y los
// registra en el PersonaRegistry.
//
// Fail-soft por persona: si una no valida, esa se salta y las demas
// cargan.

import { join } from "node:path";
import type { PersonaRegistry } from "./registry.ts";
import { loadTenantPersonas } from "./loader.ts";

export interface BootstrapResult {
  tenantId: string;
  loaded: number;
  failed: number;
  errors: string[];
}

export async function bootstrapPersonas(
  registry: PersonaRegistry,
  tenantId: string,
  clientsDir: string,
): Promise<BootstrapResult> {
  const tenantDir = join(clientsDir, tenantId, "personas");
  const loaded = await loadTenantPersonas(tenantDir);
  for (const persona of loaded.personas) {
    const stats = loaded.stats[persona.id];
    if (!stats) continue;
    registry.register(tenantId, persona, stats);
  }
  return {
    tenantId,
    loaded: loaded.personas.length,
    failed: loaded.errors.length,
    errors: loaded.errors,
  };
}

export async function bootstrapAllPersonas(
  registry: PersonaRegistry,
  tenants: string[],
  clientsDir: string,
): Promise<BootstrapResult[]> {
  const results: BootstrapResult[] = [];
  for (const tenantId of tenants) {
    results.push(await bootstrapPersonas(registry, tenantId, clientsDir));
  }
  return results;
}