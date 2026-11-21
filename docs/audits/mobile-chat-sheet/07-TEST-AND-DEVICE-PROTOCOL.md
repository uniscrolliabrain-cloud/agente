# 07 — Protocolo de prueba Android / escritorio

## Preparación
Verificar que el teléfono carga el SHA esperado (etiqueta de build en diagnóstico), que no existe service worker/cache sirviendo otra versión y que el viewport CSS es el esperado. Capturar modelo Android, versión Chrome, resolución CSS, orientación, teclado utilizado y si la navegación es gestual o por botones. Nunca copiar mensajes, tokens, tenant IDs ni claves en los logs.

## Instrumentación de desarrollo
Con `?sheetDebug=1` (solo dev), permitir visualizar/exportar:
- build SHA, ancho/alto `innerWidth/innerHeight`, `document.documentElement.clientHeight`
- `visualViewport.height,width,offsetTop,scale`
- altura panel, top/bottom, grip, historial, compositor, textarea y Enviar
- `activeElement` por nombre de etiqueta (sin valor), `elementFromPoint` sobre el centro de Enviar
- contadores touchstart/move/end/cancel, pointerdown/move/up/cancel, snap actual, drag activo
- estado visible de FAB y número de elementos coincidentes
Exportar texto sin contenido conversacional ni datos personales. Desactivar diagnóstico por defecto y retirarlo de producción si no hay política de debug.

## Matriz de pruebas
T01: viewport <900px, Chat cerrado: FAB visible; abrir: FAB desaparece.
T02: `elementFromPoint` sobre Enviar coincide con botón/descendiente; tap envía exactamente una vez.
T03: arrastrar grip arriba/abajo por los cuatro niveles; sin saltos, sin scroll de página.
T04: tocar grip avanza nivel; botones X, ajustes, maximizar no provocan snap.
T05: 30 mensajes, scroll de historial no mueve hoja.
T06: abrir teclado Gboard con hoja 26%, 45%, 68%, 100%: compositor completo sobre teclado; caret y botón visibles.
T07: cerrar teclado y reabrirlo: restaura altura coherente, sin saltos ni bloqueos.
T08: rotación y ventana corta; safe area y botón Enviar visibles.
T09: navegar workspace con hoja abierta; hilo y mensajes preservados.
T10: streaming, cancelar, respuesta larga, cambio de hilo y fallo de red.
T11: dock escritorio y chat completo no presentan regresión.
T12: acciones multimodales bocadillo/mic/vídeo/enviar visibles en tres superficies; stubs honestos sin permisos ni conexiones.
T13: teclado físico/lector de pantalla, foco y reduced motion.
T14: no solicitudes de audio/cámara sin interacción explícita.
T15: cerrar/reabrir sheet no deja overlays, listeners o scroll bloqueado.

## Automatización
Usar Playwright ya existente si está disponible; si no, añadir tests mínimos según convenciones repo. Emular viewport/touch y medir bounding boxes, pero no declarar que un teclado real funciona porque Playwright no abre Gboard. Usar asserts de DOM, hit testing y visual viewport simulado. Ejecutar comandos reales, guardar resultado y SHA.

## Aceptación real
Probar en Chrome Android físico, con teclado real, tras cada reparación relevante. Si no se dispone de móvil físico, T06/T07/T08 permanecen NOT VERIFIED. El propietario decide aceptación final. No merge/despliegue automático.

## Registro de defectos
Cada defecto: ID, síntoma observado, build, pasos, hipótesis, evidencia que confirma causa, parche mínimo, test de regresión, resultado en Android, SHA. Prohibido cerrar por mera intuición.
