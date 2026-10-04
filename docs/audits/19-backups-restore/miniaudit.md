# 19 — Backups / restore

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump backup.ts, backup-tenant.ts, scripts/backup.ts,
> scripts/restore.ts

## Ontología

runBackup, runTenantBackup, retentionDays, manifest, backup por tenant,
restore probado.

## Estado real

runBackup por deployment y runTenantBackup por tenant. Retención por días.
restore.ts probado. Backups en dataDir/backups/<stamp>/ con manifest.json.
Scheduler en index.ts con BACKUP_INTERVAL_HOURS.

## Evidencia

El script restore.ts funciona. No hay test que verifique el ciclo completo
backup → restore. No hay checksum. No hay alerta si >48h sin backup.

## Huecos

Backups incrementales. Verificación automática. Alerta si >48h sin backup.
Backup remoto (S3, B2). Checksum.

## Interrelación

Red de seguridad. Depende de 05 (motor durable), 18 (deploy).

## Riesgos

Backup ocupa todo el disco. Backup corrupto se descubre solo al restaurar.
Nadie verifica que el restore funciona.

## Tipo de fixes

restore.test.ts que verifica el ciclo completo. Checksum del backup al
crearlo y al restaurarlo. Notificación si un backup falla. Backup a S3
opcional.
