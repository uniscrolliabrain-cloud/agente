# MOBILE CHAT SHEET — Codex handoff (2026-11-20)

## Objetivo y estado
Recuperar y terminar la implementación existente de la rama `wip/mobile-chat-sheet`, **sin reescribir el sistema conversacional**. UX objetivo: hoja inferior tipo Google Maps Android, con arrastre fluido, 4 snap points, conversación transversal sobre workspaces y compositor siempre visible sobre teclado. El propietario reportó cuatro iteraciones previas sin funcionamiento satisfactorio en Android real; además, el botón flotante de Chat permanece visible al abrir el panel y tapa la flecha de enviar.

**Estado verificado por lectura de código, NO por ejecución:** rama originalmente 2 commits por delante de main, 10 archivos frontend cambiados; no hay modificaciones backend ni documentación nueva en esos commits. No hay evidencia de que se haya probado en dispositivo físico. NO declarar arreglado hasta verificar.

## Archivos y cableado
- `apps/web/src/App.tsx`: `isMobile = useMediaQuery("(max-width: 900px)")`, `mobileChat`, `chatDock`, `showChatFab = !isMobile || !mobileChat`, `MobileChatSheet`, botón flotante; verificar otros FAB en AppShell/TopBar/Sidebar y stacking.
- `apps/web/src/components/MobileChatSheet.tsx`: `SNAP_PERCENTS=[26,45,68,100]`, mínimo 184px o barra+compositor+12px, gestos touch/pointer, `window.visualViewport.height`, `window.__sheetDebug`, `style.height`, `snapIndex` local.
- `apps/web/src/components/MobileChatSheet.css`: fixed bottom:0, z-index:90, contain:layout paint, overflow:hidden, flex y `.collapsed`.
- `apps/web/src/components/SidebarChat.tsx`: `variant="sheet"` reutiliza `MessageList` + `ChatInput` y mismo hilo.
- `apps/web/src/hooks/useChat.ts`: streaming AG-UI con throttle 80ms, guardado hilo, cancelación.
- `apps/web/src/components/MessageBubble.tsx`: memo.
- `apps/web/src/hooks/useTasks.ts`, `useNotifications.ts`, `useWorkspaceData.ts`: firmas JSON de polling.
- `apps/web/src/index.css`: estilos generales.
Antes de editar inspeccionar también `ChatInput`, `MessageList`, `AppShell`, `SidebarV2`, `TopBarV2`, `index.html`, manifest y CSS relacionados; la lista anterior no prueba que sean los únicos implicados.

## Invariantes
1. Misma conversación/hilo y permisos de tenant que el chat principal; no duplicar hook, API, ni persistencia.
2. No cambiar contratos backend, agentes, SOPs ni auth por un problema visual.
3. No instalar dependencias ni modificar main sin justificarlo y sin aprobación del propietario.
4. Preservar escritorio, móvil, accesibilidad y reduced motion.
5. Cambios mínimos, reversibles y con pruebas. No afirmar que Playwright equivale a Android real.
6. Trabajar en esta rama o en rama hija de reparación, sin merges ni despliegues automáticos.

## Ruta de ejecución
1. Leer docs 01-04, código de la rama y diff con main; reconstruir DOM y eventos; no asumir que la documentación legacy manda sobre el código.
2. Reproducir por separado: (a) FAB tapa Enviar; (b) gesto no mueve/snap incorrecto; (c) teclado tapa compositor; registrar viewport, event path, scroll, DOM y stacking.
3. Crear modo de diagnóstico temporal activable con `?sheetDebug=1` (solo dev), con exportación de métricas sin mensajes, tokens ni datos personales. Mantener desactivado por defecto.
4. Corregir **una causa raíz por vez**, sin cambios cosméticos ajenos.
5. Ejecutar typecheck/lint/tests disponibles y Playwright móvil, incluidos touch realista y teclado emulado; documentar comandos/resultados reales.
6. Entregar build/URL accesible para prueba en Android físico. Solicitar feedback exacto del usuario antes de darlo por resuelto.
7. Completar `04-EXECUTION-REPORT.md` en cada ola; hacer commit, reportar SHA, ficheros, pruebas y bloqueos; no fusionar main.

## Referencias técnicas para contrastar, no copiar ciegamente
- Chrome viewport y teclado: https://developer.chrome.com/blog/viewport-resize-behavior/
- MDN VisualViewport: https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport
- MDN Pointer Events: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- MDN touch-action: https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
- MDN safe area: https://developer.mozilla.org/en-US/docs/Web/CSS/env
- Alternativa a evaluar en spike aislado si falla el enfoque nativo: https://vaul.emilkowal.ski/ (no instalar en producción por defecto).
