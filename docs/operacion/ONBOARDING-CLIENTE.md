# Onboarding de cliente — pasos exactos

> Uso interno. Se ejecuta cliente a cliente. No va al cliente.
> Verdad: este fichero + TODO-FOR-PROD.md + repo actualizado.

## 0. Prerrequisitos del deployment

Un deployment por cliente. Nunca multitenancy.

- DNS apuntando al host (Render, Fly, Hetzner, etc.).
- HTTPS configurado.
- `.env` en el host con:
  - `WORKSPACE_MODE=live`
  - `AGENT_BACKEND=model`
  - `HOST=0.0.0.0`
  - `PUBLIC_API_URL=https://api.<cliente>.com`
  - `OPENMUSE_ACCESS_KEY` (24+ chars)
  - `TOKEN_ENCRYPTION_KEY` (32-byte base64)
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
  - `GEMINI_API_KEY` (o el provider elegido)
  - `DATABASE_URL` (Postgres gestionado)
  - `ALLOWED_ORIGINS=https://<cliente>.com`
  - `BACKUP_INTERVAL_HOURS=24`, `BACKUP_RETENTION_DAYS=7`
- Browser worker desplegado (si el cliente lo usa): `WORKER_TOKEN` (32+ chars), `BROWSER_WORKER_URL`.
- Computer Docker desplegado (si el cliente usa skills Python): `COMPUTER_ENABLED=true`, `COMPUTER_IMAGE`, `COMPUTER_DEPLOYMENT_ID`.

## 1. Preparar el cliente en el repo

    cp -r clientes/_example clientes/<nombre>

Editar:

- `config.json` → nombre real, admin real, password real.
- `users.json` → cuentas reales del cliente (direccion, ventas, administracion, atencion, marketing, operaciones).
- `memorias.json` → tono, condiciones comerciales, politicas internas, procedimientos base.
- `agentes.json` → roles que el cliente va a usar. Quitar los que no apliquen.
- `sops/` → un .json por SOP. Quitar los que no apliquen al cliente.
- `skills/` → un subdirectorio por skill (main.py + SKILL.md + requirements.txt si hace falta).
- `docs/` → documentos reales del cliente (catalogo, tarifas, politicas, plantillas). Solo texto plano para RAG inicial: `.txt`, `.md`, `.csv`, `.json`. PDFs y Office se suben por la app.

Commit del cliente si se quiere versionar:

    git add clientes/<nombre>
    git commit -m "cliente: <nombre> inicial"

## 2. Arrancar el servidor del cliente

Deploy del backend con el `.env` de arriba. La primera vez, al arrancar,
el servidor crea el admin con `ADMIN_EMAIL`/`ADMIN_PASSWORD` si la DB esta vacia.

Alternativa manual si se prefiere control:

    pnpm admin:create

## 3. Provisionar

Desde la raiz del repo, apuntando al API del cliente:

    $env:OPENMUSE_URL = "https://api.<cliente>.com"
    pnpm provision-client clientes/<nombre>

Esto hace, por orden:

1. Login del admin.
2. Carga los SOPs de `sops/`.
3. Copia las skills a `apps/computer/workspace-template/skills/` y avisa del rebuild del Docker del computer.
4. Crea los usuarios de `users.json`.
5. Crea las memorias de `memorias.json`.
6. Crea los agentes de `agentes.json`.
7. Indexa los documentos de `docs/` en el RAG.

Si hace falta solo una parte:

    pnpm seed-agents clientes/<nombre>

## 4. Verificar en la app

Login con el admin. Comprobar:

- Chat responde.
- Tareas se crean y se ejecutan.
- Documentos aparecen en la vista Documentos.
- Memorias aparecen en "Lo que sabe de tu negocio".
- Aprobaciones funcionan (probar un `prepare_email`).

## 5. Entregar al cliente

- Manual de usuario (documento externo, no vive en este repo).
- Credenciales del admin + 1 usuario por rol.
- Formacion inicial: chat, tareas, aprobaciones, procedimientos.

## 6. Operacion

- Backups automaticos ya corren (scheduler en `apps/server/src/index.ts`).
- Verificar backups semanalmente.
- Actualizaciones del repo: `git pull` + redeploy.
- Feedback del cliente → nuevo SOP o nueva memoria, nunca tocar codigo por un cliente concreto.

## 7. Lo que NO se hace

- No se toca `app.ts`, `auth-routes.ts` ni el engine por un cliente.
- No se mete el manual comercial en el repo.
- No se abre un segundo deployment para el mismo cliente.
- No se comparte `ADMIN_PASSWORD` entre clientes.
