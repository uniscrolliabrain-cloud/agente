# Handoff — 11 chat con LLM

## Estado actual

- **Auditoría:** miniaudit.md (estatus: audited-deep)
- **Roadmap:** roadmap.md (estatus: planned)
- **Fixes:** fixes.md (estatus: placeholder, 50 fixes pendientes)

## Problema

`ConversationAgent` y `Presenter` son los componentes de chat. Actualmente:

- `Presenter` no está wireado al `ConversationAgent`.
- `fullResponse` envía directamente al SSE sin control de tiempo.
- Historial limitado a 3 mensajes para RAG (pierde contexto en conversaciones largas).
- Sin feedback visible durante la espera de `slow`.
- Sin timeout duro para la primera respuesta del `fast`.

## Archivos relevantes

| Archivo | Rol |
|---|---|
| `apps/web/src/conversation.ts` | `ConversationAgent`, `BuiltInAgent`, `Presenter`. Prompt con 8 reglas de tono. |
| `apps/web/src/presenter.ts` | `Presenter`. Debe wirearse al agente. |
| `apps/web/src/kernel/conversation.ts` | `runWithModelFallback`, `beginTurn()`, `closeTurn()`. |
| `apps/web/src/kernel/presenter.ts` | `Presenter` wireado (sensible a cambios). |
| `apps/web/src/llm/prompt.ts` | Prompt con 8 reglas de tono. |
| `apps/web/src/llm/prompt.md` | Prompt markdown (fuente de la regla). |
| `apps/web/src/hooks/useChat.ts` | Hook del chat. Historial limitado a 3 mensajes. |
| `apps/web/src/components/` | Componentes UI del chat. Chips y historial. |

## Fixes pendientes (checklist)

1. **Wirear `Presenter` al `ConversationAgent`**
   - `ConversationAgent` debe recibir un `Presenter` inyectado.
   - El `Presenter` decide qué texto enviar al SSE.

2. **Timeout de 2s para la primera respuesta del fast**
   - `runWithModelFallback()` debe tener un timeout configurable.
   - Si el fast no responde en 2s, avisar al usuario.

3. **Expandir historial de RAG**
   - `useChat.ts` usa 3 mensajes. Ajustar a 5-10 para mantener contexto.
   - Mantener el historial limitado pero apropiado.

4. **Feedback durante slow**
   - `conversation.ts` debe notificar `ProgressEvent` mientras se espera `slow`.
   - `Presenter` debe mostrar progreso al usuario.

5. **Modo claro/oscuro en el prompt**
   - Agregar detección de "paso a paso" vs "respuesta directa" en el prompt.
   - `ConversationAgent` decide el estilo basado en la petición.

6. **Validar prompt con test**
   - `prompt.ts` tiene 8 reglas de tono. Agregar test que verifique que no se violan.

7. **Simular streaming real**
   - El typewriter del frontend es simulado sobre el stream completo.
   - Implementar streaming token a token real (si el backend lo soporta).

8. **Message.edited event**
   - En el bus de eventos (`apps/web/src/bus/event-bus.ts`), emitir `message.edited` cuando el usuario edita un mensaje.
   - El chat debe refrescar el mensaje.

9. **Resumen al cerrar thread**
   - Cuando se cierra un thread, guardar un resumen del hilo.
   - Verificar que el resumen se persista en la DB.

10. **Test de primer mensaje <2s**
   - Verificar que el primer mensaje del chat responde en menos de 2 segundos.
   - Mockear el modelo y medir el tiempo.

## Cómo verificar el cierre

- `pnpm test` pasa tests de `conversation.ts` y `prompt.ts`.
- `Presenter` decide texto del SSE.
- Timeout de 2s aplicado a `fast`.
- Feedback visible durante `slow`.
- Historial ampliado a 5-10 mensajes.

## Dependencias

- **Depende de:** 09, 10 (fast-slow-llm)
- **Dependen de esta:** 12 (contexto/memoria), 24 (business OS goals)
- **Archivos compartidos:** `conversation.ts`

## Notas del audit

- El prompt de tono se olvida y nunca se valida.
- RAG inyectado al mensaje hace ruido al LLM.
- Sin "cambio dinámico de modelo", el usuario no puede dehydratar el chat.
- `Presenter` no wireado parece ser un bug crítico de integración.