# Plan ejecutable: del child al runtime cognitivo dogfoodeado

> v1 · 2026-11-16 · Estado: **propuesta / ningún patchset ejecutado**

## 0. Reglas de campaña

1. **Un patchset cada vez.** Cerrar su diff, gate focal, evidencia y rollback antes del siguiente. No agrupar varios hunks solo porque toquen el mismo archivo.
2. **Comparar contra el SHA actual antes de aplicar.** Las campañas antiguas contienen snapshots, límites de superficie y estados de noviembre 9–16; un pendiente histórico no se considera pendiente actual hasta reproducirse.
3. **No reimplementar:** ActionService para escribir correo, WorkspaceService para Google, TenantPrincipal/TenantScopedStore para scope, Kernel/EventBus ya existentes. Primero cablear/comprobar las puertas existentes; reparar una puerta solo si un test o recorrido reproduce un fallo.
4. **No convertir dogfood en certificación.** Test de unidad, fixture, PGlite, Postgres restringido, proveedor real y uso de empresa son niveles diferentes. Registrar cada uno por separado.
5. **Sistemas separados, autoridad única:** child realiza procesamiento de dominio; Agente resuelve principal/policy/capability y decide si el actor puede invocarlo; kernel captura observación/Thought; bus registra eventos minimizados; grafo contiene relaciones autorizadas; ninguna de esas proyecciones aprueba un efecto.
6. **Sin autoridad del LLM:** puede proponer query/capability o redactar resumen/correo. Servidor resuelve principal, fija destinatario/target autorizado, revisa schema, política, aprobación, idempotencia y recibo. El contenido de Drive/email es dato no confiable.
7. **Determinista no implica retirar Fast/LLM:** la selección heurística/modelo puede variar; las condiciones de aceptación, permisos, transiciones, relaciones, commit y receipt sí deben ser versionados y reproducibles. Guardar prompt/model/version/hash y referencias para re-evaluar; no afirmar idéntica generación textual.
8. **Ningún efecto externo oculto:** sin approval para enviar correo/cambiar Drive/ejecutar remediation; sin retries ciegos ante `outcome_unknown`; no usar los datos de otro tenant para probar.

## 1. Ola 0 — C00: reconciliación de baseline

### C00 objetivo

Fijar el SHA, callgraph de capacidades actuales, estado del branch y las rutas de entrada reales; eliminar contradicciones entre fuente y documentos históricos sin modificar implementación.

### C00-PS00 — Baseline vivo y matriz de claims

- **Tipo:** documentación/inventario; no código de producto.
- **Hunks:** (H00.1) confirmar `git rev-parse HEAD`, branch, status y no solapar cambios; (H00.2) recorrer productores/consumidores de Google, workspace Gmail, approvals, policies, bus, kernel, graph, worker y el bridge security; (H00.3) adjuntar evidencia por símbolo/test con columnas `implemented / wired / durable / tenant-tested / external-tested`; (H00.4) reconciliar pendientes viejos contra HEAD, sin limpiar reports históricos.
- **Indicative paths:** `apps/server/src/{app.ts,workspace.ts,actions.ts}`, `engine/{service.ts,events/*,capabilities/*,security-v2/*}`, `kernel/subscribers/*`, `packages/workspaces/{01-gmail,05-google-drive}`, tests relevantes y docs de campañas 12–21/C14.
- **FIX-00:** no declarar ausente un publisher que exista fuera de `apps/server`; no llamar “activo” a un módulo visto solo en tests; no atribuir resultados de un SHA a otro.
- **Gate:** baseline con SHA/fecha reproducibles; cualquier afirmación de estado remite a archivo/línea o ejecución identificada; estado inicial de todas las campañas sigue `NOT_STARTED`.
- **Stop:** si archivos/diff del usuario aparecen, no descartarlos; incorporarlos como contexto o pedir criterio si chocan.

## 2. Ola 1 — C01: primera instalación artesanal de ciberseguridad

### C01 objetivo

Conectar un solo recorrido **de lectura, no destructivo**, del child `agntia-ciberseguridad` al padre. Aprovechar el puente V2 presente si corresponde al HEAD, pero verificar si se puede instanciar con los contratos reales del servicio y ActionService. No instalar el laboratorio adversarial dentro del runtime productivo.

### C01-PS01 — Pin y configuración manual segura

- **Hunks:** (H01.1) fijar origen/ref/versión/hash real del SDK o cliente TypeScript ya previsto; (H01.2) definir endpoint privado/allowlist, credenciales server-side y lifecycle de conexión; (H01.3) registrar module/status manual por tenant, disabled por defecto; (H01.4) confirmar APIs de lectura nominadas y que inputs no eligen tenant, URL, credencial, recurso ni approval.
- **Paths indicativos:** `apps/server/src/engine/security-v2/{contracts.ts,sdk-adapter.ts,capabilities.ts}` y configuración de bootstrap confirmada en C00. No editar todavía child repo salvo decisión/consentimiento específico.
- **FIX-01:** el SDK es cliente; no implica que middleware Python corra embebido. No copiar secret/token a bundle, logs, Thought o navegador. No permitir HTTP genérico, shell ni proxy de modelo.
- **Gate:** versiones/endpoint/origins configurados por tenant server-side; prueba de credencial missing/revoked/tenant mismatch falla antes de invocar child; capability queda deshabilitada si falta config.

### C01-PS02 — Cableado explícito del bridge en el runtime

- **Hunks:** (H02.1) adaptar identity `tenantId/actorId/agentId/policyRevision` desde principal confiable; (H02.2) conectar la autorización/delegación a la puerta real ya existente, no inventar aprobación; (H02.3) instalar relay/inbox/cursor una sola vez desde bootstrap; (H02.4) conectar capabilities al catálogo que consume ese tenant y actor, no solo a global registry; (H02.5) validar que shutdown/lifecycle cierra handles/clients.
- **Paths indicativos:** `app.ts`, `engine/service.ts`, `engine/security-v2/*`, `engine/capabilities/*`, `engine/authz/*`; confirmar montaje de app/worker antes de editar.
- **FIX-02:** tests actuales instancian bridge manualmente. Añadir test de montaje/bootstrap con deps controladas. No activar para tenant real aún.
- **Gate:** boot con feature deshabilitada mantiene baseline; enabled solo en tenant de fixture; lectura nominal retorna data minimizada; actor/PDP revocado mientras corre aborta antes/tras llamada según frontera y deja receipt honesto.

### C01-PS03 — Recepción de resultado child como evidencia

- **Hunks:** (H03.1) validar schema/hash/sequence/tenant/correlation/outbox; (H03.2) guardar inbox/proyección y una referencia a evidencia local en transacción padre; (H03.3) solo ACK child después de commit confirmado; commit unknown conserva estado de conciliación; (H03.4) proyectar registro cognitivo como `reported_fact`/`proposed` con `securityGuarantee:false`, no copiar findings/raw evidence; (H03.5) exponer resultado autorizado a agente como observation con reference.
- **Paths indicativos:** `security-v2/{event-relay.ts,contracts.ts,cognition-adapter.ts}`, `engine/cognition/v2/{storage.ts,context.ts}`, `kernel/{authors/*,graph/*}` solo si el recorrido actual lo necesita.
- **FIX-03:** `cyber.job.partial` conserva partial/coverage not reported; un finding o 0 findings no certifica protección; idempotencia/restart/lost ACK no duplican efectos.
- **Gate C01:** una operación sintética de assets/findings/jobs read recorre principal→grant→SDK→child/outbox→bus/receipt→Thought/context y se recupera tras reinicio. No remediation/write; proveedor/servicio real queda separado.

## 3. Ola 2 — C02: operaciones nativas observables (Drive y correo)

La secuencia de capability es: **lectura → interpretación rastreable → preparación → aprobación → efecto → confirmación**. No se expande el set de acciones hasta que el recorrido anterior sea visible y recuperable.

### C02-PS04 — Sobre común de invocación y resultado

- **Hunks:** (H04.1) especificar envelope versionado de operation con operationId, tenant/owner/actor, capability+version, source refs, correlation/causation, policy revision, idempotency key, input digest, timestamps y receipt; (H04.2) definir resultado discriminado `succeeded / rejected / blocked / failed / outcome_unknown`; (H04.3) separar evento de dominio, invocation y tool trace; payloads minimizados/strict.
- **Paths indicativos:** `packages/domain/src/{capability.ts,events}`, `apps/server/src/engine/events/{types.ts,schemas.ts,bus.ts}`, tests de bus/contratos. Primero reusar correlation/causation/event IDs ya existentes.
- **FIX-04:** no sustituir `SystemEvent` ni crear bus nuevo; no asumir `delivered` significa durable ack. Hacer aditivo y versionado.
- **Gate:** schema rechaza tenant/policy/actor vacíos, secrets, payload desconocido no permitido y resultado no tipado; replays con mismo operationId no duplican el efecto/Thought.

### C02-PS05 — Completar observabilidad de Drive sin duplicar su ciclo

- **Hunks:** (H05.1) inventariar search/read/index/reindex/forget/revoke actuales y conectarlos a operation envelope; (H05.2) emitir hechos diferenciados `drive.search.completed`, `drive.file.read`, `drive.source.indexed/failed/revoked` (nombres finales a reconciliar con vocabulario existente); (H05.3) mantener indexación explícita, source revision/digest y cita; (H05.4) mapear al kernel solo metadata/referencias autorizadas; (H05.5) el intento RUN-2026-11-16-02 añadió el disparador HTTP de selección que faltaba; el trabajo pendiente es completar sus pruebas de indexación autenticada en fixture y de proveedor controlado, y cablear events/Thoughts solo después de acordar schema minimizado.
- **Paths indicativos:** `workspace.ts`, `rag-routes.ts`, `engine/rag.ts`, `engine/events/*`, `kernel/subscribers/events.ts`, search/read-drive tests y panel solo si se requiere para operar.
- **FIX-05:** lectura no cambia el índice; indexing no expone texto en EventBus; revocación invalida fuente/citas/caches; refresh posterior no filtra tenant cruzado.
- **Gate:** evento/replay/Thought identifican tenant, actor, file ref, revision, operation id y policy revision; no incluyen bytes/body/OAuth tokens. Búsqueda/read/index con revocation y restart. Separar subgate de endpoint HTTP (añadido RUN-2026-11-16-02, falta smoke con conexión fixture) del subgate de provider real, aún no ejecutado.

### C02-PS06 — Gmail/inbox: ingestión/lectura con hechos y fuentes

- **Hunks:** (H06.1) diferenciar el Gmail workspace interno/sintético (`packages/workspaces/01-gmail`) del Gmail Google real (`WorkspaceService`/SDK); (H06.2) elegir un único camino y confirmar que import/sync no crea duplicates al replay; (H06.3) emitir eventos typed para received/sent/thread-linked/label/archive con operation IDs y referencias; incluir `email.archive` hoy sin hecho emitido si se verifica pendiente; (H06.4) conectar estos eventos al mapping cognitivo como observation/action con body ausente; (H06.5) restringir lectura de hilo a búsqueda/selección autorizada y preservación de origen.
- **Paths indicativos:** `packages/workspaces/01-gmail/src/application/commands.ts`, contracts/published.ts, `apps/server/src/workspace.ts`, `engine/conversation.ts`, `engine/events/schemas.ts`, `kernel/subscribers/events.ts`.
- **FIX-06:** no confundir un command `email.send` del workspace con envío Gmail real aprobado; nunca duplicar flujo o importar/reenviar cuerpo desde evento.
- **Gate:** import/replay de mismo mensaje una vez; evento y Thought citan tenant/thread/message/revision y fuente; bodies redactados; `kernel` subscriber procesa tenant nuevo sin restart y no provoca loop.

### C02-PS07 — Sumarizar inbox: LLM como interpretación versionada

- **Hunks:** (H07.1) definir selección determinista del conjunto de mensajes/ventana/labels/query y permisos antes del LLM; (H07.2) resumen devuelve referencias exactas a mensajes/revisiones y distingue hechos citados, inferencias e incertidumbres; (H07.3) almacenar run receipt (model/version/prompt-template/hash/input refs/output hash/correlation) sin copiar contenido sensible en eventos; (H07.4) producir Thought `observation` o interpretación, nunca business fact verificado; (H07.5) regeneración genera nueva revisión y puede reconstruirse usando sources conservadas.
- **Paths indicativos:** `engine/conversation.ts`, `engine/model.ts`, `engine/context/*`, `engine/cognition/*`, `kernel/graph/thought.ts`, `engine/events/*`; reusar Fast/Slow actual, no agregar proveedor ni servicio externo.
- **FIX-07:** no afirmar salida textual idéntica entre inferencias; sí reproducibles la entrada, versión de instrucciones/modelo, evidencia, hash/snapshot, estado y decisión del runtime. Correo/documentos se tratan como prompt-injection no confiable.
- **Gate:** resumen vacío/no evidence no aparece como hecho; todos los statements recuperables citan fuentes; revocar un hilo/documento hace que contexto nuevo no lo sirva y marca derivado stale/revoked sin borrarlo silenciosamente.

### C02-PS08 — Crear/responder email, aprobación y recibo

- **Hunks:** (H08.1) mantener `prepare_email`→ActionService; normalizar quién fija account/connection/generation, recipients, thread/message, attachment hashes y revision; (H08.2) obligar a que aprobación pertenezca a actor con permiso vigente (no solo UI owner ni role legacy); (H08.3) cerrar el callback de `DeferredActions` si el HEAD todavía lo declara `deferred_dispatch_unwired`; (H08.4) emitir operation/proposal/approval/send/unknown events enlazados por causation; (H08.5) confirmar por provider receipt minimal y verificar mismo thread/account; (H08.6) crear correo nuevo separado de reply-to-thread.
- **Paths indicativos:** `actions.ts`, `workspace.ts`, `google.ts`, `engine/conversation.ts`, `engine/service.ts`, `index.ts` si el dispatch sigue pendiente, `engine/events/*`, permission routes.
- **FIX-08:** revisar draft hash actual; doble approval=una llamada; revocación/rotation vence la propuesta; timeout=`outcome_unknown`, sin retry; approval/event/receipt persisten con actor/tenant, sin body.
- **Gate C02:** Drive read/index, inbox search/read, summary cited, reply draft, approval deny/approve, one controlled external receipt or clearly marked simulation. Nunca mandar a recipients no revisados.

## 4. Ola 3 — C03: reparar recorridos en el kernel/grafo/bus (invariantes)

### C03-PS09 — Event producers y mapping cognitivo

- **Hunks:** (H09.1) inventariar event schemas, publishers reales y consumers; (H09.2) añadir mapping solo de eventos con contrato + minimización + policy checked; (H09.3) convertir input a Thought role correcto y attach edges to refs; (H09.4) transportar source event id/correlation/causation, actor/tenant; (H09.5) persistir subscriber receipt/cursor/failure para rebuild/idempotent retry, sin hacer durable cada subscriber innecesariamente.
- **Paths indicativos:** `engine/events/{bus.ts,types.ts,schemas.ts,subscriber.ts}`, `kernel/subscribers/{events.ts,bus-emitter.ts,thought-consumer.ts}`, tests event-bus/kernel-coherence.
- **FIX-09:** eliminar fire-and-forget como prueba de éxito donde se requiere autoridad durable; no crear ciclo kernel→bus→kernel infinito; kernel own events se excluyen o se etiquetan explícitamente.
- **Gate:** caída antes/después del commit/replay/lost ack; un evento genera como máximo una proyección idempotente y un Thought/source reference bajo tenant correcto. RUN-2026-11-16-02 cubre solo email.received/sent en el subscriber vivo; no acredita cursor durable ni replay de Thoughts.

### C03-PS10 — Determinismo de autorización y ejecución

- **Hunks:** (H10.1) mapear cada herramienta nativa/child a capability id, schema version, risk, side effect, reversibility, idempotency/retry policy; (H10.2) hacer que orquestador ofrezca solo capabilities disponibles/instaladas en tenant; (H10.3) autorización en límite del efecto desde principal fresco; (H10.4) usar ActionService para todos los efectos externos nominados; (H10.5) versionar decision/denial y no llevar credenciales a modelos.
- **Paths indicativos:** `engine/capabilities/{registry.ts,bootstrap.ts}`, `engine/service.ts`, `engine/orchestrator/orchestrator.ts`, `engine/execution/{capability-runner.ts,tool-executors.ts}`, `engine/authz/*`, `actions.ts`.
- **FIX-10:** `TenantScopedCapabilityRegistry` resolver global/version 1 y uso global del orchestrator son limitaciones verificadas en revisión; cambiar solo lo necesario para demostrar enable/install/authorize por tenant. No duplicar PDP con nueva API `assertPermission` si no se demuestra la falla de route.
- **Gate:** capability no instalada, actor revocado, tenant suspendido, policy revision vieja o aprobación ajena producen deny sin efecto; permisos allow específicos y auditables.

### C03-PS11 — Grafo de negocio y relaciones

- **Hunks:** (H11.1) seleccionar el schema empresarial real por tenant/version (no cromático ontology); (H11.2) validar entity type/fields/states en create/update; (H11.3) validar relation kind, source/target types, cardinality, containers y membership en misma operación/transacción; (H11.4) preservar evidence/provenance/ref/correlation del source operation; (H11.5) diferenciar child projection vs authoritative entity writes.
- **Paths indicativos:** `packages/domain/src/{business-schema.ts,business.ts,ontology.ts}`, `engine/business/{graph.ts,resolver.ts}`, `business-routes.ts`, schema storage/provision, tests business-graph/entity-resolver.
- **FIX-11:** hay V1/V2 parallel y `createRelation` no necesariamente hace cumplir todos los constraints declarados. Reproducir con test; no migrar/invalidar registros antiguos sin plan explícito de compatibilidad.
- **Gate:** tipos inválidos/cardinalidad violada/cross-container/tenant reject; actualizar schema version no rompe los records anteriores y el grafo puede reconstruirse desde event/provenance acordada.

## 5. Ola 4 — C04: tres owners, tres tenants y pruebas negativas

### C04-PS12 — Provisionamiento separado de tres owners

- **Hunks:** (H12.1) definir tres `userId`/owners distintos, emails distintos y tres tenantIds A/B/C; (H12.2) preparar/provisionar memberships por invite/operator, nunca por trust de email suministrado al modelo; (H12.3) conservar report por instalación/ids, no guardar credenciales de proveedor; (H12.4) comprueba escoger tenant en JWT/session/headers y revocación.
- **Paths indicativos:** `TenantService`, provision scripts existentes, `tenant-principal.ts`, `scripts/lib/vertical-slice-bundle.ts`, auth tests y local dogfood fixtures. No alteres datos existentes ni onboarding productivo.
- **FIX-12:** el report de instalación histórica A/B usó un owner compartido; construir nuevo escenario sin presuponer que el script soporta tres owners por template.
- **Gate:** cada cuenta solo selecciona tenant al que está vinculada; identity A no aparece como owner efectivo de B/C; DB error nunca cae a `default` en modo multi-tenant.

### C04-PS13 — Matriz cruzada HTTP + Store + contexto

- **Hunks:** (H13.1) crear mismo resource/message/thread/action id en A/B/C; (H13.2) cross read/write por headers, JWT, path/body y tool input; (H13.3) verificar RAG, Drive index, mail, graph, memory/private memory y connection resolution; (H13.4) ejecutar evento replay, queued task/worker restart, lease claim, cache y report; (H13.5) revocar/suspender en caliente y comprobar siguiente acción.
- **Paths indicativos:** `tests/tenant-*`, integration tests del bus/kernel, worker, Workspace/RAG, Google, actions, graph. Crear tests focales donde ya exista convención.
- **FIX-13:** auditar stores crudos, `scanByPrefix`, SQL/RLS y datasets con joins; no asumir que el prefix por sí solo protege SQL arbitrario o tablas cognitivas.
- **Gate C04:** cero cross-tenant rows, chunks, events, Thoughts, connections, jobs, approvals, receipts o citations en matriz A/B/C; 403/404/503 honestos; sin secretos/contenido privado en report.

## 6. Ola 5 — C05: empleados actores y agentes por tenant

### C05-PS14 — Dos identidades empleado por empresa

- **Hunks:** (H14.1) crear dos users/personas por A/B/C después del owner; (H14.2) asignar roles employee/admin según matriz aceptada (rol de plataforma != rol de tenant); (H14.3) probar owner-employee visibility, private memory owner, records compartidos y approvals; (H14.4) revocar uno y verificar respuesta inmediata.
- **Paths indicativos:** `engine/actors/service.ts`, `tenant.ts`, `tenant-permissions.ts`, principal, membership/provision tests y memory context.
- **FIX-14:** tenant role `admin` no debe implicar platform admin; `actions.approve` requiere enforcement en la ruta real y no una matriz aislada.
- **Gate:** owners nunca abren tenant ajeno; empleados leen/crean solo según permisos empresariales; los recuerdos privados siguen por actor.

### C05-PS15 — Tres agentes por empresa

- **Hunks:** (H15.1) declarar tres agent/persona IDs y scopes únicos por tenant; (H15.2) registrar/instalar roles y capabilities sin `crossTenant`; (H15.3) comprobar LLM/planner solo recibe tools concedidas al rol; (H15.4) mantener caller actor y executing agent distintos en provenance; (H15.5) deshabilitar uno y comprobar que no arranca ni por chat ni worker.
- **Paths indicativos:** `engine/agents/{runtime.ts,governance.ts}`, `engine/actors/service.ts`, persona registry/bootstrap, tenant config/capability registration, planner/conversation/worker.
- **FIX-15:** no confiar en agentId/role/capability del modelo; derivar en servidor desde identidad y registro vigentes. No contar output LLM como efecto autorizado.
- **Gate C05:** por tenant owner+2 employees+3 agents instalados; negativas cruzadas agente A↔B/C; role revocation mid-task; durable identity restored after job restart. El test local añadido en RUN-2026-11-16-02 cubre provisionamiento de tres owners/tenants y dos empleados por tenant sintético, pero no autentica tres identities externas ni provisiona/tiene todavía los tres agentes requeridos.

## 7. Ola 6 — C06: primitivas mínimas, contenedores, ontología y Gestoría

### C06-PS16 — Contenedores y scope del dato

- **Hunks:** (H16.1) definir qué significan tenant, workspace/container, actor-private, shared entity y module subdomain en uso real; (H16.2) mapear cada objeto: owner/tenant/container/visibility/policy; (H16.3) comprobar queries, cache, jobs, RAG y projection respetan cada frontera; (H16.4) tratar las relaciones entre contenedores con permiso explícito.
- **Paths indicativos:** tenancy/context schemas, business graph, file/RAG records, event schemas, entity visibility; inspección antes de construir schema nuevo.
- **FIX-16:** `workspaceId` u owner compuesto no constituye permiso; no colapsar container con tenant/organization.
- **Gate:** mismo tenant pero contenedor privado/otro workspace no visible; shared relations solo mediante membership/policy; tareas/replay preservan original container.

### C06-PS17 — Instalar ontology empresarial pequeña para verticales observados

- **Hunks:** (H17.1) usar un subset real de ciberseguridad (asset, audit/job, finding/evidence, scope) y operación nativa (message/thread/document); (H17.2) compilar/validar tipos, propiedades clasificadas, estados, rels y cardinalidad por tenant/version; (H17.3) comparar resultados con `BusinessSchemaV2`/V1 y ontology bundle; (H17.4) no copiar todos los modelos de children al metamodel global; (H17.5) definir migración/compatibilidad solo si dogfood lo exige.
- **Paths indicativos:** `packages/domain/src/business-schema.ts`, `ontology.ts`, `engine/business/graph.ts`, loaders de `clientes/<tenant>/ontology.json`, workspace generator.
- **FIX-17:** fail closed para schema inválido y relaciones incompatibles; fail explicit on schema missing where capability writes governed entity, mientras lecturas legacy se etiquetan `legacy/unverified` según decisión.
- **Gate:** un bundle pequeño por tenant valida; entes/relaciones no declarados no se escriben; una referencia child se puede explicar por fuente/version/correlation; reglas V1 y V2 no divergen silenciosamente.

### C06-PS18 — Sintetizar axiomas desde patrones repetidos

- **Hunks:** no mover código al comienzo. (H18.1) medir qué checks/failures se repiten entre Drive, Gmail y Cyber; (H18.2) proponer interfaz mínima de capability/operation/event/source/approval/receipt; (H18.3) presentar ejemplos concretos y contraejemplos; (H18.4) guardar decisión sobre universalizar o dejar específico.
- **Indicative docs:** actualizar esta campaña + arquitectura de kernel solo con decisión explícita; fuente de realidad sigue en tests/callsites.
- **FIX-18:** bloquear abstracción por semejanza nominal; al menos dos consumidores reales independientes deben probar una primitiva común.
- **Gate:** lista corta de axiomas aceptada por dogfood (tenant, actor, authority, provenance, operation state, event correlation, recoverability); sin JEV ni backend/plugin universal implícito.

### C06-PS19 — Segundo child: `agntia-gestoria`

- **Hunks:** (H19.1) inventariar actual main del child y SDK; fijar versión/hash; (H19.2) instalar manualmente servicio/SDK separado y auth server-side; (H19.3) exponer únicamente una capability de lectura/preview de expediente y evidencia; (H19.4) project results with tenant/company/container/revision/source refs into bus/Thought/graph; (H19.5) keep human review for fiscal/accounting/HR/Odoo effects; (H19.6) compare boundary with Cyber and revise only repeated parent primitives.
- **Paths indicativos:** parent capability adapter, tests multi-tenant/dogfood, child `typescript/` SDK/API contracts; do not copy Python runtime into parent.
- **FIX-19:** owner token not exposed; no tax filing, invoice posting, payments, HR actions or inferred deductibility from LLM; facts unknown produce question/human review.
- **Gate C06:** A/B/C can invoke authorized preview in own company; cross-tenant IDs rejected; report explicitly distinguishes drafted/calculated/reviewed/submitted (submission remains unsupported).

## 8. Ola 7 — C07: cierre, replay, recuperación y decisión de expansión

### C07-PS20 — Rebuild y auditoría de la conversación/operación

- **Hunks:** (H20.1) a partir de operation log/event receipts reconstruir capability call, input snapshot refs, authorization decision, Thought refs, graph projection, approval, provider result; (H20.2) replay no repite external effects; (H20.3) cada proyección indica source event/ref/version; (H20.4) revocación invalida serving/caches sin cambiar historial factual.
- **Paths indicativos:** event replay, graph projections, context, action receipts, cyber inbox, Drive sources.
- **FIX-20:** no reejecutar tool de escritura para reconstruir; recovery usa receipts/projections o exige reconciliación humana ante outcome_unknown.
- **Gate:** reinicio entre cada frontera de commit; se reconstruye estado sin duplicar Gmail/child action ni aceptar evento sin hash/tenant.

### C07-PS21 — Informe de dogfood y expansión one-by-one

- **Hunks:** (H21.1) registrar findings por tenant/actor/capability, leaks/failures/retries, eventos sin consumer, Thought sin source, policy denies y manual work; (H21.2) clasificar fix parent vs child vs configuración; (H21.3) cerrar o dejar explícitamente abiertos TODOS los patchsets; (H21.4) solo entonces decidir instalación del próximo child.
- **FIX-21:** no convertir “funcionó en mis tres cuentas” en revisión independiente/producción certificada; no empezar a integrar en paralelo los 14.
- **Gate C07:** informe con SHA, casos, resultado, límite, rollback y siguiente decisión humana. Repetir método artesanal módulo por módulo.

## 9. Matriz mínima de rutas funcionales

Cada capacidad se evalúa de forma independiente por tenant/actor:

| Operación | LLM permitido | Server/kernel obligatorio | Efecto y aprobación | Evidencia mínima |
|---|---|---|---|---|
| Buscar Drive | proponer query | fijar account/tenant/capability; validar scope | solo lectura | query digest, file refs/revisions, operation/event ID |
| Leer documento | no elegir un ID cross-tenant | verificar selección/acceso y límites | no indexa por defecto | file ref, revision/digest, truncation, access decision |
| Indexar Drive | puede proponer | selección explícita; source record/version; embeddings as suboperation | no muta Drive | source status/revision/connection; citations source-bound |
| Buscar/le­er inbox | consulta y comprender datos no confiables | server selects tenant/account/window; bounded output | lectura | message/thread IDs, revisions/timestamps, query snapshot |
| Resumir inbox | sí, como interpretación | input refs exactas, model/prompt version, uncertainty | no envía/etiqueta automáticamente | summary revision + all source refs + model receipt |
| Redactar email | sí, como borrador | validar schema, recipients/source/account, preview hash | crea proposal; no envío | author, input refs, recipient set, draft hash |
| Aprobar email | no | route verifica membership fresco, permission y draft version | aprobación expresa y separada del modelo | approver actor, policy revision, decision/hash/time |
| Enviar | no | ActionService único, connection generation, idempotency/CAS | provider call una vez; unknown no retry | provider receipt id/thread, outcome/unknown, source proposal |
| Cyber read | puede pedir capability nominada | delegación one-use, resource server-selected, tenant + policy current | lectura | child hash/sequence, partial coverage, sanitized refs |
| Gestoría preview | puede pedir capability nominada | actor/company membership y data classification | solo preview/review inicial | expediente version, fuente legal/revisión humana |

## 10. Gate global de aceptación

No es un “PASS total” hasta probar y registrar por separado:

1. Typecheck/build/test focal del SHA actual y tests nuevos del patchset.
2. Store multi-tenant en fixture/Postgres según la superficie; RLS se prueba con rol restringido si se invoca `MULTI_TENANT_SHARED`.
3. Tres owners autenticados distintos y memberships reales de dogfood; si no hay staging/IdP, gate externo permanece `BLOCKED`, no se sustituye por un JWT fixture.
4. Cero cruce entre A/B/C de mail, Drive, RAG, credentials, graph, events, Thoughts, memory, jobs, approvals y receipts.
5. Worker restart, duplicate event, lost ACK, revocation, rotated Google credential, tenant suspend y `outcome_unknown` sin reintento externo.
6. Agentes solo reciben capabilities permitidas; actor humano y agent actor diferenciados; approval requiere humano con permiso vigente.
7. La proyección cognitiva no infiere garantía, no cambia estado empresarial por sí sola, mantiene provenance y puede invalidarse al revocar fuente.
8. Ciberseguridad sigue sin acciones de remediación autónoma; gestoría no presenta modelos fiscales ni contabiliza efectos externos.
9. `C08/JEV` sigue `LIVE_DISABLED`, `C15` sigue `NO_GO` hasta que sus gates originales se superen con autoridad apropiada.
10. No reporte privado incluye cuerpo completo de correo/documento, credenciales, tokens o PII innecesaria.

## 11. Condiciones de pausa

- Cualquier fuga A↔B/C: detener escritura/instalación del siguiente patchset; reproducir y cerrar como P0 de aislamiento.
- Una capability opera con identity/tenant suministrados por el modelo: bloquear activación.
- Evento llega al bus con fallo de persistencia, payload con secretos o sin tenant: bloquear proyección.
- ACK child antes de commit padre o reejecución tras commit unknown: detener relay y conciliar.
- Policy actualizada/revocada no afecta la siguiente acción: no instalar más capabilities.
- Una prueba pide proveedor/cliente/producción: usar fixture autorizado o esperar entorno/aprobación; nunca inventar el resultado.
- Instalación requiere reescribir el child, fusionar repos o automatizar el catálogo completo: registrar decisión aparte; fuera del scope actual.

## 12. Salida y actualización

Cada PS añade al [ledger](EVIDENCE.md): SHA base/candidato, files allowlisted, test commands/status, resultado vs límite, review del hunk, rollback y estado. Un gate solo se marca `PASS_LOCAL`, `PASS_POSTGRES`, `PASS_PROVIDER_CONTROLLED` o `PASS_DOGFOOD`; no usar PASS sin nivel.
