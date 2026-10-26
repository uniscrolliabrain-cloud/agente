# CUENTAS — lista maestra de cuentas, claves y verificaciones

> Lo que tienes que abrir tú y el dato exacto que hay que entregar al equipo dev.
> Marca cada casilla cuando esté hecho. Nada de esto se pasa por chat: ver `EQUIPO.md` §6.
> Última actualización: 26 oct 2026.

## Cómo se lee

- **Variable**: el nombre exacto que espera el código (o que hay que añadir a `apps/server/src/config.ts`).
- **Solo tú**: verificación que exige identidad/facturación del founder y no se puede delegar.
- **Tiempo**: lo que tarda la plataforma, no lo que tardas tú.

---

## Fase 0 — Arranque (sin esto no hay nada)

### 0.1 Supabase — Postgres + Auth
- [ ] Cuenta y proyecto en https://supabase.com/dashboard
- [ ] Región: la más cercana a Madrid (`eu-west-1`/`eu-central-1`)
- [ ] Guardar de **Settings → API**: `Project URL`, `anon public`, `service_role`
- [ ] Guardar de **Settings → API → JWT**: el secreto legacy **o** la URL JWKS (`https://<proj>.supabase.co/auth/v1/.well-known/jwks.json`)
- [ ] Copiar **Settings → Database → Connection string** (usar la de *Connection pooling*, puerto 6543, y la directa 5432)

| Variable | Dónde se usa |
|---|---|
| `DATABASE_URL` | `apps/server/src/config.ts` → `createStore` (sustituye PGlite) |
| `SUPABASE_URL` | nuevo: verificación JWT |
| `SUPABASE_ANON_KEY` | nuevo: login del frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | nuevo: backend (crear usuarios, leer `user_tenants`) |
| `SUPABASE_JWT_SECRET` / `SUPABASE_JWKS_URL` | `apps/server/src/engine/auth/jwt.ts` (hoy **no verifica firma**) |
| `AUTH_PROVIDER=supabase` | `config.ts` (el middleware se monta solo con este valor) |

**Solo tú**: ser owner del proyecto (no hace falta nada más aquí).
**Tiempo**: 5 min. **Bloquea**: todo.

### 0.2 Modelo LLM — Google AI Studio
- [ ] Key en https://aistudio.google.com/apikey
- [ ] Comprobar cuota del modelo `gemini-3.6-flash` y de `text-embedding-004`
- [ ] (Opcional) segunda key para separar chat/rápido de razonamiento/lento

| Variable | Uso |
|---|---|
| `GEMINI_API_KEY` | chat, tareas, planificación |
| `FAST_LLM_API_KEY` / `SLOW_LLM_API_KEY` | cuotas separadas por velocidad (opcional, cae a la global) |
| `EMBEDDINGS_LLM_API_KEY` | RAG + memoria (`text-embedding-004`) |

**Tiempo**: 2 min. **Bloquea**: chat, RAG, tests de conversación.

### 0.3 OpenRouter — fallback y respaldo
- [ ] Cuenta y saldo en https://openrouter.ai/keys
- [ ] Key con límite de gasto mensual configurado

| Variable | Uso |
|---|---|
| `OPENROUTER_API_KEY` | `config.ts` deriva `OPENAI_API_KEY`/`OPENAI_BASE_URL` para la cadena de fallback |
| `OPENROUTER_MODEL` | id del modelo en OpenRouter |

**Tiempo**: 10 min (con crédito). **Bloquea**: nada crítico, pero sin esto un 429 de Gemini tumba el chat.

### 0.4 Dominio y DNS
- [ ] Dominio de la agencia (si aún no lo tienes, este es el momento)
- [ ] DNS en Cloudflare (o el registrar)
- [ ] `api.tudominio.com` → donde corra la API (Fly/VPS)
- [ ] `app.tudominio.com` → frontend
- [ ] `mail.tudominio.com` + `cold.tudominio.com` → envío de email (SPF/DKIM)

| Variable | Uso |
|---|---|
| `PUBLIC_API_URL` | callbacks de Google, webhooks de WhatsApp/Vapi/Stripe |
| `ALLOWED_ORIGINS` | CORS del frontend |

**Solo tú**: DNS. **Tiempo**: 15 min + propagación. **Bloquea**: todos los webhooks.

### 0.5 Fly.io
- [ ] Cuenta en https://fly.io/dashboard (ya hay `fly.toml`, app `openmuse-api`, región `mad`)
- [ ] Volumen `openmuse_data` (5 GB) para `/data`
- [ ] Token de deploy para CI: `fly tokens create deploy`

| Variable | Uso |
|---|---|
| `FLY_API_TOKEN` | GitHub Actions (secret de CI, no del runtime) |

**Solo tú**: método de pago. **Tiempo**: 15 min. **Bloquea**: deploy.

> Alternativa si prefieres VPS: un `docker compose` con Postgres + API + worker. Requiere que me lo digas, porque cambia el deploy y los backups.

### 0.6 Genera tú (no se piden a nadie)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"  # TOKEN_ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"    # OPENMUSE_ACCESS_KEY (>=24)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"    # WORKER_TOKEN (>=32)
```
- [ ] `TOKEN_ENCRYPTION_KEY` — cifra tokens OAuth en reposo. **Si se pierde, todos los tokens de clientes hay que reconectarlos.**
- [ ] `OPENMUSE_ACCESS_KEY` — obligatoria en `WORKSPACE_MODE=live`
- [ ] `WORKER_TOKEN` — compartido entre API y browser worker
- [ ] `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` — primer admin (login da 401 sin esto)

---

## Fase 1 — Canales de los dos agentes

### 1.1 Google Cloud — OAuth (Calendar, Gmail, Drive)
- [ ] Proyecto en https://console.cloud.google.com
- [ ] Habilitar APIs: **Gmail API**, **Google Calendar API**, **Google Drive API**
- [ ] **OAuth consent screen**: nombre de app, logo, dominio, política de privacidad, términos
- [ ] **Credentials → OAuth client ID → Web application**
- [ ] Redirect URIs **exactas**:
  - `https://api.tudominio.com/api/google/callback`
  - `https://api.tudominio.com/api/gmb/callback` (solo si usas Google Business)
  - para local: `http://127.0.0.1:8787/api/google/callback`
- [ ] Añadirte como **test user** (hasta 100 usuarios sin verificación)
- [ ] Decidir: scopes de escritura (ver aviso)

| Variable | Uso |
|---|---|
| `GOOGLE_CLIENT_ID` | `google-auth.ts` |
| `GOOGLE_CLIENT_SECRET` | `google-auth.ts` |

**Aviso**: el código pide lectura siempre y, con `write=true`, `mail.google.com` + `gmail.send` + `gmail.modify` + `calendar` + `drive` completo (`google-auth.ts:110-131`). Son scopes **restringidos**: en modo test funcionan para tus test users; para producción con clientes exigen **verificación de Google** (semanas, y auditoría de seguridad si distribuyes a terceros). Arranca el trámite ya si vas a vender esto con Gmail/Drive.
**Solo tú**: consent screen, política de privacidad, verificación. **Tiempo**: 20 min (test) / semanas (producción).

### 1.2 WhatsApp — elige uno

**Opción A — Meta WhatsApp Cloud API (oficial, recomendado para vender)**
- [ ] App en https://developers.facebook.com/apps (tipo Business)
- [ ] Producto **WhatsApp** añadido
- [ ] **Business verification** de Meta (documentos de empresa)
- [ ] Número de teléfono dedicado (no tu móvil) verificado
- [ ] WABA ID + Phone Number ID
- [ ] Token permanente de **System User** (no el token temporal de 24 h)
- [ ] Webhook: `https://api.tudominio.com/api/whatsapp/webhook` + verify token
- [ ] Plantillas de mensaje aprobadas (para escribir primero hace falta plantilla)

**Opción B — Evolution API (no oficial, rápido)**
- [ ] VPS o contenedor con https://github.com/EvolutionAPI/evolution-api
- [ ] Número dedicado + QR escaneado
- [ ] API key de la instancia + nombre de instancia
- [ ] Webhook apuntando a `https://api.tudominio.com/api/whatsapp/webhook`

| Variable | Uso |
|---|---|
| `WHATSAPP_API_KEY` | `stubs/whatsapp.ts` (cabecera `apikey`) |
| `WHATSAPP_BASE_URL` | URL de la instancia |
| `WHATSAPP_INSTANCE` | nombre de instancia |
| `WHATSAPP_WEBHOOK_TOKEN` | verificación del webhook |
| `WHATSAPP_WEBHOOK_SECRET` | firma HMAC (`whatsapp-routes.ts:75` ya la valida) |

**Solo tú**: Business verification, número, QR. **Tiempo**: 1–3 días (A) / 30 min (B).
**Recomendación**: A para el primer cliente que pague; B solo para probar el flujo end-to-end esta semana.

### 1.3 Resend — email transaccional y de verificación
- [ ] Cuenta en https://resend.com/api-keys
- [ ] Dominio de envío verificado (registros SPF + DKIM en DNS)
- [ ] Key con permiso de envío

| Variable | Uso |
|---|---|
| `SMTP_API_KEY` | `auth-signup.ts:177` (**hoy es un stub que no envía nada**) |
| `EMAIL_FROM` | nuevo: remitente verificado |

**Aviso cold outreach**: usa un **dominio distinto** del principal y caliéntalo 2–3 semanas. Si quemas el dominio de la agencia, pierdes también el correo comercial.
**Solo tú**: DNS. **Tiempo**: 30 min + verificación DNS.

### 1.4 Vapi — teléfono
- [ ] Cuenta en https://dashboard.vapi.ai
- [ ] Número (US inmediato; **ES necesita proveedor SIP/Twilio** — dime cuál)
- [ ] API key privada
- [ ] Server URL: `https://api.tudominio.com/api/telephony/vapi` + secreto
- [ ] Asistente con el LLM (puede usar tu key de Gemini/OpenAI)

| Variable | Uso |
|---|---|
| `VAPI_API_KEY` | nuevo (no existe nada de telefonía en el repo) |
| `VAPI_PHONE_NUMBER_ID` | nuevo |
| `VAPI_WEBHOOK_SECRET` | nuevo |

**Solo tú**: pago del número, KYC si lo pide. **Tiempo**: 24 h (US) / 1–2 semanas (ES).
**Nota**: Vapi sustituye al plan Twilio + Whisper + TTS del doc 02. Más rápido y más barato de operar.

---

## Fase 2 — Captación de leads y cobro

### 2.1 Google Maps Platform — Places API
- [ ] Proyecto con facturación activa en https://console.cloud.google.com/google/maps-apis
- [ ] Habilitar **Places API (New)**
- [ ] Key restringida a Places API (por IP del servidor)
- [ ] Límite de gasto diario configurado (evita sorpresas)

| Variable | Uso |
|---|---|
| `GOOGLE_MAPS_API_KEY` | nuevo: buscador de negocios locales (nombre, web, teléfono, reviews) |

**Solo tú**: facturación. **Tiempo**: 15 min.
**No scrapees Maps con Playwright**: bloqueo + violación de ToS. Places es la vía legítima.

### 2.2 Búsqueda web — elige uno
- [ ] Tavily https://app.tavily.com · o Brave https://api.search.brave.com/app/keys · o Serper https://serper.dev

| Variable | Uso |
|---|---|
| `SEARCH_API_KEY` | nuevo: descubrir webs y señales antes de calificar un lead |

**Por qué**: `read_web` solo lee una URL que ya conoces. Sin buscador el agente SDR no descubre nada.
**Tiempo**: 10 min.

### 2.3 Stripe — cobro a clientes
- [ ] Cuenta en https://dashboard.stripe.com (empieza en **test mode**)
- [ ] Datos de empresa + cuenta bancaria (KYC)
- [ ] Productos y precios de tus planes (setup + mensual)
- [ ] Webhook: `https://api.tudominio.com/api/billing/webhook`

| Variable | Uso |
|---|---|
| `STRIPE_API_KEY` | `stubs/stripe.ts` |
| `STRIPE_WEBHOOK_SECRET` | `billing-routes.ts:21` (firma ya implementada) |
| `STRIPE_PRICE_*` | nuevo: ids de precio por plan |

**Solo tú**: KYC y banco. **Tiempo**: 1 h (test) / 1–2 días (cobros reales).

### 2.4 Google Business Profile (opcional, cliente 2)
- [ ] Pedir acceso a **Business Profile APIs** (formulario de Google, aprobación manual)
- [ ] `GMB_CLIENT_ID`, `GMB_API_KEY`

**Tiempo**: días/semanas. No bloquea el MVP.

---

## Fase 3 — Después del primer cliente

- [ ] **LinkedIn**: el API oficial **no permite mensajes directos** ni automatizar outreach. Sales Navigator + partner program, o terceros (Unipile, PhantomBuster) con riesgo de ban. **Recomendación: no está en el MVP**; email + WhatsApp + teléfono cubren la captación.
- [ ] **Sentry** (`SENTRY_DSN`) — errores en producción.
- [ ] **Proxy residencial** (`PROXY_URL`) — solo si el browser worker tiene que navegar sitios con anti-bot.
- [ ] **Segundo proyecto Google** dedicado a Maps/Places, para separar cuotas y facturación.

---

## Gestor de secretos — recomendación

Tres capas, no una:

| Capa | Herramienta | Por qué |
|---|---|---|
| Cuentas maestras (email, 2FA, paneles) | **1Password** o **Bitwarden** | Son tuyas y no se comparten nunca. 2FA dentro del gestor |
| Secretos de aplicación (dev/staging/prod) | **Infisical** (open source, self-hostable) o **Doppler** | Un `.env` por entorno, CLI que inyecta (`infisical run -- pnpm dev`), sync a Fly y a GitHub Actions, historial de cambios |
| Secretos de runtime en producción | **`fly secrets set`** | Quedan cifrados en el proveedor y no pasan por el repo |

Regla de oro: **el repo solo tiene `.env.example`**. Un `pre-commit` que bloquee `.env` y claves con prefijo conocido (`sk-`, `postgres://`, `ghp_`) cuesta 10 minutos y evita el 90 % de los accidentes.

Para el sandbox del agente: **Settings → Secrets** del proyecto en Freebuff. Es el único canal por el que un secreto llega a mí sin quedar escrito en el chat.

---

## Verificaciones que solo puede hacer el founder

| # | Dónde | Qué |
|---|---|---|
| 1 | Google Cloud | Pantalla de consentimiento OAuth (nombre, logo, dominio, privacidad, términos) + verificación de scopes restringidos |
| 2 | Meta | Business verification + display name del número de WhatsApp |
| 3 | Stripe | KYC de empresa y cuenta bancaria |
| 4 | Vapi | Pago del número / KYC si aplica |
| 5 | Registrar/DNS | Registros A, CNAME, SPF, DKIM |
| 6 | Supabase | Ser owner del proyecto (nadie más puede rotar el service role) |
| 7 | Fly.io | Método de pago |
| 8 | Dominio de cold email | Calentamiento 2–3 semanas antes de mandar volumen |

---

## Orden recomendado (para que nada te bloquee)

1. **Hoy**: Supabase + Gemini key + dominio/DNS + Fly. Con eso levanto el slice.
2. **Hoy**: Google Cloud OAuth (test users) — es lo que más tarda en verificación.
3. **Mañana**: WhatsApp (opción B para probar, opción A en paralelo por el papeleo).
4. **Esta semana**: Resend + Vapi + Places + buscador.
5. **Antes del primer cobro**: Stripe con datos reales.
6. **Cuando haya cliente 2**: GMB, LinkedIn, Sentry.
