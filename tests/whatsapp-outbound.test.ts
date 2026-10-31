import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { Hono } from "hono";
import { createStore, type Store } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { runInTenantScope, currentTenantScope } from "../apps/server/src/tenant-scope.ts";
import { WhatsAppOutbound, provisionWhatsAppConnection, type OutboundIdentity } from "../apps/server/src/engine/whatsapp-outbound.ts";
import { whatsappRoutes } from "../apps/server/src/whatsapp-routes.ts";
import { AppError, OutcomeUnknownError } from "../packages/domain/src/errors.ts";

let db: Store, directory: string;
const encryptionKey = randomBytes(32).toString("base64");
const recipient = "34600111222";
before(async () => { directory = await mkdtemp(join(tmpdir(), "wa-outbound-")); db = await createStore({ dataDir: join(directory, "db") }); });
after(async () => { await db?.close(); await rm(directory, { recursive: true, force: true }); });
function deferred<T>() { let resolve!: (v: T) => void; const promise = new Promise<T>((r) => { resolve = r; }); return { promise, resolve }; }
async function fixture() {
  const owner = randomUUID();
  const a: OutboundIdentity = { tenantId: "company-a", owner, actorId: owner };
  const b: OutboundIdentity = { tenantId: "company-b", owner, actorId: owner };
  const scoped = new TenantScopedStore(db, async () => { const scope = currentTenantScope(); if (!scope) throw new Error("Missing test scope"); return scope.tenantId; });
  const run = <T>(identity: OutboundIdentity, fn: () => T) => runInTenantScope({ tenantId: identity.tenantId, actorId: identity.actorId }, fn);
  let now = new Date(), enabled = true;
  const calls: Array<{ to: string; text: string; generation: string; apiKey: string }> = [];
  let send: (to: string, text: string) => Promise<{ id: string; accepted: boolean; to: string }> = async (to) => ({ id: "provider-1", accepted: true, to });
  const sender = (connection: { generation: string }, apiKey: string) => ({ sendText: async (to: string, text: string) => { calls.push({ to, text, generation: connection.generation, apiKey }); return send(to, text); } });
  const client = () => new WhatsAppOutbound(scoped, { encryptionKey, enabled, now: () => now, sender });
  const provision = (identity = a, opts: Partial<Parameters<typeof provisionWhatsAppConnection>[2]> = {}) => run(identity, () => provisionWhatsAppConnection(scoped, identity, {
    baseUrl: "https://evolution.example.test", instance: identity.tenantId, apiKey: `private-key-${identity.tenantId}`, enabled: true, allowedRecipients: [recipient], ...opts,
  }, encryptionKey));
  await provision(a); await provision(b);
  return { a, b, scoped, run, calls, provision, client, now: () => now,
    setSend: (fn: typeof send) => { send = fn; }, setEnabled: (value: boolean) => { enabled = value; }, advance: (ms: number) => { now = new Date(now.getTime() + ms); },
    create: (identity = a, key = "intent-0001", to = recipient, text = "Confirmar cita") => run(identity, () => client().createDraft(identity, { to, text }, key)),
    approve: (id: string, revision: string, identity = a) => run(identity, () => client().approve(identity, id, revision)),
    reject: (id: string, revision: string, identity = a) => run(identity, () => client().reject(identity, id, revision)),
    list: (identity = a) => run(identity, () => client().drafts(identity)),
    connection: (identity = a) => run(identity, () => scoped.get<Record<string, unknown>>(identity.owner, "whatsapp-connections", "whatsapp")),
    draft: (id: string, identity = a) => run(identity, () => scoped.get<Record<string, unknown>>(identity.owner, "whatsapp-drafts", id)),
    operation: (id: string, identity = a) => run(identity, () => scoped.get<Record<string, unknown>>(identity.owner, "whatsapp-outbound-operations", id)),
  };
}

test("operator provisioning encrypts credentials, restricts URLs and never returns a secret", async () => {
  const f = await fixture();
  const publicConnection = await f.provision();
  assert.equal("secret" in publicConnection, false);
  assert.ok(!JSON.stringify(await f.connection()).includes("private-key-company-a"));
  for (const baseUrl of ["http://internal", "file:///etc/passwd", "https://user:pass@example.test", "https://example.test?token=abc"]) {
    await assert.rejects(f.provision(f.a, { baseUrl }), /HTTPS|URL/);
  }
});
test("draft creation is idempotent, normalizes phone and refuses changed content", async () => {
  const f = await fixture(), first = await f.create(f.a, "intent-0001", `+${recipient}`);
  assert.equal(first.to, recipient); assert.match(first.revision!, /^[a-f0-9]{64}$/);
  assert.equal((await f.create()).id, first.id);
  await assert.rejects(f.create(f.a, "intent-0001", recipient, "Otro texto"), /Idempotency-Key/);
  assert.equal(f.calls.length, 0);
});
test("concurrent approvals dispatch exactly one attempt and preserve the approved snapshot", async () => {
  const f = await fixture(), draft = await f.create(), gate = deferred<void>();
  f.setSend(async (to) => { await gate.promise; return { id: "actual-message", accepted: true, to }; });
  const approvals = Array.from({ length: 16 }, () => f.approve(draft.id, draft.revision!));
  while (!f.calls.length) await new Promise((r) => setTimeout(r, 5));
  gate.resolve();
  const results = await Promise.all(approvals);
  assert.equal(f.calls.length, 1);
  assert.ok(results.every((r) => r.status === "accepted" || r.status === "dispatching"));
  assert.equal((await f.operation(draft.id))?.status, "accepted");
  assert.equal((await f.list())[0].status, "accepted");
  assert.equal(f.calls[0].text, "Confirmar cita");
  assert.equal(f.calls[0].apiKey, "private-key-company-a");
});
test("reject and approve race has one durable decision and never rejects an accepted attempt", async () => {
  const f = await fixture(), draft = await f.create();
  const results = await Promise.allSettled([f.reject(draft.id, draft.revision!), f.approve(draft.id, draft.revision!)]);
  const operation = await f.operation(draft.id);
  assert.ok(operation?.status === "rejected" || operation?.status === "accepted");
  assert.equal(f.calls.length, operation?.status === "accepted" ? 1 : 0);
  assert.ok(results.some((r) => r.status === "fulfilled"));
  if (operation?.status === "accepted") await assert.rejects(f.reject(draft.id, draft.revision!), /decision/);
});
test("rejection replay is stable and cannot be undone by approval", async () => {
  const f = await fixture(), draft = await f.create();
  await f.reject(draft.id, draft.revision!);
  assert.equal((await f.reject(draft.id, draft.revision!)).status, "rejected");
  assert.equal((await f.approve(draft.id, draft.revision!)).status, "rejected");
  assert.equal(f.calls.length, 0);
});
test("one user in two companies has isolated drafts, connection keys and decisions", async () => {
  const f = await fixture(), a = await f.create(f.a), b = await f.create(f.b);
  assert.notEqual(a.id, b.id);
  await assert.rejects(f.approve(a.id, a.revision!, f.b), /not found/);
  await Promise.all([f.approve(a.id, a.revision!, f.a), f.approve(b.id, b.revision!, f.b)]);
  assert.deepEqual(new Set(f.calls.map((c) => c.apiKey)), new Set(["private-key-company-a", "private-key-company-b"]));
  assert.deepEqual((await f.list(f.a)).map((d) => d.id), [a.id]);
  assert.deepEqual((await f.list(f.b)).map((d) => d.id), [b.id]);
});
test("unknown, copied or missing connection never falls back to the global client", async () => {
  const f = await fixture(), copied = (await f.connection(f.a))!;
  await f.run(f.b, () => f.scoped.put(f.b.owner, "whatsapp-connections", copied as { id: string }));
  await assert.rejects(f.create(f.b), /no pertenece/);
  const c = { ...f.a, tenantId: "unknown-company" };
  await assert.rejects(f.create(c), /Provisiona/);
  assert.equal(f.calls.length, 0);
});
test("content changes invalidate approval and old terminal ledger defeats a legacy overwrite", async () => {
  const f = await fixture(), draft = await f.create();
  const stored = (await f.draft(draft.id))!;
  await f.run(f.a, () => f.scoped.put(f.a.owner, "whatsapp-drafts", { ...stored, id: draft.id, text: "Manipulado" }));
  await assert.rejects(f.approve(draft.id, draft.revision!), /ha cambiado/);
  assert.equal(f.calls.length, 0);
  await f.run(f.a, () => f.scoped.put(f.a.owner, "whatsapp-drafts", { ...stored, id: draft.id }));
  await f.approve(draft.id, draft.revision!);
  await f.run(f.a, () => f.scoped.put(f.a.owner, "whatsapp-drafts", { ...stored, id: draft.id, status: "awaiting_review" }));
  assert.equal((await f.approve(draft.id, draft.revision!)).status, "accepted");
  assert.equal(f.calls.length, 1);
});
test("rotation, disabling, allowlist and expiration block effects before approval", async () => {
  const f = await fixture(), draft = await f.create();
  f.setEnabled(false); await assert.rejects(f.approve(draft.id, draft.revision!), /no esta activada/);
  f.setEnabled(true); f.advance(31 * 60_000); await assert.rejects(f.approve(draft.id, draft.revision!), /caducado/);
  f.advance(-31 * 60_000); await f.provision(f.a, { enabled: false });
  await assert.rejects(f.approve(draft.id, draft.revision!), /desactivada/);
  await f.provision(); await assert.rejects(f.approve(draft.id, draft.revision!), /ha cambiado/);
  await assert.rejects(f.create(f.a, "intent-0002", "34999999999"), /lista del piloto/);
  assert.equal(f.calls.length, 0);
});
test("ambiguous transport failure is durable and retry never dispatches again", async () => {
  const f = await fixture(), draft = await f.create();
  f.setSend(async () => { throw new OutcomeUnknownError("secret/provider payload must not be stored"); });
  assert.equal((await f.approve(draft.id, draft.revision!)).status, "outcome_unknown");
  assert.equal((await f.approve(draft.id, draft.revision!)).requiresReconciliation, true);
  assert.equal(f.calls.length, 1);
  assert.ok(!JSON.stringify(await f.operation(draft.id)).includes("secret/provider"));
});
test("definite provider rejection becomes failed and also requires a new intent", async () => {
  const f = await fixture(), draft = await f.create();
  f.setSend(async () => { throw new AppError("Rejected", 422); });
  assert.equal((await f.approve(draft.id, draft.revision!)).status, "failed");
  await f.approve(draft.id, draft.revision!); assert.equal(f.calls.length, 1);
});
test("crash after the effect and before result persistence does not permit another attempt", async () => {
  const f = await fixture(), draft = await f.create();
  let failed = false;
  const faulty = new Proxy(f.scoped, { get(target, name) { if (name === "compareAndSwap") return async (...args: Parameters<TenantScopedStore["compareAndSwap"]>) => {
    if (args[1] === "whatsapp-outbound-operations" && !failed) { failed = true; throw new Error("Injected persistence failure"); }
    return target.compareAndSwap(...args);
  }; const value = Reflect.get(target, name); return typeof value === "function" ? value.bind(target) : value; } });
  const client = new WhatsAppOutbound(faulty, { encryptionKey, enabled: true, now: f.now, sender: () => ({ sendText: async (to) => { f.calls.push({ to, text: "", generation: "", apiKey: "" }); return { id: "already-sent", accepted: true, to }; } }) });
  await assert.rejects(f.run(f.a, () => client.approve(f.a, draft.id, draft.revision!)), /Injected/);
  assert.equal((await f.approve(draft.id, draft.revision!)).status, "dispatching");
  assert.equal(f.calls.length, 1);
});
test("a persisted dispatch reservation before effect is never silently replayed", async () => {
  const f = await fixture(), draft = await f.create();
  await f.run(f.a, () => f.scoped.put(f.a.owner, "whatsapp-outbound-operations", {
    id: draft.id, draftId: draft.id, ...f.a, revision: draft.revision, status: "dispatching", startedAt: "2020-01-01T00:00:00Z",
  }));
  assert.equal((await f.approve(draft.id, draft.revision!)).status, "dispatching");
  assert.equal((await f.list())[0].requiresReconciliation, true);
  assert.equal(f.calls.length, 0);
});
test("legacy drafts are visible but cannot be approved without explicit context and connection", async () => {
  const f = await fixture();
  await f.run(f.a, () => f.scoped.put(f.a.owner, "whatsapp-drafts", { id: "old", to: recipient, text: "legacy", status: "awaiting_review" }));
  assert.equal((await f.list())[0].needsReprepare, true);
  await assert.rejects(f.approve("old", "0".repeat(64)), /antiguo/);
});
test("closing and reopening the real Store retains the terminal decision", async () => {
  const f = await fixture(), draft = await f.create();
  await f.approve(draft.id, draft.revision!);
  await db.close(); db = await createStore({ dataDir: join(directory, "db") });
  const reopened = new TenantScopedStore(db, async () => currentTenantScope()!.tenantId);
  const client = new WhatsAppOutbound(reopened, { encryptionKey, enabled: true, sender: () => ({ sendText: async () => { throw new Error("Must not resend"); } }) });
  assert.equal((await f.run(f.a, () => client.approve(f.a, draft.id, draft.revision!))).status, "accepted");
});
test("HTTP routes require the reviewed revision and explicit authorized tenant", async () => {
  const f = await fixture();
  const app = new Hono<{ Variables: { owner: string } }>();
  app.onError((e, c) => c.json({ error: e.message }, e instanceof AppError ? e.status : 500));
  app.use("*", async (c, next) => { c.set("owner", f.a.owner); await f.run(f.a, next); });
  app.route("/api/whatsapp", whatsappRoutes({ db: f.scoped, config: { encryptionKey, mode: "live" }, tenantService: undefined } as Parameters<typeof whatsappRoutes>[0]));
  const created = await app.request("/api/whatsapp/drafts", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": "http-intent-0001" }, body: JSON.stringify({ to: recipient, text: "HTTP draft" }) });
  assert.equal(created.status, 201);
  const { draft } = await created.json();
  const noRevision = await app.request(`/api/whatsapp/drafts/${draft.id}/send`, { method: "POST" });
  assert.equal(noRevision.status, 422);
  const rejected = await app.request(`/api/whatsapp/drafts/${draft.id}/reject`, { method: "POST", body: JSON.stringify({ revision: draft.revision }), headers: { "Content-Type": "application/json" } });
  assert.equal(rejected.status, 200);
  const responseText = await (await app.request("/api/whatsapp/connection")).text();
  assert.ok(!responseText.includes("private-key")); assert.ok(!responseText.includes('"secret"'));
});

test("manual reconciliation requires provider evidence, records the actor and never resends", async () => {
  const f = await fixture(), draft = await f.create();
  f.setSend(async () => { throw new OutcomeUnknownError(); });
  await f.approve(draft.id, draft.revision!);
  const input = { revision: draft.revision, result: "provider_accepted", providerId: "confirmed-provider-id", evidenceRef: "provider-check:001", providerChecked: true };
  await assert.rejects(f.run(f.a, () => f.client().reconcile(f.a, draft.id, { ...input, providerChecked: false })), /Comprueba/);
  await assert.rejects(f.run(f.b, () => f.client().reconcile(f.b, draft.id, input)), /no encontrada/);
  const result = await f.run(f.a, () => f.client().reconcile(f.a, draft.id, input));
  assert.equal(result.status, "accepted"); assert.equal(result.reconciled, true);
  assert.equal((await f.list())[0].requiresReconciliation, false);
  const operation = await f.operation(draft.id);
  assert.equal((operation?.reconciliation as { actorId: string }).actorId, f.a.actorId);
  assert.equal((await f.run(f.a, () => f.client().reconcile(f.a, draft.id, input))).status, "accepted");
  await assert.rejects(f.run(f.a, () => f.client().reconcile(f.a, draft.id, { ...input, result: "confirmed_not_sent" })), /otra reconciliacion/);
  await f.approve(draft.id, draft.revision!); assert.equal(f.calls.length, 1);
});
test("confirmed not sent closes ambiguity but cannot reuse the same approval to retry", async () => {
  const f = await fixture(), draft = await f.create();
  f.setSend(async () => { throw new OutcomeUnknownError(); }); await f.approve(draft.id, draft.revision!);
  const result = await f.run(f.a, () => f.client().reconcile(f.a, draft.id, { revision: draft.revision, result: "confirmed_not_sent", evidenceRef: "check-002", providerChecked: true }));
  assert.equal(result.status, "failed");
  assert.equal((await f.approve(draft.id, draft.revision!)).status, "failed"); assert.equal(f.calls.length, 1);
});

test("credential ciphertext cannot be transplanted between tenants or connection generations", async () => {
  const f = await fixture(), aConnection = (await f.connection(f.a))!, bConnection = (await f.connection(f.b))!;
  await f.run(f.b, () => f.scoped.put(f.b.owner, "whatsapp-connections", { ...bConnection, id: "whatsapp", secret: aConnection.secret }));
  const draft = await f.create(f.b);
  await assert.rejects(f.approve(draft.id, draft.revision!, f.b), /credencial/);
  assert.equal(f.calls.length, 0);
});
test("corrupted expiry cannot grant an unbounded approval", async () => {
  const f = await fixture(), draft = await f.create(), stored = (await f.draft(draft.id))!;
  await f.run(f.a, () => f.scoped.put(f.a.owner, "whatsapp-drafts", { ...stored, id: draft.id, expiresAt: "not-a-date" }));
  const current = (await f.list())[0];
  await assert.rejects(f.approve(current.id, current.revision!), /caducado/); assert.equal(f.calls.length, 0);
});
test("live HTTP approval uses the exact reviewed revision and remains accepted rather than delivered", async (t) => {
  const f = await fixture(), requests: RequestInit[] = [];
  const oldFlag = process.env.WHATSAPP_OUTBOUND_ENABLED;
  process.env.WHATSAPP_OUTBOUND_ENABLED = "true";
  t.after(() => { if (oldFlag === undefined) delete process.env.WHATSAPP_OUTBOUND_ENABLED; else process.env.WHATSAPP_OUTBOUND_ENABLED = oldFlag; });
  t.mock.method(globalThis, "fetch", async (_url: unknown, init: RequestInit) => { requests.push(init); return Response.json({ key: { id: "http-confirmed" } }); });
  const app = new Hono<{ Variables: { owner: string } }>();
  app.onError((e, c) => c.json({ error: e.message }, e instanceof AppError ? e.status : 500));
  app.use("*", async (c, next) => { c.set("owner", f.a.owner); await f.run(f.a, next); });
  app.route("/api/whatsapp", whatsappRoutes({ db: f.scoped, config: { encryptionKey, mode: "live" }, tenantService: undefined } as Parameters<typeof whatsappRoutes>[0]));
  const created = await app.request("/api/whatsapp/drafts", { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": "http-approved-001" }, body: JSON.stringify({ to: recipient, text: "Mensaje aprobado en HTTP" }) });
  const { draft } = await created.json();
  const approve = () => app.request(`/api/whatsapp/drafts/${draft.id}/send`, { method: "POST", body: JSON.stringify({ revision: draft.revision }), headers: { "Content-Type": "application/json" } });
  const responses = await Promise.all([approve(), approve(), approve()]);
  assert.ok(responses.every((r) => r.status === 200 || r.status === 202));
  assert.equal(requests.length, 1);
  assert.deepEqual(JSON.parse(requests[0].body as string), { number: recipient, text: "Mensaje aprobado en HTTP" });
  const listed = await (await app.request("/api/whatsapp/drafts")).json();
  assert.equal(listed.drafts[0].status, "accepted"); assert.equal(listed.drafts[0].providerId, "http-confirmed");
});
test("HTTP session mode refuses an implicit or ambiguous company", async () => {
  const f = await fixture();
  for (const memberships of [[], [{ tenantId: "a" }, { tenantId: "b" }]]) {
    const app = new Hono<{ Variables: { owner: string } }>();
    app.onError((e, c) => c.json({ error: e.message }, e instanceof AppError ? e.status : 500));
    app.use("*", async (c, next) => { c.set("owner", f.a.owner); await next(); });
    app.route("/api/whatsapp", whatsappRoutes({ db: f.scoped, config: { encryptionKey, mode: "live" }, tenantService: { membershipsFor: async () => memberships } } as unknown as Parameters<typeof whatsappRoutes>[0]));
    assert.equal((await app.request("/api/whatsapp/drafts")).status, 409);
  }
});

test("sample HTTP mode cannot activate real outbound even when the flag is present", async (t) => {
  const f = await fixture();
  const oldFlag = process.env.WHATSAPP_OUTBOUND_ENABLED;
  process.env.WHATSAPP_OUTBOUND_ENABLED = "true";
  t.after(() => { if (oldFlag === undefined) delete process.env.WHATSAPP_OUTBOUND_ENABLED; else process.env.WHATSAPP_OUTBOUND_ENABLED = oldFlag; });
  const app = new Hono<{ Variables: { owner: string } }>();
  app.onError((e, c) => c.json({ error: e.message }, e instanceof AppError ? e.status : 500));
  app.use("*", async (c, next) => { c.set("owner", f.a.owner); await f.run(f.a, next); });
  app.route("/api/whatsapp", whatsappRoutes({ db: f.scoped, config: { encryptionKey, mode: "sample" }, tenantService: undefined } as Parameters<typeof whatsappRoutes>[0]));
  const draft = await f.create();
  const response = await app.request(`/api/whatsapp/drafts/${draft.id}/send`, { method: "POST", body: JSON.stringify({ revision: draft.revision }), headers: { "Content-Type": "application/json" } });
  assert.equal(response.status, 503); assert.equal(await f.operation(draft.id), null);
});
test("a connection endpoint changed without rotating its encrypted binding is rejected", async () => {
  const f = await fixture(), connection = (await f.connection())!;
  await f.run(f.a, () => f.scoped.put(f.a.owner, "whatsapp-connections", { ...connection, id: "whatsapp", baseUrl: "https://other.example.test" }));
  const draft = await f.create();
  await assert.rejects(f.approve(draft.id, draft.revision!), /credencial/); assert.equal(f.calls.length, 0);
});

test("explicitly foreign draft metadata is refused rather than rendered as legacy content", async () => {
  const f = await fixture();
  await f.run(f.a, () => f.scoped.put(f.a.owner, "whatsapp-drafts", { id: "foreign", tenantId: f.b.tenantId, owner: f.a.owner, to: recipient, text: "foreign private content", status: "awaiting_review" }));
  await assert.rejects(f.list(), /otra empresa/);
});
test("outbound identity must match the active execution scope", async () => {
  const f = await fixture();
  await assert.rejects(f.run(f.a, () => f.client().createDraft(f.b, { to: recipient, text: "Wrong scope" }, "wrong-scope-001")), /Scope/);
  await assert.rejects(f.client().drafts(f.a), /Scope/);
});
test("HTTP output refuses a raw unscoped Store even with an authenticated identity", async () => {
  const f = await fixture();
  const app = new Hono<{ Variables: { owner: string } }>();
  app.onError((e, c) => c.json({ error: e.message }, e instanceof AppError ? e.status : 500));
  app.use("*", async (c, next) => { c.set("owner", f.a.owner); await f.run(f.a, next); });
  app.route("/api/whatsapp", whatsappRoutes({ db, config: { encryptionKey, mode: "live" }, tenantService: undefined } as Parameters<typeof whatsappRoutes>[0]));
  assert.equal((await app.request("/api/whatsapp/drafts")).status, 503);
});
