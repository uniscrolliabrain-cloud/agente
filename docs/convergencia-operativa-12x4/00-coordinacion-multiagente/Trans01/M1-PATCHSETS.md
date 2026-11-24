# Trans01 · M1 — índice de patchsets

Macroturno M1 (PROTOCOLO-3-MACROTURNOS.md) sobre la rama `Trans01`. Base de ejecución `85c8fd7`
(tip de la rama al arrancar). Campaña `campaign/convergencia-operativa-12x4` leída en `2d6aecf`, sin
integrarla. Base común `751eab41`. No se hizo merge, rebase, deploy ni efecto externo.

Estados: `DONE` = código y prueba ejecutados en este SHA · `BLOCKED_DEPENDENCY` = falta un contrato o
ABI de otro propietario · `PENDING SUPERVISOR` = requiere revisión combinada de barrera.

| ID | Fase/pasada/ola/turno | Path y símbolo | Contrato aplicado | Prueba | SHA | Rollback | Estado |
|---|---|---|---|---|---|---|---|
| A01 | F01/P2/W1/T02 | `apps/server/src/actions.ts` (`ActionsStore.claim`, `ActionService.decide`), `apps/server/src/db.ts` (`Store.claim`), `apps/server/src/db-tenant.ts` (`TenantScopedStore.claim`) | Quinto argumento `expectedHash` en el `UPDATE` atomico que ya imponia estado/expiry/tarea; `ApprovalRequest` construido desde el ganador; 409 si la revision cambio entre lectura y claim; mismo hash conserva `APPROVAL_DECIDE_IDEMPOTENT_V1` | `tests/trans01-approval-hash-race.test.ts` (4) | `026eca0` | Revertir ABI y sus dos implementadores juntos; no borrar filas historicas. `expectedHash` opcional conserva llamadas legacy inventariadas. | DONE |
| A02 | F01/P2/W1/T02 | `apps/server/src/engine/execution/capability-runner.ts` (`CapabilityRunnerProfile`, guard de `run`), `apps/server/src/actions.ts` (`assertConnectionCurrent`, `run`) | Perfil `governed_v2` explicito y fail-closed (principal/PDP/store); V1 sigue en `legacy_v1`; conexion y generacion revalidadas inmediatamente antes de `options.execute` | `tests/trans01-governed-runner.test.ts` (5), `tests/trans01-effect-boundary.test.ts` (2) | `026eca0`, `5bca1d0` | Dejar el perfil en `legacy_v1` (valor por defecto) y retirar la revalidacion; sin migracion. | DONE el mecanismo · **BLOCKED_DEPENDENCY** activar `governed_v2` en `service.ts` (necesita inventario de callers y aprobacion de barrera) |
| A03 | F01/P2/W1/T02 | `apps/server/src/engine/execution/capability-runner.ts` (claim `fence`/`attemptId`, `transition`) | CAS sobre `Store.compareAndSwap`: `failed -> claimed` solo con `retrySafe === true` y fence; `claimed` stale -> `outcome_unknown` por CAS; finalizacion solo del intento que posee el claim; fallo de persistencia separado del fallo del adaptador | `tests/trans01-claim-cas.test.ts` (5) | `5bca1d0` | Detener despachos nuevos y conservar claims; los ambiguos quedan para conciliacion. | DONE el fencing · **BLOCKED_DEPENDENCY** discriminante `accepted/rejectedBeforeDispatch/unknown` de los adaptadores (Trans03) |
| E01 | F01/P2/W1/T02 | `apps/server/src/engine/events/types.ts` (`SystemEvent.actorId`, `causalKind`), `apps/server/src/engine/events/bus.ts` (`CausalLink`, `EmitOptions.actorId/causal`) | Perfil causal-1 aditivo sobre `schemaVersion 1.0`: raiz explicita, derivado con antecedente durable del mismo tenant y correlacion, actor autenticado (nunca `source.personaId`), eventos legacy legibles | `tests/trans01-causal-envelope.test.ts` (8) | `9ccd1a3` | Productores gobernados opt-in; lectura 1.0 intacta. | DONE |
| E02 | F01/P2/W1/T02 | `apps/server/src/engine/events/bus.ts` (`replayTenant`), `apps/server/src/engine/events/sinks/store.ts` (`StoreQuery.pageTenant`) | Filtros y cursor `sinceId` resueltos en el store ANTES del limite; orden `(emittedAt, id)` ascendente; cursor de otro tenant o inexistente deniega | `tests/trans01-event-page.test.ts` (4) | `9ccd1a3` | Detener el consumidor nuevo; el camino `scanByPrefix` historico queda como fallback cuando no hay `select`. | DONE |
| E03 | F01/P2/W1/T02 | `apps/server/src/engine/events/bus.ts` (`afterCommit`, `EmitResult`) | `pendingCommit` dentro de transaccion; rollback no publica ni persiste; sin publicacion inmediata ni segundo outbox | `tests/trans01-emit-commit.test.ts` (2) | `9ccd1a3` | No aplica: se conserva el contrato existente. | PARCIAL · **BLOCKED_DEPENDENCY** recibo empresarial verificado (contrato compartido Trans02/03/04) |
| S01 | F01/P2/W1/T02 | `apps/server/src/engine/sop-executor.ts` (`runStep`, caso `computer_command`) | Fail-closed: con rol activo exige governance y rol vigente; abort respetado antes del computer; mismo executor, sin duplicarlo | `tests/trans01-sop-authz.test.ts` (5) | `ed7b505` | Revertir el guard; no hay migracion ni datos nuevos. | DONE |
| C01 | F01/P2/W1/T02 | `app.ts`, `service.ts`, `conversation.ts`, `agent.ts` (selector unico local/remoto) | Requiere ABI del selector de trans02 y politica explicita de remoto | — | — | — | **BLOCKED_DEPENDENCY** (trans02) |
| H01 | F02/P2/W1 | hooks de telemetria por etapa | Requiere interfaz T04-H01 de Trans04 | — | — | — | **BLOCKED_DEPENDENCY** (Trans04) |
| K07-deferred | F01/P2/W1/T02 | `index.ts` callback `deferred_dispatch_unwired` | Sigue cerrado por diseño; no se abre dispatch ni se finge exito | — | — | — | NO CAMBIADO (correcto hasta contrato autoritativo) |
| B1 | checkpoint | contratos y ownership | Cerrado en T01 (`b04e184`), no repetido | — | — | — | CERRADO (historico) |
| B2 | checkpoint | nucleo integrado | Requiere revision combinada del supervisor | — | — | — | **PENDING SUPERVISOR** |

## Reservas de path usadas

- `apps/server/src/db.ts` y `apps/server/src/db-tenant.ts`: A01 exige propagar el quinto argumento del
  claim. El cambio es aditivo y opcional (`null` conserva el comportamiento previo). Se registra como
  solicitud de confirmacion en B2 porque T02-RECONCILIACION.md dejaba el cambio de store sujeto a
  acuerdo.
- `tests/trans01-*.test.ts`: ficheros nuevos propios; no se modifico ningun test existente, incluido
  `tests/gate/idempotency-execution.test.ts`.
- No se tocaron paths de trans02, Trans03, Trans04, UX ni `agntia-demo`, ni gates/CI.

## Riesgos residuales declarados

1. **Clasificacion de errores de proveedor.** Sin el discriminante de Trans03, un error no clasificado
   tras el despacho se registra como `failed` con `retrySafe: true` (comportamiento previo conservado,
   cubierto por `tests/gate/idempotency-execution.test.ts`). Un error que declare `outcomeUnknown` o
   `code: "outcome_unknown"` ya se conserva como ambiguedad. Hasta el contrato de Trans03, el retry de
   un fallo no clasificado sigue siendo un riesgo residual, no un exito certificado.
2. **Perfil gobernado inactivo.** `governed_v2` existe y esta probado, pero `service.ts` sigue en
   `legacy_v1` hasta inventariar callers y aprobar B2. No se activa por defecto.
3. **Recibo empresarial.** E03 valida el `afterCommit` existente, no sustituye el recibo verificado ni
   el inbox/outbox durable de Cognition. ACK de proveedor sigue sin equivaler a entrega.
4. **Migracion.** No hay migracion nueva: los claims antiguos sin `fence`/`retrySafe` quedan bloqueados
   para conciliacion en vez de reintentarse.
