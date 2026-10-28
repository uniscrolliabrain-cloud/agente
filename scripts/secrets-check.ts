// SECRETS_CHECK_V1 - auditoria del contrato de secretos.
//
// Doppler inyecta el entorno en el proceso; este script no lee Doppler ni
// escribe nada: comprueba que lo que la app necesita para arrancar en un modo
// concreto esta presente, y dice exactamente que falta y para que sirve.
//
// Uso:
//   pnpm secrets:check                 # usa WORKSPACE_MODE o "sample"
//   pnpm secrets:check --mode=live
//   pnpm secrets:check --only=auth,llm
//
// Sale con codigo 1 si falta algo obligatorio: es un gate de despliegue, no un
// informe. Los opcionales se listan marcados como tal y nunca hacen fallar.
type Mode = "sample" | "live";

interface Secret {
  name: string;
  /** Obligatorio en live / en sample / opcional hasta que exista la campana. */
  need: "live" | "always" | "optional";
  group: string;
  note: string;
}

const SECRETS: Secret[] = [
  // --- nucleo -------------------------------------------------------------
  { name: "DATABASE_URL", need: "live", group: "core", note: "Postgres durable (Neon). Sin esto cae a PGlite y las DB se corrompen al cortar el proceso" },
  { name: "PUBLIC_API_URL", need: "live", group: "core", note: "origen publico del API; de aqui se deriva el redirect de Google" },
  { name: "TOKEN_ENCRYPTION_KEY", need: "live", group: "core", note: "32 bytes base64; cifra los tokens OAuth de Google en reposo" },
  { name: "OPENMUSE_ACCESS_KEY", need: "live", group: "core", note: ">=24 chars; live mode no arranca sin ella" },
  { name: "ALLOWED_ORIGINS", need: "live", group: "core", note: "CSV de origenes del panel (https://www.agntiapro.io)" },
  { name: "AUTH_PROVIDER", need: "live", group: "auth", note: "debe ser supabase para el modo multitenant con JWT" },
  { name: "DATA_DIR", need: "optional", group: "core", note: "directorio de datos (PGlite/backups); en Fly debe ser /data" },
  { name: "BUSINESS_DATABASE_URL", need: "optional", group: "core", note: "base + rol read-only para query_business de las SOPs; sin ella las consultas corren contra la principal" },
  { name: "OPENMUSE_PROCESS_ROLE", need: "optional", group: "core", note: "all | api | worker; en Fly se separan en dos apps" },
  { name: "BACKUP_INTERVAL_HOURS", need: "optional", group: "core", note: "0 desactiva los backups automaticos" },

  // --- auth ---------------------------------------------------------------
  { name: "SUPABASE_URL", need: "live", group: "auth", note: "habilita la JWKS RS256/ES256 (https://<ref>.supabase.co)" },
  { name: "SUPABASE_JWT_SECRET", need: "optional", group: "auth", note: "solo si el proyecto firma con HS256; con JWKS no hace falta" },
  { name: "SUPABASE_JWT_AUD", need: "optional", group: "auth", note: "default 'authenticated'" },
  // En sample se entra con /api/session (local-user), asi que el primer admin
  // solo es obligatorio en live.
  { name: "ADMIN_EMAIL", need: "live", group: "bootstrap", note: "primer admin (si no, no hay quien entre al panel)" },
  { name: "ADMIN_PASSWORD", need: "live", group: "bootstrap", note: ">=8 chars; cambiala tras el primer login" },

  // --- modelos ------------------------------------------------------------
  { name: "MODEL", need: "live", group: "llm", note: "'<provider>/<modelo>', p.ej. openai/gpt-4.1-mini" },
  { name: "OPENAI_API_KEY", need: "optional", group: "llm", note: "proveedor principal si MODEL empieza por openai/" },
  { name: "GEMINI_API_KEY", need: "optional", group: "llm", note: "proveedor google/" },
  { name: "OPENROUTER_API_KEY", need: "optional", group: "llm", note: "fallback OpenAI-compatible; tambien permite modelos gratuitos" },
  { name: "MODEL_FALLBACK", need: "optional", group: "llm", note: "segunda oportunidad cuando el primario falla antes de emitir texto" },

  // --- kernel de dos velocidades ------------------------------------------
  // env-resolver.ts lee estas para el chat (fast) y las tareas (slow); sin ellas
  // el kernel cae a la cadena global y las dos velocidades comparten cuota.
  { name: "FAST_LLM_API_KEY", need: "optional", group: "kernel", note: "key de la velocidad 'habla el usuario'; ideal una cuota aparte de la slow" },
  { name: "SLOW_LLM_API_KEY", need: "optional", group: "kernel", note: "key de la velocidad 'razona en background'" },
  { name: "EMBEDDINGS_LLM_API_KEY", need: "optional", group: "kernel", note: "embeddings de RAG; si falta usa la fast" },
  { name: "WORKER_TOKEN", need: "optional", group: "worker", note: ">=32 chars; browser worker local" },
  { name: "BROWSER_WORKER_URL", need: "optional", group: "worker", note: "debe ser loopback si el worker corre en el host" },

  // --- canales (campanas siguientes) --------------------------------------
  { name: "GOOGLE_CLIENT_ID", need: "optional", group: "google", note: "Gmail/Calendar/Drive" },
  { name: "GOOGLE_CLIENT_SECRET", need: "optional", group: "google", note: "Gmail/Calendar/Drive" },
  { name: "RESEND_API_KEY", need: "optional", group: "email", note: "email transaccional y cold approach (campana canales)" },
  { name: "WHATSAPP_TOKEN", need: "optional", group: "whatsapp", note: "token de envio Cloud API; no autentica mensajes entrantes" },
  { name: "WHATSAPP_VERIFY_TOKEN", need: "optional", group: "whatsapp", note: "handshake del webhook" },
  { name: "WHATSAPP_APP_SECRET", need: "optional", group: "whatsapp", note: "firma X-Hub-Signature-256 del webhook" },
  { name: "WHATSAPP_PHONE_ID", need: "optional", group: "whatsapp", note: "phone number id del numero de la agencia" },
  { name: "WHATSAPP_WEBHOOK_BINDINGS", need: "optional", group: "whatsapp", note: "JSON de canales, tenant, responsable primario y SOP; obligatorio para admitir mensajes" },
  { name: "VAPI_API_KEY", need: "optional", group: "vapi", note: "agente de voz; sin key el adaptador responde 503" },
  { name: "VAPI_ASSISTANT_ID", need: "optional", group: "vapi", note: "asistente que atiende llamadas" },
  { name: "STRIPE_API_KEY", need: "optional", group: "stripe", note: "cobros de la agencia" },
  { name: "STRIPE_WEBHOOK_SECRET", need: "optional", group: "stripe", note: "verificacion de eventos de cobro" },
  { name: "GOOGLE_MAPS_API_KEY", need: "optional", group: "leads", note: "busqueda de negocios locales para leads" },
];

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value] as const;
  }),
);

// No se usa readConfig(): en live lanza si faltan claves, y este script existe
// justo para decir CUALES faltan. Se lee el entorno en crudo.
const mode: Mode =
  (args.get("mode") ?? process.env.WORKSPACE_MODE ?? "sample").trim() === "live"
    ? "live"
    : "sample";
const authProvider = (process.env.AUTH_PROVIDER ?? "session").trim();
const only = args.get("only")
  ? new Set(args.get("only")!.split(",").map((g) => g.trim()).filter(Boolean))
  : null;

function present(name: string): string | null {
  const raw = process.env[name];
  if (raw === undefined) return null;
  const value = raw.trim();
  return value.length > 0 ? value : null;
}

function requiredIn(secret: Secret): boolean {
  if (secret.need === "always") return true;
  if (secret.need === "live") return mode === "live";
  return false;
}

const rows: { ok: boolean; line: string }[] = [];
let missingRequired = 0;

for (const secret of SECRETS) {
  if (only && !only.has(secret.group)) continue;
  const value = present(secret.name);
  const required = requiredIn(secret);
  const ok = Boolean(value);
  if (!ok && required) missingRequired += 1;
  const tag = ok ? "OK  " : required ? "FALTA" : "opcional";
  // Nunca se imprime el valor: solo si existe y su longitud.
  const detail = ok ? `${value!.length} chars` : secret.note;
  rows.push({ ok, line: `${tag.padEnd(8)} ${secret.name.padEnd(26)} ${secret.group.padEnd(10)} ${detail}` });
}

// --- coherencias entre variables (lo que ningun check por variable ve) -----
const coherence: string[] = [];
if (authProvider === "supabase") {
  if (!present("SUPABASE_URL") && !present("SUPABASE_JWT_SECRET")) {
    coherence.push(
      "AUTH_PROVIDER=supabase sin SUPABASE_URL ni SUPABASE_JWT_SECRET: todo /api/* responde 503 (fail-closed).",
    );
  }
}
if (present("OPENMUSE_ACCESS_KEY") && present("OPENMUSE_ACCESS_KEY")!.length < 24) {
  coherence.push("OPENMUSE_ACCESS_KEY tiene menos de 24 caracteres: live mode no arranca.");
}
if (present("DATABASE_URL") && !present("BUSINESS_DATABASE_URL")) {
  coherence.push(
    "Sin BUSINESS_DATABASE_URL: query_business de las SOPs leera con el rol de escritura de la base principal.",
  );
}
if (present("DATABASE_URL") && present("BUSINESS_DATABASE_URL")) {
  const main = present("DATABASE_URL")!;
  const business = present("BUSINESS_DATABASE_URL")!;
  if (main === business) {
    coherence.push(
      "DATABASE_URL y BUSINESS_DATABASE_URL son la misma: el query_business de las SOPs leeria todas las filas de todos los owners. Usa una base y un rol read-only aparte.",
    );
  }
}
const googleId = present("GOOGLE_CLIENT_ID");
const googleSecret = present("GOOGLE_CLIENT_SECRET");
if (Boolean(googleId) !== Boolean(googleSecret)) {
  coherence.push("GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET deben ir juntas o ninguna.");
}
if (present("WHATSAPP_TOKEN") && !present("WHATSAPP_APP_SECRET")) {
  coherence.push(
    "WHATSAPP_TOKEN sin WHATSAPP_APP_SECRET: el webhook no podria verificar X-Hub-Signature-256 y cualquiera podria inyectar mensajes.",
  );
}
if (present("WHATSAPP_APP_SECRET") && !present("WHATSAPP_VERIFY_TOKEN")) {
  coherence.push(
    "WHATSAPP_APP_SECRET sin WHATSAPP_VERIFY_TOKEN: Meta no podria completar el handshake del webhook y el numero no quedaria suscrito.",
  );
}
// MODEL es "<provider>/<modelo>": sin la key de ese proveedor el motor arranca
// vacio y el chat no responde. Nadie relacionaba una variable con la otra.
const modelSpec = present("MODEL") ?? "";
const modelProvider = modelSpec.split("/")[0]?.trim().toLowerCase() ?? "";
const gatewayKey = present("OPENROUTER_API_KEY") ?? present("OPENAI_API_KEY");
if (modelProvider === "google" && !present("GEMINI_API_KEY") && !gatewayKey) {
  coherence.push(
    `MODEL=${modelSpec} sin GEMINI_API_KEY ni pasarela OpenAI-compatible: el chat arranca sin motor.`,
  );
}
if (modelProvider && modelProvider !== "google" && !gatewayKey) {
  coherence.push(
    `MODEL=${modelSpec} sin OPENAI_API_KEY ni OPENROUTER_API_KEY: el chat arranca sin motor.`,
  );
}
// The API destination is not necessarily the browser's Origin. Validate the URL
// without claiming a split-origin panel must include the API origin in CORS.
const publicApiUrl = present("PUBLIC_API_URL");
if (mode === "live" && publicApiUrl) {
  try {
    new URL(publicApiUrl);
  } catch {
    coherence.push(`PUBLIC_API_URL no es una URL valida: ${publicApiUrl}`);
  }
}

console.log(`\n[secrets:check] modo=${mode}${only ? ` grupos=${[...only].join(",")}` : ""}`);
console.log("[secrets:check] (Doppler inyecta el entorno; este script no imprime valores)\n");
for (const row of rows) console.log(row.line);
if (coherence.length > 0) {
  console.log("\n[secrets:check] incoherencias:");
  for (const line of coherence) console.log(`  - ${line}`);
}
console.log(
  `\n[secrets:check] ${missingRequired === 0 ? "contrato cumplido" : `${missingRequired} obligatorias ausentes`}`,
);
// Una incoherencia no bloquea el arranque local, pero si el contrato obligatorio.
process.exit(missingRequired > 0 ? 1 : 0);
