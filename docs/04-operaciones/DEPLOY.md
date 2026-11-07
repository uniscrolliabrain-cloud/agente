# Despliegue del Backend

> Estado: vigente · Fuente de verdad para el despliegue del backend y del panel.

## Requisitos previos

- Node >= 22
- pnpm 11.x
- Docker (opcional, para computer)
- Postgres real con `DATABASE_URL` en producción. En desarrollo se puede usar PGlite.

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

El [Dockerfile](../../Dockerfile) construye el servidor y el panel. Fly sirve ambos desde el mismo origen.

```bash
docker build -t openmuse-server .
```

## Release en Fly

El [workflow Deploy](../../.github/workflows/deploy.yml) se activa con un tag `v*` para producción o mediante lanzamiento manual. Selecciona exactamente `preview` o `production`. Para preview configura `FLY_APP_API_PREVIEW` y `FLY_APP_WORKER_PREVIEW` en el entorno de GitHub Actions.

1. Antes de publicar, ejecuta `pnpm release:check`. El workflow aplica su propio gate de tipado, tests y coherencia antes de desplegar.
2. Comprueba el entorno y las aplicaciones de destino. El workflow importa los secretos de runtime desde Doppler y etiqueta las imágenes de API y worker con el SHA corto de la release.
3. Comprueba el resultado del smoke del workflow y ejecuta `pnpm release:verify` con `OPENMUSE_URL` apuntando al destino. Revisa `/api/health` y `/api/health-deep`. Confirma el worker con el diagnóstico de la API y sus logs.
4. Registra el SHA y la imagen desplegada de cada aplicación. Si falla la verificación, restaura las imágenes de la última release sana en las aplicaciones afectadas y repite las comprobaciones. Si hubo migraciones, verifica antes la compatibilidad de esa versión con la base de datos.

| Componente | Configuración |
| --- | --- |
| API y panel | [fly.toml](../../fly.toml) |
| Worker | [fly.worker.toml](../../fly.worker.toml) |
| Servicio de navegador, gestionado por separado | [fly.browser.toml](../../fly.browser.toml) |

Consulta las [notas de operación](PRODUCCION.md) para incidentes y el [alta de clientes](DEPLOY-CLIENTE.md) para el aprovisionamiento posterior.

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
- En Fly con varias máquinas, el rate limiter en memoria actúa por máquina.
- Logs con `LOG_LEVEL` y `LOG_SAMPLE_RATE` configurables.
- No presentar métricas como medidas reales solo porque el endpoint responda.
