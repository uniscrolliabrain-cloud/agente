# C15 — Certificación integral E2E, gates, aceptación y handoff operativo de C00–C15

**Turno 16/16 · 2026-11-15 · Repo principal:** `uniscrolliabrain-cloud/agente` · **rama documental:** `audit/preflight-cognition-option3-20261115`. **Estado de C15:** auditoría estática de cierre, especificación de ejecución, matriz de aceptación y protocolo de certificación; **NO es una certificación aprobada**. No se ejecutaron comandos del repo ni pruebas E2E, no se modificó runtime, no hubo merge/deploy. Repositorio hijo de ciberseguridad permanece autónomo.

## 0. Veredicto inequívoco
**DOCUMENTACIÓN C00–C14: 15/15 archivos verificados en la rama por fetch GitHub. C15: creado por esta campaña.** ADR-009 aprobó opción 3: reemplazar arquitectura conversacional/cognitiva V1 donde no cumple; migrar con seguridad sin convertir paridad legacy en criterio de éxito. **IMPLEMENTACIÓN V2: NOT_VERIFIED / NO ACREDITADA.** **CERTIFICACIÓN E2E: NOT_RUN.** **PRODUCCIÓN: NO-GO.** Ningún documento, test V1 o estado parcial del middleware hijo demuestra cumplimiento V2.

## 1. Fuentes de verdad y trazabilidad
- `docs/auditoria-integral-30-angulos/03-harness-conversacional/ADR-009-REDISENO-SUSTITUTIVO-LEGACY-TRANSITORIO.md` blob `efc6e84ef53ead6311150c35570e2a3562d835d5`: decisión vinculante y criterios V2.
- `docs/auditoria-integral-30-angulos/03-harness-conversacional/BITACORA-DECISIONES-Y-RESPUESTAS.md` blob al inicio C15 `d1f49d7e3d1d374e9cddd6446a7c83723a0efd93`: historial C00–C14.
- `package.json` blob `c1af1a269f10c9e91ed7c2eecfd8397f96e1ff8d`: scripts `pnpm typecheck`, `pnpm test`, `pnpm gate`, `pnpm verify:slice`, `pnpm test:browser`, `pnpm test:coverage`, `pnpm secrets:check`, `pnpm connections`, `pnpm audit:contracts`, `pnpm audit:idempotency`, `pnpm audit:bridges`, `pnpm release:verify`. Ejecutarlos en entorno controlado y capturar exit codes; **ninguno ejecutado por C15**.
- `pnpm-workspace.yaml` blob `017f689b7502a6d903f55b6ea43ee4954c0f4528`: `apps/*`, `packages/*`, `workspaces/*`.
- Hijo `agntia-ciberseguridad/docs/ESTADO-VIGENTE.md` blob `f08cbaa57a249c6c099650f76187e0550835e398`: 196 tests OK/8 skip y 84 rutas **reportados**; demo sintética, 2 PASS/40 PARTIAL, `production_enabled=false`. No afirmar que nosotros repetimos esos tests.
- Limitación: **HEAD commit exacto de padre/hijo no congelado** en esta sesión. Los SHAs anteriores son **blobs de archivos**, no commits de baseline. C15 W0 exige ambos commit SHAs y diff de rama contra main. No extrapolar auditoría completa del árbol.

### 1.1 Índice de entregables existentes, verificado uno a uno
| Campaña | Documento | Evidencia documental | Código V2 |
|---|---|---|---|
| C00 | [C00-REVISION-ULTRAGRANULAR-AUDITORIA-INCREMENTAL](./C00-REVISION-ULTRAGRANULAR-AUDITORIA-INCREMENTAL.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C01 | [C01-REVISION-ULTRAGRANULAR-CONTRATOS-Y-TAXONOMIA-V2](./C01-REVISION-ULTRAGRANULAR-CONTRATOS-Y-TAXONOMIA-V2.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C02 | [C02-EVENT-BUS-DURABLE-PROYECTOR-COGNITIVO-REPLAY](./C02-EVENT-BUS-DURABLE-PROYECTOR-COGNITIVO-REPLAY.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C03 | [C03-REVISION-ULTRAGRANULAR-GRAFO-COGNITIVO-MULTICAPA](./C03-REVISION-ULTRAGRANULAR-GRAFO-COGNITIVO-MULTICAPA.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C04 | [C04-CINCO-MEMORIAS-RECUPERACION-RAG-REVOCACION](./C04-CINCO-MEMORIAS-RECUPERACION-RAG-REVOCACION.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C05 | [C05-CROMOS-ONTOLOGIA-SEIS-POLARIDADES-MOTOR-V2](./C05-CROMOS-ONTOLOGIA-SEIS-POLARIDADES-MOTOR-V2.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C06 | [C06-ATENCION-GLOBAL-METACOGNICION-SELECTOR-V2](./C06-ATENCION-GLOBAL-METACOGNICION-SELECTOR-V2.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C07 | [C07-SLOW-LLM-ASINCRONO-THOUGHTS-TARJETAS-ENRIQUECIDAS](./C07-SLOW-LLM-ASINCRONO-THOUGHTS-TARJETAS-ENRIQUECIDAS.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C08 | [C08-JEV-CLASIFICADOR-SEMANTICO-NO-AUTORITATIVO](./C08-JEV-CLASIFICADOR-SEMANTICO-NO-AUTORITATIVO.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C09 | [C09-CARDSTORE-V2-DELIVERY-LEDGER-LEASE-ACK-REPLAY](./C09-CARDSTORE-V2-DELIVERY-LEDGER-LEASE-ACK-REPLAY.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C10 | [C10-CONTEXT-SERVING-FACADE-SNAPSHOTS-DELTAS-REFERENCIAS](./C10-CONTEXT-SERVING-FACADE-SNAPSHOTS-DELTAS-REFERENCIAS.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C11 | [C11-FAST-SLOW-APIS-INDEPENDIENTES-LATENCIA-STREAMING](./C11-FAST-SLOW-APIS-INDEPENDIENTES-LATENCIA-STREAMING.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C12 | [C12-PRESENTER-UX-STREAMING-ESTADOS-SVG-ACCESIBILIDAD](./C12-PRESENTER-UX-STREAMING-ESTADOS-SVG-ACCESIBILIDAD.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C13 | [C13-ANAM-AVATAR-VOZ-REALTIME-INTERRUPCIONES-SESIONES](./C13-ANAM-AVATAR-VOZ-REALTIME-INTERRUPCIONES-SESIONES.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C14 | [C14-BRIDGE-CIBERSEGURIDAD-PYTHON-TS-GOBERNANZA-EVIDENCIA](./C14-BRIDGE-CIBERSEGURIDAD-PYTHON-TS-GOBERNANZA-EVIDENCIA.md) | Verificado en rama (blob presente) | Implementación V2 NO VERIFICADA |
| C15 | Este documento | A verificar tras create_file | Plan de certificación, NO ejecución |

**Nota de integridad:** presencia de archivo ≠ revisión de contenido exhaustiva ≠ ejecución de campaña. Las C00–C14 fueron planes/auditorías estáticas; los patchsets descritos son propuestas de implementación, no commits de runtime.

## 2. Arquitectura destino y cadena de prueba obligatoria
```text
human/LAIA/Pedro/channel (web, voice, approved external bridges)
  → session tenant/actor/role → deterministic PDP/kernel/approvals
  → C11 independent Fast (low-latency) ← C10 ContextServingFacade
  ← C09 card revisions + delivery ledger ACK
  ← C02 durable EventBus/projector/inbox/replay
  ← C03 multilayer graph → C04 five memories/RAG
  ← C05 chromatic engine + C06 attention/global workspace
  ← C07 async Slow Thought/enriched cards + C08 optional JEV signal
  → C12 truthful Presenter + SVG/AG-UI
  → C13 Anam audiovisual adapter (optional provider verified)
  ↔ C14 cyber TS SDK → Python API (typed governed bridge)
```
**No hay autoridad LLM:** Fast, Slow, JEV, Pedro y avatar pueden sugerir y presentar; el kernel/policy/SOP/approval determina permisos y efectos. **Fast no bloquea** por Slow/JEV/cyber. **El estado mostrado se basa en receipts** y no en fases temporizadas ficticias. Contexto recuperado es información no confiable, no instrucciones.

## 3. Orden real de ejecución (no confundir número de campaña con dependencia estricta)
**Tronco A: seguridad/contratos/consistencia**
`C00 → C01 → C02 → C03`. C00 baseline y callgraph; C01 schemas V2; C02 event receipts/proyector durable; C03 graph projections versionadas. **Gate A:** tenant isolation, durable replay, idempotencia, crash recovery, policy boundary.

**Tronco B: conocimiento**
`C03 → C04 → C05` (ontología pendiente de aprobación) y `C03+C04 → C06`. C04 memorias y revocación; C05 cromos con ontología real aprobada; C06 atención global. **Gate B:** provenance, epistemic status, ACL y revocación en cada proyección. C05 no bloquea C10/C11 si chromatic se mantiene como módulo opcional no autoritativo y se registra explícitamente la deuda; sí bloquea la aceptación **total** de C15.

**Tronco C: producción asíncrona y consumo**
`C02+C03+C04 → C07`; `C07 → C08` condicional al proveedor; `C02+C07 → C09`; `C04+C06+C09 → C10`. C07 Slow durable; C08 clasificador JEV solo tras verificar API (fallback rules sin autoridad); C09 card ledger; C10 snapshots/deltas/refs. **Gate C:** no lost cards, ACK real, invalidación y continuidad cross-turn.

**Tronco D: interacción**
`C10 → C11 → C12`; `C11+C12 → C13` condicionado a Anam real. Fast/Slow independientes, Presenter factual y voice. **Gate D:** Fast TTFT real, no Slow fallback, stream cancel, UX accesible y no progreso ficticio.

**Tronco E: seguridad externa**
`C01+C02+C10+C12 → C14` + gates independientes del hijo. **Gate E:** SDK↔Python contract, doble autorización, no shell proxy, evidence refs, child demo no producción.

**C15** se ejecuta **después** de todos los gates; puede correr pruebas parciales tempranas por tronco, pero no emitir PASS integral hasta resolver todos los P0.

## 4. Matriz de aceptación E2E A01–A30
| ID | Escenario verificable | PASS solo con evidencia |
|---|---|---|
| A01 | Auth user→tenant→actor→role | actor y tenant derivados server-side; negativa cruzada |
| A02 | PDP deny by default | intento no autorizado sin efectos |
| A03 | Approval human | hash/objeto/versión/expiración vinculados |
| A04 | Event persist before ACK | crash tras write no pierde ni duplica efecto |
| A05 | Replay paginado | cursor durable, orden determinista y cierre |
| A06 | Duplicate/reordered event | proyección idempotente con revision |
| A07 | Poison event/DLQ | aislamiento y recuperación sin perder cursor |
| A08 | Graph multilayer | nodo/edge/provenance/tenant verificables |
| A09 | Five memory kinds | pruebas funcionales por memoria, no solo enum |
| A10 | Memory revocation | borrado/retractación propaga a snapshots/cards |
| A11 | RAG untrusted source | prompt injection no altera policy |
| A12 | Chromatic ontology | ADR founder, versión, invariantes y pruebas |
| A13 | Attention scoring | no confunde relevancia con autorización |
| A14 | Meta hints durable | replay y dedupe sin Set efímero |
| A15 | Slow async independent | Fast responde mientras Slow sigue en background |
| A16 | Thought/card provenance | source IDs, revision y evidencia recuperable |
| A17 | JEV conditional | proveedor verificado o baseline rules y estado BLOCKED externo |
| A18 | Card delivery ACK | no consumed-before-delivery, lease/fencing |
| A19 | Context snapshots/deltas | versión estable, referencias y watermarks |
| A20 | Context budget | tokenizer real/bounded global; sin fuga por overflow |
| A21 | Fast TTFT | p50/p95/p99 medidos; SLA acordado post-baseline |
| A22 | Fast no Slow fallback | fault injection Slow/JEV sin bloqueo Fast |
| A23 | Presenter truthful | cada estado factual tiene event/receipt |
| A24 | UI accessibility | captions, keyboard, reduced motion, live regions |
| A25 | Anam provider contract | SDK/API/consent/token/region probados en sandbox |
| A26 | Voice barge-in | epoch cancela output antiguo, no stale speech |
| A27 | Cyber read-only | SDK↔Python, tenant, actor y provenance |
| A28 | Cyber controlled job | grant, quota, approval, idempotency y no real client |
| A29 | Resilience | restart, DB failure, provider timeout, rollback y reconciliation |
| A30 | Migration legacy retirement | V2 sin imports obligatorios legacy, rollback y deprecation |

**Estados por escenario:** `PASS` con logs y exit code; `FAIL` evidencia de incumplimiento; `BLOCKED_EXTERNAL` si API/permiso/contrato no disponible; `NOT_RUN` sin ejecución; `PARTIAL` cobertura limitada. **NO equiparar BLOCKED/NOT_RUN con PASS.**

## 5. Hallazgos integrales C15-F01–F25
1. C00–C14 existen como archivos, confirmados mediante GitHub fetch.
2. ADR-009 exige sustitución V1, no preservación permanente.
3. No se ha demostrado implementación V2 por crear documentación.
4. C02 EventBus live V1 no acredita replay durable/ACK de proyección.
5. C03 Thought/Turn existentes no equivalen a grafo multicapa completo.
6. C04 MemoryService/RAG existentes no acreditan cinco memorias cognitivas.
7. C05 polaridades/dimensiones cromáticas siguen sin semántica aprobada.
8. C06 attentionOverlap/Meta no equivalen a workspace global durable.
9. C07 capture Slow→card V1 no equivale a pipeline asíncrono durable.
10. C08 API JEV no verificada; prohibido inventar endpoints o marcar integración PASS.
11. C09 consumed-before-ACK V1 exige reemplazo semántico.
12. C10 ensamblaje de contexto fragmentado no es ContextServingFacade V2.
13. C11 fallback Fast→Slow existente viola independencia objetivo.
14. C12 Presenter actual no garantiza timeline de eventos real.
15. C13 no tiene cliente Anam operativo identificado en main.
16. C14 hijo tiene SDK/API, pero sin wiring padre y sin aceptación de producción.
17. C14 child reporta 40 fases PARTIAL, por lo que no puede elevarse a listo.
18. Pruebas V1 que pasan no son aceptación funcional de V2.
19. No se han medido TTFT ni latencia audio E2E en esta sesión.
20. No se han reproducido cross-tenant, revocación, replay ni crash recovery V2.
21. Hay riesgos de compatibilidad semver SDK TS↔Python y schema events.
22. Contexto, RAG y findings pueden introducir prompt injection si no se aíslan.
23. Canales de voz y ciber pueden bloquear Fast si comparten pools.
24. Falta evidencia de corte de dependencias legacy y rollback probado.
25. El veredicto defendible hoy es `DOCS_READY_FOR_IMPLEMENTATION_REVIEW`, no `PRODUCTION_READY`.

## 6. Patchsets PS15.0–PS15.19 (propuestos; verificar paths)
**PS15.0** `docs/.../C15/evidence/BASELINE-BOTH-REPOS.md`: SHA commit main/branch, diff, node/python/pnpm, deps, secret inventory redactado.
**PS15.1** `docs/.../C15/evidence/CALLGRAPH-V2.md`: import/caller graph de Fast, Slow, bus, memories, cards, cyber, Anam.
**PS15.2** `packages/domain/src/cognition-v2-acceptance.ts`: schema de receipts y outcomes de certificación.
**PS15.3** `tests/e2e/cognition-v2/fixtures/**`: 2 tenants, 3 users por tenant, agentes LAIA/Marcos/Pedro sintéticos, sin datos reales.
**PS15.4** `tests/e2e/cognition-v2/authority.test.ts`: kernel/PDP/approval.
**PS15.5** `tests/e2e/cognition-v2/event-replay.test.ts`: crash/ACK/DLQ.
**PS15.6** `tests/e2e/cognition-v2/graph-memories.test.ts`: C03–C06.
**PS15.7** `tests/e2e/cognition-v2/slow-cards.test.ts`: C07–C09.
**PS15.8** `tests/e2e/cognition-v2/context-serving.test.ts`: C10.
**PS15.9** `tests/e2e/cognition-v2/fast-isolation.test.ts`: C11, TTFT.
**PS15.10** `tests/e2e/cognition-v2/presenter.test.ts`: C12 receipts, SVG.
**PS15.11** `tests/e2e/cognition-v2/voice-anam.test.ts`: C13 sandbox conditional, barge-in.
**PS15.12** `tests/e2e/cognition-v2/cyber-bridge.test.ts`: C14 TS↔Python.
**PS15.13** `tests/e2e/cognition-v2/tenant-revocation.test.ts`: cross-service revocation.
**PS15.14** `tests/e2e/cognition-v2/fault-injection.test.ts`: provider failures, restore, retries.
**PS15.15** `scripts/gate-cognition-v2.ts`: orchestrator reports, not bypassing existing gate.
**PS15.16** `docs/.../C15/evidence/LATENCY-COST-SLO.md`: measured p50/p95/p99 and provider costs.
**PS15.17** `docs/.../C15/evidence/LEGACY-RETIREMENT.md`: imports, feature flags, removal criteria.
**PS15.18** `docs/.../C15/evidence/SECURITY-REVIEW.md`: independent Codex findings, threat model.
**PS15.19** `docs/.../C15/evidence/FOUNDER-GO-NOGO.md`: signed acceptance, release/rollback.

**REUTILIZAR:** tests/gates existentes, schemas Zod, policy, SDK hijo, event bus como substrate tras auditoría. **SUSTITUIR:** context assembly one-shot, Slow fallback en Fast, progress no factual, legacy cognition capture no durable. **LEGACY TEMPORAL:** rutas V1 bajo flags hasta M4, con fecha/condición de retiro.

## 7. Waves W0–W13 (ejecución posterior, NO realizada)
**W0 Freeze:** main/branch SHAs padre/hijo, manifests/lock, env sample, artifact hashes. Gate baseline reproducible.
**W1 Dependency DAG:** ownership de archivos, schema registry, ADRs, permisos de proveedor y responsabilidades. Gate conflictos resueltos.
**W2 Security authority:** A01–A03, deny-by-default. Gate P0 zero.
**W3 Event substrate:** A04–A07, durable replay and ACK. Gate restart consistency.
**W4 Graph/memory:** A08–A14, chromatic ADR. Gate provenance/revocation.
**W5 Slow/JEV/cards:** A15–A18, no lost Thought/cards. Gate idempotency and fallback.
**W6 Context:** A19–A20, budgets, snapshot revision. Gate auth-first.
**W7 Fast/Slow:** A21–A22, separate pools, SLO measured. Gate no Fast blocking.
**W8 Presenter/UI:** A23–A24, factual status and accessibility. Gate no simulated factual progress.
**W9 Anam:** A25–A26, provider sandbox, consent and interruption. Gate external verified or BLOCKED_EXTERNAL.
**W10 Cyber:** A27–A28, child API/SDK contract, grant/revocation, demo only. Gate no real-client operations.
**W11 Chaos/migration:** A29–A30, failures, rollback, V1 deprecation. Gate no orphan jobs.
**W12 Independent audit:** Codex executes commands independently, security review, coverage matrix, fix loops. Gate no open P0.
**W13 Founder acceptance:** approve/deny merge, deployment, pilot separately; record exact artifacts, risk exceptions and rollback owner. Gate signed GO/NO-GO.

## 8. Matriz de pruebas adversariales mínima
**Seguridad:** tenant A→B via chat, cards, memory, RAG, graph, voice, cyber; role spoof, actor spoof, malicious prompt, tool schema injection, token leak, approval replay, policy version downgrade, grant revoked mid-job.
**Consistencia:** crash after bus write/before dedupe; duplicate event; out-of-order revisions; subscriber restart; projection rebuild; stale ContextSnapshot; card ACK lost; lease expires during render; concurrent updates; revocation after snapshot.
**LLM:** Fast provider outage, Slow timeout, JEV absent, malformed JSON, confidence fabricated, Thought lacks evidence, conflicting sources, context overflow, model attempts privileged tool.
**UX:** AG-UI disconnect/reconnect, browser refresh, duplicated streamed chunks, fake progress prohibited, user interruption, reduced motion, screen reader.
**Voice:** Anam credential expiry, missing mic permission, audio reconnect, barge-in after first token, STT partial correction, stale audio, TTS/provider outage, consent revoked.
**Cyber:** child token revoked, path tenant mismatch, malformed SDK, 202 mistaken for complete, scanner skipped, zero findings vs unknown, child outbox replay, remote write attempt, production_enabled=false, report evidence redact.
**Operations:** DB restore/reconciliation, dual workers, race budgets, event backlog, memory retention, rollback, stale legacy import, provider cost reconciliation.

Each test: input fixture ID, expected output/state, source SHA, trace IDs, proof of absence of side effects, command, exit code, artifact path, owner and reviewer. Do not log raw PII, API keys or audio.

## 9. Comandos y CI: ejecutar y registrar, no marcar como ejecutados
```bash
# En checkout aislado de /agente, Node >=22.6, pnpm fijado en package.json
git rev-parse HEAD
git status --short
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm gate
pnpm verify:slice
pnpm test:browser
pnpm secrets:check
pnpm audit:contracts
pnpm audit:idempotency
pnpm audit:bridges
pnpm release:verify
# Tests V2 añadidos en PS15.* solo tras crear esos archivos:
# pnpm exec tsx --import ./tests/setup.ts --test tests/e2e/cognition-v2/*.test.ts

# En checkout aislado de /agntia-ciberseguridad
git rev-parse HEAD
python -m unittest discover -s tests
cd typescript && npm test
```
**No se ha verificado en esta sesión** que `pnpm install` o el comando de tests V2 propuesto sea ejecutable con el runner actual; adaptar tras W0 y conservar comandos/exit codes exactos. Evitar `npm install` sin lock en CI; SDK tiene package.json propio y requiere revisión de distribución. Para Anam/JEV usar sandbox, permisos y API oficiales, sin asumir claves o cuentas existentes.

## 10. Matriz de decisión GO/NO-GO
**GO a implementación documental/branch:** C00–C15 disponibles, ADR-009, owners y gates definidos, sin tocar producción. **GO a shadow:** A01–A20 con pruebas críticas y rollback, policy/tenant intactos, métricas instrumentadas, sin efectos externos. **GO a canary sintético:** A01–A24 + gates de proveedor según canal, Codex independiente, presupuesto y soporte. **GO a piloto real:** además A25–A30 donde aplique, contrato Anam/JEV real si activados, child pilot gates independientes, DPA/licencia/operadores, consentimiento, backups/restores, aprobación explícita founder. **GO a producción:** evidencia de canary y aceptación humana separada, SLO/SLI y plan de incidentes, monitorización y rollback probado. **NO-GO automático:** fuga cross-tenant, bypass de aprobación, secretos, pérdida de eventos, memoria revocada visible, no rollback, datos reales sin consentimiento, resultados de auditoría ficticios, provider sin contrato verificado, child demo presentado como producción.

**No aceptar:** «todos los tests actuales pasan», «el documento está completo», «el avatar se ve», «el agente ha dicho que ha auditado», «sin findings» con scanner no ejecutado, «42 fases implementadas» con 40 PARTIAL, ni «JEV funciona» sin API verificada.

## 11. Paquete handoff Freebuff / Codex / founder
### Freebuff — implementador
1. Crear rama por **slice** desde main actualizado; no reusar la rama de auditoría como rama de producción.
2. Leer ADR-009 + C00–C15, generar DAG de imports/ownership y `IMPLEMENTATION-MAP.md` con rutas confirmadas.
3. Por cada wave, entregar `REPORT-Wx.md`: baseline SHA, archivos creados/modificados/eliminados, patchset, diff, tests ejecutados con exit codes, evidencias, riesgos, estado, rollback y siguiente dependencia.
4. No declarar PASS de test no ejecutado. No simular proveedor Anam/JEV ni permiso cyber.
5. Conservar invariante `LLM propone, sistema dispone`; todas las acciones bajo runtime y approval.
6. Cerrar cada ola con commit/PR propio, sin merge/deploy autónomo.

### Codex — verificador independiente
1. Revisar commit/diff y rutas realmente cambiadas, no solo reporte de Freebuff.
2. Repetir gates, adversariales, cross-tenant, replay, revocation, restore, latency, evidence.
3. Registrar `REVIEW-Wx.md`: test command/exit code, SHA, failures, P0/P1/P2, reproduction, fix request.
4. Rechazar cobertura simulada, assertion vacía, skip silencioso y aceptación de mocks como proveedor real.
5. Emitir veredicto `PASS/FAIL/BLOCKED/NOT_RUN` por A01–A30 y por wave.

### Founder — decisiones reservadas
Aprobar semántica de cromos/seis polaridades/diez dimensiones (C05), selección/contrato JEV y Anam, modelo de voz, credenciales, licencia/DPA/operación cyber, prioridades y presupuesto, migración de legacy, piloto real, merge y deploy. Una aprobación de dirección de arquitectura no equivale a aprobación de ejecución externa.

## 12. Formatos obligatorios de reportes
```yaml
campaign: C15
wave: W0
parent_commit: REQUIRED_AT_EXECUTION
child_commit: REQUIRED_IF_CYBER
branch: REQUIRED_AT_EXECUTION
files_changed: []
tests:
  - command: "pnpm typecheck"
    exit_code: NOT_RUN
    result: NOT_RUN
    artifact: null
acceptance:
  A01: NOT_RUN
  A02: NOT_RUN
open_P0: []
security_review: NOT_RUN
rollback_verified: false
founder_approval: NOT_REQUESTED
decision: NO_GO
```
**Artifacts bajo `docs/auditoria-integral-30-angulos/03-harness-conversacional/campanas-redisenio-v2/C15/evidence/` propuestos:** `BASELINE-BOTH-REPOS.md`, `CALLGRAPH-V2.md`, `IMPLEMENTATION-MAP.md`, `ACCEPTANCE-MATRIX.csv`, `TEST-EXECUTION.jsonl`, `REPLAY-TRACE.jsonl`, `TENANT-SECURITY-REPORT.md`, `LATENCY-COST-SLO.md`, `PROVIDER-VERIFICATION.md`, `LEGACY-RETIREMENT.md`, `SECURITY-REVIEW.md`, `REPORT-W0.md`…`REPORT-W13.md`, `FOUNDER-GO-NOGO.md`. No crear falsos informes de ejecución hoy.

## 13. Criterios de cierre administrativo del programa documental
- [x] ADR-009 encontrada y verificada.
- [x] C00–C14 encontrados individualmente en rama GitHub.
- [x] Paquete C15 de matriz E2E, dependencias, patchsets, waves, gates, rollback y handoff redactado.
- [ ] Implementación V2 C00–C14.
- [ ] C15 A01–A30 ejecutados y certificados.
- [ ] Codex revisión independiente.
- [ ] Medición de latencia, coste y replay V2.
- [ ] Integración real Anam/JEV bajo contrato aprobado.
- [ ] Wiring real del middleware cyber y aceptación de su piloto.
- [ ] Founder GO para merge, deploy y clientes.

**Estado final defendible:** `DOCUMENTATION_PROGRAM_COMPLETE` una vez confirmado commit de este archivo y bitácora; `IMPLEMENTATION_NOT_CERTIFIED`; `PRODUCTION_NO_GO`. El cierre de 16 turnos **cierra la preparación documental, no el proyecto de ingeniería**.
```yaml
turn: 16/16
campaign: C15
repo: uniscrolliabrain-cloud/agente
branch: audit/preflight-cognition-option3-20261115
documents_verified_before_C15: 15
acceptance_scenarios: 30
patchsets_proposed: 20
waves_proposed: 14
tests_executed: false
production_code_changed: false
merge: false
deploy: false
status: DOCUMENTATION_ONLY_NO_GO
```
