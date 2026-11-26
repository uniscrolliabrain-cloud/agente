# B2 · Patchsets reconciliados (reauditoría V3 × Astra R1–R3)

Estado: **plan candidato, sin código ejecutado**. No es autorización de implementación ni
certificación de B2. Requiere reserva de paths y gate combinado del supervisor.

Base de este plan: `Trans01` en `c1e2f365`. Campaña leída en `8672f8c1`, sin integrarla.
Fuentes contrastadas:

- `legacy/REAUDIT-TRANSVERSAL-M1-V1..V3.md` (reauditoría independiente de M1.2).
- `ASTRA-AUDIT-V1/06-PATCHSETS-CONSOLIDADOS.md` (R1–R3, candidatos sin compilar).
- `ASTRA-AUDIT-V1/EXPERIMENTO-RECONCILIACION.md` (carrera reproducida en PGlite y PG 17.12).
- `SIGUIENTE-TURNO-V4.md` (orden de trabajo del supervisor, sección B2).
- Código vivo, no el diff: `actions.ts`, `capability-runner.ts`, `db.ts`, `db-tenant.ts`,
  `outcome.ts`, `service.ts`.

Regla de reconciliación: **ninguna fuente se adopta entera**. La reauditoría V3 manda sobre
qué es defecto; R1–R3 mandan sobre la forma del arreglo cuando describen el mismo defecto;
M1.2 se conserva donde ya demostró la garantía (CAS obligatorio, binding completo, claim por
efecto). Donde discrepan, decide el invariante founder y queda anotado el delta.

## 1 · Mapa hallazgo → patchset

| # | Hallazgo | Origen | Dónde | Patchset |
|---|---|---|---|---|
| 1 | El `tx` de `ActionsStore` solo expone `claim`/`put`: no hay finalización condicional de dos filas en una transacción | R2 (dependencia) | `actions.ts:37-40` | **B2.0** |
| 2 | `run` persiste la acción con `put` y luego `settleDispatch` con CAS fuera de transacción: la carrera acción/intención es estructural | R2 + experimento | `actions.ts:run`, `settleDispatch` | **B2.3** |
| 3 | Un fallo o `unknown` reescribe `approval-requests.status` a `rejected`: la decisión humana se confunde con el resultado | R1 + V3 #4/#7 | `actions.ts:finalStatus` | **B2.1** |
| 4 | Dos `stepId` distintos con el mismo `approvalId` superan ambos el binding; el estado `succeeded` solo se comprueba, no se reserva | V3 (K08 bloqueante) | `capability-runner.ts:assertApprovalBinding` | **B2.2** |
| 5 | `hash`/`revision` se comprueban por presencia; `edit` recalcula hash pero no `revision`; `expiresAt` inválido no se rechaza | V3 #2 | `actions.ts:edit/propose`, runner | **B2.2** |
| 6 | La PDP se omite si el rol no existe o la lectura falla; `decide` no revalida rol/tarea/oposición | V3 #3 | `actions.ts:decide` | **B2.6** |
| 7 | Reautorización posterior al claim fuera del `try`: una denegación deja el claim huérfano y luego `unknown` sin despacho | V3 (K11) | `capability-runner.ts:run` | **B2.6** |
| 8 | `run` devuelve `void`; el resultado se guarda como JSON truncado a 2000 caracteres, que no es recibo verificable | V3 (K11) + V4 S01.2 | runner, `actions.ts` | **B2.5** |
| 9 | `recoverInterruptedActions` actualiza **todas** las filas `executing` sin lease ni antigüedad; arranque y `maintain` compiten | R3 | `db.ts:413`, `service.ts`, `index.ts` | **B2.4** |
| 10 | Intención `pending` se crea antes de `collecting`/`scheduled`; el reconciliador cierra cualquier estado ≠ `executing` como `settled`; `dispatchScheduled` reclama sin crear intento | V3 #5 + R3 | `actions.ts:decide/reconcile/dispatchScheduled` | **B2.7** |
| 11 | `propose` devuelve el existente antes de parsear: misma clave con contenido distinto no da conflicto; `followUpMeta` marca `awaiting_approval` antes de persistir la propuesta | V3 #6 | `actions.ts:propose` | **B2.7** |
| 12 | `StoreSink.write` asigna `seq` antes de saber si `insertIfAbsent` ganó; filas sin `seq` quedan fuera de `pageTenant` por NULL | V3 (K10) | `sinks/store.ts` | fuera de B2 (serie E) |
| 13 | `registerServicePrincipal`/`runAsServicePrincipal` son invocables desde módulos internos | V3 (K09) | `service-principal.ts` | fuera de B2 (serie S) |

Los puntos 12 y 13 **no entran** en B2: no son ActionService y su arreglo pertenece a las
series E y S de M1.2. Se listan para que el gate combinado no los dé por cerrados.

## 2 · Orden topológico

```text
B2.0  andamiaje de transacción + digest canónico + identidad de intento
  ├── B2.1  R1 · decisión ≠ intento ≠ observación
  ├── B2.2  consumo atómico de aprobación y digest ligado a revisión
  │        └── B2.3  R2 · finalización transaccional del despacho
  │                 └── B2.4  R3 · recuperación única y acotada
  ├── B2.5  resultado tipado y recibo por referencia (ABI con SOP)
  └── B2.6  reautorización y claim huérfano (cierra borde K11)
                └── B2.7  revisión canónica, diferido e idempotencia de propuesta
```

Barreras: nothing de B2.1–B2.4 se activa por defecto hasta que B2.0–B2.4 estén verdes en
PostgreSQL con dos conexiones. `governed_v2` sigue sin ser perfil por defecto.

## 3 · Patchsets

### B2.0 · Andamiaje (sin cambio de comportamiento)

- **Paths.** `apps/server/src/actions.ts` (tipos), `apps/server/src/engine/execution/capability-runner.ts`
  (tipos), tests nuevos.
- **Cambio.** `ActionsStore.transaction` recibe un `ActionsTx` con `get`, `put`,
  `compareAndSwap`, `claim` e `insertIfAbsent`. `Store.transaction` ya pasa `this`, y
  `TenantScopedStore.transaction` también: solo se amplía el tipo, no el runtime. Añadir
  `finalizeDispatch(owner, actionId, attemptId, observation)` y `applyDecision(...)` como
  funciones únicas de escritura. Extraer `proposalDigest(input, target, targetVersion)` de
  `propose` y usarla también en `edit`; escribir `revision` en ambos. Identidad de intento
  estable: `attemptId`, `fence`, `approvalHash`, `revision`, `connectionId`,
  `connectionGeneration`, `dispatched` (booleano explícito).
- **Tests.** Digest estable con distinto orden de claves; `edit` actualiza `revision`; el
  `tx` tipado compila contra `Store` y contra `TenantScopedStore`; ningún cambio de salida en
  la suite focal existente.
- **Rollback.** Revertir el commit: sin migración y sin cambio de datos.

### B2.1 · R1 · Decisión, intento y observación separados

- **Paths.** `apps/server/src/actions.ts`, `packages/domain/src/index.ts` (tipo de proyección,
  aditivo), tests.
- **Cambio.** `approval-requests.status` pasa a expresar **solo** la decisión humana
  (`approved`/`rejected`). El resultado del intento vive en `actions.status` y en
  `action-dispatch` (con `actionStatus`, `evidenceRef`). Se elimina la escritura
  `finalStatus = rejected` de `run` y su `void put` fire-and-forget. Los lectores antiguos
  siguen viendo `payload.decision`; el lector dual se despliega antes de emitir campos nuevos.
  Un `succeeded` nunca sintetiza aprobación; un `unknown` nunca se presenta como rechazo.
- **Contrato con Trans02.** La proyección debe distinguir aprobación, aceptación y
  confirmación. Mientras Trans02 no lea el campo nuevo, B2.1 queda en modo dual-read y no se
  elimina ningún campo del payload.
- **Tests.** Aprobación con envío fallido → `approved` + `failed`; denegación sin envío →
  `rejected` + `denied`; fallo técnico tras aprobar no produce `rejected`; replay no duplica.
- **Rollback.** Revertir el commit; los registros escritos son aditivos.

### B2.2 · Consumo atómico de la aprobación (cierra K08)

- **Paths.** `capability-runner.ts`, `actions.ts`, `db.ts`/`db-tenant.ts` si hace falta un
  índice, tests.
- **Cambio.** Reserva por `approvalId` en la misma transacción que la creación del claim:
  registro `approval-consumptions` con `insertIfAbsent` y clave `approvalId`, conteniendo
  `tenantId`, `taskId`, `capabilityId`, `operation` (`kind`), `digest`, `revision`, `claimId`,
  `attemptId`. Segundo paso con el mismo `approvalId` → `APPROVAL_ALREADY_CONSUMED`. Replay
  del **mismo** claim (`done`) sí se permite. `capabilityId` debe resolver a una entrada real
  del registry por tenant: `action:<kind>` no autoriza por alias implícito. `revision` se
  compara contra el digest canónico de B2.0 y `expiresAt` inválido (`Date.parse` NaN) deniega.
  Principal distinto del propietario exige delegación explícita.
- **Tests.** Dos `stepId` distintos en paralelo con el mismo `approvalId` (PostgreSQL, dos
  conexiones): uno gana, el otro deniega. Mismo claim repetido: replay sin segundo efecto.
  `capabilityId` inexistente o alias; `revision` desactualizada; `expiresAt` corrupto;
  delegación ausente.
- **Rollback.** Desactivar la reserva deja el binding de M1.2 (deniega más, nunca menos).

### B2.3 · R2 · Finalización transaccional del despacho

- **Paths.** `apps/server/src/actions.ts` (`run`, `settleDispatch`, `reconcileDispatchIntents`),
  tests.
- **Cambio.** Un único `finalizeDispatch` para el escritor ordinario y el reconciliador:

  ```text
  transaction:
    CAS actions   expected {status: "executing", attemptId, hash} -> terminal + receiptRef
    CAS action-dispatch expected {status: "pending", attemptId} -> settled | reconciled | unknown
    si cualquiera pierde: abortar la unidad completa (rollback) y releer
  ```

  Orden de filas fijo (acción antes que intención). Se prohíbe `put` sobre `actions` en la
  ruta de resultado. La llamada al proveedor queda **fuera** de la transacción. `unknown` no
  se degrada a `failed`; `accepted` no se convierte en `confirmed`. Si el segundo CAS falla
  se revierte el primero: no puede quedar acción terminal con intención `pending`.
- **Tests.** Los tres órdenes del experimento de Astra (confirmación primero, barrido primero,
  control) deben converger al mismo resultado con **una** llamada al doble; fallo inyectado en
  el segundo CAS → rollback íntegro y reintento de la observación; dos conexiones PG; barrido
  concurrente con el escritor.
- **Rollback.** Revertir a M1.2 restaura el defecto reproducido: solo como rollback de
  emergencia con despachos suspendidos, nunca como operación normal.

### B2.4 · R3 · Recuperación única y acotada

- **Paths.** `db.ts` (`recoverInterruptedActions`), `service.ts` (`maintain`), `index.ts`,
  tests.
- **Cambio.** Sustituir el `UPDATE` global de `executing` por un camino paginado de candidatos
  con: scope, `attemptId`, `revision`, antigüedad con reloj inyectable y prueba de pérdida de
  lease. Un proceso que sigue vivo no se barre por arrancar otra réplica. El timeout solo
  autoriza revisar el resultado, nunca reenviar. `scheduled` y `awaiting_review` tienen
  tratamiento explícito (no se cierran como `settled`). Filas malformadas o sin intento van a
  cola de revisión con razón persistida y no ocupan la primera página para siempre.
  Arranque y `maintain` llaman al **mismo** método.
- **Tests.** Lote con más filas inválidas que el límite y un intento vencido detrás; dos
  workers; solicitud lenta con lease vigente que no se barre; caída tras claim y tras commit;
  reintento sin reenvío; reloj inyectado.
- **Rollback.** Bandera de lectura: el camino nuevo se puede desactivar conservando el
  historial y las solicitudes de conciliación.

### B2.5 · Resultado tipado y recibo por referencia

- **Paths.** `capability-runner.ts`, `engine/execution/outcome.ts`, `actions.ts`,
  `engine/sop-executor.ts` (consumidor), tests.
- **Cambio.** `run` devuelve `{ outcome, claimId, attemptId, status, resultRef, resultDigest }`.
  El payload del resultado se guarda en un registro propio (`execution-results`) y el claim
  conserva referencia y digest, no un JSON truncado. `classifyAdapterResult` se aplica también
  al resultado de `ActionService`. `accepted`/`unknown` no emiten `action.executed` ni marcan
  el seguimiento como enviado. El ABI se acuerda con SOP antes de migrar sus llamadas; sin
  acuerdo, `run` mantiene la firma actual y la variante tipada va en un método nuevo.
- **Tests.** Recibo falsificado; replay doble; recibo de otro tenant; aceptación sin
  confirmación; confirmación tardía; payload > 2000 caracteres recuperable por referencia;
  proyector caído sin repetir efecto.
- **Rollback.** La variante tipada es aditiva; revertir no toca datos ya escritos.

### B2.6 · Reautorización y claim huérfano (cierra el borde K11)

- **Paths.** `capability-runner.ts`, `actions.ts`, tests.
- **Cambio.** La reautorización posterior al claim entra en el `try`: una denegación transita
  el claim a `failed` con `retrySafe:false` y `dispatched:false`, y la acción a `failed` de
  negocio. Nunca `outcome_unknown` si no hubo despacho. En perfil gobernado, rol inexistente o
  lectura de rol fallida **deniegan**; no se omite la PDP. `decide` revalida rol, tarea,
  seguimiento y oposición antes de despachar; la revocación después del claim detiene el
  efecto. La decisión humana aprobada no se reescribe por un fallo técnico.
- **Tests.** Revocación entre claim y despacho → cero llamadas y sin `unknown`; tabla de roles
  caída → denegación; opt-out tras aprobar → no despacha; rol de otro tenant.
- **Rollback.** Revertir conserva el comportamiento de M1.2 (más conservador que el histórico).

### B2.7 · Revisión canónica, diferido e idempotencia de propuesta

- **Paths.** `actions.ts` (`propose`, `edit`, `decide`, `dispatchScheduled`,
  `reconcileDispatchIntents`), tests.
- **Cambio.**
  - `edit`: digest canónico compartido con `propose`, actualiza `revision`, CAS sobre la
    revisión anterior, revalida `proposalSchema` y target, e invalida firmas previas según el
    contrato diferido.
  - Diferido: la intención se crea con la transición de firma (`collecting`/`scheduled`) en la
    misma transacción; `dispatchScheduled` reclama y **crea/reutiliza** el mismo intento con
    `attemptId`; undo contra dispatch es CAS y no dos escrituras ciegas. Si la ruta diferida no
    se certifica, queda explícitamente deshabilitada, no "funcionando por defecto".
  - `propose`: la misma `idempotencyKey` con contenido distinto devuelve conflicto por digest
    de solicitud; replay idéntico sigue devolviendo el existente. `followUpMeta` se persiste en
    la misma transacción que la propuesta o tiene reconciliación de huérfanos.
- **Tests.** Edición concurrente con aprobación; cambio de destinatario; generación rotada;
  firma antigua; dos firmas y undo/dispatch concurrentes; misma clave con contenido distinto;
  caída entre marca de seguimiento y propuesta.
- **Rollback.** Revertir el commit; no hay migración destructiva.

## 4 · Evidencia mínima por patchset

Cada patchset se cierra con: SHA de entrega, `pnpm typecheck` (exit real), suite focal del
área, prueba negativa y positiva por hallazgo, y —desde B2.2— los casos de carrera contra
PostgreSQL con dos conexiones, no PGlite. El gate combinado y `governed_v2` por defecto
siguen requiriendo autorización aparte y Node de CI.

| Patchset | Focal | Carrera PG | Fault injection | Contrato externo |
|---|---|---|---|---|
| B2.0 | sí | no | no | no |
| B2.1 | sí | no | no | Trans02 (dual-read) |
| B2.2 | sí | sí | no | no |
| B2.3 | sí | sí | sí (segundo CAS) | no |
| B2.4 | sí | sí | sí (caída/lease) | no |
| B2.5 | sí | no | sí (proyector) | SOP (ABI) |
| B2.6 | sí | sí | sí (revocación) | no |
| B2.7 | sí | sí | sí (undo/dispatch) | Trans03 (firma Google) |

## 5 · Fuera de B2 y bloqueos vivos

- **C01** selector único de conversación: ABI de Trans02.
- **E03** recibo empresarial verificado: contrato compartido Trans02/03/04.
- **A03-adapters**: Trans03 debe declarar `outcome` por adaptador.
- **H01** observabilidad: contrato con Trans04.
- **K09/K10** (puntos 12–13): series S y E, no B2.
- **`governed_v2` por defecto**: inventario de callers y gate combinado.

Ningún patchset de este plan se declara aprobado por pruebas focales. B2 sigue **NO_GO**
hasta que la reauditoría independiente repita los gates sobre el SHA combinado.
