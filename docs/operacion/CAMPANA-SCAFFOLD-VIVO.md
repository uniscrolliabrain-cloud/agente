# Campaña · SCAFFOLD VIVO

> Rama: `campaign/scaffold-vivo` · base `cd2c9b2` (`ce2cefd` + criterio de contratos V2)
> Mandato: **construir el sistema entero antes de tener las claves**. Todo lo que
> dependa de datos tuyos entra como *stub* con la misma forma que el adaptador real,
> para que el día que Doppler esté lleno solo haya que cambiar el modo, no el código.
>
> Tests: los imprescindibles. Un test solo cuando pincha una decisión que se puede
> romper en silencio (idempotencia de una escritura externa, aislamiento de tenant,
> firma de webhook). Nada de suites nuevas por rutina.

## 0. Reglas de la campaña

1. **Stub-first, no stub-only.** Cada integración tiene un puerto con dos
   implementaciones: `live` y `stub`. La selección es por presencia de secreto, no
   por un flag manual que se pueda olvidar.
2. **Nada de `process.env` fuera de la config.** Un secreto nuevo se declara una vez
   y aparece en `pnpm secrets:check` con su grupo y su nota.
3. **No toco lo que está en revisión.** `campaign/verdad` se queda como está; esto
   construye encima. Fuera de alcance: `llm-usage`, coste, cuota, `model-chain.ts`,
   `planner/**`, `execution/**`, `packages/workspaces/**`.
4. **Cada todo cierra con un comando que se puede correr sin claves.** Si para
   verificarlo hace falta un secreto, el todo no está terminado.

## 1. Punto de partida medido (lo que ya existe)

| Pieza | Estado real |
|---|---|
| Tenant agencia | `clientes/agntia/agency.json` (20 líneas: oferta, ICP, precios, tono, límites) + `clientes/agntia/sops.ts` (9 SOPs, 361 líneas) + `pnpm bootstrap:agency` |
| Google | [google.ts](../../packages/integrations/src/google.ts): Gmail (`sendEmail`, `listMail`), Calendar (`createEvent`/`updateEvent`/`deleteEvent`), Drive (`listDriveFiles`, `readDriveFile`, `renameDriveFile`, `trashDriveFile`). **No hay subida de fichero nuevo a Drive.** |
| WhatsApp | [stubs/whatsapp.ts](../../packages/integrations/src/stubs/whatsapp.ts) + `whatsapp-routes.ts` con verificación de firma |
| Stripe / GMB / social | stubs en `packages/integrations/src/stubs/` |
| Leads (Maps/Places) | **no existe**: solo aparece en `scripts/secrets-check.ts` |
| Voz (Vapi) | **no existe**: solo aparece en `scripts/secrets-check.ts` |
| Tools del kernel | [bootstrap.ts](../../apps/server/src/engine/capabilities/bootstrap.ts): 15 tools, todas de *preparar* (`prepare_email`, `prepare_event`) o de leer. Ninguna manda, llama ni busca leads. |
| Gate | `pnpm gate` (V0) · `audit:idempotency` con índice + test de doble efecto (V1) · criterio de contratos V2 → 78 huérfanos reales |

La consecuencia: el sistema **ya sabe pensar y proponer**, y **no sabe actuar hacia
fuera**. Eso es exactamente lo que falta para el vertical slice.

## 2. Los 7 todos

### T1 · Contrato único de secretos y modos

Un solo registro de secretos (hoy `scripts/secrets-check.ts`, 208 líneas) que además
declare, por integración, **qué modo queda activo sin la clave** (`stub`) y **qué
degrada** (p. ej. sin `BUSINESS_DATABASE_URL`, `query_business` cae a la BD principal).

- `pnpm secrets:check --json` para que lo consuma un script o Doppler CI.
- `pnpm secrets:check --mode=live` sigue saliendo 1 si falta algo obligatorio.
- Un `integrationMode("google") -> "live" | "stub"` derivado de las claves, usado por
  todos los adaptadores. Sin flags manuales.
- **Verificación:** `env -i` + `pnpm secrets:check --mode=sample` lista los 6 modos en
  `stub` y no falla; `--mode=live` falla nombrando lo que falta.

### T2 · Puertos y stubs de las cinco integraciones que faltan

Un puerto por dominio en `packages/integrations/src/ports/`, con su adaptador real y
su stub determinista (fixtures fijos, sin red, sin relojes):

| Puerto | Live | Stub |
|---|---|---|
| `LeadSource` | Places Text Search (radio, categoría, teléfono) | 12 leads fijos de 3 sectores |
| `Voice` | Vapi (crear llamada, recibir transcript, colgar) | llamada guionizada con 3 turnos |
| `Messaging` | WhatsApp Cloud / Evolution | mensaje encolado con id determinista |
| `Calendar` | Google ya existe | eventos en memoria por tenant |
| `Docs` | Drive ya existe + **subida que falta** | fichero en memoria con id estable |

- **Verificación:** `pnpm tsx scripts/stub-demo.ts` recorre los 5 puertos y devuelve
  datos con la misma forma que el tipo del puerto (`tsc` lo garantiza).

### T3 · Escrituras externas aprobadas (de propuesta a efecto)

Hoy `prepare_email` / `prepare_event` crean propuestas y ahí se acaba el camino.
Cablear la ejecución: aprobación → ejecución → registro del efecto, con
`idempotencyKey` por propuesta y *outbox* para reintentos.

- Reintento de la misma aprobación = un solo envío. Ese es el único test nuevo
  obligatorio de esta campaña (ya existe el patrón en `tests/gate/idempotency-execution.test.ts`).
- **Verificación:** aprobar dos veces `prepare_email` en modo stub → 1 mensaje.

### T4 · El vertical slice, de punta a punta y sin claves

Un proceso real del tenant `agntia`, ejecutable con `pnpm slice:agency`:

```
buscar leads (LeadSource) → enriquecer → primer WhatsApp (Messaging)
   → respuesta entrante (webhook stub) → agendar discovery call (Calendar)
   → resumen en Drive (Docs) → email de confirmación (Gmail)
```

- Cada paso escribe en el grafo/registro y emite su evento; el comando imprime el
  recorrido con ids, no un "ok".
- Idempotente por `runId`: relanzarlo no duplica leads ni citas.
- **Verificación:** `pnpm slice:agency --tenant=agntia --leads=3` termina en verde con
  cero secretos y deja 3 leads, 3 conversaciones, 1 cita y 1 fichero.

### T5 · Tenant agencia completo (dogfooding)

`clientes/agntia` hoy es oferta + SOPs. Falta lo que hace que las SOPs tengan suelo:

- Schema de negocio del tenant (`lead`, `client`, `call`, `invoice`) con sus campos y
  transiciones; `pipeline: []` deja de estar vacío.
- Personas y roles con sus capabilities permitidas (quién puede mandar y quién solo
  propone).
- `bootstrap:agency` idempotente: dos ejecuciones seguidas no duplican nada.
- **Verificación:** `pnpm bootstrap:agency --admin=x --dry-run` imprime el plan
  completo; ejecutarlo dos veces deja el mismo estado.

### T6 · JWT multitenant cerrado

`AUTH_PROVIDER=supabase` está a medias: se resuelve el usuario pero **no se verifica
la firma**. Cerrar:

- Verificación RS256/ES256 contra JWKS (`SUPABASE_URL`) con issuer, audience y
  expiración; HS256 solo si hay `SUPABASE_JWT_SECRET`.
- Claim de tenant obligatorio → contexto de request; middleware en `/api/*` que
  rechaza tenant ajeno con 403 (hoy hay rutas que devuelven 200).
- **Verificación:** test de dos tenants: A no lee ni escribe nada de B; token sin
  `sub` o con firma mala → 401.

### T7 · Gate y documentación de operación

Cerrar lo que quedó abierto en `campaign/verdad` sin frenar la construcción:

- Los **78 huérfanos** de contratos: decisión por cubo (consumir, `PENDING(motivo,
  fecha)`, allowlist razonada) hasta exit 0. Ver [INFORME-CONTRATOS.md](../INFORME-CONTRATOS.md).
- `pnpm docs:anchors`: cada variable, script y ruta citada en `docs/operacion/` existe
  de verdad.
- `pnpm gate` en CI y deploy (una sola lista, no tres).
- **Verificación:** `pnpm gate` exit 0 y un fixture roto hace fallar `docs:anchors`.

## 3. Qué necesito de ti (y qué se queda en stub hasta entonces)

| Secreto | Desbloquea | Mientras tanto |
|---|---|---|
| `DATABASE_URL` (Neon) | Postgres durable, fin del PGlite | PGlite local |
| `GEMINI_API_KEY` o `OPENROUTER_API_KEY` | chat y `llm_generate` de verdad | respuestas de fixture |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Gmail, Calendar, Drive live | `Calendar`/`Docs` en memoria |
| `WHATSAPP_*` (Cloud o Evolution + webhook público) | mensajes reales | `Messaging` stub |
| `VAPI_API_KEY` + id de asistente | llamadas | `Voice` guionizado |
| `MAPS_API_KEY` (Places) | leads reales | 12 leads fijos |
| `STRIPE_API_KEY` + `STRIPE_WEBHOOK_SECRET` | cobro del servicio | stub |
| `SUPABASE_URL` / `SUPABASE_JWT_SECRET` | T6 en live | tokens de test firmados en local |

Formato: en Doppler, un *config* por entorno (`dev`, `pr`/`preview`, `prod`). Yo
declaro nombres y modos en T1; tú pegas valores. Nunca en el repo ni en el chat.

## 4. Fuera de alcance (explícito, para no chocar con otros lanes)

- `llm-usage`, contabilidad de coste, cuotas por tenant, `model-chain.ts`.
- `planner/**` y `execution/**` (lane de Codex).
- `packages/workspaces/**` y `apps/web/src/workspaces/**`.
- Reescribir el corpus de documentación (lane de Cline).

## 5. Tablero

| Todo | Estado | Cierra cuando |
|---|---|---|
| T1 secretos y modos | pendiente | `secrets:check --json` + modo derivado de claves |
| T2 puertos y stubs | pendiente | los 5 puertos responden sin red |
| T3 escrituras aprobadas | pendiente | aprobar dos veces = un efecto |
| T4 vertical slice | pendiente | `pnpm slice:agency` recorre el flujo entero |
| T5 tenant agencia | pendiente | bootstrap idempotente + schema de negocio |
| T6 JWT multitenant | pendiente | dos tenants, aislamiento en `/api/*` |
| T7 gate y docs | pendiente | `pnpm gate` exit 0, `docs:anchors` verde |
