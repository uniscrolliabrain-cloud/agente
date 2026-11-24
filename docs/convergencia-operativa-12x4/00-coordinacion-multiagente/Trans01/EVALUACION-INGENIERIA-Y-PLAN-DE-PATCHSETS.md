# Evaluación de ingeniería y plan de patchsets — Trans01

Estado: revisión estática parcial, NO_GO. Base inspeccionada: 5561cf681ec91018e5cfa74384ea11adfc779e48. No se modifica código. No se certifica ejecución. Se contrastaron los doce PATCHSETS.md de campaign/convergencia-operativa-12x4, contrato y wiring de Trans01, HANDOFF, TURNOS, REVISIÓN y especificación T02–T03, y código de actions.ts, EventBus, CapabilityRunner, bootstrap e index.ts. Falta lectura integral del resto del árbol, demo, historial y consumidores; las propuestas pendientes de esa lectura no son instrucciones de implementación autorizadas.

## Autoridad y estado
Kernel decide, runtime ejecuta; SOPs y capabilities son trabajo real. Fast presenta como LAIA u otra persona autorizada sin adquirir autoridad; Slow/JEV proponen, no certifican. El circuito debe conservar tenant, actor, owner, propósito y causalidad desde entrada autenticada hasta receipt, proyección, atención y contexto Fast. No crear segundo bus, runtime, registry ni OAuth. La corrección T02 de decisión ganadora existe: actions.ts:462–470 guarda approval-requests en la transacción de claim. No repetirla. El gate combinado sigue bloqueado.

## Patchsets propios propuestos
Paths relativos a apps/server/src salvo indicación. Los tests y contratos nuevos se indican como propuestas. Cada cambio requiere reserva de paths, aprobación de barrera y evidencia por SHA. No aplicar estos hunks en este turno.

### K01 — aprobación ligada a revisión (F01 P2 W1 T02)
Evidencia: actions.ts:36–52, 449–470. ActionsStore.transaction expone claim y put; claim(owner,id,status,now) no recibe hash. ApprovalRequest se construye antes de claim. Carrera: editar después de lectura, aprobar una revisión distinta. Preservar decisión ganadora atómica y tenant/actor separados. Propuesta: extender claim con expectativa de hash y expiración para approve; inspeccionar implementaciones db.ts/db-tenant.ts antes de fijar ABI. Hunk conceptual en ActionService.decide:
```diff
-        new Date(this.now()).toISOString(),
+        new Date(this.now()).toISOString(),
+        // Nuevo argumento propuesto; implementar en todos los stores.
+        { expectedHash: proposal.hash },
```
El predicado debe verificar estado pendiente, hash y expiry en la misma escritura; no bloquear deny por caducidad sin revisar semántica existente. Si no gana, no ejecutar; diferenciar conflicto de revisión de decisión concurrente. Construir registro de aprobación desde ganador validado. Productor ActionService, consumidor runtime/approval. Tests propuestos: mover T02-approval-scope.test.ts desde docs a tests/trans01-approval-scope.test.ts; barrera edit→claim, deny/approve concurrentes, rollback de put, expiración en barrera, dos tenants mismo actor. Aceptación cero llamadas execute en conflicto. Migración ninguna si hash ya persistido; rollback revertir ABI y callers juntos, sin borrar decisiones.

### K02 — autorización en borde del efecto (F01 P2 W1 T02)
Evidencia: actions.ts:410–438 valida generación y policy antes del claim; :552–557 llama options.execute. CapabilityRunner.run condiciona governance a presencia de cuatro valores y aprobación a db opcional; un montaje incompleto puede omitir controles. Propuesta: perfil gobernado explícito fail-closed, sin alterar V1 hasta inventariar callers. Revalidar PDP, actor/tenant, hash de inputs, operación y conexión justo antes de dispatch; aprobación previa no es autorización indefinida. Hunk conceptual para runner, solo después de resolver selector:
```ts
// Nuevo guard para montaje gobernado, no para todos los callers legacy.
if (!this.governance || !this.getAgentRole || !ctx.roleId || !ctx.actorId || !this.db)
  throw new Error("governed execution context incomplete");
```
No confiar en sessionId ni kind por sí solos: vincular aprobación a operación concreta, inputs, revisión y generación. Coordinar Trans03. Tests: faltar cada dependencia, aprobación ajena o reutilizada, revocar tras claim, conexión rotada, permiso retirado; executor spy = 0. Aceptación: no bypass por configuración parcial. Rollback desactivar perfil nuevo sin activar rutas no gobernadas.

### K03 — claim durable y resultado ambiguo (F01 P2 W1 T02)
Evidencia: engine/execution/capability-runner.ts, CapabilityRunner.run. insertIfAbsent protege claim inicial; failed y stale se escriben con put ordinario; catch de exec.run registra failed incluso si proveedor pudo aceptar. Contraste: actions.ts:570–596 distingue outcome_unknown. Propuesta: reutilizar CAS del Store, extender puerto db del runner previa revisión; transición failed→claimed solo con evidencia de no efecto y CAS sobre estado/revisión; stale→outcome_unknown mediante CAS, no overwrite de done. Fencing monotónico y comprobación en finalización; no prometer exactly-once externo sin soporte del proveedor. Hunk conceptual: reemplazar put de catch por transición CAS a outcome_unknown cuando no hay prueba de rechazo anterior al envío. No inventar clasificación de errores de proveedores: Trans03 entrega discriminante. Tests dos workers, timeout tras aceptación, caída antes de receipt, finalización tardía, stale y done concurrentes. Aceptación: una invocación externa o reconciliación explícita; ningún retry ciego. Expandir claims con campos opcionales; registros antiguos ambiguos no se reenvían. Rollback conservar claims y bloquear ambiguos.

### K04 — causal-1 (F01 P2 W1 T02)
Evidencia: engine/events/bus.ts, EmitOptions, EventBus.emit, resolveTenant; schemaVersion 1.0, tenantId y correlationId existentes, fallback owner, causationId opcional. Propuesta nueva: unión root/derived en opciones gobernadas, actorId obtenido del scope o principal de servicio registrado; exigir correlationId y resolver antecedente durable mismo tenant/correlación para derived. Añadir actorId y causalKind opcionales al registro 1.0 para lectores antiguos; revisar types.ts, schemas.ts, sinks/store.ts antes de editar. No deducir root de ausencia de causationId. Productores runtime y acciones; consumidores kernel/Cognition y Trans04. Tests antecedente ajeno, actor falsificado, root explícito, evento legacy legible, payload inválido. Aceptación cero admisiones gobernadas inválidas; compatibilidad de lectores. Rollback desactivar nuevos productores sin borrar eventos.

### K05 — replay y cursor (F01 P2/P4 W1 T02/T06)
Evidencia directa EventBus.replayTenant: scanByPrefix("system-events",tenantId,limit) precede filtros sinceId/type y sort emittedAt/id. Ventana inicial puede agotar el límite antes del cursor; orden de comparación id no coincide necesariamente con orden temporal. Propuesta: puerto de consulta paginada con cursor durable y orden único (preferir secuencia persistida si existe, verificar store); filtrar tenant y cursor antes de limit en DB. No arreglar elevando límite ni usando scan infinito. Hunk conceptual:
```diff
-    const rows = await db.scanByPrefix<SystemEvent>("system-events", tenantId, limit);
+    // Nuevo puerto a definir tras inspección del store:
+    const rows = await queryPageForTenant(tenantId, filter, limit);
```
Nombre ilustrativo, no API existente. Validar pertenencia del cursor, conservar checkpoint transaccional del consumidor; no ejecutar efectos durante replay. Tests más de 200 eventos, cursor después de primera página, filtro de tipo disperso, mismo timestamp, crash antes/después de checkpoint, cursor B desde A. Aceptación todos los eventos elegibles una vez por proyección lógica. Migración expand/contract del cursor, reanudar desde checkpoint validado; rollback detener consumidor nuevo, conservar eventos.

### K06 — receipt/outbox/inbox (F01 P2 W1 T02)
Evidencia EventBus.emit escribe sink y registra afterCommit; EmitResult.pendingCommit y commitOutcome unknown existen; dedupe TTL/LRU no es exclusión durable de efectos. No sustituir afterCommit por publish inmediato. Nuevo contrato a acordar: receipt versionado con id, tenantId, owner, actorId, operationId, capabilityId, policyRevision, propósito, binding generation, idempotency key, outcome accepted/confirmed/rejected/unknown y evidencia mínima. Persistir receipt y evento en misma transacción local cuando sea posible; resultado de commit desconocido se consulta por id antes de repetir. Consumidor aplica proyección e inbox/checkpoint atómicos. No confundir Slow receipt, ACK de proveedor y hecho verificado. Dependencias Trans02/03/04; inspeccionar DurableProjector y KernelReceiptProjector antes de decidir si basta extenderlos. Tests rollback, crash postcommit prepublish, duplicado, receipt falso, replay sin proveedor. Aceptación cero hechos falsos y cero efectos repetidos. Migración aditiva; rollback detener productores/consumidores nuevos sin borrar historial.

### K07 — composición y deferred (F01 P2 W1 T02)
Evidencia index.ts contiene callback que devuelve deferred_dispatch_unwired y emisión system.maintenance; handoff identifica payload incompleto. No activar callback hasta verificar schema, scope y claim. app.ts/service.ts/agent.ts: anclas de campaña, aún no inspeccionadas aquí. Montar selector único de Trans02 en borde autenticado, V1 opt-out explícito, remoto AG-UI sin fallback por excepción; hooks Trans04 tras ABI. Reservar index.ts antes de editar. Tests HTTP local V2, V1, remoto, persona sin escalada, caída Slow, despacho diferido tras restart y revocación. Aceptación un productor por outcome, Fast independiente, deferred cerrado hasta evidencia. Rollback selector V1 explícito y callback cerrado.

### K08 — registro y slices (F04–05 P2 W2 T03)
Evidencia bootstrapCapabilities registra tools con actionType, family, risk, sideEffects y requiresApproval; CapabilityRunner usa registry y executors. Handoff identifica colisiones send_whatsapp/send_email/create_calendar_event con IDs de Trans03; verificar registro completo antes de añadir alias. No introducir doble executor. Para cada operación WhatsApp, Maps, Calendar, Drive, Gmail y Docs: schema de entrada, PDP, binding de cuenta/generación, claim si efecto, adapter, receipt y evento. Lectura no implica escritura. Paths propios bootstrap.ts, registry.ts, capability-runner.ts; adaptadores son Trans03. Tests por operación con spy, deny/revoke/timeout/replay y A/B. Aceptación un binding por operación y ACK no presentado como entrega. Migración alias versionado solo si consumidores lo requieren; rollback desactivar nuevos bindings conservando receipts. ABI proveedor bloqueada hasta lectura y acuerdo.

### K09 — owner y recompilación (F06–07/11 P2 W2–W3 T03–T04)
Anclas de campaña (no inspeccionadas directamente): scripts/provision-vertical-slice.ts planProvision, PROVISION_STEPS; scripts/lib/agency-bootstrap.ts bootstrapAgency; engine/sop-executor.ts execute/runStep/walk. Trans04 posee provisionamiento y fixtures; Trans01 verifica autoridad y registry. Plan sin escritura, reserva tenant, journal de pasos, consentimiento pendiente, versión SOP y preservación de customizaciones. No usar demo como owner real. Tests dos provisionadores, fallo por paso, repetir bundle, SOP revocado, aislamiento. Aceptación no apply sin autorización y sin pérdida de hechos. Rollback por versión y journal, nunca borrar datos del owner. Bloqueado hasta inspección de scripts y ABI.

### K10 — extensiones gobernadas (F08/10 P2 W3 T04)
Anclas de campaña registry.ts, CapabilityRunner.run y service.ts; tarball ciber y upstream gestoría requieren inventario. Registrar operaciones pasivas y efectos separados; findings son hipótesis hasta verificación, conciliación contable no autoriza pago ni declaración. No modificar adaptadores de Trans03. Tests objetivo fuera de alcance, remediación denegada, duplicado de importación, moneda/periodo y revocación. Aceptación cero efectos no autorizados, receipts trazables. Rollback desactivar registro, preservar evidencia. Firmas y hunks bloqueados hasta verificar upstream.

### K11 — hooks y auditoría cruzada (F02/09 P2–P3 W1/W4 T02/T05)
Anclas de campaña metrics/registry.ts, engine/service.ts, cognition workers; T02 documenta MetricsCollector existente. Trans04 define ABI; emitir señales por etapa (claim, commit, confirmación, proyección), no contar replay como nuevo éxito ni exportar tenant/contenido en labels. Auditar Trans02 sin editar sus paths: ACL snapshot, persona, causalidad, anti-bucle, Fast independiente. Tests rollback/replay cero éxitos adicionales, collector caído, receipt falso, revocación antes de lectura. Aceptación sin doble conteo ni bypass. Rollback retirar hooks sin afectar runtime. Pendiente lectura directa de consumidores.

### K12 — certificación (F12 P3–P4 W4–W5 T05–T06)
Anclas campaña scripts/gate-report.ts, gate-cognition-v2.ts, package.json. No modificar gates para obtener verde. Pruebas Postgres restringido, concurrencia, restore, replay, revocación, caída proveedor y jornada completa con fixtures. Registrar SHA, entorno, comandos, exit codes, skips, artefactos y evidencia negativa. No cerrar ramas sin equivalencia y autorización. Aceptación B6 solo con reproducción independiente; rollback de versión probado y efectos ambiguos conciliados. Estado NOT_RUN.

## Matriz de cobertura y dependencias
P1 = inventario/contrato/prueba roja; P2 = implementación y wiring; P3 = auditoría cruzada/refactor; P4 = hardening/fault injection. W y barreras siguen TURNOS.md; la asignación W anterior es propuesta y requiere contraste con protocolo común.
| Fase | P1 | P2 | P3 | P4 | Dependencia |
|---|---|---|---|---|---|
|01 consolidación|T01 inventario|K01–07|T05 bypass|T06 replay|02/03/04|
|02 observabilidad|ABI|K11|doble conteo|collector caído|04|
|03 proveedores|matriz permisos|K02/K07|egress|revocación|02/03|
|04 WhatsApp|binding|K08|ACK/duplicado|timeout|03|
|05 Google|scopes|K08|ACL/CAS|A/B y cuota|03|
|06 sintética|licencia/seed|K09|deriva|reset test|04|
|07 owner|plan|K09|journal|restore|04|
|08 ciber|alcance|K10|falsos positivos|deny|03|
|09 observabilidad v2|baseline|K11|cardinalidad|incidentes|04|
|10 gestoría|contratos|K10|precisión|no pagos|03|
|11 recompilación|versiones|K09|huérfanos|rollback|02/04|
|12 validación|matriz|K12|auditor independiente|B6|todos|

## Escenarios de aceptación
1. WhatsApp: webhook autenticado y tenant resuelto por Trans03, SOP prepara respuesta, kernel decide, claim y adapter ejecutan, ACK accepted no confirma entrega; receipt y evento durable, proyección, Slow/JEV clasifican evidencia autorizada, Fast comunica estado. Duplicado no reenvía; timeout unknown exige reconciliar.
2. Google: Maps lectura produce candidatos, Gmail/Drive/Docs lectura con ACL y procedencia, Calendar o Gmail escritura separada y aprobada. Revocación entre plan y efecto bloquea ejecución; revocación antes de snapshot excluye referencia. Composio no duplica binding. Anam/ElevenLabs son presentación con consentimiento, no autoridad.
3. Owner: fixture sintético aislado, plan de compilación y journal, autorización antes de apply; ciber finding verificado y gestoría conciliada sin remediación/pago automático. Slow/JEV caídos no bloquean runtime ni Fast. Ninguna tarjeta puede afirmar éxito sin receipt verificado.

## Validación propuesta, no ejecutada
Comandos reales documentados por campaña: pnpm typecheck; pnpm test; pnpm gate; pnpm test:cognition-v2; pnpm verify:slice. Para nuevo test focalizado: pnpm exec tsx --import ./tests/setup.ts --test tests/trans01-approval-scope.test.ts (solo después de moverlo). Verificar descubrimiento por suite global. No se cambió pipeline ni se ejecutó proveedor. No hay resultados PASS.

## Autocrítica y bloqueos
La campaña original acierta en invariantes pero sus patchsets por fase repiten criterios genéricos sin predicados transaccionales, estados ambiguos ni ABI de consumidores. El riesgo más inmediato observado es el salto de autorización condicional y el retry de failed tras resultado externo incierto. La corrección de replay necesita contrato de orden durable, no solo mover un filtro. No puedo especificar con rigor hunks de stores, selector, adaptadores, provisionamiento y proyectores sin leer sus implementaciones completas y tests. Falta comparar historial y ramas por patch-id, leer todo agntia-demo y todos los documentos de coordinación, verificar composición real y ejecutar gates en SHA integrado. Por ello esta entrega es una primera evaluación parcial y no satisface aún la certificación ni la granularidad exhaustiva pedida. No autoriza T03 ni activación B2.


---

# ANEXO V2 — Respuesta a REVISION-EVALUACION-INGENIERIA (c6502b56)

**Resultado documental: ampliado, no certificado. T02/B2 y T03 funcional: NO_GO.** Base de lectura Trans01 `c6502b569162a1ff1e9e9d20b057d0f0af466248`. Se revisaron de forma directa los montajes de app/service/agent/conversation, los stores, el bus, los consumidores, los projectors, el runtime de Cognition, WhatsApp, Google y provisioning; se cotejaron los contratos de trans02, Trans03 y Trans04 y el material agntia-demo. Los fragmentos NUEVOS son propuestas, no funciones ni tests ya instalados. No se modifica código.

## 1. Correcciones con evidencia y contratos existentes

**K01: hash contra la versión reclamada, no volver a implementar lo ya hecho.** `apps/server/src/actions.ts::ActionService.decide` comprueba hash previo a transacción (357–369), pero `tx.claim(owner,id,status,now)` (462–470) ya lee la revisión actual solo para estado, expiración y tarea. `apps/server/src/db.ts::Store.claim` (357–372; blob `d57a47395f41bda1ab4917f875f66e804b4eae4d`) impone SQL `awaiting_review`, `expiresAt > now` y tarea activa cuando status=executing; **no impone hash**. `db-tenant.ts::TenantScopedStore.claim` (72–74) es wrapper con composición tenant/owner. Claim y `approval-requests` ya se escriben en la misma transacción; evitar repetir ese fix. El race relevante: editar con CAS después de get y antes de claim. `ActionService.run` (544+) llama proveedor sin repetir la autorización/credencial inmediatamente antes del efecto.

**K02: no ampliar indiscriminadamente requisitos del runner.** `engine/service.ts` (335–343, blob `8b47bf2619e0b501cdd3a5e49ea030056eefce47`) inyecta `governance`, `getAgentRole` y `db` al `CapabilityRunner`. Pero `capability-runner.ts::run` (20–62, blob `493a3beaecee2510af52e53e7b7be713784ba9f6`) omite consulta si `ctx.actorId` o `ctx.roleId` faltan; `requiresApproval` no consulta DB si la dependencia no se inyectó. `engine/policy/engine.ts::can` permite permisos vacíos en V1; `engine/authz/pdp.ts::PolicyDecisionPoint.can` niega en ausencia de permiso explícito; `AgentGovernance` prefiere PDP cuando existe y cae en PolicyEngine si no. **Perfil V2 gobernado explícito**, sin aplicar el guard a lecturas V1 existentes; ausencia de PDP en modo gobernado siempre niega.

**K03: la base tiene CAS real.** `Store.compareAndSwap(owner,kind,id,expected,patch)` (db.ts:172–183) usa `UPDATE ... WHERE data @> expected RETURNING data` de manera atómica. `insertIfAbsent` usa `ON CONFLICT DO NOTHING`. `Store.transaction` (330–354) fija conexión con AsyncLocalStorage y `afterCommit`. En `CapabilityRunner.run`, `failed -> claimed`, `claimed stale -> outcome_unknown`, y finalización `done/failed` usan `db.put` (77–142), exponiendo carrera y reintento externo ambiguo. Primero ampliar el puerto para CAS y distinguir rechazo pre-dispatch de timeout post-dispatch. `action.ts::run` ya reconoce `outcome_unknown` bajo ciertos errores; ambos flujos se deben reconciliar, no reemplazar.

**K05: dos defectos de consulta distintos.** `engine/events/bus.ts::replayTenant` (246–271, blob `6dfd601db9fd60ad1f0276021fbd5d4c2e9f86ec`) aplica `scanByPrefix(...,limit)` ANTES de `sinceId/type/fecha` y ordena por fecha/ID aunque selecciona cursor por ID. `engine/events/sinks/store.ts::StoreQuery.recent` (44–82, blob `659fd85a1d0f9bf62ba5f730235defcc97260055`) omite `sinceId` en su ruta SQL aunque su fallback sí lo filtra. `Store.scanByOwnerPrefix` ordena por `updated_at`, que no representa el orden causal. No arreglar aumentando limit. Reusar la secuencia por tenant ya creada.

**K06: la infraestructura durable existe.** `engine/cognition/v2/storage.ts` (blob `af4a25c9da5c3259463cf3714578927494cbabc0`) define `DurableEventSink.write` (53–82), que escribe `system-events` y `cognition_v2_events` en la misma transacción para tenants V2, con `cognition_v2_sequences` serializada. `DurableProjector.acquire/batch` (84–142) usa lease y fence, candidato por `sequence` y proyección+inbox+cursor en la misma transacción. `KernelReceiptProjector` (kernel-receipts.ts:9–36, blob `1a16b6770f8b0cc0bd3e08efc8b9b0fbfd97507b`) reutiliza el patrón para audit/notifications. `EventBus.emit` aplica `afterCommit`; `pendingCommit` NO significa resultado persistido definitivo. La necesidad pendiente es el **receipt empresarial verificado**, no un segundo outbox/inbox o EventBus.

**K07: hay dos rutas reales de conversación.** `app.ts::createApp` (blob `96b0aaf5b932fc8eae04bc6ee5c1f653fc0f7f29`) monta EventBus con sink V2, ActionService con `tdb`, AgentService, makeRuntime y la ruta `app.all('/api/copilotkit/*')` (1172). `agent.ts::makeRuntime` (blob `503e0c7e2babf631b3a3601a43fdcd4a3048b959`) elige `HttpAgent` si backend AG-UI remoto; `ConversationAgent.run` (conversation.ts:147) opt-in V2 solo para camino local. Un selector solo dentro de ConversationAgent no resuelve AG-UI. `index.ts:185–201` conserva `deferred_dispatch_unwired` de forma fail-closed; sin embargo emite evento `system.maintenance` con `deferredType` cuando el schema de `events/schemas.ts` requiere `tasks` y `monitors`. Es un bug de telemetría, NO permiso para habilitar dispatch.

**K08: WhatsApp ya posee ejecución idempotente.** `engine/whatsapp-outbound.ts::approve` crea una única `Operation` `dispatching` mediante `insertIfAbsent`, vuelve a verificar generación y destinatario antes de `sendText`, persiste `accepted/outcome_unknown` con CAS por `attemptId`, y `reconcile` exige evidencia sin reenvío. `engine/capabilities/bootstrap.ts` ya declara `send_whatsapp`, `send_email`, `create_calendar_event`; los IDs propuestos por Trans03 son puertos/operaciones a mapear, no nuevos ejecutores independientes. ACK de transporte ≠ entrega.

## 2. Grafo de productores/consumidores, ownership y límites

| Productor verificable | Bus/persistencia | Consumidor verificable | Semántica y límite | Propietario del delta |
|---|---|---|---|---|
| `ActionService.decide/run` | `actions`, `approval-requests`, `action.*` por EventBus | `kernel/subscribers/events.ts`, notificaciones y auditoría según tipo | approve no verifica que proveedor entregó; actor decisor distinto de owner | Trans01 |
| `AgentService` + `SOPExecutor` | `task.*`, `sop.*`, kernel turns/thoughts | Kernel event subscriber, métricas, timeline | task/sop completed no es recibo de efecto externo | Trans01 |
| `EventBus.emit` | StoreSink append-only o DurableEventSink V2; publicación live postcommit | `globalSubscribers` (audit, metrics, notifications, SSE, kernel) | live no garantiza durable processing; dedupe TTL no protege efecto externo | Trans01 |
| `KernelBusEmitter` | `kernel.*` | kernel audit/notifications y proyección durable V2 | `source.personaId` es presentación; kernel subscriber evita bucle `kernel.*` | Trans01 |
| `KernelReceiptProjector` | `cognition_v2_events` → inbox/cursor | `projectKernelAuditEvent`, `projectKernelNotificationEvent` | ambos efectos locales y cursor atómicos, con fence | Trans02 implementación; Trans01 contrato |
| `SlowCognitionQueue.enqueue/tick` | `cognition_v2_slow_jobs`, evento `cognition.v2.slow.status` | `CognitiveProjector.apply`, `RuntimeOutcomeProjector.fromSlowReceipt` | Slow completado verifica **solo trabajo Slow**, nunca venta | trans02 |
| `CognitiveProjector.apply` | `cognition_v2_objects/edges` | `ContextServingFacade.prepared/readSnapshot`, attention | propuesta LLM no puede poner `verified_fact` sin verificador | trans02 + contrato Trans01 |
| `CognitionV2Runtime.chat` | snapshot, chat run, CardDeliveryLedger | Fast/LAIA, cliente UI | `tools:[]`, sin role override; ACK servidor no equivale browser | trans02; montaje Trans01 |
| `WhatsAppOutbound.approve/reconcile` | Operation `dispatching/accepted/failed/unknown` y providerId | API, futuro receipt business | evitar 2.º claim y 2.º send; aceptación no entrega | Trans03 |
| `GoogleAuth`/WorkspaceService | conexión scoped, action y provider execution | ActionService, `system.google_disconnected` | membership, credencial/generation; scopes por operación pendientes | Trans03, Trans01 policy |
| `DeferredActions.tick` | deferred-actions; evento de mantenimiento hoy inválido | supervisor/scheduler | callback negativo evita falso éxito | Trans01 |
| `MetricsCollector` + métricas del bus | registry Prometheus por proceso | observabilidad/Trans04 | no contar replay/rollback como éxito adicional ni publicar PII | Trans04 ABI T04-H01, hooks Trans01 |

**Cadena futura completa, con etapas probadas separadamente:** entrada autenticada → scope tenant/actor → PDP/kernel → SOPExecutor o CapabilityRunner (sin executor duplicado) → adapter → estado de operación + receipt durable → EventBus + DurableEventSink → DurableProjector/inbox → verificador empresarial específico → tarjeta con procedencia → observación elegible Slow/JEV minimizada → ACL ContextServingFacade/attention → Fast/LAIA. Si Fast propone otra acción, vuelve a la autorización inicial. Hoy no está certificada la cadena empresarial completa; las partes cognitivas y de persistencia existen.

## 3. Especificaciones K01–K07, ABI y hunks auditables

Las firmas actuales reproducidas abajo son existentes; los tipos NUEVOS y diffs son **candidatos**, sujetos a aprobación de ownership y pruebas de compilación. No usar los puntos suspensivos documentales como parche literal.

### K01.A — claim hash atómico (F01/P2/W1/T02)

**Antes:** `ActionsStore.claim<T>(owner,id,status,now):Promise<T|null>`, implementada por `Store.claim` y `TenantScopedStore.claim`. **Después propuesto:** añadir `expectedHash?:string`, obligatorio para aprobación gobernada, manteniendo estado/expiración/tarea tal como están.

```diff
# actions.ts::ActionService.decide, dentro de db.transaction
       const winner = await tx.claim<ActionProposal>(
         owner, id, decision === "deny" ? "denied" : "executing",
-        new Date(this.now()).toISOString(),
+        new Date(this.now()).toISOString(), proposal.hash,
       );
-      if (winner) await tx.put(owner, "approval-requests", approval);
+      if (winner) await tx.put(owner, "approval-requests", {
+        ...approval, payload: { data: winner.data, hash: winner.hash, decision },
+      });
# db-tenant.ts::TenantScopedStore.claim
- async claim<T>(owner:string,id:string,status:string,now:string)
+ async claim<T>(owner:string,id:string,status:string,now:string,expectedHash?:string)
- return this.store.claim(await this.key(owner),id,status,now);
+ return this.store.claim(await this.key(owner),id,status,now,expectedHash);
# db.ts::Store.claim (conservar literalmente su WHERE de expiry/task)
+ AND ($5::text IS NULL OR data->>'hash'=$5)
# SQL params:
- [owner,id,now,JSON.stringify(status)]
+ [owner,id,now,JSON.stringify(status),expectedHash ?? null]
```

El argumento extra exige actualizar la interfaz `ActionsStore`, `Store`, `TenantScopedStore` y fakes de tests. `null` solo admite llamadas legacy inventariadas, **no** una omisión accidental desde un handler gobernado. Resolver `!winner`: devolver estado actual si ya decidió, 409 si mismo status pero hash distinto, 409 si expiró y ninguna llamada a `run`. Positivo: hash actual 1 claim + 1 approval; adversarial: editar por CAS entre get/claim → cero efectos; crash: throw en tx.put → rollback de claim + ausencia de approval. Reusar `tests/actions.test.ts`; test NUEVO `tests/trans01-approval-hash-race.test.ts`. Compatibilidad V1 exige conservar denied/expired behavior y tests existentes. Rollback coordinado de 3 implementadores sin borrar filas históricas.

### K01.B — revocación después del claim

`ActionService.run(owner,claimed,decidedBy?)` (actions.ts:544+) hace `options.execute` (552–557) luego de checks previos en decide. Propuesta: refrescar scope autenticado o principal de servicio, autorización de operación y generación/connection inmediatamente antes de `options.execute` (puerto `options.connection(owner)` existente), sin depender de scope async desaparecido. Especificar criterio de rechazo pre-dispatch vs `outcome_unknown` post-dispatch; no reintentar. Test barrera rotate/revoke entre claim y ejecutor, spy=0; crash post-send sin receipt exige conciliación. No alterar WorkspaceService sin auditar consumidores. Rollback feature profile OFF, conservar claims.

### K02 — matriz side-effect, PDP y aprobación (F01/P2/W1/T02)

**Actual:** `CapabilityRunner.run(ctx:ExecutionContext,step:PlanStep):Promise<void>`, constructor `(registry,executors,governance?,getAgentRole?,db?)`. **Propuesta:** selector de perfil gobernado explícito en composición; no sustituir enum V1 ni exigir DB para lecturas inocuas.

| Perfil y efecto | Principal+PDP | Store | Aprobación | Condición de dispatch |
|---|---|---|---|---|
| V1 lectura local | mantiene checks V1; inventariar callers | según V1 | según V1 | preserva compatibilidad |
| V2 lectura sin side effects | obligatorio | no para solo read | si risk policy lo requiere | scope y recurso permitidos |
| V2 escritura interna | obligatorio | CAS si estado mutable | según policy | CAS/estado vigente |
| V2 external_write sin flag approval | obligatorio | claim obligatorio | policy explícita; no deducir allow | claim + authz |
| V2 external_write con requiresApproval | obligatorio | claim y approval | recibo ligado a hash/actor/operación/generación | comprobaciones fresh |
| V2 con role/actor/PDP ausente | DENY | sin efecto | ninguna | executor spy=0 |

```ts
// NUEVO, no es API implementada:
type ExecutionPolicyProfile = "legacy_v1" | "governed_v2";
const governed = profile === "governed_v2";
const external = capability.sideEffects.some(s => s.kind === "external_write");
if (governed && (!ctx.actorId || !ctx.roleId || !governance || !getAgentRole || !pdp))
  throw Error("GOVERNED_PRINCIPAL_REQUIRED");
if (governed && (external || capability.requiresApproval) && !db)
  throw Error("GOVERNED_CLAIM_STORE_REQUIRED");
```

El `pdp` del snippet representa un binding nuevo a acordar con `AgentGovernance`, no propiedad de CapabilityRunner actual. La regla `PolicyEngine.can` que permite rol sin permisos no puede ser decisión final en V2. Productor `Executor`, consumidores `buildToolExecutors`; `SOPExecutor` tiene ruta propia: documentar equivalencia antes de rerouting. Tests NUEVOS `tests/trans01-governed-runner.test.ts` positivo read sin db, adversarial rol vacío/permisos/scope ajenos, crash claim y recovery. Regresiones `tests/sop-contract.test.ts`, `tests/tenant-permissions.test.ts`. Rollback perfil V2 OFF sin nueva autoridad legacy.

### K03 — fencing CAS de claims externos (F01/P2/W1/T02)

Extender puerto `db?` de `CapabilityRunner` con `compareAndSwap` existente, no inventar CAS externo. Campos candidatos JSON aditivos `attemptId`, `revision`, `effectStage`, `providerRef`; validación de migración para claims antiguos. Separar estados:

| Anterior | Entrada | Siguiente | Retry externo |
|---|---|---|---|
| ausente | insertIfAbsent gana | claimed + attemptId | 1 vez |
| claimed reciente | segundo worker | intacto | no |
| claimed stale | tiempo agotado sin prueba de no-envío | outcome_unknown con CAS | no |
| failed sin prueba negativa | error ambiguo | outcome_unknown | no |
| failed con `rejectedBeforeDispatch` verificado | receipt de adaptador | claimed con nueva revision/CAS | permitido si policy |
| done | receipt validado | done | solo devolver resultado |
| outcome_unknown | consulta proveedor o conciliación | settled por protocolo | nunca reenvío ciego |

```diff
# capability-runner.ts, reemplazar actualización incondicional de failed
- await this.db.put(ctx.tenantId, "idempotency-claims", updatedClaim);
+ const resumed = await this.db.compareAndSwap(
+   ctx.tenantId, "idempotency-claims", claimId,
+   { status: "failed", revision: previousRevision, attemptId: previousAttemptId },
+   { status: "claimed", revision: previousRevision + 1, attemptId: nextAttemptId, claimedAt: now }
+ );
+ if (!resumed) throw Error("CLAIM_CHANGED");
# terminar solo si el claim sigue perteneciendo a este intento:
+ const settled = await this.db.compareAndSwap(
+   ctx.tenantId, "idempotency-claims", claimId,
+   { status: "claimed", attemptId: currentAttemptId },
+   { status: "done", result: resultDigest, doneAt: now }
+ );
+ if (!settled) throw Error("CLAIM_FENCE_LOST");
```

Los identificadores `previousRevision`, `nextAttemptId`, `resultDigest` son **nuevos**. Tipificar `adapterResult` con Trans03 para distinguir no-dispatch/accepted/unknown. `run():Promise<void>` continúa hasta acuerdo con `StepRunner`; persistir receipt aparte sin inventar retorno. Positivo: dos workers una llamada; adversarial: CAS stale no pisa done; crash: tras envío y antes del receipt no se repite. NUEVO `tests/trans01-claim-cas.test.ts`. Rollback nunca vacía claims ambiguos; desactivar nuevas operaciones.

### K04 — causal-1 compatible con SystemEvent 1.0 (F01/P2/W1/T02)

`engine/events/types.ts::SystemEvent` tiene `id,schemaVersion:"1.0",tenantId,owner,type,emittedAt,source,correlationId?,causationId?,payload`. Nuevas opciones **solo para productor gobernado**, manteniendo lectores V1:

```ts
// PROPUESTAS NUEVAS:
type CausalLink = {kind:"root"} | {kind:"derived";causationId:string};
type GovernedEmitOptions = EmitOptions & {
  tenantId:string;actorId:string;purpose:string;policyRevision:string;
  correlationId:string;causal:CausalLink;
};
// campos opcionales en SystemEvent 1.0: actorId?,causalKind?,purpose?,policyRevision?
```

Para un derived verificar antecedente durable en mismo tenant y correlationId; para root exigir declaración expresa; actor del scope o principal de servicio autenticado, nunca `source.personaId`. `resolveTenant(owner)` conserva fallback legacy pero perfil gobernado exige tenant explícito. No añadir campo al payload de schemas ya cerrados sin necesidad; validar en el borde productor. Test NUEVO `trans01-causal-envelope.test.ts`: root, derived, ancestor B denegado, persona/actor spoof, rollback. Producer actions/SOP/KernelBusEmitter, consumers Kernel subscriber/Trans02 slow/Trans04 traces. Rollback productores opt-in OFF, lectura vieja intacta.

### K05 — cursor SQL por secuencia, no por timestamp (F01/P2/W1/T02)

El EventBus legacy carece de cursor durable por tenant; Cognition V2 **ya dispone** `cognition_v2_events(tenant,sequence,event_id,event)` con commit order. Nuevo puerto candidato `DurableTenantEventQuery.pageTenant(tenant,afterSequence,filter,limit)`, sin cambiar API `EventQuery.recent` descendente de UI. SQL basado en tabla existente:

```sql
SELECT sequence,event FROM cognition_v2_events
WHERE tenant=$1 AND sequence>$2
  AND ($3::text[] IS NULL OR event->>'type'=ANY($3::text[]))
ORDER BY sequence ASC LIMIT $4;
```

Resolver cursor `sinceId` legacy a `event_id` **del mismo tenant**, luego secuencia; cursor externo deniega y cursor inexistente no vuelve a comenzar por accidente. Filtros since/until se aplican en SQL ANTES de limit. Para V1 sin `cognition_v2_events`, diseño separado keyset `emittedAt,id` filtrado SQL antes del limit, con índice y tests; no vender orden de actualización como causalidad. Corregir también el SQL path de `StoreQuery.recent` que omite sinceId (o mantenerlo explícitamente no incremental). `tests/trans01-event-page.test.ts` NUEVO: 401 eventos, cursor tras página 2, mismo tiempo, tipo disperso, cursor B, restart, PGlite y Postgres. `tests/event-bus.test.ts` y `tests/cognition-v2-kernel-receipts.test.ts` regresión. Rollback detener consumidor nuevo, conservar cursor durable.

### K06 — receipt empresarial y proyección (F01/P2/W1/T02)

Evitar nuevo outbox: usar `Store.transaction` + `DurableEventSink` y `DurableProjector` con fence. Nuevo contrato compartido a negociar:

```ts
// PROPUESTAS NUEVAS:
type BusinessEffectOutcome =
  | {kind:"accepted";providerRef?:string}   // ACK, no entrega
  | {kind:"confirmed";evidenceRef:string}  // tipo de confirmación específico
  | {kind:"rejected";code:string;beforeDispatch:boolean}
  | {kind:"unknown";reconciliationRequired:true};
interface BusinessEffectReceiptV1 {
  schemaVersion:"1.0";id:string;tenantId:string;owner:string;actorId:string;
  operationId:string;capabilityId:string;purpose:string;policyRevision:string;
  connectionId?:string;connectionGeneration?:string;idempotencyKey?:string;
  correlationId:string;causationId?:string;outcome:BusinessEffectOutcome;
  evidenceDigest:string;observedAt:string;
}
```

`RuntimeOutcomeProjector.fromSlowReceipt` verifica sólo job Slow, no venta, factura ni entrega. Verificador empresarial valida origen, operación, tenant, versión de policy, evidenceRef y estado antes de promover `verified_fact`; simple ACK → `reported_fact`. `CognitiveProjector.apply` ya rechaza `verified_fact` desde `cognition.v2.record.proposed`. Test NUEVO `trans01-business-receipts.test.ts`: receipt falsificado, timeout post-send, rollback, crash postcommit prepublish, duplicate event, cross-tenant, DLQ/fence, egress Slow no bloqueante. Migración aditiva con tablas/records opt-in, no borrar historial; rollback suspender lectores/escritores nuevos con tombstone intacta.

### K07 — selector único local/remoto y diferido (F01/P2/W1/T02)

En `agent.ts::makeRuntime`, backend AGUI crea `HttpAgent`, mientras `conversation.ts::ConversationAgent.run` solo delega a V2 en local. Proponer selector único al borde autenticado para los tres caminos: local tenant opt-in→V2, local opt-out→V1, remote→puerto remoto explícitamente permitido con principal y políticas; ausencia de permiso DENY, nunca fallback de V2 a V1 en error. `forwardedProps` no es fuente de actor/tenant. Tests HTTP `tests/trans01-chat-routing.test.ts`: ruta `/api/copilotkit/run` y `/api/copilotkit/agent/default/run`, Request clone, AGUI remoto, opt-in, opt-out, revoke, abort sin duplicado de stream. Reusar `tests/cognition-v2-http.test.ts`.

`index.ts:185–201` callback `deferred_dispatch_unwired` debe seguir así hasta contrato autoritativo y reserva de path. `DeferredActions.tick` guarda failed tras receipt negativo; callback actual mapea evento `action.failed` al schema `system.maintenance` inválido. Proponer mapper al tipo válido tras inventariar schemas, o log local hasta crear schema versionado propio; **NO** abrir dispatch ni fingir `tasks/monitors`. Tests NUEVOS `trans01-deferred-wiring.test.ts`: doble firma, evento validado, callback negativo, cero ejecuciones, conflicto tenant, reinicio. Regresión `tests/deferred-actions.test.ts`. Rollback dejar callback cerrado.

## 4. Patchsets restantes por superficie, sin duplicar los otros agentes

| ID | Fase/pasada/ola/turno | Ancla/owner | Entrega verificable | Positivo / adversarial / crash | Rollback |
|---|---|---|---|---|---|
| K08.1 | F04 P2 W3 T03 | `whatsapp-inbound.ts::enqueueIncoming`, `whatsapp-outbound.ts::approve/reconcile` Trans03; `bootstrap.ts` Trans01 | Mapear `send_whatsapp` a Operation existente; un solo provider dispatch, outcome accepted/unknown | 1 envío / tenant B o recipient denegado / timeout tras envío sin resend | desregistrar bridge, preservar operation |
| K08.2 | F05 P2 W3 T03 | GoogleAuth y packages/integrations Trans03; actions/runner Trans01 | Gmail lectura vs escritura, generación/scope y binding, no duplicar `send_email` | read OK / write sin scope no / revocación después de claim | dejar read; write OFF |
| K08.3 | F05 P2 W3 T03 | `create_calendar_event` y WorkspaceService | Calendar availability solo lectura, create con revisión y aprobación | disponibilidad OK / rechazo / caída pos-commit | disable create |
| K08.4 | F05 P2 W3 T03 | Google Maps Trans03, `query_business` Trans01 | búsqueda Places con fuente, límites tenant y ROI como hipótesis | candidato scoped / tenant ajeno / timeout | disable binding |
| K08.5 | F05 P2 W3 T03 | Drive Trans03, Registry Trans01 | lectura ACL revocable y snapshot, no confundir Drive con Docs | reference válida / revoked / cold RAG caído | deshabilitar adapter |
| K08.6 | F05 P2 W3 T03 | Docs API Trans03 (upstream pendiente) | create/update solo cuando puerto verificado; stub fail-closed hasta entonces | doc mock OK / scope insuficiente / proveedor caído | stub cerrado |
| K09.1 | F06 P2 W4 T03 | `parseVerticalSliceBundle` y fixtures Trans04 | semillas reproducibles, reloj lógico, hashes, simulación aislada | misma seed / cross-tenant / replay | descartar fixtures |
| K09.2 | F07 P2 W4 T03 | `scripts/provision-vertical-slice.ts::planProvision/applyProvision/checkProvision` Trans04 | `PROVISION_STEPS=['tenant','actors','complete']`, operationKey, journal, plan sin escritura; real apply prohibido | plan no write / nombres/owner ajeno / crash cada paso reanuda | stop apply, no borrar actores |
| K10.1 | F08 P2 W4 T04 | CapabilityRegistry y Runner Trans01; middleware ciber Trans03 | findings evidencia, remediación como acción aparte aprobada | finding / objective fuera de scope / worker caído | unregister executor |
| K11.1 | F02/F09 P2 W1/W4 T02/T04 | metrics Trans04, EventBus/service Trans01 | T04-H01 hook por etapa con labels enumeradas; sin duplicar `MetricsCollector` | counter único / PII negada / collector caído | no-op |
| K10.2 | F10 P2 W5 T04 | registry/runner Trans01; gestoría Trans03 | conciliación idempotente, borradores de impuestos, cero pagos sin aprobación | decimal correcto / tenant B / efecto ambiguo | apagar capability |
| K09.3 | F11 P2 W5 T04 | SOPExecutor Trans01; agency-bootstrap Trans04 | versión SOP, procedencia y customizaciones conservadas | recompila / huérfano / falla y revierte | versión anterior |
| K12.1 | F12 P2 W5 T04 | gate-report/cognition-v2 Trans04 | preservar NO_GO y no bajar gates | suite limpia / skip detectable / Postgres restringido | bloquear release |
| K12.2 | F01–12 P3 W0–W5 T05 | auditar Trans02 y paths propios | bypass AGUI, ACL, causalidad, anti-loop, doble metric | Fast sin Slow / receipt falso / revoke stream | revertir solo propios |
| K12.3 | F01–12 P4 W0–W5 T06 | DurableProjector, CAS y gates por owner | fault injection, replay/restore, lease/fence, certificación SHA combinado | 1 efecto / stale worker / restart+DLQ | restauración validada |

Los IDs y proveedores nuevos de Trans03 requieren su ABI; no inventar nombres ejecutables ni modificar sus adaptadores. Trans04 es dueño del gate y provisioning. Trans02 es dueño de Cognition. Una dependency BLOCKED nunca equivale a DONE.

## 5. Matriz 12 fases × 4 pasadas, waves y turnos

P1 = inventario/contratos/test rojo (T01/B1). P2 = código (T02/B2 F01–03; T03/B3 F04–07; T04/B4 F08–12). P3 = auditoría cruzada (T05/B5). P4 = hardening (T06/B6). Waves W0–W5 son dependencias, no pausas. N/A = otro propietario o activación no autorizada.

| Fase | P1 T01 | P2 T02–T04 | P3 T05 | P4 T06 |
|---|---|---|---|---|
| F01 consolidación | W0–1 inventario C00–C05, rutas y claims | W1 K01–K07 approvals/bus/selector; depende ABI Trans02/03/04 | W0–1 comprobar V1/V2/AGUI, no bypass | W0–1 pre/postcommit, replay y revert |
| F02 observabilidad | W1 baseline labels, Trans04 owner | W1 K11 H01 hook postcommit, no segundo metrics | W1 doble conteo, cardinalidad | W1 collector caído no bloquea |
| F03 proveedores | W2 contratos y pruebas de fallo | W2 K02/K06/K07 y Trans03 adapter | W2 egress, timeout, Fast independiente | W2 revoke y cuotas |
| F04 WhatsApp | W3 binding/proveedor/ACK | W3 K08.1 y Trans03 operación existente | W3 duplicado, approval, tenant | W3 timeout post-send y conciliación |
| F05 Google | W3 inventario scopes Maps/Gmail/Calendar/Drive/Docs | W3 K08.2–6, Trans03 proveedor | W3 ACL/revoke/rotación | W3 cuotas y dos tenants |
| F06 sintética | W4 seed y licencia, Trans04 owner | W4 K09.1, N/A generador externo sin licencia | W4 hipótesis vs hecho | W4 replay sin efectos |
| F07 owner real | W4 plan/provision journal | W4 K09.2, no apply sin autorización | W4 ownership y customización | W4 doble provision/restart |
| F08 ciberseguridad | W4 upstream licencia y catálogo | W4 K10.1 registry + Trans03 adapter | W4 falso positivo/verifier | W4 remediación denegada |
| F09 observabilidad V2 | W4 lag y baseline | W4 K11.1 y Trans04 exporter | W4 replay cero éxitos | W4 alertas/collector offline |
| F10 gestoría | W5 upstream/contrato | W5 K10.2 reconciliación sin pagos | W5 precisión e idempotencia | W5 revocación y restore |
| F11 recompilación | W5 SOP/versión/ACL | W5 K09.3 sin borrar personalización | W5 huérfanos y procedencia | W5 rollback/version repeat |
| F12 validación | W5 gates y escenarios | W5 K12.1 no reducir checks | W0–5 K12.2 auditoría externa | W0–5 K12.3 B6 con Postgres |

## 6. Jornadas empresariales, estados y trazabilidad

**Fuentes verificadas:** `apps/ui-lab/docs/agntia-demo/README.md` fija prioridad de los dos kickoff verbatim y cuatro instrucciones raw sobre plantilla derivada. AgntiaPro se define como compilación y gestión de empresas humanas/agénticas, no chatbot: 1.500 € instalación, desde 1.000 €/mes, 10 clientes como objetivo, dos servicios iniciales alto ROI. LAIA es interfaz y supervisor visible pero no autoridad de ejecución. Founder especificó 0 sandbox, 1 compilación, 3 formación, 4 beta validada, 5 operación, 6 actualización continua, 7 alpha, 8 scale/Digital Twin; **fase 2 no fue definida por founder**, la simulación de ensayo intermedia es propuesta documental. Los 18 dominios/6 ejes del blueprint son conceptos, no schemas DB. Fixture `agntia-demo` no habilita empresas reales.

**E1 — lead, founder y compilación:** visitante de landing conversa con LAIA sin acceso a datos de tenant → discovery y propuesta (hechos sintéticos etiquetados) → owner aprueba plan de compilación → `planVerticalSlice/planProvision` leen y producen propuesta SIN escritura → estado demo con tenant, roles y procesos, IDs estables y 2 servicios candidatos → formación de humanos en entorno sintético (no autoriza producción). `applyProvision` existe pero no debe ejecutarse sobre owner real sin aprobación. Regresión `tests/vertical-slice-provision.test.ts` cubre plan, idempotencia y fallos, pero no certifica firma real ni deploy. No mezclar simulation_mode con autorización.

**E2 — WhatsApp operado:** webhook de Meta/Evolution validado por Trans03 → `bindingFor/validateBinding/enqueueIncoming` conserva cuenta, tenant, SOP → SOP prepara respuesta y autorización humana → `WhatsAppOutbound.prepareDraft/approve` comprueba recipient, generación, revisión y crea una única Operation → sendText retorna accepted/unknown → propuesta K06 durable receipt + evento causal → proyección verificable → Slow/JEV opcionales con input minimizado → snapshot ACL → LAIA describe «aceptación del proveedor» o «requiere conciliación», **no** «mensaje entregado» sin proof de entrega. Revoke previo al efecto bloquea; timeout posterior impide replay; B no puede aprobar A.

**E3 — Google y backoffice:** Maps/Places aporta candidatos externos, no leads verificados; Gmail/Drive lectura con ACL; Calendar disponibilidad lectura; Docs create/update requiere puerto real no demostrado. LAIA propone email/agenda, ActionService valida hash+claim y WorkspaceService es ejecutor actual. Si cambia cuenta o scopes antes de enviar, deny; si timeout después, unknown; acción financiera/gestoría sigue borrador hasta receipt específico, no desembolso ni declaración. Métricas se derivan de estados auditados, no del diseño UI.

**E4 — cognición y recuperación:** evento `task.completed` no prueba efecto externo; receipt verificado primero; DurableEventSink registra secuencia, DurableProjector consume con lease/fence/inbox; solo entonces proyección y Slow opcional; JEV evalúa propuestas autorizadas pero no concede permiso. `RuntimeOutcomeProjector` solo acredita job Slow. ContextServingFacade revisa policyRevision, refs, TTL y revocaciones; LAIA presenta hecho/reporte/hipótesis según epistemia. Fast sigue si Slow/JEV o exporter caen. Un gemelo digital simula futuros explícitamente hipotéticos y no altera registros operativos.

## 7. Pruebas, certificación y criticidad residual

Archivos de tests inspeccionados en Trans01: `tests/actions.test.ts` (12 casos: carreras, hashes/expiry/unknown, credenciales), `tests/event-bus.test.ts`, `tests/deferred-actions.test.ts` (6), `tests/cognition-v2-kernel-receipts.test.ts` (3, uno PostgreSQL condicional), `tests/cognition-v2-runtime-outcome.test.ts` (3), `tests/cognition-v2-transactions.test.ts`, `tests/cognition-v2-http.test.ts`, `tests/vertical-slice-provision.test.ts` (8), y tests tenant/permissions.

**Nuevos casos por escribir tras permiso de implementación:** `tests/trans01-approval-hash-race.test.ts`, `trans01-governed-runner.test.ts`, `trans01-claim-cas.test.ts`, `trans01-causal-envelope.test.ts`, `trans01-event-page.test.ts`, `trans01-business-receipts.test.ts`, `trans01-chat-routing.test.ts`, `trans01-deferred-wiring.test.ts`, `trans01-owner-journey.test.ts`. Cada test requiere positivo, adversarial y crash donde exista efecto: spies de `exec.run`, barreras entre lecturas y CAS, dos tenants, reinicio y Postgres restringido. En este relevo la revisión estática NO ejecutó estas suites ni un gate combinado; marcar **NOT_RUN**, nunca PASS. Comandos del repo: `pnpm typecheck`, `pnpm test`, `pnpm gate`, `pnpm test:cognition-v2`, `pnpm verify:slice`. CI histórica `Trans01@335e0d4a` tuvo success en run `45398825090` pero **no** certifica esta revisión ni HEAD actual.

**Autocrítica:** el trabajo identifica contratos existentes y montajes antes ausentes en mi evaluación original. Persiste una brecha para nota >9: los hunks siguen siendo propuestas documentales no aplicadas/compiladas; no se ha enumerado exhaustivamente cada caller del claim ni todas las versiones de proveedores, no hay prueba de equivalencia total por patch-id ni ejecución de tests nuevos/Postgres restringido. La documentación del otro agente no es evidencia de ejecución en mi SHA. Hay que acordar ABI causal-1/receipt con trans02/Trans03/Trans04, definir reserva exacta y gate combinado. No dar GO, no merge, no deploy, no aplicar owner real.
