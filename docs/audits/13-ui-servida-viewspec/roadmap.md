# Roadmap — 13 UI servida ViewSpec

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
El sistema sirve la vista correcta según la intención.

## 2. Estado verificado
- ViewResolver con regex.
- 7 kinds en runtimeViewSpecSchema.
- Endpoint POST /api/views/resolve.
- conversation.ts llama a resolveView (fix de este pase).
- Fuente: repodump packages/domain/src/views.ts,
  engine/views/resolver.ts.

## 3. Huecos contra producción
- Intenciones ricas.
- Wiring al chat con cache por thread.
- Panel contextual que se rellene.
- view.resolved al bus.

## 4. Objetivo
La intención del usuario sirve la vista correcta sin LLM libre.

## 5. Fronteras
- No plantillas dinámicas generadas por LLM.

## 6. Conexiones
- Depende de: 09.
- Dependen de esta: 14.
- Archivos compartidos: resolver.ts, views.ts.

## 7. Principios del PRODUCT.md
UI servida.

## 8. Cómo se verifica el cierre
- Test de 20 intenciones, cada una espera un spec.
- view.resolved emitido al bus.
