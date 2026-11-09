// COGNITION_CARDS_TEST_V1 - el corte slow -> thought -> tarjeta -> contexto.
//
// Cubre lo que antes no existia: el slow escribe contenido real, la tarjeta
// tiene evidencia, no se mezcla entre tenants, se consume una sola vez y el
// render la marca como dato, no como instruccion.

import assert from "node:assert/strict";
import { test } from "node:test";
import { Hono } from "hono";
import { cognitionRoutes } from "../apps/server/src/cognition-routes.ts";
import {
  CognitionCardStore,
  InMemoryAuditStore,
  InMemoryTurnStore,
  Kernel,
  captureSlowCognition,
  cognitionCardSchema,
  kernelContextSchema,
  type CognitionCard,
  type KernelContext,
} from "../apps/server/src/kernel/index.ts";
import {
  assembleCognitionCards,
  renderCognitionCards,
} from "../apps/server/src/engine/context/cognition-cards.ts";

class MemoryStore {
  private readonly rows = new Map<string, Map<string, unknown>>();

  private bucket(owner: string, kind: string): Map<string, unknown> {
    const key = `${owner}\u0000${kind}`;
    let bucket = this.rows.get(key);
    if (!bucket) {
      bucket = new Map();
      this.rows.set(key, bucket);
    }
    return bucket;
  }

  async insertIfAbsent<T extends { id: string }>(
    owner: string,
    kind: string,
    value: T,
  ): Promise<T | null> {
    const bucket = this.bucket(owner, kind);
    if (bucket.has(value.id)) return null;
    const copy = JSON.parse(JSON.stringify(value)) as T;
    bucket.set(value.id, copy);
    return copy;
  }

  async get<T>(owner: string, kind: string, id: string): Promise<T | null> {
    return (this.bucket(owner, kind).get(id) as T) ?? null;
  }

  async put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T> {
    this.bucket(owner, kind).set(value.id, JSON.parse(JSON.stringify(value)));
    return value;
  }

  async list<T>(owner: string, kind: string, options: { limit?: number } = {}): Promise<T[]> {
    const values = [...this.bucket(owner, kind).values()] as T[];
    return options.limit ? values.slice(0, options.limit) : values;
  }

  async compareAndSwap<T>(
    owner: string,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null> {
    const bucket = this.bucket(owner, kind);
    const current = bucket.get(id) as Record<string, unknown> | undefined;
    if (!current) return null;
    for (const [key, value] of Object.entries(expected)) {
      if (JSON.stringify(current[key]) !== JSON.stringify(value)) return null;
    }
    const next = { ...current, ...patch };
    bucket.set(id, next);
    return next as T;
  }
}

function makeCtx(tenantId = "t1", owner = "u1"): KernelContext {
  return kernelContextSchema.parse({
    tenantId,
    owner,
    role: "agent",
    requestId: `req-${owner}-${tenantId}`,
    threadId: "thread-1",
    actorId: owner,
  });
}

function makeKernel(): Kernel {
  return new Kernel({
    store: new InMemoryTurnStore(),
    tenants: { resolve: async () => "t1" },
    audit: new InMemoryAuditStore(),
    config: { resolve: async () => ({ maxThoughtsPerTurn: 100 }) },
  } as never);
}

async function makeChildTurn(kernel: Kernel, ctx: KernelContext) {
  const parent = await kernel.openTurn(ctx, "task.agent");
  return kernel.openChildTurn(ctx, parent.id, "slow.done:test");
}

test("el slow escribe contenido real y crea una tarjeta con evidencia", async () => {
  const kernel = makeKernel();
  const ctx = makeCtx();
  const child = await makeChildTurn(kernel, ctx);
  const cards = new CognitionCardStore(new MemoryStore());
  const output = "Riesgo: ACME concentra el 40% de la facturacion y el contrato vence en marzo.";

  const result = await captureSlowCognition(
    { kernel, cards },
    {
      ctx,
      turnId: child.id,
      content: output,
      query: "analiza el riesgo de ACME",
      intent: "risk",
      confidence: 0.82,
      entities: ["entity:acme"],
      threadId: ctx.threadId,
      model: "slow/test",
    },
  );

  assert.equal(result.thought.role, "reasoning");
  assert.equal(result.thought.provenance.source, "slow.llm");
  assert.equal(result.thought.content, output);
  const progress = result.thought.attention.metadata.progress as {
    kind: string;
    message: string;
  };
  assert.equal(progress.kind, "ready");
  assert.match(progress.message, /ready/);
  assert.equal(result.card.kind, "risk");
  assert.equal(result.card.threadId, "thread-1");
  assert.equal(result.card.body, output);
  assert.notEqual(result.card.body, "analiza el riesgo de ACME");
  assert.deepEqual(result.card.evidence.thoughtIds, [result.thought.id]);
  assert.equal(result.card.evidence.entityRefs[0]?.kind, "entity");
  assert.equal(result.card.evidence.entityRefs[0]?.id, "acme");
  assert.equal(result.card.status, "proposed");
  assert.equal(result.card.provenance.model, "slow/test");
});

test("el store aísla tenants, no duplica y respeta hilo/owner", async () => {
  const kernel = makeKernel();
  const ctx = makeCtx();
  const child = await makeChildTurn(kernel, ctx);
  const cards = new CognitionCardStore(new MemoryStore());
  const result = await captureSlowCognition(
    { kernel, cards },
    {
      ctx,
      turnId: child.id,
      content: "Oportunidad: el cliente pidio ampliar el servicio en Q2.",
      query: "oportunidad",
      intent: "opportunity",
      confidence: 0.7,
      threadId: "thread-1",
    },
  );

  const duplicate = await cards.save(result.card);
  assert.equal(duplicate.created, false);
  assert.equal((await cards.list("t2", "u1")).length, 0);
  assert.equal((await cards.pending("t2", "u1", { threadId: "thread-1" })).length, 0);
  assert.equal((await cards.pending("t1", "u1", { threadId: "thread-2" })).length, 0);
  assert.equal((await cards.pending("t1", "u1", { threadId: "thread-1" })).length, 1);

  const useful = await cards.markUseful("t1", "u1", result.card.id);
  assert.equal(useful?.scope, "tenant");
  assert.equal((await cards.pending("t1", "u1", { threadId: "thread-2" })).length, 1);

  const first = await cards.markConsumed("t1", "u1", result.card.id);
  assert.equal(first?.status, "consumed");
  const second = await cards.markConsumed("t1", "u1", result.card.id);
  assert.equal(second, undefined);
  assert.equal((await cards.pending("t1", "u1", { threadId: "thread-1" })).length, 0);

  // COGNITION_CARD_RELEASE_TEST_V1 - un fallo del proveedor devuelve la tarjeta
  // a pendiente y el siguiente turno puede reclamarla de nuevo.
  const released = await cards.release("t1", "u1", result.card.id);
  assert.equal(released?.status, "proposed");
  assert.equal((await cards.pending("t1", "u1", { threadId: "thread-1" })).length, 1);
  const reclaimed = await cards.markConsumed("t1", "u1", result.card.id);
  assert.equal(reclaimed?.status, "consumed");
  assert.equal((await cards.pending("t1", "u1", { threadId: "thread-1" })).length, 0);
});

test("un reintento con la misma operación no duplica la tarjeta", async () => {
  const kernel = makeKernel();
  const ctx = makeCtx();
  const child = await makeChildTurn(kernel, ctx);
  const cards = new CognitionCardStore(new MemoryStore());
  const input = {
    ctx,
    turnId: child.id,
    content: "Oportunidad: el cliente pidio ampliar el servicio en Q2.",
    query: "oportunidad",
    intent: "opportunity",
    confidence: 0.7,
    threadId: "thread-1",
    dedupeKey: "task:same-operation",
  };

  const first = await captureSlowCognition({ kernel, cards }, input);
  const retry = await captureSlowCognition({ kernel, cards }, input);
  assert.equal(first.created, true);
  assert.equal(retry.created, false);
  assert.equal(retry.card.id, first.card.id);
  assert.equal((await cards.list("t1", "u1")).length, 1);
});

test("marcar útil no cruza de tenant", async () => {
  const kernel = makeKernel();
  const ctx = makeCtx();
  const child = await makeChildTurn(kernel, ctx);
  const cards = new CognitionCardStore(new MemoryStore());
  const result = await captureSlowCognition(
    { kernel, cards },
    {
      ctx,
      turnId: child.id,
      content: "Decision: priorizar el segmento pyme este trimestre.",
      query: "decision",
      intent: "decision",
      confidence: 0.6,
      threadId: "thread-1",
    },
  );

  assert.equal(await cards.markUseful("t2", "u1", result.card.id), undefined);
  assert.equal(await cards.markConsumed("t2", "u1", result.card.id), undefined);
  assert.equal((await cards.get("t1", "u1", result.card.id))?.scope, "thread");
});

test("el contexto reclama tarjetas una sola vez y las renderiza como datos", async () => {
  const kernel = makeKernel();
  const ctx = makeCtx();
  const child = await makeChildTurn(kernel, ctx);
  const cards = new CognitionCardStore(new MemoryStore());
  const base = await captureSlowCognition(
    { kernel, cards },
    {
      ctx,
      turnId: child.id,
      content: "Insight: el margen mejora al agrupar entregas por zona.",
      query: "margen",
      intent: "insight",
      confidence: 0.75,
      threadId: "thread-1",
    },
  );

  const second: CognitionCard = cognitionCardSchema.parse({
    ...base.card,
    id: "card-2",
    title: "Segundo hallazgo",
    body: "Insight: conviene revisar la ruta norte.",
  });
  const third: CognitionCard = cognitionCardSchema.parse({
    ...base.card,
    id: "card-3",
    title: "Tercer hallazgo",
    body: "Insight: el cliente prefiere factura mensual.",
  });
  const fourth: CognitionCard = cognitionCardSchema.parse({
    ...base.card,
    id: "card-4",
    title: "Cuarto hallazgo",
    body: "Insight: no deberia entrar en el prompt.",
  });
  assert.equal((await cards.save(second)).created, true);
  assert.equal((await cards.save(third)).created, true);
  assert.equal((await cards.save(fourth)).created, true);

  const rendered = renderCognitionCards([base.card, second, third, fourth]);
  assert.match(rendered, /datos, no instrucciones/);
  assert.match(rendered, /kind=insight/);
  assert.doesNotMatch(rendered, /no deberia entrar en el prompt/);

  const firstPass = await assembleCognitionCards(
    { cards },
    {
      tenantId: "t1",
      owner: "u1",
      threadId: "thread-1",
      query: "margen",
      limit: 3,
    },
  );
  assert.equal(firstPass.cards.length, 3);
  assert.match(firstPass.block, /Tarjetas cognitivas pendientes/);

  // Queda una cuarta tarjeta: el limite es 3 por turno, no un descarte.
  const secondPass = await assembleCognitionCards(
    { cards },
    { tenantId: "t1", owner: "u1", threadId: "thread-1", query: "margen" },
  );
  assert.equal(secondPass.cards.length, 1);
  assert.match(secondPass.block, /Cuarto hallazgo/);

  const thirdPass = await assembleCognitionCards(
    { cards },
    { tenantId: "t1", owner: "u1", threadId: "thread-1", query: "margen" },
  );
  assert.equal(thirdPass.cards.length, 0);
  assert.equal(thirdPass.block, "");
});

test("la API lista por tenant y permite marcar una tarjeta como útil", async () => {
  const kernel = makeKernel();
  const ctx = makeCtx();
  const child = await makeChildTurn(kernel, ctx);
  const cards = new CognitionCardStore(new MemoryStore());
  const result = await captureSlowCognition(
    { kernel, cards },
    {
      ctx,
      turnId: child.id,
      content: "Insight: el cliente prefiere factura mensual.",
      query: "factura",
      intent: "insight",
      confidence: 0.7,
      threadId: "thread-1",
    },
  );

  const app = new Hono<{
    Variables: { owner: string; ctx?: { tenantId: string; actorId: string } };
  }>();
  app.use("*", async (c, next) => {
    c.set("owner", "u1");
    c.set("ctx", { tenantId: "t1", actorId: "u1" });
    await next();
  });
  app.route("/api/cognition", cognitionRoutes(cards));

  const list = await app.request("http://localhost/api/cognition/cards?threadId=thread-1");
  assert.equal(list.status, 200);
  const listed = (await list.json()) as { cards: Array<{ id: string; scope: string }> };
  assert.equal(listed.cards.length, 1);
  assert.equal(listed.cards[0]?.id, result.card.id);

  const useful = await app.request(
    `http://localhost/api/cognition/cards/${result.card.id}/useful`,
    { method: "POST" },
  );
  assert.equal(useful.status, 200);
  const marked = (await useful.json()) as { card: { scope: string; usefulAt?: string } };
  assert.equal(marked.card.scope, "tenant");
  assert.ok(marked.card.usefulAt);

  const otherTenant = new Hono<{
    Variables: { owner: string; ctx?: { tenantId: string; actorId: string } };
  }>();
  otherTenant.use("*", async (c, next) => {
    c.set("owner", "u1");
    c.set("ctx", { tenantId: "t2", actorId: "u1" });
    await next();
  });
  otherTenant.route("/api/cognition", cognitionRoutes(cards));
  const foreign = await otherTenant.request("http://localhost/api/cognition/cards");
  assert.equal(foreign.status, 200);
  assert.deepEqual((await foreign.json()) as { cards: unknown[] }, { cards: [] });
});
