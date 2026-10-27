# HANDOFF — trabajar en paralelo con otro agente (Codex) sin romper el merge

> Este documento existe para que dos agentes trabajen el mismo repo a la vez sin
> pisarse. No es un plan de producto: es un contrato de propiedad de ficheros,
> ramas y criterios de verificación.
>
> Base: `main` en `c69e028` (2026-10-27); el lane 1 tiene además `campaign/authz-tenant`
> en `c5a8c7c` (en revisión) y abre ramas por campaña. Un "lane" = una rama = un agente.

## 0. Reglas de oro

1. **Un lane es una rama y una rama es un lane.** Nadie escribe en `main`, ni con
   push directo ni con merges. El dueño del repo revisa y mergea.
2. **Propiedad de ficheros, no de ideas.** Si tu lane no es el dueño de un
   directorio, no lo toques ni "de paso". Un fichero con dos dueños es un
   conflicto garantizado.
3. **Contrato antes que implementación.** Las interfaces de la sección 3 están
   congeladas. Si necesitas cambiarlas, es un cambio aditivo y se avisa.
4. **Sin dependencias nuevas sin permiso.** `package.json` y `pnpm-lock.yaml` no
   se tocan. Todo lo de las campañas se resuelve con `fetch` de Node y `node:crypto`.
5. **Nada de secretos en el repo.** Nunca un valor, ni en tests, ni en docs, ni en
   comentarios. Los nombres de variable sí (son el contrato).
6. **Lo que no está verificado, no se afirma.** Si no corriste el comando, escribe
   "pendiente", nunca "hecho".

## 1. Mapa de lanes

| Lane | Rama | Dueño | Rutas que puede escribir |
|---|---|---|---|
| 1 · runtime + gate | `campaign/authz-tenant` (en revisión) · `campaign/verdad` (el gate) | Buffy | `apps/server/src/app.ts`, `engine/service.ts`, `engine/model.ts`, `engine/sop-executor.ts`, `engine/conversation.ts`, `*-routes.ts`, `scripts/**`, `docs/operacion/**`, `tests/*.test.ts` (raíz) y `tests/gate/**` — ver [CAMPANA-VERDAD.md](CAMPANA-VERDAD.md) |
| 2 · **LLM → workspace** (la campaña grande) | `campaign/llm-runtime` | **Codex** | `packages/integrations/src/llm/**`, `apps/server/src/engine/model-chain.ts`, `embeddings.ts`, `planner/**`, `execution/**`, `context/**`, `kernel/authors/**`, `tests/llm/**` — ver [HANDOFF-LLM.md](HANDOFF-LLM.md) |
| 3 · adaptadores de proveedor | `campaign/canales-adapters` | **Codex** (después del lane 2) | `packages/integrations/src/adapters/**`, `packages/integrations/src/stubs/**`, `tests/adapters/**` |
| 4 · panel (opcional) | `campaign/panel-drafts` | **Codex** | `apps/web/src/**`, `apps/web/docs/**` |
| 5 · **corpus documental** | `docs/auditoria-corpus` | **Cline** | solo `docs/**` (sin código): índice único, archivo con rastro, estado real, contradicciones resueltas — ver [HANDOFF-CLINE.md](HANDOFF-CLINE.md) |

El lane 2 lleva el peso: es el mandato de [HANDOFF-LLM.md](HANDOFF-LLM.md), con
fases F0–F6 y el criterio final de una SOP de punta a punta con coste real y
resultado visible en el panel. El lane 3 (salir hacia los proveedores) es lo de la
sección 3 de este documento y no se solapa: vive en `packages/integrations/src/adapters/**`.

`tests/` en la raíz es del lane 1; los tests de adaptadores viven en
`tests/adapters/` para que el runner (`tests/**/*.test.ts`) los coja sin que un
fichero cambie de dueño. Es la misma suite, directorios distintos.

### Zonas congeladas (nadie las toca sin avisar)

| Ruta | Por qué |
|---|---|
| `.github/workflows/**` | Cambiar el CI afecta a todos los lanes a la vez |
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig*.json` | Gate común: una dependencia nueva rompe a los demás |
| `tests/setup.ts` | Bloquea hosts reales en tests. Debilitarlo es hacer trampa, no arreglar |
| `docs/roadmap/**`, `docs/vertical_slice/**` | Documentos de dirección, no de trabajo |
| `clientes/**` | Datos del tenant: se editan con `pnpm bootstrap:agency`, no a mano |

## 2. Estado real del repo (no lo que dice un documento viejo)

Verificado en esta sesión sobre `c69e028`:

- `pnpm typecheck` limpio; suite completa `439` tests, `427` pass, `12` skip, `0` fail.
- `pnpm install --frozen-lockfile` sale **0** (estuvo saliendo 1; ver trampas).
- CI (`ci.yml`) exige: `typecheck`, `test` con `ALLOW_NETWORK=0`, y cuatro audits
  (`audit:layers`, `audit:bridges`, `audit:console`, `audit:tenant-default`,
  `audit:idempotency`, `audit:contracts`) que **sí** rompen el build.
- El deploy NO sale de un push a `main`: sale de un tag `v*` (`deploy.yml`), con
  `FLY_API_TOKEN` / `VERCEL_TOKEN` / `DOPPLER_TOKEN` como secretos de GitHub.
- `AUTH_PROVIDER=session` en local; multitenant real es `AUTH_PROVIDER=supabase`.
- Los hosts bloqueados en tests son: Gemini, OpenRouter, Google OAuth, Gmail,
  Calendar/Drive, `api.stripe.com` y `graph.facebook.com`.

**Pendiente y conocido** (no lo descubras de cero): `apps/worker` tiene su
typecheck en `continue-on-error: true` porque arrastra errores previos; está
asignado al lane 4, no lo arregles desde el lane 2.

**Auditoría del camino LLM en** [AUDITORIA-LLM-WORKSPACE.md](AUDITORIA-LLM-WORKSPACE.md):
12 defectos con evidencia y la definición operativa de "profundo". Antes de tocar
nada de la capa de modelos, léela.

## 3. Contratos congelados (lane 2)

Los puertos son clases con una opción de `baseUrl` **inyectable**: es lo que
permite testear sin red (`tests/setup.ts` bloquea los hosts reales).

```ts
// packages/integrations/src/adapters/whatsapp-cloud.ts
export interface WhatsAppCloudOptions {
  token?: string;          // WHATSAPP_TOKEN
  phoneNumberId?: string;  // WHATSAPP_PHONE_ID
  baseUrl?: string;        // default https://graph.facebook.com/v21.0
  signal?: AbortSignal;
}
export class WhatsAppCloudClient {
  get configured(): boolean;                     // token && phoneNumberId
  sendText(to: string, text: string): Promise<WhatsAppSendResult>; // { id, accepted, to }
}
```

```ts
// packages/integrations/src/adapters/resend.ts
export interface ResendOptions { apiKey?: string; baseUrl?: string; from?: string }
export class ResendClient {
  get configured(): boolean;                     // apiKey && from
  sendEmail(input: { to: string; subject: string; text: string; replyTo?: string }):
    Promise<{ id: string; accepted: boolean; to: string }>;
}
```

```ts
// packages/integrations/src/adapters/vapi.ts
export interface VapiOptions { apiKey?: string; baseUrl?: string }
export class VapiClient {
  get configured(): boolean;                     // apiKey && assistantId
  startCall(input: { to: string; assistantId?: string; metadata?: Record<string, string> }):
    Promise<{ id: string; accepted: boolean; to: string }>;   // VAPI_API_KEY / VAPI_ASSISTANT_ID
  getCall(id: string): Promise<{ id: string; status: string; endedAt?: string }>;
}
```

Reglas de comportamiento, idénticas a los stubs existentes
(`packages/integrations/src/stubs/`), que son la referencia de estilo:

1. `configured === false` → cada método lanza `AppError` **503** con el nombre de
   la variable que falta. Nunca un éxito falso. Nunca un `throw new Error` pelado.
2. Respuesta no-2xx → `AppError` **502** con `status` y los primeros 200 chars del
   cuerpo del proveedor. No metas el cuerpo entero: puede traer el token.
3. La red caída / timeout → `AppError` **502** "no se pudo contactar con X".
4. Timeout con `AbortSignal.timeout(20000)`, combinado con la señal entrante.
5. Validación de entrada: teléfono y email con las mismas reglas que los stubs
   (`/^\+?[0-9]{6,20}$/`), y `422` si no cuadra.

### Entregables del lane 2

- [ ] Los tres adaptadores, con los `AppError` de arriba.
- [ ] Tests en `tests/adapters/`: `baseUrl` apuntando a un `fetch` mockeado.
      Casos mínimos por adaptador: sin credencial → 503; 500 del proveedor → 502;
      éxito → resultado tipado; y el caso del payload real (id de Meta, id de Resend).
- [ ] Un `README.md` por adaptador con: nombre exacto de las variables, cómo se
      obtiene la credencial (enlace oficial) y qué scopes/permisos necesita.
- [ ] Nota en el PR: qué decidiste que el lane 1 debe cablear (`service.whatsapp`,
      `service.email`, `service.voice`).

**No** implementes el webhook de entrantes ni toques `apps/server`: eso es del
lane 1 (ya está hecho: la firma HMAC y el handshake viven en
`apps/server/src/whatsapp-routes.ts`). Tu trabajo es **salir**, no **entrar**.

### Trampas ya pagadas (no las repitas)

1. **`pnpm-workspace.yaml` tenía el texto de error de pnpm pegado como valor**
   (`'@scarf/scarf': set this to true or false`), así que `pnpm install` salía 1 y
   el gate del CI moría antes de compilar. En un `allowBuilds` el valor tiene que
   ser `true` o `false`, nada más.
2. **El webhook de un proveedor no puede vivir detrás del middleware de auth.**
   En Hono, una ruta registrada antes de un `app.use` no pasa por él: por eso el
   webhook de WhatsApp se monta antes de `authzMiddleware`. Si añades un endpoint
   que llama un proveedor (Stripe, Meta, Resend inbound), va ahí, y su
   autenticación es la firma HMAC, no el Bearer.
3. **El nombre de la variable es parte del contrato.** El webhook de WhatsApp
   leía `WHATSAPP_WEBHOOK_SECRET`, que no existe ni en `.env.example` ni en
   `secrets-check`: el usuario configuraba `WHATSAPP_APP_SECRET` y el endpoint
   aceptaba cualquier petición sin verificar. Copia el nombre exacto de
   `scripts/secrets-check.ts`.
4. **No debilites `tests/setup.ts`.** Bloquea los hosts reales a propósito. La
   forma de testear un adaptador es inyectarle `baseUrl` y mockear `fetch`.

## 4. Cómo se verifica (comandos exactos)

```bash
pnpm install --frozen-lockfile     # nunca --no-frozen-lockfile en un lane
pnpm typecheck                     # tsc --noEmit + worker
pnpm test                          # ALLOW_NETWORK=0 por defecto en CI
pnpm exec tsx --import ./tests/setup.ts --test tests/adapters/   # solo tu lane
pnpm audit:layers audit:bridges audit:console audit:tenant-default  # gates del CI
```

Tu lane está verde cuando: `pnpm typecheck` 0, `pnpm test` 0 fail y los seis
audits del CI en verde. Si un audit se pone rojo por tu cambio, el fallo es
tuyo: no lo desactives.

`pnpm lint` (biome) **no** es un criterio: no forma parte del CI y hoy sale rojo
repo-wide (1414 errores, en ficheros que no son de tu lane). No reformatees nada
que no hayas escrito tú.

## 5. Protocolo de rama y merge

```bash
git fetch origin && git switch main && git pull --ff-only
git switch -c campaign/canales-adapters
# ... trabajo ...
git fetch origin && git rebase origin/main      # antes de pedir revisión
git push -u origin campaign/canales-adapters
```

- Commits pequeños, en imperativo y con el marcador del cambio:
  `feat(adapters): WhatsAppCloudClient con 503 honesto sin credencial`.
- Un lane = un PR. Si el lane 1 ya mergeó ficheros tuyos por error, no lo
  "arregles" con merge: avisa.
- Conflictos esperados: **ninguno**, si respetas la tabla de la sección 1. Si
  aparece uno en `packages/integrations/src/index.ts`, ese fichero lo cierra el
  dueño del lane 1 (solo añade re-exports).

## 6. Variables por adaptador (el contrato, no los valores)

| Adaptador | Variables | Sin ellas |
|---|---|---|
| WhatsApp Cloud | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` | 503 en `sendText` |
| Resend | `RESEND_API_KEY` | 503 en `sendEmail` |
| Vapi | `VAPI_API_KEY`, `VAPI_ASSISTANT_ID` | 503 en `startCall` |
| Stripe | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` | 503; el webhook ya verifica firma |
| Google Maps | `GOOGLE_MAPS_API_KEY` | 503 en la búsqueda de leads |

El nombre canónico está en `scripts/secrets-check.ts` y en `.env.example`: si
escribes otro, el gate de despliegue y el adaptador dejarán de coincidir (ese fue
exactamente el bug del webhook de WhatsApp).

## 7. Brief para pegar en Codex

```
Repo: uniscrolliabrain-cloud/agente. Base: main @ c69e028.
Crea la rama campaign/canales-adapters.

Lane: implementar los adaptadores REALES de proveedor. Solo puedes escribir en
packages/integrations/src/** y tests/adapters/**. NO toques apps/server/**,
scripts/**, package.json, pnpm-lock.yaml, tests/setup.ts ni .github/**.

Entrega: WhatsAppCloudClient (Meta Graph API), ResendClient y VapiClient en
packages/integrations/src/adapters/, siguiendo los contratos y las reglas de
error de docs/operacion/HANDOFF-CODEX.md (secciones 3 y 4). Referencia de estilo:
packages/integrations/src/stubs/. `baseUrl` inyectable y tests con fetch mockeado:
sin credencial 503, proveedor 5xx 502, exito tipado. Nada de dependencias nuevas.

Criterio de hecho: pnpm typecheck 0, pnpm test 0 fail, pnpm lint 0, y los audits
del CI verdes. Marca como pendiente lo que no hayas podido ejecutar.
```
