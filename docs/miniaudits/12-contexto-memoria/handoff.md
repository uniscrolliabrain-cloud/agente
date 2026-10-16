# Handoff — 12 contexto y memoria

## Estado actual

- **Auditoría:** miniaudit.md (estatus: audited-deep)
- **Roadmap:** roadmap.md (estatus: planned)
- **Fixes:** fixes.md (estatus: placeholder, 50 fixes pendientes)

## Problema

`MemoryService` y `ContextEngine` gestionan la memoria del kernel. Los hallazgos principales:

- No hay IDF real; `RagService.search` usa `bm25Score` sin IDF.
- `renderContext` no aplica el budget.
- `recall` carga hasta 2000 memorias en memoria y filtra por palabras JavaScript (lento).
- Sin filtro por categoría o rol en `recall`.
- `remember` no valida la categoría.
- `learning-facts` crecen sin TTL.
- Sin jerarquía de memoria (todas las memorias son iguales).

## Archivos relevantes

| Archivo | Rol |
|---|---|
| `apps/server/src/memory.ts` | `MemoryService` con `recall`, `remember`, `dedupMemories`. |
| `apps/server/src/context/engine.ts` | `ContextEngine.assemble()`, `renderContext()`. |
| `apps/server/src/context/assembly.ts` | `ContextPackage`, paquete de contexto. |
| `apps/server/src/rag.ts` | `RagService`, `RagChunk`, `RagHit`, `BM25`. |
| `apps/server/src/context/budget.ts` | `Budget`, `computeIdf`, `computeAvgLen`, `bm25WithIdf`. |
| `apps/server/src/kernel/context/` | Filtros, utilidades y estrategias de búsqueda. |
| `apps/server/src/context/memory-store.ts` | Almacenamiento de memorias (durable). |

## Fixes pendientes (checklist)

1. **IDF real**
   - Implementar `computeIdf()` y `bm25WithIdf()` en `rag.ts`.
   - `RagService.search()` debe usar IDF, no solo `bm25Score`.

2. **Aplicar budget en `renderContext`**
   - `ContextEngine.assemble()` tiene `budget`. `renderContext()` debe aplicarlo.
   - Filtrar memorias según el budget.

3. **Filtro por categoría y rol en `recall`**
   - `MemoryService.recall()` debe filtrar por `categories` y `roleId`.
   - Por defecto: filtrar por categoría/rol si no se pasa.

4. **Olvido selectivo con TTL**
   - Agregar `MemoryService.forget()` con TTL.
   - Marcar memorias como "obsoleta" pero mantener histórico.

5. **Jerarquía de memoria**
   - Añadir `MemoryCategory` y `MemoryContext` para jerarquía (tenant, owner, rol, sesión).

6. **Source obligatorio en `remember`**
   - `MemoryService.remember()` debe pedir `source` obligatorio.
   - Sin `source`, la memoria no se guarda.

7. **Paginación real de `recall`**
   - `recall()` actualmente carga 2000 memorias. Implementar paginación con cursor.

8. **Chunk configurable**
   - `chunkText()` con `CHUNK_SIZE = 900` hardcodeado. Hacer configurable por tipo de documento.

9. **Paginación en `RagService.search`**
   - `SEARCH_PAGE_SIZE = 500` con 100.000 chunks es ineficiente. Reducir a 50-100.
   - Implementar paginación con cursor.

10. **Reformulación de query**
   - `MemoryService.recall()` reformula query concatenando últimos 2 mensajes.
   - Mejorar algoritmo de reformulación (no solo concatenación).

11. **Dedup con distinción de mayúsculas**
   - `dedupMemories()` usa hash de texto normalizado.
   - Distinguir mayúsculas/minúsculas correctamente.

12. **Retry limitado**
   - `retryMissingEmbeddings()` con tope de 50 por pasada. Ajustar para suavizar.

## Cómo verificar el cierre

- `pnpm test` pasa tests de `rag.ts`, `memory.ts`, `context/engine.ts`.
- `RagService.search()` usa IDF (fragmento relevante gana a uno irrelevante).
- `renderContext()` aplica budget.
- `MemoryService.forget()` con TTL probado.
- `MemoryService.recall()` filtra por categoría/rol si no se pasa.

## Dependencias

- **Depende de:** 08 (bus de eventos), 09 (kernel cognitivo)
- **Dependen de esta:** 24 (business OS goals)
- **Archivos compartidos:** `memory.ts`, `context/*`, `rag.ts`

## Notas del audit

- `learning-facts` sin TTL: crecen sin límite.
- `context` sin jerarquía: todas las memorias son iguales.
- `recall` carga 2000 memorias en memoria: lento con 5000+.
- Sin source obligatorio, la memoria se puede crear sin auditoría.