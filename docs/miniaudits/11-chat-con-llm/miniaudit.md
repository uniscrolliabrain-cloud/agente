# 11 — Chat con LLM

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump conversation.ts, prompt de tono, código real tras bloques 01-09

## Ontología

ConversationAgent, BuiltInAgent, Presenter, tools (browse_web, search_mail, read_mail_thread, delegate_task, create_briefing, remember_fact, prepare_whatsapp, create_goal, watch_page), urgentBlock.

## Estado real

Prompt con 8 reglas de tono. RAG como system message. urgentBlock de 3 líneas. delegateHint si el prompt parece complejo.

## Evidencia

Presenter no wireado. fullResponse directo al SSE. Historial limitado a 3 mensajes al RAG. Sin feedback durante slow. Sin timeout duro de primera respuesta.

## Huecos declarados

- Wire del Presenter.
- Timeout 2s para el fast.
- Feedback durante slow.
- Fallback visible.

## Huecos profundos (auditoría extendida)

1. **Prompt con 8 reglas de tono nunca se valida**: no hay test que verifique que el LLM respeta el tono. Solo el prompt.
2. **`urgentBlock` siempre inyecta "DELEGACION FORZADA"**: literal en el prompt aunque no aplique. Ruido.
3. **RAG inyectado al último mensaje del usuario**: contamina el mensaje. Debería ir como system.
4. **Historial limitado a 3 mensajes al RAG**: con conversaciones largas, pierde contexto.
5. **Sin "modo claro / oscuro" en el prompt**: no distingue cuando el usuario pide paso a paso vs respuesta directa.
6. **`Tools` sin límite de iteraciones**: `maxSteps: 6` hardcodeado. Un bucle puede agotar los 6 steps sin progreso.
7. **`browse_web` sin política de reintento**: si la primera URL falla, no intenta otra.
8. **`search_mail` sin límite de resultados configurables**: 20 hardcodeado.
9. **`delegate_task` sin visibilidad del estado**: el usuario delega pero no ve el progreso.
10. **`remember_fact` guarda sin deduplicar**: cada vez que el usuario dice algo, se escribe. Aunque sea lo mismo.
11. **Sin "cancelar desde el chat"**: el usuario no puede abortar la respuesta en curso.
12. **Sin "editar y reenviar"**: si la respuesta fue mala, no hay forma de iterar sin perder contexto.
13. **Sin "feedback implícito"**: si el usuario copia la respuesta, ¿fue útil? No se mide.
14. **Sin "chips de sugerencia" contextuales**: los chips son fijos (Resumen, Email, Documento). No se adaptan a la conversación.
15. **`prepare_whatsapp` sin verificar conversación previa**: puede sugerir escribir a alguien con quien ya se habló.
16. **Sin "resumen al cerrar el thread"**: cuando se cierra un thread, no hay summary persistido.
17. **`create_briefing` sin validar que el resumen no sea alucinación**: el LLM puede inventar.
18. **`watch_page` sin notificar al usuario del resultado**: crea monitor pero no avisa cuando dispara.
19. **Sin streaming token a token real**: el typewriter del frontend es simulado sobre el stream completo.
20. **Sin "message.edited" event**: si el usuario edita un mensaje, no hay evento en el bus.

## Interrelación

Puerta de entrada. Depende de 09 y 10.

## Riesgos

Prompt de tono se olvida. RAG mete ruido. Chat lento. Email malicioso se interpreta como instrucción.

## Tipo de fixes

Wire del Presenter. Timeout de 2s al fast. Feedback con SlowAuthor → ProgressEvent. Test de tono. Historial ampliado. Chips contextuales. Resumen al cerrar thread. Streaming real.
