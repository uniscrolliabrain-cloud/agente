# Architecture V2

> v2 · 2026-10-27 · Estado: current

## Capas

| Capa | Componentes | Responsabilidad |
|------|-------------|-----------------|
| 1 | API Hono: auth, actor, tenant, rutas HTTP | Entrada, autenticación, enrutamiento |
| 2 | `AgentService`: dispatch `kind=sop` → `SOPExecutor`, else `agent.ts` | Orquestación de tareas y agentes |
| 3 | `SOPExecutor`: paso, resultados, versión, stack, `allowedTools`, ciclo, profundidad, `ask_user`, approval | Ejecución de SOPs deterministas |
| 4 | Kernel: `openTurn`, `openChildTurn`, `appendThought`, `thoughtsOf`, `tenantId`, `turnId`, `closeTurn` | Registro cognitivo de turnos y pensamientos |
| 5 | `TurnStore`: `tenantId` + `owner` + `StoreTurnStore` (cognitive-turns, thoughts) | Persistencia de turnos |
| 6 | `Computer`: `DockerRunner`, no-new-privileges, 512MB, none tmpfs, 64MB noexec, files.py, FS volumen por owner | Sandbox de comandos aislado |
| 7 | `BusinessDataService`: HTTP / PG / sample + `LearningService` (provenance `sop:taskId`) | Datos de negocio y aprendizaje |

## Flujo Kernel

```
User → user-author (intent primario, owner)
  → fast-author: respuesta inmediata (readView turn.thoughts)
  → slow-author (background): ProgressEvent (progress | partial | ready | failed)
  → Meta.evaluate: thoughts, lastFastActivityAt, now → hints
    • slow_ready_fast_idle: medium, fast, idle >1000ms, slice 0..200
    • slow_long_no_output: low, 30s
    • slow_failed_urgent: high
    • nothing_to_report: low
  → Presenter: PRIORITY (response | display | confirmation | correction | reasoning | critic | verifier | observation | action | reflection | delegation | query | intent)
  → GraphStore: attention, promote, consolidate rules
  → AuditStore: hash chain SHA-256, previousHash
```

## Garantía

- `service.kernel` es opcional: si es `undefined`, fallback a chat estándar.
- `KERNEL_NONFATAL`: try/catch en `conversation.ts` y `model.ts`.

## Persistencia

- `pglite` en desarrollo, `pg` en producción.
- `InMemoryTurnStore` → `StoreTurnStore` listo (1 línea en `app.ts` para SOC-2 multi-pod).
- RLS opcional para Postgres real (`MULTI_TENANT_SHARED=true`).

## Tres workers distintos

| Worker | Ubicación | Qué hace |
|--------|-----------|----------|
| Scheduler de tareas durables | `apps/server/src/engine/worker.ts` | Lease, CAS, checkpoint, DLQ, recuperación |
| Proceso separado del scheduler | `apps/server/src/worker-entry.ts` | Requiere `DATABASE_URL`, `AGENTE_PROCESS_ROLE` |
| Browser worker Playwright | `apps/worker` | Navegación, capturas, lectura, interacción, descargas |

## Cuarto entorno

- `apps/computer`: contenedor de comandos y skills, con filesystem propio y restricciones. No es el browser worker.
