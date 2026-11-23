# 17 · Auditoría estática de Formación V1 frente a Landing y Estudio Demo

**Fecha:** 2026-11-23 · **Ámbito:** código real de `apps/ui-lab/src/formation/{FormationWorkspace.tsx,formation.css,catalog.ts}`, registro UI Lab, `vendor/landing/{Landing.jsx,landing.css}`, `vendor/studio/{BusinessCommandStudio.tsx,studio.css}`, `design-system/agntia-tokens.css` y auditorías previas de Landing/Studio. **Estado:** RECHAZADO como acabado premium; válido como primer prototipo funcional. No se han ejecutado build, typecheck, navegador ni pruebas táctiles; no asignar puntuaciones medidas.

## Veredicto

- **Identidad de marca:** coincidencia en colores de referencia, Fraunces/Manrope y superficies cálidas. No equivalencia de diseño: Formación redeclara los hexadecimales en `.fm-root` en lugar de consumir `--ag-*`, introduce una marca textual propia con glifo ✳ y compone una cabecera local que puede duplicar el shell de producto.
- **Frente a Landing:** el ritmo editorial del titular y hero de dos columnas aproxima la jerarquía, pero no tiene el lenguaje fotográfico, las capas reales, las transiciones de entrada/salida ni el tratamiento de imágenes de Landing. El hero y todas las cards repiten tres geometrías CSS: falta variedad editorial.
- **Frente a Estudio Demo:** menor densidad y más aire en catálogo, mejora localizada para este caso de uso; no supera la sofisticación de controles/relaciones del Estudio ni su organización de estado. No se ha comparado mediante render, así que no se afirma superioridad visual.
- **Motion:** prácticamente ausente. Hover y transición de altura del sheet no constituyen coreografía cinematográfica. La transición de altura produce relayout; no hay continuidad de escena ni revelado semántico. No satisface la auditoría de branding UX.
- **Alcance:** solo UI Lab; no tocar Landing, Studio ni apps/web hasta aprobación.

## Hallazgos priorizados

| ID | Prioridad | Evidencia | Corrección exigida |
|---|---|---|---|
| F01 | P0 | `formation.css` redeclara `--fm-*` con hexadecimales pese a `agntia-tokens.css` | Consumir `--ag-*`; variables locales solo derivadas y justificadas |
| F02 | P0 | `FormationWorkspace.tsx` pinta logo ✳, navegación y cabecera nuevos | Alinear marca y shell con componentes reales; no inventar logotipo ni duplicar navegación |
| F03 | P0 | `CourseArtwork` es una misma composición geométrica para los 120 cursos | Diseñar 12 slots fotográficos y fallback sobrio; diversidad de escala/encuadre, no repetir la misma escultura |
| F04 | P0 | No hay secuencia de entrada/salida ni transiciones de contenido entre Explorar/Biblioteca o hero | Implementar motion semántico, transform/opacity y reduced motion con continuidad de foco |
| F05 | P0 | Sheet creado desde cero; no se ha recuperado el sheet real del chat | Recuperar implementación original de rama/commit o documentar claramente divergencia; comprobar comportamiento real en touch |
| F06 | P0 | `onPointerDown/Up` sobre grab zone y `onTouchStart/End` coexisten; el gesto no usa pointer capture, ni cancelación ni límites de velocidad | Consolidar Pointer Events, umbrales y cancelación; pruebas touch/scroll y teclado |
| F07 | P1 | `fm-sheet` anima `height` y backdrop cubre toda la pantalla incluso en peek | Evaluar composición y rendimiento; preservar contexto en peek, scroll interno y safe-area |
| F08 | P1 | `role=dialog` con `aria-modal=false` sin gestión de foco al abrir/cerrar | Definir si sheet es modal o no; foco inicial/retorno, teclado y lectura accesible |
| F09 | P1 | `saved` solo estado local, sin persistencia; catálogo presenta 120 elementos de una vez | Etiquetar estado demo, optimizar listas para móvil y definir paginación/virtualización si procede |
| F10 | P1 | `feature=formationCourses[0 o 60]` acopla la selección al orden de catálogo | Seleccionar por ID canónico, con validación, no índices mágicos |
| F11 | P1 | Imports no usados (`ArrowLeft`, `Sparkles`) y parámetro `i` de map sin uso | Limpiar; ejecutar typecheck y build |
| F12 | P1 | `fm-card h3` fija min-height y grid 4 columnas; móvil 2 columnas | Comprobar truncamiento/lectura a 320, 390, 768, 1440; capturas reales |
| F13 | P1 | El CSS de Formación es monolítico y muy comprimido | Separar tokens/primitivas/hero/catalog/sheet y facilitar mantenimiento y QA |
| F14 | P1 | No hay componente de player/escena audiovisual real; solo ficha con mensaje “Vídeo en preparación” | Diseñar estado audiovisual honesto (poster, detalles, ausencia de vídeo) y futura integración sin simular play |
| F15 | P2 | No hay estados de loading/error ni tests de filtrado, guardados o sheet | Añadir pruebas deterministas y QA visual en UI Lab |

## Contraste por dimensión

| Dimensión | Formación V1 | Referencia y resultado |
|---|---|---|
| Paleta | Valores coincidentes, duplicados | Landing: **parcial** |
| Tipografía | Fraunces + Manrope | Landing: **alineado en elección, no en refinamiento** |
| Composición | Hero editorial + grid abierta | Landing: **parcial**; Estudio: distinto por función |
| Imágenes | Arte CSS genérico repetido | Landing: **no alcanza** |
| Navegación | Header local independiente | Shell AgntiaPro: **no validado** |
| Interacción | Tabs, filtro, búsqueda, guardado, sheet | Prototipo útil, pero **sin QA** |
| Motion | Hover, height transition | Auditoría de motion: **no cumple** |
| Accesibilidad | Algunos labels y focus-visible, Escape | **Parcial**; foco/sheet por revisar |
| Responsive | Media queries 980/650/370 | **No validado en navegador** |
| Producto | 120 títulos reales, estados media honestos | **Alineado con criterio de datos** |

## Orden de corrección recomendado

1. **C00 · Auditoría de composición:** capturas de Landing, Studio y Formación en los mismos tamaños; sin declarar aprobación sin render.
2. **C01 · Identidad:** reutilizar tokens, marca, navegación y primitivas reales; eliminar CSS redundante.
3. **C02 · Dirección artística:** diseñar slots para 12 fotografías, ratio, máscaras, fallback y composición protagonista.
4. **C03 · Sheet:** recuperar el del chat o justificar implementación nueva; pointer capture, snap, safe-area, foco, scroll y pruebas.
5. **C04 · Motion:** entrada por grupos, cambio de tab/hero, ficha, estados vacíos, salida y reduced-motion.
6. **C05 · Calidad:** typecheck/build, tests, capturas 320/390/768/1440, pruebas táctiles y comparación lado a lado.
7. **C06 · Aprobación founder:** solo después generar las 12 prompts finales y conectar assets; sin deploy de producción.

## Criterio de aceptación

No aceptar por compilar. Debe sentirse tan refinado como la Landing y con la claridad operativa de Studio, pero más editorial, respirado y audiovisual. Se requiere evidencia de render real, pruebas táctiles y aprobación visual del founder. **Esta auditoría no modifica código ni autoriza despliegue.**


## Seguimiento V2 · 2026-11-23
Se han actualizado **encima de los mismos archivos** `FormationWorkspace.tsx` y `formation.css`, sin crear componentes paralelos ni ramas: (a) `BrandLockup` de Landing sustituye al logotipo inventado; (b) variables locales ahora referencian `--ag-*`; (c) entradas por grupos y microtransiciones con reduced-motion; (d) variantes geométricas provisionales por ID; (e) sheet con eventos Pointer consolidados, pointer capture y cancelación, foco de cierre y retorno al disparador; (f) destacado por ID IA01/R01, imports y variable de iteración sin uso retirados. **Estado: implementación parcial, pendiente de pruebas**. No se ha recuperado el sheet original del chat, no hay todavía fotografías, no hay player real ni capturas, y el sheet requiere verificar foco y scroll en móvil. No afirmar que la V2 supera Landing/Studio sin render. La coreografía sigue siendo una primera pasada, no el sistema definitivo.
