# 14 · Prompt de implementación premium V2 · Formación

Trabajas **exclusivamente en UI Lab** para construir el template de Formación de AgntiaPro que alojará 120 microcursos. Debes conseguir una experiencia **tan cuidada como Landing y Studio Demo, más abierta y con menos densidad que Studio**, pero con estructura audiovisual propia. El mockup del founder muestra una escena de vídeo con una ficha inferior deslizable y mini-player. **No copiar el verde del mockup ni la estructura de tres paneles de Studio.**

## Lectura obligatoria antes de escribir código
1. Código vigente: `apps/ui-lab/src/vendor/landing/{Landing.jsx,ProductScene.jsx,landing.css}`, `apps/ui-lab/src/vendor/studio/{BusinessCommandStudio.tsx,studio.css}`, `apps/ui-lab/src/design-system/agntia-tokens.css`, shell y router.
2. Auditorías: `apps/ui-lab/docs/dashboards/19-general/superficies-transversales/AUDITORIA-ESTUDIO-DEMO-VS-LANDING-2026-11-23.md` y `apps/ui-lab/docs/dashboards/19-general/galeria-branding/AUDITORIA-BRANDING-UX-Y-MOTION-2026-11-23.md`.
3. Landing legacy: `apps/ui-lab/docs/dashboards/01-landing/legacy/design-system-agntiapro/{02-identidad-tokens,03-componentes-patrones,04-interaccion-motion,06-calidad-gobernanza,07-prompt-agentes}.md` y `legacy/motion-design-premium/README.md`.
4. Formación: prompt V3, catálogo 120, algoritmo V2, documentos 01–13 de esta campaña.

## Instrucción decisiva
No basta con componentes funcionales. Construye una escena editorial protagonista, con fotografía/portada cuidada, espacios generosos, sheet con tres snaps, episodios legibles, navegación discreta y continuidad del player. Clona lo útil de Studio (tokens, superficies, controles, estados), **no su layout ni su densidad**. De Landing reutiliza jerarquía, composición y tratamiento visual, no su hero comercial.

## Restricciones
- Buscar `MobileChatSheet.tsx` y CSS en rama/commit real. Si no se recupera, construir en UI Lab un sheet nuevo aislado y documentarlo; jamás fingir reutilización ni tocar chat de producción.
- No modificar `apps/web`, runtime, API, conectores, auth, Landing o Studio. No deploy sin aprobación.
- No simular vídeos, descargas, permisos, tiempos de reproducción ni acciones reales.
- Consumir tokens reales; no duplicar paletas aproximadas de prompts.
- Mantener la shell global; Formación solo añade navegación local.
- No introducir librerías nuevas sin justificar necesidad y coste.

## Ejecución
Sigue campañas 0–6 de `13-PLAN-IMPLEMENTACION-Y-VALIDACION.md`. Primero inventario, luego primitivas, vertical slice escena+sheet, Home/biblioteca, player, motion y QA. Entrega capturas y grabación de gestos en desktop/móvil, compara lado a lado con Landing/Studio y mockup, y documenta decisiones, código y tests en bitácora.

## Condición de rechazo
Si parece un LMS genérico, un Spotify verde, un Studio reempaquetado o un conjunto de cards apretadas, el resultado es FAIL aunque compile. Si no has podido renderizar ni medir, marca «validación visual pendiente», no «premium aprobado».
