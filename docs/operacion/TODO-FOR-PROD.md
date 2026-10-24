# TODO-FOR-PROD — Checklist de produccion cliente a cliente

> Uso interno. No va al cliente. Cada empresa onboardeada recorre esta lista.
> Verdad: este fichero + HANDOFF.md + repo actualizado.

## Antes de onboardear

- [ ] Deployment dedicado (un cliente = un deployment, sin multitenancy).
- [ ] Dominio + HTTPS + `.env` con `ADMIN_*`, `OPENMUSE_ACCESS_KEY`, `TOKEN_ENCRYPTION_KEY`, `GEMINI_API_KEY`, `DATABASE_URL`.
- [ ] Backups automaticos activos (`BACKUP_INTERVAL_HOURS` > 0).
- [ ] Browser worker desplegado (si el cliente lo usa).
- [ ] Computer Docker desplegado (si el cliente usa skills Python).

## Alta del cliente

- [ ] `clientes/<nombre>/` copiado desde `clientes/_example/`.
- [ ] `config.json` con admin real.
- [ ] `sops/` revisado (que SOPs aplican a este cliente).
- [ ] `skills/` revisado (que skills aplican a este cliente).
- [ ] `memorias.json` con: tono, condiciones comerciales, politicas, procedimientos internos.
- [ ] `agentes.json` con los roles que el cliente va a usar.
- [ ] `users.json` con las cuentas reales (direccion, ventas, administracion, atencion, marketing, operaciones).
- [ ] `docs/` con los documentos iniciales a indexar en RAG (catalogo, tarifas, politicas, plantillas).

## Provision

- [ ] `pnpm admin:create` (si es instalacion nueva).
- [ ] `pnpm provision-client clientes/<nombre>`.
- [ ] Verificar en la app: SOPs cargados, skills registradas, memorias visibles, agentes disponibles, documentos en RAG.

## Post-provision

- [ ] Login del admin del cliente.
- [ ] Entregar el manual de usuario (documento externo, no vive en este repo).
- [ ] Formar al cliente en: chat, tareas, aprobaciones, procedimientos.
- [ ] Definir con el cliente sus 3 primeros SOPs personalizados.

## Operacion continua

- [ ] Backups verificados semanalmente.
- [ ] Actualizaciones del repo aplicadas con `git pull` + redeploy.
- [ ] Feedback del cliente registrado como SOP o memoria nueva.

## Lo que NO se hace en este repo

- Manual comercial del cliente (vive fuera, se entrega como PDF).
- Onboarding visual (el cliente no ve el repo).
- Multitenancy (un deployment por cliente).
