# 11 — Chat con LLM

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump conversation.ts, model.ts, prompt de tono

## Ontología del área

Conceptos: `ConversationAgent`, `BuiltInAgent`, `Presenter`, `SystemEvent`,
herramientas de chat: `browse_web`, `search_mail`, `read_mail_thread`,
`delegate_task`, `create_briefing`, `remember_fact`, `prepare_whatsapp`,
`create_goal`, `watch_page`.

## Estado real del código

- Prompt con 8 reglas de tono (no dev, no emojis, no "Perfecto").
- RAG se inyecta como mensaje `system`.
- `urgentBlock` de 3 líneas si hay urgencias.
- `delegateHint` si el prompt parece complejo.

## Evidencia

- `Presenter` **no wireado**. El chat emite `fullResponse` sin pasar por
  Presenter. La UI no se beneficia de la prioridad de roles.
- Historial limitado: solo los últimos 3 mensajes de historial al RAG.
- No hay feedback durante slow.
- No hay timeout duro de primera respuesta.

## Huecos concretos

- Wire del Presenter.
- Timeout de 2s para el fast.
- Feedback durante slow.
- Fallback visible.

## Interrelación

Puerta de entrada al sistema. Depende de `09` (kernel), `10` (velocidades).

## Riesgos

- Prompt de tono se olvida.
- RAG mete ruido.
- Chat lento → usuario piensa caído.
- Email malicioso se interpreta como instrucción.

## Tipo de fixes

1. Wire del Presenter: esperar `presentTurn(ctx, turnId)` antes de emitir.
2. Timeout de 2s al fast; si no responde, emite "dame un momento".
3. Feedback de progreso: `SlowAuthor` → `ProgressEvent` → chat.
4. Test de tono: no "Perfecto", no "Capability", no "Kernel".
