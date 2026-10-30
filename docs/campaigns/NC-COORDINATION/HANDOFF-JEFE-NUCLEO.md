# Handoff de jefatura: campaña cognitiva NC-01/02/03 y coexistencia con el vertical

Fecha: 2026-10-30. Base inspeccionada: main 68aa77f. Destinatario: Codex en otro chat, como jefe de un equipo de tres agentes en total. Autoridad de producto: Alfonso.

## 1. Encargo y alcance

Dirigir y ejecutar progresivamente la campaña cognitiva del núcleo sin bloquear el vertical comercial de Agntia Pro ni editar en paralelo sus archivos. El núcleo desarrolla memoria, atención, continuidad temporal y metacognición; el vertical entrega canales, conexiones, usuarios, operaciones y producto vendible. Ambos son extensiones del mismo runtime: no crear dos motores empresariales, dos autoridades de tenancy ni dos buses incompatibles.

Este handoff autoriza preparar el equipo y trabajar por fases, no implementar de golpe el árbol completo de las tres especificaciones. El primer hito es NC-P00, corto y concreto; después NC-P01 y el primer circuito NC-P02. No reabrir una auditoría general interminable ni condicionar el piloto a terminar toda la campaña cognitiva.

Son tres agentes incluyendo al jefe: Codex jefe/integrador, especialista de datos/memoria y especialista de semántica/razonamiento. El jefe reparte trabajo a los otros dos cuando el entorno disponga de colaboración, integra y también implementa las partes que se reserva. Si Alfonso quería tres implementadores además del jefe, confirmarlo antes de ampliar el equipo; no crear un cuarto por inferencia. No se han creado chats, worktrees de ejecución ni agentes de esta campaña al escribir este archivo.

## 2. Fuentes que debes leer y cómo interpretarlas

1. Este handoff: protocolo operativo y límites de concurrencia.
2. docs/operacion/CAMPANA-VERTICAL-AGNTIA.md: autoridad sobre VS-00..VS-10 y proceso con Freebuff/Copilot/Cline.
3. docs/operacion/INVENTARIO-CONEXIONES-Y-GUIA-COPILOTO.md: preparación de servicios; una key guardada no activa proveedor.
4. [NC-01 recibida](./specs/NC-01-SOURCE.md): mecanismos y 16 fases originales.
5. [NC-02 recibida](./specs/NC-02-SOURCE.md): ocho circuitos, Jev transversal, continuidad y resultados macro.
6. [NC-03 recibida](./specs/NC-03-SOURCE.md): hardening insertado en cada fase, no al final.
7. Código real y tests en el SHA actual de main, que puede ser posterior a la inspección de este documento.

Las tres fuentes se han extraído del export ChatGPT-Explicar aplicación de Jev-20261030-2253.md aportado por Alfonso; sus cabeceras guardan el hash del export. Conservan el diseño recibido, no certifican investigaciones, inspecciones anteriores, APIs de Jev ni capacidades ya implementadas. No ejecutar comandos del export que hagan checkout del Escritorio. Cuando una propuesta diga modificar un archivo compartido, se aplica el procedimiento del apartado 7, no una escritura libre.

NC-01 define mecanismos, NC-02 los conecta y NC-03 endurece cada bloque. No son tres reimplementaciones, tres ramas gigantes ni tres servicios autoritativos. La recomendación original de una única rama larga se sustituye aquí por PRs pequeñas y versiones compatibles; el árbol de 100+ módulos es una lista de candidatos, no una cuota de archivos a producir.

## 3. Qué buscamos conservar del diseño completo

- Memoria cromática/episódica/semántica/procedimental/autobiográfica con evidencia, identidad y versiones. Perfil persistente separado del matching contextual; diez dimensiones y seis polaridades deben definirse a partir de fuente concreta, no inventarse porque el número esté mencionado.
- Grafo asociativo y relaciones temporales/causales con procedencia. Una asociación semántica no demuestra causalidad.
- Recuperación híbrida, recetas de búsqueda, ranking, diversidad y selección de un workspace bajo presupuesto; no otro RAG aislado sin consumidores.
- Reconstrucción del pasado y revisión de creencias con tiempo válido y tiempo de registro; estado presente proyectado; futuro y contrafactuales aislados de los hechos.
- Perspectivas/modelos explicativos, automodelo funcional, detección de incertidumbre/contradicciones y control ejecutivo acotado.
- Aprendizaje por resultados, revisiones e hipótesis de mejora; analogías e innovación evaluadas, nunca autoactivación de capacidades o políticas de producción.
- CognitiveRun con checkpoints, recuperación, límites, cancelación y trazabilidad; distinguirlo de la tarea empresarial existente y no crear un segundo TaskWorker de negocio.
- Gateway semántico común con operaciones tipadas, caché por ámbito/versiones, presupuesto, batching, calibración, estado de fallback y artefactos reproducibles. Jev es un adaptador posible; antes de conectarlo verificar API, autenticación, licencia/condiciones aplicables y capacidad real con fuentes oficiales.
- Inspectores de evidencia/estado, benchmarks, ablaciones y evaluación longitudinal con reinicios. Mostrar explicaciones y referencias acotadas, no volcar razonamiento privado ni datos de otro usuario.

Consciencia sintética es un nombre funcional del proyecto, no una conclusión sobre experiencia subjetiva ni superioridad científica. Medir capacidades observables y no prometer resultados por analogía con neurociencia.

## 4. Inspección concreta que motiva la separación

En main 68aa77f, engine/cognition/ todavía no figura como implementación del diseño. Sí existen kernel/cromos/cromo.ts, kernel/graph/*, authors, observers, MemoryService, ContextEngine, EventBus y sus Store sinks. El esquema cromo actual es genérico y no define por sí solo las diez dimensiones del diseño. Hay comentarios históricos que no coinciden necesariamente con el comportamiento: promover memoria ya tiene dependencias y vías de escritura; no decidir por el comentario de cabecera.

EventBus.emit escribe en sink y publica en globalSubscribers; esto no acredita transacción atómica con el efecto de negocio ni recuperación durable de un consumidor. No reemplazarlo por otro bus. Primero inspeccionar sinks, consultas, manejo de errores y mecanismo de proyección, y diseñar el puente mínimo.

AgentService reúne memoria, contexto y ejecución; contiene resoluciones tenantIdFor(owner) y es superficie de VS-01. app.ts es el montaje del vertical y sus rutas de proveedor. NC-01/03 también quieren modificarlos: hay conflicto de propiedad real aunque cada equipo use otro worktree.

El vertical mantiene pendientes de contexto durable, salida aprobada y OAuth. No asumir que ya se han arreglado por estar en el plan. Una memoria de núcleo recibe el contexto autorizado, no lo reconstruye desde una membership primaria.

## 5. Condiciones para desarrollar a la vez

La separación de worktrees evita contaminar archivos locales; NO garantiza merges sin conflictos ni compatibilidad semántica. El objetivo alcanzable es: archivos exclusivos durante el desarrollo, contratos explícitos y puentes compartidos integrados uno a uno.

Reservas iniciales: el equipo NC escribe sus árboles nuevos; el equipo VS escribe sus canales y aplicación. Los archivos existentes compartidos se pueden leer libremente, pero no editarlos sin una ventana de integración registrada. Estar autorizado a investigar no equivale a ser propietario del archivo.

### Matriz de propiedad entre equipos

| Superficie | Propietario de escritura | Regla |
| --- | --- | --- |
| apps/server/src/engine/cognition/** | NC | Subdividir por agente, sin index/config compartidos entre escritores |
| packages/domain/src/cognition.ts (nuevo, si necesario) | Jefe NC | Un único contrato canónico; preferir imports directos inicialmente |
| tests/cognition/** | NC | Subcarpetas por agente; fixtures comunes del jefe |
| apps/web/src/components/cognition/** y apps/web/src/api/cognition.ts | NC | Sin editar shell, router, navegación o auth del panel |
| apps/server/src/cognition-routes.ts (nuevo, si necesario) | Jefe NC | Sin montaje activo hasta puente aprobado; autorización real, no mera UI admin |
| docs/campaigns/NC-01/**, NC-02/**, NC-03/** y NC-COORDINATION/** | Jefe NC / Cline bajo encargo delimitado | Un escritor por archivo; no tocar índice global de Cline |
| apps/server/src/kernel/** existente | NC tras NC-P00 | Escritura solo en archivos enumerados en su manifiesto; conservar API e invariantes; avisar al vertical si cambia contrato |
| engine/memory.ts y engine/rag.ts | NC tras NC-P00 | Reservar esos archivos al NC; no cambiar API legacy sin puente y aprobación |
| Canal WhatsApp, Google/OAuth, Stripe, Vapi, leads y adaptadores externos existentes | VS | NC no modifica sus rutas, secretos, payloads ni implementaciones |
| engine/service.ts, worker.ts, model.ts, model-chain.ts, conversation.ts, context/**, sop-executor.ts, task-plans.ts | Puente serial; prioridad VS para correcciones del piloto | NC propone cambios en un documento/patch aislado; no los edita en paralelo |
| app.ts, config.ts, tenant-scope.ts, db.ts, db-tenant.ts, auth/tenant/users/permissions | Puente serial; prioridad VS para identidad y operación | No redefinir tenancy, cifrado, storage o login desde NC |
| engine/events/** existente; nueva durabilidad genérica; types/schemas/barrels | Puente serial | No apropiarse del bus con una subcarpeta nueva; outbox genérico se decide una sola vez |
| packages/domain/src/agent.ts, kernel.ts, execution-context.ts, index.ts y otros contratos compartidos | Puente serial | NC puede proponer extensión compatible; un escritor y consumers revisados |
| package.json, lockfiles, tsconfig*, .env.example, CI, fly/vercel, dependencias y flags globales | Puente serial | Ningún agente los edita incidentalmente para hacer compilar su módulo |
| Panel existente, navegación, conexiones y permisos UI | VS / puente serial | Inspectores NC aislados hasta montar capacidad autorizada |
| docs/registro-agentes/** e índices documentales | Cline | NC entrega registros candidatos en sus docs; Cline integra metadatos |
| docs/verification/vertical/** | Copilot | NC usa informes con namespace propio docs/verification/cognition/** según estándar común |

No reservar todo engine/** al equipo NC ni todo tests/** al equipo VS. Los paths existentes no enumerados se consideran compartidos hasta adjudicarlos. Las rutas sugeridas en las fuentes que no existen se verifican antes de crear; no reemplazar un módulo real solo por encajar un árbol.

La prioridad del piloto no cancela NC: mientras espera un puente, NC desarrolla y verifica sus módulos propios contra puertos congelados. Esos tests acreditan el módulo, no el cableado real. Ninguna fase de integración se declara terminada solo con un fake.

## 6. Equipo NC: tres agentes, tres superficies de escritura

### Jefe NC — agente 1

Propietario: raíz de engine/cognition/ (index, config y bootstrap), contracts/, orchestration/, coordination/, continuity/, composition/ y puertos de integración que la auditoría confirme necesarios; dominio cognition.ts; documentación de coordinación; fixtures comunes; endpoints/inspectores cuando toque. Lleva arquitectura, control de alcance, revisión de los otros dos e integración. No se convierte en cuarto escritor que modifica sus directorios.

### Datos y memoria — agente 2

Propietario: cognition/persistence/, memory/, perception/, chromatic/, graph/, associations/, integrity/, memory-evolution/, temporal/ y world-model/. En fases causales avanzadas, acordar si temporal/world-model delegan en causal del agente 3; no duplicar contratos.

Tests propios: tests/cognition/data/** y fixtures solo dentro de ese subárbol. Implementa proyección, procedencia, revisiones, replay, confinamiento y reparación, así como episodios y representación temporal. Un cambio existente de kernel/memory/rag lo realiza únicamente este agente cuando el jefe lo haya asignado por archivo en el manifiesto; no el especialista semántico a la vez.

### Semántica, razonamiento y evaluación — agente 3

Propietario: cognition/providers/, semantic/, retrieval/, workspace/, prediction/, scheduling/, perspectives/, metacognition/, causal/, learning/, innovation/, observability/ y evaluation/. Tests: tests/cognition/reasoning/** y benchmarks sintéticos de ese subárbol.

Empieza por un baseline determinista explícito y los contratos; adaptador real solo tras verificación de proveedor. No publicar una heurística como resultado Jev. No promover learning a políticas, herramientas o versiones productivas por su cuenta.

Cada agente trabaja en su propio worktree y rama. Dentro de un squad tampoco usar un checkout compartido con procesos editando los mismos índices. Los barrels e interfaces comunes son del jefe. Las subcarpetas son un reparto de responsabilidades, no obligación de crear todos los módulos listados.

## 7. Contrato de puentes y cambios compartidos

El jefe registra cada solicitud en docs/campaigns/NC-COORDINATION/BRIDGE-REQUESTS.md: ID, SHA base, problema, paths exactos, firmas antes/después, dueño temporal, consumidores VS/NC, compatibilidad, pruebas, flags y rollback. El equipo que necesita el cambio no se autoasigna la reserva.

Ciclo: propuesta -> acordada por responsables de ambos equipos -> reserva activa -> PR mínima -> integrada -> consumidores actualizados -> reserva liberada. Si no hay canal autorizado entre chats, Alfonso transmite la solicitud; no fingir que se ha obtenido acuerdo por esperar un tiempo. Antes de acuerdo NC sigue fuera de esos paths.

En el periodo actual, Codex del vertical es integrador por defecto de service/worker/app/config y tenancy; Codex NC propone el hook y revisa su lado. El bus/DB genéricos también requieren una única PR de infraestructura revisada por ambos. Cambiar un contexto cognitivo no debe invalidar el caso de usuario en dos tenants que cierra VS-01.

Ejemplo mínimo de ficha (campos propuestos, sin crear integración por este ejemplo):

```yaml
id: NC-BR-001
status: proposed
base_sha: SHA_MAIN_COMPLETO
requester: nc-lead
integration_owner: vs-lead
paths: [apps/server/src/engine/service.ts]
reason: inyectar puerto cognitivo opcional sin alterar ejecucion legacy
producer: cognition-service
consumer: agent-service
compatibility: capacidad ausente mantiene la ruta anterior
requires_vs: [VS-01]
acceptance: [tenant_context, disabled_equivalence, bounded_failure]
rollback: desactivar montaje; conservar registros experimentales
```

Un contrato candidato debe describir operaciones y errores, identidad/ámbito, versions, presupuestos y manejo de unavailable/cancelled. Reutilizar tipos canónicos de identidad; no inventar un actorId a partir de un owner cuando no se conoce. Si el tipo compartido necesita ampliación, solicitar el puente.

Preferir inyección de dependencias, imports directos y módulos con consumidores reales a un registro global o nueva dependencia. No acceder al Store crudo desde el núcleo para saltarse scopes. Las proyecciones usan colecciones/índices propios versionados, nunca reescriben datos de WhatsApp, pagos o acciones.

### Reservas de archivo y control antes del commit

El jefe mantiene FILE-OWNERSHIP.md con base_sha, namespace/path, owner, branch, patchset, estado de reserva y dependencia. Es un registro operativo, no un lock automático de Git. Actualizar main y comprobar reservas antes de comenzar un patchset; no basta con un acuerdo antiguo.

Cada entrega compara git diff --name-only BASE_SHA...HEAD contra su allowlist exacta y registra resultado. Revisar también cambios sin commit, archivos nuevos, renames y diffs semánticos. git diff --check detecta whitespace, no propiedad ni compatibilidad. Si un archivo no está permitido, detener esa parte y pedir reasignación; no esconder el cambio en una actualización de lockfile o un formato masivo.

## 8. Git, worktrees e integración

Repositorio: https://github.com/uniscrolliabrain-cloud/agente.git. El checkout del Escritorio tiene historial de cambios locales/stash y trabajo de Cline. No hacer git switch, stash pop, reset, clean ni checkout forzado allí. Consultarlo en lectura es suficiente; usar un checkout de coordinación independiente.

El otro chat comienza comprobando cwd, git status, remotos, worktrees y AGENTS.md aplicables. No asumir que esta ruta de trabajo de Codex es su cwd. Crear/reutilizar worktree propio con las herramientas de Codex disponibles o Git; trabajar explícitamente en la ruta devuelta. Cada worktree tiene branch único.

Nombres propuestos: campaign/nc-p00-coordination para el jefe; campaign/nc-p01-contracts; campaign/nc-p02-memory-projection; campaign/nc-p02-semantic-baseline; y sucesivos patchsets con propósito. Un branch de campaña agregador es opcional y no puede convertirse en la única copia no publicada. Preservar commits publicados y no reescribir ramas de otro agente.

La fuente recibida pide una campaña unificada: se respeta como arquitectura y backlog únicos, no como una megarrama sin revisiones. Integrar PRs pequeñas desactivadas por defecto cuando sean compatibles; los puentes se serializan. Si una PR depende de otra no integrada, declarar la base y no mezclar commits de otra campaña por accidente.

Antes de cada merge: actualizar refs; comprobar SHA esperado; revisar lista de paths y diff; validar consumidores y estado con flags apagadas; typecheck y pruebas relevantes. Los tests existentes compartidos se leen, no se cambian para aceptar regresiones. El scope de Cognition no autoriza alterar controles de contracts/idempotency para conseguir verde.

No prometer cero conflictos. Si aparece uno: identificar autores y propósito, integrar en branch dedicado preservando ambas intenciones y repetir únicamente las comprobaciones afectadas. Las migraciones de datos requieren compatibilidad hacia delante/atrás según ventana y no se revierten destruyendo datos. Un cambio sin conflicto textual todavía puede romper semántica.

## 9. Plan ejecutable que fusiona las tres campañas

| Hito revisable | NC-01 | NC-02 | Hardening NC-03 que se incorpora | Resultado para aceptar |
| --- | --- | --- | --- | --- |
| NC-P00 coordinación | 0 | mapa A-H, productores/consumidores | 00 | ownership, mapa de llamadas, contratos candidatos y lista de puentes comprobados |
| NC-P01 contratos mínimos | 1 | CognitiveRun, evaluación semántica | 00/02 | esquema mínimo con evidencia/scope/versiones; no catálogo de tipos huérfanos |
| NC-P02 primer circuito | 2-3 | ingesta y run recuperable | 01-04 | evento persistido -> episodio/card -> consulta aislada -> checkpoint/replay sin duplicado |
| NC-P03 recuperación y atención | 4-5 | gateway/recall/workspace | 05-07 | baseline híbrido y selección medibles; proveedor desacoplado y fallo acotado |
| NC-P04 continuidad temporal | 6-7 | pasado/presente y sesiones | 02/08 | revisiones contradictorias con tiempo/procedencia reconstruible |
| NC-P05 escenarios | 8 | futuro y contrafactuales | 09 | escenarios separados de hechos y sin efectos de negocio |
| NC-P06 control y aprendizaje | 9-12 | perspectivas, feedback, agentes | 03/10-12 | presupuestos, critic acotado, propuestas y evaluación longitudinal |
| NC-P07 puente de runtime | 13 | integración A-H | 13 | contexto autorizado al Slow; ruta apagada equivalente y sin escritura duplicada |
| NC-P08 observación/evaluación | 14-15 | métricas/calibración/ablaciones | 14-15 | inspectores autorizados, límites y capacidades aceptadas por evidencia |

No esperar a NC-P07 para descubrir incompatibilidades: el puerto candidato se acuerda en P00/P01 y se valida en integración sintética. El montaje real en archivos compartidos se realiza cuando la reserva lo permita, después del arreglo de contexto VS-01 si ese puente lo necesita. Ninguna capacidad pasa de mock a conectada por inferencia.

### Primer encargo de ejecución para el nuevo jefe

NC-P00: leer las fuentes y código relevante, registrar SHA y todos los paths que se pretenden cambiar. Entregar ARCHITECTURE-MAP.md, FILE-OWNERSHIP.md, BRIDGE-REQUESTS.md, CONTRACT-CANDIDATES.md y PATCHSETS.md dentro de NC-COORDINATION. No modificar runtime en ese primer patchset. Duración objetivo: una unidad revisable, no una exploración de semanas; separar desconocidos y dar el siguiente paso implementable.

Después, publicar NC-P01 mínimo y dividir P02 entre los dos especialistas: datos con Store scoped y replay; semántica con baseline y validación de respuestas. El jefe integra las firmas comunes. El primer circuito puede operar sobre fixtures sintéticos y eventos persistidos de prueba sin esperar Jev ni claves de producción; declararlo como tal.

## 10. Evidencia, seguridad y evaluación

Mantener por fase: objetivo, SHA base/objetivo, paths permitidos y cambiados, pruebas y límites, recursos/proveedores usados, compatibilidad, rollback y decisión de cierre. Seguir el formato de Copilot de la campaña vertical, con namespace docs/verification/cognition/FECHA/PATCHSET-RUN/. No editar informes del vertical ni exigir otra automatización antes de implementar.

Pruebas decisivas: scopes de mismo usuario en dos empresas y permisos intra-tenant; reinicio a mitad de proyección y checkpoints; duplicados y eventos fuera de orden; evidencia original inmutable frente a revisiones; simulaciones sin contaminación de hechos; caché aislada por permisos y versiones; cancelación/budget; equivalencia del camino desactivado; fallo/timeout de proveedor sin activar otro servicio real; no duplicar aprendizaje por replay.

Persistir resultados semánticos usados si se exige replay de la decisión: volver a llamar a un modelo no garantiza el mismo score. Distinguir reproducción de estado lógico de nuevas inferencias. Establecer baseline, datasets y métricas antes de afirmar mejoras: RAG legacy vs baseline cognitivo vs semántica, calibración por operación, latencia/coste y ablaciones por mecanismo.

No capturar chain-of-thought privada como requisito de observabilidad. Registrar evidencia, decisiones tipadas, acciones autorizadas, resultados y explicaciones acotadas. No usar repositorios externos como dependencias hasta revisar necesidad, licencia y contrato; el diseño cita inspiración, no impone instalar diez frameworks.

Flags y presupuestos cognitivos son propuestas hasta implementarse. Deben estar apagados inicialmente y, al activarse, limitarse por tenant/capacidad/entorno. Shadow puede medir/reproyectar en ámbito experimental, pero no enviar emails, WhatsApps, llamadas, cobrar ni cambiar políticas. No habilitar todas las capacidades de un cliente porque exista la clave de Jev.

## 11. Límites para no duplicar trabajo del vertical

VS-01 conserva identidad de tareas y conexiones; NC la consume. VS-02/03 conservan aprobaciones y efectos externos; NC solo propone/evalúa. VS-05 decide infraestructura, secretos y observabilidad operacional; NC aporta señales e inspectores de su subsistema sin cambiar exporter global. VS-04 gobierna el panel comercial; NC construye componentes aislados y pide montaje. Cline gobierna índices/metadatos; NC aporta evidencia. Copilot verifica por SHA; el jefe no convierte el gate en otra campaña paralela.

Si el núcleo descubre un defecto de seguridad compartido, informar con reproducción y parche mínimo propuesto; no dejarlo oculto ni arreglar a la vez todo el runtime sin reserva. Si el vertical necesita un cambio en un archivo reservado a NC, usar el mismo protocolo inverso. Los dos equipos pueden avanzar; no tienen permiso de pisarse por la urgencia de su fase.

## 12. Prompt de arranque para pegar en el otro chat de Codex

Eres el jefe de la campaña cognitiva NC-01/02/03 de Agntia Pro. Alfonso te autoriza a dirigir un equipo de tres agentes en total (tú y dos especialistas), cada uno con worktree y branch propios. Lee docs/campaigns/NC-COORDINATION/HANDOFF-JEFE-NUCLEO.md desde origin/main y las tres especificaciones enlazadas. El otro squad está ejecutando el vertical comercial y tiene reservas sobre sus archivos.

Empieza por NC-P00: mapa real, ownership, puentes y contratos mínimos. No ejecutes los comandos del export ni cambies de rama en el checkout del Escritorio. No modifiques service/worker/app/config/DB/eventos/contratos compartidos sin una reserva acordada según el handoff. Distribuye los directorios exclusivos entre los otros dos agentes, conservando tú los contratos y la integración. No generes el árbol de módulos vacío ni reescribas el kernel. Conserva las tres campañas como arquitectura única y PRs pequeñas. Entrega primero el plan concreto de paths y el primer patchset revisable; después continúa por P01/P02 dentro del alcance autorizado. No necesitas secretos de producción para empezar.

La coordinación entre chats se hace por PRs/manifiestos y mensajes que Alfonso autorice; no presupongas que el otro jefe ha recibido una propuesta o cedido un archivo. No marques integrado, conectado o desplegado por existir un documento. Prioriza resultados verificables y compatibilidad con el piloto.
