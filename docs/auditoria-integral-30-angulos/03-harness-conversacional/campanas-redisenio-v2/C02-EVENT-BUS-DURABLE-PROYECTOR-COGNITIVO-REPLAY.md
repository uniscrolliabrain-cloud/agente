# C02 — Event Bus durable, proyector cognitivo recuperable, replay, ACK y aislamiento
**Programa:** Opción 3 · `uniscrolliabrain-cloud/agente` · **Turno 03/16** · 2026-11-15.
**Estado de este documento:** AUDITORÍA ESTÁTICA + CAMPAÑA IMPLEMENTABLE. **Código V2 no escrito, tests no ejecutados**.
**Precedentes obligatorios:** [C00](./C00-REVISION-ULTRAGRANULAR-AUDITORIA-INCREMENTAL.md), [C01](./C01-REVISION-ULTRAGRANULAR-CONTRATOS-Y-TAXONOMIA-V2.md), [ADR-009](../ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md).
**Alcance:** repo padre `agente`. Cyber es repositorio hijo; su outbox será integrado en C14 y solo aporta restricciones contractuales aquí.

## 0. Resultado objetivo, no solución conservadora
Implementar sobre el Event Bus **una capa durable de proyección** con: commit/receipt de evento autoritativo, cursores por tenant/consumer/version, inbox idempotente, lease/fencing, replay paginado y ordenado, backpressure, retries, DLQ, proyecciones shadow y activación reversible. La nueva capa construirá proyecciones cognitivas para grafo/memorias/cromos/atención/Slow sin autorizar acciones por sí misma.

**No confundir:** evento escrito ≠ subscriber llamado ≠ proyección confirmada ≠ resultado de negocio verificado. El kernel/policy/SOP sigue siendo autoridad. El runtime de Fast no espera a Slow ni al proyector en su hot path.

## 1. Código realmente auditado en main y SHA de archivo
| Ruta | SHA de archivo | Evidencia |
|---|---|---|
| `apps/server/src/engine/events/bus.ts` | `21fe61384c6f12002d2e41bea172819c607629c7` | emit, resolveTenant, replayTenant, dedupe, purge |
| `apps/server/src/engine/events/subscriber.ts` | `43a1dd9d7e4f96dc3ce1f09259b721f0cd60ef59` | owner/tenant/all, publish síncrono, captura errores |
| `apps/server/src/engine/events/sinks/store.ts` | `659fd85a1d0f9bf62ba5f730235defcc97260055` | StoreSink insertIfAbsent; StoreQuery SQL/list |
| `apps/server/src/engine/events/schema-registry.ts` | `f0379f09273376494f63ec3bf126510242787ac8` | registry type@version |
| `apps/server/src/engine/events/schemas.ts` | `2c42374e304332eead29dfb7a2c8a309932c1504` | Record cerrado por tipo; schemas workspace passthrough |
| `apps/server/src/engine/events/types.ts` | `1e00fb0381281aa57999a98ee48b47fd453e3f71` | SystemEvent schemaVersion 1.0, source, tenant, owner |
| `apps/server/src/kernel/subscribers/events.ts` | `83ea2edeecf84113f414e154bbb743c9097d149e` | subscribeAll y async no esperado |
| `apps/server/src/kernel/cognition/cycle.ts` | `92466f716b23b4a72f7ebe0a0dba9813be60a9be` | openTurnIdempotent + appendThought + close |
| `apps/server/src/engine/service.ts` | `a5f7ac6932c70066dd1e6a8f94edf8e67efe5dcb` | seis consumidores globales, maintain y consolidación |
| `tests/event-bus.test.ts` | `8f19422f6350252b2f51e458968823921cd9a25d` | cobertura schema y smoke emit; no certifica ACK/replay |

Estos son SHA de **blob de archivo** obtenidos de GitHub, no SHA commit de `main`. La implementación debe fijar commit base actual antes de cualquier edición.

## 2. Hallazgos incrementales C02-F01–F16
**F01 — Emisión con error ambiguo:** `EventBus.emit` captura errores de validación, persistencia, dedupe y notificaciones en un solo `try/catch`, devolviendo `persisted:false`. Una excepción **después** de `sink.write` puede ocultar un evento realmente escrito. Solución: separar fases y receipts sin falsear durabilidad.

**F02 — `insertIfAbsent` sin comprobación:** `StoreSink.write` espera el método pero ignora su retorno; si devuelve null por ID duplicado, la llamada no lo distingue. No concluir que siempre se pierden eventos: exigir test específico.

**F03 — Entrega live no durable:** `publish` invoca callbacks síncronos y cuenta callbacks que retornan, no trabajo async completado.

**F04 — Excepciones de subscribers silenciadas:** `subscriber.ts` captura `throw` sin emitir error ni DLQ. El consumidor del kernel además captura fallos en tarea `void async` y solo registra warning.

**F05 — Replay existe pero no certifica recuperación:** `replayTenant` usa `scanByPrefix` opcional y devuelve 0 si no existe; límite 200, orden por emittedAt+id, filtro sinceId posterior a scan. No se observa cursor durable, paginación completa ni estrategia para >200.

**F06 — Inconsistencia de orden:** `sinceId` compara IDs ULID; replay ordena por `emittedAt` y después ID. No asumir que los dos órdenes son intercambiables, especialmente con reloj desfasado.

**F07 — Resolución tenant fallback:** `resolveTenant` termina devolviendo owner si falta tenant; emite métrica en ciertos casos. Para proyección cognitiva multiempresa debe ser fail-closed, sin inventar tenant.

**F08 — Dedupe no es transacción con evento:** `isDuplicate` y `recordDedupe` rodean la escritura; la comprobación y la escritura no forman una operación atómica única. `recordDedupe` puede fallar y solo emitir backgroundFailure. El dedupe de emisor no sustituye inbox idempotente del proyector.

**F09 — Key de dedupe por owner:** la deduplicación indexa por owner; un mismo owner con varias empresas requiere namespace de tenant explícito en contratos V2. No cambiar V1 a ciegas.

**F10 — Query `sinceId` no homogénea:** `StoreQuery.recent` filtra sinceId en fallback JS, pero el SQL mostrado no lo incluye. Es posible que una ruta de lectura ignore ese filtro según backend.

**F11 — Query por owner vs replay por tenant:** StoreSink almacena bajo owner; `replayTenant` intenta `scanByPrefix("system-events",tenantId,...)`. Verificar `Store`, `TenantScopedStore` y SQL real antes de afirmar que el replay funciona en producción para todas las empresas.

**F12 — `runCognitionCycle` idempotencia parcial:** apertura `openTurnIdempotent`, pero el método `appendThought` se llama incluso al reintentar; investigar si la capa Kernel deduplica por thought/event, no darlo por garantizado.

**F13 — Loop guard insuficiente como arquitectura:** subscriber ignora eventos `kernel.*`, pero las proyecciones nuevas deben marcar origen/causation y rechazar loops entre familias cognitivas.

**F14 — Registro de esquemas parcial:** `SchemaRegistry` admite múltiples versiones, pero `EventBus.emit` selecciona `payloadSchemas[type]` y escribe `schemaVersion:"1.0"`. La evolución de payloads requiere API explícita y readers versionados.

**F15 — Workspace `.passthrough()`:** muchos payloads aceptan campos extra. La proyección debe normalizar y validar por versión/producer y no interpretar esos campos como autoridad.

**F16 — Test de emisión débil:** `tests/event-bus.test.ts` verifica que `emit` no lanza y que se guardó al menos un evento; puede pasar aunque otras emisiones fallen con `persisted:false`. Ampliar asserts por cada tipo.

## 3. Decisión arquitectónica vinculante
```text
Emisor autorizado → Schema Registry/Policy → Event Store autoritativo
                                            ├─ Receipt persistido/duplicado/fallido
                                            ├─ subscribers live (SSE/UI, no ACK durable)
                                            └─ durable projector worker
                                                  ├─ Event cursor / lease / fence
                                                  ├─ Inbox (tenant, consumer, version, eventId)
                                                  ├─ deterministic projection plan
                                                  ├─ atomic projection + checkpoint
                                                  ├─ graph/memory/attention/cromo sinks
                                                  ├─ retry/backoff/DLQ
                                                  └─ cognition change notification
                                                         → C09 cards / C10 context
```
**No introducir otro bus autoritativo**. Live se conserva para UX hasta migración, pero el proyector durable es el único escritor de cada proyección bajo su consumerVersion. Cada sink tiene ownership claro. La proyección no genera órdenes SOP ni concede permisos. C02 prepara las interfaces de los sinks cognitivos; C03–C10 implementan sus dominios.

## 4. Contratos propuestos para C02
### 4.1 EventWriteReceiptV2
```ts
type EventWriteReceiptV2 =
 | {status:"persisted"; eventId:string; tenantId:string; committedAt:string}
 | {status:"duplicate"; eventId:string; tenantId:string; originalEventId:string}
 | {status:"rejected"; reason:"schema"|"auth"|"tenant"|"conflict"; retryable:false}
 | {status:"failed"; phase:"storage"|"unknown"; retryable:boolean; eventId?:string};
```
**Importante:** si la escritura pudo completarse pero se perdió confirmación, `unknown` obliga a reconciliar por operationId; nunca reemitir ciegamente un evento factual con ID nuevo. Un error de notificación o subscriber **no modifica** un receipt ya confirmado como persistido.

### 4.2 ProjectorCursorV2
```ts
type ProjectorCursorV2 = {
 tenantId:string; consumerId:string; consumerVersion:string;
 partitionId:string; lastCommittedSequence:string;
 leaseOwner:string; leaseToken:string; leaseUntil:string;
 revision:number; updatedAt:string;
};
```
`lastCommittedSequence` exige un orden durable definido por el store. **No utilizar emittedAt como orden de commit** ni suponer que ULID garantiza orden de commit bajo concurrencia. Investigar secuencia SQL o índice de commit y diseñar backfill sin saltos.

### 4.3 ProjectionInboxV2
```ts
type ProjectionInboxV2 = {
 tenantId:string; consumerId:string; consumerVersion:string; eventId:string;
 status:"pending"|"processing"|"committed"|"retry"|"dead_letter";
 attempts:number; lastErrorCode?:string; nextAttemptAt?:string;
 leaseToken?:string; projectionDigest?:string; committedAt?:string;
};
```
Unicidad por `tenantId+consumerId+consumerVersion+eventId`. El side effect de proyección y checkpoint deben quedar en una transacción, o bien usar outbox/reconciliación determinista con claves únicas. Evitar falsa promesa exactly-once de transporte: se busca **efecto idempotente**.

### 4.4 CognitiveProjectionV2
Entrada: evento autoritativo versionado de C01, contexto autenticado y `projectorVersion`. Salida: mutaciones deterministas de proyección, evidencia referenciada, cambios de índice y eventos derivados no autoritativos. Prohibido invocar Slow/JEV dentro de la transacción de cursor. Slow/JEV son workers asíncronos consumidores de jobs cognitivos, con sus propios receipts.

## 5. Patchsets y rutas de implementación (NUEVOS, salvo indicación)
- **PS02.0 — Auditoría de persistencia real:** inspeccionar `apps/server/src/db.ts`, `db-tenant.ts`, adapters SQL y `Store.insertIfAbsent/scanByPrefix/select`. Entregar `C02/evidence/STORAGE-ATOMICITY.md`. **Gate:** decidir secuencia/índice y límites antes de diseñar cursor.
- **PS02.1 — Receipts:** `packages/domain/src/event-write-receipt-v2.ts` (nuevo), `apps/server/src/engine/events/emit-v2.ts` (nuevo), adapter V1 sin romper `EventBus.emit`. Tests de write succeeded + post-write notify failed + unknown commit.
- **PS02.2 — Event ledger y paging:** `apps/server/src/engine/events/durable/event-reader.ts` y `event-order.ts` (nuevos), SQL migration según backend verificado. Query ordenada, paginada y tenant-scoped; watermark consistente.
- **PS02.3 — Cursor, lease y fencing:** `apps/server/src/engine/events/durable/projector-cursor-store.ts`, `projector-lease.ts` (nuevos); unique keys y CAS/transacción. Test de dos workers y takeover de lease.
- **PS02.4 — Inbox idempotente y commit:** `apps/server/src/engine/events/durable/projection-inbox.ts`, `projection-transaction.ts` (nuevos); operación única o outbox de compensación. Test de crash antes/después de commit.
- **PS02.5 — Runner y scheduler:** `apps/server/src/engine/events/durable/projector-runner.ts`, `projector-registry.ts` (nuevos); worker dedicado o lifecycle integrado tras inspección de `apps/worker` y `service.ts`. No arrancar en imports.
- **PS02.6 — Retry/DLQ/observabilidad:** `apps/server/src/engine/events/durable/retry-policy.ts`, `dead-letter-store.ts`, métricas y traces. Retries exponenciales con jitter, poison isolation, alertas y replay manual auditado.
- **PS02.7 — Proyector cognitivo shadow:** `apps/server/src/kernel/cognition/projector-v2.ts` (nuevo), `event-to-cognition.ts` (nuevo). Shadow escribe namespace separado; no duplicar `runCognitionCycle` V1 ni tarjetas V1.
- **PS02.8 — Activación reversible:** feature flags por tenant/consumerVersion, shadow compare, canary, dual-run **solo con ownership de sinks separado**, stop/rollback y cutover.
- **PS02.9 — Tests/handoff:** tests nuevos `tests/event-receipt-v2.test.ts`, `tests/event-replay-cursor-v2.test.ts`, `tests/projector-crash-recovery.test.ts`, `tests/projector-multitenant.test.ts`, `tests/projector-shadow-parity.test.ts`; reporte y checklist.

**Precisión:** los paths PS02 son **propuestos** y deben ajustarse tras W0 de inventario; no son afirmaciones de archivos existentes.

## 6. Olas secuenciales y gates de Freebuff/Codex
### W0 — Baseline y arquitectura de datos
1. Fijar SHA commit de main y branch de trabajo; revisar C00/C01 y commits posteriores.
2. Inspeccionar DB adapters, schema SQL, stores tenant, tests de bus y llamadas de `emit`.
3. Demostrar con test si `insertIfAbsent` devuelve null, qué ocurre en `scanByPrefix` y qué hace el SQL con `sinceId`.
4. Reportar `C02/evidence/DB-READ-AND-ORDER.md`, `EVENT-EMITTER-CALLS.md`, `TENANT-PARTITIONS.md`.
**Gate:** si no hay lectura incremental fiable, no empezar el proyector.

### W1 — Receipt/commit semantics
1. Separar validación, autorización, persistencia, publish, dedupe y notificación.
2. Añadir `EventWriteReceiptV2` y adapters; no romper V1.
3. Probar fallos inyectados en cada fase; detectar persistido aunque notification falle.
**Gate:** ninguna respuesta `persisted:false` engañosa para una escritura confirmada.

### W2 — Replay paginado, cursor y watermark
1. Elegir orden de commit real; no comparar timestamps e IDs arbitrariamente.
2. Implementar read batch paginado por tenant, cursor y high watermark.
3. Probar >200 eventos, inserción concurrente, clocks alterados, reinicio y filtrado.
**Gate:** ningún evento elegible se pierde ni se cruza de tenant.

### W3 — Inbox + lease/fencing + transacciones
1. Implementar claves únicas, compare-and-swap, lock expiry, fence.
2. Test dos workers mismo tenant, crash tras side effect, crash tras ACK, retry con mismo eventId.
3. Persistir projection digest y checkpoint sin duplicar mutaciones.
**Gate:** una proyección materializada por eventId/version, incluso con redelivery.

### W4 — Projector cognitivo en sombra
1. Mapear solo eventos aprobados del catálogo, rechazar payload inválido.
2. Normalizar `sourceRef`, tenant, actor, correlation, causation; escribir en namespace V2.
3. No producir tarjeta, memoria o cromo definitivo aún; crear proyecciones mínimas y referencias para C03–C10.
4. Verificar que el subscriber V1 sigue funcionando sin dobles escrituras al mismo store.
**Gate:** shadow sin efectos de negocio ni doble ciclo.

### W5 — Resiliencia y seguridad
1. Retry budget, backoff/jitter, DLQ, quarantine por esquema y alertas.
2. Revocación de acceso, tenant eliminado, replay de evento viejo, payload hostil, política nueva.
3. Medir lag por tenant, backlog, failure rate, DLQ, tiempo de recuperación.
**Gate:** no hay escalada de privilegios ni bloqueo del Fast por cola.

### W6 — Observabilidad, integración y certificación
1. Métricas: `event_commit_errors_total`, `projector_lag_events`, `projector_retry_total`, `projector_dlq_total`, `projector_commit_duration_ms`; sin cardinalidad explosiva por tenant en etiquetas.
2. Integrar worker lifecycle tras inspeccionar server/worker y shutdown.
3. Ejecutar typecheck/test/gate y pruebas focalizadas; guardar exit codes, logs redactados y p95 bajo carga reproducible.
4. Comparar shadow vs V1 solo donde semánticas sean comparables; no exigir paridad con comportamiento legacy defectuoso.
**Gate:** contrato C01 validado, replay recuperable, aislamiento, rollback, observabilidad y reportes.

## 7. Matriz de pruebas adversariales obligatoria
| Escenario | Resultado esperado |
|---|---|
| Evento válido + fallo de notificación | receipt de evento persistido; notificación retry independiente |
| Timeout tras escritura sin ACK | estado unknown reconciliable por operationId |
| `insertIfAbsent` duplicado | no confundir inserción duplicada con evento nuevo |
| Subscriber lanza error | persistencia intacta; proyector retry/DLQ |
| 501 eventos y límite 200 | paginación completa sin saltos |
| Eventos mismo timestamp, orden commit distinto | cursor no pierde eventos |
| Crash antes de proyección | reintento procesa evento |
| Crash después de proyección antes de checkpoint | efecto idempotente, no duplicado |
| Dos workers, lease vencido | fence impide commit del worker antiguo |
| Tenant A y B con owner común | separación completa de datos y cursores |
| Tenant ausente y fallback owner | proyector V2 rechaza, no inventa empresa |
| Payload workspace `.passthrough()` hostil | normalización, schema y policy antes de proyección |
| Evento con source `kernel`/cognitivo derivado | sin loop de realimentación |
| Replay tras revocar permisos | no resucita datos visibles ni concesiones |
| Event bus caído, Fast disponible | chat degradado explícito, no bloqueado por Slow |
| Cyber job `partial` o `blocked` | nunca mapear a `completed` |

## 8. Decisiones pendientes P0/P1
- **P0-01:** backend y orden de commit verificables; no seleccionar Postgres/Neon sin verificar código de Store.
- **P0-02:** atomicidad de proyección/ACK; definir transacción o outbox.
- **P0-03:** modelo de tenant/owner en records y queries.
- **P0-04:** reglas de migración de `replayTenant` y `StoreQuery.recent` con sinceId.
- **P0-05:** identidad de evento, operación y dedupe across retries.
- **P0-06:** shadow vs subscriber actual y ownership de stores.
- **P0-07:** fail-closed para missing tenant, permisos y revocación.
- **P1-08:** estrategia de retención de eventos y reconstrucción si `purge(90)` ya eliminó históricos.
- **P1-09:** límites de backlog y coste por tenant.
- **P1-10:** destino de métricas, trazas y panel de Control Center.
- **P1-11:** contrato de entrega de Cyber outbox (C14), sin introducirlo prematuramente.

## 9. Definición de terminado (DoD)
C02 **solo PASS** con evidencia de: commit receipts sin falsos negativos; replay completo; cursor persistido; idempotencia de efectos; lease/fencing; tenant isolation; validación por tipo y versión; DLQ y retry; shadow sin duplicación; pruebas de fallos; métricas; rollback; revisión independiente Codex. Si falta un gate: PARTIAL/BLOCKED, nunca PASS por documentación.

## 10. Reporte y handoff
```yaml
campaign: C02
turn: 03/16
repo: uniscrolliabrain-cloud/agente
branch_documentation: audit/preflight-cognition-option3-20261115
source_ref: main
source_commit_sha: NOT_VERIFIED
status: STATIC_AUDIT_AND_PLAN_ONLY
files_implemented: []
tests_executed: false
runtime_modified: false
deploy: false
merge: false
new_findings: 16
patchsets_planned: 10
waves_planned: 7
next: C03_grafo_cognitivo_multicapa_with_deeper_audit
```
**Aviso:** esta campaña no es una certificación de runtime. El ejecutor debe revalidar HEAD, rutas, dependencias, permisos, schema registry, migrations y stores reales antes de escribir código. El objetivo es **reemplazar las limitaciones del pipeline**, no conservar su comportamiento legacy como requisito.
