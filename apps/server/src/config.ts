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
  accessKey?: string;
  encryptionKey?: string;
  model?: string;
  modelFallback?: string;
  agentBackend: "sample" | "model" | "agui";
  agentUrl?: string;
  agentToken?: string;
  intelligenceApiKey?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleRedirectUri: string;
  workerUrl?: string;
  workerToken?: string;
  taskWorkerEnabled?: boolean;
  computerEnabled?: boolean;
  computerImage?: string;
  computerDeploymentId?: string;
  allowedOrigins: string[];
}

export const intelligenceKeyRequiredMessage =
  "OpenMuse requires CPK_INTELLIGENCE_API_KEY. " +
  "Run `npx copilotkit@latest login` and `npx copilotkit@latest project select`, " +
  "then set the generated server-only key. " +
  "See https://docs.copilotkit.ai/intelligence/connect-your-runtime";

export function required(name: string, message: string, value = process.env[name]): string {
  if (!value?.trim()) throw new Error(message);
  return value.trim();
}

export function assertApiDeploymentConfig(config: Config): void { return; }

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
  const port = Number(process.env.PORT ?? 8787);
  const publicUrl = process.env.PUBLIC_API_URL ?? `http://localhost:${port}`;
  const config: Config = {
    mode,
    port,
    host: process.env.HOST ?? "127.0.0.1",
    publicUrl,
    dataDir: resolve(process.env.DATA_DIR ?? ".openmuse"),
    databaseUrl: process.env.DATABASE_URL,
    accessKey: process.env.OPENMUSE_ACCESS_KEY,
    encryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
    model: readModel(),
    modelFallback: readModelFallback(),
    agentBackend: backend,
    agentUrl: process.env.AGENT_URL,
    agentToken: process.env.AGENT_TOKEN,
    intelligenceApiKey: process.env.CPK_INTELLIGENCE_API_KEY?.trim() || undefined,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: `${publicUrl}/api/google/callback`,
    workerUrl: process.env.BROWSER_WORKER_URL,
    workerToken: process.env.WORKER_TOKEN,
    taskWorkerEnabled: process.env.TASK_WORKER_ENABLED !== "false",
    computerEnabled: process.env.COMPUTER_ENABLED === "true",
    computerImage: process.env.COMPUTER_IMAGE ?? "openmuse-computer:local",
    computerDeploymentId: process.env.COMPUTER_DEPLOYMENT_ID,
    allowedOrigins: (
      process.env.ALLOWED_ORIGINS ?? "http://localhost:8081,http://127.0.0.1:8081"
    ).split(","),
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

