import { Hono } from "hono";
import { z } from "zod";
import type { TenantScopedStore } from "./db-tenant.ts";
import type { CognitionV2Runtime } from "./engine/cognition/v2/runtime.ts";
import { transcriptInputSchema } from "./engine/voice-v2/contracts.ts";
import { installVoiceV2, VoiceTurnCoordinator } from "./engine/voice-v2/coordinator.ts";
import { CognitionFastVoiceAdapter } from "./engine/voice-v2/fast-adapter.ts";
import { AppError } from "./errors.ts";
import { currentTenantScope } from "./tenant-scope.ts";
import { backgroundFailure } from "./log.ts";
import { requireThread } from "./threads-routes.ts";

const sessionInput = z.strictObject({
  threadId: z.string().min(1).max(200),
  roleId: z.string().min(1).max(100),
  consentReceiptId: z.string().min(1).max(200),
  channel: z.enum(["voice", "video"]),
});

const voiceErrors = {
  DENIED: [403, "VOICE_SESSION_DENIED", "Voice session is not authorized"],
  VOICE_AGENT_DENIED: [403, "VOICE_AGENT_DENIED", "Agent is not authorized"],
  VOICE_SESSION_DENIED: [403, "VOICE_SESSION_DENIED", "Voice session is not authorized"],
  VOICE_SESSION_NOT_FOUND: [404, "VOICE_SESSION_NOT_FOUND", "Session not found"],
  VOICE_CONSENT_REQUIRED: [403, "VOICE_CONSENT_REQUIRED", "Consent is required"],
  VOICE_CONSENT_REVOKED: [403, "VOICE_CONSENT_REVOKED", "Consent was revoked"],
  VOICE_SESSION_EXPIRED: [410, "VOICE_SESSION_EXPIRED", "Voice session expired"],
  VOICE_SESSION_CLOSED: [410, "VOICE_SESSION_CLOSED", "Voice session closed"],
  VOICE_CONCURRENT_LIMIT: [429, "VOICE_CONCURRENT_LIMIT", "Voice session limit reached"],
  VOICE_STALE_EPOCH: [409, "VOICE_INTERRUPTED", "Voice turn interrupted"],
  VOICE_INTERRUPTED: [409, "VOICE_INTERRUPTED", "Voice turn interrupted"],
  VOICE_TURN_INVALID: [409, "VOICE_TURN_INVALID", "Voice turn is no longer available"],
  VOICE_UTTERANCE_CONFLICT: [409, "VOICE_UTTERANCE_CONFLICT", "Transcript revision conflicts"],
  TimeoutError: [409, "VOICE_RENDER_LEASE_EXPIRED", "Voice turn deadline elapsed"],
  AbortError: [409, "VOICE_INTERRUPTED", "Voice turn interrupted"],
} as const;

async function voiceRequest<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    const key = Object.hasOwn(voiceErrors, error.message) ? error.message : error.name;
    if (Object.hasOwn(voiceErrors, key)) {
      const [status, code, message] = voiceErrors[key as keyof typeof voiceErrors];
      throw new AppError(message, status, undefined, code);
    }
    if (error.message.startsWith("VOICE_")) {
      throw new AppError("Voice session cannot process this request", 409, undefined, error.message);
    }
    throw error;
  }
}

export async function voiceSessionRoutes(runtime: CognitionV2Runtime, records: TenantScopedStore) {
  await installVoiceV2(runtime.db);
  const coordinator = new VoiceTurnCoordinator(runtime.db, runtime.context, {
    async authorizeAgent(identity, agentId, roleId) {
      if (agentId !== roleId) return false;
      const role = await records.get<{ active?: boolean }>(identity.owner, "agent-roles", roleId);
      return role?.active === true;
    },
  }, new CognitionFastVoiceAdapter(runtime));

  const app = new Hono<{ Variables: { owner: string; voiceIdentity: Awaited<ReturnType<CognitionV2Runtime["identity"]>> } }>();
  app.use("*", async (c, next) => {
    const scope = currentTenantScope();
    if (!scope) throw new AppError("Session required", 401);
    c.set("voiceIdentity", await voiceRequest(() => runtime.identity(scope.tenantId, scope.actorId, c.get("owner"), "chat")));
    await next();
  });
  app.post("/consents", async (c) => {
    const input = await c.req.json();
    return c.json(await voiceRequest(() => coordinator.grantConsent(c.get("voiceIdentity"), input)), 201);
  });
  app.delete("/consents/:id", async (c) => {
    await voiceRequest(() => coordinator.revokeConsent(c.get("voiceIdentity"), c.req.param("id")));
    return c.body(null, 204);
  });
  app.post("/sessions", async (c) => {
    const input = sessionInput.parse(await c.req.json());
    const identity = c.get("voiceIdentity");
    await requireThread(runtime.db, runtime.memberships, identity.owner, input.threadId);
    const session = await voiceRequest(async () => {
      const snapshot = await runtime.context.getSnapshot(identity, { query: "", maxTokens: 1000, maxRefs: 5 });
      return coordinator.create(identity, { ...input, agentId: input.roleId, contextSnapshotId: snapshot.id });
    });
    return c.json(session, 201);
  });
  app.post("/sessions/:id/transcripts", async (c) => {
    const input = transcriptInputSchema.parse(await c.req.json());
    const identity = c.get("voiceIdentity");
    const sessionId = c.req.param("id");
    const turn = await voiceRequest(() => coordinator.acceptTranscript(identity, sessionId, input));
    if (!turn) return c.body(null, 204);
    if (turn.state === "completed") return c.json({ turn });
    let text = "";
    const completed = await voiceRequest(() => coordinator.renderTurn(identity, sessionId, turn.turnId, input.text, c.req.raw.signal,
      async (chunk) => { text += chunk; }));
    return c.json({ turn: completed, text });
  });
  app.post("/sessions/:id/interrupt", async (c) =>
    c.json(await voiceRequest(() => coordinator.interrupt(c.get("voiceIdentity"), c.req.param("id")))));
  app.delete("/sessions/:id", async (c) =>
    c.json(await voiceRequest(() => coordinator.close(c.get("voiceIdentity"), c.req.param("id")))));
  let sweep: Promise<void> | undefined;
  const maintain = () => {
    sweep ??= (async () => {
      for (const tenant of runtime.tenants) {
        await coordinator.reapExpired(tenant).catch((error) => backgroundFailure("voice session maintenance", error));
      }
    })().finally(() => { sweep = undefined; });
  };
  maintain();
  const timer = setInterval(maintain, 15_000);
  timer.unref();
  return { app, stop: async () => { clearInterval(timer); await sweep; } };
}
