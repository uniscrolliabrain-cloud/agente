# Mapa de enrutamiento del snapshot

- `apps/server/src/app.ts:162-165`: `COGNITION_V2_TENANTS` controla creación de CognitionV2Runtime; EventBus recibe `cognitionV2?.sink`.
- `apps/server/src/app.ts:717-727`: monta `/api/cognition-v2` y `/api/cognition-v2/voice`; conecta `slow.capture` a `kernel.captureAsyncResult`; asigna `agent.cognitionV2`.
- `apps/server/src/agent.ts:30-52`: CopilotKit elige CognitionV2ChatAgent cuando `agentBackend !== 'agui'` y el tenant está habilitado; si backend es `sample` o normal sin opt-in, usa ConversationAgent; si `agui`, HttpAgent remoto.
- `apps/server/src/engine/cognition/v2/chat-agent.ts:7-13`: delegación directa a `cognition.chat(owner,input)`, sin fallback local V1.
- `apps/server/src/engine/cognition/v2/runtime.ts:159-169`: Fast con `tools: []`, `state: {}`, historial user/assistant acotado y snapshot autorizado; acciones empresariales V1 aún separadas.
- `apps/server/src/voice-session-routes.ts`: sesión ligada a hilo autorizado y rol activo; transcripción renderizada por CognitionFastVoiceAdapter; respuesta JSON al terminar.

## Riesgo de frontera
La excepción remota AG-UI necesita decisión documentada y prueba fail-closed; no se debe confundir una excepción deliberada con permiso para eludir Cognition V2. Verificar autenticación y scope durante creación asíncrona de AgentsFactory en pruebas HTTP reales.
