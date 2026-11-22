# 04 — Motion y experiencia sensorial visual
## Dirección
Animación elegante, breve y funcionalmente agnóstica. Debe comunicar profundidad, continuidad, jerarquía y respuesta táctil, sin llamar la atención sobre sí misma.

## Escala recomendada
Instantáneo 80ms; rápido 140ms; estándar 200ms; panel 260ms; transición espacial 320ms; reveal editorial 500–650ms. Easing suave `cubic-bezier(.2,.7,.2,1)`. Son objetivos de diseño, no tokens implementados. Los CSS inspeccionados usan transiciones ~180–250ms y reveals de landing más largos.

## Microinteracciones
Hover: elevación 1–2px o cambio de superficie, no ambos exagerados. Press: volver a posición base y feedback inmediato. Selección: cambio de fondo/borde/indicador sin saltos. Tooltip: fade corto. Panel lateral: entrada lateral estable. Sheet: deslizamiento con resistencia visual y snap claro. Tabs: indicador que acompaña al cambio, sin desorientación. Scroll: no secuestrarlo.

## Movimiento de composición
Al abrir o cerrar un panel, conservar anclas visuales y evitar cambios bruscos. Animar transform/opacity cuando sea posible; no generar layout shift. Los cambios de densidad o breakpoint deben sentirse naturales, no ser una coreografía larga.

## Landing frente a software
Landing: secuencias editoriales discretas y entrada visual de imágenes. Software: transiciones cortas y foco en lectura. La marca es una sola, pero el ritmo se adapta a la densidad de cada pantalla.

## Accesibilidad
`prefers-reduced-motion`: eliminar desplazamientos decorativos y suavizados innecesarios, conservar feedback instantáneo. No autoplay de animación intrusiva, parpadeos ni loops ornamentales. Focus visible persistente; no depender solo de hover. Pruebas con teclado, touch y dispositivos lentos.

## QA de motion
Grabar hover, focus, press, apertura/cierre de panel, cambio de pestaña, scroll y adaptación móvil. Verificar consistencia de duración, ausencia de saltos, estabilidad de texto y continuidad espacial. No declarar performance sin medir.