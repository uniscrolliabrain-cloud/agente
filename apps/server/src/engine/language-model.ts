import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { META_BASE_URL, OPENROUTER_BASE_URL, type LaneProfile } from "../llm-config.ts";
import type { ProviderSpec } from "../kernel/config/provider-spec.ts";
import { normalizeModelSpec } from "./model-chain.ts";
/** Per-instance clients; no mutation of provider globals across concurrent lanes. */
export function languageModelForProfile(profile: LaneProfile, transport?: typeof fetch) {
  const options = { apiKey: profile.apiKey, ...(transport ? { fetch: transport } : {}) };
  if (profile.provider === "meta") {
    if ((profile.baseUrl ?? META_BASE_URL).replace(/\/+$/, "") !== META_BASE_URL) throw Error("META_ENDPOINT_INVALID");
    return createOpenAI({ ...options, baseURL: META_BASE_URL }).chat(profile.model);
  }
  if (profile.provider === "openrouter" || profile.provider === "openai")
    return createOpenAI({
      ...options,
      ...(profile.baseUrl || profile.provider === "openrouter"
        ? { baseURL: profile.baseUrl ?? OPENROUTER_BASE_URL }
        : {}),
    }).chat(profile.model);
  if (profile.provider === "anthropic")
    return createAnthropic({ ...options, ...(profile.baseUrl ? { baseURL: profile.baseUrl } : {}) })(profile.model);
  if (profile.provider === "google")
    return createGoogleGenerativeAI({ ...options, ...(profile.baseUrl ? { baseURL: profile.baseUrl } : {}) })(
      profile.model,
    );
  throw Error("LLM_PROVIDER_UNSUPPORTED");
}
/** Legacy model chains keep their ordering, with each matched profile's endpoint. */
export function configuredModelForSpec(spec: string, profiles: (ProviderSpec | undefined)[]) {
  const profile = profiles.find(
    (candidate) =>
      candidate?.apiKey && normalizeModelSpec(`${candidate.provider}/${candidate.model}`) === normalizeModelSpec(spec),
  );
  return profile ? languageModelForProfile(profile) : undefined;
}
