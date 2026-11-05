# Despliegue del Backend

> v1 · 2026-10-27 · Estado: current

## Requisitos previos

- Node >= 22
- pnpm 11.x
- Docker (opcional, para computer)
- Postgres real (para producción, opcional; por defecto usa PGlite)

## Instalación

```bash
pnpm install
```

Copiar `.env.example` a `.env`. Mínimo para desarrollo:

```
WORKSPACE_MODE=sample
PORT=8787
HOST=127.0.0.1
DATA_DIR=.openmuse
```

Variables obligatorias en modo `live`:

```
OPENMUSE_ACCESS_KEY=<24+ caracteres>
TOKEN_ENCRYPTION_KEY=<32-byte base64>
DATABASE_URL=<postgres://...>
```

## Ejecución en desarrollo

```bash
# API + worker en desarrollo
pnpm dev

# Solo worker de tareas (requiere DATABASE_URL)
pnpm dev:worker
```

## Ejecución en producción

```bash
# Construir el servidor
pnpm build:server

# Iniciar el servidor
pnpm start

# Iniciar el worker separado
pnpm start:worker
```

## Modos de operación

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `WORKSPACE_MODE` | `sample` | Modo local, sin credenciales reales. HOST debe ser loopback. |
| `WORKSPACE_MODE` | `live` | Modo producción. Requiere `OPENMUSE_ACCESS_KEY` y `TOKEN_ENCRYPTION_KEY`. |

## Docker

El Dockerfile local compila el servidor y copia `dist`. El despliegue remoto añade build/copia del panel.

```bash
docker build -t openmuse-server .
```

## Variables críticas para producción

| Variable | Por qué es crítica |
|----------|-------------------|
| `OPENMUSE_ACCESS_KEY` | Autenticación de acceso en modo live. |
| `TOKEN_ENCRYPTION_KEY` | Cifrado de tokens de Google y credenciales. |
| `DATABASE_URL` | Postgres real para producción y multi-tenant. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth de Google. |
| `WHATSAPP_API_KEY` / `WHATSAPP_BASE_URL` / `WHATSAPP_INSTANCE` | WhatsApp vía Evolution API. |
| `STRIPE_API_KEY` | Pagos con Stripe. |

## Backups

| Script | Descripción |
|--------|-------------|
| `pnpm backup:create` | Backup global (files, browser-profiles, signing-key). |
| `pnpm backup:tenant` | Backup por tenant. |
| `pnpm backup:restore` | Restaurar backup. |

**Nota**: `runBackup` copia el directorio `postgres/files/signing-key` desde su ruta configurada o por defecto. `runTenantBackup` copia files/browser-profiles. No es un dump de Postgres administrado.

## Métricas y logs

- Métricas conectadas pero parte del snapshot de alertas usa ceros fijos.
- Logs con `LOG_LEVEL` y `LOG_SAMPLE_RATE` configurables.
- No presentar métricas como medidas reales solo porque el endpoint responda.
