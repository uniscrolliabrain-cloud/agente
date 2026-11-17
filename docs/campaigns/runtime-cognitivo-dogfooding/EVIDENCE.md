# Ledger de ejecución y evidencia

> v1 · 2026-11-16 · Estado: **no ejecutado**

Este archivo se actualiza después de ejecutar un gate en el SHA referido. No anotar PASS por presencia de código, un reporte histórico, diseño, respuesta de API o test no ejecutado. Los resultados históricos citados en `BASELINE.md` son anclajes; no se copian aquí como ejecución de esta campaña. El diario por intento, incluidos inicios parciales y fallos del runner, vive en [BITACORA.md](BITACORA.md); una entrada allí no equivale a cerrar un patchset.

## Estado al 2026-11-17 (RUN-2026-11-17-17)

| Campaña | Patchsets | Estado | Evidencia actual |
|---|---|---|---|
| C00 baseline/reconciliación | PS00 | IN_PROGRESS | Branch/SHA anotados en BITACORA; falta completar matriz de claims/callgraph y cerrar baseline. |
| C01 cyber artesanal | PS01–PS03 | IN_PROGRESS | RUN-2026-11-17-06: bridge/relay/contexto 6/6 en local (grant server-side, tenant cruzado rechazado antes del SDK, commit antes de ACK, ACK perdido recuperado, dedupe tras reinicio, proyección con `securityGuarantee:false`). El servicio child no está cableado ni configurado: el gate operativo sigue BLOCKED. |
| C02 Drive + Gmail + resumen + envío | PS04–PS08 | IN_PROGRESS | RUN-2026-11-17-06: API 7/7 (index 401/403/409), Drive 4/4 (read≠index, reindex, revoke A/B, fallo y reintento), Gmail+conexión Google 9/9 (hilo/cuenta, inyección no redirige, recibo, otra empresa 403, revoke mid-callback), aprobación+memoria 10/10 (doble aprobación única, timeout unknown, rotación, privada por actor). Todo con fixtures/fetch simulado; no hay provider real ni resumen versionado implantado. |
| C03 bus/kernel/policy/grafo | PS09–PS11 | IN_PROGRESS | PS09: mapping email minimizado; RUN-2026-11-17-02 corrige partición/dedupe LRU del EventBus (event-bus 3/3). RUN-2026-11-17-03 corrige unwrapping SQL `{data}` de KernelThoughtIndex; RUN-2026-11-17-04 corrige el mismo contrato en KernelTurnIndex; kernel-coherence 12/12 y typecheck OK. RUN-2026-11-17-06 añade PS10 local: policy/allowlist 25/25, JWT/permisos/tenant 20/20 (suspensión y revocación en caliente), bus 5/5 y transacciones 1/1. RUN-2026-11-17-08 añade PS11 local: grafo/estado 16/16 (provenance, self-reference, borrado en cascada, state machine con roleId); kernel/memoria 15/15; recibos durables 7/7 (501 eventos replay, crash revierte efectos, ACK unknown reconciliado). RUN-2026-11-17-09 corrige `createRelation` (tipo declarado, extremos y cardinalidad one-to-one/one-to-many en transacción) y valida campos/estado del patch en `updateEntity`; compatibilidad de versión de schema y tipo de campo desconocido fail-closed; business-graph 17/17 + relacionados 12/12. Subscriber de kernel sigue best-effort; constraint único de cardinalidad en DB, cross-container, Postgres y replay multi-proceso abiertos. |
| C04 tres owners | PS12–PS13 | IN_PROGRESS | RUN-2026-11-17-01: provision 8/8 y `tenant-http-e2e` 7/7, tareas/archivos A/B/C aislados. RUN-2026-11-17-02: EventBus particionado por tenant con owner compartido y dedupe independiente. RUN-2026-11-17-03: thought index aislado A/B. RUN-2026-11-17-04: turn index `recent/byOwner/byTrigger` aislado con mismos owner/turnId (kernel-coherence 12/12). RUN-2026-11-17-05 cubre RAG registry/chunks/search/removal con IDs owner/source/connection colisionados A/B y embeddings simulados; todo local/PGlite y auth sintético. RUN-2026-11-17-06: worker claim 4/4 (segunda empresa, 50 workers un ganador, identidad tras reabrir), workers cognitivos 2 PASS + 1 SKIP por Postgres ausente, cache/worker 8/8, aislamiento 50 tenants 3/3, API 7/7. RUN-2026-11-17-09 añade cardinalidades de grafo aisladas por owner. RUN-2026-11-17-10 añade 9 identidades (3 empresas × owner+2 empleados) con membership/rol por empresa, 403 cross-tenant y suspensión HTTP. RUN-2026-11-17-11 corrige el worker para no reclamar tareas de una empresa suspendida (fail-closed, tarea queda en cola y se reanuda), con regresiones 9/9 y 8/8. RUN-2026-11-17-16 añade el corte mid-flight: el guard previo a cada tool/evento revalida la suspensión de la empresa y el agente asignado, la tarea vuelve a `queued` sin error ni gasto de intentos y se reanuda al levantar la suspensión (2/2, regresiones de worker 21/21). Replay durable del subscriber, Postgres/RLS y provider Drive/mail/jobs externos siguen abiertos. |
| C05 empleados/agentes | PS14–PS15 | IN_PROGRESS | RUN-2026-11-17-10 (local, PASS_LOCAL parcial): 3 empresas × (owner + admin + member) con user ID/email distintos, membership y rol durable; cada identidad solo entra en su empresa (403 ajeno); member no aprueba, admin aprueba sin administrar, owner administra; memoria privada aislada por actor; 3 agentes por empresa con IDs colisionados, disable 409, SOP ausente 422, role ajeno 422, provenance `assignedTo`≠`assignedBy`; governance deniega tool no concedida. RUN-2026-11-17-12 cablea la matriz a `POST /api/actions/:id/decide`: aprobar exige `actions.approve` con membership fresca (member 403 `PERMISSION_DENIED` sin efecto, propuesta `awaiting_review`; admin/owner aprueban), denegar sigue libre, se aplica por empresa y la cuenta legacy sin rol conserva su comportamiento (5/5, regresiones 46/46). RUN-2026-11-17-13 revalida el agente asignado en cada tick: deshabilitado tras encolar queda `queued` sin intento y se reanuda al rehabilitarlo con la misma identidad; asignada al owner o con rol borrado conserva curso (1/1, regresiones de worker 32/32). RUN-2026-11-17-14 rechaza al encolar con 409 cualquier `roleId` existente e inactivo, no solo el SOP tipado (c05-employees-agents 9/9, regresiones 31/31). RUN-2026-11-17-15 abre la propuesta a la empresa: `GET /api/actions/pending` devuelve la revisión mínima del tenant y `decide` resuelve y aprueba la propuesta de otro actor usando la revisión/conexión del autor, con `approvedBy` real del aprobador (4/4, regresiones 63/63); B no la ve ni la aprueba (404 sin efecto) y denegar sigue siendo del autor. RUN-2026-11-17-16 corta también la tarea en vuelo al deshabilitar el rol (2/2). RUN-2026-11-17-17 cierra el hueco de revocación: el camino legacy solo aplica en una empresa sin memberships durables, así que revocar corta aprobación y bandeja en la petición siguiente (2/2, regresiones 64/64). Límites: auth de sesión local (no IdP), agentes por owner dentro del tenant (no compartidos por empresa), records de negocio owner-scoped, abort de una tool ya enviada al proveedor y sin chat/worker real ni proveedores. |
| C06 contenedores/ontology/gestoría | PS16–PS19 | NOT_STARTED | No se migró schema ni se instaló `agntia-gestoria`. |
| C07 rebuild/cierre | PS20–PS21 | NOT_STARTED | No hubo crash/replay dogfood ni decisión de expansión. RUN-2026-11-17-11 añade una precondición local: el worker respeta la suspensión de empresa antes de reclamar trabajo; no cubre abort en vuelo ni rebuild. |

## Plantilla por patchset

Copiar una fila por cada PS que se ejecute:

| Campo | Valor |
|---|---|
| Campaign / wave / patchset | `Cxx / wave x / PSxx` |
| Estado | `NOT_STARTED / IN_PROGRESS / PASS_LOCAL / PASS_POSTGRES / PASS_PROVIDER_CONTROLLED / PASS_DOGFOOD / BLOCKED / FAIL` |
| SHA base / branch | |
| SHA probado | |
| Diff allowlist / archivos | |
| Hunk(s) realizados | |
| Fix(es) / bug reproducido | |
| Comando(s) exacto(s) y exit status | |
| Test/suite y resultado | |
| Tenant/actor/capability y fixtures | No incluir bodies, PII o secretos |
| Fallos, skipped/TODO y heredados | No ocultar; separar por origen |
| Proveedor/DB real o simulado | Identificar explícitamente |
| Efectos externos y receipt IDs | Solo IDs no sensibles; indicar ninguno si solo fixtures |
| Recuperación/retry/revocation probada | |
| Límites no verificados | |
| Rollback / punto seguro | |
| Reviewer/aceptación humana requerida | |
| Fecha UTC | |

## Plantilla por prueba A/B/C

| Prueba | Tenant A | Tenant B | Tenant C | Resultado esperado | Resultado medido / SHA |
|---|---|---|---|---|---|
| Owner identity/email distinct | | | | tres principal/user IDs distintos | |
| Mismo resource ID en cada tenant | | | | cada owner ve solo su recurso | |
| Foreign resource read/write | | | | deny; no efecto ni filtración | |
| OAuth connection/account/generation | | | | conexión aislada y revalidada | |
| Drive sources/RAG/citations | | | | revisiones/chunks por tenant | |
| Gmail inbox/thread/draft/send receipt | | | | tenant/hilo/cuenta exactos | |
| Event replay → Thought/graph | | | | fuente/tenant correctos, sin duplicado | |
| Async worker after restart | | | | principal/scope preservados | |
| Revocation/suspension mid-flight | | | | próxima acción deny/abort | |
| Child cyber grant/outbox | | | | tenant+hash+ACK aislados | |
| Gestoría company/expediente | | | | scope de empresa; preview only | |

## Reglas de interpretación

- `PASS_LOCAL` describe un test local en el SHA indicado; no implica Postgres, provider ni dogfood.
- `PASS_POSTGRES` indica ejecución de DB real con configuración/rol nombrado, datos sintéticos y controles del tenant. No implica identidad/provider real.
- `PASS_PROVIDER_CONTROLLED` indica que un proveedor real fue usado con autorización y límites controlados; registrar receipt mínimo, no payload sensible.
- `PASS_DOGFOOD` indica una operación real de una de las empresas propias con identity diferenciada; no equivale a revisión independiente ni GO comercial.
- `BLOCKED` declara el requisito externo ausente, sin degradar a PASS de fixture.
- Una suite se reporta con totales, exits, skipped/TODO y commit exacto. El test anterior no cubre modificaciones posteriores.
