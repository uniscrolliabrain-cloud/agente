// KERNEL_PERSONAS_BOOTSTRAP_REGISTRY_V1
import { join } from "node:path";
import { PersonaRegistry } from "../../engine/agents/personas/registry.ts";
import { bootstrapAllPersonas } from "../../engine/agents/personas/bootstrap.ts";

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
  return { tenants, loaded, failed, errors };
}

export function clientsDirFrom(dataDir: string): string {
  return join(dataDir, "..", "clientes");
}