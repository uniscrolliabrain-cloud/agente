# Mapa de implementación y consumidores

| Campaña | Código real | Consumidor / prueba |
|---|---|---|
| C01 | packages/domain/src/cognition-v2.ts | runtime, source schemas, context, Slow, tests de contrato |
| C02 | db.ts, db-tenant.ts, engine/events/bus.ts, engine/cognition/v2/storage.ts | StoreSink/journal y DurableProjector; pruebas de crash, 501 eventos, fencing y Postgres |
| C03 | engine/cognition/v2/projector.ts, graph.ts | grafo de referencias de Cards/Memory/Thought; API graph y verificación de fuentes |
| C04 | engine/cognition/v2/memory.ts, rag.ts; engine/rag.ts contentDigest | FiveMemories y PreparedRagContext; API working/memories/rag/prepare; registry real |
| C05 | engine/cognition/chromatic/ontology-registry.ts | registro cerrado, sin semántica activa; test de rechazo de aprobación inventada |
| C06 | engine/cognition/v2/attention.ts, projector.ts meta_hint | GlobalAttentionWorkspace; snapshots persistentes e invalidación |
| C07 | engine/cognition/v2/slow.ts, provider.ts, workers.ts; kernel.captureAsyncResult | output checkpoint→validación→Thought+event source; worker dedicado/embebido |
| C08 | slow.ts RulesClassifier/SemanticClassifier, domain classificationV2Schema | clasificación opcional con timeout y fallback; sin cliente JEV supuesto |
| C09 | storage.ts CognitiveProjectionStore; context.ts CardDeliveryLedger | reserva/render/ACK interno del consumidor Fast, separado del conocimiento |
| C10 | context.ts, rag.ts | facade auth-first, snapshots preparados/delta/refs, validez transitiva por registry |
| C11 | inference.ts, runtime.ts, conversation.ts early V2 branch | configuración por carril, admisión SQL, presupuestos de llamadas, timeout y cancelación |
| C12 | presenter.ts; web/components/chat/* | journey factual y UI SVG/reduced-motion; sin porcentajes ni fases temporizadas |
| C13 | engine/voice-v2/* | VoiceTurnCoordinator + CognitionFastVoiceAdapter; no provider activo |
| C14 | engine/security-v2/* y SDK alpha.2 | capabilities nominadas, delegación de un uso, relay y cognitiveSecurityProjector |
| C15 | tests/cognition-v2-*.test.ts; scripts/gate-cognition-v2.ts | 27 casos nuevos registrados al congelar; ver resultados reales, no asumir PASS |

## Ruta sustitutiva

HTTP autenticado → resolveTenantPrincipal/AsyncLocalStorage → ConversationAgent selecciona V2 por allowlist → identity fresca (membership, actor activo, tenant no suspendido) → ContextServing.prepared → revalidación justo antes de dispatch → carril Fast propio → streaming AG-UI → receipt durable con el mismo texto emitido → ACK interno de delivery.

Trabajo de análisis explícito → cola Slow durable → lease/fence → perfil Slow independiente → output persistido → extracción y evidencia estrictas → kernel Thought idempotente en turno cerrado propio → source event y estado de job en transacción → proyector recuperable → Card/Graph/MetaHint → siguiente snapshot Fast.

Cyber SDK/Python outbox → inbox/proyección minimizada local → source journal V2 en la misma transacción → ACK hijo → proyector Card → contexto privado. `partial`, `blocked`, `not_reported` nunca se convierten en protección certificada.

La ruta V2 no importa el ensamblaje one-shot legacy. Reutiliza las primitivas que conservan autoridad y evidencia; no reintroduce cromos en el kernel.
