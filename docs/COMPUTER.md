# Computer sandbox

The computer is a single-owner Docker Linux container managed by the API. It is optional
and disabled by default (`COMPUTER_ENABLED=false`). When enabled, the API creates a
container from `COMPUTER_IMAGE` (default `openmuse-computer:local`) with:

- UID/GID 1000, read-only root filesystem
- All capabilities dropped, no-new-privileges
- `--network none`, `--ipc private`, `--pids-limit 128`, 512 MB RAM, 1 CPU
- A single named volume mounted at `/workspace`
- No host mounts, no Docker socket, no API keys, no Google tokens

Commands are limited to 30 seconds, output is capped at 128 KB, and files are limited
to 256 KB for text and 10 MB for PDFs. File operations go through `files.py` inside the
container and reject symlinks.

The server launches only the fixed Docker CLI with argument arrays; user commands are
passed to `/bin/bash` inside the container. There is no fallback to a host shell.

Build the image before enabling:

```
docker build -t openmuse-computer:local apps/computer
```

Set `COMPUTER_ENABLED=true` and restart the API.