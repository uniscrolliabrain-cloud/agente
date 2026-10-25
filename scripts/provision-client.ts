// PROVISION_CLIENT_V1 - compila y bootstrappea un tenant desde un template + values.
// Uso:
//   pnpm provision-client --from-template _template --tenant mi-agencia --values values.json --db memory
//   pnpm provision-client --from-template _template --tenant mi-agencia --values values.json --db supabase
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { compileBundle } from "../apps/server/src/engine/compiler/compile-bundle.ts";
import { validateBundle } from "../apps/server/src/engine/compiler/validate-bundle.ts";
import { bootstrapTenant } from "../apps/server/src/engine/compiler/bootstrap-tenant.ts";
import { TenantBundleStore } from "../apps/server/src/engine/compiler/tenant-bundle-store.ts";

interface Args {
  fromTemplate: string;
  tenant: string;
  values: string;
  db: "memory" | "supabase";
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const fromTemplate = get("--from-template");
  const tenant = get("--tenant");
  const values = get("--values");
  const db = (get("--db") ?? "memory") as Args["db"];
  if (!fromTemplate || !tenant || !values) {
    throw new Error("Uso: provision-client --from-template <dir> --tenant <id> --values <file> [--db memory|supabase]");
  }
  if (db !== "memory" && db !== "supabase") throw new Error(`--db invalido: ${db}`);
  return { fromTemplate, tenant, values, db };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const templatePath = join(process.cwd(), "clientes", args.fromTemplate, "bundle.json");
  const valuesPath = join(process.cwd(), args.values);
  const template = JSON.parse(await readFile(templatePath, "utf8")) as Record<string, unknown>;
  const values = JSON.parse(await readFile(valuesPath, "utf8")) as Record<string, unknown>;
  const bundle = await compileBundle({ template, values, compiledBy: "provision-client" });
  const validation = await validateBundle(bundle);
  if (!validation.ok) {
    console.error("Bundle invalido:", validation.errors);
    process.exit(1);
  }
  const store = new TenantBundleStore();
  await store.saveBundle(args.tenant, bundle, "provision-client");
  const result = await bootstrapTenant(bundle, {
    capabilities: { register: () => {}, list: async () => [] },
    personas: { register: () => {}, list: () => [] },
    sops: { register: () => {}, list: () => [] },
  });
  console.log(`Tenant ${args.tenant} compilado. Registrado:`, result.registered);
  console.log(`DB: ${args.db}. Cliente entra con su Google (tenant_id = ${args.tenant}).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});