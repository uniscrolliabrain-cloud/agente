# 06 — Diseño: Empresa viva, Game Master, Kanban y timeline multicapa

## Modelo de organización y ámbitos
`Tenant/Organization -> Department/Team -> ClientAccount -> Project/Portfolio -> Workstream -> WorkItem -> TaskRun/Action/Artifact`.
**No forzar jerarquía rígida:** un proyecto puede cruzar departamentos, varios clientes solo con autorización expresa y referencias scope-bound. Un actor puede tener varios roles y memberships por proyecto. Cada relación tiene `tenantId` explícito y política de acceso. Proveedores e invitados solo ven objetos compartidos, nunca la totalidad de la empresa.

### Actor
`Actor{id,tenantId,kind:'human'|'agent'|'external',userId?,agentId?,roleIds[],capabilities[],workingCalendarId?,status}`.
Identidad humana = sesión verificada; agente = principal de servicio con permisos limitados y delegación; proveedor = identidad externa con acceso temporal. El dueño administra permisos **dentro de su tenant**; acciones de alto riesgo requieren policy y approvals.

### WorkItem canónico (proyección, no sustitución)
```ts
type WorkItemView = {
 id:string; tenantId:string; projectId:string; clientAccountId?:string;
 departmentIds:string[]; source:{kind:"task"|"goal"|"monitor"|"approval"|"sop"|"external";id:string};
 title:string; stage:"backlog"|"ready"|"active"|"blocked"|"review"|"done"|"cancelled";
 ownerActorId?:string; assigneeActorIds:string[]; reviewerActorIds:string[];
 priority:"low"|"normal"|"high"|"critical"; progress:number;
 plannedStartAt?:string; plannedEndAt?:string; dueAt?:string;
 actualStartAt?:string; actualEndAt?:string; forecastEndAt?:string;
 forecastConfidence?:number; statusReason?:string; version:number;
 dependencyIds:string[]; outputIds:string[]; riskIds:string[];
};
```
La fuente canónica de ejecución sigue siendo `AgentTask`, `Goal`, `SOP`, `Approval` o sistema externo. `WorkItemView` se reconstruye desde eventos y registros. Para atributos de colaboración no presentes en fuente, persistir `WorkItemOverlay` versionado y vinculado a `sourceRef`; no duplicar estados nativos sin reconciliación.

## Planos del tablero
**1. Kanban dinámico**: swimlanes por proyecto/cliente/departamento/actor; columnas configurables mapeadas a estado canónico; tarjetas muestran responsable humano/agente, próximo paso, bloqueo, SLA, due, outputs, entradas pendientes y semáforo de riesgo. Drag-and-drop = `Command` autorizado y versionado; nunca mutar proyección local como autoridad. Optimistic UI con rollback.
**2. Timeline multicapa**:
- capa **histórica**: eventos y receipts verificados, causation/correlation, actor, output y evidencia;
- capa **ahora**: estado real, worker heartbeat, lease, presencia efímera, disponibilidad y aprobación;
- capa **plan**: objetivos, milestones, dependencias, calendarios y ventanas de ejecución;
- capa **forecast**: estimaciones con fuente, confianza y actualización, **no promesas**;
- capa **incoming**: datos esperados de APIs, emails, aprobaciones, proveedores, webhooks, jobs; distinguir esperado vs confirmado;
- capa **riesgos**: bloqueos, overdue, anomalías, permisos, costes, incidentes y mitigaciones.
**3. Calendario operativo**: jornada por actor, horarios y descansos, timezone IANA, turnos, festivos y capacidad; agentes pueden ejecutar 24/7 según policy, humanos no se modelan como disponibles siempre. Notificaciones y quiet hours.
**4. Centro de mando Game Master**: vistas empresa -> departamento -> cliente -> proyecto -> actor -> ejecución; filtros «qué hizo / qué hace / qué hará», «qué espera», «qué entra», «qué puede fallar» y «qué necesita mi aprobación».
**5. Sala de proyecto**: conversación contextual, archivos, decisiones, artefactos, miembros, tareas y eventos; Laia presenta tarjetas mínimas autorizadas, no lleva todo el estado en prompt.

## Event sourcing y read models
```text
TaskWorker/SOP/Approval/HumanAction/Connector
  -> canonical domain event (tenantId, eventId, actorId, sourceRef, occurredAt,
       recordedAt, correlationId, causationId, schemaVersion, sequence?)
  -> append-only EventBus + transactional outbox
  -> WorkGraphProjector (idempotent, cursor durable, replay)
  -> ProjectBoardProjection / ActorAgendaProjection / TimelineProjection
  -> authorized queries + SSE (resume by event cursor) + notifications push
```
No afirmar orden global perfecto entre servicios. Orden parcial causal + secuencia por aggregate; `occurredAt` vs `recordedAt` para entradas tardías; lag del projector visible. Snapshot + replay. UI reconciliable al reconectar; caché invalida por versión y tenant.

## Tiempo y sincronización
Usar `ClockPort` de doc 02 y scheduler durable de docs 01–04. Tiempo UTC para persistencia; IANA para jornada; monotónico para duraciones; `nextRunAt` para agenda. Cada `WorkItem` conserva `planned`, `actual`, `forecast` separados. La posición de la línea «ahora» en frontend puede actualizarse con animación local, **no es fuente de ejecución**. Detectar skew, pausas, DST, offline y backfill.

## Relaciones y predicción
Grafo dirigido tipado: `blocks`, `depends_on`, `produces`, `awaits_input`, `assigned_to`, `belongs_to`, `approved_by`, `risks`. Validar que dependencias no forman ciclos prohibidos. Ruta crítica estimada con intervalos, recalcular al cambiar dependencia. Señales: ETA basada en histórico + estimación, riesgo de SLA, coste y capacidad; cada forecast tiene `generatedAt`, `modelVersion`, `confidence`, `evidenceRefs` y caducidad.

## Comandos mínimos
`createWorkItem`, `linkSource`, `moveStage`, `assignActor`, `setDeadline`, `addDependency`, `requestApproval`, `acknowledgeRisk`, `reschedule`, `pause`, `cancel`, `handoff`, `publishOutput`. Cada comando con `tenantId` del principal, `expectedVersion`, `idempotencyKey`, actor, target y audit. Diferenciar mover tarjeta de ejecutar un SOP: estado visual no debe disparar side effects sin contrato y autorización.

## UX concreto
- Desktop: sidebar ámbitos, cabecera KPI + selector fecha/jornada, Kanban central, timeline multicapa inferior plegable, inspector lateral de tarjeta con historial/evidencia/acciones.
- Móvil: tarjetas compactas, filtros por actor/cliente, timeline vertical, bottom sheet estilo Maps para detalle, barra «ahora», notificaciones con deep link. No reproducir escritorio a escala.
- Modo dueño: mapa de cargas, decisiones, alertas, prioridades y objetivos; modo empleado: mis trabajos; modo proveedor: tareas compartidas; modo agente: capability-limited commands.
- Doble eje de lectura: **por proyecto** y **por actor**; misma fuente de datos, no dos bases separadas.

## Riesgos de producto
No convertirlo en vigilancia total: la presencia indica actividad en recurso, no productividad; no rastrear hábitos privados ni pantallas. «Lo que va a pasar» se muestra como plan/forecast/hipótesis, nunca certeza. Consentimiento y retención de registros humanos; RBAC/ABAC con auditoría.
