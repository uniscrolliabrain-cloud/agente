# 00 — Baseline del repo al empezar el vertical slice

> Estado real del repositorio en el momento de arrancar este vertical slice. Se actualiza cuando cambia el estado.

## Repositorio

- Rama: `main`
- Último commit conocido: B0-B10 + Bloques 1-6 + roadmap (pendiente de commit al cerrar el vertical slice)
- Working tree: `worker.ts` fuera del commit. Docenas de `??` untracked (repomix, docs de campañas viejas, `test-worker-start.ts`, `typecheck-worker.txt`, `audit-fallos-*.md`, backups).

## Lo que ya existe (motor)

| Pieza | Estado | Evidencia |
|---|---|---|
| Kernel (turnos, thoughts, attention, promoter, consolidate, presenter, meta) | Funcional | `apps/server/src/kernel/` |
| Chat (conversation, model, model-chain) | Funcional | `apps/server/src/engine/conversation.ts`, `model.ts`, `model-chain.ts` |
| Tareas durables (worker, leases, checkpoints, dead-letter, CAS) | Funcional | `apps/server/src/engine/worker.ts` |
| Authz (PDP, PEP, policy engine, withRead/withWrite) | Funcional | `apps/server/src/engine/authz/` |
| Gobernanza (AgentGovernance) | Funcional | `apps/server/src/engine/agents/governance.ts` |
| Idempotencia (claim atómico + recuperación) | Funcional | `apps/server/src/engine/idempotency.ts`, `capability-runner.ts` |
| Event bus + SSE | Funcional | `apps/server/src/engine/events/` |
| Memoria + RAG + embeddings por tenant | Funcional | `apps/server/src/engine/memory.ts`, `rag.ts`, `embeddings.ts` |
| Orquestador (planner, executor, verifier, replanner) | Funcional | `apps/server/src/engine/orchestrator/orchestrator.ts` |
| Workspaces (registry, dispatcher, bridge) | Funcional | `apps/server/src/engine/workspaces/`, `packages/workspaces/` |
| Multi-tenant (TenantService, TenantScopedStore) | Funcional | `apps/server/src/engine/tenant.ts`, `db-tenant.ts` |
| Auth (verifyJwtMiddleware, ActorService) | Parcial | `apps/server/src/engine/auth/jwt.ts`, `actors/service.ts` |

## Lo que falta para el vertical slice

| Pieza | Estado | Evidencia |
|---|---|---|
| Supabase Auth con Google OAuth | No configurado | `config.authProvider` no es `"supabase"` en producción |
| `tenant_id` en JWT (Custom Access Token Hook) | No existe | No hay tabla `user_tenants`, no hay hook |
| Postgres real (Supabase) | No configurado | `config.databaseUrl` apunta a SQLite/in-memory |
| `clientes/_template/bundle.json` | No existe | Hay `clientes/_example/` pero no es template parametrizado |
| `provision-client.ts --from-template` | No existe | El actual es manual |
| Workspace "Leads" | No existe | Hay `WorkspaceModule` vacío para leads |
| WhatsApp Cloud API real | Stub | `packages/integrations/src/stubs/whatsapp.ts` |
| Teléfono (Twilio + Whisper + TTS) | No existe | — |
| `query_business` con `source: "sheets"` | Parcial | Enum existe, implementación no confirmada |
| SOP `responder_lead` | No existe | — |
| UI mínima (Leads, Citas, Conversaciones, Procesos) | No existe | 35 workspaces existen, pero no los del vertical slice |
| Stripe real | Stub | `packages/integrations/src/stubs/stripe.ts` |

## Deudas de producción que bloquean el piloto

| ID | Deuda | Fichero |
|---|---|---|
| FIX 05 | `KernelPort` no inyectado en `conversation.ts`/`model.ts` (solo type-only) | `conversation.ts`, `model.ts` |
| FIX 12 | Tres rutas de apertura/cierre de turno | `conversation.ts`, `model.ts`, `sop-executor.ts` |
| FIX 48 | `at-most-once` vs `at-least-once` no distinguen en `CapabilityRunner` | `capability-runner.ts` |
| FIX 50 | `outcome_unknown` no distingue en `executor.execute` | `executor.ts` |
| FIX 53 | `ALLOWED_TASK_TRANSITIONS` no se valida en runtime | `worker.ts` |
| CI | `continue-on-error` en worker, `pnpm test` no descubre `tests/**` | `.github/workflows/ci.yml`, `package.json` |
| `worker.ts` | Fuera del commit, contenido desconocido | `apps/server/src/engine/worker.ts` |

## Próximo paso

Ejecutar el Bloque 0 del plan (`02-PLAN-15-SEMANAS.md`): resolver `worker.ts`, CI bloqueante, smoke de arranque, 5 deudas de runtime, tests de aislamiento.