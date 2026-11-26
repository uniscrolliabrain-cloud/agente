# D-M2 — reservas concretas y contratos de enlace

Este documento precisa 03 sin sustituir propiedad histórica no verificada. Todas las reservas nuevas son candidatas hasta D-M3/autorizar ejecución; no autoriza escribir otras ramas. Un escritor por path; nunca dos agentes cambian el mismo archivo en paralelo. Los 50 paths del manifest tienen dueño explícito. Para cualquier archivo ausente de esta lista y los patchsets originales, solicitar reserva; no usar glob como autorización. T01–T06 conservan propiedad de documentación propia; Trans00 solo coordinación.

| Path real (prefijo apps/server/src/ salvo indicada) | Escritor | Revisor / entrega |
|---|---|---|
| actions.ts | 01 | 03 contrato receipt y opt-out; 02 outcome projector |
| db.ts, db-tenant.ts | 01 | 04 RLS y 03 credential revision |
| engine/service.ts, engine/sop-executor.ts, engine/capabilities/bootstrap.ts | 01 | 02/03/04 wiring y pruebas |
| engine/events/bus.ts, engine/events/sinks/store.ts, engine/events/types.ts, engine/events/index.ts, engine/events/service-principal.ts | 01 | 02 durable sink, 04 telemetry; closed types preservados |
| engine/execution/capability-runner.ts, outcome.ts, tool-executors.ts | 01 | 03 adapter class y 02 verified receipts |
| app.ts, index.ts, engine/conversation.ts | 01 | 02 factory/mount; 03 workspace/voice; 04 lifecycle/alerts; 06 Meta/Promoter |
| engine/circuit-breaker.ts | 01 | 02 quota/cancel, 03 providers |
| kernel/audit/store-store.ts | 01 | 04 certification |
| kernel/graph/store-store.ts, kernel/graph/in-memory-store.ts, kernel/graph/store.ts, kernel/graph/turn.ts | 01 | 06 tests structural identity; reservar cambios schema |
| agent.ts, cognition-v2-routes.ts, cognition-worker-entry.ts | 02 | 01 montaje y scope, 04 worker lifecycle |
| engine/cognition/v2/context.ts, attention.ts, runtime.ts, chat-agent.ts, slow-observation.ts, slow.ts, inference.ts, storage.ts, projector.ts, graph.ts, memory.ts, rag.ts | 02 | 05 longitudinal, 06 organización, 01 events, 03 voice |
| engine/cognition/v2/provider.ts, jev-classifier.ts, jev-egress.ts, rls.ts, kernel-receipts.ts, runtime-outcome.ts, business-read.ts, workers.ts, delivery-recovery.ts, presenter.ts | 02 | 03 provider ABI/consent; 04 RLS/hooks; 01 receipt |
| engine/cognition/chromatic/card-ontology.ts, ontology-registry.ts; packages/domain/src/cognition-v2.ts, cognitive-reference.ts, card-ontology.ts | 02 | 06 pure helpers/ontology review, 01 ABI; no redefinir 6 polos |
| google-auth.ts, workspace.ts, engine/whatsapp-inbound.ts, engine/whatsapp-outbound.ts, whatsapp-routes.ts, voice-routes.ts | 03 | 01 authority, 02 binding cognitivo |
| engine/voice-v2/contracts.ts, coordinator.ts, fast-adapter.ts | 03 | 02 shared fast runtime; no segundo motor |
| engine/leads.ts | 03 | 01 guarda envío en actions.ts |
| packages/integrations/src/google.ts, google-maps.ts, meta-whatsapp.ts, stubs/whatsapp.ts, resend.ts | 03 | 01 outcome contract |
| engine/observability/hooks.ts | 04 tras transferencia formal desde 01 | preservar export existente; 01 sigue escribiendo productores propios |
| metrics/registry.ts, metrics-exporter.ts, middleware/request-logger.ts, alerts/service.ts, alerts/definitions.ts, backup.ts, backup-tenant.ts | 04 | 01 monta, 02/03/05/06 instrumentation propia |
| scripts/gate-report.ts, gate-cognition-v2.ts, secrets-check.ts, provision-vertical-slice.ts, scripts/lib/vertical-slice-bundle.ts | 04 | 01/02/03 contratos y evidencia |
| deploy/secrets.manifest.json y scripts/secrets-manifest.ts (nuevos candidatos), .github/workflows/ci.yml, deploy.yml | 04 | conservar legal check, no despliegue; owner review |
| package.json, pnpm-lock.yaml, pnpm-workspace.yaml | 04 | cambios por reserva, lock coherente, conservar main |
| packages/domain/src/execution-context.ts, index.ts | 01 | 02/03/05/06 entregan exports tipados |
| packages/domain/src/longitudinal.ts y nuevos módulos longitudinales exactos que justifique P02–P10 | 05 | 02 escribe modificaciones a store/runtime, 04 RLS review |
| kernel/graph/attention.ts, consolidate.ts, promote.ts, rules.ts; kernel/observers/meta.ts | 06 | 01 writes callsite/store; 02 ontology/presentation; conservar pure first |
| docs/operacion/SECRETOS.md | pendiente reserva, 04 candidato | no tocar hasta acordar propietario |
| tests/gate/idempotency-execution.test.ts, tests/trans01-* | 01 | 04 auditor |
| tests/trans02-* y tests/cognition-v2-context-cache.test.ts, memory-attention, rag, security-context, faults, slow-lanes, ontology, runtime, http, rls, postgres, rls-modules y demás cognition-v2-* existentes | 02 | 04 certifica RLS, 05/06 aportan casos, 03 aporta voice cases; path histórico tests/cognition-v2-voice.test.ts queda 02 hasta transferencia explícita |
| tests/vertical-slice-leads.test.ts, tests/connections-adapters.test.ts, tests/trans03-* | 03 | 01/02 reviewers; no relajar Meta test |
| tests/trans04-*, tests/backup-restore.test.ts, tests/tasks-reassign.test.ts (reserva histórica de diagnóstico) | 04 | 01/02 revisan |
| tests/trans05-* | 05 | 02 y 06 |
| tests/trans06-* | 06 | 01 y 02 |

Prefijos de test nuevos solo habilitan nuevos archivos del dueño; los nombres abreviados cognition-v2 corresponden a `tests/cognition-v2-<nombre>.test.ts`. No reservar un test ajeno con nombre alternativo para evitar revisión. Cambios adicionales en domain/ports/business graph/schema-registry requieren reserva individual; no introducir entidad empresarial en cognitionRecord por conveniencia.

## Contratos existentes que se adoptan como punto de partida, no ABI inventada

### K1 identidad/autoridad

`packages/domain/src/execution-context.ts` f96148cd ya exige tenantId, owner, actorId, role, requestId y permite approvalId separado de sessionId. No volver a inventar ExecutionContext. A01 claim expectedHash ya presente en DB 30a66bfc, propagación y tests. Validar actual callsites (incluye legacy y system principal) y usar aprobación vinculada a revisión y actor autenticado. No utilizar persona como principal. Una aprobación histórica no se vuelve rechazo por resultado de efecto. 01 publica tipos exactos del delta existente y sus tests, 02/03/04 consumen.

### K2 efecto / receipt

`engine/execution/outcome.ts` 006ce2ae exporta AdapterOutcomeClass (rejected_before_dispatch, failed_without_effect, accepted, confirmed, unknown), classifyAdapterFailure, classifyAdapterResult, confirmed/accepted helpers y requiresReconciliation. Adoptar este discriminante existente; no crear otro enum de adapter. No usar status HTTP como prueba de no efecto sin contrato. Tipo específico de receipt durable se acuerda sobre estructura real Action/dispatch/operation, no congelar schema nuevo en esta pasada. T03 declara evidencias por familia (Calendar versión/receipt del provider, Gmail id no delivery, WhatsApp accepted no delivery, Google Places lectura malformada no empty, Resend id). T01 persiste y reconcilia; T02 proyección reportada, verified_fact solo verificador de familia. T04 gate. Compatibilidad: preservar wrappers legacy explícitos sin permitir que string retorno acredite gobernado.

### K3 bus, proyección, cursor

`engine/events/index.ts` 1f8d9120 exporta bus, types, StoreSink/Query, service-principal. `cognition/v2/storage.ts` af4a25c9 mantiene DurableEventSink, sequence bigint y DurableProjector. No dos buses activos: sink V2 extiende write para journal y records en mismo scope/tx verificado; 01/02 prueban commit/rollback, idempotencia exacta y orden causal, distinguir seq store legacy de seq journal V2 (no asumir equivalentes). Cada consumidor su cursor y lease, no saltar eventos. Los IDs de correlación/causación no son claves de autoridad. Evento derivado sin principal/evidencia se deniega. Corrección de G01-03 añade filtros al replay existente. Trans02 no abre otro projector para Trans05/06.

### K4 Fast, Slow, JEV y contexto

`chat-agent.ts` 3ab50c7e ya adapta run y clone; `slow-observation.ts` 09c39a22 ya valida source/actor, excluye self-derived, verifyObservation default false. Falta montar factory/consumer real; no fabricar verificador con `true`. `runtime.ts` 776d1567 revalida snapshot antes de receipt (delta existente) y usa ledger; conservar. `context.ts` prepara refs exactas, maxTokens conservador bytes, digest, cursor. A03 y A12 robustecen, sin llamada Slow/JEV/RAG externa en request Fast. La API HTTP actual /slow requiere snapshot y encola análisis manual; no convertirla en endpoint de ejecución. Fast solo comunica/registro autenticado de intención. Slow propone por circuito gobernado. JEV semantic-only y egress autorizado. Adición de thread/policy a memoria longitudinal debe pasar revisión de schema/identity; no fallback actor-only ni contexto entre chats.

### K5 voz

`voice-v2/fast-adapter.ts` 1f0f8dba comprueba contextSnapshotId pero llama chat sin pasarlo. A13 acuerda con T02 binding comprobable del snapshot efectivamente consumido (puede requerir entrada interna tipada o receipt retornado; no aceptar ID de cliente como autoridad). T03 mantiene coordinator y epoch/consent; playback ACK distinto de receipt texto. No otro prompt/motor para voz. Test doble snapshot, cancelación y revocación exacta.

### K6 observabilidad

`engine/observability/hooks.ts` 4d2d8c68 ya exporta KernelStage, KernelStageStatus, KernelObservation, KernelTelemetrySink, registerKernelTelemetrySink y observeKernel. Transferencia de owner 01→04 se registra antes de primer cambio. No API paralela H01. El sink puede devolver Promise; observeKernel no await y captura error, pero sink.record ejecuta parte síncrona: 04 garantiza enqueue barato y acotado, no I/O sync, shutdown/deregister y dropped metrics, no alterar resultado del runtime. H02/H03 extender compatible solo tras verificar productores y consumidores; 01/02/03 instrumentan propios paths. El correlationId interno no es label exportable. Usar atributos allowlisted y vínculo local autorizado para bus/grafo/cards; no texto ni secretos a Grafana. 04 mantiene registry único. index.ts de 01 recibe snapshot/alerts real de 04, no acceder privadamente a Map sin contrato.

### K7 secrets/deploy

T04-S se mantiene con fuente explícita; S0/S2 primero sin despliegue, S1 adaptación workflow solo tras autorización de modificación funcional; nunca workflow_dispatch/tag. Secretos producción no PR. Supabase operativo según founder, conservar DSN/cifrado, no cambiar proveedor ni sobreescribir vacío. `CognitionV2Runtime.create` recibe classifier opcional; `app.ts` actual no lo inyecta. T02 define wiring JEV; T03 confirma provider; T01 monta composición si hace falta. Fast/Slow requieren provider/model/key. Grafana endpoint/auth son config; OTEL library no credencial propia. Anam/ElevenLabs candidato ABI, sin inventar session token. Guardar nombres, no valores. `worker` no es único proceso: cognition-worker-entry usa createApp; revisar todos los targets. 

## Resolución de conflictos

- T01/03: A01/P07–09 se entrega primero contrato E03 y tests con adapter simulado; luego WorkspaceService devuelve resultado tipado en camino gobernado; T01 actions consume, T02 projector valida.
- T01/02: A02 breaker define neutral/rejected-before-dispatch, InferenceLane conserva quota/slot y late uncertainty; contrato primero y prueba conjunta.
- T02/05/06: A03/A08 store/context/graph/rag/memory escritor 02, 05 aporta corpus y criterios de continuidad, 06 helpers puros y fixtures de identidad/polaridad. No calibrar score ni duplicar selectors.
- T01/06: A09 funcs writer 06, callers conversation/promoter persistence writer 01; A16 store writer 01 con pruebas 06. Antes de cambiar promotion, trazar todas escrituras para no duplicar efecto.
- T01/04: hook owner 04 tras transferencia, index/app writer 01; H01 contrato primero, mount después; RLS código cognitivo 02, general DB 01, certificación 04. Los logs no son evidencia de autorización.
- T02/03 voz: 03 contratos/coordinator/adapter, 02 runtime/context, 01 mount. Shared test T02 o transferencia antes de editar.
- Tests de integración comunes: T04 publica manifest/gates; cada productor aporta fixture bajo su reserva. No dos agentes escriben test para enmascarar defecto. D-M3 auditor revisa estas reservas contra rutas reales antes de freeze.
