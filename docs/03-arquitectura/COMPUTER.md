# Computer Sandbox

> v2 · 2026-10-27 · Estado: current

## Descripción

El computer es un contenedor Docker Linux de un solo owner gestionado por la API. Es opcional y está desactivado por defecto (`COMPUTER_ENABLED=false`).

## Configuración del contenedor

| Configuración | Valor |
|-------------|-------|
| UID/GID | 1000 |
| Filesystem raíz | Read-only |
| Capacidades | Todas dropeadas, `no-new-privileges` |
| Red | `--network none` |
| IPC | `--ipc private` |
| Límites de procesos | `--pids-limit 128` |
| RAM | 512 MB |
| CPU | 1 CPU |
| Volumen | Un volumen named montado en `/workspace` |
| Mounts de host | Ninguno |
| Socket de Docker | Ninguno |
| API keys | Ninguna |
| Tokens de Google | Ninguno |

## Comandos

- Límite: 30 segundos por comando.
- Output: máximo 128 KB.
- Ficheros de texto: máximo 256 KB.
- Ficheros PDF: máximo 10 MB.
- Operaciones de fichero: vía `files.py` dentro del contenedor, rechazan symlinks.
- El servidor lanza solo el CLI fijo de Docker con arrays de argumentos.
- Los comandos de usuario se pasan a `/bin/bash` dentro del contenedor.
- No hay fallback a un shell del host.

## Construcción y activación

```bash
docker build -t openmuse-computer:local apps/computer
COMPUTER_ENABLED=true
```

Luego reiniciar la API.

## Diferencia con el browser worker

El `apps/worker` (Playwright) es un servicio HTTP separado para navegación web. El computer es para comandos y skills dentro de un contenedor aislado. No son lo mismo.

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `COMPUTER_ENABLED` | `false` | Habilitar computer. |
| `COMPUTER_IMAGE` | `openmuse-computer:local` | Imagen Docker. |
| `COMPUTER_DEPLOYMENT_ID` | — | ID de despliegue. |
| `COMPUTER_COMMAND_MS` | `30000` | Timeout de comando. |
| `COMPUTER_CLIENT_MS` | `35000` | Timeout cliente. |
