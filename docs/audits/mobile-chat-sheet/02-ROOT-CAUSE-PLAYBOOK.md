# Diagnóstico guiado por hipótesis (no parches a ciegas)

## Incidente confirmado por usuario
Cuatro intentos previos no lograron el comportamiento deseado. El FAB Chat sigue visible cuando el chat transversal se abre y tapa la flecha Enviar. No asumir cuál de las cuatro versiones se está ejecutando: **primero verificar SHA de build, branch y despliegue**. El código de la rama contiene `showChatFab = !isMobile || !mobileChat`, que debería ocultarlo si `isMobile` y `mobileChat` son true. Esto crea una discrepancia código/render observado: comprobar si el teléfono sirve una build anterior, si el breakpoint >900px clasifica mal el viewport, si el FAB es otro elemento, si un service worker cachea assets o si el chat abierto es otro modo. No cambiar a ciegas la condición sin verificar DOM.

## Protocolo
1. Reproducir y registrar `location.href`, SHA/build, `innerWidth`, `visualViewport.width/height/offsetTop`, `matchMedia('(max-width:900px)').matches`, `mobileChat` y `chatDockActive` (sin datos de usuario).
2. Localizar con DevTools todos los botones que dicen Chat y su DOM real; inspeccionar `getBoundingClientRect`, `getComputedStyle`, `z-index`, `pointer-events`, `document.elementFromPoint` sobre Enviar. Confirmar si hay duplicado o botón antiguo.
3. Arrastre: capturar touchstart/move/end/cancel, pointerdown/move/up/cancel, active, startY, currentY, startHeight, computedHeight, nearestSnap y clase dragging. Existe `window.__sheetDebug` con down/move/cancel/kind; ampliarlo temporalmente.
4. CSS: inspeccionar contenedores fixed, transforms en ancestros, overflow, stacking context, contain, `touch-action`, scroll y compositor; identificar quién intercepta gesto.
5. Teclado: antes/después de focus, registrar layout viewport, visual viewport, offsetTop, rect hoja, rect textarea y rect botón Enviar, keyboard inset estimado; comparar navegador con y sin interactive-widget. No usar `100vh` sin estrategia.
6. Si el DOM no cambia después de editar código, detener: problema de build/deploy/cache, no de eventos.
7. Solo después de identificar fallo, escribir test que lo reproduce, aplicar fix mínimo y verificar.

## Riesgos del código actual
- `touchAvailable` bifurca pointer/touch; eventos dobles, cancelaciones y preventDefault requieren medición real.
- `touchend` aplica posición final antes de snap; medir distancias con viewport que cambia durante teclado.
- `setSnap` mantiene índice React y altura DOM separadas; posibles desajustes en resize.
- `position:fixed;bottom:0` con `visualViewport.height` puede dejar compositor detrás del teclado en Chrome Android.
- `collapsed` depende de alcanzar minPx, no necesariamente de snap 26%.
- `role=dialog` y `role=slider` requieren semántica/foco coherentes.
- `JSON.stringify` de polling evita renders, no llamadas de red; no mezclar optimización ajena con reparación.

## Diseño recomendado, sujeto a pruebas
Una fuente de verdad para `sheetOpen`, `snapIndex`, `keyboardVisible` y mediciones; separar fase de drag (ref + rAF) de commit snap (estado); considerar pointer events unificados y touch-action:none solo en grip, sin impedir scroll del historial. Determinar una sola política viewport: resizes-content o compensación visualViewport con offset; fallback documentado. Evitar librería adicional salvo spike con evidencia. El FAB debe depender del estado real de hoja y vista, y nunca superponerse a input.
