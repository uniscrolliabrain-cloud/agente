# C14 — Bridge AgntiaPro ↔ Agntia Ciberseguridad: SDK TS, API Python, agentes, gobernanza y evidencia

**Turno 15/16 · 2026-11-15.** Repositorio **padre** `uniscrolliabrain-cloud/agente`; repositorio **hijo independiente** `uniscrolliabrain-cloud/agntia-ciberseguridad`. Rama documental del padre `audit/preflight-cognition-option3-20261115`. **Estado: auditoría estática cruzada y handoff; sin cambios de runtime, sin tests ejecutados, sin merge ni despliegue.** Siguiente: C15 certificación E2E integral.

## 0. Mandato y decisión
**NO confundir los dos repositorios.** El núcleo de empresa, autenticación de usuario, tenant, agentes, SOP, autorizaciones, conversación Fast/Slow, memorias, UI y eventos corporativos permanece en `/agente`. El middleware de ciberseguridad es un servicio especializado Python/FastAPI con SDK TypeScript server-only, controles internos, grants, jobs, evidence y reportes; **no crear un segundo kernel empresarial ni reescribirlo en TS**. El bridge es un **adaptador tipado, autorizado y observable**, no un proxy HTTP/shell/modelo arbitrario.

**Estado de la evidencia:** las cifras 196 tests Python OK/8 skipped, SDK 6 pass/1 skip, 84 rutas y 2 PASS/40 PARTIAL proceden de `docs/ESTADO-VIGENTE.md` del hijo, no de ejecución nuestra. `production_enabled=false`; no hay autorización de clientes reales. El adversarial lab en rama separada **no forma parte de C14** ni se fusiona por esta campaña.

## 1. Código y documentos realmente consultados
| Repo | Archivo | SHA blob | Evidencia |
|---|---|---|---|
| hijo | `README.md` | `457a9c508754982dc3b8edc3efc0216c47790856` | estado demo sintética, stack Python/SDK TS, costes, scope y límites |
| hijo | `docs/ESTADO-VIGENTE.md` | `f08cbaa57a249c6c099650f76187e0550835e398` | 196 OK/8 skip, SDK 6/1, 84 rutas, schema 8, producción false, no wiring padre |
| hijo | `docs/09-contrato-con-agente.md` | `3b475a00f3a0087f296ce9155ab4d3102e04a837` | envelope y operaciones nominadas, contrato aún no firmado, eventos propuestos |
| hijo | `docs/auditoria-runtime/PROGRAMA-DIFERENCIAL-12-CAMPANAS.md` | `91f7349ec64b79bb0252b17bbae8fa7ce519b82d` | CY-R02…R12 pendientes; no duplicar CY-R01/AD-01 |
| hijo | `docs/release/PILOT-ACCEPTANCE.md` | `718751676ea41b8407415b4cd93bb40abfedebde` | bloqueos para piloto/producción |
| hijo | `pyproject.toml` | `19d90f84e621b277794660aa287c7a893cfb8dbd` | Python >=3.11, FastAPI, Pydantic, cryptography, OTel |
| hijo | `agntia_ciberseguridad/app.py` | `9c92d8217ba6972af9426f21e9d46f7066bd7ca6` | RequestBoundary, correlation, principal, health, rutas /v1, control errores |
| hijo | `agntia_ciberseguridad/auth.py` | `e3ab34da9332aab4c38b6deb29b7779a98e88e99` | bearer fingerprint, principal binding, RBAC, tenant membership, agent gateway restriction |
| hijo | `agntia_ciberseguridad/agents/routes.py` | `929ae77aed1d713823bd3545c32ae026c4e8e701` | endpoints agent explain/controls/flows/releases/tools/MCP/effects con propuestas y aprobaciones |
| hijo | `typescript/package.json` | `724d3ba8ca96579227fd2876400fa3c00d9e84bd` | `@agntia/ciberseguridad` private 0.1.0-alpha.1; exports client/hono/agent-tools; server-only |
| padre | `apps/server/src/engine/execution/capability-runner.ts` | **SHA no obtenido en C14** | resultado de búsqueda confirma capability runner con governance |
| padre | `apps/server/src/engine/workspaces/bridge.ts` | **SHA no obtenido en C14** | búsqueda confirma bridge workspace existente |
| padre | `packages/domain/src/capability.ts` | **SHA no obtenido en C14** | capability contract existente |
| padre | `apps/server/src/engine/events/bus.ts` | `21fe61384c6f12002d2e41bea172819c607629c7` | bus V1; C02 diseña ACK/outbox/replay |
| padre | `apps/server/src/engine/service.ts` | `a5f7ac6932c70066dd1e6a8f94edf8e67efe5dcb` | servicio y worker, C02/C11 |
**Limitaciones:** no se recorrió todo el árbol de ambos repos, ni el contenido de `typescript/src/client.ts`, `typescript/src/agent-tools.ts`, jobs, storage, outbox, rutas 84 completas, ni tests reales. La primera ola **debe** abrirlos y comparar firma exacta del SDK con las rutas reales. No asumir endpoints que solo aparecen en documento como contrato implementado. El HEAD exacto de ambos repos no se verificó en esta sesión; los SHAs de tabla son **blobs**.

## 2. Hallazgos C14-F01–F27
1. El hijo existe y tiene implementación Python real, no un stub vacío.
2. El README histórico decía middleware en desarrollo; cabecera 2026-11-15 lo corrige.
3. El hijo reporta 84 rutas bajo `/v1/tenants/{tenant}/…`; no se ha contrastado cada ruta.
4. `production_enabled=false`: demo sintética, no piloto.
5. 2/42 fases PASS y 40 PARTIAL: CI verde no significa producto terminado.
6. Los 196 tests OK y 8 skips son evidencia reportada, no verificación independiente.
7. `typescript/package.json` exporta client/hono/agent-tools; **SDK existente, no inventar otro desde cero**.
8. El SDK es private y alpha; integración monorepo requiere política de distribución/versionado y licencias.
9. `app.py` valida headers ambiguos y limita request body, buena frontera reutilizable.
10. `app.py` genera correlation ID validado, pero el bridge debe preservar causation/idempotency de padre.
11. `auth.py` compara fingerprint y verifica binding activo; no es SSO OIDC automático con el padre.
12. `auth.py` tiene RBAC y tenant scopes propios; **doble autorización**, no asumir confianza por token interno.
13. Un principal `agent` no obtiene capacidades arbitrarias: `authorize` restringe a gateway gobernado.
14. `agents/routes.py` ya separa propuesta/aprobación/commit de efectos; no bypass mediante tools del chat.
15. El endpoint MCP es nominal y manifiesto-específico; no ofrecer MCP universal a agentes.
16. Un `POST` puede devolver 202/receipt sin completar auditoría; UI C12 debe decir queued.
17. Los eventos de `docs/09` son propuestas; no inferir que bus padre/hijo los publica ya.
18. La integración `/agente` no está cableada según estado vigente del hijo.
19. No existe acuerdo de ownership sobre quién crea grants, approvals, budget o principal cross-service.
20. El padre ya tiene capability runner, governance, event bus, workspaces; bridge debe entrar por esos ports.
21. Un finding de scanner es evidencia con cobertura/limitaciones, no verdad universal ni instrucción ejecutable.
22. El reporte no debe marcar `no findings` cuando provider falló o cobertura es parcial.
23. El hijo dispone de outbox/jobs según estado documental; validar semántica ACK y cursor con C02 antes de bridge.
24. Revocación de permisos del padre debe invalidar ejecución en el hijo, incluso jobs en cola.
25. Las aprobaciones humanas deben vincular hash, objeto, tenant, alcance, versión y expiración; no aprobación genérica.
26. Los hallazgos de seguridad que entren a memoria/RAG/graph C03/C04 necesitan procedencia, clasificación y retractación.
27. El laboratorio adversarial en rama independiente no debe incluirse ni confundirse con bridge productivo.

## 3. Matriz de ownership: autoridad única por responsabilidad
| Responsabilidad | Autoridad | Verificación cruzada |
|---|---|---|
| Sesión humana/empresa activa | padre `/agente` | hijo verifica principal técnico scoped y tenant |
| Roles de agente Pedro/LAIA | padre | hijo no confía en role/agentId de texto libre |
| Capacidad corporativa, SOP, aprobaciones de negocio | kernel/engine padre | hijo requiere grant de auditoría y policy local |
| Inventario de activos, grants de seguridad, scanners, findings, evidencia | hijo | padre presenta vistas minimizadas y controla quién consulta |
| Jobs de auditoría | hijo | padre almacena correlation/task receipt, no finge ejecución |
| Costes y límites del servicio cyber | hijo, conciliado | padre aplica presupuesto de tenant global |
| EventBus corporativo | padre C02 | hijo outbox→bridge→bus con ACK durable |
| Source-of-truth de finding y revisión | hijo | padre materializa proyección, no modifica fuente |
| Remediación real en activos externos | capacidad específica autorizada | doble gate humano, alcance, preflight, dry-run, retest |
| Narrativa/UX y agente Pedro | padre C12 | solo hechos citables, cobertura explícita |

## 4. Topología objetivo
```text
Owner/LAIA/Pedro → Chat C11/C12 → Policy/CAPABILITY parent
  → SecurityBridgeFacade (server-only; auth, mapping, idempotency, budget)
  → @agntia/ciberseguridad SDK TS (pin exact version)
  → private HTTPS/mTLS or approved signed credential → Python/FastAPI /v1
  → child principal + tenant + grant + policy + quota
  → child jobs/scanners/evidence/findings/outbox
  → event relay (cursor/ACK/replay, scoped) → parent C02
  → C03/C04/C09/C10 authorized projections → C12 UI/agents
```
**Regla:** ninguna petición de modelo, prompt o UI puede elegir URL, método, comando, scanner shell, tenant, actor o token arbitrarios. El gateway traduce capacidades nominadas a métodos tipados y objetos validados.

## 5. Contratos nuevos propuestos, no existentes
```ts
type CyberCapabilityV2 =
 "security.assets.read"|"security.assets.register"|
 "security.grants.propose"|"security.audit.preview"|"security.audit.request"|
 "security.jobs.read"|"security.jobs.cancel"|"security.findings.read"|
 "security.reports.read"|"security.remediation.propose"|
 "security.incidents.read"|"security.policy.explain";
interface CyberCommandV2 {
 schemaVersion:"2.0"; commandId:string; tenantId:string; actorId:string;
 agentId?:string; capability:CyberCapabilityV2; resourceId?:string;
 grantId?:string; approvalId?:string; expectedRevision?:number;
 idempotencyKey:string; correlationId:string; causationId?:string;
 deadlineAt:string; dryRun:boolean; payload:unknown; policyRevision:string;
}
interface CyberReceiptV2 {
 schemaVersion:"2.0"; commandId:string; tenantId:string; childJobId?:string;
 status:"accepted"|"queued"|"running"|"partial"|"completed"|"failed"|
 "blocked"|"cancelled"|"reconciliation_required";
 sourceEventIds:string[]; evidenceRefs:string[]; coverage?:string;
 childRevision?:number; occurredAt:string; retryable:boolean;
}
interface CyberFindingProjectionV2 {
 tenantId:string; sourceFindingId:string; sourceRevision:number;
 assetRef:string; ruleRef:string; severity:string; confidence?:number;
 epistemicStatus:"observed"|"suspected"|"unverified"|"retracted";
 evidenceRefs:string[]; coverage:string; firstSeenAt:string; lastSeenAt:string;
 visibilityPolicyId:string; sourceDigest:string;
}
```
**No confiar en `payload` sin schema específico por capability.** `tenantId` es derivado de auth server-side; comparar con child tenant y grant. `sourceRevision` monotónica, dedupe por tenant+source+revision, no por texto LLM. `reconciliation_required` si operación mutante perdió respuesta.

## 6. Traducción de capacidades, mínimo viable
| Padre, capacidad tipada | Operación hija a verificar W0 | Acción permitida |
|---|---|---|
| `security.assets.read` | GET assets | lectura |
| `security.audit.preview` | preview | sin ejecutar |
| `security.audit.request` | crear job con grant vigente | efecto controlado |
| `security.jobs.read` | GET job/status | lectura |
| `security.findings.read` | GET findings con scope | lectura |
| `security.reports.read` | GET report | lectura redactada |
| `security.remediation.propose` | proposal/diff | no aplicar |
| `security.policy.explain` | explain/policy | explicación, no elevar permiso |
**No habilitar** approve, commit, revoke, policy expansion, shell, HTTP proxy ni ejecución externa como herramientas automáticas de Pedro. Son operaciones de revisión humana y runtime con controles separados.

## 7. Eventos y consistencia
Eventos **propuestos** `security.audit.queued`, `security.audit.completed`, `security.audit.partial`, `security.finding.created`, `security.finding.changed`, `security.finding.retracted`, `security.remediation.proposed`, `security.policy.denied`, `security.budget.threshold`. **Primero** verificar tipos y payloads existentes del hijo y catálogo cerrado del padre; versionar ambos. No publicar evento desconocido sin registrar schema. Bridge relay usa outbox persistente del hijo, cursor durable, inbox/idempotency del padre, ACK después de proyección durable, DLQ, retry y reconciliación. No prometer exactly-once en red distribuida.

**Seguridad de datos:** finding completo permanece en hijo; proyección minimizada en padre. Evidence refs son identificadores scoped, no URLs públicas permanentes. Revocación, expiración de grant y borrado de fuente provocan invalidación de C10 y C04/C09; no mantener memoria de secretos detectados.

## 8. Patchsets PS14.0–PS14.19 (rutas propuestas)
**PS14.0 Inventario:** `C14/evidence/PARENT-CHILD-CALLGRAPH.md`, `ROUTE-MATRIX.md`, `SDK-API-COMPAT.md`; freeze ambos HEAD, leer SDK/84 rutas/jobs/outbox, test suites y gates.
**PS14.1 Domain:** padre `packages/domain/src/security-bridge-v2.ts` con Zod strict, capabilities, receipt, finding projection.
**PS14.2 SDK reuse:** revisar `agntia-ciberseguridad/typescript/src/{client,hono,agent-tools}.ts` **si existen en ese árbol**, pin/pack/install compatible pnpm; no copiar cliente.
**PS14.3 Parent port:** `apps/server/src/engine/security/security-port.ts`.
**PS14.4 Parent adapter:** `engine/security/cyber-sdk-adapter.ts`, server-only, error mapping, typed calls.
**PS14.5 Principal mapping:** `engine/security/principal-mapper.ts`; tenant/actor/agent roles, audience and revocation.
**PS14.6 Credentials:** `engine/security/credential-broker.ts`; scoped secret server-side, rotation, no frontend exposure.
**PS14.7 Authorization:** `engine/security/authorization-bridge.ts`; parent policy + child grant, fail-closed.
**PS14.8 Capability registry:** integrate `engine/execution/capability-runner.ts` and actual tool executors after W0; named read/propose tools only.
**PS14.9 Approval mapping:** `engine/security/approval-bridge.ts`; hash, revision, scope, human decision.
**PS14.10 Task coordinator:** `engine/security/job-coordinator.ts`; parent task receipt ↔ child job, idempotency.
**PS14.11 Event relay:** `engine/security/cyber-event-relay.ts`; C02 outbox/inbox/cursor.
**PS14.12 Projection:** `engine/security/finding-projection.ts`; revisions, coverage, provenance, retract.
**PS14.13 Context:** `engine/security/context-serving.ts`; C10 authorized evidence refs, no raw secrets.
**PS14.14 Presenter:** `engine/security/presentation-adapter.ts`; Pedro/LAIA C12 status/partial/failed truth.
**PS14.15 Costs:** `engine/security/budget-bridge.ts`; child plan caps + parent quotas and reconciliation.
**PS14.16 Observability:** `engine/security/telemetry.ts`; trace parent→child, PII-safe.
**PS14.17 API facade:** `apps/server/src/security-routes.ts`; only typed endpoints, auth, tenant, rate limit.
**PS14.18 Child changes:** **solo si delta probado** en `agntia_ciberseguridad/**` o `typescript/**`; rama propia del hijo, no mezclar ownership.
**PS14.19 Tests/docs:** contract fixtures Python↔TS, integration/e2e, threat model, rollout and rollback.

**REUTILIZAR:** SDK TS existente, Python API, grants, jobs, agent gateway, parent capability runner, parent C02/C10/C12. **SUSTITUIR:** wiring inexistente, contratos ad hoc no versionados y cualquier HTTP genérico sin política. **LEGACY TEMPORAL:** no sustituir código de seguridad operativo hasta probar equivalencia; mantener servicio hijo autónomo.

## 9. Waves W0–W11 y gates
**W0 Baseline cruzado:** freeze HEAD padre/hijo, leer SDK, route table real, tests, outbox, principal, env, flags. Gate: mapa firmado, sin rutas inventadas.
**W1 Contratos:** schema, capabilities, errors, receipts, revisions, compatibility semver. Gate: strict schema + Python/TS contract tests.
**W2 Identidad:** parent tenant/actor mapping, child principal, credential broker, revocation. Gate: adversarial cross-tenant.
**W3 Read-only bridge:** assets, jobs, findings, reports scoped. Gate: no efectos.
**W4 Preview:** audit preview/grant state, cost/coverage before submit. Gate: no scan on preview.
**W5 Controlled jobs:** durable request, grants, idempotency, quotas, lease, reconciliation. Gate: no unauthorized scanner.
**W6 Event relay:** C02 outbox/ACK, replay, duplicate/out-of-order, DLQ. Gate: no lost events.
**W7 Cognition:** C03/C04/C09/C10 evidence projections, retractions and visibility. Gate: no secrets/cross-tenant in Fast.
**W8 Pedro/LAIA UX:** C12 progress real, partial coverage, approval actions. Gate: no phantom completed.
**W9 Security chaos:** revocation mid-job, token rotation, child outage, parent outage, DB restore, malformed SDK. Gate: fail-closed.
**W10 Shadow/canary:** founder approval before deploy or client data, demo synthetic only until child pilot gates. Gate: cost/perf/security report.
**W11 Certification:** Python/TS tests, pnpm typecheck/test/gate, Codex independent review, handoff C15. Gate: GO/NO-GO.

## 10. Tests adversariales propuestos
| Test | Condición |
|---|---|
| `cyber-bridge-contract.test.ts` | SDK↔API Python contract real |
| `cyber-bridge-tenant.test.ts` | tenant A no accede B |
| `cyber-bridge-agent-scope.test.ts` | Pedro no hereda owner |
| `cyber-bridge-revocation.test.ts` | revoked principal/grant blocked before effect |
| `cyber-bridge-human-approval.test.ts` | no auto-approve or policy expansion |
| `cyber-bridge-prompt-injection.test.ts` | prompt cannot choose method/URL/shell |
| `cyber-bridge-idempotency.test.ts` | retries no duplicate audit |
| `cyber-bridge-timeout-reconcile.test.ts` | lost POST response => reconciliation |
| `cyber-bridge-event-replay.test.ts` | outbox cursor and durable ACK |
| `cyber-bridge-event-duplicate.test.ts` | duplicate/out-of-order ignored |
| `cyber-bridge-evidence-redaction.test.ts` | secrets not in UI/RAG/logs |
| `cyber-bridge-finding-retract.test.ts` | revocation invalidates C10/card |
| `cyber-bridge-coverage.test.ts` | scanner unavailable != zero findings |
| `cyber-bridge-partial-report.test.ts` | partial not completed |
| `cyber-bridge-budget.test.ts` | concurrent quotas cannot overspend |
| `cyber-bridge-restore.test.ts` | restore-blocked child not bypassed |
| `cyber-bridge-circuit.test.ts` | child outage isolates chat Fast |
| `cyber-bridge-sdk-version.test.ts` | incompatible SDK rejected |
| `cyber-bridge-no-production.test.ts` | production_enabled=false blocks real client work |
| `cyber-bridge-pedro-ui.test.tsx` | truthful statuses and authorized refs |

## 11. P0 y riesgos de coordinación
P0: confundir dos repos y sobrescribir implementación; convertir demo sintética en piloto; bypass RBAC de hijo; cross-tenant; token persistido en browser; shell/proxy genérico; auto-aprobación; mutación sin grant; retries duplicados; ACK prematuro; evidencia sin provenance; falso PASS/zero findings; revocación no propagada; RAG de secretos; presupuesto descoordinado; API/SDK divergentes; versionado inestable; child outage bloquea Fast; fusionar adversarial lab independiente; licencias/DPA no aprobadas.

## 12. Migración, rollback, ownership y reportes
**M0** baseline e inventario; **M1** contratos y SDK; **M2** shadow read-only sin efectos; **M3** lecturas y previews sintéticas; **M4** jobs sintéticos con grants; **M5** event relay y proyecciones; **M6** canary solo con aprobación y gates de producto. Flags **propuestos, no existentes** `securityBridgeV2.shadow`, `securityBridgeV2.read`, `securityBridgeV2.jobs`, `securityBridgeV2.events`. Rollback desactiva llamadas padre→hijo y relay, conserva eventos, recibos, jobs en hijo, audita y reconcilia; no borra evidencias ni deja jobs sin propietario. No desplegar ni fusionar sin aprobación del fundador.

**Freebuff:** implementación en ramas separadas por repo, ownership disjunto; reportar cada wave `REPORT-Wx.md`, SHA base/final, diffs, comandos y exit codes, matriz SDK/API, tests/skips, seguridad, gastos, logs redactados, rollback. **Codex:** reejecución independiente Python/TS, pruebas cross-tenant/revocación/approval, compatibilidad C02/C10/C12, veredicto PASS/FAIL/BLOCKED. **Founder:** firma ownership, credentials, licencia, DPA, límites, aprobación de merge/deploy/piloto.

**Entregables:** `PARENT-CHILD-CALLGRAPH.md`, `SDK-API-COMPAT.md`, `ROUTE-MATRIX.md`, `CAPABILITY-OWNERSHIP.md`, `AUTHZ-MATRIX.md`, `EVENT-REPLAY-TRACE.jsonl`, `CROSS-TENANT-RESULTS.md`, `HANDOFF-C15.md`.

```yaml
campaign: C14
turn: 15/16
parent: uniscrolliabrain-cloud/agente
child: uniscrolliabrain-cloud/agntia-ciberseguridad
branch_parent: audit/preflight-cognition-option3-20261115
source_commit_shas: NOT_VERIFIED
status: STATIC_CROSS_REPO_AUDIT_AND_PLAN
findings: 27
patchsets: 20
waves: 12
tests_proposed: 20
tests_executed_here: false
runtime_modified: false
child_repo_modified: false
merge: false
deploy: false
next: C15_integral_E2E_acceptance
```
