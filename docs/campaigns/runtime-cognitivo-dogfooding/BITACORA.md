# Bitácora de ejecución

Diario cronológico de intentos y ejecuciones de las campañas. Registrar también las sesiones parciales: un test interrumpido o un inventario incompleto no se convierte en PASS. Cada entrada identifica el commit/SHA de partida y, cuando haya cambios, el SHA candidato. No guardar secretos, cuerpos privados de correo/documentos ni PII innecesaria.

## Formato por entrada

- **Run ID / fecha UTC:**
- **Branch / commit de partida:**
- **Commit candidato:** `sin cambios` o SHA correspondiente.
- **Campañas / patchsets:**
- **Estado:** `IN_PROGRESS / PASS_LOCAL / PASS_POSTGRES / PASS_PROVIDER_CONTROLLED / PASS_DOGFOOD / BLOCKED / FAIL / INTERRUPTED`.
- **Alcance y archivos revisados/cambiados:**
- **Comandos/checks y exit status:**
- **Notas sintetizadas:** hechos confirmados, discrepancias y límites.
- **Gates pendientes / siguiente paso:**

---

## RUN-2026-11-17-17 — C05-PS14: revocar el rol corta la aprobación que ya era visible

- **Fecha UTC:** 2026-11-17 15:42–15:45 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; cambios locales.
- **Campañas / patchsets:** C05-PS14 subgate local `PASS_LOCAL`; cierra el hueco anotado en RUN-12. C05 sigue `IN_PROGRESS`.
- **Archivos cambiados:** `apps/server/src/engine/tenant.ts` (`hasDurableMemberships(tenantId)`, sonda fail-closed); `apps/server/src/app.ts` (`requireCompanyAccess` ya no cae al camino legacy dentro de una empresa con matriz); `tests/c05-role-revocation.test.ts` (nuevo).
- **Notas sintetizadas:**
  1. Defecto reproducido: en una instalación `session`, revocar la membership durable de un `admin` lo devolvía al camino de compatibilidad single-tenant (la cuenta seguía teniendo la membership única `tenant-membership`) y aprobaba la propuesta que ya tenía delante. El comentario de RUN-12 lo dejaba como límite abierto.
  2. Regla nueva: el camino legacy solo vale donde la empresa **no tiene** ninguna membership durable. Con matriz, «sin fila» significa «sin rol» (revocado), no «cuenta antigua». La sonda se lee sin caché y un fallo de lectura se trata como «hay matriz» (deny), no como permiso.
  3. Tras revocar, la aprobación responde 403 `NO_MEMBERSHIP` y la propuesta permanece `awaiting_review`; la bandeja `/api/actions/pending` de ese actor también responde 403. El owner de la misma empresa sí la aprueba (cross-actor) y el registro queda con `approvedBy` del owner.
  4. La compatibilidad se conserva donde debe: una empresa sin ninguna membership durable (solo `tenant-membership`) sigue aprobando como antes.
- **Comandos/checks exactos:**
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/c05-role-revocation.test.ts`: **2/2 PASS**.
  - `tests/c05-approval-permission.test.ts` + `tests/c05-shared-actions.test.ts` + `tests/api.test.ts` + `tests/tenant-permissions.test.ts` + `tests/auth-me-tenant.test.ts` + `tests/tenant-principal.test.ts` + `tests/tenant-http-e2e.test.ts` + `tests/vertical-slice-approval.test.ts` + `tests/actions.test.ts` + `tests/workflows.test.ts`: **64/64 PASS**.
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0. `git diff --check`: exit 0.
- **Gates pendientes:** IdP externo, proveedor real, doble firma por actores distintos, worker multi-proceso/Postgres y abort de una tool ya en vuelo al revocar.

---

## RUN-2026-11-17-16 — C04-PS13 / C05-PS15: la suspensión y el disable cortan la tarea en vuelo

- **Fecha UTC:** 2026-11-17 15:20–15:40 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; cambios locales.
- **Campañas / patchsets:** C04-PS13 subgate local `PASS_LOCAL` para suspensión mid-flight; C05-PS15 refuerza el disable del agente en el mismo punto. Precondición de C07-PS20 acotada; C07 no se abre.
- **Archivos cambiados:** `apps/server/src/engine/worker.ts` (el `guard` que corre antes de cada tool/evento revalida `tenantActive` y `assigneeActive` con caché propia de 1 s, `WORKER_AUTHZ_CACHE_MS`; aborta antes de lanzar `LostLeaseError`); `tests/c04-midflight-suspension.test.ts` (nuevo).
- **Notas sintetizadas:**
  1. Defecto reproducido: RUN-11 y RUN-13 solo filtraban el **siguiente arranque**. Una tarea ya `running` seguía hasta el final aunque la empresa se suspendiera o el agente se deshabilitara: el efecto siguiente se producía igual.
  2. El corte reutiliza el `guard` existente (se llama antes de cada tool y de cada evento), así que no hay una segunda maquinaria de cancelación. Las comprobaciones son las mismas del tick, con el tenant de la fila ya fijado por `runInTenantScope`, y un fallo de lectura se trata como no autorizado (fail-closed).
  3. Al abortar el `AbortController` **antes** de lanzar, la tarea vuelve a `queued` sin `error` y sin consumir presupuesto de intentos: parar por suspensión no es un fallo del trabajo. Al levantar la suspensión o rehabilitar el agente, el mismo tick la reanuda con su identidad intacta (`assignedTo`/`assignedBy`).
  4. La comprobación se cachea aparte (1 s por defecto) para no sumar dos lecturas por paso en bucles con muchas tools; `WORKER_GUARD_CACHE_MS` y `WORKER_AUTHZ_CACHE_MS=0` dejan el corte determinista en el paso siguiente, que es lo que usa el test.
  5. Un intento falló porque el fixture escribía con el `TenantScopedStore` (doble prefijo `empresa-a:empresa-a:...`) y el worker no encontraba la fila; corregido el fixture, no el producto.
- **Comandos/checks exactos:**
  - `tests/c04-midflight-suspension.test.ts`: **2/2 PASS** (suspensión mid-flight: un solo paso ejecutado, tarea en cola, reanudada al levantar; disable mid-flight igual, reanudada al rehabilitar).
  - `tests/engine.test.ts` + `tests/tenant-suspension-worker.test.ts` + `tests/c05-agent-disable-worker.test.ts` + `tests/tenant-worker-claim.test.ts` + `tests/worker-concurrency.test.ts` + `tests/worker-metrics.test.ts` + `tests/crash-recovery.test.ts` + `tests/vertical-slice-worker.test.ts` + `tests/r02-a03-worker-identity.test.ts`: **21/21 PASS**.
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0. `git diff --check`: exit 0.
- **Gates pendientes:** una llamada al proveedor **ya enviada** no se puede abortar (solo el paso siguiente); worker multi-proceso, Postgres/RLS y cancelación con LLM real siguen abiertos.

---

## RUN-2026-11-17-15 — C05-PS14: propuestas de acción compartidas por empresa

- **Fecha UTC:** 2026-11-17 15:10–15:20 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; cambios locales.
- **Campañas / patchsets:** C05-PS14 subgate local `PASS_LOCAL` para visibilidad y aprobación cross-actor dentro de la empresa; cierra el límite de RUN-10/12. C05 sigue `IN_PROGRESS`.
- **Archivos cambiados:** `apps/server/src/actions.ts` (`ActionsStore.scanByPrefix` opcional, `findInCompany`, `pendingInCompany`, tipo `SharedActionReview`); `apps/server/src/app.ts` (`requireCompanyAccess` compartido, `GET /api/actions/pending`, la ruta `decide` resuelve la propuesta de otro actor del mismo tenant y pasa el `userId` real del aprobador); `tests/c05-shared-actions.test.ts` (nuevo).
- **Notas sintetizadas:**
  1. Defecto reproducido: la propuesta se guarda en la zona de quien la prepara (ahí vive su conexión de Google y su revisión), así que un `admin` con `actions.approve` recibía 404 sobre la propuesta de un `member` de su propia empresa: la matriz ya estaba cableada, pero el aprobador no podía ver ni alcanzar el registro.
  2. La resolución es por tenant ya resuelto por la petición (`scanByPrefix('actions', ctx.tenantId)`), nunca por búsqueda global: la empresa B no ve la propuesta de A y aprobarla da 404 sin efecto. El despacho sigue usando el owner del autor, es decir su conexión y su revisión —no una copia del aprobador—, y ahora el registro guarda `approvedBy` con el `userId` real del que aprobó.
  3. `GET /api/actions/pending` devuelve una revisión mínima (id, título, kind, estado, hash, vencimiento, `requestedBy`, `taskId`) sin `data`: se aprueba la revisión preparada, no se edita el payload de otro. Exige membership fresca con `records.read`, así que un `member` ve la bandeja pero no puede aprobar.
  4. Denegar sigue siendo del autor: denegar una propuesta ajena responde 404 y no cambia el estado. La compatibilidad single-tenant se mantiene igual que en RUN-12.
  5. Total del turno hasta aquí: 4 casos nuevos + regresiones, todos verdes; sin proveedores ni cuentas externas.
- **Comandos/checks exactos:**
  - `tests/c05-shared-actions.test.ts`: **4/4 PASS** (admin ve y aprueba lo del member con `approvedBy` del admin; member ve pero no aprueba; B no ve ni aprueba lo de A; denegar ajeno 404 sin efecto).
  - `tests/c05-approval-permission.test.ts` + `tests/actions.test.ts` + `tests/actions-deferred-wire.test.ts` + `tests/deferred-actions.test.ts` + `tests/vertical-slice-approval.test.ts` + `tests/api.test.ts`: **36/36 PASS**.
  - `tests/engine.test.ts` + `tests/workflows.test.ts` + `tests/tenant-http-e2e.test.ts` + `tests/c05-employees-agents.test.ts`: **27/27 PASS**.
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0. `git diff --check`: exit 0.
- **Gates pendientes:** IdP externo, proveedor real, doble firma por actores distintos, agentes compartidos por empresa (siguen por owner dentro del tenant), Postgres/RLS y dogfood A/B/C.

---

## RUN-2026-11-17-14 — C05-PS15: encolar para un agente deshabilitado se rechaza en todo tipo de tarea

- **Fecha UTC:** 2026-11-17 12:52–13:00 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; cambios locales.
- **Campañas / patchsets:** C05-PS15 subgate local `PASS_LOCAL`, complemento del RUN-13 por el lado de la creación. C05 sigue `IN_PROGRESS`.
- **Archivos cambiados:** `apps/server/src/engine/service.ts` (`createTask` rechaza con 409 cualquier `roleId` existente e inactivo, no solo el SOP tipado); `tests/c05-employees-agents.test.ts` (caso nuevo).
- **Notas sintetizadas:**
  1. Defecto reproducido: la validación de agente activo vivía solo en el camino del SOP tipado (`assertAgentCanWork`). Un `POST /api/agent/tasks` con `kind:"agent"` y `roleId` de un agente deshabilitado se aceptaba y quedaba en cola; combinado con RUN-13, la tarea quedaba retenida sin avisar al usuario. Ahora se rechaza al encolar.
  2. La comprobación usa la fila de `agent-roles` del owner+tenant: si existe y está `active:false` → 409 con el nombre del rol. Si el `roleId` no tiene fila (rol borrado o id libre) se conserva el comportamiento previo, igual que en el worker, para no romper tareas legacy.
  3. No se validan `sops` ni `allowedTools` en este punto fuera del SOP tipado: la matriz de tools sigue en governance al ejecutar.
- **Comandos/checks exactos:**
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/c05-employees-agents.test.ts`: **9/9 PASS** (incluye el caso nuevo: C deshabilitado 409 con «deshabilitado»; A habilitado 201 y `queued`).
  - `tests/agent-api.test.ts` + `tests/agent-runtime.test.ts` + `tests/engine.test.ts` + `tests/c05-agent-disable-worker.test.ts` + `tests/vertical-slice-worker.test.ts` + `tests/workflows.test.ts`: **31/31 PASS**.
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0. `git diff --check`: exit 0.
- **Gates pendientes:** validación de SOP autorizado para tipos no tipados, abort de tarea `running`, worker multi-proceso/Postgres, IdP externo y dogfood. Sin proveedores.

---

## RUN-2026-11-17-13 — C05-PS15: un agente deshabilitado tras encolar ya no ejecuta

- **Fecha UTC:** 2026-11-17 12:32–12:48 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; cambios locales.
- **Campañas / patchsets:** C05-PS15 subgate local `PASS_LOCAL` para revalidación del agente asignado en el worker; precondición de C07-PS20 (running/lease) acotada, no abierta. C05 sigue `IN_PROGRESS`.
- **Archivos cambiados:** `apps/server/src/engine/worker.ts` (opción `assigneeActive`, filtro antes de cuota/claim con el tenant de la fila); `apps/server/src/engine/service.ts` (cablea la lectura de `agent-roles` por owner); `tests/c05-agent-disable-worker.test.ts` (nuevo).
- **Notas sintetizadas:**
  1. Defecto reproducido: `assertAgentCanWork` (agente existe, activo, SOP autorizado) solo corría en `createTask` para el SOP tipado. Si el rol se deshabilitaba después de encolar, el worker reclamaba la tarea y la ejecutaba igual. Ahora cada tick revalida el rol asignado antes de cuota y claim.
  2. Deshabilitado → la tarea queda `queued`, con `attempts=0`, sin consumir cuota de owner ni slot de concurrencia. Rehabilitado → el siguiente tick la ejecuta conservando `assignedTo`, `assignedBy` y tenant.
  3. Un fallo al leer el rol se trata como inactivo (fail-closed): mejor esperar que despachar con estado desconocido. Sin `assigneeActive` (workers sueltos en tests) se conserva el comportamiento previo.
  4. Compatibilidad: una tarea sin rol (asignada al owner) o con `roleId` sin fila en `agent-roles` no se bloquea; solo se corta un rol que existe y está `active:false`. Se probaron ambos caminos para no convertir el arreglo en un bloqueo de tareas legacy.
  5. Límite que no se cierra: deshabilitar el rol no aborta una tarea ya `running` (solo afecta al siguiente arranque), igual que la suspensión de empresa; falta el abort mid-flight de C07. Tampoco se revalida `sops` ni `allowedTools` en el tick.
- **Comandos/checks exactos:**
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/c05-agent-disable-worker.test.ts`: **1/1 PASS** (marcos deshabilitado queda en cola; laia activo ejecuta; owner y rol borrado conservan curso; al rehabilitar, marcos ejecuta con identidad intacta).
  - `tests/tenant-suspension-worker.test.ts` + `tests/engine.test.ts` + `tests/tenant-worker-claim.test.ts` + `tests/worker-concurrency.test.ts` + `tests/worker-metrics.test.ts` + `tests/vertical-slice-worker.test.ts` + `tests/c05-employees-agents.test.ts` + `tests/c05-approval-permission.test.ts` + `tests/crash-recovery.test.ts`: **32/32 PASS** (claim único, segundo tenant, 50 workers, MAX_ACTIVE, métricas, suspensión, doble aprobación, crash con lease).
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0. `git diff --check`: exit 0.
- **Gates pendientes:** abort de tarea `running` al deshabilitar el rol, revalidación de capabilities/SOP en el tick, worker multi-proceso/Postgres, IdP externo y dogfood. Sin proveedores.

---

## RUN-2026-11-17-12 — C05-PS14: la ruta real de aprobación consulta la matriz de empresa

- **Fecha UTC:** 2026-11-17 12:18–12:26 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; cambios locales.
- **Campañas / patchsets:** C05-PS14 subgate local `PASS_LOCAL` para autorización de aprobación en la ruta HTTP; C02-PS08 refuerza el mismo límite (proponer ≠ aprobar). C05 sigue `IN_PROGRESS`.
- **Archivos cambiados:** `apps/server/src/app.ts` (la ruta `POST /api/actions/:id/decide` relee `findMembership` y exige `actions.approve` con `tenantAccess` cuando el actor tiene rol de empresa; denegar sigue sin permiso); `tests/c05-approval-permission.test.ts` (nuevo).
- **Notas sintetizadas:**
  1. Defecto reproducido y cerrado: la ruta de decisión solo comprobaba el owner. Un `member` con `actions.prepare` aprobaba su propia propuesta sin consultar la matriz, pese a que `tenantAccess`/`assertPermission` ya existían. Ahora aprobar exige rol fresco con `actions.approve`; el rol se lee sin caché (`findMembership`, no el resolver de enrutado).
  2. Denegar no exige `actions.approve`: retirar una propuesta no despacha nada y el actor que la preparó debe poder cancelarla. Sí queda sujeto a la resolución de tenant y al kill switch del middleware, que ya corrían antes.
  3. Compatibilidad: si el actor no tiene fila en `user-tenants` (cuenta single-tenant legacy, alta por signup), la ruta conserva el comportamiento anterior en modo `sample`/`session`. En despliegue multiempresa sin rol durable la respuesta es 403 `NO_MEMBERSHIP`: sin rol no se aprueba.
  4. La matriz se aplica por empresa: el `member` de B tampoco aprueba en B. Contra otra empresa, aprobar se corta antes por la matriz (403) y denegar no encuentra la propuesta (404), porque las acciones siguen owner-scoped.
  5. La propuesta denegada por el `member` termina `denied`; la rechazada por la matriz permanece `awaiting_review` y no pasa a `executing`/`succeeded` (se comprobó el estado durable).
  6. Límite que no se cierra aquí: un `member` no ve la propuesta de otro actor (scope por owner), así que la aprobación cross-actor de la misma empresa sigue sin ser posible; y revocar el rol dentro de una instalación `session` cuyo registro legacy siga apuntando a la empresa devuelve al camino de compatibilidad (en multiempresa ese camino no existe y responde 403).
- **Comandos/checks exactos:**
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/c05-approval-permission.test.ts`: **5/5 PASS** (member 403 sin efecto + estado durable; member deniega; admin y owner aprueban; matriz por empresa y propuesta ajena 404; cuenta legacy aprueba). Un primer intento falló la aserción de cruce (esperaba 404 y la ruta devolvía 403 por la matriz antes de buscar la propuesta); se corrigió el test para reflejar ambos cortes, no el producto.
  - `tests/api.test.ts` + `tests/tenant-permissions.test.ts` + `tests/c05-employees-agents.test.ts` + `tests/vertical-slice-approval.test.ts` + `tests/actions.test.ts` + `tests/actions-deferred-wire.test.ts` + `tests/deferred-actions.test.ts`: **46/46 PASS** (incluye la aprobación del workspace sample y la doble firma, sin cambios).
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0. `git diff --check`: exit 0.
- **Gates pendientes:** aprobación cross-actor dentro de la empresa (records/acciones compartidos por empresa), revocación del rol con propuesta ya visible en modo `session`, doble firma por actores distintos vía HTTP, IdP externo y dogfood. Sin proveedores.

---

## RUN-2026-11-16-01 — Inicio de ejecución autónoma, baseline y pruebas focales

- **Fecha UTC:** 2026-11-16 (hora exacta no disponible en la salida conservada).
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin cambios de código; el árbol ya contenía cambios documentales de la campaña antes de este intento.
- **Campañas / patchsets:** C00-PS00 iniciado, no cerrado. Inspección preparatoria de C01-PS02/03 y C03-PS09; ningún patchset de código aplicado.
- **Estado:** `INTERRUPTED` para la verificación focal; `C00 IN_PROGRESS`.
- **Alcance revisado:** subscriber del kernel, registro del subscriber en `EngineService` y arranque desde `apps/server/src/index.ts`; EventBus live publish/replay; schemas/tipos y productor Gmail interno; implementación Cyber SDK/bridge/relay/capabilities/projector; tests de coherencia y bridge.
- **Hallazgos sintetizados (revisión del repo):**
  1. El repo actual contiene `vendor/agntia-ciberseguridad-0.1.0-alpha.2.tgz` y `@agntia/ciberseguridad` está en `package.json`; el bridge Cyber tiene módulos y tests. La búsqueda de callsites bajo `apps/server/src` encontró definiciones de `installSecurityBridgeV2`, relay, tools y projector, pero no su invocación de producción. No se instaló ni activó el servicio child.
  2. El subscriber cognitivo está registrado por `EngineService.registerKernelListeners()` y el proceso de arranque lo llama desde `index.ts`. Mapea eventos de entidades, acciones, tareas, SOP, policy, state y verification; no incluye email/documentos. Su callback lanza el ciclo con `void` y captura/loguea el error; la entrega viva no prueba por sí sola una proyección durable/replayable.
  3. Los eventos `email.received` y `email.sent` sí están en tipos/schemas y los comandos del workspace `01-gmail` los emiten. El mapping cognitivo ausente es un hueco concreto; el flujo Gmail interno no se debe confundir con Google Workspace real.
  4. Los payloads del Gmail workspace contienen campos adicionales (`from`, `threadId`, label, etc.) y los schemas compartidos usan `.passthrough()`. Por ello no se debe proyectar el payload entero a Thoughts/logs: un futuro mapping requiere minimización explícita y referencias aprobadas.
  5. C01 no se puede completar como servicio operativo solo por existir el tarball/SDK: falta resolver endpoint, credencial y autorización tenant-scoped server-side, sin inventarlos ni activarlos.
- **Comandos/checks y resultados:**
  - `git status --short`, `git branch --show-current`, `git rev-parse HEAD`: árbol tenía modificaciones documentales previas; branch y SHA arriba.
  - `rg`/búsquedas focales para callsites Cyber, eventos email y mapping del kernel: se conservaron los hallazgos resumidos arriba.
  - `pnpm --version`: no ejecutable (`pnpm: command not found`). Node `v26.13.0`, npm `11.20.0`; `node_modules/.bin/tsx` y el paquete Cyber local estaban presentes.
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/kernel-coherence.test.ts tests/cognition-v2-cyber-bridge.test.ts tests/cognition-v2-security-context.test.ts`: **exit 137**. La salida alcanzó a mostrar dos pruebas del bridge Cyber como pasadas; la ejecución conjunta no terminó limpiamente y no permite declarar la suite ni C01/PS como PASS. `kernel-coherence.test.ts` no produjo resultado visible en la salida conservada.
- **Gates pendientes / siguiente paso:** cerrar C00-PS00 con callgraph/matriz anclados al SHA; correr por separado las pruebas focales con recursos adecuados; luego decidir el patchset mínimo de C03-PS09 para mapping de email con payload minimizado y prueba de subscriber. Mantener C01 wiring real bloqueado hasta contar con configuración autorizada del endpoint/credenciales; no activar proveedor real.

---

## RUN-2026-11-17-11 — C04-PS13 / precondición C07: el worker respeta la suspensión de empresa

- **Fecha UTC:** 2026-11-17 11:56–11:57 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; cambios locales.
- **Campañas / patchsets:** C04-PS13 subgate de suspensión en caliente sobre el worker `PASS_LOCAL`; precondición de C07-PS20 (reinicio/crash) reforzada. C07 no se abre.
- **Archivos cambiados:** `apps/server/src/engine/worker.ts` (opción `tenantActive` y filtro fail-closed antes de cuota/reclamo); `apps/server/src/engine/service.ts` (inyecta `tenantService.tenantState` si existe); `tests/tenant-suspension-worker.test.ts` (nuevo).
- **Notas sintetizadas:**
  1. Defecto reproducido: el worker no consultaba `tenant-state`; una tarea `queued` de una empresa suspendida se reclamaba y ejecutaba igual. La suspensión solo cortaba peticiones HTTP.
  2. El tick ahora comprueba el estado del tenant de cada fila antes de cuota y claim. Si la lectura falla, se trata como suspendida (fail-closed) y la tarea permanece en cola para el siguiente tick; al levantar la suspensión se ejecuta sin cambiar su identidad.
  3. Sin `tenantService` (tests y workers sueltos) no se consulta nada: el comportamiento previo se conserva. No se aborta una tarea ya `running`; el gate cubre el siguiente arranque, no la cancelación mid-flight.
- **Comandos/checks exactos:**
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/tenant-suspension-worker.test.ts`: **1/1 PASS** (A ejecuta; B suspendida queda `queued`; C con lectura fallida queda `queued`; tras levantar estado, B y C ejecutan).
  - `tests/engine.test.ts` + `tests/tenant-worker-claim.test.ts`: **9/9 PASS** (claim único, cancelación de lease obsoleto, recuperación tras reinicio, tareas programadas/aprobaciones, tenant secundario, filas sin prefijo, 50 workers un ganador).
  - `tests/worker-concurrency.test.ts` + `tests/worker-metrics.test.ts` + `tests/vertical-slice-worker.test.ts`: **8/8 PASS** (MAX_ACTIVE, métricas, recibo negativo, tick no reejecuta).
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0. `git diff --check`: exit 0.
- **Límites / gates pendientes:** PGlite en un proceso; no se prueba abort de tarea en vuelo, renovación de lease bajo suspensión, worker multi-proceso ni Postgres. Sin proveedores.

---

## RUN-2026-11-17-10 — C05-PS14/PS15 local: tres empresas con dos empleados y tres agentes

- **Fecha UTC:** 2026-11-17 11:50–11:55 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; cambios locales.
- **Campañas / patchsets:** C05-PS14 subgate local `PASS_LOCAL` (3 owners + 2 empleados por empresa, roles, memoria privada); C05-PS15 subgate local `PASS_LOCAL` (3 agentes por empresa, disable/no-SOP/cross-owner, governance, provenance). C05 sigue `IN_PROGRESS`.
- **Archivos cambiados:** `tests/c05-employees-agents.test.ts` (nuevo). Sin cambios de producto.
- **Notas sintetizadas:**
  1. Nueve identidades locales con user ID y email distintos: owner + admin + member por cada empresa A/B/C; una membership de tenant por identidad y rol `owner/admin/member` leído de la membership durable.
  2. Cada una de las 9 sesiones solo entra en su empresa; `x-tenant-id` ajeno devuelve 403 en `/api/agent`. La matriz de empresa se evalúa con `tenantAccess` sobre `findMembership` fresco: member no aprueba, admin aprueba pero no administra la empresa, owner administra; un empleado sin membership en otra empresa recibe `NO_MEMBERSHIP`.
  3. Memoria privada: el recuerdo del admin de A no lo lee el member de A ni el owner de B.
  4. Tres agentes por empresa con los mismos IDs (`laia`, `comercial`, `marcos`) escritos por `TenantScopedStore` (clave `tenant:owner`): el listado de cada owner devuelve solo sus tres. `marcos` deshabilitado en C bloquea la tarea con 409; `marcos` sin el SOP en B devuelve 422; un role ID inexistente bajo el owner A devuelve 422; un agente habilitado crea la tarea con `assignedTo=marcos`, `assignedBy=user A` y `tenantId=c05-a`.
  5. `AgentGovernance.canExecuteTool` deniega una tool fuera de `allowedTools` sin consultar policy y permite la concedida (una consulta).
  6. Suspender C corta su siguiente petición con `TENANT_SUSPENDED` y A/B siguen operando.
  7. Dos intentos fallidos antes del PASS: `/api/roles` devolvía 404 (la ruta real es `/api/agent/roles`) y sembrar roles con el Store crudo los dejaba fuera de la zona `tenant:owner` que lee el engine; corregido el fixture con el store scoped, no el producto.
- **Comandos/checks exactos:**
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/c05-employees-agents.test.ts`: **8/8 PASS** tras los dos ajustes de fixture.
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0.
- **Límites / gates pendientes:** auth local por sesión, no IdP externo; los records de negocio siguen scoped por owner, por lo que "records compartidos" por empresa no se acredita (C06-PS16). La matriz `assertPermission` no está cableada a la ruta real `/api/actions/:id/decide`, que además es owner-scoped: un member no puede aprobar la propuesta de otro actor porque no la ve, no porque la ruta lo deniegue. Agentes viven por owner dentro del tenant, no compartidos por la empresa. No se probó disable por chat ni ejecución real de LLM/worker. Sin proveedores.

---

## RUN-2026-11-17-09 — C03-PS11 local: relaciones, cardinalidad y validación de schema

- **Fecha UTC:** 2026-11-17 11:40–11:48 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; cambios locales.
- **Campañas / patchsets:** C03-PS11 subgate `PASS_LOCAL` para tipos de relación, extremos, cardinalidad y validación schema-aware de create/update; C04 refuerza el aislamiento por owner de esas cardinalidades. PS11 no se cierra: cross-container y rebuild quedan abiertos.
- **Archivos cambiados:** `apps/server/src/engine/business/graph.ts`; `tests/business-graph.test.ts`.
- **Notas sintetizadas:**
  1. Defecto reproducido: `createRelation` solo comprobaba existencia de ambas entidades y self-reference; ignoraba el schema del tenant. `updateEntity` no validaba el patch contra el schema (ni tipos de campo ni estados); `createEntity` tampoco validaba `status` contra los estados declarados.
  2. `createRelation` ahora exige, cuando el schema declara relaciones, que el tipo exista y que `from.type`/`to.type` coincidan con `fromType`/`toType`. Si no hay schema o no declara relaciones, se conserva el modo legacy para no invalidar grafos anteriores.
  3. Cardinalidad: `one-to-one` rechaza que cualquiera de los dos extremos participe dos veces; `one-to-many` rechaza un segundo origen para el mismo destino; `many-to-many` no limita. El chequeo y el `insertIfAbsent` van en la misma transacción del Store.
  4. `updateEntity` valida solo los campos tocados por el patch (más el `status`): un registro legacy sin un required histórico sigue actualizándose por nombre, pero un cambio de tipo/enum/estado inválido falla con 422. `createEntity` valida el `status` inicial contra los estados declarados.
  5. Compatibilidad de versión: se crea una entidad con schema 1.0, se sube el schema a 2.0 con un required nuevo y la entidad anterior sigue legible y actualizable; las escrituras nuevas sí exigen el campo. Un tipo de campo desconocido en el schema falla cerrado.
  6. Las cardinalidades se cuentan por owner: el mismo `client`/`invoice` en A y B no se bloquea entre sí.
- **Comandos/checks exactos:**
  - `tests/business-graph.test.ts`: **17/17 PASS** (15 tras el primer arreglo, 17 con compatibilidad de versión y tipo desconocido).
  - `tests/entity-resolver.test.ts` + `tests/state-machine.test.ts` + `tests/context-engine.test.ts`: **12/12 PASS** (sin schema, el modo legacy sigue funcionando).
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0. `git diff --check`: exit 0.
- **Límites / gates pendientes:** el chequeo de cardinalidad es transaccional pero no hay índice/constraint único en DB; dos transacciones concurrentes en Postgres podrían pasar ambas. Relaciones entre contenedores (PS16), schema por versión realmente instalado, tipos de extremo con entidades no declaradas (hoy permitidas por compatibilidad) y reconstrucción del grafo desde el event log (los eventos solo llevan refs/version, no el cuerpo) siguen abiertos. Todo en PGlite.

---

## RUN-2026-11-17-08 — C02/C03 local: grafo de negocio, kernel y recibos durables

- **Fecha UTC:** 2026-11-17 11:33–11:34 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; solo ejecución de suites existentes.
- **Campañas / patchsets:** evidencia local para C03-PS11 (grafo/estado) y C03-PS09 (recibos durables), más refuerzo de C02-PS07/PS08.
- **Comandos y resultados:**
  - `tests/business-graph.test.ts` + `tests/entity-resolver.test.ts` + `tests/state-machine.test.ts`: **16/16 PASS**. Provenance obligatoria, 409 por id duplicado, patch preserva properties, relación exige ambas entidades y rechaza self-reference, borrado elimina relaciones huérfanas, entidades scoped por owner, resolución por CIF, máquina de estados rechaza transición inexistente y respeta roleId.
  - `tests/kernel.test.ts` + `tests/kernel-consolidate.test.ts` + `tests/memory.test.ts`: **15/15 PASS**. Turno abierto/cerrado con thoughts, append sobre cerrado falla, cierre en cascada de hijos, hash chain de auditoría, consolidación por tenant, CRUD de memoria con categoría/tags y patch vacío 422.
  - `tests/cognition-v2-event-receipts.test.ts` + `tests/cognition-v2-faults.test.ts` + `tests/cognition-v2-durability.test.ts`: **7/7 PASS**. 501 eventos replay con cursor durable, crash revierte efectos, fencing rechaza worker viejo, ACK durable, pérdida de ACK queda unknown y reconcilia con el event ID preservado, replay tardío no recrea cadena revocada, emit anidado espera commit externo y rollback no publica.
- **Notas sintetizadas:**
  1. Total acumulado del turno: **213 PASS, 0 FAIL, 1 SKIP** (Postgres sin DSN).
  2. `business-graph` cubre existencia, provenance y self-reference; **no** cubre cardinalidad declarada, tipos de extremos ni cross-container: esas filas de la matriz siguen abiertas y no se elevan.
  3. El test de fallo de notificación post-commit emite `background_failure` esperado y el evento sigue confirmado: es el contrato correcto, no un fallo de suite.
  4. Todo en PGlite; el replay de 501 eventos es local y no sustituye Postgres/RLS ni un worker multi-proceso.
- **Gates pendientes:** cardinalidad/tipos de relación y schema por tenant (PS11), replay en Postgres, provider real, C05–C07.

---

## RUN-2026-11-17-07 — C03/C07 local: secretos, adaptadores, crash y dead-letter

- **Fecha UTC:** 2026-11-17 11:35 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; solo ejecución de suites existentes.
- **Campañas / patchsets:** refuerzo local de C03-PS09/PS10 (minimización, recuperación observable) y precondición local de C07-PS20 (crash/lease). C07 no se abre: no hay rebuild ni dogfood.
- **Comandos y resultados:**
  - `tests/context-secret-exposure.test.ts` + `tests/connections-adapters.test.ts` + `tests/vault.test.ts`: **14/14 PASS**. El payload de un evento no llega a prompt, telemetría ni consola; adaptadores Resend/Vapi/Places/Meta devuelven 503 sin credencial, validan destinatario y tratan 5xx como resultado desconocido; vault usa nonce fresco y no ecoa secretos.
  - `tests/crash-recovery.test.ts` + `tests/dead-letter.test.ts` + `tests/event-bus-stress.test.ts`: **8/8 PASS**. Muerte del worker a mitad de tarea deja `running` con lease; dead-letter idempotente, con resolve/remove/requeue y aislamiento por owner; 500 emisiones sin pérdida.
- **Notas sintetizadas:**
  1. Estos 22 PASS elevan el total del día a **175 PASS, 0 FAIL, 1 SKIP** (el skip Postgres de RUN-06).
  2. `crash-recovery` prueba que el lease persiste, no que la tarea se recupere y termine sin duplicar efecto: el rescate y el replay siguen siendo gates de C07.
  3. Los adaptadores se ejercitan con transporte simulado; ninguna clave real se usó y el test de secretos confirma que el payload no se propaga.
- **Gates pendientes:** recuperación efectiva de tarea tras crash, rebuild sin reejecutar efectos, Postgres/RLS y proveedores controlados.

---

## RUN-2026-11-17-06 — Barrido local C01/C02/C03/C04: 153 pruebas, 1 skip por Postgres ausente

- **Fecha UTC:** 2026-11-17 11:28–11:33 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; árbol local. Este run no cambia código de producto: solo ejecuta suites existentes y reevalúa el ledger.
- **Campañas / patchsets:** subgates locales de C01-PS02/PS03 (bridge/relay/contexto), C02-PS05/PS06/PS08 (Drive, Gmail, aprobación), C03-PS09/PS10 (bus, policy, capabilities/agentes) y C04-PS13 (HTTP A/B/C, RAG, worker, cache, revocación). Ninguna campaña se cierra; todos los gates externos y Postgres siguen abiertos.
- **Comandos y resultados exactos** (todos con `node --import tsx --import ./tests/setup.ts --test --test-timeout=…`):
  - `tests/tenant-http-e2e.test.ts`: **7/7 PASS**. Tareas A/B/C, spoof de tenant 403, archivos A/B/C con 404 cruzado, switch-tenant, notifications con tenantId, traza del kernel sin contenido ajeno.
  - `tests/vertical-slice-drive.test.ts`: **4/4 PASS**. Leer no indexa, indexar persiste tras reinicio, reindex sustituye revisión, revoke de A retira chunks y B conserva los suyos, fallo observable y reintento.
  - `tests/rag.test.ts` + `tests/cognition-v2-rag.test.ts`: **7/7 PASS**. Incluye el subgate de mismo owner/sourceId/connectionId A/B de RUN-2026-11-17-05.
  - `tests/tenant-worker-claim.test.ts` + `tests/r02-a03-worker-identity.test.ts`: **4/4 PASS**. Tarea de la segunda empresa reclamada, 50 workers con un único ganador, restauración de tenant/actor persistidos tras reabrir el Store.
  - `tests/cognition-v2-workers.test.ts`: **2 PASS, 1 SKIP**. Worker cognitivo reintenta por tenant, readiness falla cerrado, recupera recibos durables tras reiniciar. El test con Postgres real se omitió: `COGNITION_TEST_POSTGRES_URL` no está definido.
  - `tests/tenant-cache.test.ts` + `tests/vertical-slice-worker.test.ts`: **8/8 PASS**. Cache de membership e invalidación; un callback vacío o recibo negativo nunca produce recibo de éxito; tick no reejecuta.
  - `tests/tenant-isolation-extended.test.ts`: **3/3 PASS**. 50 tenants sin lectura cruzada, `scanByPrefix`, rechazo de prefijo malicioso.
  - `tests/cognition-v2-cyber-bridge.test.ts` + `tests/cognition-v2-security-context.test.ts`: **6/6 PASS**. Grant server-side, tenant cruzado rechazado antes del SDK, relay confirma tras commit y recupera ACK perdido, dedupe tras reinicio, hash/tenant inválidos sin efecto, recibo parcial proyectado como contexto privado con `securityGuarantee:false`.
  - `tests/policy-engine.test.ts` + `tests/actions-deferred-wire.test.ts` + `tests/actions.test.ts` + `tests/deferred-actions.test.ts`: **25/25 PASS**. Allowlist de tools, deny sin efecto, aprobación concurrente única, hash obsoleto, conexión rotada, `outcome_unknown` sin retry, propuestas persistidas entre instancias, doble firma.
  - `tests/cognition-v2-transactions.test.ts`: **1/1 PASS**. Rollback concurrente no commitea otra cadena.
  - `tests/api.test.ts`: **7/7 PASS**. Incluye `POST /api/drive/files/:id/index`: 401 anónimo, 403 origen ajeno, 409 sin Google conectado. Log de cleanup `PGlite is closed` tras los asserts (ruido de lifecycle ya anotado en RUN-2026-11-16-02).
  - `tests/permissions.test.ts` + `tests/jwt-authz.test.ts` + `tests/tenant-permissions.test.ts`: **20/20 PASS**. JWT firma/tenant/audiencia/caducidad, RS256+JWKS, matriz owner/admin/member, suspensión y revocación en caliente.
  - `tests/registry.test.ts` + `tests/agent-runtime.test.ts` + `tests/agent-api.test.ts`: **17/17 PASS**. Runtime de agente, registry de vistas y API de tareas/objetivos/memoria con aislamiento por owner autenticado.
  - `tests/tenant-principal.test.ts` + `tests/auth-me-tenant.test.ts` + `tests/workspaces-tenant.test.ts`: **18/18 PASS**. Tenant del JWT/sesión, sin membership 403, DB caída 503 sin fallback a `default`, vista y queries con tenant.
  - `tests/vertical-slice-gmail.test.ts` + `tests/vertical-slice-google-connection.test.ts`: **9/9 PASS**. Respuesta atada a hilo/mensaje/cuenta, inyección en el correo no cambia destinatario, recibo releído, otra empresa no responde el hilo, conexiones por tenant, revocación durante callback/refresco.
  - `tests/vertical-slice-approval.test.ts` + `tests/vertical-slice-memory.test.ts`: **10/10 PASS**. Doble aprobación → una llamada, timeout ambiguo sin reenvío, rotación de conexión, memoria compartida A/B y privada por actor, relectura tras reinicio.
  - `tests/event-bus.test.ts` + `tests/event-bus-dedupe.test.ts` + `tests/kernel-turn-index.test.ts`: **5/5 PASS**. Todo `SystemEventType` tiene schema/payload y aparece en algún emit; dedupe; índices de pensamiento no se confunden con turnos.
- **Notas sintetizadas:**
  1. Total del barrido: **153 PASS, 0 FAIL, 1 SKIP**. El skip es la única prueba Postgres y no se contabiliza como evidencia.
  2. Todos los proveedores Google/Gemini fueron simulados con `fetch` mockeado o fixtures; no hubo llamadas externas ni cuentas reales. Cyber tampoco se conectó a un servicio: solo SDK/relay con transporte inyectado.
  3. El relay Cyber demuestra commit-local-antes-de-ACK y recuperación de ACK perdido en PGlite, pero no un child real, ni reintento de red productivo, ni grants emitidos por un IdP.
  4. Persisten límites ya registrados: sin Postgres/RLS, sin IdP externo, sin Drive/Gmail reales, sin worker multi-proceso en infraestructura, sin dogfood de empresas.
- **Gates pendientes:** `COGNITION_TEST_POSTGRES_URL` para el worker y RLS; wiring productivo de Cyber con endpoint/credencial autorizados (C01 sigue bloqueado para operación); provider controlado de Drive/Gmail; matriz restante de C04-PS13 (jobs/replay ampliado, cache de retrieval, suspension mid-flight sobre cada endpoint); C05–C07 sin iniciar.

---

## RUN-2026-11-17-05 — C04 PS13 local: mismo ID RAG en tenants A/B y revocación aislada

- **Fecha UTC:** 2026-11-17 11:12 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; árbol local.
- **Campañas / patchsets:** C04-PS13 subgate de chunks/registry/search/removal RAG `PASS_LOCAL`; C04 sigue `IN_PROGRESS`.
- **Archivos cambiados en este subgate:** `tests/cognition-v2-rag.test.ts`; `BITACORA.md`, `EVIDENCE.md`, `MATRIZ-200.md`, `README.md`.
- **Notas sintetizadas:**
  1. En Store PGlite envuelto por TenantScopedStore se usaron el mismo owner (`shared-owner`), sourceId (`drive:shared-file`), connectionId y revisión para tenant-a y tenant-b; difieren nombre y texto sintéticos.
  2. Ambos tenants consultan únicamente su propio chunk/metadata. Tras `removeSource` en A, la fuente desaparece de A y B conserva su registro y resultado de búsqueda.
  3. Las llamadas de embeddings se simularon con `fetch` local. No se accedió a Google Drive, Gemini, credenciales OAuth ni empresas reales.
  4. Un primer run falló por import faltante de `currentTenantScope` en el fixture; el typecheck detectó lo mismo. Import añadido; el test y typecheck pasaron.
  5. Este subgate prueba la frontera del Store local para RAG. No cubre las rutas HTTP de RAG, unión de identidad/provider Drive, SQL/Postgres/RLS, los workers ni snapshots del RAG cognitivo durable.
- **Comandos/checks exactos:**
  - Primer intento: `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/cognition-v2-rag.test.ts`: 1/2 PASS; nuevo test falló `currentTenantScope is not defined`.
  - Primer `node_modules/.bin/tsc --noEmit --pretty false`: exit 2, mismo símbolo faltante.
  - Tras importar el símbolo, mismo comando de test: 2/2 PASS.
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0.
  - `git diff --check`: exit 0.
- **Gates pendientes:** RAG cross read/write vía HTTP y origen de account/connection, chunks/citations con Drive/provider controlado, Postgres/RLS, jobs/replay/revocation mid-flight y otras superficies de C04-PS13.

---

## RUN-2026-11-17-04 — C04 PS13 local: aislamiento y lectura del índice KernelTurn

- **Fecha UTC:** 2026-11-17 10:52 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit; árbol local.
- **Campañas / patchsets:** C04-PS13 subgate del índice de turnos `PASS_LOCAL`; C04 continúa `IN_PROGRESS`.
- **Archivos cambiados:** `tests/kernel-coherence.test.ts`; `apps/server/src/kernel/subscribers/turn-index-query.ts`.
- **Notas sintetizadas:**
  1. Se añadieron eventos `kernel.turn.opened` con mismo owner/turnId bajo dos tenants, triggers distintos. Tras indexación async, `recent`, `byOwner` y `byTrigger` devuelven solo el turno del tenant pedido.
  2. El primer run ejecutable falló porque `recent` y `byOwner` deserializaban el wrapper SQL `{data: IndexedTurn}` como turno directo. Ambas consultas ahora mapean `row.data`, igual que el arreglo previo de KernelThoughtIndex.
  3. Dependencias faltaban en el checkpoint; se reinstalaron desde pnpm lockfile fijado usando `npx pnpm@11.19.0 install --frozen-lockfile`; la instalación confirmó lockfile intacto. No se cambiaron manifiestos/lockfile.
  4. La evidencia es Store PGlite local. El indexer sigue best-effort/live con LRU in-memory; no se prueba Postgres/RLS, cursor durable o recovery tras reinicio.
- **Comandos/checks exactos:**
  - `npx --yes pnpm@11.19.0 install --frozen-lockfile`: exit 0, lockfile validado como up to date.
  - Primer intento pre-install: test/typecheck no pudieron iniciar por ausencia de `tsx`/`tsc`; no contar como resultado de código.
  - Antes del fix SQL: `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/kernel-coherence.test.ts`: 11/12 PASS; regresión de turn index falló con tenantId `undefined`.
  - Después del fix: mismo comando 12/12 PASS.
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0.
- **Gates pendientes:** replay/durabilidad del subscriber, Postgres/RLS, y matriz restante de C04-PS13 (RAG/Drive/mail/jobs/revoke/cache) siguen abiertos.

---

## RUN-2026-11-17-03 — C04 PS13 local: aislamiento del índice KernelThought

- **Fecha UTC:** 2026-11-17 01:39–01:41 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit creado; working tree local.
- **Campañas / patchsets:** C04-PS13 subgate de aislamiento de índices Thoughts `PASS_LOCAL`; C03 PS9/PS10 no se amplían/cierra con esta prueba.
- **Archivos cambiados:** `tests/kernel-coherence.test.ts`; `apps/server/src/kernel/subscribers/thought-index-query.ts`.
- **Notas sintetizadas:**
  1. Se añadió test con mismo `owner`, `thoughtId` y `turnId` en `tenant-a` y `tenant-b`. El consumer escucha eventos globales, y al esperar la escritura ambas particiones contienen un índice independiente; `byTurn` y `byOwner` de cada tenant devuelven solo su registro. Esto confirma aislamiento local del índice con Store PGlite de test.
  2. El primer intento falló: las queries SQL seleccionan `data` y `Store.select` devuelve filas `{data: IndexedThought}`, pero `KernelThoughtIndex.byTurn` devolvía la fila wrapper como si fuera `IndexedThought`; `tenantId`/owner quedaban `undefined`. `byTurn` y `byRole` ahora proyectan `row.data`.
  3. `startKernelThoughtConsumer` sigue siendo callback live fire-and-forget con LRU in-memory; el test espera la fila, pero no demuestra cursor/receipt durable, dedupe tras restart, replay del subscriber, Postgres RLS ni dogfood.
- **Comandos/checks:**
  - Primer intento de `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/kernel-coherence.test.ts`: 10/11 PASS; el test nuevo reprodujo la deserialización SQL incorrecta.
  - Tras el fix, mismo comando: 11/11 PASS.
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0.
- **Gates pendientes:** replay/durabilidad del consumer y matrices pendientes de RAG/Drive/mail/jobs/revoke siguen abiertos en C04-PS13.

---

## RUN-2026-11-17-02 — C03/C04 local: EventBus con owner en tenants múltiples

- **Fecha UTC:** 2026-11-17 01:31–01:35 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit creado; working tree local.
- **Campañas / patchsets:** C03-PS09/10 `PASS_LOCAL` para partición del EventBus y cache de deduplicación; C04-PS13 subgate de eventos persistidos con mismo owner en dos tenants `PASS_LOCAL`. No cerrar C03/C04 enteras.
- **Archivos del patchset actual:** `apps/server/src/engine/events/bus.ts`; `tests/kernel-coherence.test.ts`; resto del diff listado en RUN-2026-11-17-01 ya existía al iniciar esta continuación.
- **Notas sintetizadas:**
  1. Defecto reproducido: EventBus fabricaba evento con `tenant-a`, pero StoreSink recibía un `TenantScopedStore` que resolvía el owner compartido a `tenant-b`; por tanto la fila no existía bajo `tenant-a:owner` (test fallaba `0 !== 1`).
  2. `emit()` ahora fija el tenant resuelto como scope de storage alrededor del sink, dedupe durable, prefs/notificaciones y postcommit. Si un request scope existe, prevalece como autoridad y `options.tenantId` divergente se rechaza con `TENANT_MISMATCH` antes de escribir. Fuera de scope, tenant explícito permite particionar con mismo owner; el resolver primario se conserva para emisiones sin explicit tenant.
  3. La clave LRU de deduplicación en memoria se amplió a tenant+owner+key, y su comprobación/prueba prueba que el mismo `dedupeKey` puede representar un hecho independiente en cada tenant.
  4. La primera variante de fixture usó un resolver constante que intencionalmente ignoraba el scope; corregida para reflejar el resolver de producción (`currentTenantScope()?.tenantId ?? primary tenant`). Se probó Store PGlite de test, no Postgres restringido ni DB de dogfood. El caso de tenant mismatch emite un `background_failure` esperado porque EventBus conserva su contrato de devolver error no-throw; el evento no se persiste.
- **Comandos/checks exactos:**
  - Antes del fix, `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/kernel-coherence.test.ts`: 9/10 PASS, la nueva regresión falló por evento ausente en tenant-a; evidencia del bug.
  - Después del fix y extensión de dedupe, el mismo comando: 10/10 PASS.
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/event-bus.test.ts`: 3/3 PASS.
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0.
  - `git diff --check`: exit 0.
- **Límites / gates pendientes:** EventBus live subscribers sigue siendo entrega en proceso y no acredita receipt/cursor durable ni replay de Thoughts. C04-PS13 aún debe cubrir RAG/Drive/mail/connections, graph/Thought, jobs/restart, revoke/cache. Sin proveedores externos ni dogfood.

---

## RUN-2026-11-17-01 — C04 PS12 local: owners distintos y aislamiento HTTP A/B/C

- **Fecha UTC:** 2026-11-17 00:00–00:08 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** no creado; cambios locales sin commit.
- **Campañas / patchsets:** C04-PS12 `PASS_LOCAL` para tres principals autenticados por el login local de test, tenant/membership A/B/C distintos, correos de fixture distintos y tareas aisladas; C04-PS13 `IN_PROGRESS`, con subgate local de archivos A/B/C pasado.
- **Archivos añadidos/cambiados en este run:** `apps/server/src/files.ts` (usa el tenant del scope de petición para directorio de almacenamiento y lectura, en vez del `"default"` heredado); `tests/tenant-http-e2e.test.ts`, `tests/vertical-slice-provision.test.ts`; documentación de estado (`BITACORA.md`, `EVIDENCE.md`, `MATRIZ-200.md`, `PLAN.md`, `README.md`).
- **Notas sintetizadas:**
  1. La prueba de provisión confirma tres user IDs/owners y emails de fixture distintos. Sus actores resultantes tienen roles `owner`, `owner`, `member`; no se presenta como prueba de cardinal empleado de C05.
  2. La prueba HTTP amplía el fixture existente a tres usuarios creados en la DB temporal y con sesiones obtenidas por `/api/auth/login`; cada uno crea y lee su propia tarea y no ve los marcadores de los otros dos. Un body de A que solicita `tenant-b` recibe 403. Se trata de auth local de test/fixture, no de IdP o cuentas externas.
  3. La matriz completa C04-PS13 sigue pendiente para superficies de documentos, RAG, Drive/Gmail, Thought/event, jobs/replay, cache, revocación y todos los cross read/write solicitados. No hubo llamadas a providers ni se modificaron datos externos.
  4. Primer intento de la prueba HTTP falló porque el fixture usó campos/kind que no corresponden a `createTaskSchema`; corregido el test para usar `prompt`/`kind: agent`.
  5. Al ampliar la comprobación a archivos, se confirmó que `POST /api/files` y varios callers pasan tenant `default` a `Files.import`, mientras la metadata se guarda por TenantScopedStore en el tenant autenticado y los bytes caían en el directorio `default`. Se cambió `Files.import/bytes` para preferir `currentTenantScope()?.tenantId`, preservando el argumento explícito fuera de una petición. El nuevo test sube un marcador distinto por A/B/C, confirma namespace/lectura propia y verifica 404 cruzado para los otros dos tokens. No indexa los marcadores en RAG ni usa archivos/proveedores reales.
- **Comandos/checks y resultados:**
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/vertical-slice-provision.test.ts`: 8/8 PASS.
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/tenant-http-e2e.test.ts`: 7/7 PASS; incluye tareas A/B/C, tenant forjado 403 y archivos A/B/C con lectura cruzada 404.
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0 tras el cambio de `Files`.
  - `git diff --check`: exit 0.
  - `node_modules/.bin/biome check tests/tenant-http-e2e.test.ts tests/vertical-slice-provision.test.ts`: exit 1 por formato/estilo preexistente en ambos archivos (líneas antiguas de snapshots/asserts y concatenación en `tenant-http-e2e.test.ts`); no se reformatearon bloques ajenos al cambio.
- **Gates pendientes / siguiente paso:** completar matriz C04-PS13 sobre RAG/chunks, Drive, correo/conexiones, graph/Thoughts, jobs/replay, cache y revocación; no declarar PASS_DOGFOOD ni auth de IdP. C01 Cyber permanece bloqueado por configuración externa autorizada ausente; C02/C03 mantienen los límites que constan en RUN-02.

---

## RUN-2026-11-16-02 — C00 parcial, C02-PS05 y C03-PS09

- **Fecha UTC:** 2026-11-16 23:45–23:55 UTC.
- **Branch / commit de partida:** `feat/cognition-v2-stepwise-001-504c0b5b` / `770f86e86f84cf66790884f59e2734228db9e934`.
- **Commit candidato:** sin commit creado; cambios locales sin integrar.
- **Campañas / patchsets:** C00-PS00 parcialmente revalidado; C02-PS05, C02-PS08 comprobado con tests existentes; C03-PS09 implementado para dos eventos email; C04-PS12 test local de provisionamiento A/B/C sintético añadido y aprobado. C01 inspeccionado/testeado en composición local, no cableado.
- **Estado:** C02-PS05 `PASS_LOCAL` limitado a auth/origin/sin conexión y tests focales existentes; C03-PS09 `PASS_LOCAL` para el mapping email nuevo. C00 sigue `IN_PROGRESS`; C01 `BLOCKED` para wiring operativo externo.
- **Archivos cambiados:** `apps/server/src/app.ts` (POST autenticado para indexación explícita); `apps/server/src/kernel/subscribers/events.ts` (map de email a Thought minimizado); `tests/api.test.ts` y `tests/kernel-coherence.test.ts` (gates focales). El README raíz y documentos de campaña ya tenían cambios documentales del trabajo anterior.
- **Notas sintetizadas:**
  1. Se corrigió el estado histórico del reporte Drive: se comprobó que el endpoint no estaba en `app.ts`; ahora la ruta POST llama `workspace.indexDriveFile` con owner resuelto por middleware y scope tenant. GET de lectura sigue sin indexar. El test de API confirma 401 anónimo, 403 con Origin externo y 409 sin conectar Google; no comprueba indexación completa vía HTTP/provider.
  2. `email.received`/`email.sent` ahora llegan al subscriber ya montado y generan Thought (`observation`/`action`). La proyección contiene event/source/message/thread IDs válidos y excluye remitente y body incluso con schema `.passthrough()`. No se añadieron documentos, `assistant.tool.invoked`, bus receipt/cursor durables ni replay cognitivo.
  3. `agntia-ciberseguridad` tiene dependencia tarball local y bridge. Sus dos tests focales pasaron ejecutados por separado, así como security-context; aun así no hay invocación de producción ni se configuró endpoint/credencial tenant-scoped. No usar llamadas reales ni activar.
  4. Las suites existentes de provision A/B y `tenant-acme-isolation` pasaron. Además se añadió una prueba de provisionamiento local con tres owner user IDs y tres emails distintos, y dos empleados por tenant (3 tenants × 3 actores = 9 identidades provisionadas); pasa en fixture sintético. Esto sí prueba el script/store local, pero no login externo real, autorización HTTP A/B/C, Drive/Gmail aislados ni dogfood de proveedores.
  5. Orden de plan conservado: primer child Cyber antes de ampliar capacidades; las operaciones nativas existentes se prueban en local en paralelo sin iniciar acción de proveedor.
- **Checks exactos y resultados:**
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/kernel-coherence.test.ts`: 9/9 PASS.
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/cognition-v2-cyber-bridge.test.ts`: 5/5 PASS.
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/cognition-v2-security-context.test.ts`: 1/1 PASS.
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/vertical-slice-drive.test.ts`: 4/4 PASS (test local previo; sin provider real).
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/vertical-slice-gmail.test.ts`: 4/4 PASS (fixtures/fetch simulado, no cuenta real).
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/api.test.ts`: 7/7 PASS; incluye ruta index: 401/403/409. Logs reportaron `background_failure` por `PGlite is closed` durante cleanup de un test, después de que todos los asserts pasaron; anotar como ruido real de lifecycle/test y no ocultar.
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/tenant-acme-isolation.test.ts`: 6/6 PASS.
  - `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/vertical-slice-provision.test.ts`: ejecución final 8/8 PASS, incluida la prueba nueva de tres owners; dos intentos preliminares fallaron primero por reglas del bundle (tres membresías/owner requerido) y se corrigió solo el fixture de test, sin cambiar el contrato de producto.
  - `node_modules/.bin/tsc --noEmit --pretty false`: exit 0.
  - `git diff --check`: exit 0.
  - `node_modules/.bin/biome check` (targeted): **falló**; detecta muchos problemas preexistentes de formato/imports/lint en `app.ts`, subscriber y tests. No se aplicó formatter masivo para evitar reformatear archivos grandes fuera de scope. `pnpm` no está instalado en PATH.
  - Primera ejecución conjunta `kernel-coherence + cyber bridge + security-context`: exit 137 tras imprimir dos PASS del bridge; se repitieron después por separado (resultados anteriores). No contar la ejecución conjunta como PASS.
- **Gates pendientes / siguiente paso:** cerrar C00-PS00 con callgraph completo; resolver ruido `PGlite is closed` solo si se reproduce fuera de cleanup; no ampliar mappings sin schemas minimizados; provider real Drive/Gmail, wiring real cyber y login/autorización HTTP de owners A/B/C siguen sin ejecutar; la prueba nueva tampoco crea los tres agentes por tenant.

---

## Entradas siguientes

Añadir una nueva entrada al principio de esta sección para cada sesión/ejecución; conservar las anteriores sin reescribir los resultados históricos. Si una entrada se corrige, añadir una nota de rectificación con fecha y referencia a la entrada original.
