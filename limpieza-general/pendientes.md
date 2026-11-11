# Pendientes de la limpieza general

**Fecha:** 2026-11-08
**Base:** `main` = `a3faf00` (fast-forward desde `c08a927`, 57 commits)
**Regla:** lo que no se ha podido cerrar aquí queda listado con el motivo, el comando y el exit real. Nada de "ya se verá".

Ningún arreglo de esta limpieza ha fallado dos veces. Lo que hay abajo es lo que **no se toca a propósito** por el plan del vertical slice, lo que **no se puede validar** desde este sandbox, y lo que es una **decisión de producto**.

---

## Campaña 2026-11-11 · fase A de los miniaudits

**Base:** rama `feat/acme-tenant` (8 commits por encima de `main` = `b37b67d`), más los arreglos de
esta tanda, que están sin commitear al escribir esto.
**Origen:** `docs/miniaudits/2026-11-10/ANEXO-ORDEN-DE-TRABAJO.md`, fase A.
**Verificación de la tanda:** `tsc --noEmit` exit 0. Suite completa: 790 tests, 772 pass, 12 skipped,
5 todo y **1 fallo que era mío** (`decide` con 409 rompía cancelar tarea). Revertido ese cambio, se
repitieron en verde los focos: `actions` 12/12, `workflows` 5/5, `vertical-slice-approval` 4/4,
`gate/idempotency-execution` 6/6, `campaign-3/e2e-05-authz` 1/1. **La suite completa no se ha
repetido después del revert.**

### Cerrado en esta tanda

| # | Arreglo | Fichero | Prueba |
|---|---|---|---|
| 07 | `CapabilityRunner` buscaba la aprobación con `ctx.tenantId` como owner; el store compone `${tenant}:${owner}` y la acción se guarda con el owner usuario, así que buscaba `${tenant}:${tenant}` y ninguna aprobación se encontraba. Las claves de idempotencia se dejan por tenant: el gate las fixturiza así y no hay fuga entre empresas | `apps/server/src/engine/execution/capability-runner.ts` | `tsc` + `tests/gate/idempotency-execution.test.ts` |
| 25 | El resultado de `runGoal` se descartaba: un goal `achieved` seguía `active` para siempre. Ahora se marcan los hitos y pasa a `completed` con CAS | `apps/server/src/engine/service.ts` (`createGoal`) | `tsc` (sin test de orquestador) |
| 14 | `bridgeWorkspaceCapabilities` declaraba `sideEffects: []` e `idempotent` para toda capability de workspace aunque la declaración dijera que escribe. Ahora respeta `sideEffects` y usa `at-most-once` | `apps/server/src/engine/workspaces/bridge.ts` | `tsc` |
| 08/14 | `/api/views/resolve` exige tenant (403 `TENANT_REQUIRED`) | `apps/server/src/routes/views.ts` | commits previos |
| 04/06 | Techo de intentos y dead-letter; verificador sin criterios no firma; contexto que no se puede montar deja el goal en `blocked` | `worker.ts`, `verifier.ts`, `orchestrator.ts` | commits `b148961`, `d009dee` |

### Pendiente de la fase A, con motivo

| # | Qué queda | Por qué no se hace aquí |
|---|---|---|
| 25/10 | Llevar el goal a `failed` cuando el ciclo falla | El `Goal` legacy (`packages/domain/src/agent.ts`) sólo admite `active\|paused\|completed`. Añadir `failed` cambia el dominio y los filtros de la UI: es una decisión, no un parche |
| 25 | Persistir el `Outcome` por tarea (no sólo el estado del goal) | Necesita un kind de store y contrato de lectura para el panel; hoy el desenlace vive en `task.result` y en eventos |
| 07 | `decide()` con 409 en conflicto de estado | No aplica tal cual: aprobar una acción ya denegada debe devolver la propuesta en `denied`; es el contrato que usa cancelar tarea (`tests/workflows.test.ts:127`) y romperlo tiraba la suite (790 tests, 1 fallo). La idempotencia actual es deliberada |
| 07 | `provider` desde la acción | No aplica: este módulo sólo propone acciones de Google y el proveedor real viaja en la conexión (`README.md:104`) |
| 07 | La aprobación se identifica con `ctx.sessionId` | Hay que llevar `task.actionId` al `ExecutionContext` (dominio + orquestador + service). Cambia tres firmas |
| 14/08 | PolicyEngine real (envelope calcula permisos, rutas los respetan) | El PEP se monta **antes** de que exista `ctx` (`app.ts:582` vs `583-690`) y nadie lee `c.get("authz")`. Además `defaultPolicies()` no tiene ninguna regla `allow` para humanos: activarlo tal cual deja la API en 403 total. Faltan permisos por rol declarados y la decisión 404/403 |
| 13 | El `rag` no puede devolver `[]` cuando falla | `searchReport` ya expone `degraded`, pero `memory.ts:199` convierte el fallo en `[]`. Propagar el error rompe el turno de chat cuando no hay embeddings; hay que decidir si el recall degrada o falla |
| 09 | Semántica de `delivered` en el bus | Contar entregas confirmadas exige que `publish` espere handlers (hoy es síncrono y alimenta SSE); es un cambio de contrato del bus, no un rename |
| 04/06 | Clasificar el error del reintento | `defaultIsRetryable` existe y sólo lo usa `files.ts`. El worker reintenta por lease/intentos, no por `retryWithBackoff`; cablearlo cambia la política de reintentos de tareas |
| 02 | Quitar los 10 `skip` que quedan | 5 son placeholders de e2e (`campaign-3/e2e-02..12-skip.test.ts`), 2 tienen motivo escrito (fixture de modelo y mock de guardrails), 1 es por Windows y 2 están en `b30`/`computer-runner`. Convertirlos exige los fixtures que aún no existen |

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

## Ruta manual de producción (2026-11-11, tanda desde el móvil)

- `main` con la ruta manual publicada; rama única, sin ramas abiertas.
- El gate del deploy estaba roto por dos motivos distintos:
  1. `corepack pnpm install` con Node 22.6 moría con
     `Cannot find matching keyid` (no verifica la firma de pnpm 11.19).
     Arreglado: `deploy.yml` usa Node `"22"`, igual que el job `unit` que sí instala.
     **Pendiente de confirmar en un run del gate.**
  2. `audit:coherence` sigue en rojo (bridges + contracts). Es trabajo real
     pendiente; no se relaja el gate para saltarlo.
- `DOPPLER_TOKEN` del repo es inválido: Doppler responde
  `{"error":"Invalid Auth token"}`. Afecta al workflow manual y al sync
  Doppler→Fly de `deploy.yml`.
- Base de datos: Neon sigue con la cuota excedida; `/api/health` devuelve 503
  con `database:false`.
- Workflow manual: `.github/workflows/configure-prod-db.yml`
  (Actions → "Configurar base y desplegar (manual)" → Run workflow).
  Toma el DSN de Doppler (`DATABASE_URL`/`SUPABASE_*`/`POSTGRES_URL`/`PG_URL`)
  o de un secret del repo (`SUPABASE_DB_URL`, luego `DATABASE_URL_PROD`, luego
  `DATABASE_URL`); lo valida con `psql` sin imprimirlo, lo fija en
  `agntiapro-api`/`agntiapro-worker`, despliega si el health sigue en 503 y
  comprueba la redirección del login de GitHub.
- Runs 1-4: fallos de entorno encadenados (firma de pnpm, `sudo` del instalador
  de Doppler, DSN ausente). Los tres primeros corregidos; el cuarto es el token.
- Siguiente acción, desde el móvil: regenerar el token de Doppler y guardarlo en
  el secret `DOPPLER_TOKEN`, o crear el secret `SUPABASE_DB_URL` con el DSN del
  pooler (`*.pooler.supabase.com:6543`). Después, relanzar el workflow.
