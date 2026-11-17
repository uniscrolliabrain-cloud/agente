# Anexo — Matriz de trazabilidad de 200 conceptos

> v1 · 2026-11-16 · Estado: **trazabilidad documental propuesta; no ejecutada ni revalidada en el SHA actual**

Esta matriz desglosa los 200 conceptos sintetizados en la conversación. No son 200 funcionalidades garantizadas ni 200 cambios independientes. La columna de código refleja el inventario de `BASELINE.md`, hecho en la inspección anterior y **pendiente de revalidación contra el SHA en que se ejecute cada patchset**.

## Leyenda

- **E — existente (según inspección previa):** hay símbolo, contrato, código o prueba descritos en `BASELINE.md`; no significa que se haya reejecutado ahora ni que el flujo esté completo.
- **P — parcial:** existe parte del recorrido, pero la evidencia registra un hueco de wiring, enforcement, durability o cobertura.
- **D — decisión/objetivo:** principio acordado o comportamiento deseado; no se presenta como implementación.
- **U — no auditado / evidencia insuficiente:** particularmente repositorios child fuera de los dos que se revisaron.
- **Plan:** PSnn remite al patchset completo de [PLAN.md](PLAN.md), donde están hunks, fixes, paths indicativos y gates. “No tocar” significa que el concepto se conserva como decisión/límite, no que se proponga código.

## A. Dirección y método de construcción (001–020)

| # | Concepto | Actual / referencia del baseline | Cambio / patchset | Qué falta / gate |
|---:|---|---|---|---|
| 001 | Integrar cada módulo artesanalmente | D — [README](README.md), límites y orden | C01-PS01/02; C06-PS19 | Fijar versión y operar un child por vez; sin instalador universal. |
| 002 | Ciberseguridad como primer child | E/P — BASELINE §2, “Primer child”; puente existe, wiring prod no encontrado | C01-PS01–03 | Probar un recorrido read-only desde bootstrap; gate C01. |
| 003 | Gestoría como segundo child | E — BASELINE §2, “Segundo child”; repo/SDK consultados, integración no hecha | C06-PS19 | Fijar main/SDK actual e instalar una sola preview/lectura tras C05. |
| 004 | Aprender y ajustar kernel por dogfood | D — objetivo; ciclos existen en BASELINE §2, kernel | C07-PS21, C06-PS18 | Registrar fallos observados y decisiones humanas antes de abstraer. |
| 005 | Primitivas pocas y axiomáticas | D — no existe axioma final declarado | C06-PS18 | Aceptar axiomas solo tras consumidores independientes y contraejemplos. |
| 006 | Kernel agnóstico a semántica de negocio | P — hay BusinessSchema/ontology y ciclo cognitivo, no compilador completo (BASELINE §2 ontology/kernel) | C03-PS11; C06-PS17/18 | Validar schema/relaciones específicos sin trasladar dominio child al kernel. |
| 007 | Child dueño de semántica especializada | D — frontera definida en BASELINE §3 | C01-PS01–03; C06-PS19 | Contrato real de cada SDK/child, comenzando cyber y luego Gestoría. |
| 008 | Padre dueño de gobierno común | E/P — TenantPrincipal, authz, ActionService existen (BASELINE §2 tenant/capabilities) | C01-PS02; C03-PS10; C04-PS13 | Identificar enforcement real por callsite; gate de deny-before-effect. |
| 009 | Vertical slices completos | D — método de campaña | C00-PS00 y todos los gates | Cerrar cada slice desde principal hasta receipt, no solo endpoint. |
| 010 | Recorrido cubre identidad→evidencia | P — componentes existen separados (BASELINE §2) | C01-PS03; C02-PS04–08 | Demostrar end-to-end y recovery en el SHA candidato. |
| 011 | Generalizar invariantes repetidas | D — regla anti-overbuild | C06-PS18 | Dos consumidores reales y evidencia de invariancia antes de mover código. |
| 012 | No framework universal de plugins prematuro | D — exclusión explícita | C06-PS18; C07-PS21 | Mantener fuera salvo decisión posterior informada por dogfood. |
| 013 | Partir del código presente | D — método | C00-PS00 | Baseline con SHA/callgraph/símbolos actuales antes de cada PS. |
| 014 | Separar presente, wiring y ejecución | P — distinción documentada, no ledger por callsite aún | C00-PS00; [EVIDENCE](EVIDENCE.md) | Completar matriz implemented/wired/durable/tenant-tested/external-tested. |
| 015 | Fases con gates de cierre | E — estructura documental de esta campaña | C00–C07 | Ningún gate marcado PASS antes de ejecutar y registrar evidencia. |
| 016 | Fases organizadas en olas/dependencias | E — PLAN §1–8 | C00–C07 | Respetar prerequisitos y orden tras aclarar el orden de README. |
| 017 | Hunk pequeño y revisable | D — método explícito en README | Cada PS, un diff allowlisted | Dividir cualquier cambio que exceda el gate de un patchset. |
| 018 | Fix deriva de fallo/hueco reproducible | D — principio de ejecución | C00-PS00 y PS focal correspondiente | Reproducir contra HEAD; no “arreglar” hipótesis de reportes viejos. |
| 019 | Patchset con scope, verificación y rollback | E — campos en PLAN/EVIDENCE | Cada PS; EVIDENCE plantilla | Rellenar ledger real, comandos, SHA, rollback y resultados. |
| 020 | Documento no equivale a implementación | E — estado de campaña ya explicitado | Ningún patchset de producto | Mantener `NOT_STARTED` hasta que haya diff/test/evidencia. |

## B. Kernel, autoridad y determinismo (021–040)

| # | Concepto | Actual / referencia del baseline | Cambio / patchset | Qué falta / gate |
|---:|---|---|---|---|
| 021 | Kernel retiene autoridad del ciclo cognitivo | E — `kernel.ts`, ciclos y subscribers; BASELINE §2 kernel | C03-PS09/10 | Confirmar puntos de entrada y que proyección no otorgue permiso. |
| 022 | Fast no obtiene autoridad por rapidez | D — regla de gobierno; modelo Fast existente descrito | C03-PS10 | Test que Fast no elude capability/policy/action path. |
| 023 | Slow puede actuar solo por ruta gobernada | P — arquitectura descrita, enforcement por tool a verificar | C03-PS10 | Enumerar tool executors; deny en efecto si principal/policy no vigente. |
| 024 | Ciclo cognitivo no es decisor empresarial completo | E/D — ciclos estructurales, no policy de negocio (BASELINE §2 kernel) | C03-PS11 | Preservar separación con BusinessGraph/schema y reglas de negocio. |
| 025 | JEV permanece inactivo | E — C08 `LIVE_DISABLED` (BASELINE §2 JEV) | Sin cambio; gate global 9 | No activar; verificar estado original al abrir campaña. |
| 026 | LLM puede buscar/resumir/redactar | E — herramientas en `engine/conversation.ts` (BASELINE §2 Drive/Gmail) | C02-PS05–08 | Asegurar fuentes/refs y que salida permanezca interpretación/propuesta. |
| 027 | Servidor determina identidad, tenant y permiso | E/P — TenantPrincipal y authz existen, uso de handlers incompleto (BASELINE §2 tenancy/capabilities) | C03-PS10; C04-PS12 | Fresh principal/policy comprobados en cada efecto real. |
| 028 | Capabilities describen acciones nominadas | E — CapabilityRegistry/bootstrap/Runner (BASELINE §2 capabilities) | C02-PS04; C03-PS10 | Mapear IDs/versiones/riesgo/side effect para todas las rutas elegidas. |
| 029 | Authz en límite del efecto | P — Runner y rutas tienen checks particulares, cobertura incompleta | C03-PS10; C05-PS14/15 | Prueba de denegación sin efecto en cada executor/handler seleccionado. |
| 030 | Decisión policy y operación dejan trazabilidad | P — ActionService eventos; logs/projections no uniformes | C02-PS04/08; C03-PS09/10 | Enlazar policy revision/actor/operation/receipt minimizado. |
| 031 | Policy enforcement no es uniforme | P — superficie ABAC/PDP/roles/Runners descrita en BASELINE §2 | C00-PS00; C03-PS10 | Mapa de consumers real; corregir solo brechas reproducidas. |
| 032 | Matriz no prueba enforcement por handler | P — `tenantAccess` definido, callsites generalizados no encontrados | C00-PS00; C03-PS10; C05-PS14 | Buscar callsites en SHA base; pruebas HTTP sobre rutas concretas. |
| 033 | Proponer, aprobar y ejecutar son distintos | E — ActionService states propose/decide/run (BASELINE §2 Gmail) | C02-PS08 | Confirmar UI/route y CAS/version del borrador durante aprobación. |
| 034 | `outcome_unknown` se concilia, no reintenta | E/P — estado/resultado desconocido en ActionService; rutas deben comprobarse | C02-PS08; C07-PS20 | Provider timeout/restart test sin segundo efecto; receipt reconciliation. |
| 035 | Evento no concede permiso | D — principio explícito BASELINE §3 | C03-PS09/10 | Rechazar consumers que deriven grant/approval desde evento solamente. |
| 036 | Thought no sustituye aprobación | E/D — Thought model existente; separación de autoridad en §3 | C02-PS07/08; C03-PS09 | Verificar cada proyección: no cambia estado de acción/entidad. |
| 037 | Grafo no concede autoridad | D — separación de capas BASELINE §3 | C03-PS11; C06-PS17 | Validar permiso antes de mutar BusinessGraph; gate de denegación. |
| 038 | Child no resuelve principal/policy del padre | D — frontera acordada | C01-PS02/03; C06-PS19 | Identidad deriva de padre y grants; child solo recibe scope mínimo. |
| 039 | Sin puerta genérica del LLM a shell/HTTP/secretos | D — límite de diseño | C01-PS01; C03-PS10 | Revisar schemas/tool registry; gate que argumentos no controlen endpoint/secret. |
| 040 | Dogfood/local test no es certificación | E — niveles ya distinguidos en EVIDENCE | Todos; gate global | Informes mantienen etiqueta de nivel y limitaciones. |

## C. Owners, tenants y aislamiento (041–060)

| # | Concepto | Actual / referencia del baseline | Cambio / patchset | Qué falta / gate |
|---:|---|---|---|---|
| 041 | Tres empresas para dogfood | D — escenario objetivo; no provisionado | C04-PS12/13 | Crear tenants A/B/C en fixture y luego entorno autorizado. |
| 042 | Owner distinto por empresa | E — RUN-2026-11-17-01 crea tres `userId` sintéticos únicos y autentica fixtures por `/api/auth/login`; cada principal limitado a su tenant en matriz de tareas | C04-PS12 | Falta identidad/IdP externo; matriz HTTP se limita a tareas y body tenant spoof, no todas las superficies C04-PS13. |
| 043 | Identidad distinta por owner | E — tres sesiones locales de test creadas por login para user IDs distintos RUN-2026-11-17-01 | C04-PS12 | Issuer/IdP externo y sesiones de cuentas reales no probados. |
| 044 | Correo distinto por owner | E — tres emails sintéticos distintos, cada uno usado al crear su user y login local RUN-2026-11-17-01 | C04-PS12 | Verificación de control del correo/claim por identidad externa no probada. |
| 045 | Una persona física puede controlar los tres owners | D — decisión de dogfood | C04-PS12; EVIDENCE A/B/C | Declarar que prueba separación de cuentas, no independencia humana. |
| 046 | Tres identities no simulan tres operadores independientes | D — limitación explícita | C07-PS21 | Reportar límite; aceptación externa queda fuera. |
| 047 | Tenant no viene del prompt | E/P — TenantPrincipal concilia principal/tenant; callers a comprobar | C03-PS10; C04-PS13 | Tamper tenant en body/tool/path y exigir deny sin side effect. |
| 048 | Membership vigente es parte de authz | E — TenantService/fresh `findMembership` (BASELINE §2 tenancy) | C03-PS10; C04-PS13 | Revocación durante tarea y llamada siguiente. |
| 049 | Revocación vence caches de acceso | P — RUN-2026-11-17-06: `tenant-cache` 3/3 (invalidación inmediata) y revocación de membership corta switch-tenant/refresco OAuth en caliente | C04-PS13/14 | RUN-2026-11-17-17 añade el corte de aprobación/bandeja al revocar en una empresa con matriz (RUN-12 dejaba el fallback legacy). Falta revocación durante una tool ya enviada y tras reinicio de worker con tráfico real. |
| 050 | Suspensión bloquea tenant aun con token válido | E — RUN-2026-11-17-06 suspende tenant-a por admin, `/api/agent` responde 403 y se recupera al reanudar; RUN-2026-11-17-11 añade el worker: no reclama tareas de la empresa suspendida y las reanuda al levantarla, con lectura fallida tratada como suspendida | C04-PS13; C07-PS20 | RUN-2026-11-17-16 corta la tarea ya `running` en el guard siguiente (vuelve a `queued` sin gastar intentos y se reanuda al levantar). Falta el barrido ruta por ruta de cada efecto y el abort de una llamada ya enviada al proveedor. |
| 051 | Cruces A/B/C en ambas direcciones | D — matriz planificada | C04-PS13 | Ejecutar nueve direcciones y guardar resultados por SHA. |
| 052 | IDs repetidos prueban colisiones cross-tenant | D — test pendiente | C04-PS13 | Mismo file/thread/action/job ID con aislamiento esperado. |
| 053 | TenantScopedStore ofrece frontera de storage | E — `db-tenant.ts` y stores descritos en BASELINE §2 | C00-PS00; C04-PS13 | Auditar stores crudos, scanByPrefix, claves y transacciones. |
| 054 | RLS no se presume globalmente aplicado | P — setup condicional en `db-rls.ts` | C04-PS13; gate global 2 | Postgres con role restringido y acceso scoped probado. |
| 055 | Conexión Google ligada a tenant/ciclo | E — RUN-2026-11-17-06: conexiones A/B distintas con tenant/cuenta/scopes, revocación durante callback y refresco no escribe credencial, tenant ajeno no responde el hilo; rotación entre revisar y aprobar bloquea el envío | C02-PS05/08; C04-PS13 | Todo con OAuth/Google simulado; sin cuenta real ni rotación contra proveedor. |
| 056 | Fuentes RAG aisladas y revision-bound | E — Drive source/revision/citations descritos en BASELINE §2; RUN-2026-11-17-01 confirma archivos/bytes A/B/C; RUN-2026-11-17-05 prueba RAG local A/B con owner/source/connection ID iguales y removal aislado | C02-PS05; C04-PS13 | PGlite + embeddings simulados; no prueba SQL/RLS, account/provider Drive, citations HTTP ni revoke real. |
| 057 | Worker restaura tenant original | E — RUN-2026-11-17-06: tras reabrir el Store, un worker nuevo reclama `queued` y `running` con tenant/actor persistidos; 50 workers compiten y solo uno gana | C04-PS13; C05-PS15 | PGlite en proceso; falta worker multi-proceso/Postgres y replay de tareas ejecutadas a medias. |
| 058 | Replay conserva tenant/owner/origen | E/P — RUN-2026-11-17-02 valida EventBus emit A/B con owner múltiple; RUN-2026-11-17-04 valida lectura reciente del índice de turnos por tenant; consumidores durables parciales | C03-PS09; C07-PS20 | Rebuild/duplicado/tenant mismatch en worker/suscriptor sigue pendiente. |
| 059 | Thoughts, memoria, receipts y relaciones se aíslan | P — RUN-2026-11-17-03 verifica thought-index A/B con mismos owner/thoughtId/turnId y corrige deserialización SQL; no cubre receipts, memoria ni relaciones. El subscriber sigue sin replay durable | C04-PS13; C06-PS16 | Matriz por cada objeto y mismo ID cruzado; persistencia/recuperación y autorización por owner requieren gates separados. |
| 060 | Matriz incluye writes, revoke, reinicio, async | D — alcance de pruebas | C04-PS13; C07-PS20 | Registrar cada dimensión; no aprobar solo con lecturas propias. |

## D. Empleados, actores y agentes (061–080)

| # | Concepto | Actual / referencia del baseline | Cambio / patchset | Qué falta / gate |
|---:|---|---|---|---|
| 061 | Owner, empleado y agente son roles distintos | E — RUN-2026-11-17-10: 3 owners + admin/member por empresa con membership/rol durable; agentes en `agent-roles` por owner dentro del tenant | C05-PS14/15 | Records de negocio siguen owner-scoped; falta compartir por empresa (C06-PS16). |
| 062 | Empleado entra como actor autenticado | E — RUN-2026-11-17-10: seis empleados con login de sesión local, membership y `x-tenant-id` propio; ajeno 403 | C05-PS14 | Auth de sesión sintética, no IdP externo; falta revocación de membership con petición siguiente sobre cada ruta. |
| 063 | Agente tiene ID estable tenant-bound | E — RUN-2026-11-17-10: tres IDs iguales en A/B/C resueltos por owner+tenant; un ID ausente bajo el owner devuelve 422 | C05-PS15 | Agentes no se comparten entre empleados de la misma empresa; falta worker/chat real. |
| 064 | Rol de agente explícito | P — gobernanza/runtime existe; grants efectivos no probados aquí | C05-PS15 | Roles/versiones y capabilities autorizadas resueltas en servidor. |
| 065 | Tenant role distinto de platform role | E — RUN-2026-11-17-10 evalúa la matriz sobre `findMembership` fresco: admin aprueba pero no `tenant.admin`; member no aprueba; usuarios son platform role `user`. RUN-2026-11-17-12 la aplica en la ruta HTTP de aprobación | C05-PS14 | RUN-2026-11-17-15 acredita la aprobación cross-actor y la bandeja por empresa sin cruzar tenants. Falta IdP externo y agentes compartidos por empresa. |
| 066 | Capabilities por instalación/agente | P — registry tenant-scoped conectado a catálogo global/version 1 | C03-PS10; C05-PS15 | Resolver tenant+agent y test de tool no concedida. |
| 067 | Planner no invoca tools fuera de autorización | P — orchestrator consume catálogo global según BASELINE §2 | C03-PS10; C05-PS15 | Filtrado de tools y guardia de executor; deny test. |
| 068 | Agente deshabilitado no inicia trabajo | E — RUN-2026-11-17-10: `marcos` deshabilitado en C bloquea la creación de tarea con 409; sin SOP 422; habilitado en A crea la tarea. RUN-2026-11-17-13: el worker revalida el rol en cada tick, así que deshabilitarlo después de encolar deja la tarea `queued` sin intento y rehabilitarlo la reanuda. RUN-2026-11-17-14: encolar con un `roleId` existente e inactivo se rechaza con 409 en cualquier tipo de tarea | C05-PS15 | RUN-2026-11-17-16: deshabilitar sí corta una tarea ya `running` en el guard siguiente. Siguen sin revalidarse `sops`/`allowedTools` al encolar ni en el tick. |
| 069 | Actor solicitante != agente ejecutor | E — RUN-2026-11-17-10: la tarea persiste `assignedBy` (user A) distinto de `assignedTo` (`marcos`) y `tenantId` | C05-PS15 | Falta receipt/event/Thought de ejecución real, no solo la tarea encolada. |
| 070 | Provenance refleja quién pensó/ejecutó | E/P — Thought provenance existe; productores por operación incompletos | C02-PS04; C03-PS09; C05-PS15 | Validar chain actor→agent→capability→receipt. |
| 071 | Tarea restaura identity después de restart | P — tenant scopes en worker existen y RUN-2026-11-17-13 confirma que la reanudación tras rehabilitar el rol conserva `assignedTo`/`assignedBy`/tenant | C04-PS13; C05-PS15 | Crash/restart real con identidad persistida y sin identidad del payload sigue pendiente. |
| 072 | Revocar actor afecta trabajo posterior | E/P — membership revoke existe; integración por workers pendiente | C04-PS13; C05-PS14/15 | Revocación durante tarea y deny antes de efecto posterior. |
| 073 | Private memory ligado al actor | E — RUN-2026-11-17-10: recuerdo privado del admin de A no lo leen el member de A ni el owner de B | C05-PS14; C04-PS13 | Memoria compartida por empresa no reacreditada end-to-end en esta prueba. |
| 074 | Dato compartido distinto de dato privado | E/P — contratos de hechos/memoria existen; enforcement end-to-end no acreditado | C05-PS14; C06-PS16 | Probar visibilidad explícita de ambos scopes. |
| 075 | Aprobar exige permiso en ruta real | E — RUN-2026-11-17-12: `/api/actions/:id/decide` relee `findMembership` y exige `actions.approve` con `tenantAccess`; member recibe 403 sin efecto, admin/owner aprueban, denegar sigue libre y la cuenta legacy sin rol conserva compatibilidad (5/5 + 46/46 regresiones) | C02-PS08; C05-PS14 | RUN-2026-11-17-15 acredita la aprobación cross-actor y la bandeja mínima por empresa; RUN-2026-11-17-17 acredita que revocar el rol corta la aprobación ya visible también en modo `session`. Sigue abierta la doble firma por actores distintos vía HTTP. |
| 076 | Token owner del child no se comparte | D — límite de seguridad | C01-PS01/02; C06-PS19 | Secret server-side, no aparece en prompt/log/client/agent. |
| 077 | ID enviado por agente no prueba privilegio | D — norma de autoridad | C03-PS10; C05-PS15 | Alterar `agentId/role/capability` en entrada; server re-resuelve. |
| 078 | Email no sustituye ID autenticado | D — límite de identidad | C04-PS12 | Validación por subject/issuer y membership, no trust en email body. |
| 079 | Provisionamiento idempotente | E — scripts reanudables en BASELINE §2; `vertical-slice-provision.test.ts` ya pasa A/B; RUN-2026-11-17-10 crea 9 identidades y 3 roles por empresa en fixture local | C04-PS12; C05-PS14/15 | No se re-ejecutó el apply del instalador para esos cardinales; el fixture no es dogfood. |
| 080 | Probar permisos intra y aislamiento intertenant | D — alcance dogfood | C04-PS13; C05-PS14/15 | Negative matrix owner/employee/agent completa. |

## E. Google Drive y documentos (081–100)

| # | Concepto | Actual / referencia del baseline | Cambio / patchset | Qué falta / gate |
|---:|---|---|---|---|
| 081 | Buscar Drive es capability de lectura | E — `WorkspaceService.driveFiles` (BASELINE §2 Drive) | C02-PS05 | Envelope/source refs y policy decision comprobados. |
| 082 | Leer documento es operación distinta y acotada | E/P — `readDriveFile` existe | C02-PS05 | Revisar size limits, permission, receipt y misma conexión. |
| 083 | Leer no indexa automáticamente | E — comportamiento esperado descrito | C02-PS05 | Test que read no crea/actualiza source index. |
| 084 | Indexación explícita | E — `indexDriveFile` existe | C02-PS05 | Verificar selector/ruta operativa disponible en HEAD. |
| 085 | Fuente guarda conexión/revisión/estado | E — source records descritos | C02-PS05 | Confirmar todos los estados y su persistencia/replay. |
| 086 | Reindex sustituye chunks obsoletos | E/P — report 12 evidencia histórica de reingesta | C02-PS05 | Reejecutar en SHA candidato, incluyendo fallo a mitad del replace. |
| 087 | Documentos cortos indexables | E — report 12 test histórico | C02-PS05 | Revalidar test focal con fixtures actuales. |
| 088 | Fallo de ingestión visible | E/P — intentos/fallos almacenados según baseline | C02-PS05 | Asegurar evento/status y que error no se traga. |
| 089 | Revoke retira fuentes/citas obsoletas | E — `reconcileDriveSources` existe | C02-PS05; C04-PS13 | Prueba refresh/revoke y no serving desde cache anterior. |
| 090 | Forget retira registro y chunks | E/P — report 12 cita forget/revoke | C02-PS05 | Comprobar al HEAD actual qué mecanismo hace forget y recovery. |
| 091 | Cita ligada a revisión verificable | E — RAG citations descritas | C02-PS05/07 | Gate de hash/revision y source visibility vigentes. |
| 092 | RAG filtra tenant/conexión/estado | P — RUN-2026-11-17-05 verifica localmente chunks/registry/search/remove A/B con mismos owner/source/connectionId | C02-PS05; C04-PS13 | Falta HTTP/provider/connection-resolution real, Postgres/RLS, cross-tenant citations y revocación con operación en vuelo. |
| 093 | Documento no confiable para permisos | D — regla de prompt injection | C02-PS05/07 | Red-team de contenido no cambia destinatario/policy/tool scope. |
| 094 | Evento referencia documento, no cuerpo | P — publisher declara eventos, conexión real por verificar | C02-PS05; C03-PS09 | Schema minimizado; inspección de payload y logs. |
| 095 | Receipt de read distinto de index | P — envelope común aún propuesto | C02-PS04/05 | IDs/tipos/outcomes distinguibles y replay-safe. |
| 096 | Publisher declarado no prueba producer conectado | P — publisher Drive declarado en baseline | C00-PS00; C02-PS05 | Seguir callgraph desde operación nativa a bus. |
| 097 | Consumer decide mapping de Drive a Thoughts | P — sigue sin mapping de eventos Drive según inspección RUN-2026-11-16-02 | C02-PS05; C03-PS09 | Añadir solo después de acordar producer/schema minimizados; no proyectar contenido de documento. |
| 098 | Método index no prueba trigger HTTP | E/P — route añadida en RUN-2026-11-16-02; smoke real de indexación por HTTP no ejecutado | C02-PS05 | Probar indexación con fixture autorizado/Google simulado y después proveedor controlado; gate real externo sigue abierto. |
| 099 | IDs de archivo se prueban cross-tenant | P — RUN-2026-11-17-05 usa el mismo sourceId local en tenants A/B y confirma búsqueda/removal aislados | C04-PS13 | Falta mismo ID de archivo/provider a través de rutas Drive reales o controladas y completar tenant C. |
| 100 | Revoke invalida derivados preservando historia | P — reconcile existe; derived invalidation end-to-end falta | C02-PS05/07; C07-PS20 | Marcar stale/revoked, no servir, conservar audit trail. |

## F. Gmail, inbox, resumen y correo saliente (101–120)

| # | Concepto | Actual / referencia del baseline | Cambio / patchset | Qué falta / gate |
|---:|---|---|---|---|
| 101 | Inbox search autorizado y acotado | E — `search_mail` existente en BASELINE §2 Gmail | C02-PS06 | Selección de cuenta/window/límite server-side y receipt. |
| 102 | Lectura de hilo desde selección verificable | E — `read_mail_thread` existe | C02-PS06 | Probar origen/thread/participantes y tenant binding. |
| 103 | Mensaje y adjunto son no confiables | D — norma de contenido | C02-PS06/07 | Prompt injection no altera capability/recipients/policy. |
| 104 | Resumen es interpretación | D/E — requisito, cycle/Thought existente | C02-PS07; C03-PS09 | Nunca promover salida LLM a hecho verificado automáticamente. |
| 105 | Resumen referencia mensajes/revisiones | P — references hoy no demostradas como receipt completo | C02-PS07 | Resolver cada afirmación a source IDs/revisions. |
| 106 | Registrar model/prompt/in refs | D/P — receipt propuesto, no status existente confirmado | C02-PS07 | Persistir metadata/version/hash sin cuerpos sensibles. |
| 107 | Fuente cambiada invalida resumen anterior | D — regla de versionado | C02-PS07; C07-PS20 | Marcar derived stale y evitar contexto antiguo. |
| 108 | Regenerar crea nueva versión | D — requisito | C02-PS07 | Version id/output hash/source set distintos en cada run. |
| 109 | Preparar respuesta no envía | E — `prepare_email` y ActionService separados | C02-PS08 | Test de draft path sin provider call. |
| 110 | Respuesta ligada a hilo/mensaje origen | E — validaciones de reply existentes (BASELINE §2 Gmail) | C02-PS08 | Revalidar account, message, thread y participantes en executor. |
| 111 | Destinatarios validados | E/P — participante checks descritos; approval actor scope aparte | C02-PS08 | Destinatarios no confiables/reply-all alterado son rechazados. |
| 112 | Subject/thread se derivan del origen | E — contrato de respuesta descrito | C02-PS08 | Test reply mantiene hilo; new mail tiene flujo separado. |
| 113 | Connection/account/generation vigente | E — `WorkspaceService.execute` checks (BASELINE §2 Gmail) | C02-PS08; C04-PS13 | Prueba credencial rotada/revoked y cuenta cross-tenant. |
| 114 | Approval ligado al hash de borrador | E — RUN-2026-11-17-06: hash obsoleto y owner incorrecto no aprueban; acción revisada queda atada a su versión | C02-PS08 | Falta prueba contra proveedor real y cambio de borrador concurrente con envío. |
| 115 | Doble aprobación causa un envío máximo | E — RUN-2026-11-17-06: aprobación concurrente consume la propuesta una sola vez y el despacho programado se reserva una vez | C02-PS08 | Sin provider real; falta callback/latencia de red real y reconciliación de recibo. |
| 116 | Envío pasa por ActionService | E/P — preparación usa Service; Gmail workspace command distinto | C00-PS00; C02-PS08 | Trazar el camino efectivo; consolidar puerta sin duplicar workflows. |
| 117 | Receipt mínimo conserva message/thread IDs | E — `messageReceipt` descrito | C02-PS08 | Provider-controlled smoke; no almacenar body completo. |
| 118 | Timeout Gmail puede ser unknown | E — RUN-2026-11-17-06: timeout ambiguo conserva incertidumbre y no habilita reenvío automático | C02-PS08; C07-PS20 | Simulación local; falta timeout real post-acceptance y reconciliación con proveedor. |
| 119 | New mail distinto de reply | D/P — distinción requerida | C02-PS08 | Contratos/rutas y tests separados antes de habilitar create. |
| 120 | Gmail events internos no equivalen a Gmail Google | E/P — commands emiten events; flujo Google Workspace separado | C02-PS06; C03-PS09 | Elegir camino real; replay/import no duplica provider side effect. |

## G. Bus, kernel, Thoughts y reconstrucción (121–140)

| # | Concepto | Actual / referencia del baseline | Cambio / patchset | Qué falta / gate |
|---:|---|---|---|---|
| 121 | EventBus persiste/publica/replay | E — `engine/events/bus.ts`; RUN-2026-11-17-02 prueba persistencia Store PGlite y partición con mismo owner en tenants A/B | C00-PS00; C03-PS09 | No es Postgres/dogfood; replay probado en test separado, falta recovery de subscriber/Thought. |
| 122 | Live publish no equivale a durable ack | E/P — EventBus publica tras persistir; RUN-2026-11-17-08 prueba replay de 501 eventos con cursor durable, ACK durable y rollback sin publicación | C03-PS09 | Subscriber de kernel sigue best-effort; el cursor durable cubre la cadena V2, no la proyección live de Thoughts/turns. |
| 123 | Consumer durable necesita cursor/receipt | P — cyber relay tiene cursor; kernel consumers incompletos; RUN-2026-11-17-03/04 verifican solo escrituras best-effort de thought/turn indexes live | C01-PS03; C03-PS09 | Rebuild/idempotency por consumidor que requiere durability. |
| 124 | Commit/result distingue confirmado/unknown | E — bus y ActionService conocen unknown | C02-PS04/08; C07-PS20 | Pruebas en bordes de transacción y recovery. |
| 125 | Correlation/causation enlazan operación | P — envelope propone reutilizar IDs existentes | C02-PS04; C03-PS09 | Confirmar generación/persistencia en todos los producers elegidos. |
| 126 | Event schemas validan payloads y minimización | P — schemas/event types existen; cobertura producer por mapear | C02-PS04; C03-PS09 | Strict schemas, test de body/token/tenant ausente. |
| 127 | Tool traces sin secretos | P — RUN-2026-11-17-07: el payload del evento no llega a prompt, telemetría de ensamblado ni consola; vault no ecoa secretos y adaptadores fallan 503 sin credencial | C02-PS04; C03-PS10 | Falta barrido de logs de producción y trazas de tools reales. |
| 128 | Evento conserva provenance, actor, tenant | E/P — bus multi-tenant; envelope nativo no uniforme | C02-PS04; C03-PS09 | Asegurar campos para cada evento de operación. |
| 129 | Kernel tiene Turns/Thoughts/edges | E — `kernel.ts`, `graph/thought.ts`, `turn.ts` | C03-PS09 | Ampliar solo mapping necesario; no recrear graph. |
| 130 | Cycle es estructura, no policy total | E — ciclos en BASELINE §2 | C03-PS10/11 | Mantener límites y tests que separan policy de cognition. |
| 131 | Subscriber mapea conjunto explícito actual | E/P — `kernel/subscribers/events.ts` enumera clases actuales | C00-PS00; C03-PS09 | Inventariar todo el mapa/event set en SHA candidato. |
| 132 | Email/documentos requieren mapping explícito | P — email.received/sent mapeados con minimización en RUN-2026-11-16-02; documentos siguen fuera | C02-PS05/06; C03-PS09 | Extender solo tras schema/producer verificado para Drive; replay/loop/durability siguen gates separados. |
| 133 | Cyber ACK después del commit padre | E — relay contract/test lo hace (BASELINE §2 Cyber) | C01-PS03; C07-PS20 | Verificar wiring y crash/unknown real en composición runtime. |
| 134 | Child projection idempotente en replay | P — RUN-2026-11-17-06: relay local deduplica tras reinicio con mismo event id/hash y recupera ACK perdido antes de mover cursor | C01-PS03; C07-PS20 | Falta child real, secuencia duplicada emitida por el servicio y crash entre commit y ACK en infraestructura. |
| 135 | Evitar kernel→bus→kernel loop | D/P — peligro identificado | C03-PS09 | Marcar event origin/exclusion y test de no reentrada. |
| 136 | Thought roles tienen semánticas distintas | E — modelo Thought y cognit. cycle existen | C02-PS07; C03-PS09 | Seleccionar role por evento sin convertir reported fact en verified. |
| 137 | Thought conserva source/actor/tenant/correlation | P — provenance base existe, end-to-end mapping incompleto | C02-PS04; C03-PS09 | Assertions de campos/source refs en proyección. |
| 138 | Contexto referencia en vez de copiar payload | P — minimización requerida, consumer data por auditar | C01-PS03; C02-PS07; C03-PS09 | Test que no aparecen bodies/tokens y revocation filtra retrieval. |
| 139 | Errores subscribers recuperables/observables | P — RUN-2026-11-17-07: dead-letter idempotente con resolve/remove/requeue y aislamiento por owner; 500 emisiones sin pérdida | C03-PS09; C07-PS20 | Dead-letter local; falta fallo de consumer durable con cursor y replay en worker real. |
| 140 | Rebuild no reejecuta efectos | D/P — recovery normado, comportamiento end-to-end no acreditado | C07-PS20 | Replay de graph/events no vuelve a enviar Gmail o invocar child write. |

## H. Grafo, relaciones, ontología y contenedores (141–160)

| # | Concepto | Actual / referencia del baseline | Cambio / patchset | Qué falta / gate |
|---:|---|---|---|---|
| 141 | BusinessSchema V1/V2 coexisten | E — BASELINE §2 ontology | C00-PS00; C03-PS11 | Mapa de consumidores/versiones en SHA candidato. |
| 142 | Ontología Cards != empresarial | E — distinción en BASELINE §2 | C03-PS11; C06-PS17 | Mantener tipos y validadores separados. |
| 143 | Ontología debe producir reglas ejecutables por tenant | P — vocabulario validado, compilación empresarial incompleta | C06-PS17 | Bundle pequeño valida tipos, estados, fields y relations. |
| 144 | Entity type/fields validados al write | P — schema declara; create/update enforcement por comprobar | C03-PS11 | Invalid type/field se rechaza en route y storage boundary. |
| 145 | Estado/transiciones gobernados | P — RUN-2026-11-17-08: state-machine rechaza estado inexistente, transición no declarada da 409 y roleId restringe quién ejecuta | C03-PS11; C06-PS17 | Falta persistir policy/schema revision en la transición y probarlo sobre la ruta HTTP real. |
| 146 | Relation valida source/target types | P — RUN-2026-11-17-08: `createRelation` exige que ambas entidades existan y rechaza self-reference | C03-PS11 | No se probó tipo de extremo incorrecto ni kind permitido: enforcement sigue parcial. |
| 147 | Cardinalidad declarada enforced | E — RUN-2026-11-17-09: one-to-one/one-to-many rechazan con 422, cuentan por owner y chequeo+insert van en transacción | C03-PS11 | Sin constraint único en DB: concurrencia Postgres real sigue abierta, junto con cross-container. |
| 148 | Contenedor tiene semántica explícita | D — concepto pendiente de operacionalizar | C06-PS16 | Definir alcance real por dato y actor antes de schema change. |
| 149 | Tenant/workspace/project/private no son sinónimos | D — regla del plan | C06-PS16 | Mapear cada objeto y frontera; rechazar casts implícitos. |
| 150 | Visibility define leer/modificar | P — tenant permissions existen, per-object visibility a validar | C05-PS14; C06-PS16 | Tests shared/private y operaciones read/write separadas. |
| 151 | Cross-container relation requiere authz | D/P — no acreditado globalmente | C06-PS16; C03-PS11 | Reject sin permiso y persistir decisión/provenance. |
| 152 | Ontology instalada version/hash | D/P — schemas/versioning existen, tenant runtime actual por verificar | C06-PS17 | Persistir digest/version por tenant y referenciar en write. |
| 153 | Bundle compile reproducible | P — bundle validation existen; compilación completa no descrita | C06-PS17 | Fixture determinista: same input/version yields same validation result. |
| 154 | Schema update requiere compatibilidad/migración | D — requisito | C03-PS11; C06-PS17 | Plan de compatibilidad previo a migrar datos existentes. |
| 155 | ontology.ts no compila toda la empresa | E — validator scope descrito en BASELINE §2 | C06-PS17 | No atribuir policy/cardinality ejecutable al validator actual. |
| 156 | Registro/catálogo no otorga permiso | D — principio de autoridad | C03-PS10 | Test capability registrada pero deshabilitada/no autorizada → deny. |
| 157 | BusinessGraph != grafo cognitivo | E — capas presentes; distinción explícita | C03-PS11 | Cada consumer escribe en grafo correcto con schema/provenance. |
| 158 | Proyección cognitiva no reemplaza fuente dominio | D — regla de diseño | C03-PS09/11 | Test de no cambio de entity state por Thought/event derivado. |
| 159 | Nodos proyectados referencian operación origen | P — RUN-2026-11-17-08: entidades exigen provenance y `BusinessTruth` proyecta cada property con la suya | C02-PS04; C03-PS09/11 | Falta resolver operation/event/version de origen en rebuild y en proyecciones cognitivas. |
| 160 | Schema requerido inválido/ausente falla explícitamente | D/P — fail closed previsto, legacy compatibility no decidida | C03-PS11; C06-PS17 | Gate de writes governed; etiquetar/contener lecturas legacy. |

## I. Catálogo de repositorios child (161–180)

| # | Concepto | Actual / referencia del baseline | Cambio / patchset | Qué falta / gate |
|---:|---|---|---|---|
| 161 | Hay 14 repositorios enumerados | E — [README](README.md), sección de catálogo; lista GitHub previa | C00-PS00, solo inventario | Confirmar lista/ref contra acceso GitHub al abrir cada child; no implica auditoría. |
| 162 | Ciberseguridad es el primer elegido | E — repo y bridge descritos en BASELINE §2 | C01-PS01–03 | Integrar solo read-only y cerrar Gate C01. |
| 163 | Gestoría es el segundo elegido | E — servicio/SDK descritos en BASELINE §2 | C06-PS19 | No iniciar antes de gates previos y fijar versión del child. |
| 164 | `agntia-branding` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | No inferir stack/contrato/readiness; ficha requiere auditoría separada. |
| 165 | `agntia-clientes` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | No inferir readiness; revisar solo cuando se priorice. |
| 166 | `agntia-comunicacion` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | Auditoría/contrato futuros, no PS de integración actual. |
| 167 | `agntia-dise-o` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | Auditoría futura; no asumir capacidades. |
| 168 | `agntia-finanzas` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | No integrar ni habilitar efecto financiero en esta campaña. |
| 169 | `agntia-formacion` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | Revisar repo/contrato si se prioriza. |
| 170 | `agntia-legal` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | No inferir permiso/legal advice ni readiness. |
| 171 | `agntia-marketing` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | Auditoría separada pendiente. |
| 172 | `agntia-redes` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | No habilitar publicación social por inferencia. |
| 173 | `agntia-seguros` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | Auditoría futura de dominio/datos antes de integración. |
| 174 | `agntia-ventas` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | Auditoría separada; no activar acciones comerciales externas. |
| 175 | `agntia-video` está en catálogo | E/U — nombre listado; código no auditado | Fuera de alcance; decisión después C07 | No inferir stack o política de medios. |
| 176 | Lista no significa que los 14 estén auditados | D/E — límite indicado por README | C07-PS21 | Conservar clasificación U para los 12 no revisados aquí. |
| 177 | Cyber: servicio Python/FastAPI + SDK server-only TS | E — repo docs/contrato consultados según BASELINE §2 | C01-PS01/02 | Verificar actual main/ref, auth, API y aceptación; producción no probada. |
| 178 | Gestoría: servicio Python + cliente TS separado | E — repo docs/contrato consultados según BASELINE §2 | C06-PS19 | Fijar contrato/versión y desplegar frontera server-side propia. |
| 179 | Child no se importa arbitrariamente al runtime TS padre | D — límite arquitectónico | C01-PS01; C06-PS19 | Validar transporte/SDK; no embeber Python ni fusionar repos sin decisión. |
| 180 | Readiness debe venir del estado/documentación actual del child | E/D — status histórico consultado, no revalidado | C00-PS00; C01-PS01; C06-PS19 | Leer revisión actual al iniciar cada PS; guardar SHA/ref y gate del child. |

## J. Evidencia, gates y orden (181–200)

| # | Concepto | Actual / referencia del baseline | Cambio / patchset | Qué falta / gate |
|---:|---|---|---|---|
| 181 | Reportes A/B usan fixtures y un owner compartido | E — `08-provision/REPORTE.md`, BASELINE §2; RUN-2026-11-17-01 ejecutó provision y auth/aislamiento HTTP fixture A/B/C | C04-PS12 | Evidencia local sintética, no dogfood; cubrir stores/capacidades HTTP y providers en PS13. |
| 182 | Cada claim debe fijar SHA | P — histórico por report; campaña nueva aún sin ledger de ejecución | C00-PS00; EVIDENCE | Registrar base/candidato/comandos/status por PS. |
| 183 | A03 sigue NOT_RUN | E — estado previo de cognition V2 | Sin cambio; C07-PS21 comprueba | No marcar PASS sin recorrido original. |
| 184 | C15 sigue NO_GO | E — `CAMPAIGN-STATUS.md`/acceptance matrix | Sin cambio; gate global 9 | Mantener NO_GO hasta su propia autoridad/evidencia. |
| 185 | JEV sigue LIVE_DISABLED | E — ver BASELINE §2 JEV | Sin cambio | No invocar/live-enable desde esta campaña. |
| 186 | Local/Postgres/provider/dogfood son niveles distintos | E — EVIDENCE define estados | Todos; C04, C07 | Registrar nivel preciso; fixture no sustituye externo. |
| 187 | Separar fallos heredados de regresiones | D — norma de ledger | C00-PS00 y cada PS | Listar skipped/TODO/failures; no esconder ni debilitar tests. |
| 188 | Negativos incluyen artefactos con IDs cruzados | D — matriz prevista | C04-PS13; C05-PS15 | Ejecutar files/threads/actions/events/memory/jobs/relations. |
| 189 | Crash/restart en commit, ACK y worker | P — RUN-2026-11-17-07: el proceso muere a mitad de tarea y queda `running` con lease; RUN-2026-11-17-06: relay recupera ACK perdido sin duplicar proyección | C01-PS03; C03-PS09; C07-PS20 | Falta rescate/replay de la tarea tras crash y crash entre commit y ACK con child real. |
| 190 | Google/child real solo con autorización/alcance | D — guardrail | C02-PS08; C01-PS01; C06-PS19 | Configurar cuentas de prueba autorizadas; gate externo BLOCKED si faltan. |
| 191 | No probar efectos destructivos en producción | D — limitación de campaña | Todos los patchsets | Fixtures/staging acotado; ningún destructive live test. |
| 192 | Reportes guardan receipts mínimos, no cuerpos/secrets | D/P — regla minimización | C02-PS04/08; C03-PS09; EVIDENCE | Revisión de eventos/logs; evidence redactada. |
| 193 | Test vale solo en SHA ejecutado y con exit status | E — regla de evidencia | C00-PS00; EVIDENCE | Anotar comando, output summary, exit status y SHA. |
| 194 | Installed/wired/authorized/provider-tested son estados distintos | E — distinción BASELINE §3 | C00-PS00; EVIDENCE | Completar columna por operación/callsite, evitar “integrado” ambiguo. |
| 195 | Fuga tenant pausa ola | D — regla de parada PLAN §11 | C04-PS13 y todo gate multi-tenant | Tratar como P0; no continuar ni expandir hasta corregir. |
| 196 | Tres owners propios no son revisión independiente | D — limitación reportada | C04-PS12; C07-PS21 | Declarar riesgo residual; obtener revisión externa aparte si se requiere. |
| 197 | Reconocer implementado y no llamar completo a contrato | P — baseline ya usa distinciones | C00-PS00; todos PS | Revalidar rutas y test; separar existent/wired/durable/external. |
| 198 | Campaña tiene siete olas tras baseline | E — PLAN §1–8; C00 a C07 | Ningún cambio de código; README alinea C01=Cyber y C02=Drive/email | C00 confirma prerequisitos reales; no adelantar integración nativa a la instalación artesanal del child. |
| 199 | Cada patchset cierra gate/evidencia/rollback | E — PLAN/EVIDENCE templates | Cada PS | Completar ledger en cada ejecución antes de iniciar el siguiente. |
| 200 | Generalizar y escoger siguiente child después del dogfood | D — estrategia acordada | C06-PS18; C07-PS21 | Decisión humana informada por C01–C05; no paralelizar integración de 14. |

## Lectura de cobertura

- **Orden y generalización:** el plan coloca C03 (coherencia de capabilities/grafo) antes de C04 (dogfood con tres empresas). Para respetar que el kernel se ajuste desde uso observado, C03 debe limitarse a defectos reproducibles en C00–C02; cualquier refactor/generalización debe esperar la evidencia de C04–C06 y la decisión C06-PS18. Si la secuencia real de integración requiere dogfooding del primer child antes de C02/C03, registrar ese prerequisito al cerrar C00-PS00 en vez de tratarlo como PASS implícito.
- **Cobertura de temas:** los 200 números aparecen y cada uno apunta a evidencia/baseline, patchset o exclusión explícita.
- **Cobertura de implementación:** no significa que los 200 estén implementados. `E` cita elementos existentes descritos en baseline previo; `P` indica cableado/alcance a verificar; `D` es principio/objetivo; los children no auditados siguen fuera del alcance de código.
- **Cobertura verificable:** este anexo no reejecuta pruebas ni inspecciona de nuevo cada callsite. C00-PS00 debe anclar los claims al SHA de ejecución antes de usarlo como matriz de aceptación.
- **Cobertura fuera de alcance:** los 12 repos no elegidos están listados pero no auditados/integrados; JEV sigue inactivo; remediación cyber, efectos contables/fiscales y producción no se autorizan aquí.
