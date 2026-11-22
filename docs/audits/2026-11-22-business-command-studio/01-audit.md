# Centro de Mando → Business Command Studio · auditoría previa

Fecha: 22 de noviembre de 2026. Rama: `feat/business-command-studio-demo`.
Base de producto **desplegada**: `113dcb778947c076521d2134badd1668cba0ef5b`, rama `feat/landing-premium-funnel`.
La rama parte de esa versión, no de `main` (`3023637d72994460b1aa4742f558557ec0c69922`). No se han fusionado ramas de auditoría.

## Decisión

Construir un workspace **demo ACME**, integrado en el shell existente como «Estudio · Demo», con inspector, visualizador y timeline sincronizados. Conservar el centro de mando real y Analítica hasta validar el sustituto. Los comandos del estudio solo mutan memoria local. No crear un segundo motor de tareas, scheduler, bus, permisos o aprobaciones.

## Método y límites

Lectura de código del frontend, rutas de servidor, contratos de dominio y módulos workspace; contraste con auditoría remota `docs/audit-time-scheduler-mobile-push-20261122` en `b0376fd17b077ab3b326f50843204f0387878a20` (docs 01/README, 05 y 06). Sus propuestas no se consideran capacidades implementadas. La comprobación HTTP pública confirma el bundle premium y hashes de las fotos originales de LAIA, Antonio, Pedro y `product-dimension.webp`. No se han consultado registros privados de clientes ni ejecutado operaciones en producción.

## Inventario verificado

| Pieza | Evidencia | Estado y consecuencia |
| --- | --- | --- |
| Inicio fotografiado | `apps/web/src/App.tsx`, vista `today`; `components/CommandCenterView.tsx:56,69,109` | GET `/api/company`, refresco 30 s. Usa `SampleDashboard` si sesión demo **o empresa real con cero tareas**, con aviso/toggle. La captura no demuestra actividad real. |
| Empresa y equipo | `api/company.ts`; `server/src/company-routes.ts:73,103,178` | Membership/tenant y rol resueltos en servidor. POST members modifica usuarios/memberships. `AgentCreateModal.tsx:42` llama `createAgent`. No reutilizar estos callbacks para la demo. |
| Analítica | `workspaces/35-centro-mando/hooks/useCentroMandoData.ts:248`; `server/src/routes/analytics.ts:96` | GET `/api/analytics/overview`, escaneos por tenant; fixture solo en demo. Errores se muestran, no se sustituyen por métricas inventadas. |
| Acciones de Analítica | `35-centro-mando/CentroMandoWorkspace.tsx` | Exportar, generar informe y otras acciones muestran toasts. No equivalen a exportaciones/ejecuciones verificadas. |
| Documentación de Analítica | `35-centro-mando/README.md` | Desactualizada: declara solo mock, props/data.ts y `.cm-root` que no describen el componente actual. Código prevalece. |
| Proyectos | `api/projects.ts`; `server/src/projects-routes.ts:38,45,144,200` | CRUD, bloques, vínculos, presencia; `expectedUpdatedAt` opcional en PATCH/PUT. No incluye calendario empresarial, equipo o dependencias completas. GET lista por owner; no asumir que todo miembro puede ver todo proyecto. |
| Asignación | `packages/domain/src/assignment.ts`; `engine/assignments/{registry,service,routes}.ts` | Proyección sobre task/goal/monitor/approval/sop; IDs `kind:recordId`, estados nativos conservados. Servicio usa PDP/withWrite. No persistir una copia de esos estados desde el estudio. La dependencia `bus?` por sí sola no prueba emisiones completas. |
| Linear | `packages/workspaces/07-linear/src/application/commands.ts` | Handlers reales crean/asignan/cambian estado en `ws-linear-workitems`. Modelo tiene projectId y otras relaciones. Su equivalencia con AgentTask no está establecida. |
| Trello | `packages/workspaces/34-trello/src/application/commands.ts` | **README dice scaffold pero hay handlers persistentes**: board/card create, move, assign, archive; historial de transiciones y bus opcional. No es solo un mock. `app.ts:318,896` registra módulos y monta dispatcher. No se ha probado un flujo proveedor extremo a extremo. |
| Timeline actual | `components/TaskTimeline.tsx` | Lista vertical de pasos de una tarea; no es timeline transversal con reloj. |
| Eventos | `api/events.ts`; `engine/events/bus.ts`; `events-routes.ts`; `app.ts:762` | Eventos persistidos, agregaciones y SSE. `eventTimeline` agrega conteos por hora; no devuelve intervalos de personas/proyectos. Dedupe explícita; no confundir replay técnico con viajar al pasado y revertir empresa. |
| Worker | `engine/worker.ts:44,213`; `server/src/index.ts:100` | TaskWorker ya usa nextRunAt/leases. El playhead de UX no debe ejecutar ni reprogramar tareas. |
| Presencia | `engine/presence.ts` | Map en memoria, TTL 30 s, thread/project. No prueba disponibilidad, productividad ni sincronización entre réplicas. |
| Grafo | `kernel/graph/views.ts:43` | Consulta opcional `businessGraph`; fallback explícito si no conectado. No prometer Digital Twin predictivo operativo. |
| Shell/chat | `App.tsx`; `SidebarV2.tsx`; `AppShell.tsx` | Auth, tenant, barra, chat lateral y sheet móvil compartidos. El estudio no añade otro sidebar/chat. Hooks globales pueden seguir consultando APIs al estar autenticado; no atribuir esas lecturas al proveedor demo. |

## Riesgos que condicionan el diseño

1. Confundir datos ficticios con empresa activa: cabecera persistente «ACME · Demo» y acciones locales, estado reiniciable; no derivar tenant del fixture.
2. Duplicar entidades de tareas/Trello/Linear: conservar referencias de origen y decidir mapeo antes de integrar. Una tarjeta visual no es permiso para ejecutar una tarea.
3. Cambiar estado desde un timeline histórico: reloj demo sirve para inspección; jamás muta el reloj/worker del servidor.
4. Programación y presencia: la auditoría previa identifica cuestiones de UTC, cron, dedupe, reconexión y scopes. Quedan pendientes de campaña backend, no se corrigen incidentalmente con CSS.
5. Concurrencia: CAS opcional no garantiza el contrato completo del futuro tablero. Hace falta expectedVersion, idempotency y reconciliación antes de edición colaborativa real.
6. Deriva visual: CSS global legacy y tema oscuro pueden afectar componentes nuevos. Scope propio, tokens de landing y pruebas con shell abierto/plegado.

## Validación de baseline

Ejecutado `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/analytics-overview.test.ts tests/campaign-2/f3-assignment-registry.test.ts tests/campaign-2/f3-assignment-routes-authz.test.ts`: **3 archivos pasados**, sin fallos. No es suite integral ni E2E de producción. El primer intento mediante CLI tsx falló antes de ejecutar por IPC `EPERM`; la invocación mediante import de Node sí terminó.

## Qué falta para backend real (fuera de esta demo)

Una proyección autorizada de trabajo con `sourceRef`, relaciones actor/proyecto/cliente, intervalos **plan/real/previsión** separados, cambios versionados y un cursor de eventos reconectable. Adaptar lecturas existentes en vez de copiar tablas. Añadir comandos sobre servicios existentes con PDP, idempotencia y CAS; probar aislamiento multiempresa y permisos humanos/agentes/proveedores. Digital Twin será una vista explicativa hasta disponer de un motor de escenarios validado. Ver campaña y contrato propuesto en 02.
