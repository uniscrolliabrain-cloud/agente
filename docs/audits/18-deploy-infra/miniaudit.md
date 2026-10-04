# 18 — Deploy / infra

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump Dockerfile, fly.toml, infra/compose.yaml, scripts/*

## Ontología

Dockerfile multi-stage, fly.toml, docker-compose, DATA_DIR, volumen
persistente, HEALTH, provision-client, dev.ps1.

## Estado real

Dockerfile multi-stage (build + runtime). fly.toml con mount persistente
/data. dev.ps1 para desarrollo local. scripts/provision-client.ts.
infra/compose.yaml para browser worker.

## Evidencia

El Dockerfile compila. fly.toml tiene healthcheck /api/health. El
provision-client.ts existe pero requiere admin ya creado. No hay
docker-compose.yml completo para API + worker + browser + computer + DB.

## Huecos

docker-compose.yml completo con healthchecks. Scripts de backup automático
en el host. Runbook de incidentes. Health checks por servicio.

## Interrelación

Medio. Todo corre sobre esto. Depende de 19 (backups).

## Riesgos

Deploy rompe el motor durable (leases activos con la DB caída). Volumen
se llena. Cliente no sabe reiniciar tras un incidente.

## Tipo de fixes

docker-compose.yml con todos los servicios y healthchecks. Runbook.md en
docs/operacion/. Backup automático documentado. Script deploy-client.sh
con pasos numerados.
