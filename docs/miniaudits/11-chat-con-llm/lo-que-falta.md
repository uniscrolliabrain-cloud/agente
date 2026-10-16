<!-- LO_QUE_FALTA_11_CHAT_LLM_V1 -->
# Lo que falta - 11 chat con LLM

> Estado: vivo. Se actualiza a medida que se cierra el frente.
> Base: lectura directa de los ficheros del repo + miniaudit + handoff.
> Uso: lista de lo que NO esta, sin contar lo ya aplicado.

---

## Que promete el modulo 11

El chat responde en <2s, con tono humano, sin alucinar. El Presenter decide el texto del SSE. Hay feedback durante el slow. El historial RAG mantiene contexto.

---

## Ya hecho (12 de 20 huecos)

| Hueco | Estado | Fuente |
|---|---|---|
| Presenter wireado | Hecho | Frente 10 (PRESENTER_WIRE_V1) |
| RAG como system message | Hecho | Frente 10 (RAG_CONTEXT_AS_SYSTEM_V1) |
| Dedup `remember_fact` | Hecho | Frente 10 (MemoryService.remember) |
| Feedback durante slow | Parcial | Frente 10 (Meta + ProgressEvent) |
| `delegate_task` visibilidad | Parcial | Frente 10 (agent.runtime_* al bus) |
| Cancelar desde chat | Hecho | `useChat.cancel` + boton en ChatInput |
| Streaming token a token | Hecho | Backend emite delta, typewriter es cosmetico |
| Timeout 2s fast | Hecho | FIX_11_A1 + FIX_11_A2 |
| Historial RAG a 8 | Hecho | FIX_11_B |
| `DELEGACION FORZADA` condicional | Hecho | FIX_11_J |
| `search_mail` configurable | Hecho | FIX_11_L |
| Modo degradado chat real | Hecho | FIX_11_O |
| Regla 9 paso a paso vs directo | Hecho | FIX_11_C |
| Retry `browse_web` | Hecho | FIX_11_M |
| Chips por rol | Hecho | FIX_11_G |
| Tests tono + timeout | Hecho | FIX_11_D + FIX_11_N |

---

## Pendiente - 5 cosas

### 1. `message.edited` event

**Que pide:** cuando el usuario edita un mensaje, emitir `message.edited` al bus y refrescar el mensaje.

**Que hay hoy:**
- El bus (`apps/server/src/engine/events/types.ts`) no tiene `message.edited` en `SYSTEM_EVENT_TYPES`.
- No hay endpoint backend para editar un mensaje.
- `useChat.ts` no tiene `editMessage`.
- `MessageBubble.tsx` no tiene boton de editar.

**Que falta:**
1. Anadir `"message.edited"` a `SYSTEM_EVENT_TYPES` en `types.ts`.
2. Endpoint nuevo: `PUT /api/threads/:threadId/messages/:messageId` que actualice el mensaje y emita el evento.
3. `useChat.editMessage(id, newContent)` que llame al endpoint y actualice el estado local.
4. Boton de editar en `MessageBubble.tsx` que dispare `onEdit` (prop nueva).
5. `MessageList.tsx` pasa `onEdit` a `MessageBubble`.
6. `ChatPanel.tsx` pasa `onEdit` desde `chat`.

**Tamano:** 6 patchsets. Necesita ver `apps/server/src/threads-routes.ts` (no visto).

---

### 2. Resumen al cerrar thread

**Que pide:** cuando se cierra un thread, guardar un resumen y persistirlo.

**Que hay hoy:**
- `useChat.ts` no tiene "cerrar thread".
- No hay endpoint de cerrar thread.
- No hay servicio de resumen.
- `useThreads.ts` no visto.

**Que falta:**
1. Endpoint `POST /api/threads/:threadId/close` que:
   - Marque el thread como cerrado.
   - Genere un resumen con el LLM (fast).
   - Persista el resumen.
2. Servicio de resumen (nuevo, en `apps/server/src/engine/`).
3. `useThreads.close(id)` que llame al endpoint.
4. UI para cerrar thread (boton en `SidebarV2` o `TopBarV2`).

**Tamano:** 4 patchsets. Necesita ver `threads-routes.ts` y `useThreads.ts`.

---

### 3. Validar `create_briefing` contra alucinacion

**Que pide:** el LLM puede inventar al crear un briefing. Validar que el resumen no sea alucinacion.

**Que hay hoy:** `create_briefing` en `conversation.ts` llama `artifactFromSource` y `memory.remember` sin validar.

**Que falta:**
1. Un verificador que compare el resumen con el historial del turno.
2. Si el resumen introduce hechos que no estan en el historial, marcarlo como `unverified` o rechazarlo.

**Tamano:** 1-2 patchsets. Depende de si hay un verificador reutilizable (`LlmVerifier` existe en `engine/verification/`).

**Riesgo:** alto. Es un problema abierto de LLMs. La validacion perfecta no existe. Un enfoque pragmatico: pedir al LLM que cite fuentes del historial en el briefing.

---

### 4. `watch_page` notificacion al disparar

**Que pide:** cuando el monitor dispara, avisar al usuario.

**Que hay hoy:** `watch_page` crea un monitor. El worker lo ejecuta (`observe` en `service.ts`) y emite `monitor.changed` al bus. Pero no hay notificacion persistida ni push.

**Que falta:**
1. En `service.ts`, en `observe()`, cuando `shouldNotify` es true, escribir en `notifications`.
2. O que el bus, con `notify: { title, body, key }`, lo haga (ya soporta `options.notify`).
3. Verificar que el frontend lee `monitor.changed` y muestra la notificacion.

**Tamano:** 1 patchset en `service.ts`. Ya hay infraestructura.

---

### 5. `maxSteps` por tenant

**Que pide:** el miniaudit dice que `maxSteps: 6` esta hardcodeado.

**Que hay hoy:** en `conversation.ts`, `maxSteps: Number(process.env.AGENT_MAX_STEPS ?? "6") || 6`. **Ya es configurable por env.** Lo que falta es por tenant.

**Que falta:**
1. Anadir `maxSteps?: number` a `TenantConfig`.
2. En `conversation.ts`, leer `tenantConfig.maxSteps` y usarlo.

**Tamano:** 2 patchsets. Depende de kernel (no corrupto, pero hay que ver `kernel.ts`).

---

## Parciales que no son pendientes formales

- **Feedback durante slow:** el `Meta` lee `ProgressEvent` y `systemContext` los inyecta en el prompt. Pero **no se muestran en la UI del chat**. El usuario no ve "el slow esta trabajando". Fix posible: emitir `progress` al bus y que `MessageList` lo pinte como un chip temporal.
- **`delegate_task` visibilidad:** los eventos `agent.runtime_spawned` / `_completed` / `_failed` van al bus. Pero **no se muestran en el chat**. Fix posible: suscribirse a esos eventos en `ChatPanel` y pintarlos.

---

## Bloqueantes

**1. Kernel corrupto.** Sigue sin arreglar. Bloquea el hueco 5 (`maxSteps` por tenant) y cualquier wire que dependa de `kernel.ts`.

**2. `threads-routes.ts` sin ver.** Para los huecos 1 (`message.edited`) y 2 (resumen al cerrar), necesito ver ese fichero. No lo he visto.

**3. `useThreads.ts` sin ver.** Para el hueco 2, necesito ver el hook.

---

## Lo que NO falta (aunque parezca)

- El Presenter ya esta wireado.
- El RAG ya va como system message.
- El streaming ya es token a token del backend.
- El typewriter es cosmetico (retrasa la visualizacion, no el stream).
- `remember_fact` ya deduplica.
- Cancelar desde el chat ya funciona.
- El timeout del fast ya es configurable por env.
- Las reglas de tono ya estan (1-9).
- Los chips ya se adaptan al rol.
- `browse_web` ya reintenta.
- `search_mail` ya es configurable.

---

## Orden recomendado

1. Arreglar kernel.
2. Hueco 4 (`watch_page` notificacion) — 1 patchset, sin dependencias.
3. Hueco 3 (validar `create_briefing`) — 1-2 patchsets, riesgo alto.
4. Hueco 1 (`message.edited`) — 6 patchsets, necesita `threads-routes.ts`.
5. Hueco 2 (resumen al cerrar thread) — 4 patchsets, necesita `threads-routes.ts` + `useThreads.ts`.
6. Hueco 5 (`maxSteps` por tenant) — 2 patchsets, depende de kernel.

---

## Definicion de terminado

- [ ] Kernel arreglado.
- [ ] `pnpm typecheck` verde (frontend + backend).
- [ ] `pnpm test` verde.
- [ ] Hueco 4 (notificacion monitor) aplicado y testeado.
- [ ] Hueco 3 (validacion briefing) aplicado.
- [ ] Hueco 1 (`message.edited`) aplicado end-to-end.
- [ ] Hueco 2 (resumen al cerrar thread) aplicado end-to-end.
- [ ] Hueco 5 (`maxSteps` por tenant) aplicado.
- [ ] UI muestra feedback del slow.
- [ ] UI muestra eventos de `delegate_task`.

---

FIN DEL DOC.
