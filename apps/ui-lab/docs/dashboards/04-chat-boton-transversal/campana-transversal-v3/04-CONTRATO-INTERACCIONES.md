# 04 · Contrato de interacciones

## Escritorio

- **Apertura**: FAB inferior derecha (52 px, pill marfil con marca real, sin animación permanente). Al abrir, el panel entra en la columna izquierda junto al rail de 76 px y el workspace reduce su ancho mediante `--ctv-dock-width`.
- **Cuatro anchos nominales**: 312 · 390 · 510 · 660 px. `dockWidths(clientWidth)` recorta 660 al 58 % del viewport y interpola los demás; a 1024 px el ancho "normal" medido es 375 px, no 390.
- **Arrastre**: `pointerdown` sobre el tirador → `setPointerCapture`; durante el gesto se escribe la variable CSS (sin transición) y `ctv-resizing` desactiva animaciones. Al soltar, snap al ancho más próximo.
- **Clic sin arrastre** (movimiento < 5 px): cicla al siguiente ancho.
- **Teclado**: `role="slider"` con `aria-valuenow/text`; `←/→/↑/↓` mueven un paso, `Home/End` a los extremos.
- **Cierre**: botón de la cabecera, `Escape` (cuando no hay diálogo abierto) y foco devuelto al FAB.

## Móvil y tablet táctil

- **Cuatro posiciones**: 26 · 45 · 68 · 100 % del alto visible. El mínimo no es fijo: se mide el tirador y el compositor reales y se toma `max(184 px, barra + pie + 12 px)`.
- **Arrastre**: `pointerdown` en el tirador, `pointermove` escribe `style.height` con clamp entre mínimo y alto de `visualViewport`; `pointerup` hace snap, `pointercancel`/`lostpointercapture` vuelven al peldaño anterior.
- **Toque sin desplazamiento** (< 8 px): pasa a la siguiente altura. Tocar el tirador no abre ni cierra nada más.
- **Teclado**: el tirador es `slider`; `↑/↓` un paso, `Home/End` extremos, `Enter/Espacio` cicla.
- **Teclado virtual**: `visualViewport` fija `bottom`, `left`, `right` y alto visual; al abrirse el teclado la hoja se recoloca sin saltos.
- **Plegado**: con el mínimo, el cuerpo se oculta y el compositor sube hasta la barra; no queda una franja de mensaje cortado.
- **Modo compacto de llamada**: cuando la hoja está en el primer peldaño y hay una llamada en curso, se muestra la tarjeta compacta con estado, duración, ampliar y finalizar.

## Compositor

- `Enter` envía; `Shift+Enter` salta línea; `isComposing` no envía.
- **Micrófono**: pulsación breve (< 420 ms) inicia dictado (`SpeechRecognition` si existe); mantenida graba con `MediaRecorder`, se suelta para añadir la nota, se cancela con `pointercancel` sin adjuntar. Si falta soporte o permiso se explica, no se finge.
- **Adjuntos**: se conserva el nombre y se etiqueta «local, no se sube». No hay subida real.
- **Diez acciones** del «+» en diálogo nativo: subir archivo, subir fotos, hacer una foto, subir vídeo, grabar vídeo, cliente, proyecto, crear SOP, crear vídeo y buscar en la web. «Grabar vídeo» usa captura de cámara; «Crear vídeo» prepara un borrador. Las cinco empresariales añaden texto al borrador y lo dicen.

## Llamadas

- **Voz**: escena centrada con marca real, anillos y medidor sutiles, duración, silenciar y finalizar. Todo está rotulado como simulación.
- **Vídeo**: retrato real de LAIA a sangre con encuadre `center 26 %`, PiP local de 78 × 108, activar/apagar cámara, ocultar vista, silenciar y finalizar en rojo semántico.
- **Cámara**: `getUserMedia({ video: { facingMode: "user" }, audio: false })`; cada track se detiene al apagar, al finalizar y al desmontar. Si se deniega, se apaga el estado y se muestra el aviso real.
- **Ideas**: una cada seis segundos, como notas de trabajo con punto dorado, sin inventar decisiones ejecutadas.
- **Acta**: duración, puntos y siguiente paso **solo si hay puntos**; si la sesión dura menos de tres segundos, acta vacía explícita («La sesión terminó antes de que aparecieran ideas»). Se puede reabrir desde el hilo.

## Accesibilidad

- Nombres accesibles en todos los botones (`aria-label`), `aria-pressed` en micrófono y cámara, `role="dialog"` + `aria-label` en hoja y panel, `slider` con valores en los dos tiradores, `role="status"` para dictado, grabación y errores.
- Foco visible violeta de 2 px con `outline-offset: 2 px`.
- Áreas táctiles de 44 px como mínimo en herramientas, tirador, cierre, envío y controles de llamada.
- Sugerencias y acciones son botones reales: se alcanzan con `Tab` y se activan con `Enter`/`Espacio`.

## Datos

Todo sintético. El workspace de contexto es una maqueta neutra rotulada «Contexto de demostración». El hilo se guarda solo en el navegador. No hay llamadas a producción, OAuth, MCP ni APIs.
