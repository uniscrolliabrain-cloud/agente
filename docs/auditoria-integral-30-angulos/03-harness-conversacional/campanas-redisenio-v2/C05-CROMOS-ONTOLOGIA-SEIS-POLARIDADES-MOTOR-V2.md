# C05 — Cromos, ontología cromática, seis polaridades y motor V2
**Turno 06/16 · 2026-11-15 · Repo principal:** `uniscrolliabrain-cloud/agente`.
**Estado:** auditoría estática + especificación de campaña; **no código V2, no tests, no merge/deploy**.
**Precedentes:** C00–C04, ADR-009. **Siguientes:** C06 atención, C08 JEV, C09 tarjetas, C10 Context Serving.
**Regla de autoridad:** kernel/policy/SOP deterministas. Cromos y JEV proponen puntuaciones, conexiones y prioridades, **nunca permisos, hechos certificados ni acciones**.

## 1. Decisión y conflicto documental descubierto
El código `kernel/cromos/cromo.ts` declara un cromo mínimo con `kind` logic/physics/intent/memory/policy y comentario `CROMOS_PENDING_V1`. `docs/estado/FUTURE.md` (mapa de ideas, no roadmap) describe **dos polos opuestos por cromo** y campo de atracción/repulsión/resonancia. `docs/campaigns/NC-COORDINATION/CONTRACT-CANDIDATES.md` señala **10 dimensiones y 6 polaridades** como aún no definidas/aprobadas. Estas tres descripciones **no son equivalentes**. C05 no inventará seis nombres ni diez ejes: los convertirá en **decisión de ontología con pruebas y aprobación del founder**. Hasta entonces el motor puede soportar un vector genérico de 6 coordenadas y metadatos de versión, pero no asignarles semántica de negocio ficticia.

**Decisión de arquitectura:** separar `kernel` agnóstico (identidad, auditoría, policy) de `engine/cognition/chromatic/**` (modelo de dominio, física semántica, proyección). Mantener los exports legacy `kernel/cromos` como compatibilidad temporal; no construir otro kernel ni modificar `GraphPort` para alojar reglas de cromos.

## 2. Evidencia verificada en GitHub main
| Ruta | SHA blob | Hallazgo |
|---|---|---|
| `apps/server/src/kernel/cromos/cromo.ts` | `6efd66840dc85944884a1c2d0dcf3042e49e4629` | 16 líneas, schema V1 no cableado, cinco kinds |
| `apps/server/src/kernel/cromos/logic/axioms.ts` | `48f36452abc6c63280559202a55a12d269525376` | axiomas textuales y detector simple `no X`; no motor lógico formal |
| `apps/server/src/kernel/cromos/physics/field.ts` | `31bc3f10491fce8793c1a1f83de86bd73e6812fa` | energía escalar media de pesos al cuadrado; no interacción entre cromos |
| `apps/server/src/kernel/graph/attention.ts` | `cb526ccf3dff5a1caa6ba9475f3c826af6c8e7a1` | scoring puro, Jaccard ponderado, `sameNode` |
| `apps/server/src/kernel/graph/thought.ts` | `8b2eacc5927fa46e15465db493a020227e9b45ec` | AttentionVector Zod con primary/matched/ignored, scopes turn/user/tenant/global |
| `apps/server/src/kernel/observers/meta.ts` | `46be97c1bfbbc9345b6a07a4585ec95f6c25872e` | reglas de hints, estado `seenHints` en memoria, atención divergente |
| `apps/server/src/kernel/cognition/card-builder.ts` | `2c2a9c915eb84535ee895d9880399f8f7fb41e90` | clasificación V1 por regex, no cromos ni JEV |
| `docs/estado/FUTURE.md` | `f6bf5b4942af1d4d0463ce54361ce24bfe2c15f5` | dos polos/cromo, fuerzas y energía como visión no implementada |
| `docs/campaigns/NC-COORDINATION/CONTRACT-CANDIDATES.md` | `b9a2d87519d99982f78aca131660fb517d9249d4` | seis polaridades/diez dimensiones no definidas; dominio fuera del kernel |
| `docs/campaigns/NC-COORDINATION/specs/NC-03-SOURCE.md` | `3183af93bfe7d26725241ee0cb4b4b0852c2a55b` | JEV evaluador, no autoridad; diseño de activación y recuperación |

**Pendiente:** árbol completo de imports de cromos, consumidores del kernel, existencia de tests, motor Jev real, DB y worker; ejecutar búsqueda por import y pruebas en checkout. Los SHA anteriores son de **archivos**, no commit base.

## 3. Hallazgos incrementales C05-F01–F17
1. **F01:** `cromo.ts` está marcado pending, sin implementación de seis polaridades.
2. **F02:** el enum `kind` de cinco valores no equivale a seis polaridades.
3. **F03:** `field` es `Record<string,unknown>`; no garantiza vector numérico acotado ni invariantes.
4. **F04:** `axioms` son strings, no lógica ejecutable ni certificación.
5. **F05:** `checkContradiction` solo reconoce negación textual exacta, no prueba contradicción semántica.
6. **F06:** `fieldEnergy` mide concentración de atención; no es campo magnético de cromos ni física real.
7. **F07:** `isHighEnergy` usa umbral 0.7 por defecto; calibración pendiente.
8. **F08:** `normalizedWeights` acumula pesos por nodo canónico; no verifica ACL.
9. **F09:** `attentionOverlap` usa matching ponderado; no equivale a coherencia factual ni identidad de actor.
10. **F10:** `attentionScope.global` no autoriza datos globales; deny-by-default.
11. **F11:** `Meta.seenHints` es Set local de proceso y su limpieza puede olvidar consumos; no es delivery ledger.
12. **F12:** `Meta.extractProgress` hace cast de metadata a ProgressEvent; validar boundary antes de confiar en urgencia.
13. **F13:** `Meta.detectAttentionConflict` compara focos, no contradicción lógica.
14. **F14:** `card-builder.ts` clasifica por regex; no confundir kind de tarjeta con taxonomía cromática.
15. **F15:** documentación antigua define dos polos; otra pide seis polaridades y diez dimensiones: conflicto de especificación abierto.
16. **F16:** NC-COORDINATION exige kernel agnóstico, mientras legacy coloca cromos en kernel; V2 debe aislar dominio en engine.
17. **F17:** no se verificó API real Jev; no escribir integración simulada como si fuese proveedor activo.

## 4. Modelo propuesto sin inventar semántica
```text
C02 Event → C03 Claim/Evidence/Graph → C04 MemoryRefs
    → ChromaticCandidate (Slow/JEV/rules proponen)
    → Ontology Registry (versión aprobada)
    → deterministic normalization + validation
    → ChromaticState / interactions (shadow)
    → attention hints C06 + Card metadata C09
    → Context Serving C10
```
**Tres conceptos distintos:** (A) polos `positive/negative` internos de cada cromo; (B) seis polaridades/ejes globales, todavía sin semántica aprobada; (C) diez dimensiones de evaluación, también sin semántica aprobada. El contrato debe poder representar los tres sin afirmar que son lo mismo. La geometría de hexágono es representación/estructura configurable, **no evidencia** de causalidad.

### Contratos candidatos
```ts
type ChromaticOntologyV2 = {
 schemaVersion:"2.0"; ontologyId:string; ontologyVersion:string;
 axes:Array<{axisId:string; positivePoleId:string; negativePoleId:string; label:string}>;
 dimensions:Array<{dimensionId:string; label:string; normalization:"signed"|"unit"}>;
 approvedAt?:string; approvedBy?:string; status:"draft"|"approved"|"retired";
};
type ChromaticCardV2 = {
 schemaVersion:"2.0"; id:string; tenantId:string; subjectRef:string;
 ontologyVersion:string; sourceRevision:string; evidenceRefs:string[];
 poles:Record<string,{positive:number;negative:number}>;
 dimensions:Record<string,number>;
 provenance:{sourceEventId:string;projectorVersion:string;classifiedBy:string};
 lifecycle:"candidate"|"active"|"superseded"|"revoked";
 visibilityPolicyId:string; policyRevision:string; createdAt:string;
};
type ChromaticInteractionV2 = {
 tenantId:string; fromId:string; toId:string; ontologyVersion:string;
 relation:"attracts"|"repels"|"resonates"|"damps"|"neutral";
 strength:number; explanationRefs:string[]; computedAt:string;
};
```
**Importante:** este contrato es una propuesta de shape, no afirmación de que 6 ejes=12 polos o 10 dimensiones deban coexistir exactamente así. La ontología final se aprobará antes de poblar datos. `approvedBy` se valida contra identidad real, no campo LLM.

## 5. Invariantes matemáticos y de seguridad
- Puntajes finitos y acotados; normalización determinista, sin NaN/Infinity.
- Misma entrada, ontología, versión de algoritmo y snapshot → mismo resultado.
- Axiomas versionados y con tipo; strings de legacy solo como documentación hasta parser aprobado.
- Fuerzas simétricas **solo si** la relación se define simétrica; no asumirlo en todas las aristas.
- Sin bucles de retroalimentación no acotados; límite de iteraciones, convergencia y deadline.
- Sin lectura cross-tenant ni propagación a actor no autorizado; `scope=global` de atención no abre acceso.
- Ningún `high energy` ejecuta SOP o interrumpe usuario por sí mismo: pasa por policy y Presenter.
- Contradicción `candidate` no equivale a hecho contradicho ni `verified`.
- Replay C02 reconstruye proyección por versión; resultados semánticos no deterministas se registran como evidencia, no se reconsultan silenciosamente.

## 6. Patchsets de código (rutas nuevas propuestas, sujetas a inventario)
**PS05.0 — Baseline/ADR:** `docs/.../C05/evidence/ONTOLOGY-CONFLICT.md`, `CROMO-CALLGRAPH.md`, `LEGACY-IMPORTS.md`. Resolver con founder nombres de seis polaridades/diez dimensiones; **no bloquear auditoría**, sí activación.
**PS05.1 — Contratos:** `packages/domain/src/chromatic-ontology-v2.ts`, `chromatic-card-v2.ts`, `chromatic-interaction-v2.ts`; Zod strict, tenant, version, refs.
**PS05.2 — Registry:** `apps/server/src/engine/cognition/chromatic/ontology-registry.ts`; solo ontologías aprobadas en runtime; borradores para experimentos aislados.
**PS05.3 — Adapter legacy:** `engine/cognition/chromatic/legacy-cromo-adapter.ts`; `kind/axioms/field` V1 → candidate V2, sin inventar polaridades faltantes.
**PS05.4 — Normalizer:** `engine/cognition/chromatic/normalize.ts`; valores acotados, trazas y política de desconocidos.
**PS05.5 — Interaction engine:** `engine/cognition/chromatic/interactions.ts`; funciones puras, score con explicaciones, tests de simetría condicionada.
**PS05.6 — Field projection:** `engine/cognition/chromatic/field-projector.ts`; snapshots versionados, incremental C02/C03, budget y convergence.
**PS05.7 — Persistence:** `engine/cognition/chromatic/chromatic-store.ts`; namespace tenant, sourceEventId, CAS/inbox, TTL/revocation.
**PS05.8 — Attention bridge:** `engine/cognition/chromatic/attention-adapter.ts`; output señales a C06, no permisos ni decisiones.
**PS05.9 — Classifier interface:** `engine/cognition/chromatic/classifier-port.ts`; rules baseline, Jev futuro C08; no proveedor inventado.
**PS05.10 — Query/Context:** `engine/cognition/chromatic/chromatic-query.ts`; solo refs autorizadas para C09/C10, límites de tiempo y tamaño.
**PS05.11 — Shadow integration:** registro proyector C02, shadow por tenant, diff/metrics; legacy `kernel/cromos` sin mutar.
**PS05.12 — Tests/observabilidad:** fixtures, property-based, benchmarks y reportes; no migración de datos sin ontología aprobada.

## 7. Waves W0–W8, responsables y gates
**W0 — Revalidar HEAD y consumidores.** Freebuff lee C00–C04 y todos los imports de cromos/attention/meta; Codex revisa árbol y tests. Gate: ownership por archivo y SHA commit.
**W1 — Resolver semántica.** Inventariar las distintas versiones de ontología en docs, redactar `ADR-CHROMATIC-ONTOLOGY.md` con opciones 2 polos vs 6 polaridades/10 dimensiones, ejemplos y consecuencias. Founder aprueba el significado; si no, solo prototipo sin datos reales.
**W2 — Schemas.** Implementar PS05.1–05.4; tests de shape, identidad, tenant, unknown axes, version mismatch, NaN.
**W3 — Matemática determinista.** PS05.5–05.6; tests de invariantes, conservación de límites, convergencia, reproducibilidad.
**W4 — Persistencia/proyección.** PS05.7 y C02 inbox/cursor, C03 refs; replay, crash, idempotencia, revocación.
**W5 — Atención y clasificación.** PS05.8–05.9; fallback rules, no dependencia de API Jev todavía, salida no autoritativa.
**W6 — Recuperación/contexto.** PS05.10, presupuestos y query ACL, no enviar scores crudos sin explicación al Fast.
**W7 — Shadow/canary.** PS05.11; medir estabilidad, diferencias, overhead, falsos positivos, fuga tenant y ruido del Presenter.
**W8 — Certificación.** PS05.12; typecheck/test/gate, stress, revisión Codex, reporte de rollback y handoff C06.

## 8. Tests propuestos y casos adversariales
- `tests/chromatic-ontology-v2.test.ts`: 6 ejes/10 dimensiones solo si ADR lo aprueba; labels únicos, unknown rejected, versioning.
- `tests/chromatic-normalization-v2.test.ts`: NaN, Infinity, out-of-range, zero vectors, stable rounding.
- `tests/chromatic-interactions-v2.test.ts`: deterministic output, edge cases, bounded iterations, no force-as-policy.
- `tests/chromatic-projection-replay.test.ts`: crash/retry, sourceRevision, stable digest.
- `tests/chromatic-tenant-isolation.test.ts`: owner compartido, tenants diferentes, actor revocado, query denied.
- `tests/chromatic-attention-bridge.test.ts`: focus scoring ≠ evidence ≠ authorization.
- `tests/chromatic-classifier-fallback.test.ts`: Jev timeout/invalid response → rules, no schema drift.
- `tests/chromatic-contradiction.test.ts`: negación textual insuficiente, provenance y revisión.
- `tests/chromatic-performance.test.ts`: 1k cromos, aristas densas, budget y p95 bajo carga.
- `tests/chromatic-shadow-legacy.test.ts`: no doble escritura, legacy intacto, flag rollback.
**No afirmar que estos archivos existen o tests pasan.**

## 9. Riesgos P0
1. Ontología inventada y consolidada como verdad → ADR/aprobación.
2. Cromos en kernel violan separación de dominio → motor en engine, adapter legacy.
3. Scores de JEV/Slow tratados como hechos → epistemic status y verifier.
4. Polaridad convertida en permiso o acción → policy kernel y SOP.
5. Cálculo de fuerzas con bucles/overhead → límites y convergencia.
6. Contaminación cross-tenant → identidad canónica + ACL por query.
7. Legacy regex de CardBuilder confundido con clasificación cromática → port separado.
8. Meta `seenHints` local confundido con ledger → C09/C10.
9. Eventos no durables o duplicados → depende de C02.
10. Graph projection incompleta → depende de C03.
11. Revocación incompleta → tombstones + reindex + snapshot invalidation.
12. API Jev no verificada → no crear cliente ficticio; C08.
13. Métricas sin baseline → benchmarks y controles comparativos.

## 10. Rollback, reportes y aceptación
Rollback: desactivar `chromaticV2.shadow/read` (flags **propuestos**, no existentes); detener worker; conservar snapshots de auditoría; reconstruir desde C02 cuando corresponda; mantener `kernel/cromos` V1 solo como compatibilidad. No desplegar ni fusionar sin aprobación.

Cada wave deja `REPORT-Wx.md` con SHA base, archivos reales, diffs, comandos/exit codes, decisiones, desviaciones, seguridad, latencia, pruebas, revisión Codex, rollback. C05 **PASS** solo con ontología aprobada, determinismo, integración C02/C03, tenant isolation, invalidación, benchmarks, tests y evidencia. Si falta ontología o tests, **PARTIAL/BLOCKED**.

## 11. Estado real y siguiente turno
```yaml
campaign: C05
turn: 06/16
repo: uniscrolliabrain-cloud/agente
branch: audit/preflight-cognition-option3-20261115
source_ref: main
source_commit_sha: NOT_VERIFIED
status: STATIC_AUDIT_AND_PLAN
chromatic_ontology_approved: false
jev_api_verified: false
runtime_modified: false
tests_executed: false
merge: false
deploy: false
next: C06_global_attention_and_metacognition
```
