# C00 — Auditoría profunda del sistema existente, mapa de sustitución y baseline reproducible
**Programa:** Opción 3 · rediseño cognitivo y conversacional de `uniscrolliabrain-cloud/agente`.
**Turno:** 01/16 · **Fecha:** 2026-11-15 · **Estado:** AUDITORÍA ESTÁTICA PARCIAL DOCUMENTADA; ejecución de tests PENDIENTE.
**Repositorio hijo contrastado:** `uniscrolliabrain-cloud/agntia-ciberseguridad`, solo para compatibilidad de contratos y futura C14.
**Decisión vinculante:** [ADR-009](../ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md). **NO conservar legacy como arquitectura objetivo.**

## 0. Objetivo y límites
El resultado de C00 debe permitir a Freebuff y Codex construir **la arquitectura sustitutiva** de AgntiaPro sin romper permisos, datos, rutas críticas o ejecución determinista. C00 es auditoría de código, no desarrollo de features ni certificación. Nunca equiparar lectura de fuente con prueba ejecutada.

**Destino:** kernel autoritativo + eventos durables + proyector cognitivo + grafo multicapa + cinco memorias + cromos/atención + Slow productor asíncrono + clasificador JEV no autoritativo + Card V2 + Context Serving + Fast de baja latencia + Presenter/Anam + Cyber bridge.

## 1. Fuentes leídas directamente en GitHub, ref main
### Repo padre (código)
- `package.json`: SHA de archivo `c1af1a269f10c9e91ed7c2eecfd8397f96e1ff8d`; scripts `pnpm typecheck`, `pnpm test`, `pnpm gate`, `pnpm verify:slice`, `pnpm test:browser`, `pnpm audit:contracts`, `pnpm audit:idempotency`, `pnpm audit:tenant-default`, `pnpm audit:coherence`, `pnpm audit:layers`, `pnpm audit:bridges`.
- `pnpm-workspace.yaml`: SHA `017f689b7502a6d903f55b6ea43ee4954c0f4528`; `apps/*`, `packages/*`, `workspaces/*`.
- `apps/server/src/engine/conversation.ts`: SHA `63b5ea67765180a4822b7debde3fd60489cb8000`, 1469 líneas; inspeccionadas 960–1185 y búsquedas de delegación.
- `apps/server/src/engine/model.ts`: SHA `34989a4887c242d5b331e61620dacd4c5f055770`, 809 líneas; inspeccionadas 640–715.
- `apps/server/src/engine/service.ts`: SHA `a5f7ac6932c70066dd1e6a8f94edf8e67efe5dcb`, 3168 líneas; inspeccionadas 700–800.
- `apps/server/src/engine/context/cognition-cards.ts`: SHA `3c6df6d14fcd0cd7b4617c99304d6a2b600a49fe`, 110 líneas; leída íntegra.
- `apps/server/src/kernel/cognition/card-store.ts`: SHA `cbb1259b202ffb25a79511bdb927fa5c0199c41f`, 228 líneas; localizados métodos y lectura previa.
- `apps/server/src/engine/events/bus.ts`: SHA `21fe61384c6f12002d2e41bea172819c607629c7`, 311 líneas; inspeccionadas 90–185.
- `apps/server/src/kernel/subscribers/events.ts`: SHA `83ea2edeecf84113f414e154bbb743c9097d149e`, 128 líneas; inspeccionadas 35–85.
- `apps/server/src/kernel/cromos/cromo.ts`: SHA `6efd66840dc85944884a1c2d0dcf3042e49e4629`, 16 líneas; `CROMOS_PENDING_V1`.
- `packages/domain/src/cognition-card.ts`: SHA `4817c9688f37508922a3237a184ad309a9352160`, 81 líneas; schema V1.
### Documentación previa (lectura obligatoria)
- `docs/auditoria-integral-30-angulos/03-harness-conversacional/ultragranular-opcion-3/05-PLAN-IMPLEMENTACION-PATCHSETS-GATES-TESTS-HANDOFF.md` en rama `docs/audit-30-dominios-runtime-20261115`. **Secuencia canónica C00–C15**; no reemplazar por numeración alternativa.
- `docs/auditoria-integral-30-angulos/03-harness-conversacional/ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md` en esta rama.
- `PREFLIGHT-C00-COMPATIBILIDAD-NO-DESTRUCCION.md` en esta rama, subordinado a ADR-009.
### Cyber: solo contrato de integración
- `agntia_ciberseguridad/contracts.py`: Pydantic V1; `Job.state` permite `succeeded` mientras `jobs/contracts.py` usa estados terminales `completed`, `partial`, etc. **Verificar representaciones y mapper real, no concluir bug sin trazar conversiones**.
- `agntia_ciberseguridad/jobs/schema.py`: tablas jobs, idempotencia, reservas, resultados, observaciones append-only.
- `agntia_ciberseguridad/jobs/worker.py`: claim, lease, heartbeat, fence, cancel, reconcile; no scheduler empresarial.
- `agntia_ciberseguridad/events/outbox.py`: outbox transaccional local con poll/ACK, hash, consumer_id, ejemplo de inbox; no scheduler ni entrega remota.
- `docs/integration/PATCHSET-AGENTE.md`: SDK TS server-only privado y no integrado en `/agente`; 3 tools nominadas de lectura; no reenviar auth del navegador.
- `docs/autodoc/BASELINE-AUDIT.md`: reporta 196 tests Python OK (8 skip), SDK 6 pass/1 skip, 84 rutas, 8 migraciones, demo no producción. **Resultados históricos documentados, NO reejecutados aquí.**

## 2. Hallazgos reproducibles y clasificación preliminar
| ID | Fuente | Comportamiento observado | Riesgo/limitación | Tratamiento V2 |
|---|---|---|---|---|
| C00-F01 | conversation.ts ~985–1020 | `assembleCognitionCards` se llama por turno; evento `cognition.card.injected` best-effort | La tarjeta se reclama antes de respuesta efectiva | SUSTITUIR por ContextServing + ledger; V1 legacy temporal |
| C00-F02 | cognition-cards.ts 10–13, 40–58, 90–110 | MAX_CARDS=3; MAX_BODY_CHARS=700; MAX_BLOCK_TOKENS=700; `markConsumed` previo a render | Contexto one-shot y budget por heurística chars/4 | SUSTITUIR; no heredar límites como requisitos |
| C00-F03 | conversation.ts ~1028–1095 | Fast tenant, Slow como fallback, modelo de rol con prioridad, global fallback | Acoplamiento de disponibilidad y latencia entre modelos | SUSTITUIR routing, conservar cuotas/política de fallback explícitas |
| C00-F04 | conversation.ts ~1098–1150 | Guardrails de coste/tokens/velocidad, timeout firstByte 8000ms y total 45000ms configurables | Métricas actuales no prueban SLA final | REUTILIZAR guardrails válidos; medir TTFT y p95 |
| C00-F05 | conversation.ts ~1160–1185 | `release` de cards en error de stream, no transacción con entrega | Posible pérdida o ambigüedad de entrega | SUSTITUIR por ledger y ACK de delta |
| C00-F06 | model.ts ~650–707 | Slow abre child turn antes de cerrar padre, captura Thought/Card, dedupe taskId | Diseño de autoría síncrona y revisiones colapsadas | REDISEÑAR captura async, preservar hechos/provenance |
| C00-F07 | bus.ts ~90–180 | sink.write→publish live; dedupe explícito; errores devuelven persisted:false | Caller puede ignorar fallo de persistencia | REUTILIZAR tipos/bus solo tras reforzar receipts; proyector durable nuevo |
| C00-F08 | subscribers/events.ts ~48–85 | subscribeAll con `void async` a `runCognitionCycle` | Sin ACK/replay durable en ese subscriber | SUSTITUIR proyección live por consumer recuperable |
| C00-F09 | service.ts ~700–800 | maintain invoca meta/consolidate; registra seis consumers globales | Ya existe trabajo útil, riesgo de duplicar efectos | REUTILIZAR tras caracterización; aislar nueva proyección |
| C00-F10 | service.ts ~728–765 | `consolidateTurnIfKernel` usa `owner:tenantId` y `actorId:tenantId` | Auditar ownership/actor y semántica de permisos | PENDIENTE auditoría de identidad y stores |
| C00-F11 | cromos/cromo.ts | `CROMOS_PENDING_V1` | No afirmar que cromos operan end-to-end | COMPLETAR tras inspección grafo/attention |
| C00-F12 | packages/domain/cognition-card.ts | contrato V1 estricto | V2 no debe inyectar campos en parser V1 | VERSIONAR contrato; adapter y migración |
| C00-F13 | Cyber outbox.py | eventos de operaciones seleccionadas, poll/ACK at-least-once | No es stream universal; no equivale a integración con bus padre | ADAPTADOR C14; ledger consumer idempotente |
| C00-F14 | Cyber contracts.py y jobs/contracts.py | nombres de estados difieren entre modelos | Riesgo de traducción incorrecta | Matriz estados en C01/C14; no inventar mapping |
| C00-F15 | Cyber SDK doc | `@agntia/ciberseguridad` privado, server-only, no instalado en padre | No hay bridge real probado | C14, no fusionar runtimes ni introducir shell |

## 3. Grafo de flujo provisional (hechos vs hipótesis)
```text
USUARIO → ConversationAgent (conversation.ts)
  ├─ context.assemble (rol/recall) [EXISTE; inspeccionar implementación]
  ├─ assembleCognitionCards → CardStore.pending/markConsumed [EXISTE; legacy]
  ├─ tenant config → modelChain(role/fast/slow/global) [EXISTE]
  ├─ guardrails → BuiltInAgent stream [EXISTE]
  └─ kernel turn + respuesta/close [EXISTE; confirmar todas las rutas]
DELEGACIÓN → tarea durable → executeModelTask (model.ts)
  ├─ Slow LLM + herramientas autorizadas [EXISTE]
  ├─ child turn → captureSlowCognition → Thought/Card [EXISTE]
  └─ bus.emit(cognition.card.created) → live subscribers [EXISTE]
EVENT BUS → sink.write → globalSubscribers.publish → kernel subscriber
  └─ runCognitionCycle async [EXISTE; no demuestra replay]
CYBER (REPO HIJO) → FastAPI/SQLite outbox/SDK [EXISTE]
  └─ integración efectiva en AgntiaPro [NO VERIFICADA / documentada pendiente]
DESTINO V2 (NO IMPLEMENTADO):
  Bus durable → projector/replay → graph + memories + cromos + attention
  → Slow/JEV CardV2 → snapshot/delta/reference → Context Serving
  → Fast chat / Anam / Presenter
```

## 4. Olas de auditoría C00: instrucciones precisas
### W0 — Congelación de referencias y árbol
1. Registrar SHA commit de `main` de padre e hijo y de ramas de documentación; los SHA de archivos arriba **no sustituyen** SHA commit.
2. Listar paquetes, scripts, rutas, stores, workers, apps, UI, tests, dependencias y schemas. Distinguir archivos reales de rutas propuestas.
3. Revisar ramas en progreso y worktrees solo si la herramienta lo permite; marcar NO VERIFICADO si no.
4. Crear `C00/evidence/REPO-SHAS.md`, `TREE.md`, `BRANCH-MATRIX.md`, `DEPENDENCY-LOCKS.md`.
5. Gate: ningún path de patchset sin existencia comprobada o etiqueta NUEVO.

### W1 — Trazado Fast, Slow, Presenter y turn lifecycle
1. Inspeccionar `engine/conversation.ts` completo, `engine/model.ts`, `engine/model-chain.ts`, `engine/context/assembly.ts`, `kernel/authors/*`, `kernel/observers/presenter.ts`.
2. Buscar call sites de `shouldDelegateToSlow`, `captureSlowCognition`, `openChildTurn`, `closeTurn`, `runWithModelFallback`.
3. Trazar cada await en hot path y todos los puntos de fallbacks, quotas, roles y streaming; medir con instrumentación y fixtures.
4. Dibujar secuencia de éxito, timeout, fallback, Slow caído, aprobación pendiente, interrupción de voz.
5. Entregar `CALL-GRAPH.md`, `HOT-PATH.md`, `FAILURE-MODES.md`; marcar SUSTITUIR/REUTILIZAR/LEGACY por función, no solo archivo.

### W2 — Stores, eventos y proyección durable
1. Inspeccionar `engine/events/{bus,subscriber,types}.ts`, sink real, `kernel/subscribers/*`, `kernel/cognition/*`, stores y DB adapters.
2. Trazar `persisted:false`, `dedupeKey`, source, tenant, correlation/causation, subscriber exceptions, replay y cron/maintain.
3. Identificar persistencia de eventos, si hay cursor durable, atomicidad, orden por tenant, retención, backpressure, dead-letter.
4. Modelar crash antes/después de persist, antes/después de ACK y replay concurrente; no confundir entrega de red con efecto exactly-once.
5. Entregar `EVENT-CATALOG.md`, `STORE-MATRIX.md`, `REPLAY-GAPS.md`.

### W3 — Cinco memorias, grafo, cromos y atención
1. Inspeccionar `engine/memory.ts`, `engine/memory/` si existe, `engine/rag/`, `kernel/graph/`, `kernel/cromos/`, `kernel/observers/meta.ts`, sus tests.
2. Recuperar los **cinco tipos de memoria exactos** del código o especificación fuente; si no están, emitir decisión pendiente, sin inventar taxonomía.
3. Inventariar embeddings, scopes, owner, TTL, tombstones, invalidación, edge types, thought provenance, scoring y consolidación.
4. Trazar una memoria creada→recuperada→promovida→revocada y verificar que no reaparece en prompts.
5. Entregar `FIVE-MEMORIES.md`, `GRAPH-ONTOLOGY.md`, `ATTENTION-CROMOS-GAPS.md`.

### W4 — Contratos, tenancy y rutas de ejecución
1. Leer `packages/domain/src/cognition-card.ts`, context/kernel schemas, `cognition-routes.ts`, auth, policy, approvals, SOP executor, worker.
2. Revisar owner vs tenant vs actor vs agent vs role en cada ruta y store; no confiar en valores del navegador o LLM.
3. Clasificar cambios de schema: backward-compatible, versioned, migration required, forbidden.
4. Construir pruebas negativas: cross-tenant, actor revocado, prompt injection, event forging, wrong correlation, stale revision.
5. Entregar `CONTRACT-MATRIX.md`, `TENANCY-ACL.md`, `AUTHORITY-BOUNDARY.md`.

### W5 — Interfaces Cyber, Anam, UI y repos hijos
1. Leer contrato Cyber en Python, SDK TS, outbox y mapeo de estados; **solo integración**, no rehacer producto Cyber.
2. Inventariar adaptadores reales de Anam, voz, WebRTC, SSE, UX chat/tasks/control-center, estados pedagógicos y receipts.
3. Revisar import boundaries del monorepo y mecanismos de plugin/child repos; no asumir acceso directo a runtime Python.
4. Entregar `CHILD-CONTRACTS.md`, `CHANNEL-MATRIX.md`, `LEGACY-DECOMMISSION-MAP.md`.

### W6 — Baseline, pruebas y gate
1. Preparar checkout reproducible; `corepack pnpm install --frozen-lockfile` si lock disponible y entorno autorizado.
2. Ejecutar `pnpm typecheck`, `pnpm test`, `pnpm gate`, `pnpm verify:slice`, `pnpm test:browser` donde dependencias y servicios lo permitan; guardar salida y exit code de **cada** comando.
3. Ejecutar tests focalizados cognition, kernel, tenant, events, fallback, memory, streaming; registrar skips y fixtures.
4. Medir TTFT, total, hot-path awaits, DB calls, tokens, costo y event lag con método reproducible; no inventar objetivos ni cifras.
5. Revisar con Codex independientemente; clasificar FAIL/BLOCKED/NOT_RUN.
6. Entregar `TEST-BASELINE.md`, `LATENCY-BASELINE.md`, `RISK-REGISTER.md`, `EXECUTION-REPORT.md`.
7. **Gate C00:** sin ruta crítica sin clasificar, sin decisión de destino sin evidencia y sin test omitido sin explicación. Si no puede ejecutarse test, estado PARTIAL.

## 5. Patchsets de documentación (no código)
- PS00.1 `C00/evidence/REPO-SHAS.md` + árbol y ramas.
- PS00.2 `C00/evidence/CALL-GRAPH.md` + hot path.
- PS00.3 `C00/evidence/EVENT-CATALOG.md` + replay.
- PS00.4 `C00/evidence/FIVE-MEMORIES.md` + graph/cromos.
- PS00.5 `C00/evidence/CONTRACT-MATRIX.md` + tenancy.
- PS00.6 `C00/evidence/CHILD-CONTRACTS.md` + Anam/UI.
- PS00.7 `C00/evidence/TEST-BASELINE.md` + reportes y gate.
Estas rutas son **entregables propuestos**, no afirmar que existen antes de crearlos.

## 6. Riesgos P0 y mitigación
- **P0-01:** doble proyección live/replay → ledger idempotente, shadow, fencing.
- **P0-02:** persistencia de evento no garantizada por `await emit` → comprobar `persisted`, diseño de receipt/outbox.
- **P0-03:** filtración tenant/actor por fallback → scopes derivados de auth y tests cross-tenant.
- **P0-04:** pérdida de contexto por consumo one-shot → ledger de delta y snapshot V2.
- **P0-05:** Fast bloqueado por Slow/LLM fallback → APIs independientes y circuit breaker por SLA.
- **P0-06:** child-turn acoplado a captura Slow → diseñar autoría async con provenance, no abrir hijo sobre padre cerrado.
- **P0-07:** schemas V1 strict y cambios in-place → V2 versionada y adapters.
- **P0-08:** estados Cyber `succeeded/completed/partial` → mapping verificado en API, worker y SDK.
- **P0-09:** supuesta existencia de cinco memorias y cromos activos → inventario real y gap explícito.
- **P0-10:** progreso UI simulado como ejecución → timeline solo con receipts reales; fases pedagógicas separadas.

## 7. Orden de ejecución y relación con C01
C00 no implementa ni conserva arquitectura V1. **Entrega una matriz verificable para reemplazarla**. C01 usará sus contratos y gaps para definir V2. Cada campaña posterior debe releer los reportes anteriores y auditar código actualizado; nunca ejecutar un plan viejo contra HEAD nuevo sin revalidación.

## 8. Reporte de este turno
```yaml
campaign: C00
turn: 1/16
repo_primary: uniscrolliabrain-cloud/agente
repo_child_integration_only: uniscrolliabrain-cloud/agntia-ciberseguridad
branch: audit/preflight-cognition-option3-20261115
status: PARTIAL_STATIC_AUDIT_DOCUMENTED
source_read: selected_main_files_and_previous_docs
tests_executed: false
commit_sha_main: NOT_VERIFIED
file_shas: recorded_above
runtime_changed: false
deploy: false
merge: false
next: C01_after_C00_evidence_gates_or_explicit_blockers
```
