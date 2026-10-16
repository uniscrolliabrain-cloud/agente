# Roadmap — 18 deploy e infra

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Desplegar a un cliente en menos de 1h. Un deployment por cliente.

## 2. Estado verificado
- Dockerfile multi-stage.
- fly.toml con mount /data.
- scripts/provision-client.ts.
- Fuente: repodump Dockerfile, fly.toml, infra/compose.yaml.

## 3. Huecos contra producción
- docker-compose.yml completo.
- Scripts de backup automático en host.
- Runbook de incidentes.
- Health checks por servicio.

## 4. Objetivo
Un cliente nuevo en 1h siguiendo un runbook.

## 5. Fronteras
- No k8s.

## 6. Conexiones
- Depende de: 19.
- Archivos compartidos: Dockerfile, fly.toml, compose.yaml, scripts/*.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- Deploy manual completo cronometrado <1h.
- docker-compose.yml con 5 servicios y healthchecks.
- Runbook.md en docs/operacion/.
