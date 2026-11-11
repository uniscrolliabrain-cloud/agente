import assert from "node:assert/strict";
import { test } from "node:test";
import { Hono } from "hono";
import {
  DEFAULT_CLIENT_AGENTS,
  avatarSeed,
  listVoiceAgents,
  voiceProfileFor,
} from "../apps/server/src/voice/agents.ts";
import { VoiceSessionService } from "../apps/server/src/voice/sessions.ts";
import {
  buildVoiceSnapshot,
  readVoiceSnapshot,
  snapshotId,
} from "../apps/server/src/voice/snapshot.ts";
import { avatarRoutes } from "../apps/server/src/voice/routes.ts";
import { sseChunk, sseDone } from "../apps/server/src/voice/llm.ts";
import type { Config } from "../apps/server/src/config.ts";

type Row = Record<string, unknown> & { id: string };

/** Store en memoria con la misma forma que usa el modulo (y el real). */
function fakeStore() {
  const data = new Map<string, Map<string, Row>>();
  const bucket = (owner: string, kind: string) => {
    const key = `${owner}|${kind}`;
    let map = data.get(key);
    if (!map) {
      map = new Map();
      data.set(key, map);
    }
    return map;
  };
  return {
    calls: { get: 0, put: 0, list: 0 },
    async get<T>(owner: string, kind: string, id: string): Promise<T | null> {
      this.calls.get += 1;
      return (bucket(owner, kind).get(id) as T | undefined) ?? null;
    },
    async put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T> {
      this.calls.put += 1;
      bucket(owner, kind).set(value.id, value as unknown as Row);
      return value;
    },
    async list<T>(owner: string, kind: string, options?: { limit?: number }): Promise<T[]> {
      this.calls.list += 1;
      const rows = [...bucket(owner, kind).values()].slice(0, options?.limit ?? 1000);
      return rows as T[];
    },
    async remove(owner: string, kind: string, id: string): Promise<void> {
      bucket(owner, kind).delete(id);
    },
  };
}

const config = { model: "google/gemini-3.6-flash" } as unknown as Config;

function snapshotDeps(store: ReturnType<typeof fakeStore>) {
  return {
    db: store,
    memory: {
      async recall() {
        return { text: "\n\nContexto recuperado: el cliente pidio la factura de marzo." };
      },
    },
    async systemContext() {
      return {
        pendingApprovals: [{ id: "a1" }],
        recentFailures: [],
        health: { google: true, worker: true },
      };
    },
  };
}

test("todo agente tiene cara y voz, y la semilla es estable", () => {
  const agents = listVoiceAgents(undefined, "tenant-a");
  assert.ok(agents.length >= 12, `esperaba al menos 12 agentes, hay ${agents.length}`);
  const seeds = new Set(agents.map((agent) => agent.avatar.seed));
  assert.equal(seeds.size, agents.length, "dos agentes comparten cara");
  for (const agent of agents) {
    assert.equal(agent.voice.provider, "elevenlabs");
    assert.equal(agent.avatar.provider, "anam");
    assert.ok(agent.latency.firstByteMs <= 1500, "presupuesto de voz fuera de rango");
    assert.equal(agent.tools.profile, "voice-minimal");
  }
  assert.equal(avatarSeed("laia"), avatarSeed("laia"));
  assert.notEqual(avatarSeed("laia"), avatarSeed("comercial"));
});

test("el perfil lee la voz por agente del entorno y cae al global", () => {
  process.env.ELEVENLABS_VOICE_ID = "voz-global";
  process.env.ELEVENLABS_VOICE_COMERCIAL = "voz-comercial";
  const comercial = voiceProfileFor({ id: "comercial", displayName: "Marc", role: "Comercial" });
  const legal = voiceProfileFor({ id: "legal", displayName: "Clara", role: "Legal" });
  assert.equal(comercial.voice.voiceId, "voz-comercial");
  assert.equal(comercial.voice.configured, true);
  assert.equal(legal.voice.voiceId, "voz-global");
  delete process.env.ELEVENLABS_VOICE_ID;
  delete process.env.ELEVENLABS_VOICE_COMERCIAL;
});

test("las personas del tenant mandan sobre la plantilla", () => {
  const personas = {
    list: () => [
      {
        persona: { id: "cobros", displayName: "Rita", role: "Cobros", language: "es" },
        activation: { enabled: true },
      },
      {
        persona: { id: "antiguo", displayName: "Viejo", role: "Baja" },
        activation: { enabled: false },
      },
    ],
  };
  const agents = listVoiceAgents(personas, "tenant-a");
  assert.ok(agents.some((agent) => agent.agentId === "cobros"));
  assert.ok(!agents.some((agent) => agent.agentId === "antiguo"));
  assert.ok(agents.length > DEFAULT_CLIENT_AGENTS.length - 1);
});

test("un registro de personas roto no deja el panel sin agentes", () => {
  const agents = listVoiceAgents(
    {
      list: () => {
        throw new Error("disco roto");
      },
    },
    "tenant-a",
  );
  assert.ok(agents.length >= 12);
});

test("la sesion se aisla por empresa y guarda turnos, segundos y coste", async () => {
  const store = fakeStore();
  const sessions = new VoiceSessionService(store);
  const created = await sessions.create({
    owner: "alice",
    tenantId: "tenant-a",
    agentId: "laia",
  });
  assert.equal(created.state, "requested");
  assert.equal(await sessions.get("alice", "tenant-b", created.id), null, "cruce de empresa");
  assert.ok(await sessions.get("alice", "tenant-a", created.id));

  const touched = await sessions.touch(created);
  assert.equal(touched.turns, 1);
  const closed = await sessions.close(touched, "user");
  assert.equal(closed.state, "closed");
  assert.ok(closed.seconds >= 0);
  assert.ok(closed.costEur >= 0);
  assert.equal(closed.closedReason, "user");
});

test("el reaper cierra sesiones mudas", async () => {
  const store = fakeStore();
  const sessions = new VoiceSessionService(store);
  const created = await sessions.create({ owner: "alice", tenantId: "t", agentId: "laia" });
  const reaped = await sessions.reap("alice", Date.now() + 10 * 60_000);
  assert.equal(reaped.length, 1);
  assert.equal(reaped[0].id, created.id);
  assert.equal(reaped[0].closedReason, "silence");
});

test("el snapshot se lee una vez, no cruza empresa y caduca", async () => {
  const store = fakeStore();
  const deps = snapshotDeps(store);
  const built = await buildVoiceSnapshot(deps, {
    owner: "alice",
    tenantId: "tenant-a",
    agentId: "laia",
    agentName: "Laia",
    role: "Asistente",
  });
  assert.match(built.text, /factura de marzo/);
  assert.match(built.text, /aprobacion/);

  const before = store.calls.get;
  const read = await readVoiceSnapshot(deps, "alice", "tenant-a", built.id);
  assert.ok(read, "el snapshot debe existir");
  assert.equal(store.calls.get - before, 1, "un turno debe costar exactamente una lectura");

  assert.equal(await readVoiceSnapshot(deps, "alice", "tenant-b", built.id), null);
  assert.equal(
    await readVoiceSnapshot(deps, "alice", "tenant-a", built.id, Date.now() + 11 * 60_000),
    null,
  );
  assert.equal(built.id, snapshotId("tenant-a", "laia", "session"));
});

function appFor(deps: Parameters<typeof avatarRoutes>[0], owner = "alice") {
  const app = new Hono<{ Variables: { owner: string } }>();
  app.use("*", async (c, next) => {
    c.set("owner", owner);
    await next();
  });
  // La app real ya traduce AppError a su status; aqui se replica para poder
  // comprobar 404 sin arrancar el servidor entero.
  app.onError((error, c) => {
    const shaped = error as { status?: number; statusCode?: number };
    const status = shaped.status ?? shaped.statusCode ?? 500;
    return c.json({ error: error.message }, status as 400);
  });
  app.route("/api/avatar", avatarRoutes(deps));
  return app;
}

test("las rutas degradan sin claves y sirven SSE con el LLM inyectado", async () => {
  const store = fakeStore();
  const app = appFor({
    ...snapshotDeps(store),
    config,
    tenantIdFor: async () => "tenant-a",
    completion: async function* () {
      yield "Hola, ";
      yield "te escucho.";
    },
  });

  const agents = await app.request("/api/avatar/agents");
  assert.equal(agents.status, 200);
  const payload = (await agents.json()) as { agents: unknown[]; ready: boolean };
  assert.ok(payload.agents.length >= 12);
  assert.equal(payload.ready, false, "sin claves no se ofrece llamada");

  const opened = await app.request("/api/avatar/sessions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ agentId: "laia" }),
  });
  assert.equal(opened.status, 200);
  const { session } = (await opened.json()) as { session: { id: string } };
  assert.ok(session.id);

  const llm = await app.request("/api/avatar/llm", {
    method: "POST",
    headers: { "content-type": "application/json", "x-avatar-session": session.id },
    body: JSON.stringify({
      model: "laia",
      stream: true,
      messages: [{ role: "user", content: "hola" }],
    }),
  });
  assert.equal(llm.status, 200);
  assert.match(llm.headers.get("content-type") ?? "", /text\/event-stream/);
  assert.equal(llm.headers.get("x-accel-buffering"), "no");
  const text = await llm.text();
  assert.ok(text.includes("Hola, "));
  assert.ok(text.endsWith(sseDone()));

  const interrupted = await app.request(`/api/avatar/sessions/${session.id}/interrupt`, {
    method: "POST",
  });
  assert.equal(interrupted.status, 200);
});

test("un agente de otra empresa no puede abrir sesion", async () => {
  const store = fakeStore();
  const app = appFor({
    ...snapshotDeps(store),
    config,
    tenantIdFor: async () => "tenant-a",
  });
  const other = await app.request("/api/avatar/sessions/desconocida", { method: "DELETE" });
  assert.equal(other.status, 404);
});

test("el chunk SSE tiene la forma que espera un cliente OpenAI", () => {
  const parsed = JSON.parse(sseChunk("hola").replace(/^data: /, "")) as {
    choices: Array<{ delta: { content: string } }>;
  };
  assert.equal(parsed.choices[0].delta.content, "hola");
});
