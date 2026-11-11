// VOICE_PROVIDERS_V1 - adaptadores de cara (Anam) y voz (ElevenLabs).
//
// Regla del modulo: sin clave no hay error en el camino caliente, hay
// `configured: false` y las rutas responden 503 con un motivo legible. Asi el
// resto del producto (chat, tareas) sigue funcionando aunque falte la cuenta.
//
// Nada de esto se ha probado contra una cuenta real: son contratos HTTP
// publicos, con base URL configurable para poder apuntar a un mock.

export interface ProviderStatus {
  elevenlabs: { configured: boolean; model: string; voiceId: string };
  anam: { configured: boolean; personaId: string };
}

function env(key: string): string {
  return process.env[key]?.trim() ?? "";
}

export function providerStatus(): ProviderStatus {
  return {
    elevenlabs: {
      configured: Boolean(env("ELEVENLABS_API_KEY")),
      model: env("ELEVENLABS_MODEL") || "eleven_flash_v2_5",
      voiceId: env("ELEVENLABS_VOICE_ID"),
    },
    anam: {
      configured: Boolean(env("ANAM_API_KEY")),
      personaId: env("ANAM_PERSONA_ID"),
    },
  };
}

function anamBase(): string {
  return env("ANAM_BASE_URL") || "https://api.anam.ai";
}

function elevenBase(): string {
  return env("ELEVENLABS_BASE_URL") || "https://api.elevenlabs.io";
}

/**
 * Token de sesion para el SDK de Anam. Se pide al abrir la llamada, no en cada
 * turno; el navegador lo usa para el WebRTC y nunca ve la API key.
 */
export async function createAnamSessionToken(input: {
  personaId?: string;
  systemPrompt?: string;
  voiceId?: string;
  signal?: AbortSignal;
}): Promise<unknown> {
  const apiKey = env("ANAM_API_KEY");
  if (!apiKey) throw new Error("ANAM_API_KEY no configurada");
  const personaId = input.personaId || env("ANAM_PERSONA_ID");
  const response = await fetch(`${anamBase()}/v1/auth/session-token`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      // personaConfig es lo que Anam documenta para el modo custom-LLM.
      personaConfig: {
        ...(personaId ? { personaId } : {}),
        ...(input.systemPrompt ? { systemPrompt: input.systemPrompt } : {}),
        ...(input.voiceId ? { voiceId: input.voiceId } : {}),
      },
    }),
    ...(input.signal ? { signal: input.signal } : {}),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Anam respondio ${response.status}: ${detail.slice(0, 200)}`);
  }
  return await response.json();
}

/**
 * TTS en streaming. Devuelve el body crudo (audio/mpeg) para reenviarlo tal
 * cual: ni base64 ni transcodificacion en el backend.
 */
export async function synthesizeSpeech(input: {
  text: string;
  voiceId?: string;
  speed?: number;
  signal?: AbortSignal;
}): Promise<Response> {
  const apiKey = env("ELEVENLABS_API_KEY");
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY no configurada");
  const voiceId = input.voiceId || env("ELEVENLABS_VOICE_ID");
  if (!voiceId) throw new Error("ELEVENLABS_VOICE_ID no configurado");
  const model = env("ELEVENLABS_MODEL") || "eleven_flash_v2_5";
  const response = await fetch(
    `${elevenBase()}/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "xi-api-key": apiKey },
      body: JSON.stringify({
        text: input.text.slice(0, 5000),
        model_id: model,
        voice_settings: {
          stability: Number(env("ELEVENLABS_STABILITY") || 0.4),
          similarity_boost: Number(env("ELEVENLABS_SIMILARITY") || 0.75),
          speed: input.speed ?? Number(env("ELEVENLABS_SPEED") || 1.06),
        },
      }),
      ...(input.signal ? { signal: input.signal } : {}),
    },
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`ElevenLabs respondio ${response.status}: ${detail.slice(0, 200)}`);
  }
  return response;
}
