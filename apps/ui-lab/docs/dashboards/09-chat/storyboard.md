# C04 · Storyboard de movimiento

Regla: un foco cinemático a la vez, `transform`/`opacity`, sin animar layout ni reanimar el historial. Todo cancelable y con fallback instantáneo.

## 1. Entrada de portada

| Campo | Valor |
| --- | --- |
| Disparador | Montaje de la vista vacía |
| Origen | Contenedor estable; saludo, titular, compositor y chips |
| Propiedades | `opacity 0→1`, `translateY(9px→0)` |
| Duración | 500 ms (compositor 520 ms) |
| Cascada | saludo 0 ms · titular 55 ms · compositor 70 ms · chips 150 ms |
| Easing | `cubic-bezier(.22,1,.36,1)` |
| Cancelación | Interacción inmediata; el contenido ya es usable |
| Fallback | `prefers-reduced-motion: reduce` → 0.01 ms, opacidad final |
| Evidencia | `01-portada-1440x900.png`; QA «Reduced motion» |

El historial inicial **no** se anima (`data-enter` solo en mensajes nuevos), para no reanimar la vista al cargar un hilo.

## 2. Portada → conversación (continuidad espacial)

| Campo | Valor |
| --- | --- |
| Disparador | Primer envío (`messages.length > 0 || streaming`) |
| Origen/destino | El mismo nodo `.cux-dock` sube de la zona central al borde inferior |
| Mecanismo | FLIP con Web Animations API: se mide el rect anterior y se anima `translateY(delta)→0` |
| Propiedades | `transform` únicamente; opacidad y tamaño no cambian |
| Duración | 560 ms |
| Easing | `cubic-bezier(.22,1,.36,1)` |
| Remount | **No**: un solo `ChatInput`, sin pérdida de borrador ni del nodo |
| Foco | El foco se libera solo porque el compositor se deshabilita al entrar en streaming (paridad con `main`); al cancelar o terminar vuelve a estar disponible |
| Medición real | top 413 px → 656 px a 150 ms → 720 px final |
| Fallback | Sin `Element.animate` o reduced motion: salto directo, sin animación |
| Evidencia | QA «Motion: continuidad espacial FLIP»; `03a/03b` |

La portada desaparece en el mismo commit que entra la conversación; no hay pantalla blanca ni desaparición de controles.

## 3. Mensaje nuevo

| Campo | Valor |
| --- | --- |
| Disparador | Mensaje de usuario o respuesta finalizada |
| Propiedades | `opacity 0→1`, `translateY(7px→0)` |
| Duración | 380 ms usuario / 420 ms asistente |
| Repetición | Una vez por montaje; nunca por token |
| Evidencia | `03b`, `06`, `07` |

El texto en streaming no se reanima: el contenedor de la respuesta entra una vez y el texto crece dentro. El cursor es un bloque violeta de 2 px con parpadeo de 1.05 s (`steps(1,end)`), estático con reduced motion.

## 4. Microinteracciones

- Chips: 150 ms, `translateY(-1px)` al hover, retorno al pulsar.
- Herramientas: 150 ms de fondo/borde; estado pulsado del dictado en lila.
- Enviar: 150 ms, elevación 1 px, `scale(.96)` al pulsar.
- Acciones del mensaje: 160 ms de opacidad/desplazamiento; visibles en foco y en contenedor estrecho.
- Adjunto: aparición breve, color por estado (listo verde, error rojo), sin saltos de layout internos.

## 5. Streaming y cancelación

- Sin retraso del envío: el mensaje del usuario aparece antes de la primera respuesta.
- El compositor se bloquea durante la respuesta (comportamiento real); el botón cambia a detener.
- Cancelar limpia el buffer y las herramientas, no deja respuesta parcial. El error interno `Cancelado por el usuario` no se pinta porque `ChatPanel` no tiene superficie de error (documentado).
- El scroll solo pega al fondo si el usuario ya estaba abajo; un mensaje nuevo no arrastra la lectura. Evidencia QA «Scroll: un mensaje nuevo no arrastra…».

## 6. Reduced motion

Con `prefers-reduced-motion: reduce` dentro del scope: animaciones y transiciones a 0.01 ms, sin cascada, sin desplazamientos decorativos; el cursor deja de parpadear; la entrada es instantánea. Contenido y feedback siguen visibles (QA PASS).

## 7. Límites

- No hay grabación de vídeo en esta entrega; el movimiento se ha verificado con mediciones de FLIP, capturas y estados de animación (`getAnimations`). Ver `QA.md` § Limitaciones.
- No se animan alturas de listas ni se usa `will-change` global.
