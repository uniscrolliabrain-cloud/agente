// COMPILE_BUNDLE_V1 - mezcla clientes/_template/ con los valores del bundle.
// Hoy: stub. TODO(cline): implementar contra tests/compiler/compile-bundle.test.ts.
import { tenantBundleSchema, type TenantBundle } from "../../../../../packages/domain/src/tenant-bundle.ts";

export interface CompileBundleInput {
  template: Record<string, unknown>;
  values: Record<string, unknown>;
  compiledBy: string;
}

export async function compileBundle(input: CompileBundleInput): Promise<TenantBundle> {
  // TODO(cline): mezclar template + values, sustituir placeholders, parsear con tenantBundleSchema.
  void input.template;
  void input.compiledBy;
  return tenantBundleSchema.parse(input.values);
}