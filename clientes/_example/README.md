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

Los valores de este ejemplo son **placeholders, no credenciales**: sustituye
`adminPassword` por una clave real antes de provisionar nada.

    {
      "name": "Agencia Ejemplo",
      "adminEmail": "admin@ejemplo.local",
      "adminPassword": "CAMBIAR-ESTA-POR-UNA-CLAVE-REAL",
      "adminName": "Administrador"
    }

## Formato de users.json

Los `password` tambien son placeholders: el provisionador los sube tal cual a
`POST /api/auth/users` y no avisa si alguien se deja la clave de ejemplo puesta.

    [
      { "email": "maria@ejemplo.local", "name": "Maria", "role": "user", "password": "12345678" },
      { "email": "juan@ejemplo.local", "name": "Juan", "role": "user", "password": "12345678" }
    ]