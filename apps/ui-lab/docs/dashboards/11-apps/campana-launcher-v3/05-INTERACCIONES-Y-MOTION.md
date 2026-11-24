# Interacciones y motion (C04)

## Ratón

| Acción | Resultado |
|---|---|
| Hover sobre icono | Nombre superpuesto aparece (160 ms), icono se eleva 3 px; la rejilla no se mueve |
| Clic | Abre la app desde el centro del icono |
| Clic en fondo | Cancela la selección pendiente |
| Clic en carpeta | Abre el diálogo de carpeta |
| Clic en dock | Recientes / LAIA / cajón / app |

## Táctil

| Acción | Resultado |
|---|---|
| Primer toque | Selección: anillo violeta, elevación 2 px, nombre visible |
| Segundo toque en el mismo | Abre la app |
| Toque en otro icono | Mueve la selección (una sola app seleccionada) |
| Toque en espacio vacío | Cancela la selección |

La decisión no depende del ancho: `pointerType` + `matchMedia` deciden la modalidad. Verificado con
emulación táctil real en Chromium (CDP), no con un viewport pequeño.

## Teclado

| Tecla | Resultado |
|---|---|
| Tab / Shift+Tab | Recorre controles; el foco visible es un anillo violeta de 2 px con offset 4 px |
| Foco en icono | Revela el nombre |
| Enter / Espacio | Abre la app |
| Escape | Cierra app, cajón, carpeta o recientes; nunca deja una capa atrapada |
| Enter en reposo | Entra al escritorio |

Foco inicial: buscador al abrir el cajón, «Cerrar carpeta» al abrir una carpeta, la superficie al
abrir una app. Foco de retorno: el icono de origen al cerrar la app.

## Movimiento

| Transición | Propiedad | Duración | Curva | Notas |
|---|---|---|---|---|
| Reposo → escritorio | opacity + translateY(14px) + scale(0.994) | 460 ms | `cubic-bezier(.22,1,.36,1)` | una vez por entrada |
| Cascada de favoritas | opacity + translateY | 480 ms, retardos 40–190 ms | idem | 6 grupos, nunca por fila ni letra |
| Carpetas / widgets | igual | 480–520 ms, retardo 150–190 ms | idem | discreto |
| Apertura de app | opacity + scale desde el centro del icono | 420 ms | idem | `transform-origin` con el rectángulo real |
| Cierre de app | opacity + scale(0.66) | 240 ms | `cubic-bezier(.2,.8,.2,1)` | después se restaura el foco |
| Carpeta | backdrop fade 200 ms + panel 300 ms | — | idem | diálogo modal |
| Hover / selección | transform y sombra | 160–200 ms | idem | no retrasa el clic |
| Recientes | tarjeta entra 340 ms, retardos 50/100 ms | — | idem | — |

Reglas:

- Solo se animan `opacity` y `transform`; no se anima altura ni layout, así que no hay CLS.
- Un solo foco cinemático por transición; sin rebotes, sin parallax, sin animación infinita.
- El usuario puede interactuar desde el primer frame: la cascada nunca bloquea.
- `prefers-reduced-motion: reduce` y la clase `alp-reduced` dejan las animaciones en 0,01 ms y
  eliminan retardos; el contenido y el feedback se mantienen. Verificado: `animation-duration` =
  `1e-05s` y reloj con `opacity: 1`.

## Correcciones surgidas del QA

1. **Primer Escape perdido**: el manejador global dependía de un cierre recreado en cada render y el
   `input[type=search]` consume Escape para limpiarse. Ahora la superficie y el cajón tienen su
   propio manejador (3/3 cierres al primer intento).
2. **Selección táctil cancelada por burbuja**: el clic del icono llegaba al contenedor y borraba la
   selección. El contenedor ahora ignora los clics dentro de controles.
3. **Scroll de 26 px**: el badge del laboratorio sumaba altura; `:has()` hace que el launcher ocupe el
   espacio restante.
4. **Objetivos táctiles**: herramientas y enlaces subieron a 40–44 px.
