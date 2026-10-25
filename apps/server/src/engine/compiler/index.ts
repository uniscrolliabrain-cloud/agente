// COMPILER_INDEX_V1 - exports del compilador de empresas.
export { TenantBundleStore, type TenantBundleStoreDeps } from "./tenant-bundle-store.ts";
export { validateOntology, type ValidationResult } from "./validate-ontology.ts";
export { validateAgents } from "./validate-agents.ts";
export { validateSOPs } from "./validate-sops.ts";
export { validateBundle } from "./validate-bundle.ts";
export { compileBundle, type CompileBundleInput } from "./compile-bundle.ts";
export { bootstrapTenant, type BootstrapResult, type BootstrapDeps } from "./bootstrap-tenant.ts";