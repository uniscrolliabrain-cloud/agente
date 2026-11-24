# 05 · Motion design

## Criterio

Movimiento al cambiar de estado, nunca durante un gesto directo. Durante el arrastre del dock o de la hoja las transiciones están desactivadas por clase (`ctv-resizing`, `is-dragging`), de modo que el borde sigue al dedo sin retraso: es exactamente la característica que el founder pidió preservar.

## Curva y tiempos

| Elemento | Movimiento |
| --- | --- |
| Cambio de ancho del dock | `width / flex-basis` 260 ms `cubic-bezier(0.22, 0.61, 0.36, 1)` |
| Cambio de altura de la hoja | `height` 240 ms, misma curva |
| Entrada de la hoja | `translateY(14px) → 0` + opacidad, 260 ms |
| Entrada del hilo, vacío, cabecera de llamada, ideas y acta | `translateY(6px) → 0`, 260 ms |
| Entrada del FAB | 220 ms |
| Hover de botones, tiradores y acciones | 140-160 ms, color y fondo |
| Envío | elevación de 1 px, 160 ms |
| Anillos de voz | escala 0,55 → 1,55 y desvanecido, 5,4 s en bucle, tres anillos desfasados 1,8 s |
| Medidor de voz | `scaleY` 1,4 s por barra, desfase 120 ms |
| Puntos de "Pensando" | opacidad y 2 px de elevación, 1,2 s, desfase 150 ms |
| Cursor de escritura | parpadeo `steps(2)` 1 s |

## Lo que deliberadamente no se anima

- Nada se mueve mientras el dedo arrastra.
- No hay rebotes, ni giros, ni animaciones en bucle en el FAB o en el botón de envío.
- Los cambios de altura del teclado virtual se resuelven por medición, no por animación.
- El modo compacto de llamada aparece sin coreografía: la hoja ya está en movimiento.

## Reduced motion

`@media (prefers-reduced-motion: reduce)` desactiva animaciones y transiciones de todo el módulo y de los diálogos. Verificado en navegador: `animation-name: none`, `animation-duration: 0s` en el FAB tras emular la preferencia.

## Continuidad espacial

El panel entra desde el borde izquierdo que ya ocupaba el rail, y la hoja desde el borde inferior. Al abrir una llamada o el acta no se cambia de contexto espacial: se sustituye el contenido del mismo contenedor, con la cabecera en el mismo sitio y el compositor fuera de escena.
