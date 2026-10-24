# 12 — Contexto / memoria

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump memory.ts, context/engine.ts, context/assembly.ts, rag.ts, código real

## Ontología

MemoryService, AgentMemory, MemoryCategory, ContextEngine, ContextPackage, RecallResult, RagService, RagChunk, RagHit, IDF.

## Estado real

MemoryService.recall con reformulación de query. ContextEngine.assemble con budget. renderContext pinta rol, entidad, relaciones, eventos, RAG y learning (fix de este pase). RagService con coseno + BM25 sin IDF.

## Evidencia

computeIdf, bm25WithIdf, computeAvgLen exportados pero search usa bm25Score sin IDF. budget.ts existe pero renderContext no lo aplica. learning ya se pinta (fix de este pase).

## Huecos declarados

- IDF real.
- Memoria jerárquica.
- Olvido selectivo.
- Budget aplicado en renderContext.

## Huecos profundos (auditoría extendida)

1. **`MemoryService.recall` carga hasta 2000 memorias en memoria**: filtra por palabras en JS. Con 5000 memorias, lento.
2. **Reformulación de query con últimos 2 mensajes concatenados**: puede generar queries raras si los mensajes no son coherentes.
3. **`recall` sin filtro por categoría si no se pasa `categories`**: recupera de todas.
4. **`recall` sin filtro por rol si no se pasa `roleId`**: mezcla memorias de todos los roles.
5. **`formatRecall` con tope de 500 chars por memoria**: trunca el texto sin indicar truncamiento.
6. **`searchMemories` con score de "palabras compartidas"**: no usa TF-IDF ni embeddings. Solo substring.
7. **`remember` con dedupe por hash de texto normalizado**: "el cliente prefiere café" y "El Cliente Prefiere Café" colisionan. Correcto, pero pierde distinción de mayúsculas.
8. **`remember` sin validar categoría**: acepta cualquier string, no valida contra `MemoryCategory`.
9. **`dedupMemories` sin tope real**: recorre 5000 memorias y borra duplicados. Si hay 5000 duplicados, 5000 removes.
10. **`retryMissingEmbeddings` con tope de 50 por pasada**: con 10.000 chunks sin embedding, tarda 200 pasadas.
11. **`chunkText` con `CHUNK_SIZE = 900` hardcodeado**: no configurable por tipo de documento.
12. **`RagService.search` con `SEARCH_PAGE_SIZE = 500`**: con 100.000 chunks, 200 páginas por búsqueda.
13. **`searchVector` con cast a `vector(768)` hardcodeado**: si el modelo cambia, falla silenciosamente.
14. **`ingestText` con `maxChunks = 1000` hardcodeado**: un PDF grande se trunca sin aviso.
15. **`ContextEngine.assemble` sin tope de eventos**: carga hasta 20 eventos. Configurable no.
16. **`renderContext` sin ordenar por relevancia**: pinta en orden de carga, no por score.
17. **`learning-facts` sin TTL**: los facts aprendidos crecen sin tope.
18. **Sin "olvido selectivo"**: no hay forma de marcar una memoria como "obsoleta pero mantener histórico".
19. **Sin "jerarquía de memoria"**: todas las memorias son iguales. No hay "memoria de empresa" vs "memoria de cliente".
20. **`MemoryService.remember` sin `source` obligatorio**: se puede crear sin origen. Auditoría rota.

## Interrelación

Cimiento del kernel. Depende de 08, 09.

## Riesgos

RAG devuelve fragmentos irrelevantes. Memoria crece sin tope. learning-facts con ruido.

## Tipo de fixes

IDF real con computeIdf y bm25WithIdf. MemoryService.forget. budget.ts en renderContext. Paginación real de recall. Filtro por categoría y rol. TTL por categoría. Jerarquía de memoria. Source obligatorio.
