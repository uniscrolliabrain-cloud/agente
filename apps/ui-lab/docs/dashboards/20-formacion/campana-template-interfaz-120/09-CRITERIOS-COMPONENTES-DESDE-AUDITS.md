# 09 · Criterios de construcción desde auditorías reales Landing + Estudio Demo

**Fecha:** 2026-11-23. **Estado:** especificación de diseño derivada de fuentes existentes, no componentes implementados. **Fuente de verdad:** `apps/ui-lab/src/vendor/landing/*`, `apps/ui-lab/src/vendor/studio/*`, `apps/ui-lab/src/design-system/agntia-tokens.css` y el código real de los paneles móviles cuando esté disponible.

## Fuentes auditadas

1. `apps/ui-lab/docs/dashboards/19-general/superficies-transversales/AUDITORIA-ESTUDIO-DEMO-VS-LANDING-2026-11-23.md`: Studio comparte identidad, pero padece densidad, controles secundarios, respiración insuficiente y transiciones aún no coreografiadas. La nota ~8,5/10 es cualitativa, no un test.
2. `apps/ui-lab/docs/dashboards/19-general/galeria-branding/AUDITORIA-BRANDING-UX-Y-MOTION-2026-11-23.md`: la guía de marca no es suficiente por sí sola para reproducir la calidad de Landing. Faltan gramática de composición, patrones reales, motion y pruebas visuales.
3. `apps/ui-lab/docs/dashboards/01-landing/legacy/motion-design-premium/README.md`: propuesta M0–M6 **no implementada**; entradas editoriales, microinteracciones, cambios de escena, continuidad y reduced motion.
4. `apps/ui-lab/docs/dashboards/01-landing/ejemplo-componentes-reales/{Landing.jsx,ProductScene.jsx,landing.css}`: snapshot de componentes reales; contrastar con código activo.
5. `apps/ui-lab/docs/dashboards/20-formacion/PROMPT-MAESTRA-FORMACION-V3-SPOTIFY.md` y `V2`: biblioteca audiovisual y reproductor, no academia.
6. Mockup Formación facilitado por founder: vídeo protagonista y ficha inferior con handle, tabs, episodios y mini-player. Mockups de Centro de Mando/Estudio: referencia de **branding operativo**, no composición Formación.

## Traducción concreta de las críticas a componentes Formación

| Hallazgo en auditoría | Regla para Formación | Evidencia exigida |
|---|---|---|
| Studio: inspector y timeline densos | Hero audiovisual ocupa espacio dominante; máximo una acción principal y secundarias discretas | captura de primer viewport |
| Studio: 14–16px entre paneles, 20px de padding | Más espacio editorial en desktop; móvil conserva áreas táctiles y jerarquía sin saturar | comparativa visual a 1440/390/360 |
| Studio: demasiadas etiquetas y botones | Ficha colapsada muestra título, progreso y acción; controles avanzados solo al expandir | screenshot de 3 snaps |
| Landing: tipografía y ritmo | Fraunces 400 en título editorial; Manrope en navegación y episodios; escala y espacios derivados de tokens activos | inspección CSS y screenshots |
| Landing: fotografía y escenas | Portada protagonista, retratos aprobados y miniaturas narrativas; no 120 tarjetas idénticas | muestra de 9 portadas |
| Landing/Studio: falta motion cinematográfico | Secuencia corta de hero→sheet→contenido, transición entre episodios, expansión/colapso del player y salida sin flash | grabación de recorrido |
| Studio: preservar contexto entre vistas | El sheet no reinicia scroll, selección ni playback al cambiar tab/snap; no tapa FAB ni navegación | prueba interactiva |
| Auditorías: rendimiento/accesibilidad | transform/opacity, reduced motion, teclado, foco, scroll nativo, safe areas, sin layout thrashing | QA técnico |

## Concepto seleccionado como punto de partida

**«Escena abierta + biblioteca que emerge».** No copiar el Studio de tres paneles ni convertir la landing en una app. La pantalla Formación abre con una escena audiovisual generosa, muy poca cromática decorativa y un panel que emerge desde abajo, al que se accede con el mismo lenguaje de gesto de la app real. El sheet es la interfaz de lectura y acción: episodios, resumen, recursos, transcripción, guardar y practicar. Al bajar el sheet vuelve a dominar la escena; al subir, el contenido se convierte en biblioteca.

**Desktop:** hero de vídeo y detalle editorial en composición abierta; evitar grids de cinco columnas. **Móvil:** hero + hoja de tres snaps + mini-player persistente; integrar shell real y respetar su chat transversal.

## Orden de construcción y gates

- **V0.1**: localizar `MobileChatSheet.tsx` real en rama/commit (no aparece en main consultado anteriormente); auditar props, eventos, CSS, snap points y dependencias. Si no existe en rama accesible, no fingir clon literal; construir un `AdaptiveBottomSheet` aislado con tests. No tocar chat de producción.
- **V0.2**: clonar en UI Lab únicamente las primitivas visuales útiles de Studio (tokens, panel, tabs, botones, iconografía, foco, responsive) y las editoriales de Landing (tipo, ritmo, tratamiento de imagen). **No copiar la composición Studio.**
- **V0.3**: implementar Home mínima, escena de serie y sheet con 3 posiciones y contenido canónico de 120 cursos, placeholders de vídeo honestos.
- **V0.4**: motion de entrada/salida y continuidad de player; test móvil y escritorio.
- **V0.5**: preview de UI Lab, captura y auditoría comparativa con las tres referencias; iterar con el founder.
- **Promoción a apps/web:** únicamente tras aprobación explícita, pruebas y autorización separada de deploy.

## Bloqueos para declarar «al nivel»

No hay todavía capturas de componentes Formación renderizados ni auditoría visual comparativa. El diseño documental no equivale a una pantalla terminada. Las auditorías de Landing y Studio describen mejoras **pendientes**, no acabados ya implementados. Exigir más calidad que el estado actual, sin convertir la propuesta de motion en supuesta realidad.
