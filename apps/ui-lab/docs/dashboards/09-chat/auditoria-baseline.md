# C00 · Auditoría y baseline — Chat UX V2

**Fecha:** 2026-11-24 · **Rama:** `feat/ui-lab-chat-ux-v2` · **Base:** `6e1512c968cd983ac32ea5e839c96cfbd0da881e` (snapshot de componentes reales: `d7260009`)

## 1. Alcance y rutas activas

| Elemento | Ruta | Estado |
| --- | --- | --- |
| Vista Chat del shell | `apps/web/src/App.tsx` (`view === "chat"`) | Activa, importa `ChatPanel` |
| Panel | `apps/web/src/components/ChatPanel.tsx` | Activo |
| Compositor | `apps/web/src/components/ChatInput.tsx` | Activo |
| Lista / burbuja / herramientas | `MessageList.tsx`, `MessageBubble.tsx`, `ToolCallsGroup.tsx`, `AttachmentPreview.tsx` | Activos |
| Chips y roles | `SuggestionChips.tsx`, `RoleSelector.tsx` | Activos |
| Cognición | `chat/CognitionTimeline.tsx`, `chat/ThinkingSpiral.tsx` | Activos |
| Estado del chat | `hooks/useChat.ts`, `hooks/useThreads.ts` | Activos |
| Estilos | `apps/web/src/index.css` (bloque `V2 WARM BEIGE`) | Activo |
| Preview aislada | `apps/ui-lab/src/chat-ux-v2/` + `src/registry.tsx` | Nueva, no productiva |

Los siete componentes principales del snapshot son **idénticos** al código activo (verificado con `diff -q`): el snapshot no estaba desfasado. El chat transversal (`04-chat-boton-transversal`), el menú lateral y el shell **no se han tocado**.

## 2. Baseline visual

- Captura guardada: `capturas/baseline-original-chat-1440x900.png` (preview `chat` original de UI Lab, 1440×900).
- La captura del founder (1366×599) **no está en el repositorio**. Se documenta como referencia externa, no como archivo verificable.
- El control de texto/voz/vídeo y el aviso «próximamente» de esa captura **no existen** en `main`: `ChatInput` solo contiene adjunto, dictado y el chip «SOPs de Mi empresa» (sin handler). No se reconstruyen capacidades ausentes.

## 3. Matriz componente → función → problema visual → evidencia → riesgo → decisión

| Componente | Función real | Problema visual observado | Evidencia | Riesgo | Decisión |
| --- | --- | --- | --- | --- | --- |
| `ChatPanel` portada | Saludo, titular, compositor, chips | Bloque apoyado arriba, con ~520 px muertos en 1440×900; el compositor no tiene relación espacial con la conversación | baseline 1440×900 | Bajo | Centrado vertical contenido y compositor estable que se desplaza con FLIP |
| `ChatPanel` conversación | Rol, lista, timeline, input | El compositor se remonta al cambiar de fase; sin continuidad | lectura de código | Medio (foco/borrador) | Un único compositor montado en ambas fases |
| `ChatInput` | Enviar, cancelar, adjuntar, dictar, chip SOP | Controles de 32 px, radios mezclados, foco poco visible, chip de adjunto genérico | CSS `1843-1849` | Bajo | 40 px, radios 12-13, foco violeta 2 px, chip con estados |
| `SuggestionChips` | Rellenar borrador | Chips 34 px con borde fuerte y hover plano | CSS `1687-1697` | Bajo | 34 px, superficie blanca cálida, hover lila contenido |
| `MessageBubble` | Texto, copiar, acciones | Texto plano sin jerarquía, acciones con estilos inline de 26 px | `MessageBubble.tsx` | Medio | Markdown seguro + acciones coherentes, visibles en hover/foco |
| `MessageList` | Streaming, scroll | Autoscroll fuerza el fondo incluso leyendo historial | `MessageList.tsx` | Medio (pérdida de lectura) | Pega solo si ya estaba abajo o llega mensaje propio |
| `ToolCallsGroup` | Pasos | Sin estilos propios en `index.css` | búsqueda `.steps` | Bajo | Píldora y lista con estados |
| `CognitionTimeline` | Análisis recientes | `<details>` nativo sin jerarquía | componente real | Bajo | Summary con chevron, panel contenido |
| `ThinkingSpiral` | Actividad | Correcto; gira 2.4 s | CSS real | Bajo | Se conserva; 2.6 s y color token |
| `RoleSelector` | Rol activo | `<select>` y textos inline, sin label asociado | componente real | Bajo | Select compacto con label asociado |
| Timeline / error | `chat.error` | **`ChatPanel` no pinta `chat.error`** en la vista principal | lectura de `ChatPanel.tsx` | Funcional, fuera de alcance | Se conserva la ausencia y se documenta; no se inventa superficie |

## 4. Discrepancias founder / main

1. La captura muestra tres modos (texto, voz, vídeo) y «próximamente»; `main` solo tiene adjunto, dictado y chip SOP. **No se añaden**.
2. El chip SOP no tiene handler en `main`; se conserva como control existente sin acción (no se convierte en botón ficticio nuevo).
3. `RoleSelector` consulta `/api/agent/roles`; en la fixture los roles son locales y no hay red.
4. `CognitionTimeline` hace polling; en la fixture muestra fases sintéticas y no consulta `/api/cognition-v2/journey`.
5. `MessageBubble` no renderiza markdown; la propuesta sí, como mejora de lectura solicitada. Requiere aprobación (ver `matriz-paridad.md`).

## 5. Qué no debe cambiar

Composición general, saludo y copy, chips por rol, orden rol → conversación → timeline → compositor, envío con Enter, cancelación, adjunto, dictado, chip SOP, límite de 50 mensajes, `useTypewriter`, contratos de `ChatPanel`/`ChatInput`, ausencia de llamadas reales en la fixture, shell, menú lateral y chat transversal.

## 6. Medidas de partida y resultado

| Medida | Baseline `main` | Propuesta V2 |
| --- | --- | --- |
| Titular | 48 px / 800 / -0.03em | 48 px / 700 / -0.045em (30 px móvil) |
| Compositor | ancho 680, alto ≈133, radio 22 | ancho 680, alto ≈150, radio 22 |
| Controles | 32 px circulares | 40 px, radio 12-13 |
| Mensajes | 14.5 px / 1.65 | 14.8 px / 1.7, markdown jerárquico |
| Entrada | sin animación de portada | 500 ms, cascada 55 ms, 9 px |
| Fase | remonta compositor | mismo nodo + FLIP medido 413 → 656 px en 150 ms |
| Contenedor | cortes por viewport | container queries 680 / 520 / 400 |
| Fuente | Google Fonts (red) | Manrope woff2 local (24.5 KB) |
