# Etapa 05 — Completar compilador + conectar artefactos con runtime

## 1. Objetivo y alcance

Garantizar que lo que el workspace produce (etapa 02) es consumido por el runtime real (etapa 06). No basta con que exista el compilador: sus artefactos tienen que llegar a `app.ts`, `service.ts`, `worker`, `orchestrator`, `kernel`.

## 2. Subsistemas involucrados

- `apps/server/src/app.ts` — composición.
- `apps/server/src/engine/service.ts` — `AgentService`.
- `apps/server/src/engine/orchestrator/orchestrator.ts` — ejecución.
- `apps/server/src/engine/worker.ts` — tareas durables.
- `apps/server/src/kernel/kernel.ts` — turnos.
- `packages/domain/src/plan.ts`, `sop.ts`, `capability.ts`, `outcome.ts`.

## 3. Fases y tareas

- [ ] Fase 1 — Contrato compilador→runtime: `TenantBundle` + `ProcessGraph` + `AgentConfig` → `RuntimeConfig`.
- [ ] Fase 2 — Validación previa a bootstrap: `validateBundle` + `validateProcesses` + `validateAgents`.
- [ ] Fase 3 — Bootstrap reproducible: `bootstrapTenant(bundle)` en `app.ts` / `provision-client.ts`.
- [ ] Fase 4 — Verificar que cada artefacto es consumido: capabilities → `CapabilityRegistry`; procesos → `Orchestrator`; SOPs → `SOPExecutor`; agentes → `PersonaRegistry` + `AssignmentService`.
- [ ] Fase 5 — Errores de compilación: qué pasa si un artefacto no valida, si falta dependencia, si la versión no encaja.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Existe `TenantBundle` y `RuntimeConfig` con schema Zod | `packages/domain/src/bundle.ts` (nuevo) |
| A2 | `bootstrapTenant` está cableado en `app.ts` | `Select-String "bootstrapTenant" app.ts` |
| A3 | Cada artefacto del bundle se inyecta en su registry real | `Select-String` del registry |
| A4 | Un bundle inválido no arranca el tenant | Test de aceptación |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Un bundle válido se bootstrappea | `tests/roadmap/etapa-05.test.ts` | `bootstrapTenant(bundleVálido)` → tenant operativo |
| T2 | Un bundle inválido no arranca | idem | `bootstrapTenant(bundleRoto)` → error explícito |
| T3 | Las capabilities del bundle están en el registry | idem | `agent.capabilities.list()` contiene las del bundle |
| T4 | Los agentes del bundle están en `PersonaRegistry` | idem | `personaRegistry.list(tenantId)` los contiene |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| `TenantBundle` | `NO_EXISTE` | — |
| `RuntimeConfig` | `NO_EXISTE` | — |
| `bootstrapTenant` | `PARCIAL` | `scripts/provision-client.ts` (existe, pero ¿cableado en app.ts?) |
| Capabilities del bundle → `CapabilityRegistry` | `PARCIAL` | `bridgeWorkspaceCapabilities` en `app.ts` |
| Procesos del bundle → `Orchestrator` | `NO_EXISTE` | — |
| SOPs del bundle → `SOPExecutor` | `PARCIAL` | `SOPExecutor` existe; ¿lee del bundle? |
| Agentes del bundle → `PersonaRegistry` | `PARCIAL` | `bootstrapPersonas` en `app.ts` |
| Validación previa a bootstrap | `NO_EXISTE` | — |

## 7. Brecha

- [ ] `packages/domain/src/bundle.ts` con `TenantBundle` + `RuntimeConfig`.
- [ ] `bootstrapTenant(bundle)` cableado en `app.ts`.
- [ ] Validación previa que impida arrancar un tenant con bundle inválido.
- [ ] Test que demuestre que cada artefacto llega a su registry.

## 8. Handoff

- [ ] `TenantBundle` + `RuntimeConfig` → etapa 06.
- [ ] `bootstrapTenant` → etapa 10 (piloto).

## 9. Miniroadmaps internos

`05-compilador-runtime/` con fases 1–5.