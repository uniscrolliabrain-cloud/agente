# OpenMuse - Deploy

> Como desplegar el backend en produccion. Frontend en Cloudflare Pages (pendiente).
> Ultima actualizacion: 28 sep 2026.

## 1. Requisitos

- Cuenta en Render o Fly.io (elige uno).
- Cuenta en Cloudflare Pages (para el frontend, pendiente).
- Dominio propio (por ejemplo `tu-dominio.com`).
- Claves de modelo: `GEMINI_API_KEY` (obligatoria) y `OPENROUTER_API_KEY` (fallback opcional).
- Google OAuth configurado si vas a usar Gmail, Calendar o Drive.

## 2. Backend

### 2.1 Render

1. Conecta el repo a Render como "Blueprint".
2. Render leera `render.yaml` y creara el servicio `openmuse-api` en plan starter.
3. Rellena las variables marcadas con `sync: false` en el panel de Render:
   - `PUBLIC_API_URL` = `https://api.tu-dominio.com`
   - `DATABASE_URL` = cadena de Postgres gestionado
   - `TOKEN_ENCRYPTION_KEY` = 32 bytes en base64
   - `GEMINI_API_KEY`
   - `OPENROUTER_API_KEY` (opcional)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (si aplica)
   - `WORKER_TOKEN` = minimo 32 caracteres
   - `BROWSER_WORKER_URL`
   - `ALLOWED_ORIGINS` = `https://tu-dominio.com`
4. `ADMIN_EMAIL` y `ADMIN_PASSWORD` (anadelos manualmente, no estan en render.yaml).
5. Anade un disco persistente en `/data` de al menos 5 GB.
6. Deploy. Render hara build del `Dockerfile` y arrancara el servicio.

### 2.2 Fly.io

1. Instala flyctl y autenticate: `fly auth login`.
2. `fly launch --no-deploy --copy-config` en la raiz del repo (usa `fly.toml`).
3. Crea el disco: `fly volumes create openmuse_data --size 5 --region mad`.
4. Rellena los secretos:

       fly secrets set \
         OPENMUSE_ACCESS_KEY="..." \
         TOKEN_ENCRYPTION_KEY="..." \
         ADMIN_EMAIL="admin@tu-dominio.com" \
         ADMIN_PASSWORD="..." \
         GEMINI_API_KEY="..." \
         GOOGLE_CLIENT_ID="..." \
         GOOGLE_CLIENT_SECRET="..." \
         WORKER_TOKEN="..." \
         PUBLIC_API_URL="https://api.tu-dominio.com" \
         DATABASE_URL="postgres://..." \
         ALLOWED_ORIGINS="https://tu-dominio.com"

5. `fly deploy`.

## 3. Browser worker

El worker de Playwright corre aparte. Build y push de su imagen:

    docker build -t openmuse-browser-worker:latest apps/worker

En produccion, ejecutalo como segundo servicio (Render, Fly o contenedor propio). Apunta `BROWSER_WORKER_URL` a su hostname interno y usa el mismo `WORKER_TOKEN`.

## 4. Computer (opcional)

El computer Docker solo es util si vas a ejecutar SOPs con skill Python. Requiere que el host tenga Docker CLI accesible. En Render y Fly **no funciona** (no hay Docker socket). Para produccion con computer, usa un VPS propio (Hetzner, DigitalOcean) con Docker.

    docker build -t openmuse-computer:local apps/computer

Activa `COMPUTER_ENABLED=true` y arranca el API con acceso al socket de Docker.

## 5. Primer login

Si no existe ningun usuario, el API crea el admin con `ADMIN_EMAIL` / `ADMIN_PASSWORD` al arrancar. Entra con esas credenciales.

Si no ves el admin creado, mira los logs: el servidor avisa cuando no hay usuarios y faltan `ADMIN_*`.

## 6. Backups

El scheduler automatico esta activo si `BACKUP_INTERVAL_HOURS > 0` (por defecto 24h). Los backups se escriben en `backups/` dentro de `DATA_DIR`. La retencion borra los mas antiguos de `BACKUP_RETENTION_DAYS` dias.

Manual:

    pnpm exec tsx scripts/backup.ts --out /ruta/externa

## 7. Dominio y HTTPS

- Render: anade el dominio en el panel, configura los DNS en tu registrador.
- Fly: `fly certs add api.tu-dominio.com` y sigue las instrucciones.
- `PUBLIC_API_URL` y `ALLOWED_ORIGINS` deben usar el dominio final, no la URL temporal.

## 8. Comprobaciones post-deploy

1. `GET https://api.tu-dominio.com/api/health` devuelve `{ok: true}`.
2. Login funciona con el admin creado.
3. El chat responde (si `AGENT_BACKEND=model` y hay `GEMINI_API_KEY`).
4. En modo live, no aparece el banner "Sesion caducada".
5. Los logs no muestran errores de Postgres ni de Google.

## 9. Pendiente

- Frontend en Cloudflare Pages (build `apps/web`, variable `VITE_API_URL`).
- Configuracion del browser worker como servicio gestionado.
- Monitorizacion y alertas.
