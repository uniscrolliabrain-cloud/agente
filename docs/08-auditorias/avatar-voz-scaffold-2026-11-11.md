# Voz y cara para todos los agentes (scaffold) — 2026-11-11

Rama: `feat/voice-avatar-scaffold`.

Objetivo: que **cualquier** agente (los dos principales y los de cliente) pueda
tener cara (Anam) y voz (ElevenLabs) con la latencia mínima posible, y una sala
de videoconferencia interna usable desde PC o móvil. Anam y ElevenLabs se
conectan poniendo claves: no hace falta tocar código.

## Qué hay

Servidor, `apps/server/src/voice/`:

| Fichero | Responsabilidad |
| --- | --- |
| `agents.ts` | Perfil de voz/cara por agente. 16 agentes de cliente por defecto; las personas del tenant mandan. Semilla de cara determinista (`sha256(agentId)`), así el mismo agente tiene siempre la misma cara. |
| `sessions.ts` | Ciclo de vida de la llamada: `requested → live → closed`, turnos, segundos, coste, `interrupt` y `reap` (silencio 45 s, tope 15 min). |
| `snapshot.ts` | Contexto de la llamada construido **una vez**, leído con **un solo `get()`** por turno, y refrescado en segundo plano cada 5 turnos. |
| `providers.ts` | Anam (`/v1/auth/session-token`) y ElevenLabs (`/v1/text-to-speech/:id/stream`, `eleven_flash_v2_5`). Sin clave: `configured: false` y 503 legible, nunca excepción en el camino caliente. |
| `llm.ts` | Puente OpenAI Chat Completions en SSE para el "custom LLM" de Anam. `maxSteps: 1`, sin herramientas, presupuesto de primer byte de voz. |
| `routes.ts` | `/api/avatar/{agents,providers,sessions,sessions/:id/interrupt,llm,tts}`. |

Montado en `app.ts` bajo `/api/avatar` (no en `/api/voice`, que es Vapi).

Cliente, `apps/web/src/voice/`:

- `useAvatarCall.ts`: abre sesión, consume SSE, trocea por frases para el TTS y
  corta con `AbortController` (barge-in).
- `ConferenceRoom.tsx`: rejilla de participantes, tile del avatar, transcripción,
  mute, colgar y cortar.

## La voz es el mismo agente, no un gemelo

`/api/avatar/llm` no habla con un modelo suelto: entra por
`voiceHarnessCompletion` (`apps/server/src/voice/harness.ts`), que instancia el
mismo `ConversationAgent` que monta `makeRuntime()` para el chat, con el mismo
`AgentService`, el mismo owner y **el hilo de la sesión** (`session.threadId`;
si el cliente no manda uno, la llamada abre `voice-<id>`). Eso significa que la
llamada tiene kernel, herramientas, memoria, guardrails, contadores de uso y
turno del harness, y que lo que se habla queda en el hilo igual que en el chat
escrito.

Diferencias deliberadas, solo de transporte:

- la salida se entrega como SSE para que Anam la convierta en voz;
- el turno viaja con `state.voice = true`, y el agente añade una instrucción de
  voz (1-2 frases, sin listas ni ids) sin cambiar nada del chat escrito;
- el snapshot de contexto sigue existiendo para el saludo/identidad de Anam,
  pero ya no es el contexto del turno.

El camino ligero (`voiceCompletion`) queda como respaldo para cuando no hay
servicio montado (por ejemplo, una prueba aislada del TTS), no como camino real.

## Por qué esto baja la latencia

1. **Un turno de voz no paga recall + contexto + rol.** Se paga al abrir la
   sesión, escondido tras los 4-5 s que Anam tarda en levantar el WebRTC.
2. **Presupuesto propio**: 900 ms de primer byte (el chat usa 8 000 ms) y 20 s
   totales. El rol duplicado, además, ya se cachea (`CONTEXT_ROLE_CACHE_V1`,
   `CONTEXT_ROLE_TTL_MS`).
3. **TTS por frases**: el audio empieza en la primera frase, no al cerrar el
   turno.
4. **SSE sin buffer**: el proxy `/api/copilotkit/*` y `/api/avatar/llm` mandan
   `Cache-Control: no-cache, no-transform` y `X-Accel-Buffering: no`.

## Variables de entorno

Ver `.env.example`. Mínimo para tener cara y voz:

```
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
ANAM_API_KEY=...
ANAM_PERSONA_ID=...
```

Por agente: `ELEVENLABS_VOICE_<ID>` y `ANAM_PERSONA_<ID>` con el id en
MAYÚSCULAS_CON_GUIONES (`ELEVENLABS_VOICE_COMERCIAL`, `ANAM_PERSONA_LEGAL`).
Sin `VOICE_*`, los valores por defecto ya son de voz.

## Contrato de `/api/avatar/llm`

Petición (la que hace Anam como custom LLM):

```json
POST /api/avatar/llm
{ "model": "laia", "stream": true, "messages": [{ "role": "user", "content": "hola" }] }
```

Cabeceras opcionales: `x-avatar-session` (id de sesión, para turnos y refresco)
y `x-avatar-agent` (si el `model` no es el id del agente).

Respuesta: `text/event-stream` con `data: {"choices":[{"delta":{"content":"…"}}]}`
y `data: [DONE]`. Los errores viajan como `data: {"error":{"message":"…"}}`.

## Aislamiento

Todas las rutas exigen owner del claim firmado y tenant resuelto (scope o
`tenantIdFor`); nunca aceptan un `tenantId` del cliente. Cada sesión y cada
snapshot guardan su `tenantId` y se comparan en la lectura: si no coincide, el
recurso **no existe** (404/null), igual que en el resto del producto.

## Verificación hecha

- `tsc --noEmit` (raíz y `apps/web`): 0 errores.
- `tests/avatar-voice.test.ts`: 10/10 (≥12 perfiles con cara y voz, semilla
  estable, voz por agente, personas del tenant, store roto, aislamiento por
  empresa, reaper, una lectura de snapshot por turno, SSE con LLM inyectado,
  degradación sin claves).
- Suite completa: 802 tests, 785 pass, 0 fail, 12 skipped, 5 todo.
- Smoke contra el servidor real (12-11, PGlite en `/tmp`, sin claves): arranca
  con `/api/health` 200, login de admin 200, `GET /api/avatar/agents` devuelve
  las **12 personas reales del tenant** (no la plantilla), `POST
  /api/avatar/sessions` 200 con snapshot construido, `DELETE` cierra con motivo
  `user`, `/api/avatar/llm` 200 `text/event-stream` servido por el **agente real** (sin modelo contesta un chunk de espera y guarda el turno en Activity, que es lo que hace el harness) y `/api/avatar/tts` 503
  «ElevenLabs no configurado», `401` sin token y `404` para un agente que no
  existe en la empresa. La sala no se ha renderizado en navegador.
- Segunda pasada (sin claves): registro de `rag-sources` cacheado por owner
  (una lista de 20 000 filas por búsqueda menos), perfiles de voz cacheados por
  tenant, tope `VOICE_TURNS_PER_HOUR` por empresa en `/llm` y `/tts`, y refresco
  de snapshot en segundo plano arreglado (ya no depende de un cast).

## Ojo al conectar mañana

- **No todos los tenants tienen `laia`.** El panel lista las personas cargadas;
  en el tenant de ejemplo son dirección, comercial, atención, administrativo,
  finanzas, marketing, contenido, operaciones, compras, personas, legal y
  cumplimiento. La sala coge la primera disponible, nunca un id fijo.
- **Sin modelo no hay voz.** `POST /api/avatar/llm` responde 503 con el motivo
  hasta que exista `FAST_LLM_API_KEY` o modelo de tenant: no es un fallo, es la
  configuración que falta.
- El tope `VOICE_TURNS_PER_HOUR` (600) protege la factura desde el primer día.

## Mañana: conectar Anam y ElevenLabs (paso a paso)

1. **Voz.** Crear la clave en ElevenLabs y elegir una voz de la biblioteca.
   Poner `ELEVENLABS_API_KEY` y `ELEVENLABS_VOICE_ID` en el `.env` del servidor.
   Para dar voces distintas: `ELEVENLABS_VOICE_COMERCIAL`, `ELEVENLABS_VOICE_LEGAL`…
   Comprobar con `POST /api/avatar/tts` y `{"text":"hola","agentId":"laia"}`.
2. **Cara.** Crear la persona en Anam, copiar su id a `ANAM_PERSONA_ID` y poner
   `ANAM_API_KEY`. Comprobar con `GET /api/avatar/providers` → `anam.configured: true`.
3. **Unir las dos.** `POST /api/avatar/sessions` devuelve `anam.token` y el perfil
   del agente; montar el SDK de Anam en `videoRef` de `ConferenceRoom.tsx` usando
   ese token y, como custom LLM, `POST /api/avatar/llm` con `x-avatar-session`.
4. **Verificar de verdad.** Una llamada de 1 minuto: primer audio < 1,5 s, corte
   al hablar (barge-in) y cierre que deja `seconds`/`costEur` en la sesión.
   El coste por minuto hay que ajustarlo a la tarifa real
   (`VOICE_EUR_PER_MINUTE`); el 0,12 por defecto es una estimación.

## Pendiente (fuera de este scaffold)

- Conectar Anam y ElevenLabs con claves reales y montar el SDK de Anam en
  `videoRef`: hoy el tile muestra retrato generado y estado de sesión.
- Audio del micrófono: falta el pipeline WebRTC/STT (Anam lo aporta con su SDK).
- Coste real por minuto: `VOICE_EUR_PER_MINUTE` es una estimación, hay que
  ajustarla con la tarifa contratada.
