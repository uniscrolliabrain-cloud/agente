# 19 — Backups / restore

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump backup.ts, backup-tenant.ts, scripts/*, código real

## Ontología

runBackup, runTenantBackup, retentionDays, manifest, backup por tenant, restore probado.

## Estado real

runBackup por deployment, runTenantBackup por tenant. Retención por días. restore.ts probado. Backups en dataDir/backups/<stamp>/ con manifest. Scheduler en index.ts.

## Evidencia

El script restore.ts funciona. Sin test del ciclo completo. Sin checksum. Sin alerta si >48h sin backup.

## Huecos declarados

- Backups incrementales.
- Verificación automática.
- Alerta si >48h.
- Backup remoto.
- Checksum.

## Huecos profundos (auditoría extendida)

1. **`runBackup` copia PGlite entero**: si la DB tiene 5 GB, cada backup ocupa 5 GB. Sin incremental.
2. **`runBackup` sin compresión**: 5 GB sin gzip son 5 GB en disco. Con gzip, 1 GB.
3. **Sin cifrado del backup**: si alguien accede al directorio, lee todo.
4. **Sin verificación post-backup**: no se verifica que el backup sea restaurable.
5. **`pruneOld` sin dry-run**: borra sin avisar.
6. **Sin "backup por tipo"**: todo o nada. No se puede respaldar solo `files/`.
7. **`runTenantRestore` sin validación de tenant**: restaura si el path existe. Sin verificar que el tenant sea correcto.
8. **Sin "restore parcial"**: no se puede restaurar solo un archivo.
9. **Sin "restore a punto en el tiempo"**: solo restore completo.
10. **Sin "backup off-site"**: todo en el mismo disco. Si el disco muere, todo muere.
11. **Sin "backup verificable"**: sin checksum, no se sabe si el backup está corrupto.
12. **Sin "notificación de backup fallido"**: si el scheduler falla, nadie se entera.
13. **Sin "backup retention policy"**: retentionDays hardcoded a 7. Configurable por env pero sin defaults sensatos.
14. **Sin "backup metrics"**: no hay `backup_size_bytes` ni `backup_last_success_timestamp`.
15. **Sin "backup pre-migration"**: antes de un migrate, no se hace backup automático.
16. **Sin "restore drill"**: no se prueba restaurar en staging.
17. **Sin "backup multi-región"**: no se copia a otra región.
18. **Sin "backup encriptado con KMS"**: el cifrado sería con la misma key del deployment.
19. **Sin "backup incremental"**: cada backup copia todo. Con PGlite, eso es lento.
20. **Sin "backup con WAL"**: PGlite no soporta WAL streaming. Con Postgres sí.

## Interrelación

Red de seguridad. Depende de 05, 18.

## Riesgos

Backup ocupa el disco. Backup corrupto descubierto al restaurar. Nadie verifica el restore.

## Tipo de fixes

restore.test.ts del ciclo completo. Checksum del backup. Notificación si falla. Backup a S3 opcional. Compresión. Cifrado. Off-site. Métricas. Drill trimestral.
