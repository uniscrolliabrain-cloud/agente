# Auditoría LLM → Workspace

> v1 · 2026-10-27 · Estado: current

## Propósito

Auditoría de la relación entre el modelo LLM y el workspace en OpenMuse. Cubre cómo el LLM accede a los datos del workspace, qué herramientas puede usar, y cómo se auditan sus acciones.

## Flujo LLM → Workspace

1. El usuario envía un mensaje al chat.
2. `ConversationAgent` recibe el mensaje y lee el contexto del workspace.
3. El LLM genera una respuesta con posibles tool calls.
4. Las herramientas se ejecutan vía `WorkspaceService` (Google, WhatsApp, etc.).
5. Los resultados se vuelven al LLM para generar la respuesta final.
6. Todo el turno se registra en el kernel (Thought, Turn, AttentionVector).

## Herramientas disponibles para el LLM

| Categoría | Herramientas |
|-----------|-------------|
| Email | `prepare_email`, `email.send` |
| Calendar | `prepare_event`, `calendar.create`, `calendar.update`, `calendar.delete` |
| Drive | `drive.trash`, `drive.rename`, `readDriveFile` |
| WhatsApp | Webhook entrante, drafts para enviar |
| Archivos | `import_pdf`, `inspect_pdf`, `fill_pdf`, `save_artifact` |
| Memoria | `recall_memory`, `llm_generate` |
| Negocio | `query_business`, `transition_entity` |

## Aprobaciones

Toda acción externa requiere aprobación humana a través de `ActionService`. El LLM prepara la propuesta; el humano aprueba o rechaza.

## Auditoría

Cada transición de estado de una acción se registra en `action-audit` con:
- `actionId`, `taskId`, `actorId`, `kind`, `detail`, `status`, `hash`, `createdAt`.

## Variables de entorno relacionadas

| Variable | Descripción |
|----------|-------------|
| `FAST_LLM_API_KEY` | API key para modelo fast. |
| `GEMINI_API_KEY` / `OPENROUTER_API_KEY` | Atajos para proveedores LLM. |
| `LLM_FIRST_BYTE_MS` | Timeout primer byte. |
| `LLM_GLOBAL_MS` | Timeout global. |
