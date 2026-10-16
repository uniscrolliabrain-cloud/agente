# Merge backend Laia + 12 agentes a main

> v1 · 2026-10-09 · Estado: aplicado

## Qué se ha mergeado

Commit `ab92ac9` en `main` (fast-forward desde `feat/backend-laia-to-main`).

### Ficheros backend

- `apps/server/src/app.ts` — bootstrap `_example`, ontología, fix `clientsDir`.
- `apps/server/src/kernel/kernel.ts` — `listTurnsAllPersonas`, `attentionOfPersona`, `attentionPairs`.
- `apps/server/src/kernel/graph/store-store.ts` — `listTurnsForOwner`.
- `apps/server/src/engine/worker.ts` — restaurado + `maxActive` + union de Store.
- `apps/server/src/engine/service.ts` — Meta, Consolidate, Promoter supervisores.
- `apps/server/src/engine/agents/personas/routes.ts` — `/all/nodes`, `/:id/attention`, `/refresh-stats`, fix arquetipo, fallback owner.
- `apps/server/src/engine/agents/personas/activity.ts` — filtro relajado.
- `apps/server/src/notifications-stream.ts` — modo supervisor.
- `apps/server/src/engine/capabilities/bootstrap.ts` — `actionType`/`family` (parcial).

### Datos de clientes

- `clientes/default/ontology.json`
- `clientes/default/personas/_index.json`
- `clientes/default/personas/<id>/persona.json` × 12
- `clientes/default/personas/<id>/stats.json` × 12

### Tests

- `tests/laia-hierarchy.test.ts`

## Qué NO se ha mergeado (queda en feat/ui-campaign)

Frontend completo:

- `apps/web/src/App.tsx` (modificado)
- `apps/web/src/api/agentPersonas.ts` (nuevo)
- `apps/web/src/contexts/AgentWindowContext.tsx` (nuevo)
- `apps/web/src/hooks/useAgentPersonas.ts` (nuevo)
- `apps/web/src/hooks/useAgentNode.ts` (nuevo)
- `apps/web/src/components/agents/` (toda la carpeta)
- `apps/web/src/components/ChatPanel.tsx` (modificado)
- `apps/web/src/components/TopBarV2.tsx` (modificado)
- `apps/web/src/components/AgentsView.tsx` (borrado)
- `docs/ui/MAPA-AGENTES.md` (nuevo)
- `docs/audits/27-ui-agentes-estado-y-plan.md` (nuevo)
- `docs/audits/30-backend-cohesion-audit.md` (nuevo)

## Marcas backend aplicadas

- `LAIA_12_PERSONAS_V1`
- `LAIA_BOOTSTRAP_EXAMPLE_V1`
- `KERNEL_LIST_TURNS_ALL_PERSONAS_V1`
- `KERNEL_ATTENTION_OF_PERSONA_V1`
- `KERNEL_ATTENTION_PAIRS_V1`
- `PERSONAS_ALL_NODES_V1`
- `PERSONAS_ARCHETYPE_FIX_V1`
- `PERSONAS_ATTENTION_V1`
- `PERSONAS_STATS_REFRESH_BUTTON_V1`
- `NODE_FALLBACK_OWNER_V1`
- `NOTIF_SUPERVISOR_MODE_V1`
- `META_LOOP_SUPERVISOR_V1`
- `CONSOLIDATE_SUPERVISOR_V1`
- `PROMOTER_SUPERVISOR_V1`
- `ACTIVITY_FILTER_RELAX_V1`
- `WORKER_DB_UNION_V1`
- `WORKER_MAX_ACTIVE_V1`
- `ONTOLOGY_VALIDATE_WIRE_V1`
- `ONTOLOGY_BUNDLE_LOAD_V1`
- `ONTOLOGY_BUNDLE_CLIENTSDIR_FIX_V1`
- `LAIA_HIERARCHY_TEST_V1`
- `LAIA_HIERARCHY_NO_ATTENTION_V1`

## Pendiente

- Tests preexistentes rotos: `tests/event-bus.test.ts` (3 errores TS1117). No son del merge.
- Frontend sin mergear hasta que esté limpio (ver `docs/ui/MAPA-AGENTES.md`).
- Los 3 errores preexistentes de tests (`engine.test.ts`, `worker-concurrency.test.ts`, `worker-metrics.test.ts`).

## Referencias

- `docs/ui/MAPA-AGENTES.md`
- `docs/audits/27-ui-agentes-estado-y-plan.md`
- `docs/audits/_pendientes.md`