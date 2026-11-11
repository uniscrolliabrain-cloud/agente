# Informe de latencia: cara y voz con Anam + ElevenLabs

> v1 · 2026-11-11 · Estado: propuesta
>
> Auditoría del repo `uniscrolliabrain-cloud/agente` en `main` (`ecef389`).
> Todo lo que digo del código lleva `fichero:línea`. Lo que es estimación va
> marcado como **[estimación]**. Lo que no pude comprobar va en la sección 11.

---

## 0. Resumen en cinco líneas

1. **En este repo no hay Anam.** Ni SDK, ni ruta, ni variable, ni dependencia.
   Tampoco hay ElevenLabs como cliente: solo una sonda de salud.
2. La voz que existe es **Vapi por REST** (`apps/server/src/voice-routes.ts`),
   para marcar llamadas de teléfono, sin audio en tiempo real y sin webhook.
3. El chat sí es streaming real por SSE (`/api/copilotkit/run`) y ya está
   cableado al modelo **fast**; lo que el fast no quita son los **8–25 viajes a
   Postgres y a embeddings que ocurren antes de llamarlo**, con la base en
   `us-east-2` y la app en `fra`: ~100 ms por consulta según `fly.toml:8-9`.
4. Con ese camino, un turno de voz no cabe en un presupuesto de ~1 s ni de
   lejos: el avatar empezaría a hablar cuando el usuario ya cree que no le has
   oído. **[estimación] 1,5–3 s solo de preparación, antes del LLM.**
5. El plan no es "optimizar Anam", es **construir el camino de voz al lado del
   chat**, con contexto precalculado, cuotas sin escaneo, herramientas mínimas
   y cancelación por barge-in. Sección 6 y 7.

---

## 1. Qué pedía el encargo y qué se puede entregar

El encargo pedía auditar "el ciclo de vida de la sesión con Anam", el
"audio passthrough", el "streaming de ElevenLabs" y los "WebSockets con Anam".
Eso no existe en el repositorio, así que auditarlo sería inventarlo. Lo que sí
se puede hacer, y es lo que hay aquí:

- trazar el camino real que alimentaría a un avatar (chat LLM + contexto),
- medir dónde se pierde tiempo en ese camino, con líneas exactas,
- y diseñar el pipeline de voz con los puntos de enganche concretos.

Si Anam se está integrando en otra rama o en otro repo (por ejemplo el panel
comercial), este informe no la ve. Dímelo y lo audito allí.

---

## 2. Estado real de la voz y del avatar en `main`

| Pieza | ¿Existe? | Dónde |
|---|---|---|
| Cliente Anam | **No** | — |
| SDK JS de Anam en el frontend | **No** | `apps/web/package.json` solo tiene React, ReactDOM y lucide |
| Sesión / token de Anam | **No** | — |
| Audio passthrough (PCM al avatar) | **No** | — |
| Cliente ElevenLabs (TTS) | **No** | Solo sonda: `scripts/lib/connections.ts:218-222` y `:590-596` |
| STT (voz → texto) | **No** | — |
| VAD / detección de turno | **No** | — |
| WebRTC | **No** | — |
| WebSocket servidor | **No** | El servidor usa SSE (`events-routes.ts:48`, `notifications-stream.ts:57`) |
| Voz telefónica (Vapi, REST) | **Sí** | `apps/server/src/voice-routes.ts`, montado en `app.ts:825-827` |
| Webhook de Vapi | **No** | 0 coincidencias de webhook de voz en `apps/server/src` |
| Streaming de texto del chat | **Sí** | `app.ts:1067-1089`, `engine/conversation.ts:1114-1130` |

Conclusión dura: **el 90 % de lo que el prompt llama "auditar Anam" es trabajo
por hacer, no código que arreglar.** Y la parte que sí existe (el camino del
LLM) es justo la que hoy impediría que un avatar fuese fluido.

---

## 3. Cómo es un turno de chat hoy, paso a paso

Entrada: `POST /api/copilotkit/run` → reescrito a
`/api/copilotkit/agent/default/run` (`app.ts:1074-1075`) → `runtime.fetch`
(`app.ts:1077`) → `ConversationAgent.run()`.

Dentro de `ConversationAgent.run()` (`engine/conversation.ts`), antes de que el
modelo reciba nada:

| # | Paso | Evidencia | Coste dominante |
|---|---|---|---|
| 1 | Autenticación y resolución de owner | `agent.ts:19-33` | 1 lectura de sesión/DB |
| 2 | `tenantIdFor(owner)` | `conversation.ts:236-238` | 1 consulta |
| 3 | `spawnRuntime` (emite evento al bus) | `conversation.ts:250-258` + `engine/agents/runtime.ts:53-70` | 1 escritura |
| 4 | `findOpenTurnForThread` | `conversation.ts:263-265` | 1 consulta |
| 5 | `views.readView(ctx, "turn.recent")` | `conversation.ts:268-276` | 1 consulta |
| 6 | `openTurn` + `audit.append` | `conversation.ts:278-280`, `kernel/kernel.ts:106-118` | 2 escrituras |
| 7 | `UserAuthor.write` (mensaje del usuario) | `conversation.ts:281-287` | 1 escritura |
| 8 | `memory.recall` (RAG + memorias + hechos) | `conversation.ts:870-884`, `engine/memory.ts:196-215` | **1 HTTP a Google (embeddings)** + hasta 4 páginas de 500 memorias + 20.000 fuentes RAG + chunks paginados |
| 9 | `systemContext` (aprobaciones, fallos, Google, meta) | `conversation.ts:899-905`, `engine/service.ts:1057-1129` | 2 listas de 50 + `workspace.connected` + turnos/thoughts (caché 30 s por owner) |
| 10 | Rol (`agent-roles`) | `conversation.ts:936-946` | 1 consulta |
| 11 | `context.assemble` (rol otra vez, memorias, entidad, ejecución, eventos, recall) | `conversation.ts:955-970`, `engine/context/engine.ts:82-140` | 3–6 consultas |
| 12 | Tarjetas de cognición | `conversation.ts:975-995` | 1–2 consultas |
| 13 | Espera a la promesa del turno de kernel | `conversation.ts:1025-1027` | serializa 2–7 |
| 14 | `kernel.config(ctx)` + `tenantIdFor` (otra vez) | `conversation.ts:1045-1062` | 2 consultas + caché |
| 15 | Cuotas: `db.list(owner, "llm-usage")` **sin límite** | `conversation.ts:1092-1104` | **scan completo de uso** |
| 16 | Construcción de `tools` (computerTools + defineTool) y prompt (RAG + urgente + rol + cognición) | `conversation.ts:390-500`, `:975-1000` | CPU + serialización |
| 17 | Primera llamada al modelo | `conversation.ts:1114-1130` | TTFB del proveedor |

Solo los pasos 2 a 15 son **entre 15 y 25 round-trips**, casi todos en serie.
Con el RTT que el propio repo documenta (Neon en `us-east-2`, app en `fra`,
~100 ms por consulta, `fly.toml:9-12`), eso son **1,5–2,5 s [estimación] antes
de que el modelo vea el prompt**. Encima, el TTFB del LLM y el TTS.

Nada de esto es un bug de Anam. Es el camino que Anam heredaría.

### 3.bis · Fast y slow: qué resuelve cada uno

El diseño es el que dices: el chat habla con el modelo **fast** y las tareas
durables razonan con el **slow**.

- Chat: `conversation.ts:1063-1066` sustituye la cadena por `[fastSpec]` en
  cuanto existe `cfg.fast.apiKey`; el slow solo entra como segundo eslabón.
- Tareas: `engine/model.ts:759` pide `modelChain(config, tenant, "task")`, que
  coloca el slow primero (`engine/model-chain.ts:83`).

Dos matices que impone el código:

1. **El fast solo se activa si hay clave.** El guard es
   `if (cfg?.fast?.provider && cfg.fast.model && cfg.fast.apiKey)`. El resolver
   lee `FAST_LLM_API_KEY` (`kernel/config/env-resolver.ts:59`) y avisa «Chat
   usara chain global» si está vacía. `fly.toml` no define `FAST_LLM_*` (solo
   `GEMINI_MODEL` y `OPENROUTER_MODEL`, líneas 26-27): si Doppler no inyecta
   esa clave, el chat corre con la cadena global y el carril fast no se usa.
   Compruébalo con `fly secrets list` o con el log de arranque.
2. **El fast no toca los pasos previos.** De los 17 pasos de la tabla, solo el
   17 llama a un modelo (`runWithModelFallback`, `conversation.ts:1114`); los
   demás son Postgres y una llamada HTTP a embeddings (`rag.ts:468`,
   `embeddings.ts:33`). `reformulateQuery` es regex local (`memory.ts:127`), no
   un LLM. Pasar de fast a ultra-fast mueve el paso 17, no los 2-16.

Y una corrección a mi propia tabla: hay cachés que bajan el recuento real.
`kernel.config` cachea el `TenantConfig` 5 minutos (`env-resolver.ts:55-56`) y
`systemContext` 30 segundos (`service.ts:1058-1060`). En caliente quedan unos
8-12 round-trips (abrir turno, auditoría, vista, recall con embedding,
contexto, cuota); en frío, 15-25. Sigue siendo demasiado para voz, pero no es
cierto que «todo vaya al slow»: casi nada de eso es una llamada a un modelo.

---

## 4. Lo que Anam necesita y lo que Anam cobra en latencia

Datos de la documentación pública de Anam (verificados el 2026-11-11, no
medidos en nuestra cuenta):

- La sesión se establece por **WebRTC** y el **setup tarda 4–5 s, hasta 10 s**
  (`anam.ai/docs/resources/faq`).
- Hay tres modos de orquestación:
  1. **Turnkey**: Anam hace STT + LLM + TTS. Menos latencia, menos control.
  2. **Custom LLM**: Anam llama a *tu* servidor; el LLM debe responder en
     **streaming** (`anam.ai/docs/concepts/custom-llms`).
  3. **Audio passthrough**: tú mandas PCM; Anam solo pone cara y labios.
     Recomiendan **24 kHz**, aceptan 16–48 kHz, y el TTS debe generar **por
     encima de tiempo real** o hay stutter
     (`anam.ai/docs/javascript-sdk/examples/custom-tts`).
- La ruta con ElevenLabs en cliente suma: **voz → STT 200–400 ms**, más TTS,
  más red. La propia guía avisa de que combinar dos servicios en tiempo real
  añade latencia frente al modo turnkey.
- Interrupción: en streaming, hablar corta la locución; también existe
  `interruptPersona()`.

Presupuesto razonable para que se sienta conversación (no llamada):

| Etapa | Objetivo p50 | Nota |
|---|---|---|
| Fin de habla → VAD/turno detectado | 150–300 ms | Anam lo hace si usas su STT |
| STT | 150–300 ms | 200–400 ms en la ruta ElevenLabs cliente |
| **Nuestro backend: contexto listo** | **≤ 50 ms** | Hoy: 0,8–2 s en caliente, 1,5–2,5 s en frío [estimación] |
| LLM primer token | 250–600 ms | depende del modelo y del prompt |
| TTS primer byte | 150–350 ms | ElevenLabs streaming |
| Red + render de cara | 80–200 ms | WebRTC + generación |
| **Total percibido** | **≤ 1,2 s** | por encima de 1,8 s se nota robot |

El paso que hoy hace imposible ese presupuesto es el nuestro, no el de Anam.

---

## 5. Los catorce cuellos de botella

Cada uno con evidencia, por qué duele en un avatar, arreglo y ganancia
estimada. Las ganancias son **[estimación]** hasta que se instrumente (sección 9).

### B-01 · No hay pipeline de voz, y eso cambia el plan

**Evidencia:** sección 2.
**Duele:** cualquier cifra de latencia de "nuestra integración con Anam" hoy
sería inventada.
**Arreglo:** construir el camino de voz (sección 6), no "optimizar" lo que no
existe. Es la decisión que manda sobre todas las demás.

### B-02 · 15–25 round-trips secuenciales antes del primer token

**Evidencia:** tabla de la sección 3; `conversation.ts:232-300`, `:870-1000`.
Solo el paso 17 es LLM; los demás son Postgres y embeddings, con cachés de
5 min (`env-resolver.ts:55-56`) y 30 s (`service.ts:1058-1060`).
**Duele:** en texto el usuario ve el spinner y perdona 2 s. En voz, 2 s de
silencio se leen como "no me ha oído" y el usuario repite o cuelga.
**Arreglo:**
- Snapshot de contexto por hilo/sesión, calculado al abrir la sesión de voz y
  refrescado en segundo plano (`voice-context` en el store), no por turno.
- En el turno de voz, solo: recuperar snapshot (1 lectura), mensaje, LLM.
- Todo lo que no sea imprescindible (`views.readView`, `spawnRuntime`,
  `UserAuthor.write`, tarjetas, meta) **después** del primer token, en un
  `void (async () => …)()` como ya se hace al cerrar el turno
  (`conversation.ts:1198-1235`).
**Ganancia [estimación]:** 1,5–2 s fuera del camino crítico.

### B-03 · Cuota con escaneo completo justo antes del modelo

**Evidencia:** `conversation.ts:1095`:
`const usage = await this.service.db.list<…>(this.owner, "llm-usage");`
sin `limit`, y se ejecuta en cada turno para sumar tokens, coste y llamadas.
**Duele:** crece con el uso de la empresa. Un tenant con meses de historial
paga un scan antes de cada respuesta, y en voz eso es por turno.
**Arreglo:** contadores agregados (`llm-usage-counters` con bucket
`YYYY-MM-DD` y `YYYY-MM-DDTHH`), actualizados con `put` en vez de recalcular,
o un `SELECT sum(...)` con índice por `owner, kind, date`. La comprobación de
cuota debe ser una lectura O(1).
**Ganancia [estimación]:** 50–400 ms según volumen.

### B-04 · El primer byte del chat espera 8 s; el de tareas, 45 s

**Evidencia:** `conversation.ts:1136-1137` fija `firstByteMs` 8.000 y
`totalMs` 45.000; `engine/model-chain.ts:117-124` deja 45.000/120.000 por
defecto.
**Duele:** si el proveedor "fast" está lento, el avatar se queda mudo hasta 8 s
antes de intentar el fallback. En voz el umbral tiene que ser ~1.000–1.500 ms.
**Arreglo:** parámetros por modo. `CHAT_FIRST_BYTE_MS` ya existe; añadir
`VOICE_FIRST_BYTE_MS=1200` y `VOICE_TOTAL_MS=20000` en la ruta de voz, sin
tocar el chat.

### B-05 · Fallback secuencial, no en carrera

**Evidencia:** `model-chain.ts:135-160` (`startNextAttempt` solo se llama al
agotar el anterior); no hay `Promise.race` entre proveedores.
**Duele:** el peor caso es la suma de los timeouts, no el mejor.
**Arreglo:** en voz, **hedging**: lanzar el secundario a los 600 ms si el
primario no ha emitido, quedarse con el primero que hable y abortar el otro.
Solo para voz; en chat el coste por tokens duplicados no compensa.

### B-06 · El RAG hace una llamada HTTP externa en serie antes del LLM

**Evidencia:** `engine/memory.ts:196-215` lanza cuatro fuentes en paralelo
(bien), pero `engine/rag.ts:466-470` hace `await embed(query)` contra Google
(`engine/embeddings.ts:33-60`, timeout 15 s, devuelve `null` si falla) y
después `list("rag-sources", { limit: 20000 })`; sin pgvector recorre chunks
paginados (`rag.ts:492-515`).
**Duele:** 100–400 ms de ida y vuelta a Google por turno, y si falla degrada
en silencio a un scan caro.
**Arreglo:** en voz, recall **precalculado** al abrir la sesión y refresco cada
N turnos; y `EMBEDDINGS_LLM_BASE_URL` apuntando a un endpoint en la misma
región si se puede. El embedding del turno se puede lanzar en paralelo con el
LLM y usarse solo si llega antes del primer token.

### B-07 · El contexto se lee dos veces

**Evidencia:** `memory.recall` en `conversation.ts:877` y `context.assemble`
en `:961`; `assemble` vuelve a hacer `db.get(owner, "agent-roles", roleId)` y
`db.list(owner, "memories")` (`engine/context/engine.ts:83-90`), aunque el rol
ya se leyó en `conversation.ts:938`.
**Duele:** duplica los round-trips del paso más caro.
**Arreglo:** pasar el rol ya cargado a `assemble` (o cachear por
`tenant:owner:role` con TTL de 30 s, como ya se hace en `systemContext`).

### B-08 · Se reenvía el historial completo cada turno

**Evidencia:** `apps/web/src/hooks/useChat.ts:95-108`: `messages:
history.map(...)`, sin recorte ni resumen; el servidor reconstruye el prompt
con todo.
**Duele:** TTFT crece con la conversación; a los 30 turnos el prompt puede
dominar la latencia. En voz, el historial debe ser una ventana corta + resumen.
**Arreglo:** ventana de 6–8 turnos + `summary` persistido; en voz, 3 turnos y
un resumen de 200 tokens.

### B-09 · Herramientas y prompt máximos para cualquier turno

**Evidencia:** `tools` se construye por petición con `computerTools(…)` y los
`defineTool` de `conversation.ts` (a partir de `:390`); `maxSteps` por defecto
6 (`conversation.ts:1127-1133`); el prompt suma RAG + urgente + rol + tarjetas
de cognición (`:975-1000`).
**Duele:** cada herramienta añade esquema y tokens; `maxSteps: 6` permite seis
idas al modelo antes de responder. Para "hola" sobra todo.
**Arreglo:** perfil de voz con 2–3 tools (`agent_status`, `delegate_task`) y
`maxSteps: 2`; prompt de voz corto y sin tarjetas.

### B-10 · SSE sin cabeceras anti-buffer

**Evidencia:** `app.ts:1077-1089` reenvía la respuesta del runtime con un
`TransformStream` que no añade buffering (bien), pero tampoco añade
`X-Accel-Buffering: no` ni `Cache-Control: no-cache`; el resto de streams del
repo sí lo hacen (`events-routes.ts:48-53`).
**Duele:** detrás de un proxy/CDN (Vercel delante, Cloudflare, etc.) el stream
puede acumularse en bloques y llegar a ráfagas. En texto se nota poco; en audio
es un tirón.
**Arreglo:** cabeceras explícitas en la ruta de voz y `Content-Encoding:
identity` para SSE/WS (no comprimir audio).

### B-11 · Una CPU compartida y 100 conexiones para todo

**Evidencia:** `fly.toml:46-55` (`shared-cpu-1x`, 1 GB,
`hard_limit = 100`, `min_machines_running = 1`, auto stop/start);
`app.ts:1090` sirve el frontend estático en el mismo proceso; el worker de
tareas corre en el mismo despliegue (`TASK_WORKER_ENABLED=true`, `fly.toml:24`).
**Duele:** 100 conexiones SSE abiertas consumen el cupo que necesita la API, y
un tick del worker retrasa tokens. La voz añade WebRTC y audio: no cabe aquí.
**Arreglo:** proceso y máquina dedicados para voz (`performance-2x` mínimo),
`auto_stop_machines = "off"` en ese proceso, y límite de conexiones separado.

### B-12 · La base está al otro lado del Atlántico

**Evidencia:** `fly.toml:5-12`: región `fra`; el comentario del propio repo
dice que Neon está en `us-east-2` y que **cada consulta cruza el Atlántico
(~100 ms)**.
**Duele:** multiplica por 15–25 el coste de la sección 3. Es el arreglo más
barato y el de mayor efecto.
**Arreglo:** mover Neon a `eu-central-1` (o crear una réplica de lectura en
`fra` para el camino de chat) y medir. Sin tocar código.

### B-13 · No hay barge-in: nada cancela al modelo cuando el usuario habla

**Evidencia:** `conversation.ts:1236-1244` cancela con `browserAbort`,
`run?.abort()` y `subscription?.unsubscribe()` cuando el cliente corta, pero no
existe una señal de "el usuario ha empezado a hablar" que aborte el LLM y el
TTS en curso.
**Duele:** sin barge-in, el avatar sigue hablando encima del usuario; con
Anam, la interrupción llega al cliente pero tu backend sigue generando y
facturando.
**Arreglo:** endpoint `POST /api/voice/session/:id/interrupt` que aborta el
`run` actual y vacía la cola de TTS; en el cliente, llamar también a
`interruptPersona()`.

### B-14 · La voz actual (Vapi) no sirve como base

**Evidencia:** `packages/integrations/src/vapi.ts:13` (timeout 20 s),
`:147-160` (`createCall` REST), `voice-routes.ts:100-180` (reserva + llamada +
persistencia); **no hay** ruta de webhook ni de audio.
**Duele:** es marcación de llamadas y consulta de estado, no un canal en
tiempo real. Reutilizarla para Anam sería otro producto.
**Arreglo:** dejarla como está (funciona y está bien blindada con
idempotencia) y construir el canal de avatar aparte.

---

## 6. Arquitectura propuesta

### 6.1 Las tres opciones

| | A · Turnkey Anam | B · Custom LLM (server-side) | C · Audio passthrough |
|---|---|---|---|
| Quién hace STT/LLM/TTS | Anam | Anam STT/TTS, **tu** LLM | Tú todo; Anam solo cara |
| Latencia | La menor | Media | La mayor (dos servicios) |
| Control del prompt y las tools | Bajo | **Alto** | Total |
| Reutiliza tu kernel/memoria | No | Sí (endpoint) | Sí |
| Coste de ingeniería | Bajo | Medio | Alto |
| Riesgo | Persona genérica, sin tu producto | Acoplar contrato OpenAI | Muchas piezas móviles |

**Recomendación:** **B** para producción y **A** como banco de pruebas de
latencia. C solo si el cliente exige una voz ElevenLabs concreta y se acepta
pagar latencia.

Motivo: tu valor no está en el LLM, está en el contexto (memoria, SOPs,
aprobaciones). Turnkey lo tira. Passthrough te obliga a montar STT, VAD y
orquestación de turno, que es justo donde se pierden los 300–600 ms.

### 6.2 Diagrama del camino recomendado

```
Navegador
  ├─ SDK Anam (WebRTC): vídeo + micro
  │     └─ Anam STT ──► evento de turno
  └─ fetch SSE ──► POST /api/voice/llm  (OpenAI-compatible, streaming)
                        │
                        ├─ snapshot de contexto (1 lectura, precalculado)
                        ├─ cuota O(1)
                        ├─ LLM fast (streaming, hedging a los 600 ms)
                        └─ tools mínimas (2), maxSteps 2
                              │
                              └─ tokens ──► Anam TTS (o ElevenLabs) ──► labios

En paralelo, fuera del camino crítico:
  kernel turn · auditoría · memoria · vistas · métricas
```

### 6.3 Contrato del endpoint de voz

`POST /api/voice/llm` — formato OpenAI Chat Completions en streaming, para que
Anam pueda apuntar a él como "custom LLM" sin adaptador propio:

```ts
// apps/server/src/voice-llm-routes.ts (nuevo)
app.post("/api/voice/llm", async (c) => {
  const started = performance.now();
  const body = await c.req.json();           // { messages, stream: true, ... }
  const owner = c.get("owner");
  const snap = await voiceContext.get(owner); // 1 lectura, cacheado en sesión
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache, no-transform");
  c.header("X-Accel-Buffering", "no");
  c.header("Content-Encoding", "identity");
  const stream = new ReadableStream({
    async start(ctrl) {
      const enc = new TextEncoder();
      const send = (o: unknown) => ctrl.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
      const run = startVoiceRun({ owner, messages: body.messages, snapshot: snap });
      c.req.raw.signal.addEventListener("abort", () => run.abort());
      for await (const delta of run.tokens) {
        send({ choices: [{ delta: { content: delta } }] });
        ctrl.enqueue(enc.encode(": flush\n\n")); // fuerza flush en proxies
      }
      send({ choices: [{ delta: {}, finish_reason: "stop" }] });
      ctrl.enqueue(enc.encode("data: [DONE]\n\n"));
      ctrl.close();
      void finishVoiceTurn(owner, run, started); // kernel, auditoría, uso: fuera del stream
    },
  });
  return new Response(stream, { headers: c.res.headers });
});
```

Nota: el `: flush` es deliberado. Con `no-transform` y `X-Accel-Buffering`
debería bastar, pero hay proxies que agrupan; un comentario SSE por token
obliga a vaciar sin romper el parser (los comentarios se ignoran).

### 6.4 Snapshot de contexto

Al abrir sesión (`POST /api/voice/session`), calcular una vez:

- tenant, rol y tono,
- 10–15 hechos de memoria + 3 documentos RAG relevantes para el vertical,
- estado operativo (aprobaciones pendientes, fallos recientes),
- resumen del hilo si lo hay.

Guardar en `voice-context` con `ttl = 10 min` y refrescar en segundo plano cada
5 turnos. En el turno, **una** lectura.

Coste estimado del snapshot: 300–600 ms **una vez por sesión**, y la sesión de
Anam tarda 4–5 s en estar lista de todas formas: ese trabajo se esconde dentro
del arranque, no se suma.

### 6.5 Ciclo de vida y coste de la sesión

Anam cobra por minuto de sesión, aunque el usuario esté callado. Sin control,
una pestaña abierta toda la mañana es una factura.

| Estado | Entra por | Sale por | Qué se hace |
|---|---|---|---|
| `requested` | POST /session | token emitido | snapshot en curso |
| `connecting` | SDK Anam | `SESSION_READY` | precalentar TTS y LLM |
| `live` | SESSION_READY | silencio / fin | turnos |
| `idle` | 20 s sin voz | voz o timeout | aviso visual; seguir contando |
| `closing` | timeout o DELETE | cierre Anam | abortar run y TTS |
| `closed` | cierre | — | persistir duración y coste |

Reglas propuestas:

- **Silence timeout 45 s** → cerrar sesión y pedir reconexión (la reconexión
  cuesta 4–5 s; avisar en UI).
- **Máximo por sesión 15 min** → rotar sesión con token nuevo.
- **Heartbeat** cada 15 s; si el cliente no responde dos veces, cerrar.
- **Un `DELETE /api/voice/session/:id` idempotente**, y un reaper en el tick
  del servidor para sesiones huérfanas (ya hay schedulers en `index.ts:118-160`).
- Guardar `startedAt`, `endedAt`, `seconds`, `turns`, `costEur` en
  `voice-sessions` para poder ver la factura por tenant.

### 6.6 Audio

Reglas que evitan los tres errores clásicos:

1. **No transcodificar en el backend.** El navegador manda PCM16 mono 24 kHz
   (Anam acepta 16–48 kHz; 24 es su recomendación). Cero ffmpeg en el camino.
2. **Nada de base64 en el camino caliente** si se puede mandar binario; base64
   infla un 33 % y añade CPU en una máquina de 1 vCPU.
3. **Chunks de 20 ms** (960 muestras a 24 kHz) con contrapresión: si el buffer
   del cliente supera 300 ms, se descartan chunks viejos antes que acumular.
4. **El TTS debe ir por encima de tiempo real.** Si ElevenLabs entrega a 1,0x,
   Anam hace stutter; hay que pedir streaming y verificar el ritmo real.
5. **Un solo reloj.** El timestamp del primer token del LLM y el del primer
   chunk de audio deben registrarse juntos; si no, se optimiza a ciegas.

---

## 7. Cambios concretos, por fichero

| Fichero | Cambio | Por qué | Riesgo |
|---|---|---|---|
| `apps/server/src/voice-llm-routes.ts` (nuevo) | Endpoint SSE OpenAI-compatible, sin kernel en el camino crítico | Es lo que Anam llama | Bajo, aislado |
| `apps/server/src/voice-session.ts` (nuevo) | Store `voice-sessions` + reaper + TTL | Coste y sesiones huérfanas | Bajo |
| `apps/server/src/app.ts` | Montar `/api/voice/llm` y `/api/voice/session`; cabeceras anti-buffer | Enganche | Bajo |
| `apps/server/src/engine/conversation.ts` | Extraer el ensamblado de contexto a una función reutilizable por voz | No duplicar lógica | Medio |
| `apps/server/src/engine/memory.ts` | `recall` con límites para voz (menos fuentes, sin scan de 20k) | B-06 | Bajo |
| `apps/server/src/engine/model-chain.ts` | Opción de hedging (carrera a 600 ms) solo para voz | B-05 | Medio |
| `apps/server/src/engine/service.ts` | Cuotas por contadores, no por scan | B-03 | Medio |
| `apps/web/src/hooks/useVoice.ts` (nuevo) | SDK Anam, sesión, barge-in, preload del SDK en idle | Lado cliente | Medio |
| `apps/web/index.html` | `preconnect` a `anam.ai` y al TTS | Ahorra 50–150 ms de DNS/TLS | Bajo |
| `fly.toml` / proceso nuevo | Máquina `performance-2x`, `auto_stop=off`, región `fra` | B-11 | Coste |
| Neon | Mover a `eu-central-1` | B-12 | Bajo, mantenimiento |

### 7.1 Frontend: lo que de verdad mueve la aguja

- **Precarga del SDK en `idle`**, no al pulsar "Conectar":
  `requestIdleCallback(() => import("@anam/sdk"))`. Ahorra ~200–400 ms de
  descarga y parseo en el primer clic.
- **Token de sesión al montar el componente**, no al clic. Si el usuario tarda
  3 s en decidirse, la sesión ya está pedida.
- **`preconnect`** a `anam.ai` (WebRTC), al TTS y a tu API.
- **Permiso de micrófono al montar** (o al hacer hover), con explicación; el
  diálogo del navegador cuesta 1–3 s la primera vez.
- **No bloquear el render**: el `<video>` del avatar debe montarse antes de
  `streamToVideoElement`, y el resto de la UI no debe re-renderizarse por cada
  token (hoy `useChat` hace `setStreamBuf` por delta, `useChat.ts:120-128`).
- **Barge-in**: al detectar voz local, `interruptPersona()` y POST de
  interrupción; no esperar a que el servidor lo note.

### 7.2 Lo que NO hay que hacer

- No meter el kernel, la auditoría, las vistas y las tarjetas en el camino de
  voz "para que quede registrado". Van después, como ya se hace al cerrar el
  turno (`conversation.ts:1198-1235`).
- No reutilizar `/api/copilotkit/run` para el avatar: arrastra 15–25 consultas
  y un contrato AG-UI que Anam no habla.
- No comprimir SSE ni audio.
- No convertir audio en el servidor.
- No usar el modelo "slow" para voz: el chat ya elige `fast`
  (`conversation.ts:1045-1060`); en voz, solo `fast`.

---

## 8. Plan por fases con criterios de aceptación

| Fase | Qué | Criterio de salida |
|---|---|---|
| 0 · Medir | Instrumentar TTFT y tiempo por etapa en el chat actual; script de 30 turnos | p50/p95 de cada paso de la sección 3, en un CSV |
| 1 · Quitar lastre | Neon en `eu-central-1`; cuotas por contador; cachear rol; ventana de historial | TTFT del chat baja ≥ 40 % [objetivo] |
| 2 · Canal de voz | `/api/voice/session`, `/api/voice/llm`, snapshot, tools mínimas | Primer token del endpoint de voz ≤ 700 ms p50 con contexto |
| 3 · Avatar | SDK Anam, custom LLM, barge-in, TTL/silencio, métricas | Turno percibido ≤ 1,2 s p50; ≤ 1,8 s p95; 0 sesiones huérfanas en 24 h |
| 4 · Voz propia (opcional) | ElevenLabs audio passthrough | TTS TTFB ≤ 300 ms y ritmo > 1,2x real |

Orden obligatorio: la fase 1 antes de la 2. Optimizar el endpoint de voz sin
quitar los round-trips es maquillar.

---

## 9. Instrumentación mínima

Eventos al bus (ya existe, `engine/events/bus.ts`):

- `voice.session.requested` / `ready` / `closed` (con `seconds`),
- `voice.turn.started` (`at`),
- `voice.llm.first_token` (`ms` desde `started`),
- `voice.tts.first_byte`,
- `voice.turn.interrupted`,
- `voice.turn.completed` (`ms`, `tokens`, `tools`).

Y contadores en `/metrics` (ya hay exporter,
`apps/server/src/metrics-exporter.ts`). Sin esto, cada discusión de latencia
será una opinión.

Medición rápida del endpoint:

```bash
curl -N -s -o /dev/null -w 'ttfb=%{time_starttransfer}s total=%{time_total}s\n' \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"hola"}],"stream":true}' \
  https://TU_HOST/api/voice/llm
```

---

## 10. Coste y sentido común

- Anam cobra por minuto de sesión: el silencio también se paga. El TTL de 45 s
  y el máximo de 15 min no son UX, son factura.
- El hedging duplica tokens solo cuando el primario falla; hay que medirlo y
  apagarlo si supera el 5 % de turnos.
- El snapshot por sesión evita pagar contexto en cada turno: menos tokens de
  entrada y menos latencia.
- El modo turnkey de Anam es más rápido, pero te deja sin memoria de empresa,
  sin SOPs y sin aprobaciones. Es una demo, no el producto.

---

## 11. Lo que no he podido verificar

- **No hay cuenta ni claves de Anam en este entorno**, así que ninguna cifra de
  latencia de Anam está medida aquí; las de la sección 4 son de su
  documentación.
- **No hay medición de producción** (sin APM ni acceso a logs de Fly). Todas
  las cifras marcadas **[estimación]** salen de contar round-trips y multiplicar
  por el RTT que el repo documenta.
- **No sé si Anam está integrado en otra rama o en otro repo** (panel, landing).
  Este informe cubre `main` de `uniscrolliabrain-cloud/agente`.
- **No he ejecutado la suite ni he arrancado el servidor** para este informe:
  es auditoría de código, y el repo tenía 726 tests verdes el 2026-11-10.
- **La latencia de ElevenLabs** depende del plan, la voz y la región; hay que
  medirla con la voz elegida, no con la media publicada.

---

## 12. Anexo: evidencia consultada

Ficheros leídos para este informe:

- `apps/server/src/app.ts` (proxy copilotkit, montaje de voz, estáticos)
- `apps/server/src/agent.ts` (runtime CopilotKit, agente por petición)
- `apps/server/src/engine/conversation.ts` (turno completo)
- `apps/server/src/engine/model-chain.ts` (timeouts, fallback, bulkhead)
- `apps/server/src/engine/service.ts` (`systemContext`, `spawnRuntime`)
- `apps/server/src/engine/memory.ts`, `engine/rag.ts`, `engine/embeddings.ts`
- `apps/server/src/engine/context/engine.ts`
- `apps/server/src/kernel/kernel.ts` (openTurn + audit)
- `apps/server/src/voice-routes.ts`, `packages/integrations/src/vapi.ts`
- `apps/web/src/hooks/useChat.ts`, `apps/web/src/api/chat.ts`
- `fly.toml`, `package.json`, `apps/web/package.json`, `config.ts`

Búsquedas: `anam` (0 código), `elevenlabs` (solo sonda y docs),
`tts|getUserMedia|MediaRecorder|AudioContext` (0 en apps), `WebSocket` (0 en
servidor), `vapi` (ruta + cliente), `defineTool`, `db.list` sin límite.

---

## 13. La frase que resume el informe

No hay que hacer que Anam sea rápida. Hay que hacer que **nuestro backend
deje de tardar dos segundos en decidir qué decir**, y eso se arregla moviendo
la base de datos de continente, sacando el trabajo no esencial del camino
crítico y dándole a la voz su propio proceso, su propio endpoint y su propio
presupuesto de tiempo.
