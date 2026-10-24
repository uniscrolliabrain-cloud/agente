# TRABAJO IA-1 — Núcleo IA: Fast/Slow LLM · Chat con LLM · Contexto/Memoria

> Documento de trabajo autocontenido. Para una IA que **no ve el repo completo**.
> Dominios: `docs/audits/10-fast-slow-llm`, `11-chat-con-llm`, `12-contexto-memoria`.
> Fecha: 2026-10-13.

## Cómo usar este documento

- Trabaja **de arriba abajo** dentro de cada dominio. Cada tarea es independiente y verificable.
- Cada tarea lleva: **ID · Fichero (ruta relativa a la raíz del repo) · Problema · Fix · Verificación**.
- **Regla anti-maquillaje (obligatoria):** "hecho" = compila (`pnpm typecheck`) + su test pasa + es observable + hace lo que debe. Prohibido: borrar/skip tests, subir timeouts, o `as never`/`void x` para callar un error real. Si algo no se puede hacer bien, que quede `throw` honesto.
- **Rutas base:** server `apps/server/src/...`; frontend `apps/web/src/...`; dominio `packages/domain/src/...`.
- **NO toques** `apps/server/src/engine/service.ts` salvo que una tarea lo diga expresamente (está reparado y es gigante).

## Resumen

| Dominio | Tareas | Ficheros núcleo |
|---|---|---|
| 10 — Fast/Slow LLM | 20 | `engine/model.ts`, `engine/model-chain.ts`, `engine/conversation.ts`, `kernel/config/*` |
| 11 — Chat con LLM | 20 | `engine/conversation.ts` |
| 12 — Contexto/Memoria | 20 | `engine/memory.ts`, `engine/context/*`, `engine/rag.ts` |
| **Total** | **60** | |

---

# DOMINIO 10 — Fast / Slow LLM

**Promesa:** cada tenant tiene su propio modelo fast y slow, con cuotas y fallback cruzado.
**Estado real:** `model.ts` NO usa el slow; `executeModelTask` usa `modelChain(config)` global. `recordUsage` no distingue velocidad. Los tiempos del `TenantConfig` (fastIdleMs, quiescenceMs, slowLongMs, maxThoughtsPerTurn) están declarados pero sin cablear.

| ID | Hueco | Fichero | Fix | Verificación |
|----|-------|---------|-----|--------------|
| T-10-01 | `modelChain(config)` ignora el tenant config (lee solo `config.model` global) | `engine/model-chain.ts` | Acepta `TenantConfig` y usa el modelo del tenant; el global es solo fallback | Test: tenant con `fast.provider/model` propio se usa |
| T-10-02 | `TenantConfig.fast`/`.slow` sin validación al arrancar: apiKey vacía peta en el 1er mensaje | `kernel/config/resolver.ts` | Valida apiKey al construir; si falta, `console.warn` al arrancar | Arrancar sin `FAST_LLM_API_KEY` → warning en logs |
| T-10-03 | `EnvTenantConfigResolver` lee envs cada vez (100 reads/min) | `kernel/config/resolver.ts` | Cachea config por tenant con TTL | Test: 2 llamadas → 1 lectura de `process.env` (spy) |
| T-10-04 | Sin caché de `TenantConfig`: cada `kernel.config(ctx)` recalcula | `kernel/kernel.ts` | Cachea por `tenantId` con TTL | Test: misma ctx 2 veces → mismo objeto |
| T-10-05 | Sin fallback fast→slow: si fast falla salta al global | `engine/model.ts` | Cadena: fast(tenant) → slow(tenant) → global | Test: fast mock lanza → se llama slow del tenant |
| T-10-06 | Sin fallback slow→global ordenado | `engine/model.ts` | Cadena explícita slow(tenant) → global | Test: slow mock lanza → se llama global |
| T-10-07 | Sin latencia por velocidad: `recordUsage` no distingue fast/slow | `engine/model.ts` + `metrics/registry.ts` | Añade label `speed` a `openmuse_llm_calls_total` | Test: llamada fast → métrica con `speed="fast"` |
| T-10-08 | Sin cuotas por velocidad: cuota agotada en fast sigue permitiendo slow | `engine/model.ts` | Consulta cuota antes de elegir slow | Test: cuota fast=0 → llamada slow rechazada |
| T-10-09 | `shouldDelegateToSlow` con regex olvida idiomas/contexto | `engine/conversation.ts` | Palabras clave multi-idioma + señal de complejidad | Test: "analyze this" y "analiza" delegan; "hola" no |
| T-10-10 | Sin cambio dinámico fast→slow a mitad de turno | `engine/conversation.ts` | Si fast no puede resolver, reintenta en slow | Test: fast mock "no puedo" → reintento en slow |
| T-10-11 | `providerEnv` cae a `"google"` silenciosamente si el valor es raro | `kernel/config/provider-spec.ts` | Si no matchea provider conocido, lanza/warn | Test: `FAST_LLM_PROVIDER=xxx` → error, no google |
| T-10-12 | Sin `baseUrl` por tenant (schema lo soporta, resolver no lo lee) | `kernel/config/resolver.ts` | Lee `*_LLM_BASE_URL` al ProviderSpec | Test: baseUrl en env → providerSpec.baseUrl === valor |
| T-10-13 | Sin "modelo por rol" (legal usaría uno más caro) | `kernel/config/*` + `conversation.ts` | Override de modelo por `roleId` | Test: rol con modelo propio → se usa |
| T-10-14 | `TenantConfig.fastIdleMs` no se usa en conversation.ts | `engine/conversation.ts` | Usa `config.fastIdleMs` en la lógica de idle | Test: fastIdleMs custom → comportamiento cambia |
| T-10-15 | `TenantConfig.quiescenceMs` no se usa en closeTurn | `kernel/kernel.ts` | Aplica `quiescenceMs` al cerrar turno | Test: quiescenceMs custom → cierre lo respeta |
| T-10-16 | `TenantConfig.slowLongMs` no se usa en Meta (usa `longNoOutputMs`) | `kernel/observers/meta.ts` | Pasa `slowLongMs` al constructor de Meta | Test: umbral cambia con slowLongMs custom |
| T-10-17 | `TenantConfig.maxThoughtsPerTurn` no se usa (store usa constante) | `kernel/graph/*` | Lee `maxThoughtsPerTurn` del tenant | Test: tope custom → appendThought rechaza al pasar |
| T-10-18 | Sin "modo degradado": ambos fallan → error técnico | `engine/conversation.ts` | Si toda la cadena falla, mensaje humano | Test: mocks fallan → respuesta humana, no stack |
| T-10-19 | Sin test de que un tenant con config propia funciona | `tests/` (nuevo) | Test E2E tenant con fast propio | `pnpm test` nuevo test en verde |
| T-10-20 | `TenantConfig.embeddings` sin usar (RagService usa env directo) | `engine/rag.ts` | Lee `TenantConfig.embeddings` | Test: tenant con embeddings propio → se usa |

# DOMINIO 11 — Chat con LLM

**Promesa:** chat con tono controlado, tools útiles, feedback durante el slow y cancelación.
**Estado real:** prompt con 8 reglas de tono nunca validadas. `urgentBlock` siempre inyecta "DELEGACION FORZADA". RAG va al último mensaje del usuario (no como system). Presenter no wireado al cierre. Historial al RAG limitado a 3 mensajes.

| ID | Hueco | Fichero | Fix | Verificación |
|----|-------|---------|-----|--------------|
| T-11-01 | Prompt con 8 reglas de tono nunca se valida | `tests/` + `conversation.ts` | Test que verifica respeto del tono (mock LLM) | `pnpm test` nuevo test de tono |
| T-11-02 | `urgentBlock` siempre inyecta "DELEGACION FORZADA" aunque no aplique | `engine/conversation.ts` | Solo inyecta cuando `shouldDelegateToSlow` es true | Test: prompt simple → sin urgentBlock |
| T-11-03 | RAG inyectado al último mensaje del usuario (lo contamina) | `engine/conversation.ts` | Mueve RAG a system message | Test: mensaje usuario sin RAG pegado |
| T-11-04 | Historial al RAG limitado a 3 mensajes | `engine/conversation.ts` | Amplía ventana (configurable, ej. 10) | Test: conversación larga recupera contexto |
| T-11-05 | Sin "modo claro/oscuro" en el prompt (paso a paso vs directo) | `engine/conversation.ts` | Detecta intención y ajusta system | Test: "explicame paso a paso" → modo detallado |
| T-11-06 | `maxSteps: 6` hardcodeado sin progreso garantizado | `engine/conversation.ts` | Detecta bucle sin progreso y corta antes | Test: tool que no avanza → corta en <6 |
| T-11-07 | `browse_web` sin política de reintento (si falla URL, no reintenta) | `engine/conversation.ts` | Reintenta con otra URL/fuente | Test: URL mock falla → reintento |
| T-11-08 | `search_mail` sin límite configurable (20 hardcoded) | `engine/conversation.ts` | Lee límite de config/env | Test: límite custom → se respeta |
| T-11-09 | `delegate_task` sin visibilidad del estado para el usuario | `conversation.ts` + SSE | Emite progreso de la delegación | Test: delegar → eventos de progreso en SSE |
| T-11-10 | `remember_fact` guarda sin deduplicar | `engine/conversation.ts` | Deduplica por hash antes de escribir | Test: mismo hecho 2 veces → 1 memoria |
| T-11-11 | Sin "cancelar desde el chat" | frontend + SSE | Botón cancelar que aborte el stream | Test: cancelar → stream se detiene |
| T-11-12 | Sin "editar y reenviar" sin perder contexto | frontend | UI editar último mensaje usuario | Test: editar → reenvía con historial |
| T-11-13 | Sin "feedback implícito" (¿copió la respuesta?) | frontend | Evento de copia al bus | Test: copiar → evento emitido |
| T-11-14 | Sin chips de sugerencia contextuales (fijos) | frontend | Chips según contexto de la conversación | Test: contexto X → chips distintos |
| T-11-15 | `prepare_whatsapp` sin verificar conversación previa | `engine/conversation.ts` | Consulta hilo antes de sugerir | Test: ya habló → no sugiere de nuevo |
| T-11-16 | Sin resumen al cerrar el thread | `engine/conversation.ts` | Genera y persiste summary al cerrar | Test: cerrar thread → summary persistido |
| T-11-17 | `create_briefing` sin validar alucinación | `engine/conversation.ts` | Ancla el resumen a datos reales (RAG/memoria) | Test: briefing cita solo hechos del contexto |
| T-11-18 | `watch_page` sin notificar del resultado | `engine/conversation.ts` | Cuando el monitor dispara, notifica | Test: monitor cambia → notificación |
| T-11-19 | Sin streaming token a token real (typewriter simulado) | frontend + SSE | Emite tokens reales al SSE | Test: tokens llegan incremental al front |
| T-11-20 | Sin evento `message.edited` si el usuario edita | bus + frontend | Emite evento al editar | Test: editar → evento en bus |

# DOMINIO 12 — Contexto / Memoria

**Promesa:** memoria relevante y acotada; RAG con ranking real (IDF/BM25); presupuesto aplicado.
**Estado real:** `recall` carga hasta 2000 memorias y filtra en JS. `search` usa `bm25Score` sin IDF (aunque `computeIdf`/`bm25WithIdf` existen exportados). `budget.ts` existe pero `renderContext` no lo aplica. Chunk size y page size hardcodeados.

| ID | Hueco | Fichero | Fix | Verificación |
|----|-------|---------|-----|--------------|
| T-12-01 | `recall` carga hasta 2000 memorias en memoria y filtra en JS | `engine/memory.ts` | Paginación real + filtro en query | Test: 5000 memorias → recall <X ms |
| T-12-02 | Reformulación de query con últimos 2 mensajes concatenados (queries raras) | `engine/memory.ts` | Reformula solo si son coherentes, o usa solo el último | Test: mensajes inconexos → query limpia |
| T-12-03 | `recall` sin filtro por categoría si no se pasa `categories` | `engine/memory.ts` | Default a categoría del rol o todas explícitas | Test: sin categories → no mezcla categorías prohibidas |
| T-12-04 | `recall` sin filtro por rol si no se pasa `roleId` | `engine/memory.ts` | Exige rol o marca "transversal" | Test: sin roleId → no mezcla roles |
| T-12-05 | `formatRecall` trunca a 500 chars sin indicar | `engine/memory.ts` | Añade "…[truncado]" al cortar | Test: texto largo → indicador presente |
| T-12-06 | `searchMemories` con score de "palabras compartidas" (substring) | `engine/memory.ts` | Usa TF-IDF/embeddings como el RAG | Test: relevancia ordenada por score real |
| T-12-07 | `remember` dedupe por hash colisiona por casing (pierde distinción) | `engine/memory.ts` | Normaliza casing solo para dedupe, guarda original | Test: mismo texto distinto casing → 1 memoria, original |
| T-12-08 | `remember` sin validar categoría contra `MemoryCategory` | `engine/memory.ts` | Valida contra el enum | Test: categoría inválida → rechazada |
| T-12-09 | `dedupMemories` sin tope real (5000 removes posibles) | `engine/memory.ts` | Tope + log de cuántas borró | Test: 5000 duplicados → tope respetado |
| T-12-10 | `retryMissingEmbeddings` tope 50/pasada (lento con 10k) | `engine/memory.ts` | Lote configurable + métrica de progreso | Test: 10k → avance medible |
| T-12-11 | `chunkText` con `CHUNK_SIZE=900` hardcodeado | `engine/rag.ts` | Configurable por tipo de documento | Test: tamaño custom → chunks custom |
| T-12-12 | `RagService.search` con `SEARCH_PAGE_SIZE=500` (200 páginas con 100k) | `engine/rag.ts` | Paginación real / cursor | Test: 100k chunks → búsqueda acotada |
| T-12-13 | `searchVector` con cast a `vector(768)` hardcodeado | `engine/rag.ts` | Lee dimensión del modelo/config | Test: modelo 1536 → no cast roto |
| T-12-14 | `ingestText` con `maxChunks=1000` hardcodeado (PDF grande truncado) | `engine/rag.ts` | Aviso al truncar + configurable | Test: PDF >1000 chunks → warning |
| T-12-15 | `ContextEngine.assemble` sin tope de eventos (20 hardcoded) | `engine/context/assembly.ts` | Tope configurable | Test: tope custom → se respeta |
| T-12-16 | `renderContext` sin ordenar por relevancia | `engine/context/*` | Ordena por score antes de pintar | Test: contexto ordenado por score |
| T-12-17 | `learning-facts` sin TTL (crece sin tope) | `engine/context/*` | TTL/purga de facts viejos | Test: facts viejos → purgados |
| T-12-18 | Sin "olvido selectivo" (marcar obsoleto manteniendo histórico) | `engine/memory.ts` | Flag `obsolete` + filtro por defecto | Test: memoria obsoleta → no en recall, sí en histórico |
| T-12-19 | Sin "jerarquía de memoria" (empresa vs cliente) | `engine/memory.ts` | Nivel/categoría jerárquica | Test: memoria de empresa visible a todos |
| T-12-20 | `remember` sin `source` obligatorio (auditoría rota) | `engine/memory.ts` | `source` obligatorio | Test: sin source → rechazada |

---

## Cómo verificar el cierre de IA-1

- `pnpm typecheck` en verde.
- Los tests nuevos de cada tarea en verde (`pnpm test`).
- Cada tarea: diff mínimo, sin `as never`/`void x`/`skip`. Si una tool del chat (10/11) emite evento, se ve en el bus (observable).

## Qué NO tocar

- `apps/server/src/engine/service.ts` (reparado, gigante).
- Los `miniaudit.md`/`roadmap.md` de origen (son la fuente, no el objetivo).
- Otros dominios fuera de 10/11/12.


