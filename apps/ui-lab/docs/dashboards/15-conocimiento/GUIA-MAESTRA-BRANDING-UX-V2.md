# AgntiaPro — Guía Maestra de Branding UX V2
**Fecha:** 2026-11-23 · **Estado:** guía documental consolidada para UI Lab; las especificaciones de movimiento avanzado son objetivo de diseño, NO funcionalidades implementadas ni aprobación visual final.

## 0. Propósito y fuentes de verdad
Esta guía define **cómo se ve, se siente y se mueve AgntiaPro**. No define qué hace cada workspace, su negocio, datos, permisos, endpoints ni runtime. La identidad debe ser común; las composiciones deben ser distintas cuando sus tareas lo exijan.

**Jerarquía obligatoria:** (1) código y assets vigentes de `apps/ui-lab/src/vendor/landing/` para identidad editorial; (2) `apps/ui-lab/src/design-system/agntia-tokens.css` para tokens compartidos; (3) `apps/ui-lab/src/vendor/studio/` para traducción a software instrumental; (4) esta guía para decisiones de diseño; (5) `apps/ui-lab/docs/dashboards/01-landing/legacy/` como archivo histórico, NO como instrucciones de código vigentes. Para copias legibles de los tres archivos principales de landing, ver `apps/ui-lab/docs/dashboards/01-landing/ejemplo-componentes-reales/`.

**No confundir:** `BrandGallery.tsx` es un muestrario parcial; no certifica todo el sistema. El Estudio Demo transversal no equivale automáticamente al workspace 10 «Estudio de Operaciones» ni al Centro de Mando 35.

## 1. ADN y dirección artística
AgntiaPro es **editorial, cálido, humano, tranquilo, preciso y premium**. Debe parecer un producto diseñado deliberadamente, no una colección de dashboards genéricos. La landing aporta narrativa, fotografía, profundidad y pausas; el Estudio Demo aporta disciplina, instrumentos, legibilidad y continuidad de estado.

- **Sí:** papel cálido, blanco, tinta, violeta como énfasis, oro como detalle; títulos serif con personalidad, controles sans precisos, espacios negativos, bordes finos, sombras contenidas, imágenes con dirección artística.
- **No:** dark-tech por defecto, neón, glow constante, partículas, glassmorphism universal, gradientes decorativos, tarjetas anidadas sin necesidad, exceso de badges, texto microscópico, scroll-jacking, animaciones infinitas o efectos sin significado.
- **Una jerarquía dominante por escena:** cada vista debe tener un protagonista claro; el resto acompaña. Evitar simultáneamente demasiados acentos, CTAs, indicadores y movimientos.
- **Coherencia sin clonación:** una app de agenda, un editor, un feed y un centro de operaciones no necesitan la misma rejilla. Comparten gramática visual, no distribución ni funcionalidades.

## 2. Tokens canónicos verificados en código
| Rol | Token actual en `.agntia-workspace` | Valor |
|---|---|---|
| Papel | `--ag-paper` | `#fcfaf6` |
| Superficie | `--ag-surface` | `#ffffff` |
| Superficie tenue | `--ag-soft` | `#f2efe8` |
| Tinta | `--ag-ink` | `#242421` |
| Texto secundario | `--ag-muted` | `#6e6c66` |
| Línea | `--ag-line` | `#e6e1d8` |
| Violeta | `--ag-violet` | `#6550dd` |
| Lila | `--ag-lilac` | `#f0ecfc` |
| Oro | `--ag-gold` | `#b49665` |

La landing tiene variables `--lp-*` de valores equivalentes; **no asumir que sus nombres CSS son intercambiables**. Comprobar selectores y scopes antes de reutilizar. Los hex históricos `#FDFBF7`, `#211D18`, `#5B4BDB`, `#C9A86A` de prompts antiguos **no deben introducirse como segunda paleta**. No reemplazar CSS legacy globalmente: migrar con aliases y revisión visual.

**Uso semántico:** violeta para CTA, selección, foco y vínculo; oro solo en detalles editoriales discretos. Rojo/verde/ámbar para estados únicamente cuando exista semántica y contraste; nunca como adorno. Probar contrastes reales WCAG AA en sus combinaciones, no suponerlos.

## 3. Tipografía editorial e instrumental
- **Fraunces** (400–500) para titulares de marca y títulos editoriales, preferentemente 400 cuando se busca el carácter de la landing. Tracking ligeramente negativo y aire; evitar titulares de peso 700 como patrón indiscriminado.
- **Manrope** (400–800) para cuerpo, navegación, botones, tablas, cifras y metadatos. Mantener alineación y claridad a densidades instrumentales.
- **Escalas orientativas, a contrastar con CSS real:** display 48–72 px; H1 de app 28–40; H2 20–28; H3 17–22; cuerpo 14–16; caption 12–13. Usar `clamp()` cuando corresponda y revisar saltos de línea reales.
- **Ritmo:** titular 1.1–1.25 de line-height; cuerpo 1.45–1.65. No más de dos familias visibles por pantalla sin excepción justificada. Evitar microtexto como solución a saturación.

## 4. Espacio, geometría y profundidad
Escala base de 4 px: 4/8/12/16/20/24/32/40/48/64/80/112. La landing permite grandes respiraciones editoriales; el software concentra información con gaps coherentes, **sin parecer comprimido**. En el Estudio Demo, los gaps de 14–16 px y padding de 20 px son punto de partida observado, no obligación para todas las pantallas.

- Botones: radio ~8–9 px, alturas orientativas 40–50 px; objetivos táctiles adecuados.
- Cards: radios ~12–16 px, padding ~16–24 px, borde fino; sombras muy suaves.
- Grandes superficies: radios ~18–24 px si la composición lo justifica.
- Separar bloques primero con **espacio**, no acumulando líneas, cajas y sombras.
- Profundidad por **superposición intencional**, escala, sombra, contraste y máscara. Usar tarjetas flotantes o escenas 3D solo donde comuniquen algo (como el hero/ProductScene), no en todos los workspaces.
- Prohibidos los «huecos muertos» sin intención y las barras de herramientas que compiten con el contenido.

## 5. Fotografía, escenas, iconografía y assets
La landing usa fotografía de agentes, encuadres y máscaras deliberadas, y escenas de producto compuestas por capas. Documentar por componente: proporción, focal point, tratamiento cromático, comportamiento en móvil, texto superpuesto y fallback. No inventar fotografías ni mezclar bancos de imágenes sin coherencia. Conservar los assets originales salvo decisión expresa.

Iconografía lineal coherente (Lucide o equivalente), 16–20 px usuales, stroke y alineación óptica consistentes. Un icono sin texto necesita nombre accesible; no mezclar emojis, 3D e iconos lineales como si pertenecieran al mismo set.

## 6. Gramática de componentes: ficha obligatoria
Cada componente nuevo debe documentar **anatomía, variantes, tokens, densidad, responsive, interacción, accesibilidad y motion**:
1. **Botones:** primary violeta, secondary claro, ink instrumental, ghost, icon-only; estados default/hover/press/focus/disabled/loading. Una sola acción principal por grupo.
2. **Tarjetas/paneles:** estático vs interactivo distinguibles; selección, vacío, loading y error; sin falso hover en elementos no clicables.
3. **Tabs/navegación:** indicador activo claro, foco visible, teclado correcto, continuidad de panel y de selección; no comprimirse hasta ilegibilidad.
4. **Formularios:** labels estables, ayuda y error, focus violeta, validación legible, estados sin sacudidas ni saltos de layout.
5. **Tablas/listas/feeds:** altura de fila, metadatos, divisores, cifras alineadas, truncamiento accesible, densidad controlada.
6. **Menús, popovers, modales, sheets:** elevación y radios coherentes; Escape, restauración de foco, teclado y safe areas. Sheets móviles de lámina deslizable, no escritorio miniaturizado.
7. **Feedback:** skeleton, vacío, error, toast, progreso y aprobación; no fingir actividad o éxito que no haya ocurrido.

## 7. Arquetipos de composición, no plantillas funcionales
- **Landing editorial:** narrativa por escenas, hero y retratos, producto en contexto, CTA y respiración.
- **Studio / editor instrumental:** inspector izquierda, visualizador protagonista derecha, timeline multicapa inferior; relación visual sincronizada y controles subordinados.
- **Otros:** split view, feed, mosaico, tablero, lienzo, detalle, tabla, panel lateral. Elegir según el trabajo real de esa pantalla.
- **Móvil:** rediseñar jerarquía y orden; no escalar la versión desktop. El visualizador del Studio puede ir primero; inspector accesible y timeline desplazable. Respetar teclado virtual y safe areas.

## 8. Motion Design: coreografía cinematográfica sutil
**Esta es la brecha principal reconocida por el founder tanto en landing como en Estudio Demo.** El objetivo es un acabado comparable en criterio de movimiento al de productos digitales de primera línea, **sin copiar efectos ni añadir espectáculo**. La animación comunica jerarquía, causalidad y continuidad espacial. Un solo foco cinemático a la vez.

### 8.1 Vocabulario
- **Enter:** el contenedor es estable; contenido protagonista aparece con opacidad y `translateY` mínimo, acompañado por escala casi imperceptible si procede.
- **Exit:** salida breve coherente con la dirección del siguiente estado; nunca pantallazo blanco ni desaparición de controles antes de responder.
- **Reveal editorial:** una sección entra una vez cuando aparece, sin volver a ocultarse al subir.
- **Stagger/cascada leve:** secuenciar **grupos semánticos** (título → lead → acción → imagen), no cada letra ni cada fila. El usuario debe poder interactuar desde el inicio.
- **Shared continuity:** el indicador activo, la selección y el panel mantienen una relación visual entre estados; evitar desmontajes bruscos y scroll resets.
- **Microinteracción:** hover/press/focus/selección con respuesta inmediata, sin que una animación retrase el clic.
- **Scroll-linked opcional:** movimiento de capas muy limitado y medido, solo cuando añade profundidad; sin secuestrar scroll.

### 8.2 Ritmos de prototipo (NO tokens aprobados)
| Situación | Rango inicial | Regla |
|---|---|---|
| Feedback inmediato | 120–200 ms | no retrasar acción |
| Tabs y paneles | 200–350 ms | mantener continuidad |
| Modal/sheet | 240–400 ms | foco y cierre correctos |
| Reveal editorial | 500–680 ms | una vez, solo si aporta |
| Cascada entre grupos | 35–85 ms | máximo ~3–5 grupos |
| Escena insignia | hasta ~750 ms | sin bloquear interacción |

Curvas de partida: `cubic-bezier(.22,1,.36,1)` para entrada editorial y `cubic-bezier(.2,.8,.2,1)` para controles; calibrar visualmente. **No mezclar múltiples observers o librerías que animen el mismo transform**.

### 8.3 Storyboards de referencia
**Landing — hero LAIA:** nav y estructura visibles inmediatamente → H1/lead/CTA aparecen escalonados muy levemente → retrato se asienta dentro de su máscara → tarjeta flotante llega al final. Chat inline anima **solo el mensaje nuevo**, no el historial. Hero no debe empeorar LCP.

**Landing — secciones:** títulos, contenidos y escena de producto revelados por grupos; ProductScene hace crossfade/desplazamiento mínimo al cambiar tabs; retratos de agentes entran en secuencia breve; CTA final mantiene legibilidad y destino real. No presentar datos demo como actividad real.

**Estudio Demo — entrada:** cabecera → visualizador → inspector → timeline, con solapamiento temporal y sin esperar segundos. El visualizador domina, la UI no se agita.

**Estudio Demo — cambio de vista:** controles permanecen anclados; el visualizador cambia con continuidad entre Kanban/Grafo/Digital Twin/Empresa 360°, evitando superposición de textos y pérdida de selección.

**Estudio Demo — causalidad:** seleccionar actividad resalta el origen y sincroniza inspector/timeline con feedback suave; abrir inspector móvil o expandir escena no mueve la pantalla de forma caótica.

**Salir de cualquier superficie:** fade/desplazamiento corto y continuidad de navegación; mantener foco, estado, scroll y acciones. Nada de cortinillas, zoom agresivo, flashes o scroll-jacking.

### 8.4 Reglas de seguridad y calidad
- `prefers-reduced-motion: reduce`: sin parallax, stagger ni desplazamientos decorativos; contenido y feedback siguen visibles.
- Preferir `transform`/`opacity`; evitar animar layout, blur masivo, `will-change` global y listeners que causen renders React por pixel.
- Sin JS o si falla el observer, **contenido esencial visible**; no dejar `opacity:0` permanente.
- Medir CLS, LCP, INP, fluidez en móvil, foco y teclado; no afirmar 60 fps sin medición.
- Revisar 360/390/430/768/1024/1440/1920 px según el componente. El motion debe poder cancelarse ante clicks rápidos.

**Plan detallado ya archivado:** `apps/ui-lab/docs/dashboards/01-landing/legacy/motion-design-premium/README.md` (C00–C08). **No crear campaña duplicada ni implementar sin nueva instrucción.**

## 9. Proceso de diseño y aceptación visual
**Antes:** leer esta guía, tokens vigentes, landing y Studio reales; identificar el contenido, restricciones y estado actual; guardar screenshot baseline cuando sea posible.

**Diseñar:** una propuesta de jerarquía y composición; inventario de componentes que reutiliza; tokens concretos; storyboard de entrada/salida/cambio; versión desktop y móvil.

**Implementar (solo con autorización):** cambios pequeños, scoped, reversibles; no tocar backend, rutas ni funcionalidades por motivos estéticos. Evitar contaminar `:root` global.

**Verificar:** capturas antes/después, revisión visual real, keyboard, touch, foco, contraste, reduced-motion, errores/vacíos, breakpoints, rendimiento y regresiones. Registrar resultados medidos y lo que queda pendiente.

**Aprobar:** la aceptación final requiere revisión visual del founder. Pasar build/typecheck no significa alcanzar la calidad de diseño solicitada.

## 10. Instrucción breve para agentes de UI
> Diseña exclusivamente el lenguaje visual y la experiencia de interacción de la pantalla asignada. Usa la landing actual como referencia editorial y el Estudio Demo como traducción instrumental. Respeta tokens y componentes reales; no copies su layout ni inventes funcionalidades. Prioriza jerarquía, respiración, tipografía Fraunces/Manrope, superficies cálidas, violeta contenido, profundidad sutil y motion cinematográfico con entradas/salidas y cascadas ligeras. Diseña móvil de verdad. Documenta estados, accesibilidad, reduced-motion y pruebas; no cambies runtime ni despliegues sin aprobación.

## 11. Estado y deuda documentada
**Observado en código:** tokens y composición de landing; Studio con tokens compartidos y layout instrumental; animaciones locales y estilos responsive. **Documentado como propuesta, no verificado como implementación:** coreografía cinematográfica transversal, biblioteca completa de patrones animados, comparativas visuales automatizadas, métricas de rendimiento y adopción en todos los workspaces.

**Referencias internas:**
- `./AUDITORIA-BRANDING-UX-Y-MOTION-2026-11-23.md`
- `../superficies-transversales/AUDITORIA-ESTUDIO-DEMO-VS-LANDING-2026-11-23.md`
- `../../01-landing/legacy/design-system-agntiapro/`
- `../../01-landing/legacy/motion-design-premium/README.md`
- `../../01-landing/ejemplo-componentes-reales/`

**No se ha modificado código, construido una galería interactiva ni ejecutado pruebas visuales con esta edición documental.**
