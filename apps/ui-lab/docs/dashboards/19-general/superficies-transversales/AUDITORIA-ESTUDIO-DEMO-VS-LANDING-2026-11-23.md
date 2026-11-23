# Auditoría Estudio Demo vs landing — calidad UX y motion

**Fecha:** 2026-11-23 · **Estado:** diagnóstico para mejora posterior, no implementación. **No confundir Estudio Demo con la carpeta 10 Estudio de Operaciones**, que tiene clasificación separada.

## Veredicto
El Estudio Demo ya está **bien alineado en identidad visual** con la landing nueva (valoración cualitativa previa ~8,5/10), pero aún no alcanza su **nivel de respiración, jerarquía y acabado editorial**. El founder confirma que **ambas superficies** deben elevar su nivel de movimiento: transiciones de entrada y salida, cascadas leves y coreografía cinematográfica profesional.

## Evidencia y componentes
- `apps/ui-lab/src/vendor/studio/BusinessCommandStudio.tsx`: cabecera, inspector, visualizador, timeline, controles de modo Observar/Game Master, selector de vista, ampliar, crear y reiniciar demo.
- `apps/ui-lab/src/vendor/studio/studio.css`: uso de `--ag-*`, Fraunces 400, paneles con bordes finos y sombras sutiles, botones, focus visible, responsive y reduced motion; grid de inspector de 268 px y visualizador, timeline debajo; separaciones de 14–16 px y padding principal 20 px.
- `apps/ui-lab/src/design-system/agntia-tokens.css`: fuente compartida de colores y tipografía, alineada con `landing.css`.
- `apps/ui-lab/src/vendor/landing/landing.css`: referencia de composición editorial, ritmo y profundidad. Tiene algunas animaciones puntuales, **no equivale a un sistema de coreografía completo**.

## Déficits y prioridades
**P0 · Coreografía entre estados (sin alterar lógica):**
- Entrada inicial: encabezado, inspector, visualizador y timeline aparecen en **secuencia corta y suave**, con prioridad para el visualizador; no cuatro bloques que «saltan» simultáneamente.
- Salida/cambio de superficie: transición breve, continuidad del layout y preservación de foco/estado.
- Cambio Kanban ↔ Grafo ↔ Digital Twin ↔ Empresa 360°: transición dirigida del **contenido del visualizador**, no ocultar/recrear todo el workspace; controlar aparición de leyendas y nodos con stagger leve, no cascada larga.
- Selección de tarjeta/nodo/actividad: animar **relación visual** entre visualizador, inspector y timeline (resalte/feedback sincronizado), sin que el usuario pierda el contexto.
- Abrir/cerrar inspector móvil, expandir visualizador, diálogos de reset y creación: entradas/salidas consistentes, accesibles, sin bloquear interacción ni producir saltos.

**P1 · Composición y densidad:**
- Dar más protagonismo espacial al visualizador, revisar proporción inspector/visualizador/timeline según viewport.
- Reducir ruido de botones secundarios y etiquetas; reforzar jerarquía de acciones primarias.
- Añadir respiración entre bloques donde haya saturación, sin perder capacidad operativa ni sacrificar timeline.
- Reforzar contraste de títulos editoriales Fraunces frente a datos Manrope, con tamaños y ritmos consistentes con la landing.

**P1 · Calidad y seguridad UX:**
- `prefers-reduced-motion`: versión equivalente sin desplazamientos ni stagger.
- Animaciones basadas preferentemente en transform/opacity; evitar filtros pesados y layout thrashing.
- No perder selección, scroll, foco, contexto, estado de reproducción ni accesibilidad durante cambios.
- Revisar móvil real, escritorio, teclado, touch y rendimiento antes de aceptar como patrón.

## Propuesta de secuencia visual, NO implementada
1. **Entrar al Estudio:** cabecera → visualizador principal → inspector → timeline, con pequeños solapamientos y sin espera larga.
2. **Seleccionar actividad:** resalte inmediato en el origen → inspector actualiza suavemente → timeline refleja la misma selección; el usuario entiende la causalidad.
3. **Cambiar vista:** controles quedan estables; visualizador transiciona con una salida/entrada discreta; indicadores permanecen legibles.
4. **Salir:** transición corta y coherente hacia la siguiente superficie; sin destellos ni desvanecimientos que oculten la navegación.

## Criterio de aceptación
El Estudio conserva exactamente su estructura conceptual **inspector izquierda, visualizador derecha, timeline abajo**. Se siente como una herramienta de trabajo premium de la misma marca que la landing, pero **no imita el hero comercial**. Transiciones suaves, ligeras, deliberadas y con continuidad semántica; nunca motion decorativo invasivo.

## Límites de auditoría
Inspección de código y documentación en main; no render en navegador, no medición FPS, no pruebas de interacción ejecutadas. No se ha modificado código.

## Antecedentes encontrados en rama (2026-11-23)
El Estudio Demo tiene una auditoría y campaña preexistentes en `docs/design-system-agntiapro-master-20261122`: [01-audit](https://github.com/uniscrolliabrain-cloud/agente/blob/docs/design-system-agntiapro-master-20261122/docs/audits/2026-11-22-business-command-studio/01-audit.md), [02-campaign](https://github.com/uniscrolliabrain-cloud/agente/blob/docs/design-system-agntiapro-master-20261122/docs/audits/2026-11-22-business-command-studio/02-campaign.md), [03-validation](https://github.com/uniscrolliabrain-cloud/agente/blob/docs/design-system-agntiapro-master-20261122/docs/audits/2026-11-22-business-command-studio/03-validation.md). La campaña C5 ya pedía integración, responsive y movimiento con identidad de landing. Además, la [guía de motion del sistema maestro](https://github.com/uniscrolliabrain-cloud/agente/blob/docs/design-system-agntiapro-master-20261122/docs/design-system-agntiapro/04-interaccion-motion.md) distingue el ritmo editorial de landing del ritmo instrumental del software.

**No duplicar estas campañas.** Contrastar estado real en main, reutilizar auditoría, contratos y QA, y extender solo las brechas de coreografía cinematográfica y continuidad entre inspector/visualizador/timeline. Esta anotación es documental; no se ha fusionado la rama ni implementado motion.
