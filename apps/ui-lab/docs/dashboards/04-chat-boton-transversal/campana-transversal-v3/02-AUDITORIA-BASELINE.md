# 02 · Auditoría del baseline

## Qué se recuperó y de dónde

| Pieza | Origen | Estado |
| --- | --- | --- |
| `MobileChatSheet.tsx` / `.css` | `release/landing-legal-20261122` → `campana-transversal-v3/baseline/` | Completo, con el gesto original (pointer capture, mínimo medido, `visualViewport`) |
| `MobileChatCall.tsx` | baseline | Completo: voz/vídeo, PiP, ideas por tiempo, informe, modo compacto |
| `ChatInput.tsx` | baseline | Completo: dictado, nota de voz, menú, adjuntos, llamadas |
| `MobileVoiceButton.tsx` | baseline | Completo: 420 ms para distinguir pulso de mantenido |
| `MobileChatActions.tsx` | baseline | 9 acciones originales; en V3 son 10 (ver abajo) |
| `MobileAudioNote.tsx` | baseline | Completo: reproducir, copiar, descargar |
| `MessageList.tsx` | baseline | Referencia de typewriter y tope de 50 mensajes |
| `SidebarChat.tsx` | baseline | Referencia del hilo, notas, informes y foco de retorno |
| `DesktopChatDock.tsx` | `legacy/release--landing-legal-20261122/` | Completo: cuatro anchos, arrastre y snap |
| CSS del dock y del shell | `apps/web/src/index.css` (mismo ref, líneas 2341-2370 y 4089-4111) | Recuperado por lectura del ref, no estaba copiado en `baseline/` |
| `App.tsx`, `AppShell.tsx`, `SidebarV2.tsx`, `usePanel.ts`, `ChatPanel.tsx` | `componentes-reales/` | Referencia del cableado (`data-chat`, `--desktop-chat-width`, rail de 84 px) |

SHA del ref consultado: `91576dc6098b4b350b6d43b4c82078655052f59f` (`release/landing-legal-20261122`).

## Huecos encontrados en el material preparado

1. **`baseline/wiring/` llegó a mitad de campaña.** Al arrancar no existía; lo publicó el chat paralelo (`785d5d1d`…`7bc2b79d`) con `App.tsx`, `AppShell.tsx` y `SidebarV2.tsx`. Se verificó contra el ref: el cableado coincide (`data-chat`, `DesktopChatDock` dentro de `shell__left`, una sola columna para rail y chat).
2. **`DesktopChatDock.tsx` llegó a `baseline/` en `3ae7f612`.** Es idéntico al de `legacy/` (`diff` sin salida), así que el port no cambió.
3. **El CSS del dock de escritorio no estaba copiado.** Se localizó en `apps/web/src/index.css` del ref; de ahí salen `--desktop-chat-width` (84 px de rail + ancho del panel), `data-chat` y el rail de 84 px. El laboratorio usa un rail de 76 px porque no replica el sidebar real de producción; la anchura del panel y su snap sí son idénticos.
4. **Dependencias de backend**: `uploadFile`, `types/api`, `toolsReducer`, `useTypewriter`, `MessageBubble`, `ThinkingSpiral`. Ninguna se importa: la V3 usa un adaptador demo local (`chat-data.ts`) con respuestas, ideas y actas sintéticas.
5. **La fotografía de LAIA llegó a mitad de campaña.** Al arrancar, `assets/` solo tenía el `README.md`. Mientras se construía el módulo apareció `assets/file_00000000bad881f4a18a32b6c6edc2c8.png` (1254 × 1254, `0aa55fbe…`), el PNG con nombre numérico al que se refería la campaña. Se descartó la copia provisional que se había tomado de `public/landing/laia.png` (misma modelo y formato, pero **otra fotografía**, `ab3fd712…`) y el WebP se regeneró desde el archivo del founder. No se generó ninguna persona ni se alteró el rostro.
6. **El chat simplificado de `main` no se usó** como referencia funcional: la geometría y los gestos vienen del ref histórico, como pedía la campaña.

## Comportamiento original que se conserva

- Cuatro anchos de escritorio **312 / 390 / 510 / 660** con corrección al 58 % del viewport.
- Cuatro posiciones móviles **26 / 45 / 68 / 100 %** con mínimo medido del tirador + compositor real (no un número fijo).
- Arrastre horizontal y vertical con `setPointerCapture`, sin `setState` durante el gesto.
- Snap a la posición más próxima; toque sin desplazamiento cicla de altura; `Escape`/cancelación no deja estados a medias.
- Lee `visualViewport` para el teclado virtual y calcula el hueco inferior.
- El compositor queda siempre accesible; al plegar del todo desaparece el cuerpo, no una franja de mensaje cortado.
- Nada de esto se reimplementó "a ojo": las funciones `widths()`, `visiblePx()`, `minVisible()` y `nearestSnap()` son las del baseline.
