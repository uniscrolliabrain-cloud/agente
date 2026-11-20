# Registro de ejecución Codex

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

## C2 — FAB y Enviar

- `App.tsx` deriva montaje de la hoja, disponibilidad del FAB y estado abierto desde la misma condición de viewport y apertura. Se corrigió además la etiqueta de FAB en escritorio cuando queda un estado móvil anterior.
- T01/T02/T15 pasaron en Chromium 156/CDP a 393 × 740. FAB visible antes y después de cerrar, ausente con hoja abierta, hit correcto y un toque produjo un mensaje demo. La segunda apertura recreó una sola hoja.
- Pasaron typecheck y diff check. Se corrigió el assert de ausencia del diagnóstico para reflejar el `null` que devuelve el DOM. El incidente anterior de FreeBuff permanece sin verificar.

## C3 — Gestos y alturas

- `MobileChatSheet.tsx/.css`: Pointer Events con captura en el grip, umbral por desplazamiento del dedo, cancelación al snap anterior, tap que avanza y teclas Home/End. Grip separado de los botones. ARIA informa el porcentaje de altura calculado. Se reutilizan los snaps, la escritura DOM y el scroll independiente del historial.
- Chromium/CDP: subida a 45%, cancelación conserva 45%, tap a 68%, End a 100% y arrastre de bajada a 45%. Cierre táctil y reapertura al snap inicial pasan. Pasaron typecheck y diff check. Pruebas de historial largo, rotación y accesibilidad física se mantienen para regresión/handoff.

## C4 — Teclado y viewport

- `MobileChatSheet.tsx/.css`: compensación única mediante VisualViewport. Ancla el borde inferior en height + offsetTop y toma en cuenta el desplazamiento horizontal. Escucha resize y scroll visuales, resize de ventana y cambios de tamaño de barra y footer. Conserva el índice del snap y el padding de safe area existente.
- Chromium/CDP: viewport visual simulado de 380 px con offset de 24 px. En los cuatro niveles, borde inferior de hoja en 404 px, textarea y Enviar dentro del área visual. Al restaurar los 740 px, recupera el snap 45%. Pasaron typecheck, diff check y regresión del navegador.
- T06/T07/T08 con teclado Gboard, rotación y safe areas en Android físico: NO VERIFICADOS.

## C5 — Compositor multimodal

- `ChatInput.tsx` y `index.css`: controles compartidos de voz ElevenLabs, dictado, vídeo Anam y Enviar/Detener; botones de 44 px, etiquetas y estado visible. ElevenLabs y Anam quedan como stubs deshabilitados. Se conserva el dictado Web Speech ya existente cuando hay API. Se inicia por interacción explícita, escribe en la selección y el texto permanece editable. Se informa de falta de API o error de reconocimiento.
- Chromium/CDP: controles visibles y de 44 px en hoja, dock de escritorio y chat completo. Ambos stubs están deshabilitados. Sigue pasando el envío de un único mensaje y la geometría con viewport simulado. Typecheck y diff check pasaron.
- Voz y vídeo sin integraciones ni credenciales. Reconocimiento con micro real, lector de pantalla y teclado físico de Android pendientes.

## C6 — Regresión y entrega

- Build de producción en `apps/web/dist`, probada en `http://127.0.0.1:4173/` en Chromium 156. Se dejó abierta la vista demo del dock en Chrome compartido. Recargar la pestaña para cargar el último bundle. La opción `?sheetDebug=1` se probó también en producción y el panel no aparece. La instrumentación temporal `window.__sheetDebug` ya fue eliminada en C1. Se conserva el panel optativo de desarrollo.
- `App.tsx` restaura el foco del FAB al cerrar la hoja. `MobileChatSheet.tsx` lleva el foco al grip sin abrir el teclado. La suite Playwright verifica ambos movimientos de foco y reduced motion. Los scripts CDP y Playwright cierran los contextos que crean.
- `useChat.ts`: Playwright reprodujo que al crear otro hilo durante una respuesta el historial del hilo anterior reaparecía en el nuevo. El stream seguía publicando estado después del cambio. Se cancela al salir del hilo y sus callbacks dejan de actualizar la superficie. `ChatPanel.tsx` y `SidebarChat.tsx` pasan al compositor el estado de carga del hilo para desactivar Enviar temporalmente sin borrar el borrador.
- Pasó `pnpm test`: 874 de 900 pruebas pasaron, 0 fallaron, 21 omitidas y 5 marcadas TODO.
- Pasaron `pnpm --filter @agente/web typecheck`, `pnpm --filter @agente/web build` y `git diff --check`. `pnpm lint` falla con 1.810 errores, 505 avisos y 133 infos, cifras idénticas a la base `365d9fd` comprobada con el mismo Biome. El lint de los archivos nuevos de diagnóstico y pruebas pasa.
- Pasaron `node apps/web/tests/mobile-sheet.mjs` y `node apps/web/tests/mobile-sheet-playwright.mjs` sobre la build de producción recién compilada, con `SHEET_TEST_URL` apuntando al preview. Playwright se tomó de la instalación del entorno mediante `SHEET_PLAYWRIGHT_MODULE` sin modificar dependencias. CDP usa Chromium en `127.0.0.1:9222`.
- Cambios por archivo: `App.tsx` unifica visibilidad y foco. `MobileChatSheet.tsx/.css` aíslan eventos, ajustan snaps y respetan VisualViewport. `ChatInput.tsx` comparte los controles y conserva dictado/adjuntos/envío. `index.css` dimensiona controles y respeta movimiento reducido. `MobileSheetDiagnostics.tsx` y `vite-env.d.ts` soportan el diagnóstico de desarrollo. `apps/web/tests/mobile-sheet*.mjs` cubren la regresión de navegador. `08-CAMPAIGNS-AND-HANDOFF.md` incorpora el criterio acordado con el propietario.

| Casos | Evidencia y resultado |
| --- | --- |
| A01/A02 · T01/T02 | PASS en Chromium/CDP. FAB ausente con hoja abierta, hit sobre Enviar y un solo mensaje por toque. Incidente original de FreeBuff sin verificar. |
| A03/A04 · T03/T04 | PASS en Chromium/CDP para cuatro alturas, arrastre en ambos sentidos, tap y cancelación. Ajustes conserva altura. Maximizar accede al chat completo y cierra la hoja. |
| A05 · T05 | PASS en Playwright con más de 30 mensajes y texto largo. El historial cambia su scrollTop sin alterar altura. |
| A06/A07/A08 · T06/T07/T08 | PASS para geometría con VisualViewport simulado y viewports de 320 × 568 y 740 × 393. Gboard, zoom, rotación y safe areas en Android físico NO VERIFICADOS. |
| A09 · T09 | PASS en Playwright. El contenido permanece al cambiar el workspace con hoja abierta. |
| A10 · T10 | PASS para streaming demo, cancelación, cambio de hilo durante streaming, fallo de red simulado, reintento y mensaje largo. |
| A11 · T11/T13 | PASS para controles de dock y chat completo, foco de apertura/cierre, teclado en grip y movimiento reducido. Lector de pantalla real pendiente. |
| A12 · T15 | PASS. Al cerrar y reabrir vuelve al primer snap. |
| M01/M02/M03 · T12/T14 | PASS en Chromium para controles y etiquetas en las tres superficies y geometría simulada. Los stubs están deshabilitados y el arranque no solicitó captura ni media. Verificación física pendiente. |
| M04/M05/M06 | PASS para inserción editable en selección con Web Speech simulado, sin autoenvío, cancelar, áreas de 44 px, teclado y reduced motion. Motor de dictado y lector reales pendientes. |
| M07 | No se añadieron llamadas de proveedor ni cambios de autenticación, persistencia o backend. La prueba de navegador usa tenant demo. |

### Verificación en Android físico

1. Servir la build estática incluida en el ZIP desde un equipo en la misma red que el teléfono. Desde el directorio descomprimido, ejecutar `python3 -m http.server 4173` y abrir en Chrome la dirección IP local del equipo en el puerto 4173. Verificar `BUILD-SHA.txt` en el ZIP.
2. Entrar al tenant demo, abrir Workspaces y abrir Chat. Confirmar que desaparece el FAB. Enviar una frase de prueba con un solo toque.
3. Arrastrar el grip en ambos sentidos. En cada nivel abrir Gboard, escribir y comprobar que el cursor, los controles y Enviar quedan por encima del teclado. Cerrar el teclado con Atrás y comprobar que recupera el nivel anterior.
4. Repetir en horizontal y con las variantes de navegación del sistema. Cambiar de workspace con la hoja abierta y comprobar el historial. Cerrar y reabrir, y verificar el snap inicial.
5. Registrar modelo, versión de Chrome y Gboard, navegación del sistema y SHA. Si algo falla, anotar orientación, nivel y qué control falla. El modo de desarrollo permite copiar métricas con `?sheetDebug=1`.

ElevenLabs y Anam requieren diseño de sesión, autorización por tenant, credenciales del lado servidor y gestión de permisos y tracks al conectar. El dictado existente depende de Web Speech y queda pendiente de validación con micrófono real. La aprobación de Android y cualquier merge o despliegue quedan a cargo del propietario. **Sin merge a main, sin despliegue.**
