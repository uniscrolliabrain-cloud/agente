# AgntiaPro · Motion Design Premium — especificación de implementación

> Estado: propuesta técnica y creativa, NO implementada. Rama: `feat/landing-premium-funnel`. Fecha: 2026-11-22.
> Alcance: landing pública React. No alterar branding, textos, arquitectura comercial, precios, imágenes originales, endpoints ni naturaleza deliberadamente DEMO del MVP.
> Objetivo: pasar de composiciones estáticas a una experiencia editorial viva, de precisión comparable en criterio de movimiento a Linear, Apple o Stripe, sin copiar sus diseños.

## 00. Taxonomía y principios

**M0 — Fundamentos**: tokens de movimiento, accesibilidad, rendimiento, progresive enhancement.
**M1 — Microinteracciones**: navegación, botones, chips, formularios, tarjetas, foco, estados.
**M2 — Coreografía editorial**: entrada de secciones, títulos, grupos, continuidad.
**M3 — Escenas insignia**: hero LAIA, Centro de Mando, flujo de trabajo, CTA.
**M4 — Transiciones de estado**: tabs, chat, diálogo de agente, mensajes, validación.
**M5 — Responsive y reducción de movimiento**: móvil, touch, teclado, dispositivos modestos.
**M6 — Ingeniería, QA y despliegue**: pruebas, métricas, fases y rollback.

### Invariantes de diseño

- Mantener Fraunces/Manrope y variables `--lp-paper #fcfaf6`, `--lp-ink #242421`, `--lp-violet #6550dd`, `--lp-gold #b49665`; no introducir estética dark-tech, partículas, glow constante, vídeo decorativo ni cursores personalizados.
- La animación explica jerarquía y causalidad: conversación → coordinación → ejecución → aprobación.
- Un solo foco cinemático a la vez; no mover todas las tarjetas continuamente. Scroll nativo siempre controlable, sin scroll-jacking.
- Animar preferentemente `transform` y `opacity`; `filter: blur` solo de manera muy acotada y si las mediciones lo permiten.
- Sin dependencias obligatorias de JS para que el contenido esencial sea visible; fallos de animación no bloquean formularios, navegación ni contenido.
- No crear falsas señales de actividad real, disponibilidad, llamadas, vídeos ni tareas ejecutadas. Etiquetas demo visibles.

## 01. Mapa del código inspeccionado

| Superficie | Ruta | Estado observado | Intervención |
|---|---|---|---|
| Landing y estado React | `apps/web/src/landing/Landing.jsx` | `useState` para menú, chat, mensajes, typing, tabs, formulario, presentación; `IntersectionObserver` y scroll listener | Extraer componentes animables sin reescribir la lógica |
| Sistema visual | `apps/web/src/landing/landing.css` | Tokens actuales, transiciones hover, sticky header con blur, scroll suave y una regla reduced-motion | Añadir tokens y estados coherentes; auditar selectores existentes |
| Escena de producto | `apps/web/src/landing/ProductScene.jsx` | Renderiza vistas en función de `view` | Transición keyed entre vistas y movimiento de capas decorativas |
| Assets | `apps/web/public/landing/` | Retratos LAIA/Antonio/Pedro, imágenes chat/operaciones/workspaces/product | Conservar assets y tamaños; optimizar carga sin sustituirlos |
| Previsualización | `apps/web/src/landing/preview.jsx`, `preview.css` | Entradas de preview | Mantener equivalencia con ruta pública |
| Legal/origen | `apps/web/src/config/publicSite.ts` | URLs legales públicas | No tocar |

**Precaución de ramas**: existen `feat/landing-premium-funnel`, `feat/public-landing-original-assets` y `release/landing-legal-20261122`. Antes de programar, comparar sus commits y confirmar la rama efectivamente desplegada. Esta documentación se añade a la rama de trabajo de landing; no presupone que esté en producción.

## 02. M0 · Sistema de tokens

Crear archivo `apps/web/src/landing/motion-tokens.css` o incorporar tokens al namespace `.lp-premium` sin contaminar el resto del monorepo.

```css
.lp-premium {
  --lp-motion-fast: 180ms;
  --lp-motion-ui: 260ms;
  --lp-motion-scene: 620ms;
  --lp-motion-stagger: 85ms;
  --lp-motion-ease: cubic-bezier(.22, 1, .36, 1);
  --lp-motion-ease-ui: cubic-bezier(.2, .8, .2, 1);
  --lp-motion-distance: 18px;
  --lp-motion-scale: .985;
}
@media (prefers-reduced-motion: reduce) {
  .lp-premium { --lp-motion-fast: 0ms; --lp-motion-ui: 0ms; --lp-motion-scene: 0ms; }
}
```

Valores orientativos, no constantes intocables. Diseñar tres velocidades: interacción inmediata (150–250ms), cambio de estado (240–400ms), narrativa (500–750ms). Efectos de hover no deben retrasar clics. Efectos scroll-linked deben usar progreso acotado y saturación al salir del viewport.

## 03. M1 · Microinteracciones (matriz)

| ID | Elemento existente | Comportamiento | Criterio de aceptación |
|---|---|---|---|
| M1.01 | `.lp-header` / `.lp-header-scrolled` | Mantener compresión 88→68px, suavizar sombra/borde y conservar estabilidad | Sin salto de layout ni jitter en scroll |
| M1.02 | Enlaces `.lp-desktop-nav` | Subrayado fino que crece desde el centro, 180ms; foco visible distinto del hover | Keyboard/hover/touch correctos |
| M1.03 | `.lp-button` | Hover elevación máx 2px; active vuelve a 0; transición de sombra y fondo | No CLS; contraste y focus intactos |
| M1.04 | Chips `.lp-suggestions` | Entrada escalonada SOLO en primera visita al hero; hover fondo suave | No retrasar clic ni envío de prompt |
| M1.05 | Retratos `.lp-agent-*` | Zoom imagen 1.015–1.025, máscara fija, overlay controles por hover/focus-within | Texto siempre legible; touch sin hover dependiente |
| M1.06 | Inputs `.lp-form-fields` | Borde violeta al foco y etiqueta estable; errores sin sacudidas agresivas | Error anunciado a lector de pantalla |
| M1.07 | Tarjetas de precios | Halo/sombra muy sutil al entrar, sin efecto de venta insistente | Sin falsas animaciones de contador |
| M1.08 | Enlaces de footer | Subrayado preciso, foco visible, sin movimiento espacial | Respeta reduced-motion |

## 04. M2 · Coreografía editorial por scroll

Definir componente reutilizable `Reveal` (wrapper semánticamente neutro), `StaggerGroup` y hook `useReducedMotion`. Priorizar CSS `IntersectionObserver` existente para reveal simple; usar Motion para React únicamente si simplifica escenas y transiciones complejas. No mezclar dos observadores que escriban el mismo `transform`.

- Umbral recomendado: `threshold: 0.12` o `rootMargin: "0px 0px -8% 0px"`; revisar móviles.
- Entrada: `opacity: 0→1`, `translateY(12–20px)→0`, duración 560–680ms, easing premium; escalonar 70–100ms encabezado/lead/CTA.
- Ejecutar una vez por sección; nunca ocultar contenido al hacer scroll hacia arriba.
- Texto y CTAs deben ser accesibles desde el HTML aun cuando JS falle; si se usa `opacity:0` inicial, activarlo solo tras detectar soporte JS y preparar fallback.
- No aplicar reveal a cada palabra o letra; reservar animación tipográfica para un único momento opcional del hero.

## 05. M3.01 · Hero LAIA (escena principal)

**Estado actual**: hero editorial de dos columnas, foto `/landing/laia.png`, chat inline, retrato y tarjeta superpuesta.

**Secuencia** (solo primer render y solo si visible): marca/nav visibles de inmediato; eyebrow 0ms; H1 90ms; lead 180ms; CTA 260ms; retrato 160ms con `scale(.985)→1` y `translateY(12px)→0`; tarjeta LAIA 360ms. Duración global <1s, no bloquear interacción.

**Scroll**: al recorrer los primeros ~450px, retrato y tarjeta pueden moverse a velocidades ligeramente distintas (máx ±10px), SOLO desktop y con GPU/QA; desactivar en móvil/reduced motion. Evitar mover texto y chat al mismo tiempo. Imagen siempre contenida en su máscara.

**Chat inline**: aparición de mensaje mediante opacidad y Y 6px, indicador typing discreto, scroll al final solo si el usuario está siguiendo el hilo. No inventar latencia de backend. Mantener función `laiaReply(q)` como demo y su aviso.

**Continuidad con chat flotante**: al pulsar el lanzador, apertura por `opacity/scale/translate` desde esquina, foco al input y devolución del foco al cerrar. Evitar que launcher tape el composer; cuando chat abierto, ocultar launcher. No intentar morph hero→modal con coordenadas frágiles hasta que el estado compartido y el responsive sean estables.

## 06. M3.02 · Centro de Mando (segunda escena insignia)

**Superficie**: `ProductScene.jsx`, pestañas de `Landing.jsx`, fondo cálido y tarjetas superpuestas.

- Al entrar en viewport, escena principal `scale(.975)→1`, `translateY(22px)→0`, sombra progresa sutilmente; tarjetas flotantes entran 100–180ms después.
- Movimiento scroll-linked opcional: tarjetas flotantes ±8–14px, dashboard ±4px; nunca desplazar zonas clicables en móvil ni romper stacking/overflow.
- Tabs: preservar `tab` y `changeTab(index)`; crossfade 180ms + desplazamiento horizontal 6px o transición keyed 280ms. Evitar que se superpongan textos de dos vistas; mantener altura mínima estable para prevenir CLS.
- Botón/pestaña activa: indicador violeta animado tipo shared layout, solo si semántica tablist/tabpanel y navegación de teclado quedan correctas.
- No simular métricas o datos reales: capturas y datos permanecen explícitamente demo.
- Lazy-load de imágenes de vistas no visibles, precarga prudente de la próxima vista si procede.

## 07. M3.03 · Equipo digital

- Retratos LAIA, Antonio y Pedro: entrada en secuencia 0/90/180ms cuando el bloque cruza el umbral.
- Hover/focus: zoom 2% y ajuste de sombra 200–260ms, sin inclinar tarjetas en 3D.
- Apertura de `Dialog`: fade del backdrop 180ms, panel `translateY(12px) scale(.985)` 280–350ms; cierre inverso sin desmontaje prematuro.
- Respetar Escape, focus trap, restauración de foco, `aria-modal`, bloqueo de scroll y reproducción pausada al cerrar.
- Presentación existente con imágenes/subtítulos sin audio: conservar transparencia; barra de progreso suave pero basada en estado real del temporizador de demo. No añadir reproducción falsa.

## 08. M3.04 · «De hay que hacerlo a listo para revisar»

Esta sección debe visualizar la causalidad del producto. Cuatro pasos: **Tú hablas → LAIA coordina → El equipo ejecuta → Tú decides**.

- Línea SVG fina conectando nodos, con `pathLength`/stroke-dashoffset vinculado al progreso de la sección; máximo 1 recorrido y sin scroll hijacking.
- Activar icono y texto del paso cuando el progreso cruza 0/33/66/100%; no esconder información ni cambiar la semántica.
- Desktop horizontal; móvil vertical o sin línea si perjudica legibilidad.
- No mostrar actividad real inexistente: es diagrama conceptual, no un monitor operativo.
- Reduced motion: línea completa desde el principio y todos los pasos visibles.

## 09. M3.05 · Implantación, precio y discovery

- Sección de implantación: lista de 4 pasos entra escalonada 80ms; precio no cuenta desde cero (precio fijo y transparencia comercial).
- Tarjeta 1.500€ / desde 1.000€/mes: reveal único con `translateY(12px)`; evitar pulsos de urgencia y elementos engañosos.
- CTA oscuro: contraste visual ya logrado. Entrada del titular y formulario en tiempos distintos, con transición de estado `idle→validating→success/error` cuando corresponda.
- No declarar envío real sin verificar endpoint. No modificar la lógica del formulario ni su tratamiento de datos en esta campaña.
- Botón final y chat deben compartir destino de reserva, sin generar rutas divergentes.

## 10. M4 · Estados e interacción

**Máquina de estados recomendada** (conceptual, no añadir librería FSM obligatoria):
- Menú: closed/open; cierre al navegar/Escape; evitar transición con layout que empuje hero.
- Chat: closed/open, idle/typing/response; mensaje optimista solo si ya existe esa semántica; animar nuevas entradas, no todo el historial.
- Tabs: idle/switching/idle; clicks rápidos deben cancelar/reemplazar transición anterior sin quedar bloqueados.
- Agente: closed/open, paused/playing/finished; limpieza de timers en unmount.
- Formulario: idle/invalid/submitting/success/error, solo los estados que existan realmente. No inventar confirmaciones de recepción.

En `Landing.jsx` existe un `IntersectionObserver`, un listener scroll pasivo y varios `useEffect`: revisar qué clases aplica antes de añadir Motion, para evitar animación duplicada y conflictos de transform.

## 11. M5 · Responsive, accesibilidad y calidad

- Breakpoints de la landing existentes: respetarlos; no inventar un sistema paralelo. Revisar 360, 390, 430, 768, 1024, 1440 y 1920px.
- `prefers-reduced-motion: reduce`: eliminar parallax, stagger, transformaciones espaciales y smooth-scroll; preservar feedback inmediato de estados.
- Touch: sin efectos que dependan exclusivamente de hover. Área táctil objetivo ≥44×44px donde sea viable.
- Mobile chat: teclado virtual, `visualViewport` si es necesario, safe areas, botón flotante oculto al abrir, input visible sin tapar botón de envío; evitar `100vh` rígido.
- A11y: focus visible, orden de tabulación, roles tablist/tabpanel si se implementan, labels, Escape, restauración de foco, anuncios no intrusivos del chat, contraste WCAG AA.
- Rendimiento: medir LCP, CLS, INP y animaciones con Chrome Performance; objetivo 60fps en hardware capaz, sin obligar a 60fps en todos. Evitar `will-change` global, filtros blur sobre imágenes grandes y listeners de scroll que disparen renders React por frame.
- Usar `requestAnimationFrame` o Motion values para progreso continuo; mantener `setScrolled` solo al cambiar el umbral, no en cada pixel.
- Fallos: con JS desactivado o motion no cargado, textos, navegación y CTA deben seguir visibles.

## 12. M6 · Plan secuencial para agente implementador

**C00 — Baseline y aislamiento**
1. Confirmar commit/branch y entrypoint publicado; comparar `feat/landing-premium-funnel` con release y main.
2. Capturar screenshots escritorio/móvil, Lighthouse y pruebas existentes.
3. Proteger demo, legal, precios, links y formulario; no modificar backend, Fly ni workflows de deploy.
4. Inventariar clases `lp-*`, observers, timers y breakpoints; documentar hallazgos.

**C01 — Tokens y microinteracciones**
Implementar M0+M1 con CSS y pruebas. No añadir Motion todavía. Capturas comparativas.

**C02 — Reveal editorial**
Introducir helper `Reveal`/observer reutilizable, aplicar a secciones, probar sin JS y reduced-motion. Evitar cascadas largas.

**C03 — Hero LAIA**
Animar entrada, tarjeta y chat; validar LCP, CLS, mobile keyboard y no interferencia con envío.

**C04 — ProductScene**
Transición de pestañas, entrada de escena y capas flotantes; Motion para React solo si justificado; testear clicks rápidos.

**C05 — Equipo y diálogos**
Retratos, foco, modal, subtítulos, temporizador, reduced motion.

**C06 — Orquestación y CTA**
Línea de progreso SVG, implantación, precio, formulario, estados.

**C07 — Hardening**
Tests automatizados, visual regression, Lighthouse, profiling móvil, a11y y eliminación de animaciones excesivas.

**C08 — Handoff y release**
Informe por efecto (archivo, selector, duración, fallback), before/after, métricas, limitaciones y plan de rollback. No merge ni deploy sin autorización explícita del titular.

### Entregables de cada campaña

- Cambios acotados, commits pequeños y documentación de decisiones.
- Capturas de escritorio/móvil y grabación breve de scroll cuando sea posible.
- Tests relevantes ejecutados y resultados concretos, sin afirmar tests no corridos.
- Riesgos de rendimiento, accesibilidad y compatibilidad documentados.
- Checklist de aceptación por sección.

## 13. QA y criterios de aceptación

1. Identidad y layout prácticamente idénticos a la versión de referencia; nada se mueve de posición permanentemente.
2. Hero y demo tienen un movimiento protagonista reconocible pero discreto.
3. Entradas de secciones son consistentes y no repiten al subir.
4. Tabs y modales cambian con continuidad y soportan interacción rápida.
5. Chat demo sigue respondiendo con la misma lógica; no se presenta como IA conectada.
6. El formulario conserva semántica, validación y destino existentes.
7. No se rompe navegación por teclado ni el cierre Escape.
8. Reduced-motion muestra todos los contenidos sin parallax ni desplazamientos.
9. No aparecen scrollbars horizontales, overlays tapando controles ni saltos de layout.
10. No se modifica `apps/site` legacy ni código backend en esta campaña.
11. Sin regresiones perceptibles en LCP, CLS o INP respecto a baseline documentado.
12. Mobile first: el teclado no oculta input, CTA ni cerrar chat.

## 14. Riesgos y decisiones abiertas

- **Fuente real de producción**: la release examinada conserva `apps/site/index.html` legacy, mientras la landing premium está en `apps/web`. Verificar Vercel root/output y rutas antes de tocar deploy.
- **Dependencia Motion**: comprobar si ya está instalada en `apps/web/package.json`; preferir CSS/observer para lo simple. No instalar múltiples motores de animación.
- **Animaciones existentes**: `landing.css` ya contiene transiciones y sticky header; revisar y extender, no duplicar.
- **Scroll-linked**: puede ser caro en móviles y generar mareo; feature gate desktop + reduced-motion.
- **Vídeo/voz**: las presentaciones actuales son demos sin audio. La campaña no conecta Anam, ElevenLabs ni el runtime.
- **Legal**: no alterar avisos, consentimientos ni links; comprobar que el nuevo motion no oculta disclosures.

## 15. Referencias de criterio (inspiración, no dependencia)

- Apple: secuenciación cinematográfica y jerarquía visual, sin copiar efectos pesados.
- Linear: microinteracciones rápidas, sobriedad, consistencia.
- Stripe: profundidad por capas y transiciones de producto.
- WCAG 2.2: foco, interacción y accesibilidad; `prefers-reduced-motion` para minimizar movimiento no esencial.
- MDN: IntersectionObserver, Web Animations API, CSS transforms, View Transitions como posibles técnicas, siempre evaluadas según soporte.

**Regla final**: no se trata de animar la landing, sino de que la conversación con LAIA parezca poner en movimiento una empresa entera, conservando la serenidad editorial de AgntiaPro.
