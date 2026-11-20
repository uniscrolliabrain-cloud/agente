# Registro de ejecución Codex

Estado inicial: PENDIENTE. Documento creado para handoff, no representa ejecución ni pruebas.

## W0 — Auditoría y reproducción
- Fecha:
- Rama y SHA:
- Build/URL probada:
- Dispositivo y navegador:
- Archivos inspeccionados:
- Reproducción FAB:
- Reproducción drag:
- Reproducción teclado:
- Hipótesis confirmada:
- Evidencias:
- Bloqueos:
- Resultado: NOT RUN

## W1 — FAB y superposiciones
- Cambios y SHA:
- Pruebas y resultados:
- Evidencias:
- Resultado: NOT RUN

## W2 — Gestos y snap points
- Cambios y SHA:
- Pruebas y resultados:
- Evidencias:
- Resultado: NOT RUN

## W3 — Teclado y viewport
- Cambios y SHA:
- Pruebas y resultados:
- Evidencias:
- Resultado: NOT RUN

## W4 — Regresión y entrega
- Comandos typecheck/lint/test:
- Playwright dispositivos y resultados:
- Android físico (obligatorio para cerrar):
- Criterios A01-A12 (PASS/FAIL/NOT RUN):
- Riesgos residuales:
- Próximo paso y aprobación requerida:
- Resultado: NOT RUN

## C0 — Reconstrucción · 2026-11-20

- Base: `wip/mobile-chat-sheet` en `365d9fd0493969f8a990b45a4159d2fb17297e0e`. Rama de trabajo: `fix/mobile-chat-sheet-keyboard-gestures`. El diff contra `origin/main` contiene 14 commits, 10 archivos frontend y 9 documentos de auditoría. La cifra de dos commits del README describe el estado previo a la documentación.
- Build local: Vite en `http://127.0.0.1:5173/`, desde el SHA base con árbol limpio. Chromium 156.0.8078.79, viewport móvil emulado de 393 × 740 CSS px, touch CDP, tenant demo sintético. Compilación de producción local generada en `apps/web/dist`. URL, SHA, vista y DOM del incidente original pendientes.
- Mapa de estado: `App` posee `isMobile` (hasta 900 px inclusive), `mobileNav`, `mobileChat`, `chatDock` y un solo `useChat` ligado a `threads.activeId`. FAB → `toggleChat` → hoja móvil o dock. Hoja → `SidebarChat` → `MessageList` y `ChatInput`. `ChatPanel` también utiliza `ChatInput`. Seleccionar workspace actualiza estado de vista, independiente del hilo. En el rail existe otro acceso a chat, visible en escritorio plegado. El botón «Nuevo chat» de TopBar navega al chat completo y crea hilo. `CommandCenterView` y `TeamView` también ofrecen navegación al chat completo.
- Mapa CSS y overlays: FAB único `.chat-fab` fijo en z-index 70. Sheet fija a `bottom: 0`, z-index 90 y `contain: layout paint`, hermana de `AppShell`. Ajustes monta intencionalmente backdrop y menú en 95/96. El historial scrollea dentro de `.side-chat-body`, con `overscroll-behavior: contain`. El footer usa `env(safe-area-inset-bottom)`. El meta viewport tiene `width=device-width, initial-scale=1.0`. El navegador local carecía de service worker controlador.
- Mapa de eventos: la barra completa es slider y contiene los botones de acciones. Los listeners nativos de touch y pointer comparten `active` y la ruta de cancelación. El drag escribe `style.height` en el DOM y el commit de snap actualiza ref y estado. Resize, orientación y `visualViewport.resize` recalculan altura. La lógica de resize no aplica `offsetTop` ni desplaza el borde inferior. El porcentaje ARIA refleja el snap nominal aunque la altura quede limitada. ChatInput ya tiene adjuntos y dictado Web Speech cuando el navegador ofrece la API; ElevenLabs y Anam carecen de controles.
- FAB/Enviar: cerrado, un FAB. Al tocarlo, hoja abierta con cero FAB y `elementFromPoint` en el SVG de Enviar. En el chat completo, vacío y con conversación demo, el FAB permanece visible y el centro de Enviar recibe el hit en el viewport probado. El solapamiento comunicado por el propietario queda sin reproducir. Una build anterior, otro control y otra geometría de viewport siguen siendo hipótesis para el dispositivo original.
- Arrastre: deslizar 145 px hacia arriba cambia 26% → 45% (333 px). Cancelar una pulsación sin desplazamiento cambia 45% → 68%. El contador registra dos cancelaciones en el mismo gesto. El código envía la cancelación a la misma función que interpreta un toque y avanza el snap.
- Teclado simulado: al forzar `visualViewport.height = 380` y `offsetTop = 0`, enfocar el textarea y emitir resize, borde inferior visual 380 px, hoja 740 px, Enviar 719 px. El cálculo reduce la altura, mientras el anclaje fijo deja el compositor fuera del viewport visual simulado. Android físico y Gboard pendientes.
- Pruebas: instalación de dependencias existentes con lockfile congelado, sin cambios de manifiesto. `git diff --check origin/main...HEAD`, `pnpm --filter @agente/web typecheck` y `pnpm --filter @agente/web build` pasaron. Vite avisó sobre anotaciones Zod, un import dinámico/estático y un chunk superior a 500 kB. Medición local por CDP con touch realista y viewport visual simulado. Evidencia numérica arriba.
- Resultado: **BLOCKED** para avanzar según 08. El mapa y la línea base local están completos. Falta identificar o medir la build y el DOM del solapamiento original. C1–C6 quedan pendientes. C0 modifica únicamente este informe.

### Revisión del criterio de C0

El propietario confirmó que la captura original procedía de FreeBuff y autorizó usar el navegador local como referencia. C0 queda cerrado con la evidencia ya registrada. El incidente histórico queda sin verificar y la validación física sigue pendiente.

## C1 — Observabilidad

- Diagnóstico de Vite con `?sheetDebug=1`, exportable como JSON. Usa geometría, etiquetas HTML y contadores de eventos. Excluye texto de mensajes, URL, valores de campos e identificadores de sesión.
- Chromium 156 por CDP. El test de navegador pasó con y sin diagnóstico. El panel devolvió el SHA `b826a85` inyectado al iniciar Vite sobre la copia de trabajo C1, cero FAB con la hoja abierta, hit correcto y movimientos táctiles registrados. Pasaron typecheck y diff check.
- Repetición: iniciar Chromium headless con `--remote-debugging-port=9222`, iniciar `VITE_BUILD_SHA=$(git rev-parse HEAD) pnpm --filter @agente/web dev` y ejecutar `node apps/web/tests/mobile-sheet.mjs`. Para comprobar el diagnóstico, añadir `SHEET_EXPECTED_SHA=$(git rev-parse HEAD)` y `SHEET_TEST_URL=http://127.0.0.1:5173/?sheetDebug=1`.
- Resultado: PASS en navegador local.
