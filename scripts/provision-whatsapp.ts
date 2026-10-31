// Trusted operator CLI. Defaults to a plan; never sends a message or prints a key.
import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { readConfig } from "../apps/server/src/config.ts";
import { runInTenantScope } from "../apps/server/src/tenant-scope.ts";
import { provisionWhatsAppConnection } from "../apps/server/src/engine/whatsapp-outbound.ts";

const allowed = new Set(["tenant", "owner", "instance", "base-url", "recipients", "enable", "apply", "help"]);
const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
  const match = /^--([^=]+)(?:=(.*))?$/.exec(arg);
  if (!match || !allowed.has(match[1])) throw new Error("Opcion no reconocida; usa --help. No pases credenciales como argumentos.");
  args.set(match[1], match[2] ?? "true");
}
if (args.has("help")) {
  process.stdout.write("Uso: node --import tsx scripts/provision-whatsapp.ts --tenant=ID --owner=USER_ID --instance=NAME --base-url=https://HOST --recipients=NUMERO,NUMERO [--enable] [--apply]\nSin --apply solo muestra el plan y no abre la base. Credencial: WHATSAPP_PROVISION_API_KEY en entorno; cifrado: TOKEN_ENCRYPTION_KEY. --apply rota la generacion e invalida borradores anteriores. API parado si usa PGlite.\n");
} else {
  const tenantId = args.get("tenant") ?? "", owner = args.get("owner") ?? "";
  const baseUrl = args.get("base-url") ?? "", instance = args.get("instance") ?? "";
  const allowedRecipients = (args.get("recipients") ?? "").split(",").map((v) => v.trim()).filter(Boolean);
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(tenantId) || !owner || owner.includes(":") || !instance || !allowedRecipients.length) {
    throw new Error("Faltan tenant, owner, instancia o destinatarios explicitos");
  }
  let url: URL;
  try { url = new URL(baseUrl); } catch { throw new Error("URL de Evolution no valida"); }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new Error("Usa URL HTTPS sin secretos ni query");
  if (allowedRecipients.some((value) => !/^\+?[0-9]{6,20}$/.test(value))) throw new Error("Destinatario no valido");
  if (args.get("apply") !== "true") {
    process.stdout.write(JSON.stringify({ plan: true, tenantId, owner, instance, baseUrl: url.origin + url.pathname,
      enabled: args.get("enable") === "true", recipientsCount: allowedRecipients.length,
      membershipVerified: false, note: "No se abrio la base ni se guardo la conexion. --apply rota la generacion." }) + "\n");
  } else {
    const config = readConfig();
    const apiKey = process.env.WHATSAPP_PROVISION_API_KEY;
    if (!apiKey?.trim() || !config.encryptionKey) throw new Error("Faltan credencial de provisionamiento o clave de cifrado en el entorno");
    const db = await createStore({ dataDir: `${config.dataDir}/postgres`, databaseUrl: config.databaseUrl });
    try {
      const memberships = await db.list<{ tenantId: string; role: string }>(owner, "user-tenants");
      if (!memberships.some((m) => m.tenantId === tenantId && (m.role === "owner" || m.role === "admin"))) {
        throw new Error("El usuario no tiene membership owner/admin explicita en esta empresa");
      }
      const scoped = new TenantScopedStore(db, async () => tenantId);
      const connection = await runInTenantScope({ tenantId, actorId: owner }, () => provisionWhatsAppConnection(scoped,
        { tenantId, owner, actorId: owner }, { baseUrl, instance, apiKey, enabled: args.get("enable") === "true", allowedRecipients }, config.encryptionKey!));
      process.stdout.write(JSON.stringify({ saved: true, tenantId, owner, provider: connection.provider, generation: connection.generation,
        enabled: connection.enabled, recipientsCount: connection.allowedRecipients.length }) + "\n");
    } finally { await db.close(); }
  }
}
