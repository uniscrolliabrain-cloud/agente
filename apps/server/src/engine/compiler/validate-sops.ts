// VALIDATE_SOPS_V1 - valida SOPs del bundle.
// Hoy: stub. TODO(cline): implementar contra tests/compiler/validate-sops.test.ts.
import type { TenantBundle } from "../../../../../packages/domain/src/tenant-bundle.ts";
import type { ValidationResult } from "./validate-ontology.ts";

export async function validateSOPs(_bundle: TenantBundle): Promise<ValidationResult> {
  // TODO(cline): comprobar que cada paso referencia una tool existente,
  // que las dependencias son aciclicas, que los SOPs referenciados por agentes existen.
  return { ok: true, errors: [] };
}