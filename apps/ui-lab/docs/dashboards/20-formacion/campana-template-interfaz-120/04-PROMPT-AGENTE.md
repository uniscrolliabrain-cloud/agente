# 04 · Prompt maestra de ejecución para el agente UI

Eres responsable de construir **Formación · Trabaja con LAIA**, el template audiovisual reusable para **120 microcursos** en `apps/ui-lab`. No estás creando una landing nueva, una academia genérica ni un clon de Spotify. La calidad visual mínima es **la Landing real y el Estudio Demo real del mismo commit**. Si tu diseño es más pobre en composición, jerarquía, detalle, motion o responsive, no lo entregues.

**Primero** inspecciona y renderiza el código activo de:
- `apps/ui-lab/src/vendor/landing/Landing.jsx` y `landing.css`
- `apps/ui-lab/src/vendor/studio/BusinessCommandStudio.tsx` y `studio.css`
- `apps/ui-lab/src/design-system/agntia-tokens.css`
- shell y navegación actuales; localiza componentes compartidos reales.

Lee `apps/ui-lab/docs/dashboards/20-formacion/PROMPT-MAESTRA-FORMACION-V3-SPOTIFY.md`, el diseño del algoritmo V2, la metadata de 120 y **todos los documentos de esta campaña**. Los mockups antiguos son bocetos, no el objetivo. Extrae un benchmark visual y un inventario de componentes existentes antes de escribir.

**Construye por fases C00–C09** con commits pequeños y sin ramas nuevas para documentación. Formación tiene Home editorial, búsqueda, colecciones, biblioteca, detalle, player vertical y mini-player persistente, cola, modos Trabajo/Aprender/Explorar, guardados, progreso diferenciado, razones de recomendación y CTA a LAIA condicionado a permisos reales. El contenido aún no producido debe mostrar placeholders editoriales honestos; no simular reproducción ni acciones externas.

**Branding:** reutiliza tokens reales y la elegancia de Landing/Studio. No introduzcas un theme propio de Spotify, un sidebar global duplicado, tarjetas clonadas en grid infinito ni componentes genéricos de e-learning. Prioriza espacio, fotografía editorial cuando esté licenciada, títulos bien compuestos, controles refinados, ritmo visual y transiciones discretas. Diseño móvil nativo, sin barras de teléfono ficticias.

**Arquitectura:** el frontend presenta; el motor cognitivo no se ejecuta en React. Datos de catálogo validados, recomendador demo determinista, sin personalización no consentida. Nada de integraciones OAuth reales, despliegues, cambios de backend ni edición de Landing/Studio.

**Aceptación:** pruebas de interacción, typecheck/build, accesibilidad, capturas y walkthrough en cuatro viewports, comparación lado a lado con referencias, y revisión del founder. Registra archivos tocados y pruebas en `06-BITACORA-Y-HANDOFF.md`. Si el diseño no alcanza el nivel exigido, itera: un build verde no basta.

**Entrega:** componentes reales y reutilizables, estados correctos, rutas integradas sin romper shell, tests y evidencia visual; si no puedes ejecutar navegador, marca la validación visual como PENDIENTE y no proclames paridad.
