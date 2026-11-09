# Reporte 21 - contratos cableados

## Que se cableo

| Contrato | Consumidor real | Cambio |
|---|---|---|
| `CapabilityRisk`, `CapabilitySideEffect`, `CapabilityCost` | `engine/capabilities/bootstrap.ts` | El bootstrap declara riesgo, efectos y coste con los tipos del contrato; se van los casts a string |
| `BusinessSchemaV2`, `EntityDefinition`, `FieldDefinition`, `FieldType` | `engine/business/graph.ts` | `validateAgainstSchema` lee el metamodelo v2 y falla con 422 si un campo declara un tipo desconocido |
| `EntityCandidate`, `EntityMatch`, `MatchReason` | `engine/business/resolver.ts` + `graph.ts` | El resolver devuelve el contrato del dominio (`existingId`, `decision`) en vez de una forma paralela |
| `AgentRuntime`, `RuntimePhase` | `engine/agents/runtime.ts` | El runtime efimero se define sobre el contrato y arranca en fase `created` |
| `LearningFact`, `LearningPattern`, `FailureLesson`, `ProceduralLearning` | `engine/learning/observer.ts` | Los cuatro registros que escribe el observer estan tipados y se elimina un `as unknown as` |
| `OutcomeMetric` | `engine/verification/verifier.ts` | La metrica que se compara contra el criterio esta tipada |
| `OutcomeStatus` | `engine/sop-executor.ts` | El outcome del SOP usa el enum del dominio en vez de una union copiada |
| `PlanStatus`, `PlanStepStatus`, `PlanStep` | `engine/planner/planner.ts` | El plan y sus pasos se construyen con el contrato; `steps` deja de ser `any[]` |
| `ReactionTrigger` | `engine/reactions/engine.ts` | Nuevo `matchesTrigger`: ahora se respeta `trigger.filter` |

## Bug de comportamiento corregido

`ReactionEngine.evaluate` comparaba solo `rule.trigger.eventType` e ignoraba
`rule.trigger.filter`. Una regla con `filter: { source: "web" }` disparaba con
cualquier evento del mismo tipo. `matchesTrigger` aplica el filtro y hay test.

## Fuera de esta campana

- `RuntimeCheckpoint`: no hay persistencia de checkpoints; crear el metodo sin
  llamador seria codigo muerto.
- `StateDefinition`, `RelationDefinition`: el esquema que se guarda hoy no
  persiste estados ni relaciones v2; cablearlos exige migracion de datos.
- `ReactionTarget`: el executor de acciones de reaccion no despacha destinos.
- Metamodelo v1 (`business.ts`): retirarlo es decision de producto; sigue vivo
  en importaciones de `BusinessEntity`.

## Evidencia

Ver la salida de `tsc --noEmit`, `audit:contracts`, `audit:coherence` y
`tests/contracts-wiring.test.ts` en el mensaje de cierre.

## Segunda pasada: 55 -> 0

Tras cablear los 21 contratos del primer corte quedaban 55 `PENDING`. En esta
pasada se conectaron al codigo que ya existe y **no queda ninguno**:

- `BusinessSchema`, `BusinessEntityDecl`, `BusinessRelationDecl` -> `workspace/generator` (y vista de relaciones).
- `StateDefinition`, `RelationDefinition` -> validacion del schema en `business/graph`.
- `AssignmentPlan`, `AssignmentEvidence`, `AssignmentOutcome` y las 5 variantes
  (`GoalAssignment`, `MonitorAssignment`, `SopAssignment`, `ApprovalAssignment`,
  `AgentTaskAssignment`) -> adapters de assignments.
- `AgentMessage`, `AgentMessageIntent` -> `HandoffService.create` publica el mensaje;
  `ApprovalRequest`, `ApprovalStatus` -> `ActionService.decide` persiste la aprobacion formal.
- `ReactionTarget` -> `ReactionEngine.deliverToTargets`.
- `ReactionRule`, `ReactionCondition`, `ReactionAction` -> `ReactionEngine.load` normaliza el formato policy.
- `FieldPolicy`, `PolicyActionV2` -> `FieldFilter` (politica derivada de la clasificacion).
- `RuntimeCheckpoint` -> `AgentRuntimeManager` persiste el cierre de runtime.
- `ExecutionRole` -> contexto del motor de reacciones.
- `ExecutionBackend` -> `dockerExecutionBackend` + `GET /computer/health`.
- `KernelWriterPort` -> `Kernel implements KernelWriterPort`.
- `ViewSpec` -> `WorkspaceSpec.views` materializadas en el generator.
- `FlowRelation`, `KnowledgeKind`, `ClassifiedRecord`, `ClassifiedField`,
  `CommunicationCard`, `CapabilitySpec`, `CognitiveSpec`, `BaseVocabulary`,
  `ActorKind`, `ActorRole`, `ActorProfile`, `AgentRoleInput`, y los tipos de
  persona -> consumidos en actores, personas, verdad, renderer y bootstrap.

Bug de comportamiento anadido en esta pasada: `updateEntity` acepta
`expectedVersion` y devuelve 409 con `ConflictVersion`/`ConflictDiff` en vez de
pisar el cambio.
