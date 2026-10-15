# PLAN MAESTRO â€” 6 FASES / 6 IAs (repo "mix de un mega")

> Generado el 13/10/2026 sobre `C:\Users\Alfonso\Desktop\git hub repos\agente`.
> Objetivo: que **6 IAs distintas** (cada una sin ver el repo completo) arreglen el
> sistema en 6 fases ordenadas por impacto en cliente. Cada fase es autocontenida:
> quÃ© tocar, el fix ya redactado, por quÃ© existe el bug, cÃ³mo verificar y quÃ© NO tocar.
>
> **Regla de oro para todas las IAs:** este repo es pnpm + TypeScript estricto.
> Un cambio "hecho" = compila (`pnpm typecheck` verde) + su test pasa + es observable.
> Si no puedes verificar las 3, no lo des por hecho. No inventes ficheros: todas las
> rutas de este doc existen y estÃ¡n verificadas.

---

## CÃ³mo usar este doc (lÃ©elo antes de empezar)

Cada IA recibe **una sola fase**. Le pasas:
1. Este doc completo (para que entienda el sistema y lo que NO debe tocar).
2. La secciÃ³n de su fase + el/los fichero(s) implicado(s) (cÃ³pialos tÃº al "repo mix").
3. El comando de verificaciÃ³n de su fase.

**Orden obligatorio:** F1 â†’ F2 â†’ F3 â†’ F4 â†’ F5 â†’ F6. Las fases 3-6 dependen de que
F1 (typecheck) y F2 (runtime de workspaces) estÃ©n verdes. Si trabajÃ¡is en paralelo,
que cada IA aplique su parche sobre ramas separadas y se integren en este orden.

**DefiniciÃ³n de "hecho" (los 5 criterios, obligatorios en cada fase):**
1. Se ejecuta (el cÃ³digo corre de verdad, no solo estÃ¡ declarado).
2. Pasa por los sitios correctos (usa el resolver/tenant/servicio real, no un valor fijo).
3. Tiene test (existe en `tests/` y cubre el camino que tocas).
4. Es observable (mÃ©trica, log o audit).
5. Hace lo que debe (el comportamiento correcto, verificado).

---

## Mapa del sistema (contexto comÃºn para las 6 IAs)

Stack: pnpm monorepo. Server en `apps/server/src` (Hono + TypeScript estricto, NodeNext).
Web en `apps/web/src`. Paquetes compartidos en `packages/` (domain, workspaces con 34 mÃ³dulos).
Tests con `node --test` vÃ­a `tsx` (`pnpm test`). Typecheck con `tsc --noEmit` (`pnpm typecheck`).

Piezas clave:
- **Bus de eventos**: `apps/server/src/engine/events/` (types.ts = enum `SystemEventType`,
  schemas.ts = payloads Zod por tipo, el `EventBus` valida en `emit`).
- **Kernel cognitivo**: `apps/server/src/kernel/` (turns, thoughts, promoter, Meta, autores).
- **Motor de conversaciÃ³n**: `apps/server/src/engine/conversation.ts` (agente del chat).
- **Workspaces**: `packages/workspaces/src/index.ts` (barrel) + `packages/workspaces/NN-name/`.
- **Servicio principal**: `apps/server/src/engine/service.ts` (`AgentService`).
- **Arranque**: `apps/server/src/index.ts` y `apps/server/src/app.ts`.

## FASE 1 â€” Typecheck verde (IA-1)

**Objetivo:** `pnpm typecheck` (= `tsc --noEmit` + typecheck de `apps/worker`) en exit 0.

**Estado al entregar esta fase:** âœ… **YA ESTÃ VERDE.** `tsc --noEmit` terminÃ³ en
`EXITCODE=0` (0 errores) tras reparar `service.ts` y arreglar `schemas.ts`
[verificado ejecutÃ¡ndolo el 13/10/2026]. La IA-1 solo debe **mantenerlo verde** y
cerrar el tipo de bug que lo rompiÃ³, para que no vuelva a pasar.

**QuÃ© se arreglÃ³ para llegar aquÃ­ (contexto, no lo repitas):**
- `apps/server/src/engine/service.ts`: estaba corrupto (613 MB de mojibake). Ya reparado. No tocar.
- `packages/workspaces/src/index.ts` (barrel): los 34 imports apuntaban a `./01-gmail/src/index.ts`
  y debÃ­an ser `../01-gmail/src/index.ts`. Ya corregido.
- `packages/workspaces/NN-name/src/contract.ts` (los 34): importaban `../../../src/contracts/index.ts`
  y debÃ­a ser `../../src/contracts/index.ts`. Ya corregido.
- Varios imports relativos rotos en `engine/events/consumers/*`, `engine/log-reexport.ts`,
  `engine/events/retention-purge.ts`. Ya corregidos.
- `kernel/subscribers/events.ts`: usaba `kernel.getTurn(...)` (no existe) â†’ `kernel.deps.store.getTurn(...)`. Ya corregido.
- `engine/conversation.ts`: variable `hints` fuera de Ã¡mbito â†’ `this.pendingMetaHints`. Ya corregido.
- `tsconfig.json`: faltaba `"@openmuse/workspaces": ["./packages/workspaces/src/index.ts"]` en `paths`. Ya aÃ±adido.
- `engine/events/schemas.ts`: `"verification.disagreement"` nunca se cerraba y engullÃ­a ~132 eventos;
  habÃ­a un `verification.executed` duplicado y faltaban `sop.step.completed`, `sop.completed`, `build.applied`. Ya corregido.

**Tarea de la IA-1 (preventiva):** el bug de `schemas.ts` fue un `}` de mÃ¡s/de menos que
tsc solo detecta como "faltan propiedades", no como error de sintaxis. AÃ±ade una red de
seguridad para que un `Record<SystemEventType, ...>` nunca mÃ¡s pueda quedar desalineado
en silencio.

Archivos:
- `apps/server/src/engine/events/schemas.ts`
- `tests/event-bus.test.ts` (ya cubre: "todo SystemEventType tiene schema y un payload minimo valido")

**Fix a aplicar â€” test que detecta desalineaciÃ³n enumâ†”schemas:**
En `tests/` crea `tests/event-schemas-coverage.test.ts` con este contenido:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { SYSTEM_EVENT_TYPES } from "../apps/server/src/engine/events/types.ts";
import { payloadSchemas } from "../apps/server/src/engine/events/schemas.ts";

// Si alguien aÃ±ade un evento al enum y se le olvida el schema (o deja
// un bloque sin cerrar que engulle al resto), este test revienta.
test("cada SystemEventType tiene exactamente un schema y ninguno sobra", () => {
  const enumSet = new Set(SYSTEM_EVENT_TYPES as readonly string[]);
  const schemaKeys = Object.keys(payloadSchemas);
  const dupes = schemaKeys.filter((k, i) => schemaKeys.indexOf(k) !== i);
  assert.deepEqual(dupes, [], "hay claves duplicadas en payloadSchemas");
  const faltan = [...enumSet].filter((t) => !(t in payloadSchemas));
  assert.deepEqual(faltan, [], `faltan schemas: ${faltan.join(", ")}`);
  const sobran = schemaKeys.filter((k) => !enumSet.has(k));
  assert.deepEqual(sobran, [], `schemas que no estan en el enum: ${sobran.join(", ")}`);
});
```

**CÃ³mo verificar:**
```
pnpm typecheck     # debe terminar sin errores
pnpm test tests/event-schemas-coverage.test.ts   # debe pasar
```
Resultado esperado: typecheck exit 0; el test nuevo en verde. El test existente
`tests/event-bus.test.ts:83` ya cubre el caso, asÃ­ que tendrÃ¡s dos redes.

**NO toques:** `service.ts` (reparado, gigante, sensible), ni el resto de ficheros de events
salvo `schemas.ts` y el test nuevo.

## FASE 2 â€” Workspaces cargan en runtime (IA-2)

**Objetivo:** que el barrel `packages/workspaces/src/index.ts` y los 34 mÃ³dulos se
importen en tiempo de ejecuciÃ³n (no solo que compilen), y que cada uno persista de verdad.

**Estado al entregar esta fase:** âœ… **La carga ya funciona.** Importando el barrel con
`node --import tsx` el resultado es `ALL_WORKSPACES_LEN=34` (los 34 mÃ³dulos cargan)
[verificado el 13/10/2026]. Lo que arreglÃ³ F1 (las rutas `../` del barrel y los imports
de `contract.ts`) es lo que permitÃ­a cargar en runtime; antes fallaba con
`ERR_MODULE_NOT_FOUND: Cannot find module .../packages/workspaces/src/01-gmail/src/index.ts`.

**Lo que la IA-2 debe cerrar (el hueco real):** los comandos de los 34 workspaces
**persisten en el store interno pero no llaman a ninguna API externa**. Grep verificado:
`fetch(` / `https://` / `axios` = **0 ocurrencias** en los 34 `src/application/commands.ts`.
Es decir: Gmail/WhatsApp/Stripe/HubSpotâ€¦ guardan datos en `records` pero no hablan con
el servicio real. Eso es "a medias", no "hecho".

Archivos por workspace (patrÃ³n, sustituye NN-name):
- `packages/workspaces/NN-name/src/application/commands.ts` (handlers)
- `packages/workspaces/NN-name/src/application/queries.ts`
- `packages/workspaces/NN-name/src/contract.ts` (define `commands`/`queries`/`capabilities`/`views`)
- `packages/workspaces/src/contracts/index.ts` (tipos `WorkspaceServices`, `CommandResult`, etc.)

**CÃ³mo es un handler hoy (01-gmail, verificado):** recibe `(services, ctx, env)`,
valida el payload con Zod, hace `services.db.insertIfAbsent/put/get` y emite al bus con
`services.bus?.emit(...)`. Ejemplo real simplificado:
```ts
async function sendMessage(services, ctx, env) {
  const p = sendMessagePayload.parse(env.payload);
  const id = env.idempotencyKey ?? `msg-${crypto.randomUUID()}`;
  await services.db.insertIfAbsent(ctx.owner, "ws-gmail-messages", entity);
  await services.bus?.emit(ctx.owner, "email.sent", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id };
}
```

**Tarea de la IA-2 (elige UNO, el de mÃ¡s impacto, y hazlo bien):**
Empieza por `02-whatsapp` (tiene UI real: 11 tsx + api.ts de 217 lÃ­neas + hook, el Ãºnico
con frontend conectado junto a `14-zendesk`). Convierte `whatsapp.message.send` de
"guardar en records" a "enviar por la API de WhatsApp y guardar el recibo".

**PatrÃ³n del fix (adaptado a la firma real):**
```ts
async function sendMessage(services, ctx, env) {
  const p = sendMessagePayload.parse(env.payload);
  // 1) Llamada externa REAL (antes no existÃ­a). Token desde vault/config del tenant.
  const token = await services.vault?.get(ctx.owner, "whatsapp.token"); // o donde guarde secretos el repo
  const res = await fetch(`https://graph.facebook.com/v20.0/${p.phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: p.to, type: "text", text: { body: p.body } }),
  });
  const external = await res.json();
  if (!res.ok) throw new Error(`whatsapp send failed: ${res.status}`);
  // 2) Persistir el recibo con el id externo (idempotencia).
  const id = env.idempotencyKey ?? `msg-${external.messages?.[0]?.id ?? crypto.randomUUID()}`;
  await services.db.insertIfAbsent(ctx.owner, "ws-whatsapp-messages", { id, ..., externalId: external.messages?.[0]?.id });
  await services.bus?.emit(ctx.owner, "whatsapp.message.sent", { kind: "system", id: ctx.workspaceId }, { entityId: id }, { correlationId: ctx.correlationId });
  return { status: "ok", entityId: id, externalId: external.messages?.[0]?.id };
}
```
> Nota para la IA: primero **lee** `packages/workspaces/src/contracts/index.ts` y un
> `commands.ts` completo (01-gmail) para copiar la firma exacta. `services.vault` es una
> suposiciÃ³n: confirma dÃ³nde guarda secretos el repo (`apps/server/src/vault.ts`?) antes
> de usarlo. Si no hay vault inyectado, deja el token como parÃ¡metro y mÃ¡rcalo como
> "pendiente de secreto" en un comentario, pero **no inventes** la ruta.

**CÃ³mo verificar (los 5 criterios):**
1. Compila: `pnpm typecheck` sigue en verde.
2. Runtime: el smoke test que carga el barrel da 34 (ya pasa).
3. Test: crea `tests/workspaces-02-whatsapp.test.ts` que, con un `fetch` mockeado
   (el `tests/setup.ts` ya bloquea hosts externos), verifique que `sendMessage` llama a
   la URL de WhatsApp y persiste el recibo.
4. Observable: el comando emite `whatsapp.message.sent` al bus (ya existe el schema).
5. Correcto: con mock 200 â†’ status "ok" + externalId; con mock 500 â†’ lanza.

**NO toques:** el barrel ni los otros 33 workspaces en esta fase (eso es para mÃ¡s IAs o
mÃ¡s iteraciones). No toques `service.ts`.

## FASE 3 â€” Wiring de negocio roto (IA-3) â€” la de MÃS impacto en cliente

**Objetivo:** que el sistema deje de mentir sobre lo que ejecutÃ³, y que las aprobaciones
diferidas y la membership de tenants sean coherentes.

**Estado al entregar esta fase:** los 3 bugs estÃ¡n diagnosticados y localizados con
exactitud (lÃ­neas reales) [verificado en ESTADO-REAL.md Â§4]. Ninguno arreglado aÃºn.

---

### 3.1 â€” `DeferredActions.run` marca "executed" sin ejecutar (el #1 de impacto)

**El bug** [verificado leyendo `apps/server/src/index.ts` y `apps/server/src/actions-deferred.ts`]:
El callback `run(owner, actionId)` **solo lee** la acciÃ³n de la DB (`db.get(..., "actions", actionId)`),
hace `void action;` y **no ejecuta nada**. El comentario del propio cÃ³digo dice
"Por ahora, marcamos la acciÃ³n como ejecutada". El `tick()` de `actions-deferred.ts`
(aproximadamente lÃ­neas 98-111) llama a ese `run`, y como no lanza excepciÃ³n, pone
`status: "executed"` y emite `action.executed`. Resultado: **el cliente aprueba una acciÃ³n,
el sistema responde "ejecutada" y en realidad la descartÃ³.**

**Por quÃ© importa:** es el Ãºnico punto donde el sistema falla en silencio. Los tests en
rojo hacen ruido; esto miente al cliente sobre el estado de su negocio.

**Archivos:**
- `apps/server/src/index.ts` (donde se construye el callback `run`)
- `apps/server/src/actions-deferred.ts` (`tick()` que consume el callback)
- `apps/server/src/actions.ts` (el tipo `deferred?` y dÃ³nde se inyecta)
- `tests/actions-deferred-wire.test.ts` (test existente â€” hoy afirma el comportamiento roto)

**Tarea de la IA-3:** reemplaza el cuerpo de `run` para que **ejecute de verdad** la acciÃ³n
antes de marcarla. PatrÃ³n (la IA debe adaptarlo a la firma real tras leer los ficheros):

```ts
// ANTES (roto): lee y descarta, pero tick() lo marca "executed".
const run = async (owner: string, actionId: string) => {
  const action = await db.get(owner, "actions", actionId);
  void action;
  // "Por ahora, marcamos la accion como ejecutada"  <-- mentira
};

// DESPUÃ‰S: ejecuta el adaptador real de la acciÃ³n y solo entonces deja que tick()
// la marque "executed". Si la ejecuciÃ³n falla, que lance para que tick() la marque "failed".
const run = async (owner: string, actionId: string) => {
  const action = await db.get(owner, "actions", actionId);
  if (!action) throw new Error(`accion no encontrada: ${actionId}`);
  // Ejecuta por el adaptador correspondiente al kind de la acciÃ³n.
  // (La IA debe localizar el executor real del repo, p. ej. agent/actions execute.)
  await executeAction(owner, action);          // <- llamada real, sin void
  // No escribas status aquÃ­: tick() ya pone "executed" si no lanza.
};
```
> Para la IA: **localiza** el executor real antes de escribir `executeAction`. Si no
> existe un executor Ãºnico, llama al mismo camino que usa la aprobaciÃ³n inmediata
> (`actions.ts` â†’ adaptador). **No inventes** una funciÃ³n; si no la encuentras, lanza
> `throw new Error("executor no cableado")` para que al menos quede `failed` y no
> `executed` â€” un fallo honesto es mejor que una mentira verde.

**Actualiza el test** `tests/actions-deferred-wire.test.ts`: hoy afirma que "approve con
deferred pasa a scheduled en vez de ejecutar". AÃ±ade un caso: con un ejecutor mock que
lanza, el `tick()` debe terminar en `status: "failed"` y emitir `action.failed`, NO
`action.executed`.

**CÃ³mo verificar (5 criterios):**
1. Ejecuta: `tick()` con acciÃ³n diferida mock â†’ el mock se llama.
2. Sitio correcto: usa el mismo executor que la aprobaciÃ³n inmediata.
3. Test: `pnpm test tests/actions-deferred-wire.test.ts` en verde (con el caso nuevo).
4. Observable: emite `action.executed` solo si el mock resolviÃ³; `action.failed` si lanzÃ³.
5. Correcto: mock 200 â†’ executed; mock lanza â†’ failed.

**NO toques:** el orden del `tick()` ni el CAS del store (funcionan). No toques `service.ts`.
### 3.2 â€” `tenant-membership` se escribe con dos `id` distintos

**El bug** [verificado en 3 sitios]: la misma "kind" se escribe con `id` inconsistente:
- `engine/tenant.ts` â†’ `setMembership` escribe `db.put(owner, "tenant-membership", { id: "default", tenantId, ... })` â€” **id fijo `"default"`**.
- `engine/service.ts` (`ensureTenant`, ~lÃ­nea 969) â†’ `insertIfAbsent(owner, "tenant-membership", { id: "default", tenantId })` â€” **id fijo `"default"`**.
- `admin-tenants.ts` (~lÃ­nea 126) â†’ `db.put("system", "tenant-membership", { id: body.tenantId, tenantId: body.tenantId })` â€” **id = tenantId, scope "system"**.

Lectores: `index.ts` lista scope `"system"` (solo ve las de admin); `TenantService.resolve`
lee `get(owner, kind, "default")`; los consumidores hacen `scan("tenant-membership")` global.
**Consecuencia:** la membership por-owner (id "default") y la global (id tenantId, scope
"system") conviven con `id` y scope distintos â†’ un tenant creado por admin no lo ve
`TenantService.resolve` y viceversa.

**Tarea de la IA-3:** unifica el criterio. Regla propuesta (decÃ­dela tÃº y documÃ©ntala):
el `id` del record = el `tenantId` (no `"default"`), y el scope = el owner. Es decir,
alinea `tenant.ts` y `service.ts` con lo que ya hace `admin-tenants.ts`. Cambia las dos
escrituras `id: "default"` â†’ `id: tenantId` y ajusta `TenantService.resolve` para que lea
`get(owner, kind, tenantIdResuelto)` o itere. AÃ±ade un test
`tests/tenant-membership-coherence.test.ts` que cree un tenant por los 3 caminos y
verifique que `resolve(owner)` lo encuentra en todos.

**NO toques:** el CAS del store ni el shape del record (solo `id`/scope).

---

### 3.3 â€” Personas (Laia + 12) no cargan en Docker y el bootstrap real no avisa

**El bug** [verificado]: `.dockerignore` excluye `clientes/`, asÃ­ que en la imagen Docker
no existen las carpetas de personas â†’ `loaded === 0`. `clientsDirFrom("/data")` = `/clientes`
(inexistente). El `console.warn` de "0 personas" solo vive en el camino de `index.ts`
cuyo registry **se descarta**; el bootstrap que alimenta el registry real (`app.ts` ~89-100)
**no avisa cuando loaded=0 y failed=0**.

**Archivos:**
- `.dockerignore` (excluye `clientes/` y `tests`)
- `Dockerfile` (stage runtime: copia solo `node_modules`, `dist`, `package.json`, workspace-template)
- `apps/server/src/kernel/personas-bootstrap.ts` (aviso `loaded===0`)
- `apps/server/src/app.ts` (~89-100, el bootstrap que sÃ­ importa el registry)

**Tarea de la IA-3 (dos partes independientes):**
1. **Imagen:** incluye `clientes/` en el runtime del Dockerfile (COPY explÃ­cito) o monta
   un volumen. Verifica con `docker build` que `clientes/` existe dentro de la imagen.
2. **Aviso honesto:** en el bootstrap de `app.ts` (~89-100), si `loaded === 0` aÃ±ade un
   `console.warn` (hoy solo loguea cuando `loaded>0 || failed>0`, asÃ­ que un 0/0 pasa en
   silencio). Ejemplo:
```ts
if (loaded === 0 && failed === 0) {
  console.warn(`[personas] 0 personas cargadas para default (clientes/default/personas vacÃ­o o ausente). Revisa .dockerignore/volumen.`);
}
```

**CÃ³mo verificar (3):** build Docker â†’ `clientes/` presente â†’ arranque con personas > 0;
o arranque sin clientes â†’ se ve el `console.warn` (no silencio).

**NO toques:** los ficheros `persona.json` ni el schema de personas.

## FASE 4 â€” Kernel / chat: meta-hints y presenter dejan de ser decorativos (IA-4)

**Objetivo:** que los "meta-hints" del kernel lleguen de verdad al prompt del modelo, y que
el texto del presenter calculado en el cierre del turno no se descarte.

**Estado al entregar esta fase:** ambos puntos diagnosticados con lÃ­neas exactas
[verificado en `apps/server/src/engine/conversation.ts`]. Son "existe pero no hace nada".

---

### 4.1 â€” `metaHintsPromptBlock` devuelve siempre `""`

**El bug** [verificado, lÃ­neas 41-44 de `conversation.ts`]: el getter que deberÃ­a inyectar
los hints del kernel (lo que el "slow" aprendiÃ³) en el prompt es:
```ts
// CONVERSATION_META_HINTS_PROMPT_V1
private get metaHintsPromptBlock(): string {
  return "";
}
```
Siempre cadena vacÃ­a. Los hints se calculan y se guardan en `this.pendingMetaHints`
(lÃ­neas 817-836), se sobreviven al turno siguiente (`lastMetaHint`, lÃ­neas 70-77)â€¦ pero
**nunca se meten en el prompt del modelo** porque este getter devuelve `""`.

**Archivo:** `apps/server/src/engine/conversation.ts` (getter en 42-44; estado de hints en 30-38, 70-77, 817-836).

**Tarea de la IA-4:** haz que el getter construya el bloque con los hints pendientes,
respetando el TTL/consumo que ya existe (`metaHintsMaxAgeMs`, `lastMetaHintUsedAt`).
PatrÃ³n:
```ts
private get metaHintsPromptBlock(): string {
  if (this.pendingMetaHints.length === 0) return "";
  const lineas = this.pendingMetaHints.map((h) => `- [${h.urgency}] ${h.message}`);
  return `\nContexto del sistema (Ãºsalo si es relevante, no lo menciones salvo que ayude):\n${lineas.join("\n")}\n`;
}
```
> Ojo con el doble consumo: los hints ya se leen con `lastMetaHint` al inicio del turno
> (lÃ­neas 70-77) y se limpian al persistir (836). AsegÃºrate de que el bloque se aplique
> **en el prompt de UNA sola vuelta** y no se duplique. Verifica contra el flujo real.

**CÃ³mo verificar:** test de conversaciÃ³n donde el kernel produzca un hint (p. ej. simula
`slow_ready_fast_idle`) y asÃ©rtate de que la cadena de prompt que recibe el modelo contiene
el texto del hint. Hoy no hay test que lo cubra â†’ crÃ©alo.

**NO toques:** la lÃ³gica de evaluaciÃ³n de `Meta` ni el persist (funcionan). No toques `service.ts`.

---

### 4.2 â€” En `closeKernelTurn`, el texto del presenter se calcula y se descarta

**El bug** [verificado, lÃ­neas 838-847]: en el cierre del turno se calcula el texto del
presenter y se tira a la basura:
```ts
let presenterText = "";
try {
  const { presenterTurnToSse } = await import("../kernel/observers/presenter-sse.ts");
  const presented = await presenterTurnToSse(this.service.kernel, ctx, turnId, "");
  presenterText = presented.text;
} catch {
  presenterText = "";
}
void presenterText;   // <-- se calcula y se descarta
```
Nota: en la ruta principal del turno (lÃ­neas 748-777) `presenterText` **sÃ­** se usa para
emitir `view.resolved` y persistir. Pero en este segundo sitio (cierre) se descarta. Es
cÃ³digo muerto o un segundo punto que quedÃ³ a medias.

**Archivo:** `apps/server/src/engine/conversation.ts` (838-847).

**Tarea de la IA-4:** decide y documenta. Opciones (elige una, no ambas):
- Si es redundante con la ruta principal (748-777): **borra** el bloque 838-847 para que no
  confunda (cÃ³digo muerto que llama a `presenterTurnToSse` dos veces por turno).
- Si debe cerrar el turno con un texto final distinto: **Ãºsalo** â€” pÃ¡salo a donde se cierra
  el turno (p. ej. emite otro evento o persistÃ©lo) en vez de `void presenterText`.

Lo importante: que no quede `void presenterText` (calcular y tirar). AÃ±ade/ajusta un test
que demuestre que el texto del presenter se consume en el sitio correcto exactamente una vez.

**NO toques:** `presenterTurnToSse` ni el presenter del kernel. No toques `service.ts`.

## FASE 5 â€” Observabilidad: mÃ©tricas y alertas reales (IA-5)

**Objetivo:** que las alertas del sistema se alimenten de contadores reales, no de ceros
escritos a mano, y que los consumidores del bus escuchen a los tenants correctos.

**Estado al entregar esta fase:** el hueco estÃ¡ localizado con exactitud
[verificado en `apps/server/src/index.ts:197-216`].

---

### 5.1 â€” 5 de 8 mÃ©tricas del snapshot de alertas estÃ¡n en 0 por cÃ³digo

**El bug** [verificado, `apps/server/src/index.ts` lÃ­neas 197-216]: `buildAlertDefinitions`
recibe un `metricsSnapshot` donde solo `http5xx`, `httpTotal` y `workerRunning` son reales.
Estas cinco estÃ¡n **hardcodeadas a 0**:
```ts
return {
  http5xx: snap.http5xx,
  httpTotal: snap.httpTotal,
  taskFailuresLastHour: 0,     // <- mentira
  tenantQuotaExceeded: 0,      // <- mentira
  workerRunning: agent.worker.running,   // real
  circuitOpenCount: 0,         // <- mentira
  deadLetterCount: 0,          // <- mentira
  outcomeUnknownCount: 0,      // <- mentira
};
```
**Consecuencia:** cualquier alerta definida sobre esas mÃ©tricas (tareas fallando, cuota de
tenant agotada, dead-letters acumulados, circuit breaker abierto) **nunca puede dispararse**.
El cliente se entera de los incidentes antes que el sistema.

**Archivos:**
- `apps/server/src/index.ts` (197-216, el snapshot)
- `apps/server/src/metrics/registry.ts` (dÃ³nde viven los contadores/gauges reales)
- `apps/server/src/alerts/definitions.ts` (quÃ© alertas usan cada mÃ©trica)

**Tarea de la IA-5:** alimenta cada mÃ©trica con su contador real. El `http5xx/httpTotal`
ya da el patrÃ³n (lee `alertMetrics.counters.get("openmuse_http_requests_total")` y suma
samples). Repite ese patrÃ³n para las demÃ¡s. Antes, **verifica** quÃ© contadores existen ya
en `registry.ts` y si alguno se incrementa de verdad; si no existe, crÃ©alo en el punto
donde ocurre el hecho (p. ej. `taskFailuresLastHour` al completar una tarea como `failed`,
`deadLetterCount` consultando la cola de dead-letter, `circuitOpenCount` del circuit
breaker). Ejemplo del patrÃ³n:
```ts
const deadCounter = (alertMetrics as ...).counters?.get("openmuse_dead_letter_total");
let deadLetterCount = 0;
if (deadCounter) for (const s of deadCounter.samples.values()) deadLetterCount += s.value;
```
> Para la IA: **no inventas nombres de contador**. Lee `registry.ts` y grepea dÃ³nde se
> incrementan (`globalMetrics.inc(...)`). Si un contador no se incrementa en ningÃºn sitio,
> eso tambiÃ©n es un bug a reportar en la fase (la mÃ©trica existe pero nadie la alimenta).

**CÃ³mo verificar (5 criterios):** crea un test que fuerce 3 tareas fallidas en la Ãºltima
hora y asÃ©rtate de que `taskFailuresLastHour === 3` en el snapshot (hoy darÃ­a 0). Lo mismo
para dead-letter si hay cola. Cada mÃ©trica: existe el contador + se incrementa en el sitio
real + el snapshot lo lee + la alerta puede dispararse.

**NO toques:** `AlertService` ni las definiciones de alerta salvo para leer quÃ© usan. No toques `service.ts`.

---

### 5.2 â€” `MetricsRegistry.quantile` con mÃºltiples samples

**Estado:** âœ… verificado correcto. `quantile()` (aproximadamente `registry.ts:68-94`) hace
aproximaciÃ³n por buckets tipo Prometheus (ordenar, acumular, elegir el primer bucket cuyo
acumulado â‰¥ qÂ·total, con fila `+Inf`). Es vÃ¡lido salvo que el histograma tenga miles de
series por etiqueta (usa `rows.find` en bucle doble â†’ O(nÂ²) menor, sin impacto prÃ¡ctico).
**La IA-5 solo debe confirmarlo**, no reescribirlo, salvo que aÃ±ada un test que lo cubra
(hoy no hay test directo de quantile con >1 sample).

**NO toques:** `registry.ts` salvo para aÃ±adir el contador que falte en 5.1.

## FASE 6 â€” Tests en rojo (IA-6)

**Objetivo:** poner en verde los ficheros de test que fallan, sin tocar cÃ³digo de producciÃ³n
salvo que el fallo revele un bug real (y entonces, arreglar el bug, no el test).

**Estado al entregar esta fase:** la Ãºltima ejecuciÃ³n completa (`pnpm test`, antes de los
fixes de F1) dio **274 âœ” / 57 âœ˜** con estos ficheros en rojo [verificado del log de tests]:

| Fichero | fallos | ok |
|---|---|---|
| `tests/model-worker.test.ts` | 10 | 69 |
| `tests/crash-recovery.test.ts` | 10 | 79 |
| `tests/tasks-reassign.test.ts` | 8 | 24 |
| `tests/conversation-browser.test.ts` | 4 | 0 |
| `tests/workflows.test.ts` | 3 | 0 |
| `tests/concurrency.test.ts` | 2 | 4 |
| `tests/kernel-presenter.test.ts` | 2 | 4 |
| `tests/computer-api.test.ts` | 2 | 12 |
| `tests/kernel.test.ts` | 2 | 0 |
| `tests/browsA ACTer.test.ts` | 2 | 18 |
| `tests/laia-hierarchy.test.ts` | 2 | 20 |
| `tests/kernel-persona-isolation.test.ts` | 2 | 0 |
| `tests/agent-api.test.ts` | 2 | 20 |
| `tests/memory.test.ts` | 2 | 0 |
| `tests/auth.test.ts` | 2 | 2 |
| `tests/api.test.ts` | 2 | 8 |

> Nota: los tiempos por fichero eran enormes antes de reparar `service.ts` (hasta 965 s en
> `computer-api`). Tras la reparaciÃ³n bajaron a 7-45 s. Al reejecutar `pnpm test` ahora,
> **re-mide** este cuadro: algunos fallos pueden ser timeouts heredados de la corrupciÃ³n ya
> resueltos y desaparecer solos. Empieza por reejecutar la suite y quedarte con lo que
> **siga** rojo de verdad.

**CÃ³mo trabaja la IA-6 (regla de oro anti-maquillaje):**
Un test rojo es de dos tipos. DistÃ­nguelos antes de tocar nada:
- **(A) El test revela un bug real** â†’ arregla el **cÃ³digo de producciÃ³n**, no el test.
  Ejemplo tÃ­pico aquÃ­: `agent-api`/`auth`/`api` (E2E del chat) o los del kernel. Si el
  fallo es de wiring (algo no cableado), es un bug real â†’ arrÃ©glalo en el sitio correcto.
- **(B) El test estÃ¡ desactualizado** (asume un comportamiento que ya cambiÃ³ a propÃ³sito)
  â†’ actualiza el test **y documenta por quÃ©** en el propio test.

**Prohibido:** borrar tests, poner `skip`, subir timeouts para que "pasen", o cambiar
aserciones para que coincidan con un comportamiento roto. Eso convierte la red de seguridad
en decoraciÃ³n.

**Prioridad de trabajo (por impacto en cliente):**
1. `tests/agent-api.test.ts`, `tests/auth.test.ts`, `tests/api.test.ts` â€” cubren el E2E del
   chat y la API. Si estÃ¡n rojos, ningÃºn cambio futuro llega con red. **Estos primero.**
2. `tests/kernel*.test.ts` y `tests/laia-hierarchy.test.ts` â€” el kernel cognitivo (Promote,
   Meta, aislamiento por persona, Laia). RelaciÃ³n con F3/F4.
3. `tests/conversation-browser.test.ts`, `tests/tasks-reassign.test.ts`, `tests/workflows.test.ts`,
   `tests/memory.test.ts`, `tests/concurrency.test.ts` â€” flujos de negocio.
4. `tests/model-worker.test.ts`, `tests/crash-recovery.test.ts`, `tests/computer-api.test.ts`,
   `tests/browser.test.ts` â€” workers/computer. Muchos fallos y muchos ok: sospecha de
   timeouts o de entorno (Docker/Playwright), revÃ­salos con calma.

**CÃ³mo verificar cada fichero:**
```
pnpm test tests/<fichero>.test.ts
```
Debe acabar en verde **sin** haber tocado las aserciones para forzarlo. Cuando termine,
la suite completa `pnpm test` debe mejorar el ratio 274/57. Reporta cuÃ¡ntos âœ”/âœ˜ quedan.

**NO toques:** `service.ts` (reparado), ni el cÃ³digo de producciÃ³n salvo que el test revele
un bug real (caso A). No toques el barrel de workspaces.

---

## Resumen de las 6 fases

| # | Fase | Objetivo | Impacto cliente | IA |
|---|------|----------|-----------------|----|
| 1 | Typecheck verde | Compilar sin errores | Habilita TODO lo demÃ¡s | IA-1 |
| 2 | Workspaces en runtime | Que el barrel y los 34 mÃ³dulos carguen | Apps que ven los clientes | IA-2 |
| 3 | Wiring de negocio roto | DeferredActions, tenant-membership, personas en Docker | Confianza en acciones | IA-3 |
| 4 | Kernel / chat | meta-hints y presenter dejan de ser decorativos | Calidad de respuesta | IA-4 |
| 5 | Observabilidad | MÃ©tricas y alertas reales | Detectar incidentes | IA-5 |
| 6 | Tests en rojo | Los 57 fallos de 15 ficheros | Red de seguridad | IA-6 |

---

## Estado verificado al escribir este doc

- `apps/server/src/engine/service.ts`: estaba corrompido (613 MB de mojibake); **ya reparado**
  a 124 KB. No tocar su estructura salvo lo indicado en tu fase. [verificado]
- Typecheck: ver resultado real en la secciÃ³n F1 (se rellenÃ³ ejecutando `tsc --noEmit`).

---

## Cómo entregar cada fase a su IA (plantilla de prompt)

Para cada IA, cópiale este bloque y rellena `[N]` y `[FICHEROS]`. No le des el repo entero:
dale el doc + los ficheros de su fase.

```
Eres la IA encargada de la FASE [N] de un repo pnpm+TypeScript (NodeNext, estricto).
No ves el repo completo; solo este documento y los ficheros que te adjunto.

REGLAS:
- "Hecho" = compila (pnpm typecheck) + su test pasa + es observable + comportamiento correcto.
  Si no puedes verificar las 4, dilo y no lo des por hecho. No inventes rutas ni funciones.
- Lee primero los ficheros adjuntos ENTEROS antes de tocar nada.
- Si el fix que te propongo no encaja con lo que lees, ADAPTALO y explícame el porqué;
  no fuerces el patrón a ciegas.

TU FASE: [pega aquí la sección "FASE [N]" completa de este doc]
FICHEROS ADJUNTOS: [lista de rutas absolutas]

Devuélveme: (1) el diff exacto que aplicarías, (2) el comando de verificación y su salida
esperada, (3) cualquier sitio donde mi diagnóstico no coincida con lo que has leído.
```

**Integración:** aunque las fases estén pensadas para ser independientes, el orden de merge
recomendado es F1 → F2 → F3 → F4 → F5 → F6, y **F3-F6 asumen que F1/F2 están verdes**
(typecheck en 0 y barrel cargando). Si dos IAs tocan el mismo fichero (p. ej. `conversation.ts`
en F4 y algún test de F6), resuélvelo al integrar: manda producción primero, tests después.

**Anti-maquillaje (aplica a las 6 IAs):** queda prohibido en todas las fases: borrar o
`skip` tests, subir timeouts para disimular, cambiar aserciones para que coincidan con un
comportamiento roto, o usar `as never`/`void x` para silenciar un error real. Si algo no se
puede hacer bien, que quede `failed`/`throw` honesto, nunca verde mentiroso.
