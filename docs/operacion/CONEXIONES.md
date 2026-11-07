# Conexiones: qué hay, qué falta y qué está roto

> Estado medido el **2026-11-05** contra el config `dev_campaign_transversal_leads_ia`
> del proyecto Doppler `agntiapro`. Todos los números salen de ejecutar los
> comandos de abajo, no de leer `.env.example`.

## Cómo se comprueba

```bash
# Contrato: solo lee el entorno, no llama a nadie.
pnpm connections

# Sondas en vivo: llama a cada servicio y escribe artifacts/connections/report.json
doppler run -- pnpm connections:probe

# Contrato de produccion (exige las obligatorias de live)
doppler run -- pnpm secrets:check --mode=live

# Arrancar el API con el entorno de Doppler, sin escribir .env
pnpm dev:doppler
```

`pnpm connections` **nunca imprime un valor**: dice si existe, qué nombre lo
aporta y qué contestó el servicio. Los informes van a `artifacts/`, que ya está
ignorado por git.

## Estado medido

| Bloque | Presentes | En verde | Nota |
|---|---|---|---|
| Core (DB, URL, cifrado, CORS) | 1/6 | 0/1 | el `DATABASE_URL` actual no resuelve |
| Auth (Supabase) | 1/3 | 1/1 | JWKS responde con 1 clave |
| LLM | 2/7 | 1/2 | Gemini verde **solo por el shell**, no por Doppler |
| Email (Resend) | 1/2 | 0/1 | key válida, **0 dominios verificados** |
| Google (Gmail/Calendar/Drive) | 2/2 | 1/1 | OAuth intercambia token correctamente |
| Leads | 3/3 | 1/2 | Apify OK; Maps con la API desactivada |
| WhatsApp | 3/5 | 0/1 | token presente pero Graph lo rechaza |
| Voz | 2/3 | 1/1 | Vapi OK con 1 asistente, falta `VAPI_ASSISTANT_ID` |
| Billing | 0/2 | — | sin Stripe |
| Observabilidad | 2/2 | 0/2 | DSN y URL de Grafana mal formados |
| Deploy | 4/4 | 3/3 | Cloudflare, Fly y Vercel verificados |

**21 de 39 conexiones presentes, 8 de 16 sondas en verde.**

## Los 8 huecos de producción

Ejecutando `secrets:check --mode=live` faltan exactamente estas:

| Variable | Por qué bloquea |
|---|---|
| `PUBLIC_API_URL` | sin ella el redirect de Google se deriva de `localhost` y el consentimiento falla en producción |
| `TOKEN_ENCRYPTION_KEY` | 32 bytes base64; sin ella Google no guarda tokens y los endpoints dan 503 |
| `OPENMUSE_ACCESS_KEY` | >=24 caracteres; live no arranca |
| `ALLOWED_ORIGINS` | sin el, el panel en otro host no puede llamar al API con credenciales |
| `AUTH_PROVIDER` | debe ser `supabase` para el multitenant con JWT |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | sin ellos no hay primer admin y el login da 401 |
| `MODEL` | `<provider>/<modelo>`; sin él el chat arranca sin motor |

Generar las dos claves:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"  # TOKEN_ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"     # OPENMUSE_ACCESS_KEY
```

## Lo que está roto, no ausente

Estas existen pero no funcionan. No es un problema de configuración del repo:

1. **`DATABASE_URL` apunta a un host que no existe.** Es una conexión directa
   (`db.<ref>.supabase.co:5432`, `sslmode` ausente) y el DNS no resuelve:
   `getaddrinfo ENOTFOUND`. Los proyectos actuales de Supabase solo exponen el
   pooler (`aws-0-<region>.pooler.supabase.com:6543`, usuario `postgres.<ref>`).
   Mientras no se sustituya, la app cae a PGlite — y PGlite es lo que se
   corrompe al cortar el proceso. **Bloqueado hasta tener la credencial de Neon.**

2. **`RESEND_API_KEY` es válida pero la cuenta no tiene ningún dominio
   verificado.** Se puede llamar a la API y no se puede enviar desde
   `@agntiapro.com`. Hace falta verificar el dominio en Resend y definir
   `EMAIL_FROM` con una dirección de ese dominio.

3. **`GOOGLE_MAPS_API_KEY` tiene la API desactivada** en el proyecto de Google
   (`REQUEST_DENIED: This API is not activated on your API project`). Hay que
   habilitar *Geocoding API* y *Places API*.

4. **`WHATSAPP_ACCESS_TOKEN` no se puede parsear** (`Invalid OAuth access token -
   Cannot parse access token`). Es un token truncado o de otro tipo: el que
   funciona es el *permanent token* de un System User con `whatsapp_business_messaging`.

5. **`ELEVENLABS_API_KEY` responde 401** y **`OPENROUTER_API_KEY` responde
   `User not found`**: claves revocadas o de otra cuenta.

6. **`SENTRY_DSN` no es una URL válida** y **`GRAFANA_URL` devuelve 404** en
   `/api/health` (probablemente falta el subpath del stack).

7. **`GOOGLE_API_KEY` solo existe en el shell de la máquina, no en Doppler.**
   Por eso Gemini sale verde al probar en local y desaparecería en un contenedor.
   El CLI lo marca como `SHELL` precisamente para que no haya falsos verdes.

## Alias: por qué el secreto existe y la app decía que faltaba

Doppler publica varios secretos con el nombre del proveedor; el repo los leía
con el nombre corto. Ahora se normalizan **una sola vez al arrancar**
(`apps/server/src/config.ts`), así que todos los lectores ven lo mismo:

| El repo lee | Doppler publica |
|---|---|
| `WHATSAPP_TOKEN` | `WHATSAPP_ACCESS_TOKEN` |
| `WHATSAPP_PHONE_ID` | `WHATSAPP_PHONE_NUMBER_ID` |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | `WHATSAPP_WABA_ID` |
| `GEMINI_API_KEY` | `GOOGLE_API_KEY` |
| `EMAIL_FROM` | `RESEND_FROM` / `RESEND_FROM_EMAIL` |

## Qué consume cada credencial (código de esta rama)

| Credencial | Código que la usa | Comportamiento sin ella |
|---|---|---|
| `RESEND_API_KEY` + `EMAIL_FROM` | `packages/integrations/src/resend.ts` → `auth-signup.ts` | el alta se crea, el email no sale y se registra la causa; nunca finge un envío |
| `VAPI_API_KEY` + `VAPI_ASSISTANT_ID` | `packages/integrations/src/vapi.ts` → `/api/voice/*` | 503 con causa; `VOICE_OUTBOUND_ENABLED` debe ser `true` para marcar |
| `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID` | `packages/integrations/src/meta-whatsapp.ts` → motor de aprobaciones | 503; el webhook sigue entrando pero no se puede responder |
| `GOOGLE_CLIENT_ID`/`SECRET` + `TOKEN_ENCRYPTION_KEY` | `apps/server/src/google-auth.ts` | 503 al conectar Google |
| `GOOGLE_MAPS_API_KEY` | `packages/integrations/src/google-maps.ts` → `POST /api/leads/discover` | 503; el resto del panel sigue funcionando |

Cambios de fondo que trae esta rama:

- **Email real**: el emisor anterior era un stub que devolvía `skipped`. Ahora
  Resend envía de verdad, con `Idempotency-Key` en la verificación de cuenta.
- **Voz**: no existía cliente de Vapi. Hay rutas `/api/voice/status`,
  `POST /api/voice/calls` (idempotente por cabecera) y `GET /api/voice/calls/:id`,
  con scope de empresa y registro local de cada llamada.
- **WhatsApp Meta de salida**: el webhook ya entendía Meta, pero el motor de
  envío solo hablaba Evolution. Una conexión declara su proveedor y el motor
  elige el cliente; las conexiones antiguas siguen válidas.
- **Leads**: no existía cliente de Places ni forma de poblar el tipo `lead` del
  bootstrap. `POST /api/leads/discover` busca, normaliza y deduplica por
  `placeId` bajo la empresa; repetir la búsqueda no duplica filas.
- **Google por empresa**: `GoogleAuth` recibía el `Store` crudo, así que el mismo
  usuario en dos empresas compartía token. Las credenciales van ahora al store
  con scope; el `state` de OAuth se queda en el raíz porque el callback no trae
  sesión, y la empresa viaja dentro del state para restaurar el scope.

## Regla de resultado (igual en los tres canales)

- **4xx** → rechazo definitivo (`422`): se corrige y se reintenta.
- **5xx, 408, 429 o corte de red** → `OutcomeUnknownError`: el proveedor pudo
  aceptarlo. En WhatsApp y Vapi **no se reintenta a ciegas**; en Resend se
  reintenta con la misma `Idempotency-Key`.

## Añadir una conexión

1. Añadir la entrada a `scripts/lib/connections.ts` (nombre canónico, alias,
   obligatoriedad, sonda si la hay).
2. Si el nombre de Doppler difiere, añadir el alias en
   `apps/server/src/config.ts` y en `scripts/secrets-check.ts`.

No hay un tercer sitio: el registro es la única lista.
