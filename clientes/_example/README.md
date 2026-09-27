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