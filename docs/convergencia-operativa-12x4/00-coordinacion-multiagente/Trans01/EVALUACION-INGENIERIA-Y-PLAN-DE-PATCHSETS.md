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
