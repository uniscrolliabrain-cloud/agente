import { existsSync } from "node:fs";
import { resolve } from "node:path";

if (existsSync(".env")) process.loadEnvFile(".env");
process.env.DO_NOT_TRACK ??= "1";
process.env.COPILOTKIT_TELEMETRY_DISABLED ??= "true";

// The CopilotKit runtime resolves "google/…" models from GOOGLE_API_KEY and every
// OpenAI-compatible endpoint from OPENAI_API_KEY plus OPENAI_BASE_URL. Aliasing here keeps a
// single source of truth for the provider keys, so GEMINI_API_KEY and OPENROUTER_API_KEY are
// enough on their own and existing OPENAI_*/GOOGLE_* values always win.
const blank = (value?: string) => !value?.trim();
if (blank(process.env.GOOGLE_API_KEY) && !blank(process.env.GEMINI_API_KEY))
  process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY?.trim();
if (blank(process.env.OPENAI_API_KEY) && !blank(process.env.OPENROUTER_API_KEY)) {
  process.env.OPENAI_API_KEY = process.env.OPENROUTER_API_KEY?.trim();
  process.env.OPENAI_BASE_URL ??= "https://openrouter.ai/api/v1";
}

export interface Config {
  mode: "sample" | "live";
  port: number;
  host: string;
  publicUrl: string;
  dataDir: string;
  databaseUrl?: string;
  /**
   * DSN separado y de solo lectura para las consultas `query_business` de los SOPs. Si no se
   * define, se usa DATABASE_URL, que tambien guarda los datos de la propia app: por eso el
   * requisito de GRANT SELECT con un rol propio esta documentado en README/.env.example.
   */
  businessDatabaseUrl?: string;
  accessKey?: string;
  encryptionKey?: string;
  model?: string;
  modelFallback?: string;
  agentBackend: "sample" | "model" | "agui";
  agentUrl?: string;
  agentToken?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleRedirectUri: string;
  workerUrl?: string;
  workerToken?: string;
  taskWorkerEnabled?: boolean;
  computerEnabled?: boolean;
  computerImage?: string;
  computerDeploymentId?: string;
  whatsappApiKey?: string;
  whatsappBaseUrl?: string;
  whatsappInstance?: string;
  stripeApiKey?: string;
  backupIntervalHours?: number;
  backupRetentionDays?: number;
  // QUOTA_PER_SPEED_V1 - cuotas separadas por velocidad.
  quotaPerSpeed?: {
    fastCallsPerHour: number;
    slowCallsPerHour: number;
  };
  /** DEFERRED_ACTION_CONFIG_V1 — configuración de undo diferido.
   *  Ver: docs/audits/06-aprobaciones-acciones/miniaudit.md. */
  deferredAction?: {
    /** ms de ventana para deshacer una aprobación. Default 8000. */
    windowMs: number;
    /** Importe a partir del cual se exige doble firma. null = nunca. */
    dualAt: number | null;
  };
  /** TIMEOUTS_CONFIG_V1 — timeouts configurables por tool.
   *  Ver: docs/audits/03-resiliencia/miniaudit.md ("Timeouts inconsistentes"). */
  toolTimeouts?: {
    llmFirstByteMs: number;
    llmGlobalMs: number;
    googleHttpMs: number;
    computerCommandMs: number;
    computerClientMs: number;
    whatsappSendMs: number;
    stripeHttpMs: number;
    browserNavMs: number;
  };
  allowedOrigins: string[];
}

export function required(name: string, message: string, value = process.env[name]): string {
  if (!value?.trim()) throw new Error(message);
  return value.trim();
}

/** Primary model specifier: explicit MODEL, else GEMINI_MODEL served as "google/<model>". */
function readModel(): string | undefined {
  const explicit = process.env.MODEL?.trim();
  if (explicit) return explicit;
  const gemini = process.env.GEMINI_MODEL?.trim();
  return gemini ? `google/${gemini.replace(/^google\//, "")}` : undefined;
}

/**
 * Fallback model specifier: explicit MODEL_FALLBACK, else OPENROUTER_MODEL reached through the
 * OpenAI-compatible OpenRouter endpoint that the runtime builds from OPENAI_BASE_URL.
 */
function readModelFallback(): string | undefined {
  const explicit = process.env.MODEL_FALLBACK?.trim();
  if (explicit) return explicit;
  if (!process.env.OPENROUTER_API_KEY?.trim()) return undefined;
  const model = process.env.OPENROUTER_MODEL?.trim() || "google/gemini-3.6-flash";
  return `openai/${model}`;
}

export function readConfig(): Config {
  const mode = process.env.WORKSPACE_MODE ?? "sample";
  if (mode !== "sample" && mode !== "live")
    throw new Error("WORKSPACE_MODE must be sample or live");
  const backend = process.env.AGENT_BACKEND ?? (mode === "sample" ? "sample" : "model");
  if (backend !== "sample" && backend !== "model" && backend !== "agui")
    throw new Error("AGENT_BACKEND must be sample, model or agui");
  if (mode === "live" && backend === "sample")
    throw new Error("Live workspaces cannot use the sample agent");
  // PORT_VALIDATED — NaN en serve() da un error confuso. Fallamos temprano.
  const port = Number(process.env.PORT ?? 8787);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error(`PORT must be an integer from 1 to 65535; got "${process.env.PORT}"`);
  const publicUrl = process.env.PUBLIC_API_URL ?? `http://localhost:${port}`;
  const config: Config = {
    mode,
    port,
    host: process.env.HOST ?? "127.0.0.1",
    publicUrl,
    dataDir: resolve(process.env.DATA_DIR ?? ".openmuse"),
    databaseUrl: process.env.DATABASE_URL,
    // `||` y no `??`: al copiar .env.example la variable viene vacia y debe caer a
    // DATABASE_URL igual que si no estuviera.
    businessDatabaseUrl: process.env.BUSINESS_DATABASE_URL?.trim() || process.env.DATABASE_URL,
    accessKey: process.env.OPENMUSE_ACCESS_KEY,
    encryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
    model: readModel(),
    modelFallback: readModelFallback(),
    agentBackend: backend,
    agentUrl: process.env.AGENT_URL,
    agentToken: process.env.AGENT_TOKEN,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: `${publicUrl}/api/google/callback`,
    workerUrl: process.env.BROWSER_WORKER_URL,
    workerToken: process.env.WORKER_TOKEN,
    taskWorkerEnabled: process.env.TASK_WORKER_ENABLED !== "false",
    computerEnabled: process.env.COMPUTER_ENABLED === "true",
    computerImage: process.env.COMPUTER_IMAGE ?? "openmuse-computer:local",
    computerDeploymentId: process.env.COMPUTER_DEPLOYMENT_ID,
    whatsappApiKey: process.env.WHATSAPP_API_KEY, // o EVOLUTION_API_KEY
    whatsappBaseUrl: process.env.WHATSAPP_BASE_URL, // ej: http://evolution:8080
    whatsappInstance: process.env.WHATSAPP_INSTANCE, // nombre de la instancia Evolution
    stripeApiKey: process.env.STRIPE_API_KEY,
    backupIntervalHours: Number(process.env.BACKUP_INTERVAL_HOURS ?? "24") || 0,
    backupRetentionDays: Number(process.env.BACKUP_RETENTION_DAYS ?? "7") || 0,
    quotaPerSpeed: {
      fastCallsPerHour: Number(process.env.FAST_CALLS_PER_HOUR ?? "600"),
      slowCallsPerHour: Number(process.env.SLOW_CALLS_PER_HOUR ?? "60"),
    },
    quotaPerSpeed: {
      fastCallsPerHour: Number(process.env.FAST_CALLS_PER_HOUR ?? "600"),
      slowCallsPerHour: Number(process.env.SLOW_CALLS_PER_HOUR ?? "60"),
    },
    deferredAction: {
      windowMs: Number(process.env.DEFERRED_ACTION_WINDOW_MS ?? "8000"),
      dualAt: process.env.DEFERRED_ACTION_DUAL_AT
        ? Number(process.env.DEFERRED_ACTION_DUAL_AT)
        : null,
    },
    // TIMEOUTS_CONFIG_V1 — valores por defecto conservadores. Cada uno
    // configurable por env para ajustar en producción sin redeploy.
    toolTimeouts: {
      llmFirstByteMs: Number(process.env.LLM_FIRST_BYTE_MS ?? "45000"),
      llmGlobalMs: Number(process.env.LLM_GLOBAL_MS ?? "120000"),
      googleHttpMs: Number(process.env.GOOGLE_HTTP_MS ?? "30000"),
      computerCommandMs: Number(process.env.COMPUTER_COMMAND_MS ?? "30000"),
      computerClientMs: Number(process.env.COMPUTER_CLIENT_MS ?? "35000"),
      whatsappSendMs: Number(process.env.WHATSAPP_SEND_MS ?? "20000"),
      stripeHttpMs: Number(process.env.STRIPE_HTTP_MS ?? "20000"),
      browserNavMs: Number(process.env.BROWSER_NAV_MS ?? "20000"),
    },
    // ORIGINS_CLEAN — ALLOWED_ORIGINS="" daba [""], que no matchea nada pero ocupa
    // un hueco en el Set. Filtramos vacios y hacemos trim.
    allowedOrigins: (
      process.env.ALLOWED_ORIGINS ?? "http://localhost:8081,http://127.0.0.1:8081"
    )
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
  if (
    mode === "live" &&
    (!config.accessKey || config.accessKey.length < 24 || !config.encryptionKey)
  )
    throw new Error(
      "Live mode requires OPENMUSE_ACCESS_KEY (24+ characters) and TOKEN_ENCRYPTION_KEY (32-byte base64)",
    );
  if (mode === "sample" && !["127.0.0.1", "localhost", "::1"].includes(config.host))
    throw new Error("Sample workspace is local-only. HOST must be a loopback address.");
  return config;
}