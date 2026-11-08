# Pendientes de la limpieza general

**Fecha:** 2026-11-08
**Base:** `main` = `a3faf00` (fast-forward desde `c08a927`, 57 commits)
**Regla:** lo que no se ha podido cerrar aquí queda listado con el motivo, el comando y el exit real. Nada de "ya se verá".

Ningún arreglo de esta limpieza ha fallado dos veces. Lo que hay abajo es lo que **no se toca a propósito** por el plan del vertical slice, lo que **no se puede validar** desde este sandbox, y lo que es una **decisión de producto**.

---

## 1. Bloqueado por el vertical slice (no se toca a propósito)

Estos ficheros los modifican las campañas de `docs/vertical-slice-actual/`. Arreglarlos ahora garantiza conflicto con las ramas `freebuff/vsa-NN-*` y `codex/vsa-NN-*-test`.

| # | Fichero | Qué queda | Campaña que lo posee |
|---|---|---|---|
| 1 | `apps/server/src/engine/conversation.ts` | No pasa `entityId` al `ContextEngine`: Laia no sabe de qué negocio se habla | 13 (`13.P3` lo resuelve), también 10, 15, 18, 20 |
| 2 | `apps/server/src/engine/conversation.ts` | Marcador `KERNEL_NONFATAL_V1` repetido en los dos `catch` (revisado y fechado en la allowlist; el audit ya lo acepta) | 13 / 20 |
| 3 | `apps/server/src/db-tenant.ts` | Marcador `TENANT_SCAN_PEEL_V1` como cabecera de `scan()` y de `peel()` (revisado y fechado; ya no bloquea) | 04 |
| 4 | `apps/server/src/index.ts:178` | Callback diferido vacío: puede registrar éxito sin trabajo real | 06 (`06.P3`) |
| 5 | `apps/server/src/app.ts:564` | Un fallo de resolución cae a tenant `default` | 02 (`02.P2`) |
| 6 | `clientes/` | `clientes/agntia` sin `personas/` y con `"pipeline": []`; las 13 personas viven en `clientes/default/` | 09 y 18 |
| 7 | `package.json` | Scripts del slice y del instalador | 01 y 08 |
| 8 | `.github/workflows/ci.yml` | Ya se añadió `pnpm audit:anchors` (una línea, hunk distinto). El comando del slice lo añade la campaña 01 | 01 |

## 2. No se puede validar desde este sandbox

| # | Cosa | Por qué | Qué haría falta |
|---|---|---|---|
| 9 | `deploy.yml:104` — `flyctl image show ... \|\| true` | Un paso de verificación que no puede fallar. Quitarlo sin probar puede romper el deploy si Fly tarda en exponer la imagen | Ejecutar el workflow contra Fly, o cambiar a un bucle con reintentos y timeout probado |
| 10 | Producción: `browserConfigured:false` | `/api/health` responde 200 con el worker de navegador sin configurar. No hay acceso a los secretos de Fly para comprobarlo | Revisar `BROWSER_WORKER_URL` y `WORKER_TOKEN` en el entorno de producción |
| 11 | ~~`agntiapro.io` sin DNS~~ | **No es un pendiente.** El dominio del producto es `agntiapro.com`; `.io` no existe y nunca fue el canon. Verificado: 0 referencias reales en el repo (72 menciones de `.com` en 21 ficheros, incluidas `fly.toml`, `doppler.yaml` y `deploy.yml`); la única mención de `.io` está en `docs/operacion/ESTADO-VERTICAL-LAIA-Y-DATOS.md:11`, que precisamente documenta que ya no se usa | Nada |

## 3. Decisiones de producto (no son bugs, pero pesan)

| # | Cosa | Medida |
|---|---|---|
| 12 | `apps/web/frontend-actual.md` y `frontend-context.md` | 880 KB cada uno (1,76 MB). Son volcados de Repomix del repo entero, sin ninguna referencia desde código ni docs. Candidatos a borrar; no se borran sin tu OK |
| 13 | 137 ficheros `.gitkeep` | Carpetas vacías versionadas a mano |
| 14 | 219 `console.*` en 53 ficheros | El audit sólo vigila 24 en su superficie (código de producción); el resto está en tests y scripts, sin norma escrita |
| 15 | 8 `TODO`/`FIXME` en código | Tres son de fondo: `KERNEL_AUDIT_DB_V1`, `KERNEL_STORE_V1` y `KERNEL_TENANT_DB_V1` (audit, grafo y tenant en memoria) |
| 16 | 119 comentarios de código apuntan a `docs/audits/...` | La carpeta real es `docs/miniaudits/`. Sed mecánico, pero toca ficheros reservados (`app.ts`, `conversation.ts`); por eso no se aplicó |

## 4. `contracts`: 79 contratos sin uso y sin decisión

Es el único audit que sigue en rojo (gate exit 1). No se marca `PENDING` en bloque a propósito: eso sería maquillar el gate, exactamente lo que el plan prohíbe. Cada contrato necesita o un consumidor real o una decisión fechada.

Reproducir:

```bash
pnpm audit:contracts          # exit 1
# informe completo: artifacts/gate/audits/AUDIT_CONTRACTS.md
```

79 contratos en 34 ficheros, todos en `packages/domain/src/`:

| Fichero | # | Contratos |
|---|---|---|
| `business-schema.ts` | 6 | `BusinessSchemaV2`, `EntityDefinition`, `FieldDefinition`, `FieldType`, `RelationDefinition`, `StateDefinition` |
| `agent-persona.ts` | 5 | `AgentCapabilities`, `AgentFormality`, `AgentGender`, `AgentPersonality`, `AgentValueRef` |
| `policy-context.ts` | 5 | `FieldPolicy`, `PolicyActionV2`, `ReactionAction`, `ReactionCondition`, `ReactionRule` |
| `messaging.ts` | 4 | `AgentMessage`, `AgentMessageIntent`, `ApprovalRequest`, `ApprovalStatus` |
| `learning.ts` | 4 | `FailureLesson`, `LearningFact`, `LearningPattern`, `ProceduralLearning` |
| `goal.ts` | 4 | `GoalConstraint`, `GoalPriority`, `GoalStatus`, `SuccessCriterion` |
| `actor.ts` | 3 | `ActorKind`, `ActorProfile`, `ActorRole` |
| `runtime.ts` | 3 | `AgentRuntime`, `RuntimeCheckpoint`, `RuntimePhase` |
| `assignment.ts` | 3 | `AssignmentEvidence`, `AssignmentOutcome`, `AssignmentPlan` |
| `business.ts` | 3 | `BusinessEntityDecl`, `BusinessRelationDecl`, `BusinessSchema` |
| `capability.ts` | 3 | `CapabilityCost`, `CapabilityRisk`, `CapabilitySideEffect` |
| `conflict.ts` | 3 | `ConflictDiff`, `ConflictResolution`, `ConflictVersion` |
| `entity-resolution.ts` | 3 | `EntityCandidate`, `EntityMatch`, `MatchReason` |
| `agent.ts` | 2 | `AgentRoleInput`, `CreateTaskInput` |
| `ontology.ts` | 2 | `CapabilitySpec`, `CognitiveSpec` |
| `classification.ts` | 2 | `ClassifiedField`, `ClassifiedRecord` |
| `index.ts` | 2 | `ExecutionBackend`, `Section` |
| `outcome.ts` | 2 | `OutcomeMetric`, `OutcomeStatus` |
| `plan.ts` | 2 | `PlanStatus`, `PlanStepStatus` |
| `reaction.ts` | 2 | `ReactionTarget`, `ReactionTrigger` |
| `workspace-spec.ts` | 2 | `ViewKind`, `ViewSpec` |
| `views.ts` | 2 | `ViewKpi`, `ViewQueueItem` |
| `assignments/task.ts` | 1 | `AgentTaskAssignment` |
| `assignments/approval.ts` | 1 | `ApprovalAssignment` |
| `assignments/goal.ts` | 1 | `GoalAssignment` |
| `assignments/monitor.ts` | 1 | `MonitorAssignment` |
| `assignments/sop.ts` | 1 | `SopAssignment` |
| `ontology-seed.ts` | 1 | `BaseVocabulary` |
| `communication-card.ts` | 1 | `CommunicationCard` |
| `execution-context.ts` | 1 | `ExecutionRole` |
| `flow.ts` | 1 | `FlowRelation` |
| `kernel.ts` | 1 | `KernelWriterPort` |
| `truth.ts` | 1 | `KnowledgeKind` |
| `signup.ts` | 1 | `SignupRequest` |

**Lectura:** la mayoría no son basura, son el vocabulario que consumirán las campañas (03 permisos y políticas, 04 propiedad, 09 personas, 13 hilo y mensajería, 20 panel y tarjetas). La decisión correcta para casi todos es `PENDING(motivo, fecha)` citando la campaña que los consume, no borrarlos. Eso lo debe hacer quien implemente esa campaña, no una limpieza a ciegas.

## 5. Test que falta para el arreglo de `assembly.ts`

`renderContext` ya produce saltos reales y aplica el multiplicador, pero **no hay test en el repo que lo cubra**: el plan dice que las rutas de prueba nuevas pertenecen a Codex y `tests/context-engine.test.ts` es superficie de las campañas 04 y 10.

Verificación usada aquí (script temporal, no versionado): un paquete con memorias de dos fuentes, relaciones, eventos, RAG y hechos aprendidos da 9 bloques separados por línea en blanco, sin `\n` literales, sin mojibake, y el orden cambia al aplicar `multipliers: { tarea: 0.01 }`.

Cuando la campaña 04 o 10 toque `tests/context-engine.test.ts`, conviene añadir el caso: `renderContext` con dos fuentes y multiplicador invertido.

---

**Comprobación final de esta limpieza** (`pnpm gate`, 2026-11-08):

```
OK   typecheck            10.3s
OK   typecheck:worker      1.5s
OK   test                 50.1s   (572 tests, 555 pass, 0 fail, 12 skipped, 5 todo)
OK   audit:layers          violaciones=0
OK   audit:bridges         wired=16 total=16
OK   audit:console         ocurrencias=24 ficheros=235
OK   audit:anchors
FAIL audit:contracts       (79 huérfanos, ver §4)
OK   audit:idempotency     duplicadas=156 huerfanas=0 repetidas=143
OK   audit:tenant-default  permitidas=131 prohibidas=0
gate exit=1
```

## Campaña 04 · consumidores sin cablear (2026-11-08)

- **04.P2 pendiente**: `MemoryService`, `BusinessGraph`, `ContextEngine` y `app.ts` siguen leyendo el `Store` crudo con la clave legacy `<tenant>:<userId>`. El contrato (`apps/server/src/engine/tenant-records.ts`) y la migración con diario están probados, pero sustituir esos cuatro accesos cambia la semántica de recall y grafo y necesita una tanda propia con red de seguridad, no un cambio de paso.
- **Owners legacy sin reescribir**: pasar de `<tenant>:<userId>` a `<tenant>:u:<userId>` exige decidir el actor fila a fila. Hoy `planRecordMigration` los manda a `review` en vez de adivinar.

## Campaña 05 · RLS real y enlaces (2026-11-08)

- **05.P2 pendiente**: `withTenantRls()` aplica `SET LOCAL app.tenant_id`, pero no se ha podido acreditar contra un Postgres con `MULTI_TENANT_SHARED=true` y rol de staging. La sonda de Doppler sólo dio la config `dev` (Neon) y sin `BUSINESS_DATABASE_URL`: sembrar un segundo tenant ahí no es staging. Lo consumirá la campaña 11/20 cuando haya base de staging.
- **`x-user-id` en presencia y locks** de `threads`/`projects`: sigue usándose como identidad de edición. No autoriza datos, pero retirarlo toca UI y API que consumen la 13 y la 20; se hace allí con su contrato.

## Campaña 06 · identidad durable del worker (2026-11-08)

- **06.P1/P2 pendiente**: la tarea no persiste todavía tenant, solicitante, agente, SOP, versión ni correlación, y el despacho no revalida actor/suspensión. El recibo falso ya está cerrado (06.P3), pero esto toca `worker.ts`, `service.ts` y el formato de `AgentTask`; hacerlo sin staging habría cambiado el contrato de reclamación a ciegas. Lo consume la campaña 18 y el gate de la 20.
