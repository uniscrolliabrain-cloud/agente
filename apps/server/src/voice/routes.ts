// AVATAR_ROUTES_V1 - canal de voz y cara para cualquier agente.
//
//   GET    /api/avatar/agents              -> agentes con su perfil de voz/cara
//   GET    /api/avatar/providers           -> que esta configurado
//   POST   /api/avatar/sessions            -> abre llamada (token Anam + snapshot)
//   GET    /api/avatar/sessions/:id
//   POST   /api/avatar/sessions/:id/interrupt
//   DELETE /api/avatar/sessions/:id
//   POST   /api/avatar/llm                 -> OpenAI-compatible SSE (custom LLM de Anam)
//
// El scope sale del claim firmado, igual que en el resto del producto: nunca
// de un tenantId que mande el cliente. Cada sesion guarda su tenantId y se
// comprueba al leer, asi que una empresa no ve la llamada de otra.

import { Hono } from "hono";
import { z } from "zod";
import type { Config } from "../config.ts";
import { AppError } from "../errors.ts";
import type { AgentService } from "../engine/service.ts";
import { RateLimiter } from "../rate-limit.ts";
import { currentTenantScope, runInTenantScope } from "../tenant-scope.ts";
import { defaultAgentId, listVoiceAgents, voiceProfileOf, type PersonaSource } from "./agents.ts";
import { voiceHarnessCompletion, type VoiceHarnessInput } from "./harness.ts";
import { sseChunk, sseDone, voiceCompletion, type VoiceCompletionInput } from "./llm.ts";
import { createAnamSessionToken, providerStatus, synthesizeSpeech } from "./providers.ts";
import {
  VoiceSessionService,
  sessionLimits,
  type SessionStore,
  type VoiceSession,
} from "./sessions.ts";
import {
  buildVoiceSnapshot,
  maybeRefreshSnapshot,
  readVoiceSnapshot,
  snapshotId,
  type SnapshotDeps,
} from "./snapshot.ts";

export interface AvatarDeps {
  db: SessionStore & SnapshotDeps["db"];
  config: Config;
  memory: SnapshotDeps["memory"];
  systemContext: SnapshotDeps["systemContext"];
  tenantIdFor?: (owner: string) => Promise<string>;
  personas?: PersonaSource;
  /**
   * VOICE_SAME_AGENT_V1 - el agente real del runtime. Con esto la llamada no
   * usa el camino ligero: entra por el mismo ConversationAgent que el chat,
   * con kernel, herramientas, memoria y turno del harness.
   */
  service?: AgentService;
  /** Inyectables en tests: evitan arrancar el runtime o un modelo real. */
  harness?: (input: VoiceHarnessInput) => AsyncIterable<string>;
  completion?: (input: VoiceCompletionInput) => AsyncIterable<string>;
}

const openSessionSchema = z
  .object({
    agentId: z.string().trim().min(1).max(80),
    threadId: z.string().trim().min(1).max(200).optional(),
    roleId: z.string().trim().min(1).max(120).optional(),
    query: z.string().trim().max(500).optional(),
  })
  .strict();

const llmSchema = z
  .object({
    model: z.string().optional(),
    stream: z.boolean().optional(),
    messages: z
      .array(
        z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string().max(20_000),
        }),
      )
      .min(1)
      .max(40),
  })
  .passthrough();

const SUPABASE_TTS_MAX = 5000;

export function avatarRoutes(deps: AvatarDeps) {
  const app = new Hono<{ Variables: { owner: string; tenantId: string } }>();
  const sessions = new VoiceSessionService(deps.db);
  // VOICE_COST_LIMIT_V1 - cada turno gasta cuota del modelo y del TTS. Un tope
  // por empresa evita que una pestaña olvidada se lleve la factura por delante.
  const voiceLimiter = new RateLimiter(
    Number(process.env.VOICE_TURNS_PER_HOUR ?? "600") || 600,
    60 * 60 * 1000,
  );
  const checkVoiceQuota = (tenantId: string, owner: string) => {
    const verdict = voiceLimiter.takeForTenant(tenantId, owner, "avatar-turn") as {
      allowed?: boolean;
    };
    if (verdict?.allowed === false) {
      throw new AppError("Limite de turnos de voz alcanzado. Prueba en un rato.", 429);
    }
  };

  app.use("*", async (c, next) => {
    const owner = c.get("owner");
    if (!owner) throw new AppError("Sesion requerida", 401);
    const scope = currentTenantScope();
    if (scope && scope.actorId !== owner) throw new AppError("Actor no valido", 403);
    let tenantId = scope?.tenantId;
    if (!tenantId) {
      if (!deps.tenantIdFor) throw new AppError("Voz requiere empresa resuelta", 503);
      tenantId = await deps.tenantIdFor(owner);
    }
    if (!tenantId) throw new AppError("Voz requiere empresa resuelta", 409);
    c.set("tenantId", tenantId);
    await runInTenantScope({ tenantId, actorId: owner }, next);
  });

  app.get("/agents", (c) => {
    const tenantId = c.get("tenantId");
    const agents = listVoiceAgents(deps.personas, tenantId);
    return c.json({
      agents,
      // Lo que falta no se esconde: la UI necesita saber si puede ofrecer llamada.
      providers: providerStatus(),
      ready: providerStatus().anam.configured && providerStatus().elevenlabs.configured,
    });
  });

  app.get("/providers", (c) => c.json(providerStatus()));

  app.post("/sessions", async (c) => {
    const owner = c.get("owner");
    const tenantId = c.get("tenantId");
    const parsed = openSessionSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new AppError("Peticion de sesion invalida", 422);
    const profile = voiceProfileOf(deps.personas, tenantId, parsed.data.agentId);
    if (!profile) throw new AppError("Agente desconocido para voz", 404);

    const created = await sessions.create({
      owner,
      tenantId,
      agentId: profile.agentId,
      ...(parsed.data.threadId ? { threadId: parsed.data.threadId } : {}),
      ...(parsed.data.roleId ? { roleId: parsed.data.roleId } : {}),
    });
    // La llamada entra en un hilo real: el que traiga el cliente (la
    // conversacion abierta) o uno propio de la llamada.
    const session = await sessions.attachThread(
      created,
      parsed.data.threadId ?? `voice-${created.id}`,
    );

    // El snapshot se construye ya: Anam tarda 4-5 s en tener la sesion WebRTC
    // lista, asi que este trabajo se esconde dentro de ese arranque.
    let snapshotChars = 0;
    try {
      const snapshot = await buildVoiceSnapshot(deps, {
        owner,
        tenantId,
        agentId: profile.agentId,
        agentName: profile.displayName,
        role: profile.role,
        ...(parsed.data.query ? { query: parsed.data.query } : {}),
        agentKey: "session",
      });
      snapshotChars = snapshot.text.length;
    } catch {
      snapshotChars = 0;
    }

    let anam: { configured: boolean; token?: unknown; error?: string } = {
      configured: providerStatus().anam.configured,
    };
    if (anam.configured) {
      try {
        anam = {
          configured: true,
          token: await createAnamSessionToken({
            personaId: profile.avatar.personaId,
            voiceId: profile.voice.voiceId,
          }),
        };
      } catch (error) {
        anam = {
          configured: true,
          error: error instanceof Error ? error.message : "Anam no respondio",
        };
      }
    }

    return c.json({
      session,
      agent: profile,
      snapshotChars,
      anam,
      limits: sessionLimits(),
    });
  });

  app.get("/sessions/:id", async (c) => {
    const session = await sessions.get(c.get("owner"), c.get("tenantId"), c.req.param("id"));
    if (!session) throw new AppError("Sesion no encontrada", 404);
    return c.json({ session });
  });

  app.post("/sessions/:id/interrupt", async (c) => {
    const session = await sessions.get(c.get("owner"), c.get("tenantId"), c.req.param("id"));
    if (!session) throw new AppError("Sesion no encontrada", 404);
    // El abort real lo hace el cliente al cerrar el fetch del stream; aqui se
    // deja constancia para que el backend no siga facturando un turno muerto.
    return c.json({ session: await sessions.interrupt(session) });
  });

  app.delete("/sessions/:id", async (c) => {
    const session = await sessions.get(c.get("owner"), c.get("tenantId"), c.req.param("id"));
    if (!session) throw new AppError("Sesion no encontrada", 404);
    return c.json({ session: await sessions.close(session, "user") });
  });

  /**
   * OpenAI Chat Completions en streaming. Es el contrato que Anam consume como
   * "custom LLM": no hay adaptador propio ni AG-UI en medio.
   */
  app.post("/llm", async (c) => {
    const owner = c.get("owner");
    const tenantId = c.get("tenantId");
    checkVoiceQuota(tenantId, owner);
    const parsed = llmSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new AppError("Peticion LLM invalida", 422);

    const sessionId = c.req.header("x-avatar-session") ?? "";
    const session = sessionId ? await sessions.get(owner, tenantId, sessionId) : null;
    const agentId =
      c.req.header("x-avatar-agent") ||
      (parsed.data.model ? String(parsed.data.model).split("/").at(-1) : "") ||
      session?.agentId ||
      defaultAgentId(deps.personas, tenantId) ||
      "";
    const profile = voiceProfileOf(deps.personas, tenantId, agentId);
    if (!profile) throw new AppError("Agente desconocido para voz", 404);

    const snapshot = await readVoiceSnapshot(
      deps,
      owner,
      tenantId,
      snapshotId(tenantId, profile.agentId, "session"),
    );
    const systemPrompt = [
      snapshot?.text ?? `Eres ${profile.displayName}, ${profile.role}.`,
      "Hablas en voz: 1-2 frases, sin markdown, sin listas, sin emojis.",
      "Si falta un dato verificable, dilo en una frase corta.",
    ].join("\n\n");

    const completionInput: VoiceCompletionInput = {
      config: deps.config,
      messages: parsed.data.messages,
      systemPrompt,
      firstByteMs: profile.latency.firstByteMs,
      totalMs: profile.latency.totalMs,
      signal: c.req.raw.signal,
    };
    // VOICE_LLM_CONFIG_ERROR_V1 - sin modelo configurado esto lanzaba un Error
    // generico y el cliente recibia un 502 "revisa el servidor". En voz hay que
    // decir exactamente que falta.
    // VOICE_SAME_AGENT_V1 - orden de preferencia: harness inyectado (tests) >
    // agente real del runtime > camino ligero (solo si no hay servicio).
    let tokens: AsyncIterable<string>;
    try {
      tokens = deps.completion
        ? deps.completion(completionInput)
        : deps.harness
          ? deps.harness({
              config: deps.config,
              service: deps.service as AgentService,
              owner,
              threadId: session?.threadId ?? `voice-${sessionId || profile.agentId}`,
              messages: parsed.data.messages,
              signal: c.req.raw.signal,
            })
          : deps.service
            ? voiceHarnessCompletion({
                config: deps.config,
                service: deps.service,
                owner,
                threadId: session?.threadId ?? `voice-${sessionId || profile.agentId}`,
                messages: parsed.data.messages,
                signal: c.req.raw.signal,
              })
            : voiceCompletion(completionInput);
    } catch (error) {
      throw new AppError(
        `Voz sin modelo: ${
          error instanceof Error ? error.message : "no hay modelo configurado"
        }. Configura FAST_LLM_API_KEY o el modelo del tenant.`,
        503,
      );
    }

    if (session) {
      const touched = await sessions.touch(session).catch(() => session);
      // El refresco va en segundo plano: el turno ya tiene su snapshot leido.
      // La consulta es el ultimo mensaje del usuario, no la de apertura: si no,
      // la llamada refrescaria siempre el mismo contexto.
      const lastUser = [...parsed.data.messages]
        .reverse()
        .find((message) => message.role === "user")?.content;
      maybeRefreshSnapshot(
        deps,
        {
          owner,
          tenantId,
          agentId: profile.agentId,
          agentName: profile.displayName,
          role: profile.role,
          ...(lastUser ? { query: lastUser.slice(0, 300) } : {}),
          agentKey: "session",
        },
        touched.turns,
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const delta of tokens) {
            controller.enqueue(encoder.encode(sseChunk(delta)));
          }
          controller.enqueue(encoder.encode(sseDone()));
        } catch (error) {
          const message = error instanceof Error ? error.message : "Error del modelo";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: { message: message.slice(0, 300) } })}\n\n`,
            ),
          );
          controller.enqueue(encoder.encode(sseDone()));
        } finally {
          controller.close();
        }
      },
      cancel() {
        // El cliente corto (barge-in): el fetch aborta el modelo por signal.
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        "x-accel-buffering": "no",
        "content-encoding": "identity",
        connection: "keep-alive",
      },
    });
  });

  /** TTS directo para el modo audio-passthrough (no pasa por Anam). */
  app.post("/tts", async (c) => {
    const body = z
      .object({ text: z.string().min(1).max(SUPABASE_TTS_MAX), agentId: z.string().optional() })
      .safeParse(await c.req.json().catch(() => null));
    if (!body.success) throw new AppError("Texto invalido", 422);
    checkVoiceQuota(c.get("tenantId"), c.get("owner"));
    const profile = voiceProfileOf(
      deps.personas,
      c.get("tenantId"),
      body.data.agentId ?? defaultAgentId(deps.personas, c.get("tenantId")) ?? "",
    );
    if (!providerStatus().elevenlabs.configured) {
      throw new AppError("ElevenLabs no configurado (ELEVENLABS_API_KEY)", 503);
    }
    try {
      const audio = await synthesizeSpeech({
        text: body.data.text,
        ...(profile?.voice.voiceId ? { voiceId: profile.voice.voiceId } : {}),
        ...(profile?.voice.speed ? { speed: profile.voice.speed } : {}),
        signal: c.req.raw.signal,
      });
      return new Response(audio.body, {
        headers: {
          "content-type": audio.headers.get("content-type") ?? "audio/mpeg",
          "cache-control": "no-store",
          "content-encoding": "identity",
        },
      });
    } catch (error) {
      throw new AppError(error instanceof Error ? error.message : "TTS fallo", 502);
    }
  });

  return app;
}

export type { VoiceSession };
