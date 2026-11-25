# T4 — diffs candidatos core, revisión estática
Prevalece sobre T2/T3 en estos símbolos. No código aplicado.
## P01 agent.ts (503e0c7e2babf631b3a3601a43fdcd4a3048b959)
El blob actual NO importa CognitionV2ChatAgent ni monta V2. ownerFor cambia identidad pero sigue ConversationAgent. Sustituir factoría completa, preservando configuración remota:
```ts
// nuevo import
import { CognitionV2ChatAgent } from "./engine/cognition/v2/chat-agent.ts";
// dentro de makeRuntime, sustituir ownerFor y agents:
const agents: AgentsFactory = async ({ request }) => {
  if (config.agentBackend === "agui") {
    return { default: new HttpAgent({
      url: config.agentUrl ?? "http://127.0.0.1:1/unconfigured",
      headers: config.agentToken ? { Authorization: `Bearer ${config.agentToken}` } : {},
    }) };
  }
  const v2 = service.cognitionV2;
  if (v2?.enabledForRequest()) {
    const scope = currentTenantScope();
    if (!scope?.actorId) throw Error("DENIED");
    return { default: new CognitionV2ChatAgent(v2, scope.actorId) };
  }
  return { default: new ConversationAgent(config, service,
    await auth.owner(request.headers.get("authorization") ?? undefined)) };
};
```
Precondition: authenticated route/thread scope verified by Trans01; enabledForRequest cannot authorize anonymous request. Preserve agentConfigured until inspect provider configuration; do not accidentally require legacy API key for V2 without ADR. Test sample and normal opt-in actual V2 stream, opt-out legacy, AGUI remote explicit, missing scope deny, no fallback on stream failure. Existing clone test before changing clone; installed AbstractAgent not inspected. Rollback restore factory, keep V2 data.
## P03 graph.ts d895576fb3bd11bf676a469914c634aba02810f9
cognitive-reference.ts actual enum event/thought/entity/memory/card/document/receipt; record kind enum differs. No universal cast. Proposed graph traversal only card/memory endpoints until explicit entity/other family resolver approved. Preserve other evidence in record and evidence() route; do not expose historical endpoints as current.
Import cognitiveEdgeSchema and CognitiveRef from domain. Replace rows generic with {data:unknown}; parse safeParse. Replace inner loop:
```ts
const parsed = cognitiveEdgeSchema.safeParse(data);
if (!parsed.success) continue;
const edge = parsed.data;
if (edge.tenantId !== identity.tenantId ||
    edge.from.tenantId !== identity.tenantId ||
    edge.to.tenantId !== identity.tenantId ||
    edgeIds.has(edge.id)) continue;
const from = await resolveEndpoint(edge.from);
const to = await resolveEndpoint(edge.to);
if (!from || !to) continue;
const current = nodes.find(n => n.id === nodeId);
if (!current || ![from,to].some(n => n.id === current.id && n.revision === current.revision)) continue;
const other = from.id === nodeId ? to : from;
if ((!visited.has(other.id) && nodes.length >= 50) || edges.length >= 100) {
  truncated = true; continue;
}
if (!visited.has(other.id)) {
  visited.add(other.id); nodes.push(other); next.push(other.id);
}
edgeIds.add(edge.id); edges.push(edge);
```
Declare edgeIds Set<string>, truncated=false and local async resolveEndpoint(ref:CognitiveRef) => null unless ref.kind card/memory; resolve(identity,ref.id,ref.revision), return only if record.kind===ref.kind. Root may be non-card/memory, then no graph edges under conservative policy; flag product contract for entity traversal, do not silently claim parity. Return truncated || nodes.length>=50; mark truncated if SQL limit reached (conservative). Final revalidate every node and identity, no edge whose endpoints absent. Bound DB query count by visited nodes; test two-way duplicate, old revision, wrong kind, inaccessible endpoint, >50 nodes, >100 edges, malformed edge, cross tenant. Existing evidence() separate: final revalidate root exact revision, card/memory kind check; thought/event/document/receipt family verification remains P03 contract, do not pretend all solved.
## P02 attention.ts 45312a2fc9e6a6d048beaf803cc96dbd2d683521
Already delegates getSnapshot and uses contextScorer; retract claim of two independent rankers. Minimal signature change select(identity,query,maxTokens,maxRefs=50), pass maxRefs into getSnapshot; route caller passes parsed maxRefs only after verifying schema. Preserve default 50 and Fast 10. Test same query/budget/snapshot inputs same refs; differing budgets intentionally differ. read() currently trusts selected data after snapshot authorization; reconstruct selected from authorized refs and same scorer only if query available (currently digest only); otherwise validate IDs/revisions/epistemic/signals and digest against stored id, no claim of score authenticity. Do not store raw query solely for this purpose. Explicit design pending.
## Gate
These are candidate hunks, not compiled. No score uplift claimed without checking route consumers, tests and external ABI. T3 8.7 remains last full evaluation. No functional code, tests, merge or deploy.
