# 20 — Computer sandbox

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/server/src/computer.ts, apps/computer/*, COMPUTER.md

## Ontología

ComputerService, ComputerCommand, DockerRunner, runDocker, aislamiento
(readonly, cap-drop ALL, no-new-privileges, network none, 512MB, 1 CPU,
128 pids, tmpfs 64MB), files.py, /workspace persistente.

## Estado real

Docker sin red. 512MB RAM. 1 CPU. 128 pids. --cap-drop ALL.
no-new-privileges. --read-only. tmpfs 64MB. /workspace persistente con
volumen nombrado. Timeout 30s. Output 128KB. files.py con rechazo de
symlinks.

## Evidencia

Los 12 tests de computer.test.ts pasan. Cubren: aislamiento, timeouts,
interrupción, Stop, quarantine tras Stop fallido, recuperación de lease
expirado, inyección de argv, paths que no escapan.

## Huecos

Cuotas de disco por volumen. Rotación de contenedores huérfanos (lease
expirado sin stop). Telemetría de uso. Soporte para más lenguajes.

## Interrelación

Sandbox externo de SOPs con skills. Depende de 06 (aprobaciones), 17.

## Riesgos

Un comando llena el disco del host. Contenedor huérfano bloquea a otro.
Fallo de Docker deja la tarea inconsistente.

## Tipo de fixes

Cuota de disco real. Sweeper que mate contenedores con lease expirado.
Métricas de uso por contenedor.
