# Frente 12 — contexto y memoria, explicado en lenguaje natural

## La idea de fondo

Un agente sin memoria es un asistente que cada vez que hablas con él empieza de cero. Un agente con memoria es un compañero que recuerda lo que le contaste, lo que pasó, y lo usa. El frente 12 es eso: **que el agente recuerde lo relevante y olvide lo demás**.

El repo tiene dos sistemas para esto:

- **RAG** (Retrieval Augmented Generation): busca fragmentos de documentos por similitud. Como un Google interno.
- **Memoria**: hechos curados que el agente guarda. Como una libreta.

Cuando el usuario escribe, el agente hace dos cosas:
1. **Recupera** (recall): busca en el RAG y en la memoria lo que pueda ser relevante.
2. **Ensambla contexto** (assemble): junta rol, entidad, relaciones, eventos, memoria y aprendizaje, y lo pinta en un texto que se le pasa al LLM.

Y cuando el agente termina una tarea, hace dos cosas más:
3. **Aprende** (learn): guarda hechos de la ejecución.
4. **Olvida** (dedup): borra duplicados.

Eso es el frente 12. Ahora vamos pieza por pieza.

---

## Lo que hace tu código hoy

### 1. Recuperación (RAG)

El `RagService` recibe una query, la convierte a embedding (un vector de 768 números), y busca los fragmentos más parecidos. Dos modos:

- **Con pgvector** (Postgres real): hace la búsqueda en SQL, rápido, con índice HNSW.
- **Sin pgvector** (PGlite): recorre todos los chunks, calcula coseno y BM25, y devuelve el top.

**Lo que hace bien:** la búsqueda híbrida (coseno + BM25) es sólida. La ingesta con concurrencia acotada. La paginación por keyset.

**Lo que le falta:**

- **No hay IDF real.** BM25 sin IDF es como un buscador que no sabe qué palabras son comunes y cuáles raras. "el" y "OpenMuse" pesan igual. Eso hace que fragmentos irrelevantes ganen a relevantes.
- **`SEARCH_PAGE_SIZE = 500`.** Con 100.000 chunks, son 200 páginas por búsqueda. Lento.
- **`CHUNK_SIZE = 900` y `CHUNK_OVERLAP = 120` hardcodeados.** Un PDF legal y un chat necesitan chunks distintos.
- **`RAG_MAX_CHUNKS_PER_SOURCE = 1000` hardcodeado.** Un PDF de 500 páginas se trunca sin avisar.
- **`vector(768)` hardcodeado.** Si cambias de modelo de embeddings (por ejemplo, a uno de 1024), el cast falla.

### 2. Memoria

El `MemoryService` guarda hechos en `memories`. Cada hecho tiene `text`, `source`, `category`, `tags`, `roleId`, `createdAt`.

**Recupera** con `recall`:
- Reformula la query con los últimos 2 mensajes.
- Busca en RAG y en memoria en paralelo.
- Filtra por categoría y por rol si se le pasa.
- Devuelve `RecallResult` con `ragHits`, `memories`, `text`.

**Guarda** con `remember`:
- Normaliza el texto (lowercase, sin espacios extra).
- Hash para dedupe.
- Si ya existe, devuelve el existente.
- Si no, lo guarda con `source ?? "User"`.

**Olvida** con `dedupMemories`:
- Carga 5000 memorias.
- Deduplica por texto normalizado.

**Lo que hace bien:** el dedupe por hash, el filtro por categoría/rol, la reformulación básica.

**Lo que le falta:**

- **Carga 2000 memorias en memoria.** Con 10.000, lento. Debería paginar.
- **`formatRecall` trunca a 500 chars sin avisar.** El LLM no sabe que el texto estaba cortado.
- **`searchMemories` con substring, no TF.** "el cliente prefiere café" y "café" matchean igual que "cliente" y "café". El scoring es pobre.
- **`reformulateQuery` solo concatena.** "dame el informe" + historial de 2 mensajes = query rara.
- **`remember` no valida categoría.** Acepta cualquier string.
- **Sin `forget()`.** No hay forma de decir "olvida esto".
- **Sin jerarquía.** Todas las memorias son planas. No hay "memoria de empresa" vs "memoria de sesión".

### 3. Contexto

El `ContextEngine.assemble` junta:
- El rol activo (con sus memorias inline + las guardadas).
- La entidad (si hay `entityId`).
- Las relaciones de esa entidad.
- Los eventos recientes (20 por defecto).
- El `RecallResult` de la memoria.
- Los `learning-facts` (los hechos aprendidos).

Y lo devuelve como `ContextPackage`.

El `renderContext` lo pinta como texto:
```
Rol activo: Alex (warm).
Objetivo: ...
Memorias del rol (datos):
- [rol-identidad] ...
- ...
Entidad: ...
...
```

**Lo que hace bien:** junta todo lo que el LLM necesita saber en un solo paquete tipado.

**Lo que le falta:**

- **`renderContext` no aplica budget.** Acepta `budget` pero no lo usa. Ordena por `scoreItem` pero corta por cantidad (MAX_ROLE_MEMORIES = 8), no por tokens. Si cada memoria son 500 chars, son 4000 chars de prompt. Si son 50 chars, son 400. **No hay control real de tokens.**
- **`DEFAULT_EVENT_LIMIT = 20` hardcodeado.** No configurable.
- **`learning-facts` sin TTL.** Los facts aprendidos crecen sin tope. Un agente que corre 1 año tiene miles.

### 4. Aprendizaje

El `LearningObserver.observe` se llama al final de cada ciclo (goal → plan → execute → verify). Guarda:
- `learning-facts`: hechos del goal.
- `learning-patterns`: firmas de plan que funcionan.
- `failure-lessons`: errores recurrentes.
- `procedural-learning`: patrones promovidos a SOP propuesto si superan 5 éxitos.

**Lo que hace bien:** el ciclo de aprendizaje es sólido. Detecta patrones y los propone como SOP.

**Lo que le falta:**

- **Sin TTL en `learning-facts`.** Crecen sin purga.
- **Sin filtro de relevancia.** El `engine.ts` filtra por substring de query. Simple.

### 5. Presupuesto

El `budget.ts` tiene `estimateTokens`, `selectWithinBudget`, `scoreItem`, `allocationWithDefaults`. **No se usa en ningún sitio** salvo `scoreItem` (que sí se usa en `assembly.ts`).

**Lo que hace bien:** `estimateTokens` es `chars / 4`, suficiente para presupuestar.

**Lo que le falta:** cablearlo. Ya está todo, solo hay que llamarlo.

---

## Lo que todavía no hace (resumen por pieza)

| Pieza | Lo que no hace |
|---|---|
| RAG | IDF real, chunk configurable, page size configurable, max chunks configurable, vector dim configurable |
| Memoria | Paginación, `forget()`, TF scoring, truncamiento visible, reformulación decente |
| Contexto | Budget real, event limit configurable, learning TTL |
| Aprendizaje | TTL, filtro de relevancia |
| Jerarquía | No existe |

---

## Lo que debería hacer

**Recuperación:**
- Que un fragmento relevante gane a uno irrelevante (IDF).
- Que se pueda ajustar el tamaño de chunk por tipo de documento.
- Que no cargue 100.000 chunks en memoria.
- Que el cast de vector sea configurable.

**Memoria:**
- Que cargue paginada.
- Que el scoring sea TF, no substring.
- Que el truncamiento sea visible.
- Que se pueda olvidar selectivamente.
- Que la reformulación no genere basura.
- Que las memorias tengan jerarquía (tenant, owner, rol, sesión).

**Contexto:**
- Que el budget se aplique de verdad.
- Que el event limit sea configurable.
- Que `learning-facts` no crezca sin tope.

**Aprendizaje:**
- Que `learning-facts` tenga TTL.
- Que el filtro sea por relevancia real, no substring.

---

## Los 14 fixes que hemos creado

**RAG:**
1. **IDF real** — `computeIdf` y `bm25WithIdf` en `rag.ts`. El corpus es la página actual de candidatos.
6. **Chunk configurable** — `CHUNK_SIZE` y `CHUNK_OVERLAP` leen de env.
7. **Search page size** — `SEARCH_PAGE_SIZE` de 500 a 100, configurable.
11. **Vector dim configurable** — el `768` hardcoded en SQL pasa a `$4`.
12. **Max chunks configurable** — `RAG_MAX_CHUNKS_PER_SOURCE` lee de env.

**Memoria:**
3. **`forget()` con TTL** — nuevo método `forget` (soft delete con `expiresAt`) y `forgetExpired` (purga).
4. **Jerarquía** — `MemoryContext` con `tenantId`, `owner`, `roleId`, `sessionId`. Campo opcional en `AgentMemory`.
5. **Paginación** — `searchMemories` usa `listPaged` en vez de cargar 2000.
8. **Reformulación** — quita stopwords, deduplica, pondera la query actual 2x.
9. **Truncamiento visible** — añade `…[truncado]` cuando corta.
10. **TF scoring** — en vez de substring, cuenta frecuencia y aplica `1 + log(tf)`.

**Contexto:**
2. **Budget aplicado** — `renderContext` usa `selectWithinBudget` para cortar por tokens.
13. **Event limit configurable** — `CONTEXT_EVENT_LIMIT` env.

**Aprendizaje:**
14. **TTL en learning** — purge targets para `learning-facts` (90d), `learning-patterns` (180d), `failure-lessons` (180d). Y filtro por fecha en `engine.ts`.

---

## Lo que ahora hace que antes no hacía

- **Un fragmento relevante gana a uno irrelevante.** Antes, BM25 sin IDF. Ahora, con IDF, las palabras raras pesan más.
- **La memoria se pagina.** Antes cargaba 2000 en memoria. Ahora keyset.
- **Se puede olvidar.** Antes no había `forget`. Ahora sí.
- **El scoring de memoria es TF.** Antes substring. Ahora cuenta frecuencia.
- **El truncamiento avisa.** Antes cortaba en silencio. Ahora añade `…[truncado]`.
- **El budget se aplica.** Antes cortaba por cantidad. Ahora por tokens.
- **El chunk y el page size son configurables.** Antes hardcoded.
- **La reformulación no mete basura.** Antes concatenaba 2 mensajes literal. Ahora quita stopwords y deduplica.
- **Los `learning-facts` caducan.** Antes crecían sin tope. Ahora 90 días.
- **La jerarquía existe.** Antes todo plano. Ahora `MemoryContext` con tenant/owner/rol/sesión.

---

## Lo que queda pendiente (no es del frente 12)

- **Wires.** `MemoryContext` está declarado, pero nadie lo puebla al `remember`. Eso es un fix del siguiente frente.
- **`forget()` no se llama desde ningún sitio.** El método existe, pero el agente no decide "olvida esto". Eso necesita UI o política.
- **El IDF es por página, no global.** El IDF real necesita el corpus completo. Con la paginación actual, el IDF se calcula sobre los candidatos, no sobre todos los chunks. Es una aproximación aceptable.
- **El presupuesto del assembly solo cubre `roleMemories`.** `entityTokens`, `eventTokens`, `documentTokens` están definidos en `DEFAULT_BUDGET` pero no se usan. Ampliable.

---

## Resumen

**Antes:** el agente recordaba, pero mal. El RAG buscaba sin IDF. La memoria cargaba 2000 y filtraba en JS. El contexto no respetaba el budget. Los facts crecían sin tope.

**Ahora:** el agente recuerda mejor. El RAG usa IDF. La memoria pagina. El contexto respeta tokens. Los facts caducan. La jerarquía existe.

**Lo que falta:** cables. El 80% está. El 20% restante es que el resto del código use lo que ya existe. Eso es el frente 13 o 24.

¿Quieres que esto lo meta en un doc `lo-que-falta.md` para el 12, o pasamos al siguiente frente?

Respuesta honesta: **no, no estaría a nivel state of the art.** Estaría muy bien, notable alto, pero hay cosas que separan "bien hecho" de "state of the art" en memoria y RAG. Te lo desgloso.

---

## Lo que SÍ estaría a nivel state of the art con estos 14 fixes

- **IDF real en BM25.** Es lo mínimo. Lo tiene cualquier buscador serio.
- **Híbrido coseno + BM25.** Ya lo tienes. Eso es moderno.
- **Paginación keyset.** Correcto.
- **Budget por tokens.** Correcto.
- **TTL en learning.** Correcto.
- **Jerarquía de contexto (tenant/owner/rol/sesión).** Correcto.
- **Truncamiento visible.** Correcto.
- **Configurabilidad por env.** Correcto.

**Eso es un 7/10.** Sólido, sin vergüenzas.

---

## Lo que le falta para ser state of the art de verdad

### 1. Reranking con un cross-encoder

Hoy haces:
- Embeddings → coseno.
- BM25 → IDF.
- Combinas con pesos fijos (0.7 / 0.3).

**State of the art:** recuperas 50-100 candidatos con híbrido, y luego **un modelo pequeño los reordena**. El cross-encoder ve la query y el documento juntos y decide relevancia real. Es lo que hace Cohere Rerank, BGE-reranker, etc.

Sin reranking, tu top-5 tiene ruido. Con reranking, el top-5 es casi siempre correcto.

**Impacto:** brutal. Es la diferencia entre "encuentra algo relacionado" y "encuentra lo correcto".

**Coste:** una llamada extra por búsqueda. 50-100ms. Asumible.

### 2. Query expansion / HyDE

Hoy reformulas con stopwords y ponderación. Básico.

**State of the art:** dos técnicas:
- **HyDE** (Hypothetical Document Embeddings): el LLM genera una respuesta hipotética, se embebe esa, y se busca con ella. Funciona mejor que buscar con la query cruda.
- **Query expansion**: el LLM genera 3-5 variantes de la query y se buscan todas. Se fusionan resultados.

Sin esto, pierdes queries mal formuladas. Con esto, el recall sube 20-30%.

**Impacto:** alto en queries ambiguas. Bajo en queries claras.

**Coste:** una llamada extra al LLM. 200-500ms. Es lo que hace que la búsqueda "entienda" lo que el usuario quiere.

### 3. Embeddings de última generación

Hoy usas `text-embedding-004` de Google. Es de 2023. 768 dimensiones.

**State of the art:** modelos de 2024-2025:
- `text-embedding-3-large` (OpenAI, 3072 dim).
- `voyage-3` (Voyage AI, 1024 dim).
- `bge-m3` (BAAI, multilingüe, 1024 dim).
- `nomic-embed-text-v1.5` (open source, 768 dim).

Diferencia: 5-15% mejor en benchmarks. No es brutal, pero se nota.

**Impacto:** medio. Requiere migrar embeddings. Costoso.

### 4. Chunking semántico

Hoy cortas por párrafos y por tamaño (`CHUNK_SIZE = 900`).

**State of the art:** chunking **semántico**. Cortas cuando cambia el tema, no cuando llegas a 900 chars. Se hace con embeddings: comparas similitud entre frases consecutivas, y cortas donde hay un valle.

Alternativa: **late chunking** (Jina, 2024). Emebbes el documento entero, y luego "cortas" los embeddings por chunks. Cada chunk tiene contexto global.

**Impacto:** alto. Un chunk que corta a mitad de idea es inútil. Uno que corta en límite semántico es oro.

### 5. Memoria episódica vs semántica

Hoy tienes una sola colección `memories`. Todo mezclado.

**State of the art:** separas:
- **Memoria episódica**: qué pasó, cuándo. "El 3 de marzo el cliente pidió X".
- **Memoria semántica**: hechos atemporales. "El cliente prefiere email".
- **Memoria procedimental**: cómo hacer cosas. "Para facturar, paso 1, 2, 3".

Cada tipo se recupera distinto. Cada tipo tiene TTL distinto. Cada tipo se consolida distinto.

**Impacto:** alto. Mezclar "el cliente pidió café el martes" con "el cliente prefiere café" hace que el agente confunda eventos con preferencias.

### 6. Consolidación de memoria (sleep-time compute)

Hoy: guardas hechos. Punto.

**State of the art:** un proceso periódico (como el sueño) que:
- **Fusiona** memorias similares: "el cliente prefiere café" + "al cliente le gusta el café" → una sola.
- **Resume** memorias largas: 10 hechos sobre un cliente → 1 párrafo.
- **Olvida** lo irrelevante: hechos que no se han usado en 90 días → fuera.
- **Promueve** patrones: 5 hechos similares → una regla.

Es lo que hacen Mem0, Zep, y los papers de "sleep-time compute" (2024).

**Impacto:** alto. Sin consolidación, la memoria se convierte en ruido.

### 7. Grafo de conocimiento

Hoy tienes `BusinessGraph` en otro frente. Pero la memoria no lo usa.

**State of the art:** cada memoria es un nodo. Cada relación entre memorias es una arista. "El cliente X" → "trabaja en" → "empresa Y" → "usa" → "producto Z".

Cuando buscas "cliente", el grafo te da el contexto entero sin tener que recuperar 20 hechos.

**Impacto:** muy alto. Es la diferencia entre recuperar hechos sueltos y recuperar contexto estructurado.

**Coste:** mucho. Es un frente entero.

### 8. RAG multimodal

Hoy: solo texto.

**State of the art:** imágenes, tablas, PDFs con layout. Modelos como ColPali (2024) embeben la página entera como imagen. Funciona mejor que extraer texto.

**Impacto:** alto si tienes PDFs con tablas. Bajo si todo es texto.

### 9. Evaluación

Hoy: tests que verifican que un fragmento relevante gana a uno irrelevante.

**State of the art:** evalúas con:
- **RAGAS**: faithfulness, answer relevance, context precision, context recall.
- **TruLens**: groundedness, context relevance.
- **DeepEval**: 14 métricas.

Sin evaluación, no sabes si mejoras o empeoras. Con evaluación, cada cambio se mide.

**Impacto:** alto. Sin esto, los fixes son a ciegas.

### 10. Caché semántica

Hoy: no hay.

**State of the art:** si dos queries son similares (>0.95 coseno), devuelves la misma respuesta. Ahorra LLM calls. GPTCache, Redis Vector.

**Impacto:** medio. Ahorra coste, no calidad.

---

## Veredicto honesto

**Con los 14 fixes: 7/10.**

Es un sistema de memoria **bien hecho**, sin deuda técnica grave. Un usuario normal no notaría la diferencia con un 9/10.

**Para ser 9-10/10 (state of the art) faltaría:**

| # | Técnica | Impacto | Coste |
|---|---|---|---|
| 1 | Reranking con cross-encoder | Muy alto | Medio |
| 2 | HyDE / query expansion | Alto | Bajo |
| 4 | Chunking semántico | Alto | Medio |
| 5 | Memoria episódica vs semántica | Alto | Medio |
| 6 | Consolidación (sleep-time) | Alto | Alto |
| 7 | Grafo de conocimiento | Muy alto | Muy alto |
| 9 | Evaluación (RAGAS) | Alto | Medio |

**El orden que yo seguiría:**

1. **Reranking** — el mayor ROI. 1-2 días de trabajo. 20% de mejora en top-5.
2. **Evaluación (RAGAS)** — sin medir, no sabes si mejoras. 1 día.
3. **HyDE / query expansion** — 1 día. 15% de mejora en recall.
4. **Chunking semántico** — 2-3 días. Mejora la calidad de los chunks.
5. **Consolidación** — 1 semana. La memoria deja de ser un vertedero.
6. **Grafo de conocimiento** — 1 mes. Frente entero.

**Los 14 fixes que has hecho son la base sólida.** Sin ellos, nada de lo demás funciona bien. Con ellos, el sistema está listo para el siguiente nivel.

---

## La frase honesta

Tu sistema con los 14 fixes hace lo que un buen producto comercial hace hoy. No lo que un paper de 2025 hace.

Si quieres "state of the art", el siguiente hito es **reranking + evaluación**. Eso te pone en 8/10. Luego **consolidación + chunking semántico** te pone en 9/10. El 10/10 es grafo + multimodal + multimodal + todo lo demás, y es un proyecto de meses.

Pero ojo: **9/10 es mejor que el 95% de los productos de memoria que hay en el mercado.** No necesitas 10/10 para que el agente sea excelente. Necesitas 7/10 bien hecho + buen producto. Eso ya lo tienes.

¿Quieres que te prepare un doc con este análisis y los siguientes pasos, o pasamos al siguiente frente y dejamos el reranking para el 12b?