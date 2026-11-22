# 05 — Auditoría de colaboración humano/agente y centro de mando «Game Master»

**Fecha:** 2026-11-22. **Base consultada:** main, SHA de referencia 3023637d72994460b1aa4742f558557ec0c69922. **Método:** lectura estática de código y búsqueda de símbolos; no se han ejecutado tests ni E2E. **Regla:** distinguir capacidad implementada, contrato/scaffold y propuesta.

## Intención del producto
Empresa como sistema vivo: owner supervisa pasado/presente/futuro de humanos, agentes, proveedores e invitados; equipos trabajan por sección, proyecto, cuenta de cliente y jornada. Un Kanban Trello + timeline multicapa tipo ClickUp conectan resultados esperados, entradas pendientes, riesgos, dependencias, aprobaciones y recursos, con reloj común. El dueño es «game master» de su organización, **no** superusuario de otras empresas ni de datos fuera de su ámbito. No vigilancia invasiva de empleados: visibilidad de trabajo autorizado, trazabilidad proporcional y límites por rol.

## Hallazgos de código (con rutas)
1. **Proyectos reales pero modelo reducido:** `apps/server/src/projects-routes.ts` tiene CRUD con `clientId`, `status`, `tags`, bloques `timeline`, vínculos a memorias/artefactos y presencia; `apps/web/src/api/projects.ts` refleja `Project` sin miembros, objetivos, dependencias ni calendario operacional. `expectedUpdatedAt` aporta control de concurrencia en ediciones, no tablero colaborativo integral.
2. **Asignaciones unificadas en lectura:** `packages/domain/src/assignment.ts` define `Assignment` como proyección de task/goal/monitor/approval/sop, **no entidad persistida independiente**. `apps/server/src/engine/assignments/service.ts` implementa assign/accept/reject/approve/complete/escalate/reassign con PDP y `withWrite`. Excelente base para cards, pero falta demostrar relación con proyecto, cliente, departamento y jornada para todos los tipos.
3. **Presencia solo efímera:** `apps/server/src/engine/presence.ts` declara Map en memoria, TTL 30 s, resourceType thread/project. Se pierde con restart y no se comparte entre réplicas. No equivale a presencia global de equipo, ocupación o disponibilidad.
4. **Kanban Trello como scaffold:** `packages/workspaces/34-trello/README.md` marca estado `scaffold` y documentos pendientes. No tratarlo como motor funcional. Auditar `apps/web/src/workspaces/34-trello` y rama de UX antes de escribir.
5. **Modelo Linear más avanzado, sin asumir wiring:** `packages/workspaces/07-linear/src/domain/entities.ts` incluye workItem con projectId/cycleId/parentId/teamId, milestone y dependency; verificar adaptadores, store, comandos, rutas, eventos y UI antes de declararlo operativo.
6. **Timeline existente, alcance limitado:** `apps/web/src/components/TaskTimeline.tsx` dibuja pasos de UNA tarea con estado y duración, no timeline transversal. `apps/server/src/events-routes.ts` permite timeline agregado por hora y replay, pero no relaciones de dependencia, planes y previsiones.
7. **Centro de mando parcial:** `apps/web/src/workspaces/35-centro-mando/components/ProjectProgressRow.tsx` muestra nombre/owner/alerta/progreso desde props. No demuestra proyección viva del runtime. Auditar origen de `types.ts`, fixtures y API.
8. **Kernel graph vista opcional:** `apps/server/src/kernel/graph/views.ts` expone `graph.timeline` con `businessGraph?.timeline`; si no está cableado retorna nota «businessGraph not wired yet». No asumir grafo temporal operativo.
9. **Eventos y worker:** `engine/events/bus.ts`, `events-routes.ts`, `engine/worker.ts` y `engine/service.ts` ya aportan eventos, SSE, tareas durables, status y leases. Reutilizarlos para proyecciones, no añadir un bus nuevo.
10. **Conversación:** `engine/conversation.ts` incluye briefing de jornada con registros task/action/lead/connection, referencias y control tenant. Es base para briefing «ayer/hoy/mañana», pero no reemplaza consultas autorizadas al plan.
11. **Riesgo de temporización:** ver docs 01–04 de esta carpeta: `maintain()` cada 60 s, cron UTC por minuto, posible starvation de SOPs y preferencias de notificación inconsistentes. Resolver antes de prometer sincronización fiable.

## Brechas y severidad
**P0:** modelo canónico WorkItem/WorkGraph y relación inequívoca con source records; autorización por tenant+proyecto+cuenta cliente+actor; eventos durables ordenables y dedupe; reconciliación tras desconexión; deadlines sin pérdida; bloqueo/aprobaciones; no duplicar ejecución al arrastrar tarjeta.
**P1:** memberships y capacidades por ámbito, actores humanos/agentes/proveedores; timelines plan/real/forecast; dependencias y ETA; control de capacidad y jornadas; vistas Kanban/agenda/Gantt; dashboards por rol; feed de riesgos y entradas.
**P2:** simulación what-if, predicción con intervalos de confianza, gestión de escenarios, resúmenes narrativos, asignación inteligente sugerida y automatizaciones proactivas sujetas a aprobación.

## Investigación que debe completar el agente antes de codificar
- Trazar `Project` desde UI -> API -> routes -> Store -> eventos y CAS; comprobar tenant/clientId real.
- Trazar `Assignment` para 5 kinds, `AssignmentRegistry`, adapters, policy y eventos emitidos; verificar si `bus?` de AssignmentService se usa.
- Trazar `07-linear`, `34-trello`, `35-centro-mando` hasta rutas y persistencia; clasificar mock/scaffold/real.
- Leer `engine/presence.ts`, `threads-routes.ts`, `projects-routes.ts`; comprobar confianza en headers y control de acceso.
- Auditar `kernel/graph`, `engine/views`, `events-routes.ts`, notificaciones, `TaskWorker` y `SOPExecutor`.
- Revisar ramas activas: `campaign/c02-baseline-movil`, `campaign/c04-conversacion-universal`, `docs/ui-runtime-generativa-branding-personalizacion-20261121`, `feat/mobile-chat-multimodal-ux`, `docs/integracion-transversal-coherente-20261121`. Registrar SHAs y conflictos.
- Validar RLS, permisos de proveedores, client accounts, delegación y jerarquía tenant existente. No inferir que `clientId` implica aislamiento.
- Ejecutar tests reales y HTTP E2E multiusuario/multitenant; esta auditoría no los ha ejecutado.

## Diagnóstico
**Sí existe gran parte de la base transversal** (proyectos, asignaciones, worker, eventos, timeline de tareas, presencia, scaffolds de Trello/Linear, centro de mando). **No está demostrado que exista el plano colaborativo unificado, persistente, autorizado y sincronizado.** Propuesta: construir proyecciones y comandos sobre registros existentes, con una única fuente de verdad por entidad.
