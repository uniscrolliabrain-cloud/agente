# Pendientes F3 — delegacion controlada

- PEND-F3-01: `complete` de task mapea a `PolicyAction.execute` (B-N5).
- PEND-F3-02: `approval` sin `taskId` -> owner con `assignedBy = null` (B-N7).
- PEND-F3-03: `AgentActor.flow` computado, no persistido (B-N6).
- PEND-F3-04: `Flow` desde `AgentPersona.reportsTo`/`peers` es simplificado (actorId = personaId). Resolver contra `Actor` real en F4.
- PEND-F3-05: `assigners`/`approvers`/`reviewers` no en `Flow`, se resuelven desde `Policy`.
- PEND-F3-06: Adapters sin perdida de datos: campos especificos conservados.
- PEND-F3-07: `Goal` existe dos veces (`goal.ts` Zod + `agent.ts` interface legacy). F3 usa `agent.ts`.
- PEND-F3-08: `TaskStep`/`Evidence` son `interface`, no `z.object`. F3.3 declara schemas locales.
- PEND-F3-09: `Assignment` como interfaz de lectura, no entidad persistida.
- PEND-F3-10: `AssignmentAdapter` anadido a `assignment.ts` (F3.1b).
- PEND-F3-11: `F3.19` (`orchestrator.ts`) SKIP: comportamiento ya existe (`ORCHESTRATOR_ACTOR_PROPAGATE_V1`).
- PEND-F3-12: `F3.13` (`actions.ts`) anade `ctx?` y `assignments?`, pero `assignedBy` desde `ctx.actorId` no se cablea en `app.ts` todavia. Wire en F4.
- PEND-F3-13: `F3.16` (`PersonaRegistry`) `flow` simplificado. `ActorService` opcional. Resolver real en F4.
- PEND-F3-14: `F3.17` (`personas/routes.ts`) `flow` con cast `(skin as { flow?: unknown })`. Tipo real en F4.
- PEND-F3-15: Tests `service-assign`, `service-approve`, `T13` con mock de `Store` (`as never`). Mock completo en F4.
- PEND-F3-16: `F3.12` `ctx?` opcional en `createTask`/`escalateTask`/`createGoal`/`createMonitor`. Wire real en `engine/routes.ts` pendiente de commit.
