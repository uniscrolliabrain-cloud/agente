# Roadmap — 12 contexto y memoria

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
El agente recuerda lo relevante y olvida lo demás. Memoria curada.

## 2. Estado verificado
- MemoryService con dedupe.
- ContextEngine con budget.
- renderContext pinta learning (fix de este pase).
- Fuente: repodump memory.ts, context/*, rag.ts.

## 3. Huecos contra producción
- IDF real.
- Memoria jerárquica (tenant, owner, rol, sesión).
- Olvido selectivo.
- Budget aplicado en renderContext.

## 4. Objetivo
Memoria curada con relevancia medible. Un hecho se recupera 5 días después.

## 5. Fronteras
- No embeddings locales.

## 6. Conexiones
- Depende de: 08, 09.
- Dependen de esta: 24.
- Archivos compartidos: memory.ts, context/*, rag.ts.

## 7. Principios del PRODUCT.md
Memoria curada.

## 8. Cómo se verifica el cierre
- Test que verifica que un fragmento relevante gana a uno irrelevante
  con IDF.
- MemoryService.forget con TTL probado.
