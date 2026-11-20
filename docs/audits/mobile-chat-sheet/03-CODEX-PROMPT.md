# Prompt listo para Codex

Trabaja en el repositorio `uniscrolliabrain-cloud/agente`, rama base `wip/mobile-chat-sheet`. Lee **todos** los archivos `docs/audits/mobile-chat-sheet/{README.md,01-BEHAVIOR-AND-ACCEPTANCE.md,02-ROOT-CAUSE-PLAYBOOK.md,03-CODEX-PROMPT.md,04-EXECUTION-REPORT.md}` y verifica el diff real frente a main. La documentación legacy puede estar desactualizada: el código y pruebas mandan.

MISIÓN: arreglar y terminar el chat transversal móvil con UX tipo bottom sheet Google Maps, teclado Android compatible y FAB Chat oculto cuando la hoja está abierta. El usuario ha probado 4 iteraciones fallidas; no hagas una quinta ronda de cambios a ciegas.

Trabaja en rama hija `fix/mobile-chat-sheet-keyboard-gestures` (o reutilízala si ya existe y confirma estado), jamás sobre main. No hagas merge ni despliegue sin aprobación. Mantén el mismo useChat/hilo y contratos. Prioriza reproducir el bug del FAB y la geometría con teclado y gestos antes de tocar código. Comprueba que el build probado es el SHA que editas. Añade instrumentación dev temporal y tests de regresión Playwright si el repo lo permite. Ejecuta los tests realmente; no inventes resultados. Si falta dispositivo real, entrega URL/build verificable y pasos de prueba, marcando pruebas físicas pendientes. Documenta cada ola y resultados en 04-EXECUTION-REPORT.md, con SHA y lista de cambios; reporta en chat al acabar cada ola.

Olas secuenciales:
W0: inventario código, estado rama, build SHA y reproducción.
W1: FAB / stacking / overlays: eliminar interceptación de Enviar con test.
W2: gestos y snaps: reparar causa raíz y validar scroll separado.
W3: teclado y viewport: fijar compositor visible, restauración al cerrar teclado, safe areas, rotación.
W4: pruebas y regresión: mobile Playwright, escritorio, accesibilidad, streaming, informe y handoff a Android físico.
Cada ola requiere diagnóstico, cambio mínimo, comandos ejecutados, evidencia y estado PASS/FAIL/BLOCKED. Si un fallo no se puede reproducir, instrumenta y solicita trazas; no declares éxito.

No elimines comentarios originales del otro agente hasta haber trasladado su información relevante a docs; elimina solamente comentarios temporales de depuración cuando las pruebas terminen. No modifiques secretos, auth, backend ni workspaces no relacionados. No instales Vaul u otras dependencias sin justificar un spike y su coste. Al terminar solicita autorización para merge y despliegue, nunca los ejecutes automáticamente.


## Requisito añadido: compositor multimodal
Lee también `05-MULTIMODAL-COMPOSER.md`. Tras reparar el gesto, el teclado y el FAB, implementa los controles visibles de conversación bidireccional ElevenLabs (bocadillo), dictado/transcripción (micro), videoconferencia Anam (vídeo) y enviar texto (flecha) en un compositor compartido. Los proveedores no están cableados: crea solo UI y stubs honestos, sin llamadas reales ni permisos. Añade pruebas M01-M07 y registra estado en 04-EXECUTION-REPORT.md.
