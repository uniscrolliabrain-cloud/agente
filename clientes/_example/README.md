# Cliente de ejemplo

Estructura para provisionar un cliente nuevo.

## Uso

    pnpm provision-client _example

## Contenido

- `config.json`: configuracion del cliente (nombre, admin inicial).
- `sops/`: ficheros .json de SOPs. Se POSTean a /api/sops.
- `skills/`: subdirectorios con SKILL.md + main.py. Se copian a apps/computer/workspace-template/skills/.
- `docs/`: documentos que se importan a la carpeta de files del cliente.
- `users.json`: lista de usuarios a crear (opcional, ademas del admin).

## Formato de config.json

    {
      "name": "Agencia Ejemplo",
      "adminEmail": "admin@ejemplo.local",
      "adminPassword": "cambiar-esta-clave-2026",
      "adminName": "Administrador"
    }

## Formato de users.json

    [
      { "email": "maria@ejemplo.local", "name": "Maria", "role": "user", "password": "12345678" },
      { "email": "juan@ejemplo.local", "name": "Juan", "role": "user", "password": "12345678" }
    ]

## Provision

Desde la raiz del repo, con el backend corriendo y `ADMIN_EMAIL`/`ADMIN_PASSWORD` en `.env`:

    pnpm provision-client clientes/_example

Esto crea usuario admin (si no existe), carga SOPs, registra skills, siembra memorias,
crea agentes y sube los documentos de `docs/` al RAG del owner.

## Estructura

- `config.json`   — nombre y admin inicial del cliente.
- `users.json`    — cuentas adicionales.
- `memorias.json` — conocimiento base (tono, condiciones, politicas).
- `agentes.json`  — roles de agente y SOPs asociados.
- `sops/`         — procedimientos del cliente (.json).
- `skills/`       — skills Python del cliente.
- `docs/`         — documentos a indexar en RAG.
