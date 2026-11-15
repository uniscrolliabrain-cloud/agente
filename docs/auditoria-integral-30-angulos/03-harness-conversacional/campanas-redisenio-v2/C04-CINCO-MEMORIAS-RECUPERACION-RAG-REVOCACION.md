# C04 — Cinco memorias, recuperación RAG, procedencia y revocación
**Turno 05/16 — 2026-11-15. Repositorio principal:** `uniscrolliabrain-cloud/agente`. **Estado:** auditoría estática + campaña propuesta; no implementación, tests ni despliegue. **Precedentes:** C00–C03, ADR-009, plan maestro opción 3, NC-01 como diseño previo no vinculante.

## 1. Resultado perseguido
Crear cinco memorias cognitivas **episódica, semántica, procedimental, autobiográfica y de trabajo**, sin confundirlas con las categorías de producto existentes (`identidad/dominio/preferencias/historial`), los recuerdos privados, hechos de perfil, ni con RAG documental. El grafo C03 contiene referencias y relaciones; el Event Bus/proyector C02 conserva la fuente de verdad. JEV clasifica y propone metadatos; Slow produce candidatos de tarjetas, hipótesis y síntesis; **kernel/policy verifica permisos, promoción, persistencia y revocación**. Fast recibe un contexto mínimo autorizado, no un volcado de memorias.

## 2. Evidencia del código leído (main, SHA blob)
| Archivo | SHA blob | Evidencia |
|---|---|---|
| `apps/server/src/engine/memory.ts` | `28dcf52b5df55c16529091ad45768895e510e27e` | 485 líneas; `MemoryService.recall`, `searchMemories`, `recallFacts`, `rememberPrivate`, `remember`, perfiles versionados |
| `apps/server/src/engine/rag.ts` | `74453c54484df22536a7c0bac5683073da077d61` | 575 líneas; ingesta, chunks, registry, vector search, BM25, fallback, source removal |
| `apps/server/src/engine/context/assembly.ts` | `39a9db7dd1882e21de80228517cc1cc8a64a5a90` | 132 líneas; context renderer, atención, relevancia textual |
| `apps/server/src/engine/context/budget.ts` | `713c9b3b757252ea6e469e95a576adae03cf5f2f` | 63 líneas; estimación chars/4, presupuestos fijos |
| `packages/domain/src/agent.ts` | `5f4ef414a2fafaee3268712218d9620b960d8549` | categorías actuales y contratos de memoria del producto |
| `docs/campaigns/NC-COORDINATION/specs/NC-01-SOURCE.md` | `3f32aea1ea3352ee02b544b429db5f7acd0088c3` | propuesta histórica de las cinco memorias y consolidación; no prueba de código implementado |

**Límite:** se inspeccionaron definiciones y puntos relevantes, no todos los callsites, SQL migrations, tests ni adapters. El código en main puede avanzar; revalidar SHA antes de parches. No asumir que el diseño NC-01 está ejecutado.

## 3. Hallazgos C04-F01–F20
1. **F01:** `RecallResult` reúne ragHits, memories, facts, privateMemories, pero no es un contrato epistemológico único con sourceRevision, visibility y evidenceRef.
2. **F02:** `recall` ejecuta cuatro recuperaciones paralelas; errores RAG se convierten en `[]`. Exponer estado degradado y motivo sin romper interfaz legacy.
3. **F03:** `searchMemories` usa páginas de 500 y cap de 2.000; recall no garantiza exhaustividad a escala.
4. **F04:** `DEFAULT_MEMORY_LIMIT=8` y `DEFAULT_RAG_LIMIT=5` son límites de presentación, no cuotas de almacenamiento ni prueba de pertinencia.
5. **F05:** recuerdos privados tienen colección distinta y `privateOwner`; hay que auditar identidad real del solicitante y evitar que un caller elija arbitrariamente privateOwner.
6. **F06:** recuerdos por rol tienen filtros `roleId/includeRoleMemories`; rol no equivale a permiso ni consentimiento.
7. **F07:** hechos de perfil usan versiones y precedencia; no suponen verificación, temporalidad ni retractación semántica.
8. **F08:** `publishProfileFact` usa `insertIfAbsent`; comprobar CAS, race de versiones y conflictos antes de confiar en orden.
9. **F09:** `rememberPrivate` deduplica por ID derivado del texto; corrección/revisión puede requerir evento nuevo, no sobrescritura.
10. **F10:** `RagChunk` permite embedding null y `RagHit` tiene verified/revision opcionales; recuperar un hit no demuestra validez temporal.
11. **F11:** `RagSourceRecord` incluye revision, status, attempts, conexión y fecha; reutilizarlo para evidencias documentales, no duplicar registry.
12. **F12:** pgvector usa owner en WHERE y dimension configurable; verificar aislamiento SQL y políticas RLS, no inferirlas del filtro.
13. **F13:** ruta fallback recorre `rag-chunks` por keyset y mezcla coseno+BM25; medir coste, latencia, recall y saturación.
14. **F14:** `ingestSource` escribe chunks y registry en pasos separados; un fallo parcial puede dejar mezcla de revisiones hasta reconciliación.
15. **F15:** `pruneChunks` y `removeSource` listan hasta 20.000; auditar borrado total en datasets mayores y rutas de vector nativo.
16. **F16:** cita `verified` se calcula frente a registry; no confundir fuente indexada con contenido verdadero.
17. **F17:** `renderContext` estima relevancia semántica con coincidencia de palabras; no es recuperación semántica real.
18. **F18:** `estimateTokens` chars/4 es aproximación; controlar límites reales por tokenizer/provider y reservas.
19. **F19:** el boost por `AttentionVector` prioriza nodos mencionados; atención nunca debe saltarse ACL ni validación de vigencia.
20. **F20:** cinco memorias de NC-01 están documentadas como arquitectura propuesta; **no declarar stores episódico, semántico, procedimental, autobiográfico y de trabajo implementados** sin comprobar código real.

## 4. Taxonomía: cinco memorias cognitivas y capas existentes
| Tipo V2 | Contenido | Escritura autorizada | Recuperación | Retención |
|---|---|---|---|---|
| Episódica | hechos/acciones observadas con quién, cuándo, dónde, resultado, causalidad limitada | eventos verificados y receipts C02/C03 | tiempo, entidad, episodio, relación, similitud | política tenant; tombstone |
| Semántica | conocimiento estabilizado, definiciones, claims y relaciones | consolidación Slow propuesta + JEV clasificación + verificación kernel | híbrida lexical/vector/graph | revisión y fuente |
| Procedimental | SOP, capacidad, precondiciones, aprobaciones y resultado de ejecuciones | registros de SOP firmados por runtime/policy | intención, capability, entorno | versionado de SOP, no instrucciones libres |
| Autobiográfica | trayectoria contextual del agente/empresa y decisiones, con procedencia | composición de episodios autorizados, nunca autobiografía inventada | identidad, actor, timeline, objetivo | límites de privacidad por actor |
| Trabajo | foco actual, turnos, hypotheses y contexto operativo temporal | workspace/turn projector con TTL | contexto activo y prioridad | TTL corto, sin asumir persistencia durable |

**Separaciones:** memorias privadas humanas siguen en ámbito privado, no se incorporan automáticamente a autobiografía de LAIA; memorias por empresa/rol son **scopes**, no sexto tipo. El documento RAG es evidencia o fuente, no necesariamente conocimiento consolidado. Una tarjeta puede tener varias vistas indexadas, pero una sola fuente autoritativa.

## 5. Contratos propuestos (no existentes todavía)
```ts
type MemoryKindV2 = "episodic"|"semantic"|"procedural"|"autobiographical"|"working";
type MemoryStatusV2 = "candidate"|"verified"|"superseded"|"retracted"|"expired";
interface MemoryCardV2 {
  schemaVersion:"2.0"; cardId:string; revisionId:string; tenantId:string;
  ownerId:string; subjectActorId?:string; roleId?:string; kind:MemoryKindV2;
  status:MemoryStatusV2; sourceEventIds:string[]; evidenceRefs:string[];
  graphNodeRefs:string[]; provenance:{origin:string; observedAt?:string; ingestedAt:string; verifiedBy?:string; projectorVersion:string};
  visibilityPolicyId:string; policyRevision:string;
  contentRef:string; contentDigest:string; classification?:{jevVersion:string; taxonomyVersion:string; confidence:number};
  validFrom?:string; validUntil?:string; expiresAt?:string; tombstoneAt?:string;
}
interface MemoryReadContextV2 {
  tenantId:string; authenticatedActorId:string; roleIds:string[];
  purpose:"chat"|"task"|"audit"|"agent_context"; policyRevision:string;
  query:string; maxTokens:number; deadlineMs:number;
}
interface MemoryRecallV2 {
  hits:Array<{card:MemoryCardV2; score:number; signals:Record<string,number>; citationRefs:string[]}>;
  degraded:boolean; degradedReasons:string[]; indexRevision:string; traceId:string;
}
```
Los `roleIds` deben proceder de auth/policy, **no** de parámetros del prompt. `contentRef` se resuelve solo tras autorización. Los campos `verifiedBy`/evidence no permiten elevar automáticamente una inferencia a verdad. La taxonomía y versionado deben quedar congelados en C01 antes de escribir migraciones.

## 6. Flujo transversal y wiring
```text
Event C02 → projector con inbox/cursor → Evidence/Claim C03
    ├→ episodic encoder → episodic index
    ├→ semantic candidate → JEV metadata → verifier → semantic index
    ├→ SOP receipt → procedural index
    ├→ episodic rollup autorizado → autobiographical index
    └→ active turn/workspace → working memory TTL
Auth/policy → recall router → lexical/vector/graph/time retrieval
           → authorization + validity filter → dedupe + rerank
           → context budget → Fast / Slow / Presenter
Revocation event → source invalidation → all indexes + caches + snapshots
```
La recuperación de cinco memorias **no debe bloquear** el Fast LLM: deadline explícito, degradación observada y context package pequeño. El Slow puede procesar consolidaciones asíncronas, nunca bloquear la ruta de respuesta por mantenimiento. Las clasificaciones de JEV son datos, no permisos.

## 7. Patchsets PS04.0–PS04.12 (rutas propuestas; localizar convenciones antes)
**PS04.0 Baseline:** inventario completo de imports/callers de `MemoryService`, `RagService`, `renderContext`, DB tenant-scoped, routes y UI; pruebas actuales, esquemas, flags, owner semantics. Crear evidencia en `docs/.../C04/evidence/`.
**PS04.1 Contratos:** `packages/domain/src/cognitive-memory-v2.ts`, `memory-provenance-v2.ts`, `memory-recall-v2.ts`, schemas Zod; exports reales del paquete.
**PS04.2 Interfaces:** `apps/server/src/engine/cognition/memory/ports.ts`, `policy-scoped-read.ts`; no importar un store genérico sin tenant.
**PS04.3 Proyector:** `memory-projector.ts`, consume C02 y refs C03, stable id y version, no doble escritura.
**PS04.4 Episódica:** `episodic-store.ts`, `episode-encoder.ts`, timestamps, event refs y queries temporales.
**PS04.5 Semántica:** `semantic-store.ts`, `semantic-consolidator.ts`, candidate→verified, contradicción/retractación, referencias a evidencias.
**PS04.6 Procedimental:** `procedural-index.ts`, indexar SOPs/versiones/receipts existentes; **no** generar ejecutables desde texto recuperado.
**PS04.7 Autobiográfica:** `autobiographical-index.ts`, actor scopes, timeline, provenance y aislamiento de datos privados.
**PS04.8 Trabajo:** `working-memory.ts`, TTL, budgets, estado de turno, cleanup y fail-safe.
**PS04.9 Recuperación:** `retrieval/hybrid-memory-retriever.ts`, `retrieval/reranker.ts`, `retrieval/recall-trace.ts`; integrar `RagService` existente vía adapter, no reescribir su motor.
**PS04.10 Revocación:** `memory-invalidation.ts`, tombstones, revision-aware index jobs, cache purge y reindex.
**PS04.11 Compatibilidad:** facade `MemoryService.recall` con feature flag y salida legacy, `renderContext` con selector nuevo opt-in; UI `MemoryView` solo si el modelo cambia y tras inventario.
**PS04.12 Observabilidad:** `memory-recall-v2.test.ts`, `memory-revocation-v2.test.ts`, `memory-tenant-isolation-v2.test.ts`, benchmark datasets, metrics de recall/precision/p95/token usage, reporte final.

**No ejecutar PS04.3–PS04.11 hasta tener C02/C03 implementados o adaptador temporal documentado y autorizado.** La documentación de campañas no implica que las dependencias existan en runtime.

## 8. Waves y gates de Freebuff/Codex
**W0 Auditoría de alcance:** localizar todo caller, schema, DB, migrations y tests; comprobar si otros squads están creando `engine/cognition/memory/*`. Gate: tabla owner/superficie de escritura y SHA de main.
**W1 Diseño y contratos:** cerrar taxonomía, visibilidad, identity y temporalidad; validar Zod y fixtures multi-tenant. Gate: no leakage, no category drift.
**W2 Proyección de cinco memorias:** construir adapters y proyección shadow idempotente; tests replay/restart. Gate: mismo evento no duplica tarjeta.
**W3 Recuperación híbrida:** lexical+vector+graph+temporal, scores explicables y deadline. Gate: ningún resultado sin autorización; medir contra baseline.
**W4 Consolidación y aprendizaje:** Slow/JEV producen candidatos; verificación y promoción controlada; comparar contradicciones con corpus. Gate: no promoción automática de hipótesis.
**W5 Revocación y retención:** tombstone, fuente corregida, borrado completo, índices, cache, snapshots, privacy. Gate: documento revocado no vuelve por embeddings ni fallback.
**W6 Wiring de conversación:** adapter opt-in a `MemoryService` y context budget, Fast/Slow; feature flag por tenant. Gate: p95, tokens, compatibilidad de UI.
**W7 Certificación y handoff:** typecheck, unit, integration, e2e, fault injection, metrics, revisión Codex, rollback probado. Gate: aprobación humana antes de activar V2.

## 9. Matriz adversarial mínima
| Caso | Esperado |
|---|---|
| Usuario A solicita `privateOwner` de B | deny, cero contenido |
| Misma empresa, roles distintos | filtro policy por actor, no solo roleId |
| Dos tenants con mismo texto y embedding | índices y resultados separados |
| Fuente Drive revisada | hits antiguos invalidados, revision visible |
| Fuente eliminada con >20k chunks | no quedan residuos; job verificable |
| Ingesta interrumpida a mitad | registry no publica mezcla de revisiones |
| RAG sin API embeddings | degradación segura y trazable |
| JEV no responde | fallback autorizado, sin promoción silenciosa |
| Slow inventa hecho | status candidate, sin verified |
| Replay C02 | mismo cardId y digest, cero duplicados |
| Actor pierde permisos durante recall | revalidar antes de servir contenido |
| Borrado privado | no aparece en índice, caché, snapshots ni logs sensibles |
| Prompt injection en documento | texto tratado como dato, no instrucción |
| Más de 2k memorias | paginación completa/índice con recall medido |
| p95 Fast bajo carga | deadline, budget y fallback sin bloqueo |
| Versiones de SOP contradictorias | versión activa autoritativa, no ejecutar receta obsoleta |

## 10. Rollback y compatibilidad
Feature flags por tenant `cognition.memoryV2.shadow`, `cognition.memoryV2.read`, `cognition.memoryV2.write` **propuestos**, no asumir que existen. Primera fase shadow y comparador de diffs; desactivar lectura V2 restaura `MemoryService.recall` legacy, sin borrar históricos ni tocar RAG original. Las migraciones deben ser aditivas y reversibles, con reindex desde eventos válidos; borrar físicamente solo conforme a política de privacidad/retención.

## 11. Entregables por ola y plantilla de reporte
Cada ola debe producir `REPORT-Wx.md` con commit SHA, rutas creadas/modificadas, diff, pruebas/comandos/exit codes, métricas, riesgos, incompatibilidades, dependencias, rollback y decisión GO/NO-GO. Adjuntar `CALL-GRAPH.md`, `CONTRACT-MATRIX.md`, `SECURITY-MATRIX.md`, `BENCHMARK-BASELINE.md`, `RETRIEVAL-TRACES.jsonl` (sin datos personales) y `HANDOFF-C05.md`. No reportar PASS sin ejecutar.

## 12. Estado de cierre de documentación
- **Auditoría:** parcial, estática, con rutas y SHA blob verificadas en main.
- **Código V2:** no escrito.
- **Tests:** no ejecutados.
- **Branch:** `audit/preflight-cognition-option3-20261115`, documentación únicamente.
- **Próximo turno:** C05 cromos, polaridades, atención y clasificación JEV; antes releer C00–C04 y auditar `kernel/cromos`, `kernel/graph/attention`, JEV integration y consumidores reales. 
