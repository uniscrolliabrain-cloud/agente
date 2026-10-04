# Roadmap — 09 kernel cognitivo

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Cada turno se registra como Thought con AttentionVector. Audit con hash
chain. Grafo compartido.

## 2. Estado verificado
- Kernel con openTurn, appendThought, closeTurn, openChildTurn.
- StoreTurnStore con closeTurnAndChildren.
- StoreAuditStore con hash chain y CAS sobre anchor.
- Fuente: repodump kernel/*.

## 3. Huecos contra producción
- Presenter no wireado al SSE.
- Meta sin consumidor.
- Rules.ts sin atención.
- consolidate no se llama en maintain.

## 4. Objetivo
El kernel decide qué se muestra, no solo lo observa.

## 5. Fronteras
- No cromos ni polaridad todavía.

## 6. Conexiones
- Depende de: 05, 08, 10.
- Dependen de esta: 11, 12.
- Archivos compartidos: kernel/*, conversation.ts.

## 7. Principios del PRODUCT.md
Kernel cognitivo.

## 8. Cómo se verifica el cierre
- Test de SSE que verifica que el Presenter decide el texto.
- Meta hint inyectado en el siguiente turno.
- Rules.classify con isFocusedOn.
