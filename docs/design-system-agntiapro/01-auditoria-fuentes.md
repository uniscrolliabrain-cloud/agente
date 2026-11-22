# 01 — Auditoría trazable de fuentes
## Baseline
Repositorio `uniscrolliabrain-cloud/agente`; rama de partida `feat/business-command-studio-demo`; árbol `f9c344b828b391df65bf873bf5155897c3c03fef`. Capturas del usuario: Centro de Mando con datos ACME demo; Estudio de Operaciones Kanban+timeline; Estudio con videollamada acoplada a la izquierda. Evidencia visual y código pueden diferir por versión desplegada.

## Fuentes primarias inspeccionadas
- `apps/web/src/landing/landing.css`: Fraunces/Manrope, variables `--lp-*`, contenedor 1248px, secciones 112px, focus-visible, responsive y reduced-motion; animaciones `lp-reveal`, `lp-message-enter`, `lp-portrait-enter`, `lp-typing`.
- `apps/web/src/landing/Landing.jsx`: chat local de respuesta por palabras clave, agentes, escenas y flujo comercial. No confundir con conversación LLM productiva.
- `apps/web/src/design-system/agntia-tokens.css`: tokens `--ag-*` compartidos, alcance opt-in `.agntia-workspace`.
- `apps/web/src/workspaces/business-command-studio/BusinessCommandStudio.tsx`: vistas Kanban, Grafo, Digital Twin, Empresa 360°; estado con reducer, `Game Master`, inspector, timeline, reinicio demo.
- `apps/web/src/workspaces/business-command-studio/studio.css`: rejilla principal, inspector 268px, paneles, tipografía, interacciones, responsive y reduced-motion.
- `apps/web/src/workspaces/35-centro-mando/centro-mando.css`: define `:root` con `--bg #f6f6f9`, `--ink #14141f`, `--muted #8a8a9c`; riesgo de contaminación global.
- `apps/web/src/components/ControlCenterView.tsx`: vista de control heredada, distinta del workspace 35 y del Estudio.
- `apps/web/src/components/VerticalSliceOperationsView.tsx`: panel operacional de solo lectura, **no** es el Business Command Studio.
- `apps/web/src/index.css`: hoja global grande (aprox. 168 KB), tokens previos `--accent #5b4bdb`, `--font Instrument Sans`; coexistencia de capas.
- `apps/web/tailwind.config.js`: paleta V2 `purple #5E4FF1`, `bg #F3F0EB`, tipografía Instrument Sans; no coincide exactamente con la landing premium.
- `apps/web/src/App.tsx`: shell, panel de chat acoplado, mobile chat y workspaces.
- `docs/ui/UI-REDESIGN.md`: decisiones históricas útiles pero no autoridad automática.
- `docs/landing/premium-funnel.md`: landing premium, demos deliberadas, no atribuir reservas reales.

## Hallazgos
**A1 Alta — Deriva de tokens.** Tres acentos violeta (`#6550dd`, `#5b4bdb`, `#5E4FF1`), fondos y fuentes coexistentes. Recomendación: token semántico canónico y adaptadores legacy; no sustitución masiva a ciegas.

**A2 Alta — Estilos globales no encapsulados.** `centro-mando.css` declara variables en `:root`, que pueden cambiar otras superficies. Mover gradualmente a scope de workspace o namespace, con pruebas visuales.

**A3 Alta — Terminología ambigua.** Centro de Mando, ControlCenterView, Operaciones (vertical slice) y Estudio de Operaciones son superficies diferentes. Documentar rutas, dueños y responsabilidades; prohibir renombrados que rompan navegación.

**A4 Alta — Estado demo/real.** Studio tiene `ACME` y `Entorno demo` explícitos. El Centro de Mando mostrado por el usuario contiene cifras de ejemplo. No permitir fallback demo silencioso para un tenant real.

**A5 Media — Movimiento fragmentado.** Landing usa reveal y varias animaciones; Studio usa `bcs-reveal` y transiciones cortas. Falta lenguaje único de duración, easing, jerarquía, interrupción y preferencia de movimiento reducido.

**A6 Media — Tipografía híbrida.** Landing/Studio usan Fraunces+Manrope; CSS global y Tailwind siguen Instrument Sans. Conservar la dupla premium en superficies nuevas, sin migración indiscriminada de todo lo legacy.

**A7 Media — Móvil y densidad.** Studio tiene breakpoint a 1200 y 700 px; landing a 1100/900/640/360. Deben probarse conjuntamente con chat acoplado, teclado y safe areas.

**A8 Media — Componentes repetidos.** Botones, cards, badges y paneles definidos por clase local; crear inventario y wrappers comunes antes de consolidar.

**A9 Media — Relación temporal.** Las cuatro vistas comparten modelo local demo; la integración real con runtime, event log y snapshots no está verificada aquí. El diseño debe distinguir estado factual de simulación.

**A10 Baja — Auditoría visual automatizada pendiente.** Faltan capturas de referencia versionadas por viewport, tests de regresión y presupuesto de movimiento.

## Decisiones
- Canonical visual target = landing premium + Studio; Centro de Mando se alinea progresivamente, conservando su función.
- No imponer serif en tablas densas ni reemplazar de golpe CSS global.
- No borrar ramas ni estilos legacy sin mapa de uso.
- Antes de una migración: inventario de selectores, import graph, capturas, contraste y test de rutas.
- No afirmar que el código de Studio está en main: revisar `git merge-base`, diffs y release efectivo.

## Riesgos pendientes
No se inspeccionaron exhaustivamente todos los componentes, todas las ramas ni todos los navegadores. Esta auditoría es profunda en las superficies de referencia, no una certificación de todo el monorepo.
