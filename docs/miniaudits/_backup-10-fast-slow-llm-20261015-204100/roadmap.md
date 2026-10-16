# Roadmap — 10 fast / slow LLM

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Dos velocidades con cuotas separadas. El fast habla, el slow trabaja.

## 2. Estado verificado
- EnvTenantConfigResolver lee FAST_LLM_* y SLOW_LLM_*.
- conversation.ts usa el fast (fix de este pase).
- Fuente: repodump kernel/config/*, conversation.ts, model.ts.

## 3. Huecos contra producción
- model.ts no usa el slow.
- recordUsage sin campo velocidad.
- Sin fallback cruzado fast → slow.
- Elección por complejidad es regex.

## 4. Objetivo
Tareas durables usan slow real. Cuotas por velocidad. Fallback explícito
fast → slow → global.

## 5. Fronteras
- No LLM local.

## 6. Conexiones
- Depende de: 09.
- Dependen de esta: 11, 24.
- Archivos compartidos: conversation.ts, model.ts, kernel/config/*.

## 7. Principios del PRODUCT.md
Tareas durables, kernel cognitivo.

## 8. Cómo se verifica el cierre
- Test que verifica que una task usa el slow.
- recordUsage con campo speed.
- Fallback fast → slow → global con mock.
