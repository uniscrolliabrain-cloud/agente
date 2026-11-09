# Variables de Entorno

> v1 · 2026-10-27 · Estado: current

Catálogo completo de variables de entorno leídas por `apps/server/src/config.ts`.

## Mínimas (desarrollo local)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `WORKSPACE_MODE` | `sample` | `sample` \| `live`. Sample es local-only (HOST loopback). |
| `PORT` | `8787` | Puerto del servidor. |
| `HOST` | `127.0.0.1` | Host del servidor. |
| `DATA_DIR` | `.agente` | Directorio de datos locales. |

## Obligatorias en modo `live`

| Variable | Descripción |
|----------|-------------|
| `AGENTE_ACCESS_KEY` | 24+ caracteres. Validado con timingSafeEqual. |
| `TOKEN_ENCRYPTION_KEY` | Clave de 32 bytes base64 para cifrado de tokens/credenciales. |
| `DATABASE_URL` | DSN de Postgres real (requerido para worker separado y multi-tenant). |

## LLM y proveedores

| Variable | Default | Descripción |
|----------|---------|-------------|
| `FAST_LLM_API_KEY` | — | API key para modelo fast (chat). |
| `GEMINI_API_KEY` | — | Atajo para Google Gemini. Se aliasa a `GOOGLE_API_KEY` si está vacío. |
| `OPENROUTER_API_KEY` | — | Atajo para OpenRouter. Se aliasa a `OPENAI_API_KEY` si está vacío. |
| `OPENAI_API_KEY` | — | API key OpenAI-compatible. |
| `OPENAI_BASE_URL` | `https://openrouter.ai/api/v1` | Base URL para OpenAI-compatible. |
| `FAST_CALLS_PER_HOUR` | `600` | Cuota fast por hora. |
| `SLOW_CALLS_PER_HOUR` | `60` | Cuota slow por hora. |
| `LLM_FIRST_BYTE_MS` | `45000` | Timeout primer byte LLM. |
| `LLM_GLOBAL_MS` | `120000` | Timeout global LLM. |

## Google OAuth

| Variable | Default | Descripción |
|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | — | Client ID de Google OAuth. |
| `GOOGLE_CLIENT_SECRET` | — | Client secret de Google OAuth. |
| `GOOGLE_HTTP_MS` | `30000` | Timeout HTTP de Google API. |

## WhatsApp (Evolution API)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `WHATSAPP_API_KEY` | — | API key de Evolution API. |
| `WHATSAPP_BASE_URL` | — | URL base de Evolution API (ej: `http://evolution:8080`). |
| `WHATSAPP_INSTANCE` | — | Nombre de la instancia de Evolution. |
| `WHATSAPP_WEBHOOK_SECRET` | — | Secreto para verificar firma HMAC del webhook. |

## Stripe

| Variable | Default | Descripción |
|----------|---------|-------------|
| `STRIPE_API_KEY` | — | API key de Stripe. |
| `STRIPE_HTTP_MS` | `20000` | Timeout HTTP de Stripe. |

## Worker y tareas

| Variable | Default | Descripción |
|----------|---------|-------------|
| `WORKER_MAX_ACTIVE` | `50` | Máximo de tareas activas concurrentes. |
| `WORKER_MAX_PER_OWNER` | — | Máximo de tareas activas por owner. |
| `WORKER_LEASE_MS` | `60000` | Lease de tarea en ms. |
| `TASK_TIMEOUT_MS` | `600000` | Timeout duro por tarea (10 min). |
| `BROWSER_WORKER_URL` | — | URL del browser worker (Playwright). |
| `WORKER_TOKEN` | — | Token del worker. |
| `TASK_WORKER_ENABLED` | `true` | Habilitar worker de tareas. |

## Computer (Docker)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `COMPUTER_ENABLED` | `false` | Habilitar contenedor Docker aislado. |
| `COMPUTER_IMAGE` | `agente-computer:local` | Imagen Docker del computer. |
| `COMPUTER_DEPLOYMENT_ID` | — | ID de despliegue del computer. |
| `COMPUTER_COMMAND_MS` | `30000` | Timeout de comando en computer. |
| `COMPUTER_CLIENT_MS` | `35000` | Timeout cliente de computer. |

## Backup

| Variable | Default | Descripción |
|----------|---------|-------------|
| `BACKUP_INTERVAL_HOURS` | `24` | Intervalo de backup en horas. |
| `BACKUP_RETENTION_DAYS` | `7` | Retención de backups en días. |

## Multi-tenant

| Variable | Default | Descripción |
|----------|---------|-------------|
| `MULTI_TENANT_SHARED` | — | `true` activa multi-tenant compartido con RLS Postgres. |
| `TENANT_CACHE_TTL_MS` | `300000` | TTL de cache de membership en ms (5 min). |

## Authz y clasificación

| Variable | Default | Descripción |
|----------|---------|-------------|
| `AUTHZ_ENABLED` | `true` (live) / `false` (sample) | Habilitar autorización granular. |
| `FIELD_CLASSIFICATION_ENABLED` | `true` (live) / `false` (sample) | Habilitar clasificación de campos. |
| `AUTH_PROVIDER` | `session` | `session` \| `supabase`. |
| `POLICY_CACHE_TTL_MS` | `60000` | TTL de cache de políticas. |

## Auditoría y trazabilidad

| Variable | Default | Descripción |
|----------|---------|-------------|
| `AUDIT_TRAIL_ENABLED` | `true` | Habilitar trail de auditoría. |
| `RECORD_HISTORY_ENABLED` | `false` | Habilitar historial de registros. |
| `SESSION_TTL_MS` | `604800000` | TTL de sesión en ms (7 días). |

## Logging y métricas

| Variable | Default | Descripción |
|----------|---------|-------------|
| `LOG_LEVEL` | — | Nivel de logging. |
| `LOG_SAMPLE_RATE` | — | Tasa de muestreo de logs. |
| `DO_NOT_TRACK` | `1` | Desactivar telemetría. |
| `COPILOTKIT_TELEMETRY_DISABLED` | `true` | Desactivar telemetría de CopilotKit. |

## Seguridad y red

| Variable | Default | Descripción |
|----------|---------|-------------|
| `ALLOWED_ORIGINS` | `http://localhost:8081,http://127.0.0.1:8081` | Orígenes CORS permitidos (CSV). |
| `SHUTDOWN_DRAIN_MS` | `10000` | Timeout de drenado al apagar. |

## Otros

| Variable | Default | Descripción |
|----------|---------|-------------|
| `BROWSER_NAV_MS` | `20000` | Timeout de navegación del browser. |
| `DEFERRED_ACTION_WINDOW_MS` | `8000` | Ventana de deshacer acción diferida. |
| `DEFERRED_ACTION_DUAL_AT` | — | Importe para doble firma (null = nunca). |
| `PUBLIC_URL` | — | URL pública del servidor (para firmas de URLs y callbacks). |
