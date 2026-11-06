# DESPLIEGUE — qué falta para tener agntiapro.com en producción

Estado medido el 2026-11-06 sobre la rama `campaign/conexiones-doppler`, con los
tokens reales que ya están en Doppler (proyecto `agntiapro`, config
`dev_campaign_transversal_leads_ia`). Todo lo que dice "medido" se comprobó
ejecutando el comando, no leyendo documentación.

> **ACTUALIZACIÓN 2026-11-06 — ESTO YA ESTÁ DESPLEGADO.** El análisis de abajo
> se conserva como registro de la fase previa. El estado real está en la §0.

## 0. Estado real tras el despliegue

| Pieza | Estado | Evidencia medida |
|---|---|---|
| API + panel | **LIVE** en `agntiapro-api` (Fly, `fra`) | `https://www.agntiapro.com/api/health` → 200 en ~1,5 s |
| Worker de tareas | **LIVE** en `agntiapro-worker` (Fly, `fra`) | máquina `started`, `/api/health-deep` → `worker:true` |
| Base de datos | **Neon** PostgreSQL 18.6 con pgvector | `/api/health-deep` → `backend:"postgres"`, 235 capabilities |
| TLS | **Let's Encrypt, verificado y activo** | `fly certs check` para `www` y apex |
| DNS | apex + `www` → Fly, **DNS only** | 6 registros en la zona de Cloudflare |
| Login | **funciona** por el dominio | `POST /api/auth/login` → 200, `role: admin` |
| Correo saliente | **Resend verificado** (`agntiapro.com`) | dominio `verified`, 4/4 registros DNS |
| Aislamiento | ruta protegida sin token → **401** | `/api/workspace` sin cabecera |

Región: **`fra`**, no `mad` (Fly no tiene Madrid; regiones UE: `ams`, `fra`,
`lhr`, `cdg`, `arn`). Se eligió Frankfurt por residencia de datos UE.

### Bugs de producción que el despliegue destapó y quedan corregidos

Ninguno de estos se veía en local ni en los tests: solo al correr el artefacto
compilado contra un Postgres real y leer los logs.

1. **`import` con alias no resoluble** (`engine/views/resolver.ts`) → `node dist/...`
   moría con `ERR_MODULE_NOT_FOUND` antes de abrir puerto. Build verde, contenedor
   en crash loop.
2. **`[checks.health] type = "script"`** en `fly.worker.toml` → Fly solo acepta
   `http`/`tcp`; el worker **nunca** podía desplegarse ("Missing or invalid check
   type").
3. **Cuatro loops de mantenimiento sin `actorId`** (consolidación de turnos,
   consolidación por tenant, meta-loop, contexto meta) → `ZodError` en cada tick,
   la consolidación de memoria **nunca** ocurría en producción.
4. **Backup apuntando a `/app/dist/.openmuse`** → `runBackup` calculaba la ruta
   desde el compilado e ignoraba `DATA_DIR`; fallaba cada 24 h. Ahora usa
   `config.dataDir` y escribe en `/data/backups`.
5. **`clientsDirFrom()` ignoraba `OPENMUSE_CLIENTS_DIR`** → el bootstrap del kernel
   seguía buscando `/clientes` aunque la variable estuviera puesta.
6. **El intervalo de 1 s de `deferredTick` no se paraba en `shutdown`** → escribía
   contra el pool ya cerrado ("Cannot use a pool after calling end on the pool")
   en cada redeploy.

### Lo que sigue pendiente de verdad

1. **El gate de CI sigue en rojo** (`test` y `audit:contracts`): el despliegue de
   hoy se hizo con `flyctl deploy` directo, **saltándose el workflow**. Typecheck
   está en 0.
2. **Neon está en `us-east-2` y Fly en `fra`**: cada consulta cruza el Atlántico
   (~100 ms; por eso crear 12 índices tardó 24 s). Mover el proyecto Neon a
   `eu-central-1` no requiere tocar código.
3. **`clientes/` no existe en la imagen** (`.dockerignore` lo excluye y el runtime
   solo copia `dist`): personas y ontología arrancan vacías (`0 personas`). El
   directorio ya apunta a `/data/clientes`, pero hay que sembrarlo o mover esa
   configuración a la base de datos.
4. **Google OAuth**: el redirect registrado debe ser exactamente
   `https://www.agntiapro.com/api/google/callback`.
5. **Cloudflare está en `DNS only`**: se gana WAF/caché poniendo `proxied`, pero el
   proxy gratuito corta a los 100 s y el chat usa SSE; conviene decidirlo con el
   stream en pruebas.
6. **Vercel**: `apps/site` (landing estática) sigue sin proyecto.
7. **`BUSINESS_DATABASE_URL` sin definir**: `query_business` corre contra la BD de
   la app; hace falta un rol `SELECT` en otra base.
8. **Jobs de 24 h** (`BACKUP_INTERVAL_HOURS=24`): el backup tarda hasta 24 h en
   repetirse; el primero ya se verificó (`/data/backups/...`).

## 1. Topología prevista (ya está escrita en el repo)

| Pieza | Destino | Config |
|---|---|---|
| API + panel (`/api/*`, SSE del chat, `apps/web/dist`) | **Fly.io** app `agntiapro-api` | `fly.toml` (región `mad`) |
| Worker de tareas durables | **Fly.io** app `agntiapro-worker` | `fly.worker.toml` |
| Browser worker (Playwright) | **Fly.io** app `agntiapro-browser` (opcional) | `fly.browser.toml` |
| Sitio público de marketing | **Vercel** desde `apps/site` | `apps/site/index.html` |
| DNS | **Cloudflare** zona `agntiapro.com` | — |

Reparto de dominios, tal como lo asume `.github/workflows/deploy.yml`:

- `www.agntiapro.com` → Fly (API + panel). `fly.toml` ya pone
  `PUBLIC_API_URL` y `ALLOWED_ORIGINS` a ese host.
- `agntiapro.com` (apex) → Vercel (sitio). El propio `index.html` apunta el
  botón "Entrar al panel" a `www`.

El despliegue no sale de un push a `main`: sale de un tag `v*` y pasa antes por
el job `gate` (typecheck + tests + audits).

## 2. Lo que YA está listo (verificado hoy)

| Comprobación | Resultado |
|---|---|
| `DATABASE_URL` → Neon | **OK**: `db=neondb`, PostgreSQL 18.6, pooler IPv4 |
| Esquema en Neon | **OK**: tabla `records`, 12 índices, extensión `vector` y columna `embedding` |
| `createStore({ databaseUrl })` | **OK** contra Neon, `backend: postgres` |
| `pnpm build:server` (`tsc -p tsconfig.build.json`) | **exit 0**, `dist/apps/server/src/index.js` |
| Artefacto compilado contra Neon | **`/api/health` 200 en 20 s**, cero errores |
| Entorno exacto de `fly.toml` (`WORKSPACE_MODE=live`, `AGENT_BACKEND=model`) | **`/api/health` 200 en 20 s**, `database:true`, `agentConfigured:true` |
| Doppler | **61 variables**, `GEMINI`/`OPENROUTER`/`GROQ`, `MODEL`, `PUBLIC_API_URL`, `TOKEN_ENCRYPTION_KEY`, `OPENMUSE_ACCESS_KEY`, `ADMIN_*` presentes con valor |
| Tokens de despliegue | Fly válido (app-scoped), Vercel válido, Cloudflare válido |
| Zona Cloudflare | `agntiapro.com` **active**, NS `angelina`/`cleo` |

### Un bug de producción que estaba abierto y ya está corregido

`apps/server/src/engine/views/resolver.ts` importaba `@openmuse/domain/views`.
Ese especificador **solo existe como alias de `tsconfig`** (`packages/domain` no
es un paquete npm: no tiene `package.json`). `tsc` lo emitía sin reescribir, así
que `node dist/apps/server/src/index.js` —lo que ejecuta el `CMD` del
Dockerfile— moría con `ERR_MODULE_NOT_FOUND` antes de abrir el puerto. Es decir:
**la imagen de Fly se habría construido bien y habría crasheado al arrancar**.
Ahora importa por ruta relativa, como el resto del repo, y `dist` no contiene
ningún `@openmuse/*` ejecutable.

## 3. Lo que falta, en orden de bloqueo

### 3.1 El gate está en rojo (bloquea todo)

`deploy.yml` exige `pnpm typecheck`, `pnpm test` y `pnpm audit:coherence` antes
de tocar Fly. Hoy: typecheck **0 errores**, pero `pnpm test` deja fallos y
`audit:contracts` sigue con huérfanos. Con el gate rojo **no se despliega
nada**, ni siquiera a preview.

Decisión pendiente (tuya): o se pone el gate en verde, o se separa el tag de
release del gate informativo. No lo toco sin que lo decidas.

### 3.2 Fly: las apps no existen y el token no puede crearlas

Medido:

```
flyctl status -a agntiapro-api   → Could not find App "agntiapro-api"
flyctl apps list                 → unauthorized
flyctl status -a agente-eb4t4a   → OK (1 máquina, región ams, stopped)
```

- No existe `agntiapro-api`, ni `agntiapro-worker`, ni `agntiapro-browser`.
- El `FLY_API_TOKEN` de Doppler es **de una app concreta** (`agente-eb4t4a`) y
  no tiene permiso de organización: no puede ni listar apps, así que tampoco
  puede crear las nuevas.

Necesito **una de estas dos** (no ambas):

1. Un token de organización de Fly (`fly tokens create org`) en Doppler como
   `FLY_API_TOKEN`, o
2. Que crees las apps a mano desde el panel/CLI con tu cuenta:
   `fly apps create agntiapro-api` y `fly apps create agntiapro-worker`.

Después hay que crear el volumen que `fly.toml` monta en `/data`
(si no existe, el deploy falla con "volume not found"):

```bash
fly volumes create agntiapro_data --region mad --size 1 -a agntiapro-api
```

> El worker no lleva volumen a propósito (`fly.worker.toml`): con `DATABASE_URL`
> no hay PGlite local que conservar.

### 3.3 El workflow pide un config de Doppler que no existe

`deploy.yml` hace `doppler secrets download --config prd`, y en el proyecto
`agntiapro` **el único config es `dev_campaign_transversal_leads_ia`** (medido).
En CI eso falla antes de llegar a Fly. Dos salidas:

- crear el config `prd` en Doppler (lo correcto para producción), o
- definir la variable de repo `DOPPLER_CONFIG` con el config que quieras usar.

He dejado el workflow leyendo `vars.DOPPLER_CONFIG` con fallback a `prd`, así que
funciona en cuanto exista cualquiera de los dos.

Secretos de GitHub que el workflow necesita y aún no consta que existan:
`DOPPLER_TOKEN`, `FLY_API_TOKEN`, `VERCEL_TOKEN`, `SMOKE_EMAIL`, `SMOKE_PASSWORD`.

### 3.4 Vercel: cero proyectos

Medido: el token es válido (`uniscrolliabrain-7509`) pero la cuenta tiene **0
proyectos**. Hay que crear el proyecto y enlazarlo:

```bash
cd apps/site
vercel link --yes --project agntiapro-site --token "$VERCEL_TOKEN"
vercel deploy --prod --token "$VERCEL_TOKEN"
```

En CI, `vercel deploy` sin enlazar es interactivo y se cuelga; por eso el paso
necesita `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID` como secretos (ya los he añadido
al workflow). `apps/site` es un `index.html` suelto, sin `package.json`: se
despliega como estático puro, sin build.

### 3.5 Cloudflare: la zona no tiene ni un registro de aplicación

Medido: **1 registro en total**, un `TXT` de verificación de Google. No hay
`A`, ni `CNAME`, ni `www`, ni apex apuntando a nada. Por eso
`www.agntiapro.com` no resuelve.

Registros a crear (Cloudflare → DNS):

| Tipo | Nombre | Contenido | Proxy | Para qué |
|---|---|---|---|---|
| CNAME | `www` | `agntiapro-api.fly.dev` | **DNS only** (gris) al principio | API + panel en Fly |
| A | `@` | `76.76.21.21` | **DNS only** (gris) | Sitio en Vercel |
| CNAME | `_acme-challenge.www` | (lo pone Fly al pedir el cert) | DNS only | Validación del certificado |
| TXT | `resend._domainkey`, `send` (SPF/DKIM) | (los da Resend) | DNS only | Poder enviar email desde el dominio |

Y el certificado del lado de Fly:

```bash
fly certs add www.agntiapro.com -a agntiapro-api
fly certs show www.agntiapro.com -a agntiapro-api
```

**Por qué primero en gris:** Fly y Vercel validan el certificado por HTTP-01. Si
el registro está proxied (naranja) desde el primer minuto, la validación falla y
te quedas con un 525/526 sin certificado. Una vez emitido el cert, puedes pasar
`www` a proxied y poner SSL/TLS en **Full (strict)**; entonces sí ganas WAF y
caché de Cloudflare.

Ojo con el SSE del chat (`/api/...` streaming): si activas el proxy, comprueba
que el stream no se bufferiza. Cloudflare respeta `text/event-stream`, pero es
lo primero que hay que mirar si el chat "se queda pensando".

### 3.6 El resto de bloqueos ya conocidos (no son de despliegue)

Estos no impiden desplegar, pero dejan funciones muertas en producción:

- **Resend**: 0 dominios verificados → el signup no puede enviar el email de
  verificación. Hay que añadir `agntiapro.com` en Resend y sus DNS en Cloudflare.
- **Google Maps**: `REQUEST_DENIED`, la API está desactivada en el proyecto de
  Google Cloud → `/api/leads/discover` no puede buscar.
- **WhatsApp**: `Cannot parse access token` → hay que generar un System User
  Token permanente en Meta Business (los temporales caducan cada 24 h).
- **ElevenLabs** 401, **Sentry** DSN inválido, **Grafana** 404.
- El `mailto` del sitio dice `hola@agntiapro.io` y el dominio es `.com`.

## 4. Riesgos que hay que decidir antes de abrir al público

### 4.1 Región: Fly en `mad`, Neon en `us-east-2`

`fly.toml` despliega en Madrid; el proyecto de Neon está en **Ohio**
(`ep-withered-waterfall-...us-east-2`). Cada consulta paga ~100 ms de ida y
vuelta. Se nota ya en el arranque: crear/verificar los 12 índices tarda 24 s.

Dos arreglos, elige uno:

- crear el proyecto de Neon en `aws-eu-central-1` / `aws-eu-west-2` (lo natural,
  es tu mercado), o
- cambiar `primary_region` de `fly.toml` a `iad`.

### 4.2 La clave de firma de sesión vive en `/data`

`createAuth()` escribe `session-signing-key` en `DATA_DIR`. Con **una** máquina
(`min_machines_running = 1`) funciona. Si Fly escala a 2+, cada máquina genera su
propia clave y las sesiones se invalidan al azar entre instancias. Antes de
escalar hay que mover esa clave a Postgres o a un secreto compartido.

### 4.3 El `grace_period` del health check son 20 s y el arranque medido es 20 s

Medido dos veces: 20 s hasta `/api/health` 200 (con Postgres remoto). Está
exactamente en el límite, y Fly mataría la máquina justo cuando está lista. Lo
he subido a 45 s en `fly.toml`.

## 5. Secuencia completa, en orden

```bash
# 1. Fly: apps + volumen (necesita token de organización o tu CLI)
fly apps create agntiapro-api
fly apps create agntiapro-worker
fly volumes create agntiapro_data --region mad --size 1 -a agntiapro-api

# 2. Secretos en Fly desde Doppler
doppler secrets download --no-file --format docker --config <config> \
  | fly secrets import -a agntiapro-api --stage
doppler secrets download --no-file --format docker --config <config> \
  | fly secrets import -a agntiapro-worker --stage

# 3. Primer despliegue (desde tu máquina, sin CI, para ver el error real)
fly deploy -a agntiapro-api
fly deploy -c fly.worker.toml -a agntiapro-worker

# 4. Certificado y DNS
fly certs add www.agntiapro.com -a agntiapro-api
# Cloudflare: CNAME www -> agntiapro-api.fly.dev (gris), A @ -> 76.76.21.21 (gris)

# 5. Vercel
cd apps/site && vercel link --yes --project agntiapro-site && vercel deploy --prod

# 6. Humo
pnpm smoke:deploy --url=https://www.agntiapro.com --site=https://agntiapro.com
```

El paso 3 es deliberadamente manual la primera vez: el workflow solo se dispara
con un tag y con el gate en verde, así que depurar el primer deploy desde CI es
mucho más lento.

## 6. Qué necesito de ti, resumido

1. Un `FLY_API_TOKEN` **de organización** (o crear las 2 apps a mano).
2. Decidir el config de producción de Doppler (`prd` nuevo, o `DOPPLER_CONFIG`).
3. Añadir los 5 secretos de GitHub del punto 3.3.
4. Crear el proyecto de Vercel (o pasarme `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`).
5. Decidir si movemos Neon a Europa o Fly a `us-east-2`.
6. Decidir qué hacemos con el gate rojo: arreglarlo o desacoplarlo del release.

## 7. Estado real medido el 2026-11-06 (login social + vertical slice)

Todo lo de esta sección se comprobó con `curl` contra `https://www.agntiapro.com`
y con una sesión efímera creada en la base de producción, no leyendo código.

### 7.1 Lo que ya funciona

| Comprobación | Resultado |
|---|---|
| `GET /` y `/api/health` en `www.agntiapro.com` | 200 |
| Login Google (`/api/auth/oauth/google/start`) | 302 a `accounts.google.com`, `redirect_uri=https://www.agntiapro.com/api/auth/oauth/google/callback` |
| Login GitHub (`/api/auth/oauth/github/start`) | 302 a `github.com/login/oauth/authorize`, mismo `redirect_uri` |
| Usuario `uniscrolliabrain@gmail.com` | existe, `role=admin`, resuelve tenant `agntia` |
| `GET /api/auth/me` | 200, cabecera `X-Tenant-Id: agntia` |
| `GET /api/sops` | 200, **8 SOPs** de la agencia |
| `GET /api/admin/tenants` | 1 tenant: `agntia / Agntia Pro / sops=8` |

La pantalla de acceso del panel es ahora Google + GitHub. El formulario de
contraseña sigue existiendo detrás de "Entrar con contraseña" para el admin
local, no como camino principal.

### 7.2 El vertical slice de la agencia, dentro

`clientes/agntia/` (perfil + 8 SOPs) se materializa en la base con:

```bash
pnpm bootstrap:agency --admin=uniscrolliabrain@gmail.com   # tenant + memorias + SOPs
```

Es idempotente: relanzarlo no duplica SOPs ni memorias (`skipped`), y `--force`
reescribe las SOPs. El alta previa de usuario/owner la hace
`scripts/provision-agntia.ts` (también idempotente).

SOPs creadas: `primer-contacto`, `follow-up-3-dias`, `agendar-discovery-call`,
`auditar-web-lead`, `revisar-pipeline`, `recordar-pago-vencido`,
`conciliacion-mensual`, `resumen-negocio`.

### 7.3 Cinco fallos que solo aparecen con el despliegue delante

Ninguno lo cubría un test; los cinco se arreglaron en esta rama:

1. **El login social devolvía 401.** El middleware de `/api/*` solo eximía
   `/api/auth/login` y `/logout`; `start` y `callback` morían en `auth.owner`.
2. **El panel listaba 0 SOPs.** `/api/sops` y `/api/skills` se montaban con el
   store crudo, pero los datos viven bajo `tenantId:owner`.
3. **El panel de tenants leía el registro global con store con scope**, así que
   cada consulta se prefijaba con el tenant del admin y devolvía cero empresas.
4. **El health del tenant salía a cero** porque listaba con `owner=tenantId` en
   vez de escanear la zona `tenantId:`. Ahora usa `scanByOwnerPrefix`.
5. **El registro de tenants se corrompía al arrancar.** `TenantService`
   interpretaba las filas de `system/tenant-membership` (id = tenantId) como
   memberships "legacy" y las reescribía como `id=default`, borrando la original:
   el tenant desaparecía del panel tras un reinicio. Guardado con
   `TENANT_SYSTEM_NAMESPACE_GUARD_V1` y verificado reiniciando la máquina.

### 7.4 Lo que sigue pendiente y por qué

- **Registrar la callback en los dos proveedores.** En Google Cloud Console y en
  la OAuth App de GitHub tiene que estar exactamente
  `https://www.agntiapro.com/api/auth/oauth/google/callback` y
  `.../github/callback`. No se puede hacer por API; sin eso el proveedor rechaza
  el redirect aunque el `start` responda 302.
- **Sitio de Vercel** (`apps/site`) y el registro `A @ -> 76.76.21.21`: hoy `www`
  funciona y el apex no está desplegado.
- **Región**: `fly.toml` dice `mad`, la máquina corre en `fra`, y Neon está en
  `us-east-2`. Son ~100 ms por consulta en cada arranque.
- **Fila fantasma `default`**: queda una membership histórica del usuario demo
  (`default:e2f7…`) apuntando al tenant `default`, que no existe en el registro.
  No rompe nada, pero aparece como una empresa vacía si se listan memberships
  en crudo; se puede borrar cuando no haga falta el dato viejo.
- **Resend / Maps / WhatsApp / ElevenLabs**: siguen como en el punto 3.6.

### 7.5 Acceso con lista blanca

`OAUTH_ALLOWED_EMAILS=uniscrolliabrain@gmail.com` está puesto en Fly: sin esa
lista, cualquiera con cuenta de Google crearía un usuario en el deployment. Para
añadir a un cliente, se amplía esa variable o se crea el usuario como admin y se
le mete en su tenant con `POST /api/admin/tenants/<id>/members`.
