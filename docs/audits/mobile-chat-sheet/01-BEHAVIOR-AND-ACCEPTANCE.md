# Contrato funcional: hoja inferior transversal

## Experiencia esperada
Patrón visual y gestual **como bottom sheet de Google Maps móvil** (referencia de interacción, no copia de código). En cualquier workspace, botón Chat abre hoja inferior. Mientras hoja abierta, FAB Chat desaparece de DOM o queda no renderizado, nunca se superpone al compositor. Botón Enviar y área táctil completamente visibles y pulsables. Hoja conserva historial y compositor en la parte inferior.

Snap points de partida: 26%,45%,68%,100% del **área realmente disponible**. El mínimo plegado se calcula por altura de tirador + compositor + safe area + margen; si excede 26%, el mínimo prevalece y el porcentaje ARIA debe describir altura real, no fingir 26%. El usuario puede arrastrar barra; soltar ajusta al snap apropiado, con gesto continuo sin saltos; pulsar barra avanza snap; teclado accesible permite cambiar alturas. Historial hace scroll vertical sin arrastrar la hoja. La interacción con el input no inicia arrastre.

## Teclado
Al enfocar textarea y abrir teclado Android, el compositor permanece sobre el teclado; el historial puede reducirse y scrollear; el texto y flecha Enviar no se tapan. Al ocultar teclado, restaurar snap anterior sin saltos; en rotación, redimensionar. Evaluar `interactive-widget=resizes-content` en viewport meta **solo si es compatible con el shell completo**; no combinar resize de layout con compensación VisualViewport duplicada. En caso de estrategia visualViewport, medir `height` + `offsetTop`, posición real de la hoja y caja del compositor; usar CSS env(safe-area-inset-bottom) correctamente, evitando doble padding.

## Casos de aceptación
A01: móvil, Chat cerrado -> FAB visible y pulsable.
A02: Chat abierto -> FAB oculto, Enviar visible, ningún overlay intercepta click/tap (comprobar `elementFromPoint`).
A03: 4 alturas y snapping con arrastre lento/rápido hacia ambos sentidos.
A04: tap del grip cambia altura; no se dispara al pulsar cerrar/ajustes/maximizar.
A05: historial largo hace scroll sin mover hoja; barra sí mueve hoja.
A06: input con teclado abierto en Chrome Android: texto y enviar visibles; enviar funciona.
A07: cerrar teclado restaura altura prevista; reabrir no provoca desbordes.
A08: landscape, viewport corto, zoom y safe areas; mínimo sigue dejando input entero.
A09: cambio de workspace con hoja abierta conserva hilo y mensajes; no crea hilo nuevo.
A10: streaming + cancelación + mensajes largos no provocan saltos ni bloqueos.
A11: escritorio sin regresiones; accesibilidad de foco y navegación de teclado.
A12: al cerrar y reabrir, comportamiento de snap documentado y consistente (decidir con usuario si persistir último snap).

## Matriz
Chrome Android físico es requisito de aceptación; Playwright mobile emulation es requisito de regresión pero no lo sustituye. Probar dispositivo con teclado Gboard, viewport pequeño, Android navegación gestual y botones, rotación. Si no se dispone de Android real, marcar A06/A07 como NO VERIFICADOS, nunca PASS.

## Evidencias
Por cada caso: dispositivo/browser, build SHA, pasos, resultado PASS/FAIL/NOT RUN, captura o video si disponible, métricas DOM/viewport sin PII. No afirmar paridad Google Maps sin pruebas gestuales reales.
