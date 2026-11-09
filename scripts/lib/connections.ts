// CONNECTIONS_REGISTRY_V1 - una sola tabla dice que necesita el repo, con que
// nombre lo publica Doppler y como se comprueba en vivo.
//
// El problema que resuelve: los nombres no coinciden. Doppler tiene
// WHATSAPP_ACCESS_TOKEN y el codigo lee WHATSAPP_TOKEN; tiene
// WHATSAPP_PHONE_NUMBER_ID y el codigo lee WHATSAPP_PHONE_ID. Sin una tabla que
// traduzca, cada secreto parece "ausente" aunque exista, y el operador acaba
// duplicando variables a mano en cada entorno.
//
// Regla: este fichero NOMBRA secretos, nunca los imprime. Las sondas devuelven
// un detalle sin valor sensible (nombre de la base, email de la cuenta, numero
// de telefonos) para que el informe sea util sin ser un volcado de credenciales.

import { Client } from "pg";

export type Requirement = "required-live" | "optional";

export interface ProbeContext {
  /** Primer valor no vacio de la lista de nombres, o undefined. */
  read: (...names: string[]) => string | undefined;
}

export interface ProbeResult {
  ok: boolean;
  detail: string;
}

export type Probe = (ctx: ProbeContext) => Promise<ProbeResult>;

export interface ConnectionSpec {
  id: string;
  label: string;
  /** Capacidad de producto a la que sirve: leads, voz, whatsapp, email... */
  feature: string;
  /** Nombres aceptados, en orden de preferencia. El primero es el documentado. */
  names: string[];
  need: Requirement;
  note: string;
  probe?: Probe;
}

const TIMEOUT_MS = 8_000;

async function httpJson(
  url: string,
  init: RequestInit & { headers?: Record<string, string> } = {},
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "error",
  });
  const text = await response.text().catch(() => "");
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* El detalle se recorta abajo; no es JSON. */
  }
  return { status: response.status, body };
}

function text(value: unknown, max = 160): string {
  const raw = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return raw.replace(/\s+/g, " ").slice(0, max);
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    // Un mensaje de fetch puede arrastrar la URL con la key en el query string.
    return error.message.replace(/([?&](?:key|token|apikey)=)[^&\s]+/gi, "$1***").slice(0, 160);
  }
  return "error desconocido";
}

// --- sondas ---------------------------------------------------------------

const database: Probe = async ({ read }) => {
  const connectionString = read("DATABASE_URL")!;
  const loopback = /@(localhost|127\.0\.0\.1|\[::1\])[:/]/.test(connectionString);
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: TIMEOUT_MS,
    ...(loopback ? {} : { ssl: { rejectUnauthorized: false } }),
  });
  try {
    await client.connect();
    const result = await client.query<{ database: string; version: string; tables: string }>(
      `select current_database() as database,
              version() as version,
              (select count(*) from information_schema.tables where table_schema = 'public')::text as tables`,
    );
    const row = result.rows[0];
    const server = (row?.version ?? "").split(" ").slice(0, 2).join(" ");
    return {
      ok: true,
      detail: `db=${row?.database ?? "?"} (${row?.tables ?? "0"} tablas) ${server}`,
    };
  } finally {
    await client.end().catch(() => {});
  }
};

const supabaseJwks: Probe = async ({ read }) => {
  const base = read("SUPABASE_URL")!.replace(/\/+$/, "");
  const { status, body } = await httpJson(`${base}/auth/v1/.well-known/jwks.json`, {
    headers: { apikey: read("SUPABASE_SECRET_KEY", "SUPABASE_ANON_KEY") ?? "" },
  });
  if (status !== 200) return { ok: false, detail: `jwks responde ${status}` };
  const keys = (body as { keys?: unknown[] } | null)?.keys;
  if (!Array.isArray(keys) || keys.length === 0)
    return { ok: false, detail: "jwks sin claves: la firma no se podria verificar" };
  return { ok: true, detail: `${keys.length} claves JWKS` };
};

const resend: Probe = async ({ read }) => {
  const { status, body } = await httpJson("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${read("RESEND_API_KEY")}` },
  });
  if (status !== 200) return { ok: false, detail: `api responde ${status}: ${text(body, 80)}` };
  const rows = (body as { data?: { name?: string; status?: string }[] } | null)?.data ?? [];
  const verified = rows.filter((row) => row.status === "verified").map((row) => row.name);
  return {
    ok: verified.length > 0,
    detail: verified.length
      ? `dominios verificados: ${verified.join(", ")}`
      : `${rows.length} dominios, ninguno verificado (no se puede enviar desde un dominio propio)`,
  };
};

const google: Probe = async ({ read }) => {
  const clientId = read("GOOGLE_CLIENT_ID")!;
  const clientSecret = read("GOOGLE_CLIENT_SECRET")!;
  const refreshToken = read("GOOGLE_REFRESH_TOKEN");
  const form = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    ...(refreshToken
      ? { grant_type: "refresh_token", refresh_token: refreshToken }
      : { grant_type: "authorization_code", code: "" }),
  });
  const token = await httpJson("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const access = (token.body as { access_token?: string } | null)?.access_token;
  if (!access) return { ok: false, detail: `token responde ${token.status}: ${text(token.body, 90)}` };
  const user = await httpJson("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${access}` },
  });
  const email = (user.body as { email?: string } | null)?.email;
  // GOOGLE_API_ENABLED_PROBE_V1 - el canje del token no prueba que el producto
  // funcione: con las APIs deshabilitadas en el proyecto, ese mismo token
  // responde 403 PERMISSION_DENIED en cada llamada y la sonda decia OK. Se
  // sondean las tres APIs que usa packages/integrations/src/google.ts para que
  // el verde signifique algo.
  const apis = [
    { name: "Gmail", url: "https://gmail.googleapis.com/gmail/v1/users/me/profile" },
    {
      name: "Calendar",
      url: "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1",
    },
    { name: "Drive", url: "https://www.googleapis.com/drive/v3/about?fields=user(displayName)" },
  ];
  const down: string[] = [];
  for (const api of apis) {
    const res = await httpJson(api.url, { headers: { Authorization: `Bearer ${access}` } });
    if (res.status === 200) continue;
    const message = (res.body as { error?: { message?: string } } | null)?.error?.message ?? "";
    down.push(`${api.name} ${res.status}${message ? ` (${message.slice(0, 80)})` : ""}`);
  }
  if (down.length > 0) return { ok: false, detail: `token valido, pero ${down.join("; ")}` };
  return {
    ok: true,
    detail: email
      ? `refresh_token valido para ${email}; Gmail/Calendar/Drive operativos`
      : "Gmail/Calendar/Drive operativos",
  };
};

function graphVersion(read: ProbeContext["read"]): string {
  return read("WHATSAPP_GRAPH_VERSION")?.trim() || "v21.0";
}

const whatsapp: Probe = async ({ read }) => {
  const phoneId = read("WHATSAPP_PHONE_ID")!;
  const { status, body } = await httpJson(
    `https://graph.facebook.com/${graphVersion(read)}/${encodeURIComponent(phoneId)}` +
      "?fields=display_phone_number,verified_name,quality_rating",
    { headers: { Authorization: `Bearer ${read("WHATSAPP_TOKEN")}` } },
  );
  if (status !== 200) return { ok: false, detail: `graph responde ${status}: ${text(body, 90)}` };
  const row = body as { display_phone_number?: string; verified_name?: string };
  return {
    ok: true,
    detail: `${row.verified_name ?? "sin nombre"} ${row.display_phone_number ?? "?"}`,
  };
};

const vapi: Probe = async ({ read }) => {
  const { status, body } = await httpJson("https://api.vapi.ai/assistant?limit=100", {
    headers: { Authorization: `Bearer ${read("VAPI_API_KEY")}` },
  });
  if (status !== 200) return { ok: false, detail: `api responde ${status}: ${text(body, 90)}` };
  const rows = Array.isArray(body) ? body : [];
  const wanted = read("VAPI_ASSISTANT_ID");
  const found = wanted ? rows.some((row) => (row as { id?: string }).id === wanted) : true;
  return {
    ok: found,
    detail: found
      ? `${rows.length} asistentes${wanted ? ", VAPI_ASSISTANT_ID presente" : " (falta VAPI_ASSISTANT_ID)"}`
      : `VAPI_ASSISTANT_ID no existe en la cuenta (${rows.length} asistentes)`,
  };
};

const elevenlabs: Probe = async ({ read }) => {
  const { status, body } = await httpJson("https://api.elevenlabs.io/v1/user/subscription", {
    headers: { "xi-api-key": read("ELEVENLABS_API_KEY")! },
  });
  if (status !== 200) return { ok: false, detail: `api responde ${status}: ${text(body, 90)}` };
  const row = body as { character_count?: number; character_limit?: number; tier?: string };
  return {
    ok: true,
    detail: `${row.tier ?? "?"}: ${row.character_count ?? 0}/${row.character_limit ?? 0} caracteres`,
  };
};

const apify: Probe = async ({ read }) => {
  const { status, body } = await httpJson(
    `https://api.apify.com/v2/users/me?token=${encodeURIComponent(read("APIFY_TOKEN")!)}`,
  );
  if (status !== 200) return { ok: false, detail: `api responde ${status}: ${text(body, 90)}` };
  const user = (body as { data?: { username?: string; plan?: { id?: string } } } | null)?.data;
  return { ok: true, detail: `${user?.username ?? "?"} (plan ${user?.plan?.id ?? "?"})` };
};

const maps: Probe = async ({ read }) => {
  const { status, body } = await httpJson(
    "https://maps.googleapis.com/maps/api/geocode/json?address=Madrid&region=es&key=" +
      encodeURIComponent(read("GOOGLE_MAPS_API_KEY")!),
  );
  const row = body as { status?: string; error_message?: string } | null;
  if (status !== 200 || row?.status !== "OK")
    return { ok: false, detail: `${row?.status ?? status}: ${text(row?.error_message ?? body, 90)}` };
  return { ok: true, detail: "geocoding operativo" };
};

const gemini: Probe = async ({ read }) => {
  const key = read("GEMINI_API_KEY", "GOOGLE_API_KEY")!;
  const { status, body } = await httpJson(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
  );
  if (status !== 200) return { ok: false, detail: `api responde ${status}: ${text(body, 90)}` };
  const models = (body as { models?: unknown[] } | null)?.models ?? [];
  return { ok: true, detail: `${models.length} modelos disponibles` };
};

const openrouter: Probe = async ({ read }) => {
  const { status, body } = await httpJson("https://openrouter.ai/api/v1/key", {
    headers: { Authorization: `Bearer ${read("OPENROUTER_API_KEY")}` },
  });
  if (status !== 200) return { ok: false, detail: `api responde ${status}: ${text(body, 90)}` };
  const row = (body as { data?: { limit?: number | null; usage?: number } } | null)?.data;
  return {
    ok: true,
    detail: `uso ${row?.usage ?? 0}${row?.limit ? ` / limite ${row.limit}` : " (sin limite)"}`,
  };
};

const openai: Probe = async ({ read }) => {
  const base = (read("OPENAI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/+$/, "");
  const { status, body } = await httpJson(`${base}/models`, {
    headers: { Authorization: `Bearer ${read("OPENAI_API_KEY")}` },
  });
  if (status !== 200) return { ok: false, detail: `api responde ${status}: ${text(body, 90)}` };
  const models = (body as { data?: unknown[] } | null)?.data ?? [];
  return { ok: true, detail: `${models.length} modelos en ${new URL(base).host}` };
};

const stripe: Probe = async ({ read }) => {
  const { status, body } = await httpJson("https://api.stripe.com/v1/balance", {
    headers: { Authorization: `Bearer ${read("STRIPE_API_KEY")}` },
  });
  if (status !== 200) return { ok: false, detail: `api responde ${status}: ${text(body, 90)}` };
  const row = body as { livemode?: boolean; available?: { currency?: string }[] };
  const currency = row.available?.[0]?.currency;
  return { ok: true, detail: `${row.livemode ? "live" : "test"} ${currency ?? ""}`.trim() };
};

const cloudflare: Probe = async ({ read }) => {
  const { status, body } = await httpJson("https://api.cloudflare.com/client/v4/user/tokens/verify", {
    headers: { Authorization: `Bearer ${read("CLOUDFLARE_API_TOKEN")}` },
  });
  const ok = (body as { success?: boolean } | null)?.success === true;
  return ok
    ? { ok: true, detail: `token valido, cuenta ${read("CLOUDFLARE_ACCOUNT_ID") ?? "sin id"}` }
    : { ok: false, detail: `api responde ${status}: ${text(body, 90)}` };
};

const fly: Probe = async ({ read }) => {
  const app = read("FLY_APP_NAME");
  if (!app) return { ok: true, detail: "token presente, FLY_APP_NAME sin definir" };
  const { status, body } = await httpJson(`https://api.machines.dev/v1/apps/${encodeURIComponent(app)}`, {
    headers: { Authorization: `Bearer ${read("FLY_API_TOKEN")}` },
  });
  if (status !== 200) return { ok: false, detail: `api responde ${status}: ${text(body, 90)}` };
  return { ok: true, detail: `app ${(body as { name?: string } | null)?.name ?? app}` };
};

const vercel: Probe = async ({ read }) => {
  const { status, body } = await httpJson("https://api.vercel.com/v2/user", {
    headers: { Authorization: `Bearer ${read("VERCEL_TOKEN")}` },
  });
  if (status !== 200) return { ok: false, detail: `api responde ${status}: ${text(body, 90)}` };
  const user = (body as { user?: { username?: string } } | null)?.user;
  return { ok: true, detail: `cuenta ${user?.username ?? "?"}` };
};

const grafana: Probe = async ({ read }) => {
  const base = read("GRAFANA_URL")!.replace(/\/+$/, "");
  const { status, body } = await httpJson(`${base}/api/health`);
  if (status !== 200) return { ok: false, detail: `health responde ${status}` };
  return { ok: true, detail: `version ${(body as { version?: string } | null)?.version ?? "?"}` };
};

const sentryShape: Probe = async ({ read }) => {
  const dsn = read("SENTRY_DSN")!;
  const parsed = new URL(dsn);
  return {
    ok: Boolean(parsed.host && parsed.username && parsed.pathname.length > 1),
    detail: `dsn para ${parsed.host}`,
  };
};

// --- la tabla -------------------------------------------------------------

export const CONNECTIONS: ConnectionSpec[] = [
  // base de datos y nucleo
  {
    id: "database",
    label: "Postgres durable",
    feature: "core",
    names: ["DATABASE_URL"],
    need: "required-live",
    note: "Sin ella cae a PGlite embebido: un solo proceso y se corrompe al matar el frontend.",
    probe: database,
  },
  {
    id: "business-db",
    label: "Postgres de negocio (read-only)",
    feature: "core",
    names: ["BUSINESS_DATABASE_URL"],
    need: "optional",
    note: "query_business de las SOPs. Sin ella las consultas leen la base de la app con rol de escritura.",
  },
  {
    id: "public-url",
    label: "Origen publico del API",
    feature: "core",
    names: ["PUBLIC_API_URL"],
    need: "required-live",
    note: "De aqui se derivan el redirect de Google y los enlaces de verificacion.",
  },
  {
    id: "token-encryption",
    label: "Clave de cifrado de credenciales",
    feature: "core",
    names: ["TOKEN_ENCRYPTION_KEY"],
    need: "required-live",
    note: "32 bytes base64. Sin ella Google no puede guardar tokens y los endpoints dan 503.",
  },
  {
    id: "access-key",
    label: "Clave de acceso del API",
    feature: "core",
    names: ["AGENTE_ACCESS_KEY"],
    need: "required-live",
    note: ">=24 caracteres; live no arranca sin ella.",
  },
  {
    id: "cors",
    label: "Origenes permitidos del panel",
    feature: "core",
    names: ["ALLOWED_ORIGINS"],
    need: "required-live",
    note: "CSV de origenes con credenciales (el panel en otro host).",
  },

  // auth multitenant
  {
    id: "auth-provider",
    label: "Proveedor de auth",
    feature: "auth",
    names: ["AUTH_PROVIDER"],
    need: "required-live",
    note: "supabase activa verificacion de firma y tenant por claim; session es el modo local.",
  },
  {
    id: "supabase-url",
    label: "Supabase (JWKS del JWT)",
    feature: "auth",
    names: ["SUPABASE_URL"],
    need: "required-live",
    note: "Con AUTH_PROVIDER=supabase la firma se verifica contra esta JWKS.",
    probe: supabaseJwks,
  },
  {
    id: "supabase-jwt",
    label: "Supabase JWT secret (solo HS256)",
    feature: "auth",
    names: ["SUPABASE_JWT_SECRET"],
    need: "optional",
    note: "Solo si el proyecto firma HS256; con JWKS no hace falta.",
  },

  // modelos
  {
    id: "model",
    label: "Modelo primario",
    feature: "llm",
    names: ["MODEL"],
    need: "required-live",
    note: "'<provider>/<modelo>'. Sin el, el chat arranca sin motor.",
  },
  {
    id: "gemini",
    label: "Google Gemini",
    feature: "llm",
    names: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
    need: "optional",
    note: "Proveedor google/ (primario por defecto).",
    probe: gemini,
  },
  {
    id: "openrouter",
    label: "OpenRouter (fallback)",
    feature: "llm",
    names: ["OPENROUTER_API_KEY"],
    need: "optional",
    note: "Fallback OpenAI-compatible y modelos gratuitos.",
    probe: openrouter,
  },
  {
    id: "openai",
    label: "OpenAI o gateway compatible",
    feature: "llm",
    names: ["OPENAI_API_KEY"],
    need: "optional",
    note: "Alternativa nativa al fallback de OpenRouter.",
    probe: openai,
  },
  {
    id: "fast-llm",
    label: "LLM rapido (kernel)",
    feature: "llm",
    names: ["FAST_LLM_API_KEY"],
    need: "optional",
    note: "Cuota separada del chat. Sin ella el kernel cae a la cadena global.",
  },
  {
    id: "slow-llm",
    label: "LLM lento (kernel)",
    feature: "llm",
    names: ["SLOW_LLM_API_KEY"],
    need: "optional",
    note: "Cuota separada del razonamiento en background.",
  },
  {
    id: "embeddings",
    label: "Embeddings (RAG)",
    feature: "llm",
    names: ["EMBEDDINGS_LLM_API_KEY"],
    need: "optional",
    note: "Sin ella RAG usa la key rapida.",
  },

  // email
  {
    id: "resend",
    label: "Email transaccional (Resend)",
    feature: "email",
    names: ["RESEND_API_KEY"],
    need: "required-live",
    note: "Verificacion de cuenta, notificaciones y cold approach.",
    probe: resend,
  },
  {
    id: "email-from",
    label: "Remitente por defecto",
    feature: "email",
    names: ["EMAIL_FROM", "RESEND_FROM"],
    need: "optional",
    note: "Debe pertenecer a un dominio verificado en Resend.",
  },

  // google
  {
    id: "google-oauth",
    label: "Google OAuth (Gmail/Calendar/Drive)",
    feature: "google",
    names: ["GOOGLE_CLIENT_ID"],
    need: "optional",
    // GOOGLE_TWO_REDIRECTS_V1 - hay dos vueltas distintas y las dos tienen que
    // estar en el cliente OAuth; registrar solo una deja el otro flujo roto.
    note: "Dos redirects a registrar tal cual: PUBLIC_API_URL + /api/google/callback (integraciones) y PUBLIC_API_URL + /api/auth/oauth/google/callback (login del panel).",
    probe: google,
  },
  {
    id: "google-refresh",
    label: "Google refresh token de servicio",
    feature: "google",
    names: ["GOOGLE_REFRESH_TOKEN"],
    need: "optional",
    note: "Cuenta de servicio para dogfooding sin pasar por el consentimiento del panel.",
  },
  {
    id: "google-maps",
    label: "Google Maps (leads locales)",
    feature: "leads",
    names: ["GOOGLE_MAPS_API_KEY"],
    need: "optional",
    note: "Busqueda de negocios para la campana de leads.",
    probe: maps,
  },

  // whatsapp
  {
    id: "whatsapp-token",
    label: "WhatsApp Cloud API token",
    feature: "whatsapp",
    names: ["WHATSAPP_TOKEN", "WHATSAPP_ACCESS_TOKEN"],
    need: "optional",
    note: "Doppler lo publica como WHATSAPP_ACCESS_TOKEN; el repo lo lee como WHATSAPP_TOKEN.",
    probe: whatsapp,
  },
  {
    id: "whatsapp-phone",
    label: "WhatsApp phone number id",
    feature: "whatsapp",
    names: ["WHATSAPP_PHONE_ID", "WHATSAPP_PHONE_NUMBER_ID"],
    need: "optional",
    note: "Doppler lo publica como WHATSAPP_PHONE_NUMBER_ID.",
  },
  {
    id: "whatsapp-waba",
    label: "WhatsApp business account id",
    feature: "whatsapp",
    names: ["WHATSAPP_BUSINESS_ACCOUNT_ID", "WHATSAPP_WABA_ID"],
    need: "optional",
    note: "Necesario para plantillas y suscripcion del webhook.",
  },
  {
    id: "whatsapp-verify",
    label: "WhatsApp verify token del webhook",
    feature: "whatsapp",
    names: ["WHATSAPP_VERIFY_TOKEN"],
    need: "optional",
    note: "Sin el, Meta no completa el handshake y el numero no queda suscrito.",
  },
  {
    id: "whatsapp-app-secret",
    label: "WhatsApp app secret (firma del webhook)",
    feature: "whatsapp",
    names: ["WHATSAPP_APP_SECRET"],
    need: "optional",
    note: "Sin el no se puede validar X-Hub-Signature-256: cualquiera podria inyectar mensajes.",
  },

  // voz
  {
    id: "vapi",
    label: "Vapi (voz)",
    feature: "voice",
    names: ["VAPI_API_KEY"],
    need: "optional",
    note: "Agente que atiende llamadas; sin key el adaptador responde 503.",
    probe: vapi,
  },
  {
    id: "vapi-assistant",
    label: "Vapi assistant id",
    feature: "voice",
    names: ["VAPI_ASSISTANT_ID"],
    need: "optional",
    note: "Asistente concreto que contesta. No viene en el entorno de Doppler.",
  },
  {
    id: "elevenlabs",
    label: "ElevenLabs (voz sintetica)",
    feature: "voice",
    names: ["ELEVENLABS_API_KEY"],
    need: "optional",
    note: "Voces para el agente de telefono cuando no se usa la voz nativa de Vapi.",
    probe: elevenlabs,
  },

  // leads
  {
    id: "apify",
    label: "Apify (scraping de leads)",
    feature: "leads",
    names: ["APIFY_TOKEN"],
    need: "optional",
    note: "Actores para enriquecer y descubrir negocios.",
    probe: apify,
  },
  {
    id: "composio",
    label: "Composio (herramientas de terceros)",
    feature: "leads",
    names: ["COMPOSIO_API_KEY"],
    need: "optional",
    note: "Conectores gestionados para el agente comercial.",
  },

  // cobros
  {
    id: "stripe",
    label: "Stripe",
    feature: "billing",
    names: ["STRIPE_API_KEY"],
    need: "optional",
    note: "Sin key los endpoints de facturacion responden con el stub honesto.",
    probe: stripe,
  },
  {
    id: "stripe-webhook",
    label: "Stripe webhook secret",
    feature: "billing",
    names: ["STRIPE_WEBHOOK_SECRET"],
    need: "optional",
    note: "Sin el no se pueden verificar los eventos de cobro.",
  },

  // observabilidad y despliegue
  {
    id: "sentry",
    label: "Sentry",
    feature: "observability",
    names: ["SENTRY_DSN"],
    need: "optional",
    note: "Errores del API y del worker.",
    probe: sentryShape,
  },
  {
    id: "grafana",
    label: "Grafana",
    feature: "observability",
    names: ["GRAFANA_URL"],
    need: "optional",
    note: "Dashboards de metricas.",
    probe: grafana,
  },
  {
    id: "cloudflare",
    label: "Cloudflare",
    feature: "deploy",
    names: ["CLOUDFLARE_API_TOKEN"],
    need: "optional",
    note: "DNS, tunnel o Workers del dominio de la agencia.",
    probe: cloudflare,
  },
  {
    id: "fly",
    label: "Fly.io",
    feature: "deploy",
    names: ["FLY_API_TOKEN"],
    need: "optional",
    note: "Host del API y del worker.",
    probe: fly,
  },
  {
    id: "vercel",
    label: "Vercel",
    feature: "deploy",
    names: ["VERCEL_TOKEN"],
    need: "optional",
    note: "Host del panel web.",
    probe: vercel,
  },
  {
    id: "github-oauth",
    label: "GitHub OAuth",
    feature: "deploy",
    names: ["GITHUB_CLIENT_ID"],
    need: "optional",
    note: "Login de desarrolladores y automatizaciones.",
  },
];

export interface Resolution {
  spec: ConnectionSpec;
  /** Nombre que gano, o null si ninguno tiene valor. */
  source: string | null;
  value?: string;
}

export function resolveAll(env: NodeJS.ProcessEnv = process.env): Resolution[] {
  return CONNECTIONS.map((spec) => {
    for (const name of spec.names) {
      const value = env[name]?.trim();
      if (value) return { spec, source: name, value };
    }
    return { spec, source: null };
  });
}

export function resolveOne(
  spec: ConnectionSpec,
  env: NodeJS.ProcessEnv = process.env,
): Resolution {
  return resolveAll(env).find((row) => row.spec.id === spec.id)!;
}

/** Primer valor no vacio de una lista, sin exponerlo. */
export function envReader(env: NodeJS.ProcessEnv = process.env) {
  return (...names: string[]): string | undefined => {
    for (const name of names) {
      const value = env[name]?.trim();
      if (value) return value;
    }
    return undefined;
  };
}

export function describeProbeError(error: unknown): string {
  return describeError(error);
}
