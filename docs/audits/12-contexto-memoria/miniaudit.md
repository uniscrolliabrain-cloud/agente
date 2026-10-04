# 12 — Contexto / memoria

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump memory.ts, context/engine.ts, context/assembly.ts, rag.ts

## Ontología

MemoryService, AgentMemory, MemoryCategory, ContextEngine, ContextPackage,
RecallResult, RagService, RagChunk, RagHit, IDF.

## Estado real

MemoryService.recall con reformulación de query. ContextEngine.assemble con
budget. renderContext pinta rol, entidad, relaciones, eventos, RAG, y
learning (fix de este pase). RagService con coseno + BM25 sin IDF.

## Evidencia

computeIdf, bm25WithIdf, computeAvgLen están exportados pero search usa
bm25Score sin IDF. Los términos comunes pesan igual que "acme". budget.ts
existe pero renderContext no lo aplica. learning ya se pinta (fix de este
pase).

## Huecos

IDF real. Memoria jerárquica (tenant, owner, rol, sesión). Olvido selectivo.
Budget aplicado de verdad en renderContext.

## Interrelación

Cimiento del kernel cognitivo. Sin contexto, el LLM alucina. Con contexto
malo, alucina más. Depende de 08 (bus), 09 (kernel).

## Riesgos

RAG devuelve fragmentos irrelevantes. Memoria crece sin tope. learning-facts
se puebla de ruido.

## Tipo de fixes

IDF real: computeIdf sobre el corpus, bm25WithIdf en search.
MemoryService.forget(owner, criteria). budget.ts aplicado en renderContext.
Test que verifica que un fragmento relevante gana a uno irrelevante con IDF.
