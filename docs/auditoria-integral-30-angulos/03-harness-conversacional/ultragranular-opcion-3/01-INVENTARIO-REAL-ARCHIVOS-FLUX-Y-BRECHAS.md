# Inventario técnico real de núcleo cognitivo y conexiones
**Método:** lectura de archivos de `agente/main` y contratos de `agntia-ciberseguridad/main` mediante GitHub. No sustituye un code graph automatizado ni una ejecución de tests. Las rutas se mantienen literales para facilitar handoff.

## 1. Thought y autoría
`apps/server/src/kernel/graph/thought.ts`: Zod de Thought y AttentionVector; nodos, matched/ignored, intención, confidence, provenance, contexto y edges. Cada pensamiento es una pieza de información con actor y tenant; no es un hecho empresarial validado por existir en el grafo. Auditar autores `authors/slow-author.ts`, `authors/*`, llamadas a `kernel.writeThought` y cómo se guardan/recuperan por turnId. Test negativo: intento de insertar Thought de otro tenant o con nodeRef malformado.

## 2. Captura de Slow
`apps/server/src/kernel/cognition/capture.ts` (64 líneas): función `captureSlowCognition(deps,input)`; construye `SlowAuthor({kernel})`, invoca `writeReasoning` con `progress:"ready"`, construye tarjeta mediante `buildCognitionCard` y la guarda en `CognitionCardStore`. El comentario dice que `model.ts` la llama al terminar Slow. **Auditar caller real**: si la captura es best-effort, si los errores afectan la respuesta y si `progress:ready` equivale a evento persistido. No guardar prompts como si fueran razonamientos verificados. Este es el punto natural para registrar `card.enrichment.requested` sin duplicar Thoughts.

## 3. Builder actual
`apps/server/src/kernel/cognition/card-builder.ts` (109 líneas): `buildCognitionCard` obtiene body, firstLine, infiere kind con regex para riesgo/oportunidad/decisión/resumen/pregunta; fallback insight. TTL predeterminado 7 días, ID SHA256 de `tenantId:dedupeKey|thoughtId:1`, entityRefs max20, body max8000 caracteres, `scope:thread`, `status:proposed`, source `slow.llm`, `version:1`. **Riesgo de semántica:** dedupeKey basada solo en task puede suprimir una actualización legítima posterior del mismo task; diseñar dedupe por `taskId+revision+projectionKind` y test de versiones. **No afirmar** que inferKind es clasificación JEV.

## 4. Contrato Zod
`packages/domain/src/cognition-card.ts` (81 líneas): kinds `insight,risk,opportunity,decision,summary,question`; estados `proposed,consumed,expired,superseded`; scopes `thread,tenant`; campos id,tenantId,owner,threadId?,turnId,thoughtId,kind,title,body,status,scope,confidence,evidence{thoughtIds[1..20],entityRefs[0..20],memoryIds?},attention{primary,matched},provenance{source slow.llm|sop|system,model?,createdAt,expiresAt?},usefulAt?,consumedAt?,version. **Esquema .strict()**: no añadir metadatos arbitrarios al payload V1. Crear V2 versionado o envelope adicional y migración, manteniendo lectores V1.

## 5. CardStore
`apps/server/src/kernel/cognition/card-store.ts` (228 líneas): `save` con `insertIfAbsent` opcional; `get` filtra tenant; `list` filtra tenant tras consultar por owner; `pending` solo `status=proposed`, filtra thread y TTL; `rankCognitionCards` mezcla confianza .45, recencia .25, léxico .2, atención .1 y bonus scope .05. `markConsumed` usa CAS si está disponible; `release` devuelve tarjeta si falla llamada al modelo; `markUseful` promueve scope a tenant. **Puntos de inspección:** ¿qué backend implementa compareAndSwap?, ¿quién puede llamar markUseful?, ¿owner se comparte entre agentes?, ¿qué significa thread sin threadId?, ¿cómo se elimina tarjeta revocada?, ¿qué pasa si CAS no está soportado? No confundir owner-key con política de acceso completa.

## 6. Contexto actual
`apps/server/src/engine/context/cognition-cards.ts` (110 líneas): `assembleCognitionCards` pide pendientes, selecciona máximo 3, reclama con `markConsumed`, renderiza bloque marcado explícitamente como datos no instrucciones. `MAX_BODY_CHARS=700`; `MAX_BLOCK_TOKENS=700`; estimador `ceil(length/4)`. `selectCognitionCards` recorre orden y corta en el primer exceso (no prueba siguiente tarjeta más corta): oportunidad de mejorar empaquetado. **Diferencia crítica:** 700 tokens de bloque hoy vs ~1000 tokens por tarjeta discutidos como futuro; no confundir. Los límites en caracteres no equivalen a tokens.

## 7. Ciclo y subscriber
`apps/server/src/kernel/cognition/cycle.ts`: fases perceive/attend/decide/act/reflect/consolidate, cierre e idempotencia por turno. Verificar que cada fase realice su responsabilidad y no sea solo telemetry.
`apps/server/src/kernel/subscribers/events.ts` (128 líneas): `startKernelEventSubscriber` hace `subscribeAll`; ignora `kernel.*`; mapea entity/relation/action/task/sop/policy/state/verification; valida `KernelContext` con actorId `bus-subscriber`, role system, requestId por event.id; llama `runCognitionCycle` en tarea async sin await del publisher, captura errores en log. **Hallazgo concreto:** el mapping no incluye `security.*`; los eventos del hijo necesitan adaptador y registro de schemas. Tampoco se ha observado cursor persistente del subscriber. El propio archivo explica que versiones previas fallaban al omitir actorId y al enumerar tenants en arranque.

## 8. Event Bus
`apps/server/src/engine/events/bus.ts`: validar tipos/schema, persistir, emitir a subscribers, replayTenant y dedupe. Revisar semántica `persisted:false`: si un efecto crítico continúa sin confirmación de auditoría, establecer fail-closed o reconciliación según operación. No confundir `subscribeAll` en memoria con una cola durable con ACK. Verificar replay de eventos tras reinicio y que el event ID sea estable entre retries.

## 9. Atención
`apps/server/src/kernel/graph/attention.ts`: funciones puras sobre AttentionVector (topMatched, totalAttention, normalizedWeights, matchScore, overlap/divergence); usa canonicalNode/sameNode. No es un servicio que vigila continuamente el negocio. Definir proyector de atención: entrada eventos/Thought/estado de sesión, salida prioridad por agent+tenant+task, versionado, TTL y explicabilidad. La relevancia no debe ampliar ACL. Evitar que un score alto permita filtrar datos ajenos.

## 10. Cromos
`apps/server/src/kernel/cromos/cromo.ts`: tipos `logic,physics,intent,memory,policy`, axioms, fields y provenance; comentario de módulo `CROMOS_PENDING_V1` señala no cableado. Antes de crear un servicio: buscar dónde se instancian, persisten, evalúan, conectan a Thought/Graph y se publican por bus. La ontología puede enriquecer metadatos de tarjeta pero nunca sustituir reglas de policy.

## 11. Metacognición
`apps/server/src/kernel/observers/meta.ts`: `Meta` usa reglas sobre slow ready/failed, fast idle, timeout, conflictos de atención y emite hints; mantiene seenHints en instancia. No equivale a JEV AI. Debe conservarse como capa de observación de fallos, con scope y persistencia de dedupe revisados. JEV futuro tendrá adapter versionado y resultados no autoritativos.

## 12. Presenter
`apps/server/src/kernel/observers/presenter.ts`: compone selecciones de Thoughts por rol, confianza y atención. Falta verificar todos los callers, cómo elige evidencia y cómo pasa al Fast. Evitar crear un segundo Presenter sin antes ampliar el existente. Separar `CardPresenter` (para Fast) de `ClientProgressPresenter` (para UI) si los contratos divergen.

## 13. Promoción y consolidación
`apps/server/src/kernel/graph/promote.ts`: clasifica destino response/memory/business-graph/audit/discard, incluye dedupe de survivors y tiene escritura condicional de grafo en cuerpo. El encabezado histórico no refleja necesariamente toda la implementación; **no afirmar que toda promoción está sin implementar**. Leer `promote.ts` completo y sus deps/callers, verificar transacciones y ACL.
`apps/server/src/kernel/graph/consolidate.ts`: dedupe por role/actor/content y tenant; negaciones explícitas `no/not/sin/nunca`, límite de comparación 200 por tenant. No detecta contradicciones semánticas generales; conservar distinción `textualNegations` y futura revisión Slow/JEV como sugerencia, no hecho.

## 14. Memorias y grafo multicapa
Se han identificado superficies `apps/server/src/engine/memory/`, `apps/server/src/engine/rag/`, `apps/server/src/kernel/graph/` y referencias `businessGraph`; **la lectura realizada no certifica cinco memorias operativas ni su wiring end-to-end**. Inventariar stores, modelos, políticas, embeddings, TTL, forget/revoke, persistencia, retrieval y proyección al grafo. La memoria personal de LAIA, memoria de tenant, de tarea, semántica y episódica son categorías ilustrativas, no atribuirlas como nombres históricos definitivos.

## 15. Ciberseguridad
`docs/09-contrato-con-agente.md` del hijo define operaciones nominadas, envelope, eventos y Job; `docs/ESTADO-VIGENTE.md` reporta 84 rutas FastAPI, SDK TS, 196 tests Python y demo sintética. Son **datos reportados** por el hijo, no reejecutados aquí. Inspección pendiente de `contracts.py`, `jobs/schema.py`, `typescript/` y outbox real. No importar librería Python en el monorepo TS ni usar shell libre.

## 16. Matriz de brechas P0/P1/P2
P0: aislamiento tenant/owner/actor, permisos de tarjetas, replay durable, semántica de éxito/partial/unknown, prevención de instrucciones desde datos externos.
P1: snapshot persistente, clasificación JEV-port, enriquecer tarjetas, atención continua, contrato Cyber y Presenter, token budgets.
P2: cromos completos, cinco memorias consolidadas, metacognición avanzada, UX refinada y optimización de latencia tras medir.

## 17. Checklist de inspección para el siguiente agente
Para cada archivo: (a) SHA de commit, (b) exports/imports/callers, (c) tabla de datos, (d) efectos externos, (e) invariantes, (f) errores, (g) tests, (h) deuda, (i) patchset propuesto, (j) rollback. Documentar ausencia de evidencia, no sustituir por intuición.
