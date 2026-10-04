# Roadmap — 20 computer sandbox

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Sandbox Linux aislado, sin fugas.

## 2. Estado verificado
- Docker sin red, 512MB, 1 CPU, 128 pids.
- --cap-drop ALL, no-new-privileges, --read-only, tmpfs 64MB.
- /workspace persistente. files.py rechaza symlinks.
- Fuente: repodump computer.ts, apps/computer/*.

## 3. Huecos contra producción
- Cuota de disco por volumen.
- Rotación de contenedores huérfanos.
- Telemetría de uso.
- Soporte para más lenguajes.

## 4. Objetivo
Sandbox con cuotas de disco y telemetría.

## 5. Fronteras
- No GUI.

## 6. Conexiones
- Depende de: 06, 17.
- Archivos compartidos: computer.ts, apps/computer/*.

## 7. Principios del PRODUCT.md
SOPs con aprobaciones.

## 8. Cómo se verifica el cierre
- Test que verifica límite de disco.
- Sweeper de contenedores con lease expirado.
