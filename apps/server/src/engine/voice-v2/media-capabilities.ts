/**
 * C05: Presentation-only media capabilities.
 *
 * Provider configuration is NOT authorization. The caller must first resolve an
 * active role in the authenticated tenant and pass that role's canonical ID.
 * No external request or credential is exposed by this module.
 */
export interface VoiceMediaConfiguration {
  elevenLabsApiKey?: string;
  anamApiKey?: string;
  defaultVoiceId?: string;
  defaultPersonaId?: string;
  voicesByRole?: Readonly<Record<string, string | undefined>>;
  personasByRole?: Readonly<Record<string, string | undefined>>;
}

export interface AuthorizedVoiceRole {
  id: string;
  name: string;
  active: true;
}

export interface VoiceMediaCapabilities {
  roleId: string;
  displayName: string;
  voice: { provider: "elevenlabs"; configured: boolean };
  avatar: { provider: "anam"; configured: boolean };
  channels: { voice: boolean; video: boolean };
}

const validId = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Fail closed for disabled roles and absent credentials. A global provider
 * default can configure media for an already authorized role, never authorize
 * a new role. No tokens, provider IDs or keys leave this descriptor.
 */
export function resolveVoiceMediaCapabilities(
  role: AuthorizedVoiceRole,
  config: VoiceMediaConfiguration,
): VoiceMediaCapabilities {
  if (!validId(role.id) || !validId(role.name) || role.active !== true) {
    throw Error("VOICE_AGENT_DENIED");
  }
  const voiceId = config.voicesByRole?.[role.id] ?? config.defaultVoiceId;
  const personaId = config.personasByRole?.[role.id] ?? config.defaultPersonaId;
  const voice = validId(config.elevenLabsApiKey) && validId(voiceId);
  const video = voice && validId(config.anamApiKey) && validId(personaId);
  return {
    roleId: role.id,
    displayName: role.name,
    voice: { provider: "elevenlabs", configured: voice },
    avatar: { provider: "anam", configured: video },
    channels: { voice, video },
  };
}

/** Server-only mapping from existing deployment configuration. */
export function voiceMediaConfigurationFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): VoiceMediaConfiguration {
  return {
    elevenLabsApiKey: env.ELEVENLABS_API_KEY,
    anamApiKey: env.ANAM_API_KEY,
    defaultVoiceId: env.ELEVENLABS_VOICE_ID,
    defaultPersonaId: env.ANAM_PERSONA_ID,
  };
}
