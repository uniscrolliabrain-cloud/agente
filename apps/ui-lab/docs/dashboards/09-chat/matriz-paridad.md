# Matriz de paridad — Chat UX V2

Cada control real → control de la propuesta → handler → estado → prueba. «Aprobación»: D = solo diferencia visual/markup; F = diferencia funcional propuesta, requiere founder.

| # | Real | Propuesta | Handler | Estado | Prueba | Tipo |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Saludo `greetingFor(userName)` | `.cux-greeting` con mismo copy y hora | `ChatPanelUX` | Nombre vacío → saludo solo | QA portada (copy y lila) | D |
| 2 | Titular «¿En qué te ayudo hoy?» | mismo texto, 700/-0.045em | estático | — | QA portada | D |
| 3 | Chips por rol | mismos chips, mismos textos | `SuggestionChips` real + `setSeed` | rol sin chips → default | QA chips finanzas | D |
| 4 | Textarea Enter envía, Shift+Enter salto | idéntico + guarda IME | `submit` | vacío/solo adjunto | QA IME, portada | F (IME) |
| 5 | Adjuntar (`uploadFile`) | subida inyectada | `pickFile`/`upload` | uploading/ready/error | QA adjunto éxito/error | F (fixture) |
| 6 | Dictado `webkitSpeechRecognition` | idéntico, `aria-pressed` | `startVoice` | soportado/no soportado | QA dictado ambos | D |
| 7 | Chip «SOPs de Mi empresa» | mismo control, sin acción | ninguno | — | Inspección visual | D |
| 8 | Enviar (deshabilitado sin texto) | idéntico | `submit` | streaming → detener | QA enviar/streaming | D |
| 9 | Detener | idéntico | `onCancel` | cancela buffer | QA cancelación | D |
| 10 | Autoajuste de altura ≤120 px | idéntico (≤132 con el nuevo alto) | efecto `value` | — | Visual | D |
| 11 | Selector de rol (`/api/agent/roles`) | roles locales | `onChange` | sin roles → null | QA selector | F (fixture) |
| 12 | Lista tope 50 | idéntico | `visibleMessages` | — | Lectura + fixture larga | D |
| 13 | Typewriter real | mismo hook | `useTypewriter` | reduced motion | QA streaming | D |
| 14 | Scroll al fondo siempre | pinning si ya estaba abajo | `onScroll` + efecto | historial leído | QA scroll | F |
| 15 | Copiar + acciones | mismas acciones | `copy`, `onQuickAction` | clipboard bloqueado | QA copiar | D |
| 16 | Herramientas `<details>` | mismo comportamiento | estado real | running/error | QA herramientas | D |
| 17 | Timeline polling | fases fixture | — | vacío → null | QA timeline | F (fixture) |
| 18 | Texto plano | markdown seguro | `Markdown` | enlaces, tablas | QA markdown | F |
| 19 | Avatar `IA` | mismo texto, círculo 26 px | — | — | Visual | D |
| 20 | `onResolveView` una vez por mensaje | misma lógica | efecto con clave hilo:id | sin callback → no-op | Revisión de código | D |
| 21 | Portada/conversación remontan input | un solo nodo + FLIP | `useLayoutEffect` | reduced motion → sin animación | QA FLIP | F |
| 22 | Sin superficie de error | **sin superficie** (paridad) | — | cancelación | QA cancelación | Deuda |

## Diferencias funcionales propuestas (no aplicadas a producción)

1. **Markdown**: hoy el asistente pinta texto plano. La propuesta interpreta markdown básico sin `dangerouslySetInnerHTML`; enlaces solo `http(s)`.
2. **IME**: Enter durante composición no envía. Enter normal sigue enviando.
3. **Scroll**: se abandona el autoscroll ciego; se pega al fondo solo si el usuario está cerca del final o acaba de enviar.
4. **Compositor estable**: mismo nodo y por tanto mismo borrador/foco entre fases; el foco se libera únicamente por el `disabled` de streaming, igual que en `main`.
5. **`aria`**: `aria-label` en textarea, adjuntar, dictar, enviar/detener; `aria-pressed` en dictado; `role="region"` con etiqueta en tablas con scroll.

## Contratos conservados

`ChatState` (`roleId`, `setRoleId`, `messages`, `streaming`, `streamBuf`, `tools`, `error`, `send`, `cancel`, `threadId`), `ChatMessage`, `ChatAttachment`, `ToolCall`, `ChatInput` (`seed`, `onSeedConsumed`, `onSend`, `onCancel`, `streaming`), `onResolveView(intent, messageId)`, `userName`. La fixture implementa la misma forma que `useChat` para que el panel pueda sustituirse sin tocar el consumidor.

## Comportamientos fuera de alcance detectados (no corregidos en producción)

- `chat.error` no se pinta en la vista principal: cancelar o fallar no muestra mensaje visual.
- El chip SOP no tiene handler.
- El dictado sin soporte no se anuncia como no disponible; pulsarlo no hace nada (comportamiento real conservado).
- `AttachmentPreview` existe pero el mensaje usuario no muestra su adjunto ni lo previsualiza (`preview` fijo a `null`).
