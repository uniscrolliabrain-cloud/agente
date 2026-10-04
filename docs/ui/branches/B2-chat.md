# B2 - Chat typewriter + tool calls agrupados

> **UI_CAMPAIGN_B2_CHAT_V1** · Última actualización: 2026-10-03.
> Estado: HECHO.

## Objetivo

Chat con typewriter adaptativo (40-600 chars/s según atraso) y tool calls agrupados por turno en un `<details>`.

## Ficheros nuevos (3)

- `apps/web/src/lib/toolsReducer.ts`.
- `apps/web/src/components/ToolCallsGroup.tsx`.
- `tests/tools-reducer.test.ts`.

## Ficheros modificados (6)

- `apps/web/src/hooks/useTypewriter.ts` (REWRITE).
- `apps/web/src/hooks/useChat.ts`.
- `apps/web/src/types/api.ts`.
- `apps/web/src/components/MessageList.tsx`.
- `apps/web/src/components/MessageBubble.tsx`.
- `apps/web/src/components/ChatPanel.tsx`.

## Decisiones clave

- D04: API nueva de `useTypewriter` (`target`, `streamDone`).
- D05: `ChatMessage.toolCall` → `ChatMessage.tools[]`.

## Verificación

- `types/api.ts` tiene `B2_TOOLS_V1`.
- `useTypewriter.ts` tiene `B2_TYPEWRITER_V2`.
- `useChat.ts` tiene `WIRE_USECHAT_TOOLS_V1`.
- `MessageList.tsx` tiene `WIRE_MESSAGELIST_TYPING_V1`.
- `MessageBubble.tsx` tiene `WIRE_MESSAGEBUBBLE_TOOLS_V1`.
- `ChatPanel.tsx` tiene `WIRE_CHATPANEL_NO_DUP_V1`.

**Fin de B2.**