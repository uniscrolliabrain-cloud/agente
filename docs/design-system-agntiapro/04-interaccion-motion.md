# 04 — Interacción, movimiento y transiciones
## Filosofía
Movimiento premium, casi imperceptible, con intención: explica continuidad espacial, foco, causa-efecto, entrada de datos y cambio de estado. Referencias aspiracionales: claridad y sutileza de herramientas creativas profesionales, no copiar literalmente otras marcas. Nunca convertir la app en una landing animada.

## Tokens propuestos (objetivo, no existentes aún)
- `motion.instant` 80ms: feedback de pulsación.
- `motion.fast` 140ms: hover, toggle, selección.
- `motion.base` 200ms: chips, cards, tooltips.
- `motion.panel` 260ms: abrir/cerrar inspector y chat.
- `motion.context` 320ms: cambio de vista con preservación de contexto.
- `motion.reveal` 500–650ms: entrada editorial de landing una sola vez.
- Easing micro: `cubic-bezier(.2,.7,.2,1)`; salida `cubic-bezier(.4,0,1,1)`; evitar bounce salvo objeto físico intencionado.
- Transform y opacity preferidos; no animar layout masivo sin necesidad; usar View Transitions solo con fallback y soporte comprobado.

## Reglas por superficie
**Landing**: reveal por secciones, secuenciación de 40–80ms en elementos relacionados, hero de entrada suave, hover de CTA de 1–2px, imágenes sin parallax agresivo. La animación no retrasa acceso al contenido ni reanima en cada scroll. La versión inspeccionada ya usa `lp-reveal` y `lp-portrait-enter`.

**Centro de Mando**: cifras actualizadas sin contadores teatrales; una señal discreta al recibir actividad; alertas importantes no deben desaparecer antes de leerse. Briefing aparece estable; sin animación permanente.

**Studio**: cambiar Kanban/Grafo/Twin/360 mantiene identidad del objeto; crossfade breve del visualizador, inspector permanece estable. Drag con preview y snap claro; timeline mueve playhead fluidamente, sin scroll involuntario. Abrir chat reduce canvas suavemente pero conserva su posición y zoom; si el ancho no alcanza, cambia de layout, no encoge texto hasta hacerlo ilegible.

**Vídeo**: transición entre chat texto y vídeo dentro del mismo dock; nunca autoplay con sonido; controles persistentes al enfocarlos; notas aparecen sin desplazar el vídeo de forma brusca; report guardado con estado confirmado.

## Accesibilidad de movimiento
`@media (prefers-reduced-motion: reduce)` elimina transformaciones no esenciales, scroll suave y autoplay decorativo; preservar feedback mediante cambio instantáneo de estado. La landing y Studio ya tienen reglas reduced-motion; consolidar y testear. Pausar animaciones de fondo fuera de viewport o con pestaña oculta. No usar flashes, estrobos ni scroll hijacking.

## Interacción y foco
El foco sigue al panel abierto, vuelve al disparador al cerrarlo. Esc cierra modal/sheet no crítico. Tabs: flechas, Home/End cuando corresponde; DnD con teclado; tooltips no son única vía. Atajos documentados y no interceptar escritura en inputs.

## Rendimiento
Objetivo de experiencia: interacciones visuales fluidas a 60 fps cuando el dispositivo lo permita; evitar trabajo de React en cada frame del timeline, virtualizar tracks y tarjetas cuando sea necesario; animaciones con transform/opacity; no aplicar blur grande en paneles extensos. Medir INP/LCP/CLS en producción, no afirmar métricas sin medición.

## Matriz de transición
| Evento | Animación | Foco | Estado preservado |
|---|---|---|---|
| Abrir chat | dock slide 260ms | composer | workspace y selección |
| Cerrar chat | slide out 260ms | botón que abrió | selección y scroll |
| Cambiar agente | crossfade 200ms | título/agente | tenant, objeto y notas |
| Cambiar vista Studio | fade 200–320ms | tab activo | filtro, selección, tiempo |
| Seleccionar clip | highlight 140ms | inspector | playhead |
| Nueva actividad | inspector/sheet 260ms | primer campo | canvas |
| Aprobar | feedback 140ms | acción siguiente | audit trail |
| Error de red | sin animación decorativa | mensaje anunciado | borrador local |
| Reducir movimiento | instantáneo | igual | igual |

## QA motion
Grabar recorridos desktop y móvil a velocidad normal y 0.5x; verificar que no hay saltos de layout, doble animación, scroll al fondo no solicitado, pérdida de selección, botones superpuestos o foco invisible. Probar teclado virtual Android, resize, rotación y red lenta.
