/** Process configuration only. Keys remain isolated by lane and provider. */
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const META_BASE_URL = "https://api.meta.ai/v1";
export const DEFAULT_FAST_MODEL = "muse-spark-1.3-contributor";
export const DEFAULT_SLOW_MODEL = "deepseek/deepseek-v3.2";
export interface LaneProfile {
  provider: "google" | "anthropic" | "openai" | "openrouter" | "meta";
  model: string;
  apiKey: string;
  baseUrl?: string;
}
const read = (env: NodeJS.ProcessEnv, name: string) => env[name]?.trim() || undefined;
export function laneEnvironment(lane: "fast" | "slow", env: NodeJS.ProcessEnv = process.env) {
  const prefix = lane.toUpperCase();
  let provider = read(env, `${prefix}_LLM_PROVIDER`),
    model = read(env, `${prefix}_LLM_MODEL`);
  let apiKey = read(env, `${prefix}_LLM_API_KEY`),
    baseUrl = read(env, `${prefix}_LLM_BASE_URL`);
  // The underscore is significant: this key belongs to Slow, never JEV.
  if (lane === "slow" && !provider && !model && !apiKey && read(env, "OPEN_ROUTER_API_KEY")) provider = "openrouter";
  if (lane === "slow" && provider === "openrouter") {
    apiKey ||= read(env, "OPEN_ROUTER_API_KEY");
    model ||= DEFAULT_SLOW_MODEL;
  }
  if (provider === "openrouter") baseUrl ||= OPENROUTER_BASE_URL;
  // Contributor is a documented model ID, not an invented request flag.
  if (lane === "fast" && !provider && !model && !apiKey && read(env, "MUSE_API_KEY")) provider = "meta";
  if (lane === "fast" && provider === "meta") {
    apiKey ||= read(env, "MUSE_API_KEY");
    model ||= DEFAULT_FAST_MODEL;
    baseUrl ||= META_BASE_URL;
  }
  return { provider, model, apiKey, baseUrl };
}
export function requireLaneProfile(lane: "fast" | "slow", env: NodeJS.ProcessEnv = process.env): LaneProfile {
  const profile = laneEnvironment(lane, env);
  if (!profile.provider || !profile.model || !profile.apiKey) throw Error(`${lane.toUpperCase()}_PROFILE_UNCONFIGURED`);
  if (!["google", "anthropic", "openai", "openrouter", "meta"].includes(profile.provider))
    throw Error(`${lane.toUpperCase()}_PROVIDER_UNSUPPORTED`);
  if (profile.provider === "meta" && (profile.baseUrl ?? META_BASE_URL).replace(/\/+$/, "") !== META_BASE_URL)
    throw Error("META_ENDPOINT_INVALID");
  return profile as LaneProfile;
}

/** Optional legacy lane; a complete declared profile still gets strict validation. */
export function configuredLaneProfile(
  lane: "fast" | "slow",
  env: NodeJS.ProcessEnv = process.env,
): LaneProfile | undefined {
  const profile = laneEnvironment(lane, env);
  return profile.provider && profile.model && profile.apiKey ? requireLaneProfile(lane, env) : undefined;
}
