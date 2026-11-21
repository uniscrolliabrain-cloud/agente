# Arquitectura transversal: puntos de reconciliación

## Cadena actual y conflicto principal
- `apps/server/src/engine/conversation.ts`: cuando `cognitionV2.enabledForRequest()` se cumple, `cognitionV2.chat(owner,input)` toma control antes del flujo legacy. El flujo legacy gestiona persona, memoria, herramientas y contexto propios.
- `apps/server/src/engine/cognition/v2/runtime.ts`: prompt fast actual fijo «Eres LAIA», filtra mensajes a user/assistant, pasa `state:{}`, `tools:[]`, `context:[]`; el canal de voz no puede depender de `state.voice` ni `personaId` sin introducir un contrato autorizado nuevo.
- `apps/server/src/engine/cognition/v2/provider.ts`: proveedor fast/slow CopilotKit/AI SDK; `maxSteps:1`, herramientas deshabilitadas para V2. No añadir un LLM paralelo en `voice/llm.ts` como vía alternativa de política.
- `apps/server/src/engine/cognition/v2/inference.ts`: fast lane con cupo/timeout compartido; crear perfil realtime medible, con admisión, límites y abort, sin saltar cuotas.
- `apps/server/src/engine/cognition/v2/context.ts`: snapshots autorizados, entrega y ACK duradero de servidor; NO equivalen a entrega al navegador o reproducción TTS.
- `apps/web/src/hooks/useChat.ts` y `apps/web/src/api/chat.ts`: identidad de thread, stream AG-UI, auth y persistencia; son el contrato base de todos los canales.
- `apps/web/src/components/ChatInput.tsx`: SpeechRecognition del navegador es dictado, no canal bidireccional realtime.
- `apps/server/src/voice/{agents,harness,llm,providers,routes,sessions,snapshot}.ts` en rama avatar: scaffold con perfiles y sesiones, endpoints /api/avatar/*, pero necesita identidad/tenant/actor, permisos y gobernanza V2.
- `apps/web/src/voice/{ConferenceRoom,useAvatarCall}.tsx` en rama avatar: vídeo placeholder (SDK Anam real no montado); fetch de voz no evidenció Bearer auth; sesión no reutiliza de forma fiable thread actual. Verificar y corregir, no asumir que está listo.
- Interrupción de voz actual: registra evento, no garantiza cancelar generación, TTS y playback de extremo a extremo.
- `apps/web/src/components/MobileChatSheet.tsx` y CSS, `ChatInput.tsx`, `SidebarChat.tsx`, `useChat.ts` en rama móvil: conservar como baseline UX; revisar los tests Playwright antes del merge.

## Contrato objetivo (propuesto, no implementado)
`ConversationChannelContext = { tenantId, actorId, threadId, agentId, channel: 'text'|'dictation'|'voice'|'video', sessionId?, turnId, policyRevision, cancellationEpoch }`.
Resolver tenant/actor desde auth en servidor; nunca confiar en valores cliente para autorización. Identidad de agente vinculada a tenant/roster y permisos. Un único servicio de conversación acepta canales; adapters externos solo transforman audio/video/texto y eventos. Hilos y memoria siguen compartidos. Implementar contrato en dominio, validación Zod y pruebas tenant-crossing.

## Flujo esperado
1. Web/mobile autentica y abre hilo existente; solicita sesión realtime con agentId autorizado.
2. Gateway server emite sesión efímera vinculada a actor/tenant/thread/agent, audita, asigna epoch.
3. STT/transcripción o texto entrante se normaliza a turno con identidad verificada.
4. Cognition fast responde con contexto autorizado, sin exponer eventos internos.
5. TTS/avatar reproducen respuesta; receipts de cliente/media diferenciados de ACK del servidor.
6. Barge-in aumenta epoch, aborta inferencia, síntesis, streams y playback, e impide entregar fragmentos obsoletos.
7. Slow lane y memorias procesan efectos gobernados, sin bloquear primer audio.
8. Cierre/reap remoto y local; métricas de primer token, primer audio, RTT, interrupción, coste y errores.

## Dependencias y riesgos
- Verificar SDK Anam actual, formatos de audio, auth y sesiones; no inventar disponibilidad de API.
- ElevenLabs: evaluar STT/TTS y streaming según contrato real; no asumir MP3 como formato WebRTC aceptado.
- Websocket/WebRTC o transporte adecuado, reconexión, control de backpressure y cierre de sesiones.
- Rate limits, presupuesto por tenant, política de retención/transcripciones, consentimiento de micrófono/cámara.
- Session snapshot IDs deben ser únicos por sesión; probar concurrencia mismo tenant+agent.
- No prometer latencia objetivo hasta medir p50/p95 con entorno real.
- Cambios de despliegue recientes en `.github/workflows/deploy.yml`, `Dockerfile`, `fly.toml`, `fly.worker.toml`, `apps/server/src/db.ts` y CA Supabase: preservar TLS verificado y scopes de secretos.
