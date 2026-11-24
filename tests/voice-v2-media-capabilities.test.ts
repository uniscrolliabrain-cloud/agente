import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveVoiceMediaCapabilities, voiceMediaConfigurationFromEnv } from "../apps/server/src/engine/voice-v2/media-capabilities.ts";

const role = { id: "laia", name: "LAIA", active: true as const };

test("C05 media capabilities fail closed without credentials", () => {
  const result = resolveVoiceMediaCapabilities(role, {});
  assert.deepEqual(result.channels, { voice: false, video: false });
  assert.equal(result.roleId, "laia");
});

test("C05 media capabilities require credentials and media IDs", () => {
  const partial = resolveVoiceMediaCapabilities(role, {
    elevenLabsApiKey: "key", defaultVoiceId: "voice",
  });
  assert.deepEqual(partial.channels, { voice: true, video: false });
  const full = resolveVoiceMediaCapabilities(role, {
    elevenLabsApiKey: "key", defaultVoiceId: "voice",
    anamApiKey: "key", defaultPersonaId: "persona",
  });
  assert.deepEqual(full.channels, { voice: true, video: true });
  assert.equal(JSON.stringify(full).includes("key"), false);
  assert.equal(JSON.stringify(full).includes("persona"), false);
});

test("C05 media role override cannot grant access or fabricate role", () => {
  assert.throws(() => resolveVoiceMediaCapabilities({ ...role, active: false } as never, {
    elevenLabsApiKey: "key", defaultVoiceId: "voice",
  }), /VOICE_AGENT_DENIED/);
  const result = resolveVoiceMediaCapabilities({ ...role, id: "marcos" }, {
    elevenLabsApiKey: "key", voicesByRole: { laia: "voice" },
  });
  assert.equal(result.channels.voice, false);
});

test("C05 environment mapping is server-only and side-effect free", () => {
  const result = voiceMediaConfigurationFromEnv({
    ELEVENLABS_API_KEY: "secret", ELEVENLABS_VOICE_ID: "voice",
  });
  assert.equal(result.elevenLabsApiKey, "secret");
  assert.equal(result.defaultVoiceId, "voice");
});
