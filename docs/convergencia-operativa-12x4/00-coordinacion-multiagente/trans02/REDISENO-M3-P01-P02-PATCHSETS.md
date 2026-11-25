# Patchsets ejecutables candidatos — P01 y P02

Rama Trans02. Documentación exclusivamente. Ejecutar cuando la barrera canónica y el fundador autoricen implementación; no iniciar ahora. Complementa T4 y prevalece sobre sus hunks incompatibles solo tras revisión. No detenerse entre subpatchsets independientes. Preflight: comparar blobs, si difieren reconciliar hunk con código actual, no aplicar a ciegas. No cambiar AGUI externo, legacy, UX ni dominio.

## P01.1 — montar el adapter existente
Archivo apps/server/src/agent.ts, blob 503e0c7e. Adapter chat-agent.ts 3ab50c7e, constructor (Pick<CognitionV2Runtime,"chat">, owner). Sustituir únicamente ownerFor y factory, añadir import.

```diff
+import { CognitionV2ChatAgent } from "./engine/cognition/v2/chat-agent.ts";
@@
-  const ownerFor = async (request: Request) => service.cognitionV2?.enabledForRequest()
-    ? currentTenantScope()!.actorId
-    : auth.owner(request.headers.get("authorization") ?? undefined);
-  const agents: AgentsFactory = async ({ request }) => ({
-    default:
-      config.agentBackend === "sample"
-        ? new ConversationAgent(
-            config,
-            service,
-            await ownerFor(request),
-          )
-        : config.agentBackend === "agui"
-          ? new HttpAgent({
-              url: config.agentUrl ?? "http://127.0.0.1:1/unconfigured",
-              headers: config.agentToken ? { Authorization: `Bearer ${config.agentToken}` } : {},
-            })
-          : new ConversationAgent(
-              config,
-              service,
-              await ownerFor(request),
-            ),
-  });
+  const agents: AgentsFactory = async ({ request }) => {
+    if (config.agentBackend === "agui") {
+      return { default: new HttpAgent({
+        url: config.agentUrl ?? "http://127.0.0.1:1/unconfigured",
+        headers: config.agentToken ? { Authorization: `Bearer ${config.agentToken}` } : {},
+      }) };
+    }
+    const cognition = service.cognitionV2;
+    if (cognition?.enabledForRequest()) {
+      const scope = currentTenantScope();
+      if (!scope) throw Error("COGNITION_SCOPE_REQUIRED");
+      return { default: new CognitionV2ChatAgent(cognition, scope.actorId) };
+    }
+    return { default: new ConversationAgent(config, service,
+      await auth.owner(request.headers.get("authorization") ?? undefined)) };
+  };
```

Precondición: verificar middleware app.ts y semántica enabledForRequest para impedir que scope ausente de tenant opt-in caiga en legacy. Si no puede distinguirse sin identidad autenticada, resolverla antes de selección con contrato Trans01; no aprobar P01 hasta ello. Verificar precedencia AGUI con política canónica y que sample opt-in tenga proveedor Fast sintético. No capturar excepción para fallback. Mantener clone/run existentes; comprobar ABI instalada con typecheck. Tests: matriz sample/local/agui × opt-in/no opt-in, ausencia de scope, clone y callback, concurrencia A/B, error Fast sin fallback, tools vacío. Probar handler real, no solo factory. Rollback: revertir montaje mediante commit y desactivar opt-in bajo aprobación; nunca fallback automático.

## P02.1 — integridad de snapshot
Archivo apps/server/src/engine/cognition/v2/context.ts, blob 84d17ebc. Extraer serialización existente sin cambiar formato:

```ts
function segmentText(r: CognitiveRecord): string {
  return JSON.stringify({ title: r.title, content: r.body, epistemic: r.epistemic, evidence: r.evidence,
    ...(r.ontology ? { ontology: { version: r.ontology.ontologyVersion, family: r.ontology.family,
      review: r.ontology.review, disputed: r.ontology.disputed, profile: r.ontology.profile } } : {}),
    ...(r.runtimeOutcome ? { ontology: { version: r.runtimeOutcome.ontologyVersion, family: "outcome",
      review: "runtime_receipt", scope: r.runtimeOutcome.scope } } : {}) });
}
```
En getSnapshot reemplazar el JSON.stringify inline por segmentText(r). En readSnapshot sustituir desde const s = row?.data hasta return s:

```ts
const s = row?.data;
if (!s || s.schemaVersion !== "2.0" || s.id !== id ||
    !Number.isFinite(Date.parse(s.expiresAt)) || Date.parse(s.expiresAt) <= this.clock() ||
    digest(s.identity) !== digest(identity) ||
    !Array.isArray(s.refs) || !Array.isArray(s.segments) ||
    s.refs.length !== s.segments.length || s.refs.length > 200 ||
    !Number.isSafeInteger(s.maxTokens) || s.maxTokens < 0) return null;
const seen = new Set<string>();
const segments: ContextSnapshotV2["segments"] = [];
let usedTokens = 0;
for (const ref of s.refs) {
  if (!ref || typeof ref.id !== "string" || seen.has(ref.id) ||
      !Number.isSafeInteger(ref.revision)) return null;
  seen.add(ref.id);
  const record = await this.resolve(identity, ref.id, ref.revision);
  if (!record || record.sourceEventId !== ref.sourceEventId ||
      record.kind === "thought_ref" || record.kind === "entity_ref") return null;
  const text = segmentText(record);
  const tokens = this.countTokens(text);
  usedTokens += tokens;
  segments.push({ refId: ref.id, text, trust: "untrusted_data", tokens });
}
if (usedTokens !== s.usedTokens || usedTokens > s.maxTokens ||
    digest(segments) !== digest(s.segments)) return null;
const content = { identity, refs: s.refs, segments, watermark: s.watermark,
  usedTokens, maxTokens: s.maxTokens, queryDigest: s.queryDigest };
if (digest(content) !== s.digest) return null;
await this.assertAuthorized(identity);
return { ...s, segments };
```

Antes de aplicar verificar digest canonicalization en storage.ts y schema límites exactos (200 es techo defensivo candidato, no ampliar schema). Añadir validación de estructura completa con schema local estricto, createdAt y TTL máximo; no confiar en digest no autenticado como autorización. Rechazar snapshots antiguos incompatibles y regenerar por prepared; no reparar contenido corrupto. Probar JSONB roundtrip y custom token counter. Test manipulación body, refs duplicadas, sourceEventId, tokens, expiry NaN, revisión superseded, ACL revocada, queryDigest, digest, orden. Preservar ranking compartido contextScorer y delta. Si JSONB reordena propiedades, comparar digest canónico; no introducir false negatives. Rollback no volver a servir snapshots corruptos; desactivar cache y regenerar con autorización.

## P02.2 — delivery terminal
Mismo blob, reserve SQL. Hunk mínimo:
```diff
-        WHERE tenant=$1 AND id=$2 AND actor=$3 AND status<>'acknowledged' AND (lease_until IS NULL OR lease_until<=$5) RETURNING fence
+        WHERE tenant=$1 AND id=$2 AND actor=$3 AND status='pending' AND (lease_until IS NULL OR lease_until<=$5) RETURNING fence
```
Recovery existente es único camino leased/rendered expirado → pending o invalidated; revisar callers que esperan reclaim directo y adaptar a recovery explícito sin romper SLA. Invalidated y acknowledged terminales. Conservar ID y fence. No modificar ACK a browser. Tests: invalidated no reserva, expired leased no reserva hasta recover, recover incrementa fence, ACK viejo falla, ACK repetido mismo receipt idempotente, otro receipt falla, dos reservas PG una gana. Verificar recuperación worker y readiness. No migración destructiva. Rollback no reintroducir predicado amplio; conservar fix mínimo.

## Secuencia macroturno de ejecución (cuando autorizado)
1. Preflight blobs, branch, contratos y fixtures; resolver bloqueos de P01 sin detener P02 independiente.
2. Aplicar P02.1/2, tests focales context/delivery/recovery, typecheck.
3. Aplicar P01, tests handler real y aislamiento. Si falla ABI, corregir dentro de superficie autorizada.
4. Ejecutar pnpm typecheck y ALLOW_NETWORK=0 pnpm test:cognition-v2; gate PG según scripts existentes. Registrar comandos, exit codes, logs, SHA, tests no ejecutados y razón.
5. Commit por patchset, actualizar TURNOS/HANDOFF con evidencia; no desplegar ni mergear. Parar en barrera autorizada, no entre pasos.

Estado: hunks documentales no aplicados ni compilados. P01 depende de preflight middleware; P02 depende de digest/schema y callers de recovery. No declarar PASS ni 9.2. P03–P14 continúan en T2/T3/T4 y requieren consolidación posterior.
