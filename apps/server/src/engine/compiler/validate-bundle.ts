// VALIDATE_BUNDLE_V1 - orquesta los 3 validadores.
// Hoy: stub. TODO(cline): implementar contra tests/compiler/validate-bundle.test.ts.
import type { TenantBundle } from "../../../../../packages/domain/src/tenant-bundle.ts";
import { validateOntology } from "./validate-ontology.ts";
import { validateAgents } from "./validate-agents.ts";
import { validateSOPs } from "./validate-sops.ts";
import type { ValidationResult } from "./validate-ontology.ts";

export async function validateBundle(bundle: TenantBundle): Promise<ValidationResult> {
  const errors: string[] = [];
  const ont = await validateOntology(bundle);
  if (!ont.ok) errors.push(...ont.errors);
  const agents = await validateAgents(bundle);
  if (!agents.ok) errors.push(...agents.errors);
  const sops = await validateSOPs(bundle);
  if (!sops.ok) errors.push(...sops.errors);
  return { ok: errors.length === 0, errors };
}