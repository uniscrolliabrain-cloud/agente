# Roadmap — 09 kernel cognitivo

> v2 · 2026-10-07 · Estado: planned-v2 (post 09z Fases 1-3)

## 1. Promesa del repo
Cada turno se registra como Thought con AttentionVector real. Audit con
hash chain. Grafo compartido. El kernel decide qué se muestra, no solo
lo observa.

## 2. Estado verificado (post 09z)
- Kernel con openTurn, appendThought, closeTurn, openChildTurn.
- StoreTurnStore con closeTurnAndChildren + cache de getTurn (TTL 1s).
- StoreAuditStore con hash chain, CAS sobre anchor, verify fail-honest.
- Lifecycle wireado en `/health-deep` (`checkKernelHealth`).
- Snapshot con transacción + endpoints admin `/api/kernel/snapshot/export`
  e `/import`.
- Presenter wireado al SSE + `composeFromThoughts` (primary + secondary).
- Meta con 4 reglas + `consumeHint` + `evaluateWithProgress`.
- Rules con atención real (`isFocusedOn >= 0.7`).
- consolidate en `maintain()` con cap O(n²) de 200 por tenant.
- Autores (user, fast, slow) escriben AttentionVector real.
- Child turn en runtime (`model.ts`).
- TenantScopedCapabilityRegistry wireado en `service.ts`.
- 16 action verbs + 15 familias + OntologyBundle + validateAgainstMetamodel.

## 3. Huecos contra producción
- Tests de kernel (N10-N12) — bloque 01.
- Test `ontology.test.ts` — bloque 01.
- `StoreAuditStore.verify` con >10.000 entradas: fail-honest. Paginar
  con cursor keyset es trabajo del bloque 19 (backups).

## 4. Objetivo
El kernel decide qué se muestra, no solo lo observa. **Cumplido** en 09z.

## 5. Fronteras
- No cromos ni polaridad todavía. Eso es 09b/09c.
- No specs cognitivos por capacidad (CapabilitySpec.cognitive) todavía.
  Estructura declarada, sin poblar.

## 6. Conexiones
- Depende de: 05 (motor tareas), 08 (bus eventos), 10 (fast/slow).
- Dependen de esta: 11 (chat), 12 (contexto), 13 (UI servida).
- Archivos compartidos: kernel/*, conversation.ts, model.ts, service.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo. Materializar lo existente, no inventar abstracciones.

## 8. Cómo se verifica el cierre
- [x] Presenter decide el texto (wireado en conversation.ts).
- [x] Meta hint inyectado en el siguiente turno (systemContext.metaHints).
- [x] Rules.classify con isFocusedOn (rules.ts).
- [x] consolidate en maintain (service.ts).
- [ ] Test SSE que verifica que el Presenter decide el texto (bloque 01).
- [ ] Test `ontology.test.ts` (bloque 01).

## 9. Próximo bloque
**09b — Rediagnóstico.** Tras 09z Fases 1-3, reauditar el kernel
remodelado con Cline en Plan Mode. Detectar qué aflora al mirar con
el kernel ya materializado.