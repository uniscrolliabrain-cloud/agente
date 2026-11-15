# Crosswalk real de vocabularios del padre — revisión 1

> Evidencia de lectura de archivos de `main` el 2026-11-15. **No son pruebas de runtime.** No reemplaza léxicos originales de los 14 hijos.

## 1. Cuatro vocabularios diferentes ya presentes

| Capa | Fuente | Vocabulario concreto | Riesgo de integración |
|---|---|---|---|
| Verbos semánticos | `packages/domain/src/actions.ts` | 16 `ActionType`: Discover, Search, Retrieve, Read, Write, Create, Transform, Analyze, Classify, Validate, Communicate, Publish, Execute, Update, Delete, Monitor | No confundir intención semántica con autorización |
| Acciones de política | `packages/domain/src/policy.ts` | read, create, update, delete, approve, export, assign, escalate, execute | No existe equivalencia 1:1 obvia con 16 verbos |
| Familias de capacidades | `packages/domain/src/taxonomy.ts` | 15: WEB, RESEARCH, DOCUMENTS, DATA, CONTENT, CREATIVE, COMMUNICATION, SOCIAL, CRM, SALES, MARKETING, SOFTWARE, DATABASE, AUTOMATION, ANALYTICS | Los dominios Legal, Seguros, Ciberseguridad, Finanzas, Formación, Gestoría no tienen familia dedicada; una familia NO debe equivaler a repo |
| Ontología base | `packages/domain/src/ontology-seed.ts` | entities actor/user/agent/tool/resource/goal/event; relations uses/accesses/governs/requires/belongs_to/triggers; capabilities read/write/execute_tool/approve/plan/reason | `capabilities` aquí son términos ontológicos, no necesariamente `CapabilityContract.id` |

**Decisión arquitectónica propuesta:** mantener separados `semanticAction` (verbo de intención), `policyAction` (permiso sobre recurso), `capabilityId` (operación real versionada), `taxonomyFamily` (clasificación) y `domainId` (bounded context). No sustituir un campo por otro ni inferir permiso desde la taxonomía.

## 2. Identidad y roles: tres esquemas con significados distintos

- `packages/domain/src/actor.ts`: `Actor.kind` human/agent, `roles` owner/manager/employee/hr/compliance/agent, `AgentActor.runtimeId` obligatorio; `agentActor()` usa `runtimeId ?? actorId` como fallback.
- `packages/domain/src/execution-context.ts`: `ExecutionContext.role` admin/user/agent/system; `actorId` obligatorio; `tenantId`, `owner`, `requestId` obligatorios.
- `packages/domain/src/policy.ts`: `PolicySubject.role` owner/manager/employee/hr/compliance/agent; `PolicySubject.kind` human/agent.

**Problema a demostrar o descartar:** si `ExecutionContext.role=admin` se traduce a un `Actor.roles` distinto, la evaluación puede divergir. Diseñar una función única `resolvePrincipal` con pruebas de invariantes y denegación, no introducir equivalencias implícitas.

## 3. Dos modelos de política

- `policy.ts`: modelo declarativo con `effect` allow/deny, `condition`, `tenantId` opcional; comentario declara deny-overrides/fail-closed.
- `apps/server/src/engine/policy/engine.ts`: `PolicyEngine.can` usa permisos opcionales por rol; si no hay permisos, devuelve `allowed:true`. `canWithContext` delega en `can`, sin evaluar todas las condiciones ricas del contexto.

**No afirmar que una de estas capas protege a la otra sin seguir call graph.** Objetivo de reauditoría: tabla de entrypoints, orden de evaluadores, caminos sin guard, pruebas negativas con rol vacío, tenant cruzado y permiso caducado. Hasta entonces, contradicción documental/código **verificada**, exploit **no comprobado**.

## 4. Registros de capacidades

- `CapabilityRegistry`: Map global indexado por `capability.id`, métodos `register/get/list`, sin tenant en firma.
- `TenantScopedCapabilityRegistry`: `resolver.resolve(tenantId)`, caché por tenant TTL 5 minutos, `get(tenantId,id)`, `invalidate`.
- `capabilityContractSchema`: `inputs` y `outputs` son `z.record(z.string(),z.unknown())`, `actionType` y `family` opcionales, `version` string.
- `CapabilityBundleResolver.resolve` devuelve versión numérica del conjunto; no equivale al `version` de cada capacidad.

**Decisión de destino:** una única fachada de resolución autorizada `resolveCapability(tenant, principal, id, versionConstraint)` con esquemas ejecutables por operación y pinning de versiones por task. El registry global podría seguir siendo catálogo de definiciones **no autorizadas**; jamás confundirse con disponibilidad efectiva.

## 5. Eventos y sus contratos

- `apps/server/src/engine/events/types.ts`: lista cerrada de eventos de infraestructura y workspaces, `SystemEvent` con `schemaVersion:'1.0'`, `tenantId`, `owner`, `source`, `correlationId`, `causationId`.
- La lista contiene dos convenciones distintas: `sop.step_completed` y `sop.step.completed`; ambas aparecen en el mismo catálogo y **no son sinónimos por defecto**.
- `apps/server/src/engine/events/bus.ts`: valida payload con `payloadSchemas[type]`; resuelve tenant por opción explícita, scope, resolver y fallback a owner; al fallar la emisión captura error y devuelve `persisted:false` en vez de lanzar excepción.
- `EmitResult` distingue persistencia y delivery, por lo que el caller de una operación crítica debe verificar `persisted`; no dar por garantizada auditoría con un `await emit()`.
- La deduplicación es opt-in mediante `dedupeKey`; no equivale a idempotencia de efectos empresariales.

**Decisión de destino:** definir una tabla de `eventType → ownerDomain → schemaVersion → aggregate → trigger`; documentar aliases sin colapsar hechos históricos. Separar eventos de auditoría, eventos de integración y telemetría; definir política de fallos cuando no se puede persistir una evidencia obligatoria.

## 6. Estados normalizados de trabajo

`packages/domain/src/assignment.ts` normaliza task/goal/monitor/approval/sop mediante `AssignmentAdapter`, preserva `nativeStatus` y utiliza `Assignment.id = kind:recordId`. Es una buena base para un **read model** transversal, pero no debe imponer el ciclo de vida de Seguros, Legal, Ciberseguridad o Finanzas. `AssignmentEvidence.kind` solo contempla mail/file/web/user; para dominios complejos habrá que decidir si se extiende o si se referencia un registro universal de evidencias.

## 7. Matriz de verificaciones arquitectónicas

| Prueba futura | Resultado requerido |
|---|---|
| El mismo verbo semántico con dos recursos | política evalúa permisos distintos |
| Rol vacío en acción con efecto | denegación salvo excepción explícita y probada |
| Capacidad presente en catálogo global, ausente para tenant | inaccesible y no ejecutable |
| Cache tenant con revocación | invalidación/revocación inmediata o ventana explícitamente segura |
| Evento válido sin tenant resoluble | no atribución silenciosa a tenant erróneo |
| Evento no persistido | no se afirma operación auditada |
| Evento duplicado | consumidor idempotente; hecho no descartado por dedupe de ruido |
| SOP con paso obligatorio skipped | resultado no `succeeded` |
| Status nativo desconocido | error tipado, no coerción a succeeded |
| Evolución schema de capability | compatibilidad contractual o rechazo antes de ejecución |

## Próxima lectura dirigida
Seguir rutas y consumidores de `PolicyEngine.can`, `CapabilityRegistry.get`, `TenantScopedCapabilityRegistry.get`, `EventBus.emit`, `AssignmentAdapter`; extraer call graph real con líneas y tests. Posteriormente comparar contra los 14 repositorios hijos y sus Concept Masters.
