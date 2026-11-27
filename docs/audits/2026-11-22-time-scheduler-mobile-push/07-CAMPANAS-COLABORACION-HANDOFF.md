# 07 — Campañas secuenciales de colaboración en la misma iniciativa

**Dependencias:** C00–C04 de `03-CAMPANAS-IMPLEMENTACION.md` (auditoría, reloj, scheduler, tenant/prefs). No bloquear prototipos UI por Push C05–C08, pero sí exigir consistencia y authz para producción.

## COL-00 — Auditoría completa de wiring (sin cambios operativos)
**Inspeccionar:** `projects-routes.ts`, `api/projects.ts`, `assignment.ts`, `engine/assignments/{service,registry,adapters,routes}.ts`, `presence.ts`, `07-linear`, `34-trello`, `35-centro-mando`, `events-routes.ts`, `kernel/graph/views.ts`, `engine/views/*`, `engine/service.ts`, `worker.ts`, authz y store. Buscar rutas, tablas, tests, fixtures y commits de ramas activas. **Salida:** grafo archivo->import->endpoint->store->evento->UI, inventario mock/real/legacy, SHA y mapa de conflictos. **Gate:** no crear duplicados.

## COL-01 — Scope organizativo y actores
**Crear/extender:** contratos Zod de department/team/clientAccount/projectMembership/actorCapability/workingCalendar; migraciones RLS y service authz, no usar clientId libre como permiso. **Tests:** actor de tenant A no ve B; proveedor ve solo proyecto asignado; revocación inmediata; agente con token limitado. **Gate:** deny-by-default.

## COL-02 — WorkItem overlay y enlaces
**Crear:** `WorkItemOverlay` sobre Assignment y fuentes nativas, sourceRef única, status mapping versionado, memberships, deadline, owner y etiquetas. Reusar `packages/domain/src/assignment.ts` y `07-linear` donde estén realmente cableados. **Tests:** task/goal/monitor/approval/sop -> card sin pérdida de estado; no duplicar datos; CAS y conflictos.

## COL-03 — Event projection + replay
**Crear:** proyector incremental con cursor durable, dedupe, snapshot, replay y lag; `BoardProjection`, `TimelineProjection`, `ActorAgendaProjection`. Reusar EventBus, `globalSubscribers` y store. **Tests:** out-of-order, replay, restart, 2 replicas, evento tardío, cambio de tenant y actor revocado. **Gate:** proyección converge al estado fuente.

## COL-04 — Relaciones, dependencias, riesgos y outputs
**Crear:** edges tipados, validación de ciclos, expected inputs, receipts, riesgos y milestones. Enlazar artefactos reales y aprobaciones. **Tests:** bloqueo por dependencia, input tardío, revisión pendiente, output producido, riesgo mitigado; ninguna relación cross-tenant sin permiso explícito.

## COL-05 — Tiempo de trabajo y planificación
**Crear:** working calendars por actor, timezone, ventanas, jornada, quiet hours, capacidad y SLA; integrar `ScheduleService`. Separar planned/actual/forecast. **Tests:** DST, vacaciones, overlap, sobreasignación, replanificación, worker offline, missed-run, time skew.

## COL-06 — Comandos colaborativos
**Crear:** API autenticada con `expectedVersion`, `idempotencyKey`, PDP; assign, move, block, approve, handoff, reschedule, complete. Nunca ejecutar side effect por simple DnD sin autorización. **Tests:** 2 humanos editan simultáneamente, humano+agente, 409 conflict, actor sin permisos, retry y cancelación.

## COL-07 — Kanban dinámico
**Superficie:** primero auditar `packages/workspaces/34-trello` y `apps/web/src/workspaces/34-trello`; completar adaptadores sin reescribir shell. Columnas configurables, swimlanes, cards vivas, indicadores SLA, dependencias, filtros. **Tests:** drag-drop, optimistic rollback, reconexión, 1000 cards con virtualización, teclado y accesibilidad.

## COL-08 — Timeline multicapa
**Superficie:** extender `TaskTimeline` solo si corresponde; crear timeline transversal de proyecto/empresa y vistas por actor. Capas historial/ahora/plan/forecast/incoming/riesgos, zoom hora/día/semana/mes, línea ahora, hitos, dependencias y filtros. **Tests:** miles de eventos, DST, cambio de zoom, ausencia de datos, forecast etiquetado, permisos por capa.

## COL-09 — Game Master y briefing
**Superficie:** `35-centro-mando`, `engine/conversation.ts` y queries autorizadas. Vistas «ayer/hoy/próximo», por cliente/departamento/actor, alertas y aprobaciones. Laia consume tarjetas de pocos tokens con enlaces a registros, no dumps del grafo. **Tests:** no inventar forecast, referencias auditables, dueño ve su tenant, proveedor no ve finanzas.

## COL-10 — Notificaciones, presencia y colaboración viva
SSE con cursor y reconexión; presencia con TTL compartido solo si escala multiinstancia; Web Push de C05–C07 para aprobaciones, riesgos y plazos; dedupe y quiet hours. **Tests:** 2 sesiones, 2 réplicas, offline/reconnect, logout, cambios de rol, no push cruzado.

## COL-11 — Pruebas verticales y canary
Escenario completo: owner crea cliente y proyecto, Laia planifica SOP, Marcos ejecuta, empleado humano revisa, proveedor entrega documento, Antonio valida coste, owner aprueba, bus publica outputs y timeline actualiza; simular retraso y riesgo, replanificar y verificar receipts. Repetir con dos tenants, 3 usuarios, 2 agentes y proveedor. Métricas: projector lag, schedule lag, board stale, overdue, blocked, approval latency, forecast error, delivery success. **Gate:** tests unit/integration/E2E + demo real, rollback y aprobación antes de merge/deploy.

## Plantilla de reporte por campaña
```md
# COL-XX
Base SHA / rama / worktree / responsable:
Evidencias de rutas/archivos/lineas:
Contratos existentes reutilizados:
Cambios por path y migraciones:
Pruebas (comando, salida, resultado):
Aislamiento tenant/cliente/actor:
Concurrencia, idempotencia y replay:
Compatibilidad con ramas paralelas:
Riesgos, rollback, siguiente campaña:
Estado (propuesto / implementado / verificado):
```

## Prompt handoff
«Lee docs 01–07 de esta carpeta. Antes de tocar código, reaudita main y ramas, reconstruye el wiring y ejecuta COL-00. Reutiliza el kernel, EventBus, TaskWorker, SOP, Assignment, Projects y workspaces existentes. No conviertas scaffolds en hechos. Mantén a Laia como interfaz ligera, el runtime como autoridad y el dueño como administrador autorizado del tenant. Una campaña por rama y reportes verificables; sin merge ni deploy sin aprobación».
