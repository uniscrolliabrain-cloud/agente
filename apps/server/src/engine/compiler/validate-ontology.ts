// VALIDATE_ONTOLOGY_V1 - valida la ontologia de un tenant (dominios, entidades, relaciones, data sources, needs).
// Hoy: stub. TODO(cline): implementar contra tests/compiler/validate-ontology.test.ts.
import type { TenantBundle } from "../../../../../packages/domain/src/tenant-bundle.ts";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export async function validateOntology(_bundle: TenantBundle): Promise<ValidationResult> {
  // TODO(cline): comprobar que los dominios referenciados existen,
  // que las entidades existen, que las relaciones apuntan a entidades validas.
  return { ok: true, errors: [] };
}