// VALIDATE_AGENTS_V1 - valida agentes del bundle.
// Hoy: stub. TODO(cline): implementar contra tests/compiler/validate-agents.test.ts.
import type { TenantBundle } from "../../../../../packages/domain/src/tenant-bundle.ts";
import type { ValidationResult } from "./validate-ontology.ts";

export async function validateAgents(_bundle: TenantBundle): Promise<ValidationResult> {
  // TODO(cline): comprobar que cada agente referencia tools existentes,
  // que las memorias existen, que el tono es valido.
  return { ok: true, errors: [] };
}