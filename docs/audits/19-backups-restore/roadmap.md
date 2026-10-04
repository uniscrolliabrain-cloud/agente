# Roadmap — 19 backups y restore

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Restaurar en <1h tras pérdida. Persistencia.

## 2. Estado verificado
- runBackup por deployment y por tenant.
- Retención por días. restore.ts probado.
- Fuente: repodump backup.ts, backup-tenant.ts.

## 3. Huecos contra producción
- Backups incrementales.
- Verificación automática del restore.
- Alerta si >48h sin backup.
- Backup remoto (S3, B2).
- Checksum.

## 4. Objetivo
Restaurar en <30 min verificado.

## 5. Fronteras
- No replica streaming.

## 6. Conexiones
- Depende de: 05, 18.
- Archivos compartidos: backup.ts, backup-tenant.ts.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- restore.test.ts del ciclo completo.
- Checksum del backup al crearlo y al restaurarlo.
- Notificación si un backup falla.
