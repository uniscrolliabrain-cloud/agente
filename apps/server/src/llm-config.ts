/** Process configuration only. Keys remain isolated by lane and provider. */
export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const DEFAULT_SLOW_MODEL = "deepseek/deepseek-v3.2";
export interface LaneProfile {
  provider: "google" | "anthropic" | "openai" | "openrouter";
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
  // Muse is direct. Until its protocol/endpoint/model are verified, presence of
  // MUSE_API_KEY alone cannot send it to Google, OpenRouter or the legacy Llama API.
  if (lane === "fast" && provider === "openai" && model && baseUrl) apiKey ||= read(env, "MUSE_API_KEY");
  return { provider, model, apiKey, baseUrl };
}
export function requireLaneProfile(lane: "fast" | "slow", env: NodeJS.ProcessEnv = process.env): LaneProfile {
  const profile = laneEnvironment(lane, env);
  if (!profile.provider || !profile.model || !profile.apiKey) throw Error(`${lane.toUpperCase()}_PROFILE_UNCONFIGURED`);
  if (!["google", "anthropic", "openai", "openrouter"].includes(profile.provider))
    throw Error(`${lane.toUpperCase()}_PROVIDER_UNSUPPORTED`);
  return profile as LaneProfile;
}
