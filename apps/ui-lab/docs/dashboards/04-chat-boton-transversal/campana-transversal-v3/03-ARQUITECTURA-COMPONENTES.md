# 03 · Arquitectura de componentes

## Módulo

`apps/ui-lab/src/chat-transversal-v3/` — aislado, sin imports de producción ni de otros workspaces salvo `BrandMark`.

| Archivo | Responsabilidad |
| --- | --- |
| `ChatTransversalV3.tsx` | Raíz: rail de navegación demo, workspace de contexto, FAB, conmutación dock/hoja por `matchMedia("(max-width: 900px)")`, estado del hilo, borrador persistente, notas, informes, ajustes, `Escape` |
| `ChatDock.tsx` | Dock izquierdo de escritorio: `widths()`, arrastre del tirador, snap, ciclo por clic, teclado, variable `--ctv-dock-width` en `.ctv` |
| `ChatSheet.tsx` | Hoja inferior móvil: `SNAP_PERCENTS`, `minVisible()`, `visiblePx()`, `nearestSnap()`, `pointer capture`, `visualViewport`, clase `is-dragging` |
| `ChatPanel.tsx` | Cabecera (solo dock), estado vacío con sugerencias en hairlines, hilo, notas de voz, enlaces a informes, compositor |
| `ChatComposer.tsx` | Textarea autoajustable, «+», micrófono (dictado / nota con `MediaRecorder`), llamada, videollamada, envío/detener, adjunto local |
| `ChatActions.tsx` | `<dialog>` nativo con las diez acciones, agrupadas en Capturar y Trabajo; formulario de detalle para las de empresa |
| `ChatCall.tsx` | Voz y vídeo: temporizador, ideas progresivas, cámara local con limpieza de tracks, informe con estado vacío y completo, modo compacto |
| `chat-data.ts` | Tipos, sugerencias, respuestas sintéticas, ideas, siguiente paso, acciones, `formatDuration`, `uid`, retrato importado |
| `chat-v3.css` | Capa visual completa bajo `.ctv`, diálogos incluidos, responsive, reduced motion, encaje con la insignia de UI Lab |
| `assets/laia-videollamada.webp` | Retrato optimizado 900 × 900 (86,9 kB) |

## Estado

El hilo, el borrador, las notas y los informes viven en la raíz. Por eso cambiar de modalidad (texto → voz → vídeo → texto) no pierde nada, igual que en la implementación original, donde `SidebarChat` conservaba el hilo al montarse en dock o en hoja.

- `messages`, `streaming`, `streamBuf`: hilo y respuesta simulada con typewriter (3 caracteres cada 16 ms, 620 ms de latencia).
- `draft`: `localStorage["agntia_chat_transversal_v3_draft"]`, tolerante a almacenamiento bloqueado.
- `notes`: `Blob` locales con `URL.createObjectURL`, revocados al desmontar.
- `reports`: actas de demostración; el enlace del hilo reabre el acta.
- `call`: modalidad y acta opcional. La hoja avisa del modo compacto mediante `onSnapChange`.

## Adaptadores demo

`chat-data.ts` sustituye a la API: `replyFor()` elige respuesta por intención y, si no hay coincidencia, responde citando el mensaje. `CALL_IDEAS` aporta una idea cada seis segundos. `NEXT_STEP` solo aparece en el acta si hay puntos. No hay `fetch` a servicios externos en todo el módulo.

## Registro

`apps/ui-lab/src/registry.tsx` añade `chat-transversal-v3` («Chat transversal V3», categoría Canales, estado `demo`). No sustituye `chat` ni ninguna vista existente.

## Encaje en UI Lab

La insignia de UI Lab mide 26 px y empujaba la hoja fuera del viewport. Se replica el patrón ya usado por el launcher: `.lab-embed:has(.ctv)` pasa a columna de `100dvh` y `.ctv` crece con `flex: 1 1 auto`; `body:has(.ctv)` bloquea el scroll del documento. La hoja sigue anclada al borde inferior real.
