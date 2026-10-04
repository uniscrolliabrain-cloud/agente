# 18 — Deploy / infra

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump Dockerfile, fly.toml, infra/compose.yaml, scripts/*, código real

## Ontología

Dockerfile multi-stage, fly.toml, docker-compose, DATA_DIR, volumen persistente, HEALTH, provision-client, dev.ps1.

## Estado real

Dockerfile multi-stage. fly.toml con mount /data. dev.ps1. scripts/provision-client.ts. infra/compose.yaml para browser worker.

## Evidencia

Dockerfile compila. fly.toml con healthcheck /api/health. provision-client requiere admin ya creado. Sin docker-compose.yml completo.

## Huecos declarados

- docker-compose.yml completo.
- Backups automáticos en host.
- Runbook de incidentes.
- Health checks por servicio.

## Huecos profundos (auditoría extendida)

1. **`Dockerfile` con `NODE_ENV=production` en runtime pero tests en build**: los tests se ejecutan en la imagen final, ocupando espacio.
2. **Sin `.dockerignore` para `docs/`**: la doc se copia a la imagen. +50 MB.
3. **Sin stage separado para `dist`**: la imagen incluye node_modules con devDeps.
4. **Sin "distroless"**: imagen final con shell completo. Superficie de ataque.
5. **Sin "read-only filesystem"** en la imagen del API: si un atacante escribe, persiste.
6. **Sin "non-root user"**: el API corre como root por defecto.
7. **Sin `HEALTHCHECK` en el Dockerfile**: solo fly.io lo tiene.
8. **`fly.toml` sin `[deploy] release_command`**: las migraciones no se ejecutan antes de arrancar.
9. **Sin "graceful shutdown" en el Dockerfile**: SIGTERM no se propaga.
10. **Sin "resource limits" en el Dockerfile**: fly.io los aplica, pero Docker local no.
11. **Sin `docker-compose.yml` completo**: solo hay el del browser worker.
12. **Sin "migración automática de DB"**: `scripts/migrate-*` se ejecutan a mano.
13. **Sin "rollback automático"**: si el deploy falla, no hay rollback.
14. **Sin "blue-green deploy"**: cada deploy es in-place con downtime.
15. **Sin "staging environment"**: todo va a producción.
16. **Sin "CI/CD completo"**: solo hay `pnpm test`, no hay build + deploy.
17. **Sin "k8s / k3s manifests"**: solo Docker + fly.io.
18. **Sin "Helm chart"**: no hay forma de distribuir la app a otros.
19. **Sin "auto-scaling"**: fly.io `auto_stop_machines` pero sin reglas de scale-up.
20. **Sin "runbook"**: docs/operacion/RUNBOOK.md no existe.

## Interrelación

Medio. Depende de 19.

## Riesgos

Deploy rompe el motor. Volumen se llena. Cliente no sabe reiniciar.

## Tipo de fixes

docker-compose.yml con healthchecks. Runbook.md. Backup automático documentado. deploy-client.sh. Non-root user. Read-only fs. Migration release_command. Rollback automático.
