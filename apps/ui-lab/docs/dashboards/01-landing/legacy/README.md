# Archivo legacy de diseño, landing y Studio

Este directorio conserva documentación de ramas anteriores **sin reescribir sus contenidos**. Puede contener rutas, ramas, commits, datos y planes históricos. **No representa el estado actual del producto ni autoriza ejecutar campañas.**

## Procedencia
- `feat/landing-premium-funnel`: `motion-design-premium/README.md` (plan C00–C08 de movimiento, no implementado según el documento) y `premium-funnel.md`.
- `docs/design-system-agntiapro-master-20261122`: `design-system-agntiapro/` (guía de 7 capítulos, README, campaña y propuesta), `agntia-interface-standard.md` y `business-command-studio/` (auditoría, campaña y validación).

## Cómo usarlo
1. Partir de la landing **activa**: `apps/ui-lab/src/vendor/landing/`, no de las rutas antiguas de los documentos.
2. Contrastar las recomendaciones con los tokens y componentes actuales, y con el Estudio Demo real.
3. Reutilizar el trabajo previo de motion, responsive y QA; no duplicar precampañas ni dar por implementadas propuestas.
4. Conservar separación entre landing comercial y Studio operativo.
5. Para ejemplos estáticos de código real, consultar `../ejemplo-componentes-reales/`.

**No se ha hecho merge de las ramas históricas.** Se han copiado archivos seleccionados al catálogo UX en main.
