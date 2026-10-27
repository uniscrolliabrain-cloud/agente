# Cuentas, claves y secretos — checklist en orden de necesidad

> Esta es la lista que se tacha una por una. El contrato técnico (qué variable
> necesita qué modo y qué incoherencias detecta) vive en
> `scripts/secrets-check.ts`; esto es la parte tuya: abrir cuentas y sacar
> credenciales. Nada de aquí se escribe en el repo ni en el chat: se guarda en
> Doppler y se importa.

## 0. Antes de nada: no bloquea

El repo arranca y pasa los tests sin ninguna clave (`WORKSPACE_MODE=sample`,
PGlite, agentes de muestra). Es decir: **ya hay producto que ver localmente**
(`pnpm dev:all`) sin haber abierto una sola cuenta. Todo lo de abajo hace falta
para el salto a `live` y al despliegue, no para seguir construyendo.

## 1. Estructura de Doppler

Un **proyecto** (`agntiapro`, ya declarado en `doppler.yaml`) con tres configs:

| Config | Para qué | Qué NO va aquí |
|---|---|---|
| `dev` | tu portátil, `WORKSPACE_MODE=sample`, claves de sandbox de los proveedores | Postgres de producción |
| `stg` | rama de staging / preview de Fly | datos reales de clientes |
| `prd` | producción (`www.agntiapro.io`) | claves de sandbox |

Compartimentación dentro de cada config: **el prefijo es el compartimento**. Los
nombres ya están fijados por el código, así que no se inventan:

```
core       DATABASE_URL, PUBLIC_API_URL, TOKEN_ENCRYPTION_KEY, OPENMUSE_ACCESS_KEY,
           ALLOWED_ORIGINS, DATA_DIR
auth       AUTH_PROVIDER, SUPABASE_URL, SUPABASE_JWT_SECRET, SUPABASE_JWT_AUD
bootstrap  ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
llm        MODEL, MODEL_FALLBACK, GEMINI_API_KEY, OPENROUTER_API_KEY,
           FAST_LLM_*, SLOW_LLM_*, EMBEDDINGS_LLM_*
google     GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
email      RESEND_API_KEY
whatsapp   WHATSAPP_TOKEN, WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET, WHATSAPP_PHONE_ID
vapi       VAPI_API_KEY, VAPI_ASSISTANT_ID
stripe     STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET
leads      GOOGLE_MAPS_API_KEY
```

Dos reglas que evitan el 90% de los incidentes:

1. **Las credenciales de plataforma no van en Doppler.** `FLY_API_TOKEN`,
   `VERCEL_TOKEN`, `DOPPLER_TOKEN` y `SMOKE_*` son secretos de **GitHub
   Actions** (el workflow los espera ahí). Doppler es configuración de la
   aplicación; GitHub es acceso al despliegue.
2. **Vercel no recibe nada de servidor.** Solo el sitio estático; ninguna clave
   que firme, descifre o conecte a la base.

Para dar acceso sin entregar la cuenta: Doppler → *Service Tokens* (uno por
máquina/CI, solo lectura, por config). Nunca tu token personal.

## 2. Orden real hasta el despliegue

Cada bloque desbloquea algo concreto y verificable. Las dependencias van en
orden: no se puede verificar el login sin LLM, ni el despliegue sin base.

### Etapa 1 — Plataformas base (todo gratis, 20 min)

| # | Cuenta | Qué sacas | Desbloquea |
|---|---|---|---|
| 1 | **Doppler** (free) | proyecto `agntiapro` + configs `dev`/`stg`/`prd`; luego un *service token* | el resto de secretos |
| 2 | **Neon** (free) | `DATABASE_URL` (host `-pooler`) y el DSN directo | salir de PGlite: las corrupciones al cortar el frontend desaparecen |
| 3 | **Supabase** (free) | `SUPABASE_URL` (`https://<ref>.supabase.co`) | login multitenant con JWT real |
| 4 | **Fly.io** (pay-as-you-go, tarjeta) | `FLY_API_TOKEN` → GitHub | API + panel online |
| 5 | **Vercel** (hobby) | `VERCEL_TOKEN` → GitHub | sitio público |
| 6 | **Registrador del dominio** (si `agntiapro.io` no es tuyo) | acceso DNS | `www`, `api`, apex |

Neon: crea **dos bases** en el mismo proyecto (`agntia` y `agntia_business`) y un
rol de solo lectura para la segunda. `BUSINESS_DATABASE_URL` apuntando al rol
read-only es obligatorio, no opcional: `query_business` de las SOPs no lleva
filtro por owner, y `secrets:check` falla si ambas URLs son iguales.

### Etapa 2 — Modelos (lo primero que se nota)

| # | Cuenta | Qué sacas | Nota |
|---|---|---|---|
| 7 | **Google AI Studio** | `GEMINI_API_KEY` (idealmente **dos**, una por velocidad) | `FAST_LLM_API_KEY` habla con el usuario, `SLOW_LLM_API_KEY` razona en background: cuotas separadas, un pico de chat no deja al worker sin cuota. `EMBEDDINGS_LLM_API_KEY` puede ser la misma |
| 8 | **OpenRouter** (opcional, 10 €) | `OPENROUTER_API_KEY` | `MODEL_FALLBACK`: si Gemini falla antes de emitir texto, la tarea no muere |

Con esto ya puedes ejecutar una SOP de punta a punta y juzgar la calidad de las
respuestas. **Es el punto de control más importante de toda la lista**: si las
SOPs no convencen, no tiene sentido abrir Meta ni Vapi.

### Etapa 3 — Secretos que generas tú (no se compran)

```bash
# 32 bytes base64 — cifra los tokens OAuth de Google en reposo
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"   # TOKEN_ENCRYPTION_KEY

# >= 24 chars — live mode no arranca sin ella
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))" # OPENMUSE_ACCESS_KEY

# el handshake del webhook de WhatsApp, lo eliges tú (cadena larga aleatoria)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"      # WHATSAPP_VERIFY_TOKEN

# ADMIN_PASSWORD: elige una y cámbiala tras el primer login
# ADMIN_EMAIL / ADMIN_NAME: los tuyos
# COMPUTER_DEPLOYMENT_ID: cualquier identificador estable (o déjalo vacío)
# WORKER_TOKEN: solo si despliegas el browser worker (32+ chars)
```

`TOKEN_ENCRYPTION_KEY` **no se rota a la ligera**: si cambia, los tokens de
Google ya guardados dejan de descifrarse y hay que reconectar la cuenta.

### Etapa 4 — Auth multitenant (Supabase)

| Qué hacer | Dónde | Resultado |
|---|---|---|
| Activar firma asimétrica (RS256/ES256) | Supabase → Auth → Settings | el API valida por JWKS; `SUPABASE_JWT_SECRET` sobra |
| Hook *custom access token* que inyecte `app_metadata.tenant_id` | Supabase → Auth → Hooks | el tenant sale del token, no de un header que el cliente elige |
| Redirect URL `https://www.agntiapro.io/auth/callback` | Supabase → Auth → URL Configuration | vuelta del login |
| `AUTH_PROVIDER=supabase` | Doppler `prd` | con claim ausente: 401; tenant ajeno: 403 |

Si el proyecto sigue en HS256, entonces `SUPABASE_JWT_SECRET` y **no**
`SUPABASE_URL`. Las dos a la vez no: gana la JWKS.

Opcional pero recomendable antes de vender: SMTP propio en Supabase (el free
tiene un límite bajo de emails por hora y las invitaciones se atascan).

### Etapa 5 — Google OAuth (Gmail, Calendar, Drive)

| # | Cuenta | Qué sacas | Ojo |
|---|---|---|---|
| 9 | **Google Cloud** (gratis) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth client tipo *Web*; redirect **verbatim** `https://www.agntiapro.io/api/google/callback` |
| 10 | Misma cuenta | consent screen + scopes | `gmail.readonly`, `gmail.send`, `calendar.events`, `drive.file`. En modo *Testing* funciona con hasta 100 usuarios de prueba sin revisión |

**Empieza esta etapa pronto aunque no la uses aún.** `gmail.readonly` y
`gmail.send` son *restricted scopes*: para pasar de 100 usuarios y salir de
modo Testing, Google exige verificación de la app y una evaluación de seguridad
(CASA). Son semanas, no minutos. `drive.file` (solo lo que crea la app) evita
la parte más pesada de esa revisión; `drive` completo la empeora.

### Etapa 6 — Despliegue

```bash
doppler setup                                  # lee doppler.yaml
pnpm secrets:check --mode=live                 # gate: falla si falta algo obligatorio

# Fly recibe el entorno sin ficheros intermedios
doppler secrets download --no-file --format docker --config prd \
  | fly secrets import -a agntiapro-api

fly volumes create agntiapro_data -a agntiapro-api -r mad -s 10
fly deploy -a agntiapro-api
fly certs add www.agntiapro.io   -a agntiapro-api
fly certs add api.agntiapro.io   -a agntiapro-api
```

Y en GitHub → Settings → Secrets: `DOPPLER_TOKEN`, `FLY_API_TOKEN`,
`VERCEL_TOKEN`, `SMOKE_EMAIL`, `SMOKE_PASSWORD` (un usuario real del tenant
`agntia`, solo para el humo tras desplegar).

Vercel: proyecto con *Root Directory* `apps/site`, dominio apex. Nada más.

### Etapa 7 — Canales (después del despliegue, para vender de verdad)

Ninguno bloquea el dogfooding. Cada uno convierte una SOP de "prepara el
mensaje" en "lo envía".

| # | Cuenta | Qué sacas | Requisito que tarda |
|---|---|---|---|
| 11 | **Meta for Developers** → WhatsApp Cloud API | `WHATSAPP_TOKEN` (permanente, vía *system user*), `WHATSAPP_APP_SECRET`, `WHATSAPP_PHONE_ID`, `WHATSAPP_VERIFY_TOKEN` (tú) | verificación de negocio (Meta Business) y un número que **no** esté dado de alta en WhatsApp |
| 12 | **Vapi** | `VAPI_API_KEY`, `VAPI_ASSISTANT_ID` | saldo + número de teléfono (compra dentro de Vapi o trae uno de Twilio) |
| 13 | **Resend** | `RESEND_API_KEY` | verificar el dominio en DNS (SPF/DKIM) o el cold email va a spam |
| 14 | **Stripe** | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` | alta de la empresa y cuenta bancaria para cobrar de verdad |
| 15 | **Google Maps Platform** | `GOOGLE_MAPS_API_KEY` | tarjeta; restringe la key a Places API |

`WHATSAPP_TOKEN` sin `WHATSAPP_APP_SECRET` no se acepta: sin la firma
`X-Hub-Signature-256` cualquiera podría inyectar mensajes en el webhook.

**Estado real de los adaptadores (importante antes de pagar nada):** el código
lee hoy `WHATSAPP_APP_SECRET` (firma del webhook) y `WHATSAPP_VERIFY_TOKEN`
(token del endpoint de entrada), pero los clientes de Meta Cloud API, Vapi,
Resend y Google Maps todavía **no existen**: esas claves están declaradas en
`secrets-check` como opcionales y no cambian el comportamiento hasta que cierre
la campaña `canales`. El único canal con adaptador real es WhatsApp vía
Evolution (`WHATSAPP_API_KEY` + `WHATSAPP_BASE_URL` + `WHATSAPP_INSTANCE`).
Traducción: abre las cuentas de la etapa 7 cuando vayas a vender de verdad, no
antes; el despliegue de las etapas 1–6 no las necesita.

## 3. Lo que tarda días — empieza hoy

1. **Verificación de negocio en Meta** (WhatsApp): datos fiscales de la empresa.
2. **Verificación de Google** (Gmail/Drive en producción): vídeo de la app,
   dominio verificado y evaluación de seguridad.
3. **Stripe**: activación de cuenta y cuenta bancaria.
4. **Certificados de Fly**: dependen de que el DNS esté bien puesto.

Todo lo demás del checklist es cuestión de minutos.

## 4. Cómo me lo pasas

No por chat ni por GitHub. Dos vías válidas:

- **Doppler service token de solo lectura por config** → lo uso para
  `secrets:check` y para importar a Fly. Es lo que menos expone.
- **Tú ejecutas** `doppler secrets set` y el `fly secrets import`: yo solo
  verifico con `pnpm secrets:check --mode=live` y el humo.

Los cuatro que **no** deberían pasar por mis manos en ningún caso:
`ADMIN_PASSWORD` (ponla tú y hazme saber solo el email), las credenciales del
registrador, el acceso al banco de Stripe y la contraseña maestra de Doppler.

## 5. Estado de la lista

- [ ] 1 Doppler · [ ] 2 Neon · [ ] 3 Supabase · [ ] 4 Fly · [ ] 5 Vercel · [ ] 6 DNS
- [ ] 7 Gemini (×2) · [ ] 8 OpenRouter
- [ ] 3 secretos generados (`TOKEN_ENCRYPTION_KEY`, `OPENMUSE_ACCESS_KEY`, `WHATSAPP_VERIFY_TOKEN`)
- [ ] claim de tenant + redirects en Supabase
- [ ] 9 Google OAuth client
- [ ] deploy + certificados + humo
- [ ] 11 Meta · [ ] 12 Vapi · [ ] 13 Resend · [ ] 14 Stripe · [ ] 15 Maps
