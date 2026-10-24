// ROLLBACK_CLI_V1 - lista releases buenas o solicita rollback a una.
// Uso: pnpm exec tsx scripts/rollback.ts --list
//      pnpm exec tsx scripts/rollback.ts --to <stamp>

import { listGoodReleases, rollbackToRelease } from "../apps/server/src/rollback.ts";

async function main() {
  const dataDir = process.env.DATA_DIR ?? ".openmuse";
  const args = process.argv.slice(2);
  if (args.includes("--list") || args.length === 0) {
    const releases = await listGoodReleases(dataDir);
    if (releases.length === 0) {
      console.log("No hay releases buenas registradas.");
      return;
    }
    console.log("Releases buenas:");
    for (const r of releases) {
      console.log(`  ${r.stamp}  version=${r.version}  commit=${r.commit ?? "-"}  at=${r.createdAt}`);
    }
    return;
  }
  const toIdx = args.indexOf("--to");
  if (toIdx >= 0 && args[toIdx + 1]) {
    const record = await rollbackToRelease(dataDir, args[toIdx + 1]);
    console.log(`Rollback solicitado a ${record.stamp}. Aplica el deploy correspondiente.`);
    return;
  }
  console.log("Uso: tsx scripts/rollback.ts [--list | --to <stamp>]");
}

void main();
---

# Tomo I — Producto

## I.1. Para quién es este documento

Este tomo está escrito para quien decide comprar, invertir o vender. Se lee sin saber código. Explica qué es OpenMuse, qué son los 16 empleados digitales, qué es el Arquitecto, cuánto cuesta, cómo se contrata, cómo se opera. Si eres técnico y quieres el detalle, salta al Tomo II. Si eres comercial y quieres el pitch, ve directamente a I.8.

## I.2. Qué NO es OpenMuse

No es un wrapper de ChatGPT. No es un CRM. No es un ERP. No es Zapier. No es un copiloto. OpenMuse **ejecuta trabajo real** dentro de una empresa, con aprobaciones humanas, con auditoria verificable, y con un aprendizaje que se acumula. La conversacion es la interfaz, pero no es el producto. El producto es el equipo digital que trabaja.

## I.3. El problema real de la PYME

Una PYME media usa entre 9 y 14 herramientas inconexas. Ninguna sabe qué estan haciendo las otras. Los leads se enfrian porque nadie llamo el dia 4. Las facturas se emiten tarde. Los contratos se renuevan solos. Los clientes se van sin que nadie se entere de que llevaban tres semanas sin respuesta. No es un problema de falta de software. Es un problema de que el software no sabe que hacer con lo que ya tiene.

## I.4. La promesa

Tres cosas concretas y ninguna mas. Primero, el trabajo repetitivo y determinista del negocio se ejecuta solo. Segundo, el dueno tiene visibilidad real: que pasa, que espera su OK, que se ha bloqueado. Tercero, el sistema aprende con el uso: si un patron funciona cinco veces, se propone como proceso; si falla tres, se anade una regla de prevencion. Nada de magia, nada de sustituir al humano.

## I.5. Los 16 empleados digitales

Dieciseis empleados, cada uno con nombre propio, un oficio y un horario. Alex (direccion) mira el bosque, no ejecuta, propone. Leo (comercial) persigue leads sin cerrar sin tu OK. Sofia (atencion) responde en menos de 4h, nunca discute. Carmen (administrativo) recuerda vencimientos tres veces, no se cansa. Victor (finanzas) no da una cifra sin fecha. Bruno (marketing) no lanza nada sin objetivo medible. Lola (contenido) adapta el tono al canal. Omar (operaciones) detecta bloqueos antes que tu. Raul (compras) no acepta la primera oferta. Elena (rrhh) nunca decide sobre personas sin aprobacion. Martin (legal) no firma, prepara para que firmes. Clara (compliance) cita articulo o dice que no lo tiene. Nico (investigacion) no da un dato sin fuente. Sara (calidad) no dice "esta mal" sin decir como arreglarlo. Teo (it) no toca produccion sin ventana. Valeria (producto) pesa mas una queja repetida tres veces que una fuerte. Cada uno trabaja 15h al dia, lunes a viernes. Cada uno tiene su ficha, su calendario, sus memorias, sus SOPs.

## I.6. El Arquitecto: el servicio de compilacion

Cuando un cliente necesita algo que ninguno de los 16 sabe hacer, se lo pide al Arquitecto. "Necesito un proceso para recordar pagos fraccionados a clientes con mas de 5 facturas al ano." El sistema responde "lo estoy construyendo, manana lo tienes". Al dia siguiente aparece una propuesta: el SOP con sus pasos, sus tests, su coste estimado. El cliente la aprueba o la rechaza. El Arquitecto no toca el engine. Solo produce artefactos declarativos validados y testeados en un sandbox. Si algo no cabe en el contrato, escala al operador y se hace a mano.

## I.7. El workspace del dueno: ficha, planificador, equipo

Tres vistas. La **ficha del empleado** muestra nombre, avatar, tono, ROI, perfil editable, memorias, SOPs, y que esta haciendo ahora mismo. El **planificador** muestra el calendario semanal y diario del empleado, con sus tareas por rango, editable por drag & drop o por chat. El **workspace de equipo** muestra a los 16 en una rejilla con su estado en vivo: quien trabaja, quien espera OK, quien esta ocioso, quien se ha bloqueado. Es la vista que el dueno abre por la manana con el cafe.

## I.8. Contrato, SLA y precio

Cada empleado digital tiene un contrato explicito: 15h/dia, lunes a viernes, con su calendario, su SLA de respuesta, y su coste. El precio se vende por empleado al mes, o por equipo completo. Incluye: el rol preconfigurado, sus SOPs base, su memoria de dominio, su calendario, su ficha en el workspace, y acceso al Arquitecto para SOPs custom. El cliente puede anadir empleados, quitar empleados, o cambiar su horario en cualquier momento. No hay penalizacion por cambiar de opinion.

## I.9. Comparativa honesta

Comparado con ChatGPT, OpenMuse tiene runtime durable, memoria estructurada, aprobaciones, audit trail y un grafo de negocio. Comparado con Copilot o los asistentes de Microsoft, no depende de Windows ni de Office. Comparado con Zapier o Make, no es un orquestador de conectores: es un runtime con contratos, verificacion y aprendizaje. Comparado con Notion AI, no vive dentro de una nota: vive dentro de un pipeline con side effects reales. Comparado con Relevance AI, no vende agentes sin contrato: cada capability declara su riesgo, su coste y si requiere aprobacion. La ventaja competitiva que ninguna solucion SaaS multi-tenant puede dar: **el cliente es dueno del deployment**. Los datos viven en su servidor, las claves se cifran con su clave, los backups son suyos, y si manana quiere irse, se lleva el Postgres entero.

## I.10. Estado real de este tomo

El producto esta disenado y la mayor parte esta construida. Los 16 roles existen en el catalogo y se seedean automaticamente. El calendario semanal y el plan diario funcionan. La ficha y el workspace estan implementados. El Arquitecto produce builds y los escala cuando no converge. Lo que falta para vender a un cliente real: cerrar el typecheck y los tests globales (Cline), activar el signup publico (infraestructura lista, endpoints pendientes), y desplegar el primer cliente de prueba con soporte directo.
---

# Tomo II — Sistema

## II.1. Las 4 apps y los 4 packages

OpenMuse vive en un monorepo pnpm. Cuatro apps y tres packages mas un catalogo. Las apps son: server, el API Hono con el motor durable y el kernel cognitivo; web, el frontend React + Vite; worker, el browser aislado con Playwright; computer, el sandbox Docker con Python. Los packages son: domain, con todos los contratos Zod que respetan las demas capas; integrations, con Google, PDF, vault y stubs; backends, con el adapter de OpenBot; catalog, con la libreria de templates del Arquitecto.
El domain no depende de nadie. El server depende del domain y del catalog. El web depende del domain para los tipos. El worker y el computer son independientes.

## II.2. Diagrama de bloques

    apps/web  <--HTTP/SSE-->  apps/server  <--HTTP-->  apps/worker
                                    |                       (Playwright)
                                    |  Docker
                                    v
                              apps/computer
                              (Python + bash + git)
                                    |
                                    |  records / events / audit / kernel
                                    v
                              Postgres o PGlite

El API sirve al frontend, despacha al worker de tareas durable, coordina el kernel cognitivo, y llama al browser worker y al sandbox computer cuando hace falta. El bus de eventos es la espina dorsal: todas las fases del sistema emiten y leen del bus.
## II.3. El hilo rojo: ExecutionContext

Desde el primer mensaje del usuario hasta el ultimo outcome verificado, un solo objeto viaja por todas las APIs internas: ExecutionContext. Lleva tenantId, owner, role, roleId, requestId, correlationId, runtimeId, goalId, taskId, threadId, turnId. Cada servicio lo recibe y lo usa. Cuando un build del Arquitecto corre en sandbox, el ExecutionContext incluye el buildId y el roleId. Cuando un SOP ejecuta un paso, incluye el sopId y el sopStepIndex. Esto es lo que permite trazabilidad completa: dado un requestId, se puede reconstruir todo lo que paso.

## II.4. Flujo extremo a extremo

El usuario escribe en el chat. El ConversationAgent abre un turno en el kernel, escribe lo que dijo como Thought(intent), consulta el RAG y la memoria, llama al modelo con las memorias del rol activo y el contexto urgente, recibe la respuesta, la escribe como Thought(response), y cierra el turno. Al cerrar, el Promoter decide que sobrevive y a donde va: al usuario, a memoria, al Business Graph, a audit, o a descarte.

Si el usuario pidio algo durable, el chat llama a createTask. El TaskWorker reclama la tarea con un lease, la ejecuta paso a paso, y emite eventos al bus en cada transicion. Si un paso genera side effects externos, se crea un ActionProposal que el usuario aprueba. Cuando la tarea termina, el DeterministicVerifier comprueba si el Outcome satisface los criterios del Goal. Si no, el LlmVerifier da una segunda opinion. El LearningObserver guarda el resultado. Y si el verificador fallo, el LlmReplanner genera un plan nuevo.
## II.5. Multi-proceso

Hay cuatro roles de proceso. El API sirve HTTP y no ejecuta tareas si OPENMUSE_PROCESS_ROLE=api. El worker ejecuta tareas durables y no sirve HTTP si OPENMUSE_PROCESS_ROLE=worker. El browser worker es un proceso Playwright con su propio token. El computer es un contenedor Docker por owner. Los cuatro hablan por la base de datos y por el bus de eventos. Un API puede reiniciarse sin perder tareas porque el worker sigue corriendo. Un worker puede reiniciarse sin perder trabajo porque el lease expira y otro worker lo reclama.

## II.6. Multi-tenant: un deployment por cliente

Hoy, un deployment por cliente. Manana, si el volumen lo pide, varios tenants en el mismo Postgres. El sistema esta preparado para los dos. El TenantScopedStore aisla todos los accesos al Store con la clave compuesta tenantId:owner. El EventBus escribe con la misma clave. Los ficheros viven en dataDir/tenants/<tenantId>/. Los rate limits son por tenant. Los guardrails tienen cuotas por tenant. Cuando un cliente se registra, TenantService.resolveBySlug le asigna un tenant. El kernel cognitivo resuelve tenantId en cada operacion.

El modo por defecto es un deployment por cliente porque el coste de operar varios tenants en el mismo Postgres sin haber probado carga a 50 es mayor que el coste de dedicarle 20 EUR/mes de servidor. Pero la arquitectura soporta los dos.

## II.7. Estado real de este tomo

Todo lo descrito esta implementado. La parte que esta a medias: el signup publico (infraestructura lista, endpoints pendientes), y la resolucion por subdominio (hoy solo por slug del nombre de la organizacion). El resto funciona: 4 apps, 3 packages, ExecutionContext por todas las APIs, flujo extremo a extremo, multi-proceso por variable de entorno, multi-tenant con aislamiento por clave compuesta.
---

# Tomo III — Motor

## III.1. El dominio: contratos que todo lo demas respeta

El package domain no depende de nada. Cada contrato es un schema Zod con su tipo inferido. Los contratos son: Goal, Outcome, Capability, Plan y PlanStep, ExecutionContext, VerificationResult, Messaging (AgentMessage, Handoff, ApprovalRequest), Runtime, PolicyContext, ReactionRule, Truth, EntityResolution, BusinessSchema, WorkspaceSpec, LearningFact, LearningPattern, FailureLesson, ProceduralLearning, WeeklySchedule, DayPlan, TeamWorkspace, BuildSpec, BuildArtifact, BuildProposal, Escalation. Se exportan desde index.ts y cualquier capa del sistema los importa. Esto permite que un contrato cambie en un solo sitio y todas las capas lo respeten.

## III.2. TaskWorker: el runtime durable

El TaskWorker es un ciclo que corre cada segundo y reclama tareas que cumplen tres condiciones: no las esta ejecutando otro worker, estan en un estado ejecutable, y su lease ha expirado o no existe. Los estados ejecutables son queued, scheduled (si ya toca), running (si el lease expiro) y waiting_approval (si la accion expiro o fue resuelta).

El claim es atomico: usa compareAndSwap con el estado actual y el leaseId actual como precondicion. Si dos workers compiten, uno gana y el otro recibe null y se retira. El lease dura 60 segundos por defecto. Un heartbeat cada 20 segundos renueva el lease mientras la tarea corre. Si el heartbeat falla porque otro proceso robo el lease, aborta el AbortController y la tarea muere limpiamente.

Cada ctx.guard() verifica que el lease sigue siendo nuestro y la tarea sigue en running. Hay un cache de 500 ms para no leer la base de datos en cada paso. Cada checkpoint escribe el estado parcial con un compareAndSwap que exige que el lease sea el nuestro. Si el checkpoint falla, se lanza LostLeaseError y la tarea vuelve a la cola sin corromper nada.
## III.3. SOPExecutor: procedimientos declarativos

Un SOP es JSON: id, name, description, category, trigger, steps, allowedTools. Cada step declara id, title, tool, prompt, params, when, required. El allowedTools es un enum cerrado: solo se pueden usar las 15 tools conocidas. El sopSchema.superRefine rechaza ids duplicados.

El SOPExecutor recorre los steps en orden. Antes de cada paso, evalua su condicional when (si esta declarado) interpolando la plantilla con los resultados previos. Si el resultado es falsy (vacio, cero, false), el paso se marca skipped y se continua. Si el paso falla y required es true, se lanza el error y el SOP falla. Si required es false, el paso se marca skipped con el motivo.

Hay cinco tools especiales: ask_user pausa el SOP y devuelve waiting_input; prepare_email y prepare_event crean ActionProposal y devuelven waiting_approval; computer_command ejecuta en el sandbox; query_business lee de la base de datos de negocio; llm_generate llama al modelo y devuelve texto. Cuando un SOP se reanuda tras una aprobacion, el approvalResult que aprobo el cliente se pasa al step como input y se consume.

Los SOPs pueden anidarse. El sopStack guarda la pila de SOPs en ejecucion. Si la pila supera 4 niveles, se aborta. Si un SOP ya esta en la pila, se aborta por ciclo.

Cada paso escribe un Thought en el kernel si esta activo: los reads como observation, los writes como action. Al terminar el SOP, se cierra el turno y se promueve. El kernel no puede romper el SOP: cualquier fallo se ignora en silencio.

Los triggers de SOP son: manual, api, cron (every:Nm, every:Nh, daily:HH:MM, weekly:DOW:HH:MM), email_subject y email_body_match. El SOPTriggerEvaluator corre desde maintain() cada minuto y comprueba si algun SOP debe dispararse. Los disparos se deduplican por idempotencyKey.
## III.4. Kernel cognitivo: turnos, pensamientos, atencion

El kernel es un grafo cognitivo separado del motor durable. Cada interaccion con el sistema (un mensaje del usuario, una tarea, un SOP) es un Turn. Cada turno agrupa Thoughts. Cada Thought tiene un autor (user, fast-llm, slow-llm, worker, presenter, system), un rol (intent, observation, reasoning, response, action, reflection, display, delegation, critic, verifier, query, confirmation, correction), un contenido, y un AttentionVector.

El AttentionVector es lo que distingue al kernel de un log: registra que miraba el autor cuando escribio el Thought. Tiene primary, secondary, query, matched con pesos y razones, ignored con razones, y metadata. Dos autores pueden mirar cosas distintas sobre el mismo input, y el sistema lo sabe.

El TurnStore tiene dos implementaciones: InMemoryTurnStore para desarrollo y tests, y StoreTurnStore persistente con transacciones. La persistente valida tenantId en cada operacion, limita a 500 thoughts por turno, y cierra recursivamente los hijos abiertos.

El AuditStore es append-only con cadena de hashes SHA-256. Cada entrada incluye previousHash y hash. verify() recorre la cadena y confirma que no se ha modificado nada. InMemoryAuditStore para dev, StoreAuditStore para produccion.

El Promoter aplica reglas explicitas al cerrar el turno: solo los thoughts con rol accionable y contenido sobreviven. Cada superviviente tiene un destino explicito: response (al usuario), memory (a la memoria del agente), business-graph (a las entidades), audit (solo rastro), o discard. La consolidacion detecta duplicados por hash de contenido y contradicciones por negacion explicita, ambas deterministicas.

Meta es un motor de metaconsciencia con 4 reglas: slow_ready_fast_idle (el slow termino mientras el fast estaba ocioso, inyectar al proximo turno), slow_long_no_output (el slow lleva mas de 30s sin emitir, contestar con presencia), slow_failed_urgent (el slow fallo, avisar), nothing_to_report (no hay nada relevante, no interrumpir). El Presenter elige por prioridad de rol que thought presentar al usuario. Los ProgressEvent permiten al slow hacer saber al fast que sigue trabajando.
## III.5. EventBus: la espina dorsal

El EventBus es append-only estricto. Cada evento es un SystemEvent con id ULID (ordenable por tiempo), schemaVersion, tenantId, owner, type, source, payload, emittedAt. Los tipos de evento son un enum cerrado: task, sop, action, monitor, system, auth, entity, relation, policy, state, agent, context. Cada tipo tiene su schema Zod en payloadSchemas, que se valida al emitir. Si anades un tipo al enum y no al schema, TypeScript no compila.

El StoreSink escribe con insertIfAbsent en el kind system-events, bajo la clave tenantId:owner. El StoreQuery lee con filtros por tipo, por sourceId, por ventana temporal, y agrega por tipo. El dedupe es explicito: solo deduplica si el emisor pasa dedupeKey. Sin dedupeKey, cada emision es un hecho nuevo. Los emisores factuales (entity.updated, relation.created) no pasan dedupeKey porque cada emision es un hecho que no debe descartarse. Los emisores de ruido (maintenance, reintentos) si la pasan.

El SchemaRegistry existe aunque hoy solo haya una version por tipo. Manana, cuando un tipo evolucione a 1.1, ambos registros conviviran y los eventos viejos seguiran validando contra 1.0.

Los exporters de futuro (Kafka, OTel) estan declarados como interfaces vacias. Cuando entre Kafka, implementa EventSink y publica en topic openmuse.events.<owner>. La firma HMAC se anade ahi, no en el bus. OTel es un consumidor: lee del sink y convierte cada evento en un span, con traceId generado en el exporter, no en el evento.
## III.6. Store y TenantScopedStore: la persistencia

El Store es la unica capa que habla con la base de datos. Usa una tabla unica: records con PK compuesta (owner, kind, id) y columna data jsonb. No hay tablas especificas por entidad. Un Goal, una tarea, un SOP, una memoria, un Thought, una entidad de negocio: todo vive en records con un kind distinto.

El backend es PGlite embebido en desarrollo y Postgres real en produccion. La decision es transparente para el resto del codigo: Store.backend devuelve pglite o postgres, y solo el RAG lo consulta (para saber si puede usar pgvector).

Las primitivas del motor son: put, get, list, listPaged, count, remove, compareAndSwap, insertIfAbsent, claim, take, scan, scanByStatus, scanByStatusWithCursor, purgeOlderThan, transaction, select, rawQuery, recoverInterruptedActions. Cada una tiene su proposito: compareAndSwap para leases, claim para aprobaciones, insertIfAbsent para deduplicar, transaction para atomicidad multi-paso.

El TenantScopedStore envuelve al Store y aisla todos los accesos con una clave compuesta: ${tenantId}:. El resolver recibe un owner y devuelve el tenantId. Dentro, cada operacion sustituye el owner por la clave compuesta y delega en el Store real. Asi dos tenants con el mismo owner logico no colisionan. El aislamiento es responsabilidad de esta capa, no del resto del sistema.

TenantService resuelve el tenantId de un owner con una cache TTL de 5 minutos. Si no hay fila de membership, devuelve default. Si hay, la devuelve. La cache se invalida al cambiar de tenant. El kernel, el chat, los SOPs y los builds lo consultan antes de cada operacion.

Los helpers de transaccion son: withTransaction (envuelve un callback en BEGIN/COMMIT/ROLLBACK), upsertIdempotent (insertIfAbsent + get, cierra la carrera get+put), y withIdempotency (registra el resultado de una operacion para que reejecutarla sea barato).
## III.7. AuditStore: cadena de hashes

El AuditStore es append-only. Cada entrada es una AuditEntry con id, tenantId, owner, action, actor, payload, previousHash, hash, timestamp. La accion es un enum cerrado: turn.opened, turn.closed, turn.promoted, thought.appended, thought.promoted, thought.discarded, cromo.created, cromo.updated, cromo.deleted, field.recalculated, promotion.executed.

La cadena funciona asi: cada entrada incluye el hash de la anterior. Si alguien modifica una entrada, el hash cambia y la cadena se rompe. verify(tenantId) recorre toda la cadena y comprueba que cada previousHash coincide con el hash de la entrada previa, y que cada hash coincide con el calculo local.

El InMemoryAuditStore guarda las entradas en memoria, por tenant. Es lo que se usa en desarrollo y tests. El StoreAuditStore usa transaction() para que lastHash y put sean atomicos: sin esto, dos procesos concurrentes podrian leer el mismo lastHash y escribir dos entradas con el mismo previousHash, rompiendo la cadena.

El derecho al olvido (SOC-2 Privacy) no borra entradas: anade una entrada anonymized que apunta a la original. La cadena se mantiene intacta. El audit trail nunca se borra: se enmascara.

## III.8. Guardrails y cuotas

El GuardrailService controla los limites duros por tenant. Hay seis cuotas: tokensPerDay, tasksActive, tasksPerHour, eventsPerDay, turnsActive, costEurPerDay. Los valores por defecto son 1M tokens, 10k tareas activas, 500 tareas por hora, 100k eventos por dia, 100 turnos activos, 50 EUR por dia.

Los checks se aplican en tres sitios: en createTask antes de crear, en recordUsage despues de registrar el consumo, y en cualquier otra operacion que declare su coste. Cuando se supera una cuota, la operacion se rechaza con un AppError 429. El admin puede cambiar las cuotas por tenant con un endpoint.

Los guardrails de build son un caso especial: buildsActive (maximo 3 a la vez), buildsPerDay (maximo 20), buildCostEurPerDay (maximo 5 EUR), buildWallClockMinutes (maximo 30 minutos por build), buildIterations (maximo 5 iteraciones), buildEscalationsPerWeek (maximo 3 por cliente). Cuando se supera cualquiera, el build se marca paused y se emite build.escalated.
---

# Tomo IV — Capacidades

## IV.1. RAG: recuperacion hibrida

El RAG vive en engine/rag.ts. Ingiere texto plano, lo trocea en chunks con solapamiento (900 caracteres por chunk, 120 de overlap), genera embeddings con text-embedding-004 de Google, y los guarda en el kind rag-chunks. Cada chunk tiene id, sourceId, sourceName, chunkIndex, text, embedding, createdAt.

La busqueda es hibrida: 70% coseno + 30% BM25 normalizado. El coseno mide similitud semantica, BM25 mide coincidencia de palabras clave. El resultado final es la media ponderada, ordenada por score descendente. Hay un top limit (default 5) y un hard cap (20).

Hay dos backends. En PGlite (desarrollo) no hay pgvector, asi que la busqueda recorre todos los chunks con keyset pagination de 500 en 500, calcula coseno y BM25 en JS, y se queda con los mejores. En Postgres real (produccion), si la extension vector esta instalada, la busqueda se hace en SQL con data->'embedding' <=> ::vector y el indice ivfflat. Si la consulta falla por cualquier motivo, cae al recorrido en JS sin romperse.

La ingesta es automatica en tres sitios: al subir un fichero de texto desde Files, al terminar un SOP con artefacto (con sourceId rtifact:<id> para que sea idempotente entre reejecuciones), y al leer un documento largo de Drive. Ademas hay un reintento de embeddings huerfanos en maintain() cada pocos minutos, y una deduplicacion de memorias cada 5 minutos.

## IV.2. Memoria: hechos curados

La memoria es distinta del RAG. El RAG guarda fragmentos de documentos. La memoria guarda hechos curados con categoria: empresa, cliente, proceso, preferencia, rrhh, producto, otro, y las cuatro de rol (rol-identidad, rol-dominio, rol-preferencias, rol-historial).

Cada memoria es un AgentMemory con id deterministico por hash de texto normalizado (lowercase, espacios colapsados). Si dos veces se intenta guardar la misma memoria, la segunda no crea nada: insertIfAbsent. Esto es lo que evita que el sistema se llene de duplicados.

La recuperacion (recall) combina RAG y memoria. La query se reformula con el historial de las ultimas dos interacciones. Los umbrales de confianza son LOW_CONFIDENCE=0.4 y HIGH_CONFIDENCE=0.7. Si hay hits con score alto, se usan solo esos. Si no, se usan los que pasan el umbral bajo. Si no hay nada, se avisa al caller con lowConfidence=true.
## IV.3. Business Graph: entidades y relaciones

El Business Graph es el modelo de negocio del cliente. Cada entidad es un BusinessEntity con id, type, name, status, properties, schemaVersion, version monotona, provenance. Cada relacion es un BusinessRelation con fromEntityId, toEntityId, type, properties, provenance. La provenance dice quien, cuando y con que confianza.

No es un modelo relacional. Es un grafo: las entidades se conectan por relaciones declaradas por el cliente, y la cardinalidad (one-to-one, one-to-many, many-to-many) es metadata, no una restriccion del motor. Esto permite que el mismo motor soporte un CRM, un ERP ligero, un pipeline de ventas, o cualquier otro modelo que el cliente declare.

El createEntity compone con el EntityResolver: si el payload tiene un CIF, un email o un nombre que coincide con una entidad existente con confianza alta, devuelve la existente en vez de crear un duplicado. Esto se aplica solo si el caller no pasa un id explicito.

El BusinessTruth proyecta una entidad con su procedencia por propiedad. Cada propiedad tiene su TruthValue: valor, source, actor, updatedAt, confidence. Cuando hay conflictos entre dos fuentes (por ejemplo, CRM y ERP dicen cosas distintas), el TruthResolver decide cual gana y deja constancia del conflicto.

Las maquinas de estado gobiernan el status de las entidades. Un StateMachine declara los estados validos y las transiciones permitidas. Al intentar cambiar el status, se verifica que la transicion este declarada, que el roleId del caller sea el correcto si la transicion lo exige, y que el entityType coincida con el de la maquina. Todo cambio emite state.changed al bus, y todo rechazo emite state.transition_denied con la razon.

## IV.4. Motor de politicas

El PolicyEngine decide si un rol puede hacer una accion sobre un recurso. Un rol sin permisos declarados se comporta como hoy: todo permitido dentro de sus SOPs. Un rol con permisos declarados es una allowlist adicional: solo puede hacer lo que declara. Cada evaluacion emite policy.evaluated al bus con la decision, y cada denegacion emite policy.denied con la razon.

El AgentGovernance es una capa sobre el PolicyEngine que se llama antes de cada tool. Si el rol declara allowedTools y la tool no esta en la lista, se rechaza. Si no la declara, se consulta al PolicyEngine con resource 	ool:<nombre>. Esto es lo que evita que un rol de contenido pueda llamar a una tool de finanzas.
## IV.5. Motor de reacciones

El ReactionEngine lee del bus y ejecuta ReactionRules. Cada regla tiene trigger (eventType + filter), condition opcional, y una lista de acciones (create_task, create_goal, notify, handoff, run_sop, call_capability). Las reglas se cargan por tenant al arrancar (SERVICE_REACTIONS_LOAD_V1) y se persisten en el kind reactions. Cuando llega un evento, el engine comprueba las reglas del tenant, evalua la condicion con un matcher minimo, y ejecuta las acciones via el executor inyectado.

El executor ejecuta cada accion en un try/catch independiente: si una accion falla, las demas siguen. Cada accion llama al service correspondiente (createTask, createGoal, notify, handoff.create, etc.). Si no hay executor o no hay reglas, el engine no hace nada. El kernel no depende de esto: si falla, no rompe.

## IV.6. Orquestador: Goal a Outcome

El BusinessOSOrchestrator ejecuta el ciclo completo: Goal, Context, Plan, Execute, Verify, Learn, Replan. El endpoint POST /api/agent/goals/:id/run lo dispara. El proceso es: assemble context (ContextEngine + RAG + memoria), list capabilities (CapabilityRegistry filtrado por tag), plan (LlmPlanner con fallback al StubPlanner), execute (Executor con retry y compensacion), verificar (DeterministicVerifier, y LlmVerifier como segunda capa), observar (LearningObserver guarda hechos, patrones y fallos), y replanificar (LlmReplanner si el verificador fallo).

El Planner real usa BuiltInAgent con un prompt que pide un array JSON de pasos. El Replanner recibe el plan anterior, el paso fallido y el error, y produce un plan nuevo. El Verifier deterministico comprueba cada criterio de exito del Goal contra las metricas del Outcome: si falta una metrica o no cumple el operador, se marca failed. El LlmVerifier solo se llama si el deterministico fallo y hay evidencia disponible.

El LearningObserver guarda tres cosas: hechos (LearningFact), patrones (LearningPattern) y fallos (FailureLesson). Cuando un patron tiene successCount >= 5, se promueve a procedural-learning con status proposed, y queda pendiente de aprobacion humana. Cuando un fallo se repite, se acumula el contador de occurrences.
## IV.7. Capabilities: contrato de lo ejecutable

Una Capability es una unidad ejecutable con contrato explicito: id, version, name, description, kind (tool, skill, sop, composite), inputs, outputs, preconditions, sideEffects, permissions, risk (low, medium, high, critical), cost (timeMs, tokens, currencyEur), idempotency (idempotent, at-most-once, at-least-once), retryable, compensatable, compensationId, requiresApproval, tags.

El sideEffect declara que tipo de cambio produce: read, write, external_write, notification. Cada uno tiene target y si es reversible. Esto es lo que permite al sistema saber antes de ejecutar si algo tiene que pasar por aprobacion humana. Un send_email tiene external_write con reversible=false, asi que requiere aprobacion. Un read_mail_thread tiene read con reversible=true, asi que no requiere aprobacion.

El CapabilityRegistry es un mapa en memoria que se rellena al arrancar (bootstrapCapabilities). Hay 15 tools declaradas (read_mail_thread, read_workspace, import_pdf, inspect_pdf, fill_pdf, prepare_email, prepare_event, read_web, save_artifact, ask_user, computer_command, query_business, recall_memory, llm_generate, transition_entity) y 4 composites (run_sop, send_email, send_whatsapp, create_calendar_event).

El CapabilityRunner ejecuta una capability por id. Recibe el ExecutionContext y el PlanStep, busca la capability en el registry, busca el ToolExecutor con el mismo id en el mapa de executors, y lo llama. Si no encuentra la capability, falla. Si no encuentra el executor, falla. El ToolExecutor es la implementacion real: lee del workspace, escribe un artefacto, llama al modelo, etc.

## IV.8. Acciones y aprobaciones

El ActionService es el guardia de las acciones externas. Cualquier send_email, create_event, delete_drive_file pasa por ActionService.propose, que crea un ActionProposal con hash unico, expiresAt de 30 minutos, y estado awaiting_review. El hash liga la propuesta al contenido, a la cuenta de Google conectada, y a la version del recurso remoto.

Cuando el usuario decide, se llama decide(approve|deny). El claim es atomico con compareAndSwap sobre el estado awaiting_review. Si el usuario aprueba, se ejecuta la accion y el estado final se guarda. Si el usuario deniega, el estado es denied. Si el usuario tarda mas de 30 minutos, el estado es expired.

Hay un estado especial: outcome_unknown. Se usa cuando la peticion se fue al proveedor pero la respuesta se perdio. La accion no se reintenta automaticamente: el usuario tiene que revisarla y decidir. Esto es lo que evita que una accion se ejecute dos veces por accidente.

Todas las acciones emiten al bus: proposed, approved, denied, executed, failed, outcome_unknown. Cada emision lleva actionId, title y kind. El endpoint GET /api/events permite filtrar por tipo y por sourceId.
## IV.9. Sandbox computer

El sandbox computer es un contenedor Docker por owner. Imagen minima: node, python3, bash, git. Limites duros: 512 MB RAM, 1 CPU, 128 procesos, 64 MB de tmpfs con noexec, red apagada, read-only root filesystem, sin host mounts, sin Docker socket. El volumen /workspace es persistente y compartido solo con ese owner.

El files.py dentro del contenedor implementa una API de ficheros por stdin JSON. Rechaza symlinks, paths con .. y ficheros que no sean regulares. Los limites de tamano son 256 KB para texto y 10 MB para PDF.

El ComputerService orquesta el ciclo de vida: start (crea o arranca), stop (para y guarda), execute (corre un comando con timeout 30s, kill-after 2s, output cap 128 KB), list, read, write, mkdir, writePdf, pdfBytes. Cada operacion usa un lease exclusivo para que dos operaciones no pisen el mismo workspace. Si una operacion falla, el contenedor se deja en un estado seguro y el sistema emite un evento con el error.

El runDocker es el unico proceso host que el servicio puede lanzar. No hay fallback a shell del host. Los comandos del usuario se pasan a bash dentro del contenedor via argv, no via shell del host. Esto es lo que garantiza que un comando malicioso no escape.

La verificacion de aislamiento es estricta. Antes de adjuntarse a un contenedor existente, el servicio inspecciona el contenedor con container inspect y valida 15 propiedades: usuario, working dir, labels, entrypoint, cap-drop, no-new-privileges, network none, memoria, swap, pids limit, cpu limit, binds vacios, devices vacios, port bindings vacios, ipc privado, restart policy no, tmpfs correcto, mount del volumen correcto. Si algo no coincide, rechaza adjuntarse y no ejecuta nada.

## IV.10. Browser worker

El browser worker es un proceso Playwright separado del API. Corre con su propio token (WORKER_TOKEN, minimo 32 caracteres) y su propio puerto. El API le habla por HTTP con Authorization Bearer. El worker no recibe credenciales del API ni del cliente: solo crea sesiones de Chromium, navega, hace clicks, y descarga PDFs.

Los limites: 3 sesiones activas a la vez, 20 perfiles guardados, 30 minutos de idle antes de cerrar. Cada sesion tiene su propio perfil de Chromium persistente. Los PDFs descargados viven en disco y se pueden importar al Files del API.

La red es el punto critico. El worker solo permite destinos publicos HTTP(S) en puertos 80 y 443. Cada vez que se navega o se hace un subrequest, se valida el destino: se resuelve el DNS, se comprueba que la IP resultante sea global unicast (no loopback, no privada, no multicast, no documentacion, no reserved), y se conecta a esa IP exacta con un proxy interno que evita el DNS rebinding. Si una respuesta DNS contiene cualquier IP privada, se rechaza la peticion entera.

El proxy EgressProxy es un servidor HTTP en loopback que recibe las peticiones de Chromium y las reenvia tras validarlas. HTTPS se maneja con CONNECT. QUIC y WebRTC UDP estan deshabilitados. Playwright lanza Chromium sin su sandbox interno, asi que el aislamiento real es el contenedor Docker del worker, no el navegador.
## IV.13. Agentes del chat

El ConversationAgent es el unico agente de chat del sistema. Extiende AbstractAgent de AG-UI. En cada run(), abre un turno en el kernel, escribe el mensaje del usuario como Thought(intent), consulta el RAG y la memoria, llama al modelo con las memorias del rol activo y el contexto urgente, recibe la respuesta, la escribe como Thought(response), y cierra el turno con Promoter.promote.

Las tools del chat incluyen browse_web (leer una URL publica con el browser worker), search_mail y read_mail_thread (buscar y leer emails), search_drive_files y read_drive_file (buscar y leer de Drive), delegate_task (delegar un trabajo durable al worker), create_goal (crear un objetivo), watch_page (programar una vigilancia), remember_fact (guardar un hecho), prepare_whatsapp (preparar un mensaje de WhatsApp), list_pending_approvals (ver aprobaciones pendientes), recent_events (resumen de eventos de las ultimas N horas), system_health (estado del sistema), who_is_doing_what (resumen de tareas activas por usuario), y create_briefing (crear un briefing persistente).

Adicionalmente, con el equipo digital activo, tiene get_schedule, edit_schedule y get_team. Y con el Arquitecto, tiene create_build, list_builds y approve_build.

El prompt del chat sigue 8 reglas duras de tono: maximo 3 frases salvo que se pida detalle, nunca mencionar terminos internos (capability, workflow, SOP, kernel, runtime), traducir todo a lenguaje natural, nunca explicar lo que vas a hacer (hazlo y reporta), nunca decir puedo (di lo hago o no puedo), terminar con pregunta cuando sea util, nada de emojis ni markdown decorativo, nada de Perfecto/Genial/Excelente.

## IV.14. Proveedores de modelo

El sistema soporta cadenas de modelos. El primario es configurable con MODEL (por defecto google/gemini-3.6-flash), el fallback con MODEL_FALLBACK (por defecto openai/<openrouter-model>). El modelChain construye la lista y runWithModelFallback prueba uno por uno hasta que alguno emita output visible para el cliente.

La clave del fallback es que solo se activa si el primario falla ANTES de emitir el primer token. Una vez que el modelo empezo a responder, no se cambia a mitad de respuesta. Esto evita que un cliente vea dos respuestas mezcladas.

generateText es la funcion one-shot que usan el llm_generate de los SOPs, el LlmPlanner, el LlmReplanner y el LlmVerifier. Recibe un prompt y un contexto, lanza el modelo con un timeout, y devuelve el texto. Sin modelo configurado, lanza un error honesto en vez de inventar.

## IV.15. La capa HTTP

El API es Hono. Las rutas estan agrupadas por area: agent, events, skills, sops, auth, rag, threads, projects, computer, business, kernel, admin, admin/clients, schedule, metrics. Cada grupo vive en su propio fichero y expone un Hono con Variables.owner para el owner autenticado.

El middleware de auth corre antes de todas las rutas /api/* salvo auth/login y auth/logout. Resuelve el owner desde el Bearer token o desde la URL firmada (para ficheros y previews). El onError captura AppError, ZodError, PdfError y genericos, y devuelve un JSON consistente con el campo error y opcionalmente fields.

Los rate limits son por IP y por email (login), por IP (session), y por tenant en las operaciones internas. El bodyLimit limita a 12 MB por peticion. Los CORS aceptan solo los origins declarados en config.
---

# Tomo V — Producto extendido

## V.1. El equipo digital: 16 empleados con contrato

El equipo digital es el producto vendible. Dieciseis empleados, cada uno con un nombre, un oficio, un tono, un horario laboral de 15 horas diarias de lunes a viernes, un conjunto de SOPs asignados, y cuatro memorias vivas: identidad, dominio, preferencias e historial. La identidad es el canon publico del personaje. El dominio son hechos tecnicos de su oficio. Las preferencias son como le gusta al dueno que trabaje. El historial es lo que aprende con el uso.

Cada empleado tiene su WeeklySchedule: 5 dias laborables, un slot de manana de 9 a 14, una pausa de 14 a 15, y un slot de tarde de 15 a 19. Eso son 9 horas productivas por dia por empleado. Multiplicado por 16 empleados y 5 dias, el equipo cubre 720 horas semanales de trabajo digital. El dueno puede ajustar el horario de cualquier empleado desde el chat, desde la ficha, o desde el planificador con drag & drop.

Cada empleado tiene su DayPlan: un plan diario con los items que va a ejecutar, con hora de inicio y fin. Los SOPs recurrentes del rol y las tareas pendientes asignadas al rol se empaquetan automaticamente en los slots disponibles. El plan se publica cada noche para el dia siguiente. Si el dueno abre el workspace por la manana, ve exactamente que va a hacer cada empleado hoy, y puede mover, borrar o anadir items.

## V.2. Ficha del empleado

La ficha del empleado digital muestra: nombre, avatar, tono, ROI (que le ahorra al dueno), objetivo (el personaje completo), memorias vivas (las cuatro, editables), SOPs asignados, permisos declarados, y estado en vivo (que esta haciendo ahora, que espera OK, actividad reciente). Todo en una sola pantalla. El dueno puede editar cualquier campo desde ahi o desde el chat. Cambiar la memoria de preferencias de un empleado cambia como trabaja inmediatamente, sin redeploy.

La ficha es tambien el contrato: horas semanales planificadas, SLA de respuesta por tipo de trabajo, coste estimado al mes, y si tiene acceso al Arquitecto para SOPs custom. Eso es lo que el cliente ve cuando pregunta 'que hace este empleado y cuanto cuesta'.

## V.3. Planificador semanal

El planificador es un calendario semanal y diario. Arriba, la rejilla de la semana con los slots de trabajo por dia. Abajo, el plan del dia seleccionado con sus items y su estado (planned, running, waiting, done, failed, over-quota). El dueno puede mover un slot con un click, borrar un slot con click derecho, cambiar el timezone del empleado, y ajustar los maximos de horas semanales y diarias.

El planificador es tambien la ventana a lo que el sistema va a hacer. Si un SOP recurrente esta programado para las 9 de la manana, aparece a las 9. Si una tarea pendiente se ha asignado al empleado, aparece en el primer slot libre. Si el dueno anade una tarea manual, se empaqueta en el siguiente hueco. Todo transparente.
## V.4. Workspace de equipo

El workspace de equipo es la rejilla de los 16. Cada tarjeta muestra: avatar con el color del estado, nombre, id del rol, estado (trabajando, esperando OK, ocioso, bloqueado, fuera de turno), horas del dia, y el titulo de la tarea actual si la hay. Arriba, cuatro KPIs: cuantos trabajando, cuantos esperando OK, cuantas completadas hoy, cuantas fallidas. Clic en una tarjeta abre la ficha; un segundo boton abre el planificador.

La rejilla se refresca cada 10 segundos. El estado de cada empleado se calcula en vivo a partir del DayPlan del dia y del estado de sus tareas. Si un empleado tiene una tarea running, esta working. Si tiene una waiting_input o waiting_approval, esta waiting. Si tiene una tarea failed reciente, esta blocked. Si tiene un plan pero nada corriendo, esta idle. Si no tiene plan, esta off.

## V.5. El Arquitecto: construir SOPs, skills y pipelines

El Arquitecto es un servicio del sistema, no un empleado del tenant. No aparece en la rejilla del cliente. Vive en el plano de operacion de OpenMuse y se activa cuando el cliente pide algo que ninguno de los 16 sabe hacer.

El cliente pide desde el chat: 'Necesito un proceso para recordar pagos fraccionados a clientes con mas de 5 facturas al ano.' El chat llama a create_build, que crea un BuildSpec con status queued. El worker reclama la tarea con kind=build y llama al BuildService.run. El BuildService hace el ciclo: consulta el catalogo por RAG, elige el template mas parecido, rellena los huecos con el LLM, valida con Zod, escribe y testea en el sandbox, itera hasta 5 veces, y produce un BuildArtifact con payload, tests, logs, iteraciones, coste y duracion. Cuando converge, el BuildSpec pasa a ready_for_review y el cliente ve un modal con el artefacto, los tests que han pasado, y un boton 'Aprobar y activar'. Si el cliente aprueba, el artefacto se aplica al tenant (el SOP se registra, la capability se anade al registry, la vista se sirve).

El Arquitecto no toca el engine. Solo produce artefactos declarativos: SOPs JSON, capabilities JSON con un DSL cerrado, schemas, vistas, roles. Si un build requiere codigo TS nuevo en el engine, el Arquitecto no lo intenta: escala al operador. Eso es lo que garantiza que el sistema sea seguro y auditable.
## V.6. Libreria semantica de templates

La libreria vive en packages/catalog. Cinco subdirectorios: sop, capability, schema, skill, view. Cada uno tiene un template.json con los campos vacios, un example.json con un ejemplo real, un README.md que explica el contrato, y opcionalmente tests. Los templates se ingestan al RAG con sourceId catalog:<kind>:<id> para que el Arquitecto encuentre el mas parecido a la peticion del cliente.

El template de SOP tiene los campos id, name, description, category, trigger, active, steps, allowedTools. El de capability tiene id, version, name, description, kind, inputs, outputs, preconditions, sideEffects, permissions, risk, cost, idempotency, retryable, compensatable, requiresApproval, tags. El de schema tiene id, tenantId, entities, relations. El de skill tiene id, entrypoint, requirements, description, inputs, outputs, tests. El de view tiene id, kind, title, subtitle, columns, rows, provenance.

Cuando el Arquitecto construye, primero busca en el catalogo por similitud semantica. Si encuentra un template con score alto, lo usa como base y solo rellena los huecos con el LLM. Eso reduce el espacio de generacion a un 5% y elimina el 90% de las alucinaciones. Si no encuentra template, escala al operador con reason template_missing.

Cada vez que un build se aprueba y funciona en produccion, se puede promover a template del catalogo. Eso hace que el sistema crezca solo: cuanto mas se usa, mas templates tiene, y mejor construye.

## V.7. Bucle de construccion con sandbox

El bucle completo de un build tiene 6 fases: planificacion, generacion, validacion, testeo, iteracion y cierre. La planificacion elige el template. La generacion llama al LLM con el template, el goal y los errores previos. La validacion pasa el payload por el schema Zod correspondiente al kind. El testeo escribe el artefacto al sandbox y corre los tests. La iteracion repite hasta 5 veces si algo falla. El cierre produce el BuildArtifact y lo pasa a ready_for_review.

Los limites duros son: 5 iteraciones, 30 minutos de wall clock, 5 EUR de coste, 3 builds activos por tenant, 20 builds por dia por tenant, 3 escalaciones por semana por cliente. Cuando se supera cualquier limite, el build se marca paused y se emite build.escalated con la razon. El dueno del tenant ve un aviso en el chat y un item en el Centro de Control.

El sandbox es el mismo computer del sistema: contenedor Docker por owner, 512 MB RAM, sin red, sin host mounts, con Python, bash y git. Los tests del skill se ejecutan dentro. Si el skill necesita dependencias, se instalan offline desde apps/computer/wheels. Si falta un wheel, el build falla honestamente con un mensaje que dice exactamente cual falta y como anadirlo.
## V.8. Escalacion al operador

Cuando un build no converge, el sistema escala al operador. La escalacion se guarda en el kind build-escalations con razon, detalle, email del operador, y timestamps. El email sale por Resend si esta configurado. Si no lo esta, el evento queda en la DB para que el operador lo vea en el panel.

Las razones de escalacion son cinco: iterations_exhausted (el LLM no produce un artefacto valido en 5 intentos), cost_exceeded (se supero el coste maximo), wall_clock_exceeded (se supero el tiempo maximo), missing_input (el LLM necesita un dato que no tiene), template_missing (no hay template en el catalogo para el kind pedido), unknown_error (cualquier otra cosa).

El operador accede a GET /api/admin/tenants/:tenantId/escalations para ver las abiertas, y a POST /api/admin/tenants/:tenantId/escalations/:id/resolve para resolverlas. Cuando resuelve una, puede pedir al Arquitecto que lo reintente con el input que le falta, o cerrar el build como failed.

## V.9. Guardrails de build

Los guardrails del Arquitecto son una extension de GuardrailService. Ademas de las cuotas generales del tenant (tokens, tareas, eventos, turnos, coste), hay cuotas especificas de build: buildsActive (maximo 3 a la vez), buildsPerDay (maximo 20), buildCostEurPerDay (maximo 5), buildWallClockMinutes (maximo 30), buildIterations (maximo 5), buildEscalationsPerWeek (maximo 3).

Cuando se supera una cuota, el build se marca paused y se emite build.escalated. Nunca se ignora en silencio. El operador puede cambiar la cuota por tenant con un endpoint admin si un cliente necesita mas margen.

## V.10. Learning: como el equipo mejora con el uso

El LearningObserver corre al cerrar cada tarea con Outcome. Guarda tres tipos de informacion: hechos (LearningFact), patrones (LearningPattern) y fallos (FailureLesson). Los hechos son fragmentos curados del resultado. Los patrones agrupan por firma de plan (los capabilityId concatenados) y cuentan exitos y fallos. Los fallos agrupan por firma de error y cuentan ocurrencias.

Cuando un patron alcanza 5 exitos, se promueve a procedural-learning con status proposed. Aparece en el ImprovementQueue del cliente como sugerencia: 'este flujo funciona bien, quieres convertirlo en SOP?'. Si el cliente lo aprueba, se convierte en SOP y se asigna al rol correspondiente. Si lo rechaza, se marca como dismissed y no se vuelve a proponer.

Cuando un fallo alcanza 3 ocurrencias, se propone una regla de prevencion: 'esto falla siempre por la misma razon, quieres anadir un paso de validacion?'. El cliente decide. Esto es lo que hace que el equipo digital mejore con el uso sin que el cliente tenga que programar nada.
## V.11. El operador: rol humano en el sistema

El operador es el humano que esta detras de OpenMuse. No es un empleado del cliente. Es quien garantiza que el Arquitecto no la lía, quien resuelve escalaciones, quien da de alta tenants nuevos, y quien vigila la salud del sistema. En un deployment pequeño, el operador es una sola persona. En uno grande, es un equipo.

El operador tiene acceso al panel /api/admin/clients, que lista todos los clientes del repo, su estado real en la DB del tenant, y su configuracion. Puede dar de alta un cliente nuevo con provision-client, ver las escalaciones abiertas, resolverlas, aprobar o rechazar builds que no convergen, y ver el estado general del sistema.

El operador recibe email cuando un build escala. En el email ve el tenant, el buildId, la razon y el detalle. Desde ahi puede abrir el panel, inspeccionar el artefacto parcial, y decidir. Eso cierra el ciclo: el cliente pide, el Arquitecto construye, y si no converge, el operador entra y lo cierra a mano.

## V.12. Como crece el sistema con el uso

El sistema tiene cuatro mecanismos de crecimiento. Primero, el catalogo de templates crece: cada build aprobado se puede promover a template del catalogo. Segundo, las memorias de rol crecen: el LearningObserver anade hechos al historial de cada rol cuando un SOP funciona o falla. Tercero, los SOPs crecen: los procedural-learning se convierten en SOPs cuando el cliente los aprueba. Cuarto, las capabilities crecen: nuevas tools que el operador escribe a mano o que el Arquitecto propone desde el catalogo.

Esto significa que un cliente que lleva 3 meses con el sistema tiene un equipo digital mas afinado que uno que acaba de empezar. Los SOPs mas usados estan mejorados, los fallos recurrentes tienen reglas de prevencion, y los templates se han enriquecido con casos reales. Esa es la ventaja competitiva acumulativa: el cliente no puede replicar esto con otro producto sin perder todo el historial.

## V.13. Estado real de este tomo

El equipo digital esta implementado: los 16 roles existen en el catalogo base, se seedean automaticamente al crear tenant, tienen WeeklySchedule y DayPlan, tienen ficha y planificador, y aparecen en el workspace del dueno. El Arquitecto esta implementado: crea builds, los ejecuta en sandbox, produce artefactos, los escala cuando no converge, y los aprueba el cliente. El LearningObserver corre. El catalogo de templates tiene los 5 templates base. El operador tiene panel y recibe email.

Lo que falta para el producto completamente afinado: mas templates en el catalogo (hoy hay 5, el objetivo son 30), la activacion automatica de un build aprobado por kind (hoy aprueba pero no despliega el artefacto en el registry de SOPs), y la integracion de todo esto con la UI de propuestas pendientes en el centro de control. Los tres son trabajo incremental, no rediseno.
---

# Anexos

## Anexo A. Estado real del repo

### Verde (funciona y esta probado)

- Motor durable: TaskWorker con leases, CAS, checkpoint, dedupe persistido.
- Kernel cognitivo: Turn, Thought, AttentionVector, AuditStore con hash chain, Promoter, Meta, Presenter, Consolidate.
- EventBus: tipos cerrados, schemas Zod, StoreSink append-only, StoreQuery con filtros, dedupe explicito.
- Store y TenantScopedStore: aislamiento por tenantId:owner.
- Multi-tenant: TenantService con TTL, cuotas por tenant, ficheros por tenant.
- SOPExecutor: pasos, when, ask_user, aprobaciones, nested SOPs, triggers.
- RAG: chunking, embeddings, busqueda hibrida coseno+BM25, pgvector con fallback.
- Memoria: dedupe por hash, categorias, recall hibrido.
- Business Graph: entidades, relaciones, EntityResolver, BusinessTruth, TruthResolver.
- Maquinas de estado: StateMachineEngine con guards, roles, entityType.
- Politicas: PolicyEngine, AgentGovernance con allowedTools.
- Reacciones: ReactionEngine con load al arranque y executor.
- Orquestador: BusinessOSOrchestrator con ciclo completo.
- Capabilities: CapabilityRegistry con 15 tools + 4 composites, ToolExecutor, CapabilityRunner.
- Acciones y aprobaciones: ActionService con hash, expiracion, OutcomeUnknownError.
- Sandbox computer: Docker aislado, files.py, ComputerService.
- Browser worker: Playwright, egress proxy, captura de PDFs.
- Google Workspace: OAuth PKCE, Gmail, Calendar, Drive.
- Skills Python: 9 skills built-in, ensureSkill, instalacion offline.
- Agentes del chat: ConversationAgent con todas las tools.
- Equipo digital: WeeklySchedule, DayPlan, ScheduleService, SchedulerService.
- Ficha del empleado, planificador, workspace de equipo.
- Arquitecto: BuildService, EscalationService, panel de operador.
- Catalogo de templates: 5 templates base.
- Interfaces dinamicas: 7 templates de ViewSpec.
- Signup directo sin verificacion.
- Panel maestro de clientes, backups por tenant, metrics exporter, release gate, rollback.
- Tests e2e: equipo digital, Arquitecto, aislamiento multi-tenant.
- Test de carga: 50 tenants.
- Documento: Tomo I a Tomo V.

### Amarillo (funciona pero con matices)

- LlmPlanner, LlmReplanner, LlmVerifier dependen de que haya modelo configurado. Sin modelo, caen al stub.
- El signup esta detras de SIGNUP_ENABLED=false por defecto.
- La activacion de un build aprobado no despliega el artefacto en el registry todavia. Aprueba pero no aplica.
- La resolucion de tenant por subdominio no esta implementada. Solo por slug del nombre.
- Multi-proceso: la separacion API/worker existe por variable de entorno pero no esta probada end-to-end en Docker Compose.

### Pendiente

- Mas templates en el catalogo (hoy 5, objetivo 30).
- Alta de empleados digitales adicionales desde el workspace.
- Integracion de builds pendientes con la UI de propuestas del Centro de control.
- Observabilidad Prometheus end-to-end (el endpoint esta, falta scraping).
- Tests de carga mas agresivos.
- Documentacion para el cliente final.

### Prohibido

- Reescribir TaskWorker, SOPExecutor, ActionService.
- Migrar records a tablas especificas.
- Meter dependencias nuevas sin justificar.
- Romper el frontend actual.
## Anexo B. Roadmap en bloques

### Cerrado

- FASE 0: cierre motor (Cline).
- FASE 1: interfaces dinamicas (I-1 a I-11).
- FASE 2: equipo digital backend (DG-1 a DG-6).
- FASE 3: equipo digital frontend (UI-DG-1 a UI-DG-4).
- FASE 4: Arquitecto backend (ARQ-1 a ARQ-6).
- FASE 5: Arquitecto frontend (UI-ARQ-1, UI-ARQ-2).
- FASE 6: signup sin verificacion (S-1 a S-7b).
- FASE 7: operacion (OPS-1 a OPS-6).
- FASE 8: tests e2e y hardening (E2E-1 a E2E-3, LOAD-1, HARD-1).
- DOC-1 a DOC-5: whitepaper completo.

### Siguiente

- DOC-6: anexo C (glosario).
- Activacion de builds aprobados por kind (SOP, capability, view, role).
- Alta de empleados digitales adicionales desde el workspace.
- Integracion de builds pendientes en Centro de control.
- Mas templates en el catalogo (objetivo 30).
- Pruebas end-to-end de multi-proceso con Docker Compose.
- Documentacion para el cliente final.

### Futuro

- Resolucion de tenant por subdominio.
- Marketplace de templates compartidos entre clientes.
- Observabilidad Prometheus + Grafana con dashboards predefinidos.
- Tests de carga a 200 tenants.
- Activacion de build multi-tenant (un build para varios tenants).
- Integracion con proveedores externos (Stripe, WhatsApp, GMB, redes sociales).
- App movil del dueno.

### Tiempo estimado para lo siguiente

- DOC-6: 15 minutos.
- Activacion de builds: 2-3 bloques, 1 dia.
- Alta de empleados: 2 bloques, 1 dia.
- Builds en Centro de control: 1 bloque, medio dia.
- Mas templates: 1 bloque por cada 5, ~1 semana.
- Multi-proceso e2e: 1 bloque, medio dia.
- Documentacion cliente: 1 bloque, 1 dia.

Total para cerrar lo siguiente: ~1 semana de trabajo enfocado.
## Anexo C. Glosario completo

**Goal**: estado deseado con criterios de exito, restricciones y prioridad. Se define en el contrato goalSchema.

**Outcome**: resultado estructurado de una ejecucion: estado, resumen, evidencia, metricas, si fue verificado y como.

**Capability**: unidad ejecutable con contrato explicito: inputs, outputs, side effects, riesgo, coste, idempotencia, requiere aprobacion.

**Plan**: secuencia versionada de pasos. Cada paso tiene una capability, inputs, dependencias, retry y compensacion.

**SOP**: tipo especial de plan declarado en JSON por el cliente. Pasos, tools permitidas, condicionales, triggers.

**Tenant**: cliente logico. Hoy un deployment por cliente. Manana varios en el mismo Postgres.

**Owner**: usuario dentro de un tenant. Todos los datos se escriben bajo owner, y TenantScopedStore los aisla por tenantId:owner.

**Runtime**: proceso efimero que ejecuta una tarea. Tiene runtimeId, roleId, taskId, correlationId, createdAt.

**Kernel**: grafo cognitivo que registra turnos, pensamientos y promociones. Es la ventana a lo que el sistema piensa.

**Turn**: agrupacion de pensamientos de una interaccion. Abre, recibe pensamientos, cierra, promueve.

**Thought**: unidad de pensamiento. Tiene autor, rol, contenido y AttentionVector.

**AttentionVector**: registro de que miraba el autor cuando escribio el Thought. primary, secondary, query, matched, ignored.

**Promoter**: aplica reglas explicitas al cerrar el turno. Decide que sobrevive y a donde va.

**Meta**: 4 reglas de metaconsciencia. Decide cuando el fast debe saber algo del slow.

**Presenter**: elige por prioridad de rol que thought presentar al usuario.

**EventBus**: append-only de eventos. Tipos cerrados, schemas Zod, dedupe explicito.

**Store**: la unica capa que habla con la base de datos. records con PK (owner, kind, id).

**TenantScopedStore**: envuelve al Store y aisla por tenantId:owner. Es la frontera de aislamiento.

**AuditStore**: audit trail inmutable con cadena de hashes SHA-256. verify() confirma la cadena.

**GuardrailService**: cuotas por tenant. tokens, tareas, eventos, turnos, coste, builds.

**RAG**: recuperacion aumentada por recuperacion. Chunks con embeddings, busqueda hibrida coseno+BM25.

**Memoria**: hechos curados con categoria. Dedupe por hash de texto normalizado.

**Business Graph**: entidades y relaciones del negocio. Version monotona, provenance por entidad.

**EntityResolver**: busca duplicados por email, CIF o nombre normalizado.

**TruthResolver**: decide entre multiples fuentes de verdad cuando hay conflicto.

**StateMachine**: maquina de estados declarativa. Verifica transiciones, roles y entityType.

**PolicyEngine**: permisos declarativos por rol. Allowlist adicional sobre los SOPs.

**AgentGovernance**: capa sobre PolicyEngine. Verifica allowedTools antes de cada tool.

**ReactionEngine**: motor de reacciones a eventos. Trigger, condition, actions.

**BusinessOSOrchestrator**: ejecuta el ciclo Goal, Context, Plan, Execute, Verify, Learn, Replan.

**ActionProposal**: propuesta de accion externa. Hash, expiresAt, estado awaiting_review.

**OutcomeUnknownError**: la accion pudo haber sucedido. No se reintenta automaticamente.

**Sandbox computer**: contenedor Docker por owner. Python, bash, git. Sin red, sin host mounts.

**Browser worker**: proceso Playwright separado. Egress proxy, validacion de IPs publicas, captura de PDFs.

**Skill**: script Python en el workspace del sandbox. main.py + SKILL.md + requirements.txt.

**ConversationAgent**: el agente del chat. Tools de negocio, tono humano, kernel.

**WeeklySchedule**: horario semanal de un empleado digital. Slots por dia, timezone, max horas.

**DayPlan**: plan diario de un empleado. Items con hora, estado, sopId o taskId.

**TeamWorkspace**: rejilla de los 16 empleados con su estado en vivo.

**BuildSpec**: peticion de construccion al Arquitecto. kind, goal, templateId.

**BuildArtifact**: artefacto producido por el Arquitecto. payload, diff, tests, logs, coste.

**BuildProposal**: propuesta de activacion de un artefacto. El cliente aprueba o rechaza.

**Escalation**: cuando un build no converge. Razon, detalle, email al operador.

**Operador**: humano detras de OpenMuse. Resuelve escalaciones, da de alta tenants, vigila el sistema.

**Template**: plantilla del catalogo. 5 tipos: sop, capability, schema, skill, view.

**Catalogo**: packages/catalog. Libreria semantica de templates. Crece con cada build aprobado.

---

Fin del whitepaper.

Ultima actualizacion: 2026-10-03.