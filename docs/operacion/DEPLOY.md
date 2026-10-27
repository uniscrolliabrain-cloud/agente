# Despliegue de agntiapro.io

> Estado: plan de la fase 1 (dogfooding: la agencia como primer tenant). Nada de
> esto está desplegado todavía. Lo que ya existe en el repo: `Dockerfile` (build
> del API **y** del panel), `fly.toml` (panel + API), `fly.worker.toml`,
> `fly.browser.toml`, `apps/site` (landing de Vercel), `.github/workflows/deploy.yml`,
> `scripts/secrets-check.ts`, `scripts/smoke-deploy.ts`, `doppler.yaml` y
> `pnpm bootstrap:agency` (alta del tenant de la agencia).

## 1. Decisión de topología

| Pieza | Dónde | Por qué |
|---|---|---|
| API + SSE + worker | **Fly.io** (`mad`) | conexiones largas, proceso vivo, volumen para PGlite/backups, sin límite de ejecución |
| Panel (`apps/web`) | **mismo origen que la API** (Fly) | el cliente llama rutas relativas (`/api/...`) y el chat es un stream SSE: servirlo en otro dominio obliga a CORS + proxy de stream, dos formas nuevas de romperse |
| Sitio público / marketing | **Vercel** | estático, previews por rama, cero estado |
| Auth | **Supabase Auth** | JWT firmado (JWKS) + claim de tenant; ya implementado y testeado en `campaign/authz-tenant` |
| Postgres | **Neon** | connection string compatible con `pg`, branching por rama, backups y PITR sin operar nada |
| Secretos | **Doppler** | un único sitio; Fly y Vercel solo reciben lo que necesitan |

Por qué el panel **no** va a Vercel en la fase 1: `apps/web/src/api/client.ts` hace
`fetch("/api/...")` y el chat consume un stream SSE. Detrás de un rewrite de
Vercel eso funciona hasta que deja de hacerlo (buffering del proxy, timeouts de
la plataforma), y depurarlo cuesta más que servirlo junto al API. Cuando quieras
Vercel para el panel, el cambio es una unidad aparte: `VITE_API_URL` en el
cliente, CORS del origen de Vercel en el API, y verificar el stream.

## 2. Dominios y DNS

| Nombre | Apunta a | Uso |
|---|---|---|
| `agntiapro.io` | Vercel (A/CNAME) | sitio público (`apps/site`) |
| `www.agntiapro.io` | Fly (`agntiapro-api`) | panel + API (fase 1) |
| `api.agntiapro.io` | Fly (`agntiapro-api`, segundo certificado) | API para webhooks de Meta/Vapi/Stripe |
| `app.agntiapro.io` | Vercel | reservado: panel separado en fase 2 |

En Fly los certificados son automáticos una vez el CNAME está puesto. En Vercel,
`www` y el apex se configuran en el proyecto; el apex solo puede ir a Vercel si
no lo usas para el API.

## 3. Secretos: Doppler → plataformas

`doppler.yaml` deja el repo ligado al proyecto `agntiapro` con tres configs
(`dev`, `stg`, `prd`). `scripts/secrets-check.ts` es el contrato: lista qué
necesita cada modo, qué es opcional y qué incoherencias hay entre variables.

```bash
doppler setup                       # lee doppler.yaml
pnpm secrets:check --mode=live      # falla si falta algo obligatorio

# Fly: los secretos se importan sin escribir ficheros intermedios
doppler secrets download --no-file --format docker --config prd \
  | fly secrets import -a agntiapro-web

# Vercel (solo el sitio estático: nunca claves de servidor)
doppler secrets get PUBLIC_SITE_URL --plain --config prd \
  | vercel env add PUBLIC_SITE_URL production
```

Reglas:

- **Ningún secreto en la imagen ni en el repo.** `doppler.yaml` solo tiene la ruta.
- `TOKEN_ENCRYPTION_KEY`, `OPENMUSE_ACCESS_KEY`, `SUPABASE_JWT_SECRET`,
  `STRIPE_WEBHOOK_SECRET`, `WHATSAPP_APP_SECRET` son de servidor: solo Fly.
- Vercel recibe únicamente variables `PUBLIC_*`/`VITE_*` (nada que sirva para
  firmar o descifrar).
- Rotación: se cambia en Doppler y se vuelve a importar; no se toca el código.

## 4. Postgres (Neon)

1. Proyecto en la región eu-central (la misma latencia que `mad`).
2. Dos bases: `agntia` (datos de la app) y `agntia_business` (datos de negocio
   que consultan las SOPs).
3. Rol read-only para la segunda y `BUSINESS_DATABASE_URL` apuntando a él. El
   `secrets:check` falla si ambas URLs son la misma, porque `query_business` no
   lleva filtro por owner.
4. `DATABASE_URL` con el host **pooled** (`-pooler`) para el API y el directo
   para migraciones/backups.
5. `pnpm migrate:*` y `pnpm seed:*` se ejecutan una vez contra la base nueva;
   después `BACKUP_INTERVAL_HOURS=24` cubre el volumen de `/data`.

## 5. Supabase Auth (multitenant)

1. Proyecto Supabase en la misma región. Copia `SUPABASE_URL` (`https://<ref>.supabase.co`).
2. Firma asimétrica (RS256/ES256) activada: el API lee la JWKS en
   `…/auth/v1/.well-known/jwks.json` y cachea por `kid`. Si el proyecto sigue en
   HS256, pon `SUPABASE_JWT_SECRET` y no `SUPABASE_URL`.
3. Hook de *custom access token* que inyecte `app_metadata.tenant_id` con el
   tenant de la agencia (`agntia`). Es lo único que el API acepta como claim:
   `tenant_id` > `app_metadata.tenant_id` > `user_metadata.tenant_id`.
4. Redirect URLs: `https://www.agntiapro.io/auth/callback`.
5. `AUTH_PROVIDER=supabase` en el entorno. Con el claim ausente el API responde
   401; con un tenant ajeno, 403 (ver `tests/jwt-authz.test.ts`).
6. Alta del primer usuario: por invitación de Supabase y después
   `pnpm admin:create -- --email … --password …`. El primer login materializa su
   membership (`user-tenants`); a partir de ahí el token manda.

## 6. Fly.io

Tres apps, un solo repo:

```bash
fly launch --no-deploy -a agntiapro-api      # reusa el fly.toml actual
fly volumes create agntiapro_data -a agntiapro-api -r mad -s 10
fly deploy -a agntiapro-api
fly certs add www.agntiapro.io -a agntiapro-api
fly certs add api.agntiapro.io -a agntiapro-api
```

`agntiapro-api` sirve API + panel en el mismo proceso (es el `fly.toml` actual
con `OPENMUSE_PROCESS_ROLE=all`; el Dockerfile construye `apps/web` y copia
`apps/web/dist`, que `app.ts` sirve por `serveStatic`). Cuando haya tenants de
pago, se separa el trabajo de fondo:

- `agntiapro-worker` → `fly.worker.toml`, `OPENMUSE_PROCESS_ROLE=worker`, **sin**
  `http_service`; se vigila con el log y `/api/health-deep` desde el API.
- `agntiapro-browser` → `fly.browser.toml` (`apps/worker`, Playwright), solo red
  interna, `BROWSER_WORKER_URL=http://agntiapro-browser.internal:8790`.

Notas de operación:

- `min_machines_running = 1`: con 0 el SSE del chat corta en el primer arranque.
- `auto_stop_machines = "stop"` está bien para el worker **no** para el API
  mientras haya sesiones abiertas.
- Escalado: `fly scale count 2 -a agntiapro-api` exige que el worker esté aparte
  (dos workers embebidos duplicarían leases; el claim es atómico, pero se
  desperdicia CPU).
- Región `mad` para el piloto; si los clientes están en LATAM, `fly regions add`
  y mover la réplica de Postgres a la misma latencia.

## 7. Vercel (sitio público)

- Proyecto con *Root Directory* `apps/site`: landing estática, sin build. El
  panel sigue en Fly.
- Build del panel: `pnpm --filter @openmuse/web build`; en Fly lo hace el
  Dockerfile. Para previews del panel en Vercel haría falta `VITE_API_URL`
  (pendiente, ver §1): hoy el cliente llamal rutas relativas.
- Nunca metas claves de Supabase **service role** ni `SUPABASE_JWT_SECRET` en
  Vercel: solo variables públicas.

## 8. CI/CD

Lo que ya hay: `.github/workflows/ci.yml` (typecheck, tests, audits, worker e
integración) y `.github/workflows/deploy.yml` (tag `v*` → gate, import de
secretos desde Doppler, deploy de API y worker, deploy del sitio y humo final).

Gate mínimo antes de tocar `main` (campaña `deploy`):

```bash
pnpm typecheck
pnpm test
pnpm secrets:check --mode=live      # con el entorno de CI, no con secretos reales
pnpm audit:coherence                # hoy 5/7: contratos e idempotencia
```

Deploy: tag `v*` → `fly deploy` + `vercel --prod`; el job necesita
`FLY_API_TOKEN` y `VERCEL_TOKEN` como secretos de GitHub (no en Doppler, porque
son credenciales de la plataforma, no de la app).

## 9. Humo tras cada despliegue

```bash
pnpm smoke:deploy --url=https://www.agntiapro.io --tenant=agntia
curl -fsS https://www.agntiapro.io/api/health
curl -fsS https://www.agntiapro.io/api/health-deep
# login -> token; el panel debe pintar el workspace de su tenant
# un JWT manipulado (un byte del payload) debe dar 401, no 200
# ?tenantId=otro debe dar 403
fly logs -a agntiapro-api | grep -E "kernel|error"
```

Gate de aceptación de la fase 1: los cinco puntos anteriores en verde con la
agencia como tenant `agntia`, y `X-Tenant-Id: agntia` en las respuestas del panel.

## 10. Rollback y datos

- Código: `fly releases -a agntiapro-web` + `fly deploy --image <imagen anterior>`.
- Secretos: Doppler guarda historial por config; revertir y reimportar.
- Datos: PITR de Neon (7 días en el plan básico) y el backup propio en el
  volumen. `pnpm backup:restore` para una base concreta.
- Un despliegue que cambia el esquema va en dos pasos (expandir → desplegar →
  contraer), nunca en uno.

## 11. Coste estimado del piloto (2–3 tenants)

| Servicio | Plan | €/mes |
|---|---|---|
| Fly `agntiapro-web` (shared-cpu-1x, 1 GB, 1 always-on) | pay-as-you-go | ~7 |
| Fly volumen 10 GB | | ~1.5 |
| Neon | Free / Launch | 0–19 |
| Supabase | Free | 0 |
| Vercel | Hobby | 0 |
| Doppler | Free (3 configs) | 0 |
| **Total** | | **~9–28** |

## 12. Orden real de ejecución

1. Cuentas y secretos en Doppler (`dev`), `pnpm secrets:check --mode=live` en verde.
2. Neon + migraciones + `DATABASE_URL` en `prd`.
3. Supabase + hook de claim + redirect URLs.
4. Alta del tenant de la agencia: `pnpm bootstrap:agency --admin=<tu email>`.
5. `fly deploy` del API, import de secretos, certificados de `www` y `api`.
6. DNS y vuelta al humo del §9 (con `X-Tenant-Id: agntia`).
7. Vercel solo para el sitio público (apex).
8. Segunda pasada: separar worker y browser worker, subir `min_machines_running`.

## 13. Lo que este documento todavía no cubre

- El panel en Vercel (`VITE_API_URL` + CORS + verificación de SSE). La fase 1 va
  servida por Fly en el mismo origen.
- Correr `pnpm bootstrap:agency` contra el deployment real y verificar el panel
  con `X-Tenant-Id: agntia` (hoy solo está probado contra la app en proceso).
- Campañas `leads` y `canales`: sin ellas el producto aún no busca leads ni
  habla por WhatsApp/teléfono, así que el despliegue sirve para el dogfooding
  de la agencia, no para vender todavía.
