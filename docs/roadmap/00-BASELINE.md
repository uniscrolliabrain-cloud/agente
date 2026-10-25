# 00 — Baseline del repositorio (estado real hoy)

> Este documento se actualiza cuando cambia el estado del repo. Es la foto del punto de partida.

## Repositorio

- Ruta local: `C:\Users\Alfonso\Desktop\git hub repos\agente`
- Rama: `main`
- Último commit: `677f030 feat(runtime): B0-B10 — authz, idempotencia, kernel, embeddings, cuotas, aprobaciones`
- Tags: `pre-limpieza-2026-10-25`, `campaign-3-pre`

## Working tree

- 19 ficheros `M` (B0–B10 commiteados en `677f030`; `worker.ts` fuera).
- `worker.ts` sigue `M` (no commiteado, 1129 líneas, no es de B0–B10).
- Docenas de `??` untracked (repomix, docs de campañas viejas, `test-worker-start.ts`, `typecheck-worker.txt`, `audit-fallos-*.md`, `app.ts.bak-tenantLimiter`, `db-rls.ts.bak`).

## Estructura del repo

- `apps/server/src/` — servidor (kernel, engine, routes, services).
- `apps/web/src/` — frontend (React, 35 workspaces).
- `apps/computer/` — sandbox Python.
- `apps/worker/` — browser worker.
- `packages/domain/src/` — contratos Zod (actor, agent, goal, sop, business, capability, plan, outcome, verification, workspace-spec, assignment, flow).
- `packages/workspaces/` — catálogo de 34 workspaces.
- `packages/integrations/` — Google, PDF, vault, stubs.
- `tests/` — ~75 tests `node:test`.
- `scripts/` — seed, backup, migrate, audits.
- `docs/` — audits, miniaudits, roadmap (este folder), etc.
- `clientes/` — `_base`, `_example`, `default` (ontology + personas).

## Scripts de `package.json`

- `pnpm typecheck` — typecheck completo.
- `pnpm test` — `tests/*.test.ts` (NO incluye `tests/campaign-3/` ni anidados).
- `pnpm lint` — Biome.
- `pnpm build:server` — build del servidor.
- `audit:layers`, `audit:bridges`, `audit:console`, `audit:tenant-default`, `audit:idempotency`, `audit:contracts` — auditorías estáticas.
- `beta:smoke`, `beta:vertical` — pruebas operativas.
- `test:computer` — sandbox.
- `release:check`, `release:verify` — release.

## CI actual

`.github/workflows/ci.yml`:
- Job servidor: typecheck + tests + build.
- Job web: typecheck + build.
- Job worker: `continue-on-error: true` (**no bloquea**).
- Job integración: `continue-on-error: true` (**no bloquea**).

**Limitaciones detectadas**:
- `pnpm test` no descubre `tests/campaign-3/` ni tests anidados.
- El job del worker no bloquea.
- Las auditorías no se ejecutan como bloqueantes.
- No hay `release:check` en CI.

## Lo que está aplicado (B0–B10)

Commiteado en `677f030`:
- B0: authzMiddleware + governance con PDP + ctx.actorId.
- B1: CapabilityRunner con governance + requiresApproval. Executor all-skipped. Orchestrator outcome honesto.
- B2: idempotency key + 3 executors. Orchestrator verified=true.
- B3: workspaceCapabilityRegistry en agent.capabilities.
- B4: claim atómico + persistencia de resultado. embed() con apiKeyOverride.
- B5: embeddings por tenant. Meta con fastIdleMs/slowLongMs. maxSteps por tenant.
- B6: businessGraph en KernelDeps. initKernel al arrancar.
- B8: checkSpeedQuota. KernelBusEmitter. quiescenceMs. getApproval. message.edited.
- B9: blocked en Executor. replan summary honesto. tests E2E esqueleto. -pendientes.md.
- B10: approval solo executing/succeeded. claim con recuperación (done/claimed/failed/outcome_unknown).

## Lo que existe por bloque del compilador (evidencia parcial)

> Esta tabla se rellena cuando se audita cada etapa. Hoy es una estimación basada en el árbol del repo y los Repomix leídos.

| Bloque | Existe | Conectado | Invocado | Test | Evidencia |
|---|---|---|---|---|---|
| Definición empresarial | `PARCIAL` | `PARCIAL` | `PARCIAL` | `NO_EXISTE` | `clientes/_example/config.json`, `agentes.json`, `ontology.json` |
| Ontología y datos | `PARCIAL` | `PARCIAL` | `PARCIAL` | `NO_EXISTE` | `packages/domain/src/ontology.ts`, `ontology-seed.ts`, `business.ts`, `business-schema.ts` |
| Catálogo de capacidades | `EXISTE` | `EXISTE` | `EXISTE` | `PARCIAL` | `engine/capabilities/{bootstrap,registry}.ts`, `bridgeWorkspaceCapabilities` |
| Catálogo de procesos | `PARCIAL` | `PARCIAL` | `PARCIAL` | `NO_EXISTE` | `packages/domain/src/sop.ts`, `plan.ts` |
| Compilador de pipelines | `NO_EXISTE` | `NO_EXISTE` | `NO_EXISTE` | `NO_EXISTE` | — |
| Compilador de SOPs | `PARCIAL` | `PARCIAL` | `PARCIAL` | `PARCIAL` | `engine/sop-executor.ts`, `sop-triggers.ts` |
| Workforce | `PARCIAL` | `PARCIAL` | `PARCIAL` | `PARCIAL` | `engine/assignments/*`, `AgentTask.assignedTo` |
| Planificación | `NO_EXISTE` | `NO_EXISTE` | `NO_EXISTE` | `NO_EXISTE` | — |
| Configuración + permisos | `PARCIAL` | `PARCIAL` | `PARCIAL` | `PARCIAL` | `kernel/config/tenant-config.ts`, `env-resolver.ts`, `pdp.ts`, `pep.ts` |
| Inicialización | `PARCIAL` | `PARCIAL` | `PARCIAL` | `NO_EXISTE` | `bootstrapCapabilities`, `TenantService`, `provision-client.ts` |
| Operación continua | `PARCIAL` | `PARCIAL` | `PARCIAL` | `PARCIAL` | `TaskWorker`, `BusinessOSOrchestrator` |
| Verificación + evolución | `PARCIAL` | `PARCIAL` | `PARCIAL` | `PARCIAL` | `verification/{verifier,llm-verifier}.ts`, `learning/observer.ts` |

> **Nota**: esta tabla es una **estimación** basada en lo leído. La auditoría real de la etapa 1 la convierte en evidencia verificable (fichero + línea + test).

## Tests existentes

- ~75 tests en `tests/` (kernel, worker, tenant, policy, memory, rag, context, orchestrator, sop-triggers, crash-recovery, concurrency, campaign-2/*).
- `tests/campaign-3/` creado en B9 con 1 test implementado (`e2e-06-all-skipped`) y 3 esqueletos con skip (`e2e-01`, `e2e-04`, `e2e-02..12-skip`).
- **Ningún test de compilador de empresas.**

## Lo que falta para una primera empresa operativa

Ver `01-AUDITORIA-ARQUITECTURA.md` y las etapas 02–06. Resumen:
- Compilador de pipelines: no existe.
- Planificación: no existe.
- Bootstrap de tenant: parcial.
- Flujo end-to-end definición → empresa operativa: no existe.
- Tests del compilador: no existen.

## Cómo se actualiza este documento

- Cuando cambia el estado de Git (commit nuevo, rama nueva, tag).
- Cuando cambia `package.json` o `.github/workflows/ci.yml`.
- Cuando se audita una etapa (se actualiza la tabla de bloques).
- Cuando se cierra una etapa (se actualiza en `README.md`).