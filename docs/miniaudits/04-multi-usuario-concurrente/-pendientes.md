# PENDIENTES_MULTIUSUARIO_V1

Deudas, decisiones pendientes y usos de x-user-id de la Campana 2 (Multiusuario). Se actualiza al cierre de cada fase.

## Decisiones pendientes

| ID | Decision | Fase | Estado |
|---|---|---|---|
| D1 | hono/jwk vs jose para verificar JWT | F1 | PENDIENTE_OUTPUT_PASO_0: el Paso 0 confirmo hono y @hono/node-server, pero no jwk explicito |
| D2 | User.authProviderId backfill: script manual vs vinculacion por email | F1 | PENDIENTE. Prohibido por email. Opcion A: scripts/link-auth-provider.ts --userId X --sub Y. Opcion B: rechazada. |
| D3 | x-user-id deprecacion: no-op vs validar contra actor.id | F1 | PENDIENTE. Recomendado: validar y anotar discrepancia con X-User-Id-Mismatch: 1. |
| D4 | ExecutionContext.actorId obligatorio vs opcional | F1 | PENDIENTE. F1 opcional, F2 obligatorio en withRead/withWrite, F7 obligatorio global. |
| D5 | Recurso real para T3 (doc no existe) | F2 | PENDIENTE. Interpretacion: AgentTask de A. |
| D6 | PolicyAction.execute | F2 | PENDIENTE. Debe incluir execute (correccion E del revisor). |
| D7 | recordHistoryEnabled default | F6 | PENDIENTE. Default false (condicional). |
| D8 | multiProcess default | F5 | PENDIENTE. Default false (single-instance). |
| D9 | sseReplayEnabled default | F5 | PENDIENTE. Default false (sin reconexion). |
| D10 | Tests de la campana: congelados vs permitidos en tests/campaign-2/ | F7 | PENDIENTE. Recomendado: permitidos en tests/campaign-2/. |

## Deudas documentadas

| ID | Deuda | Fase | Estado |
|---|---|---|---|
| Deuda 1 | User.authProviderId backfill controlado (no por email) | F1 | ABIERTA |
| Deuda 2 | x-user-id deprecado en F1 (10 usos actuales en apps/server/src/) | F1 | ABIERTA |
| Deuda 3 | KernelContext.actorId puede romper tests antiguos | F1 | ABIERTA |
| Deuda 4 | ExecutionContext.actorId puede romper consumidores (orchestrator.ts, service.ts) | F1 | ABIERTA |
| Deuda 5 | Revocacion de actor desactivado depende de active check en cada request | F1 | ABIERTA |
| Deuda 6 | TENANT_CACHE_TTL_MS a 30s en produccion para que active=false surta efecto rapido | F1 | ABIERTA |
| Deuda 7 | Multi-pertenencia al tenant: si se admite en el futuro, validar en servidor | F2 | ABIERTA |
| Deuda 8 | Sin JIT provisioning: sub sin User vinculado devuelve 401 | F1 | ABIERTA |
| Deuda 9 | version selectiva: solo en AgentTask, Goal, Monitor, SOP (decidir), Thread, Project, BusinessEntity | F4 | ABIERTA |
| Deuda 10 | Reconcile por recurso: POST /threads/:id/reconcile, POST /projects/:id/reconcile, etc. | F4 | ABIERTA |
| Deuda 11 | Flow desde AgentPersona: no desde AgentRole | F3 | ABIERTA |
| Deuda 12 | Responsable de equipo via Flow y Policy: no via User.managerId | F3 y F5 | ABIERTA |
| Deuda 13 | Desactivacion sin huerfanas = transicion segura: no masiva ciega | F5 | ABIERTA |
| Deuda 14 | Sin delete-tenant-data.ts: no aplica a multiusuario | - | CERRADA |
| Deuda 15 | fieldClassification no es seguridad por si sola: FieldFilter en lectores, escritores, serializadores, listados, busquedas, agregaciones | F2 | ABIERTA |
| Deuda 16 | withRead y withWrite en todas las rutas: handlers, workers, acciones internas, streams, rutas alternativas | F2 | ABIERTA |
| Deuda 17 | retention-purge purga audit-entries a 90 dias. Contradice SOC-2. Corregir en F6 a 365 dias. | F6 | ABIERTA |
| Deuda 18 | tests/campaign-2/ no existe. Los 17 tests de F7 estan pendientes. | F7 | ABIERTA |
| Deuda 19 | KNOWN_ISSUES.md y CIERRE-MVP.md no existen. Se crean en F7. | F7 | ABIERTA |

## Usos de x-user-id

Detectados 10 usos en apps/server/src/ al ejecutar el Paso 0. Se deprecan en F1. Lista exacta pendiente de output de Select-String en F1.

## Typecheck

Estado en F0: verde. 0 errores TS al ejecutar el Paso 0.13. Si en alguna fase aparece error nuevo, se anota aqui y se aborta la fase.
