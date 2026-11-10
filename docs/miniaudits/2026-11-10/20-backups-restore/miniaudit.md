# Bloque 20 · Backups y restore

> Campaña UX · 2026-11-10 · **13 hallazgos** (S0 0 · S1 6 · S2 5 · S3 2)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | `runBackup` copia `DATA_DIR/files`, pero los ficheros viven en `DATA_DIR/tenants/<id>/files`: el backup puede no contener ni un documento. | Sin verificar |
| 2 | S1 | Tampoco copia `clientes/`: personas y ontología quedan fuera. | Sin verificar |
| 3 | S1 | Con base externa el backup no lleva la base y aun así registra éxito con un `logWarn`. | Sin verificar |
| 4 | S1 | Los backups se guardan en el mismo volumen que el dato. | Sin verificar |
| 5 | S1 | Incluye `session-signing-key` en claro: quien lea el backup firma sesiones y URLs. | Sin verificar |
| 6 | S1 | La copia de PGlite es un `cp` en caliente, sin checkpoint ni `pg_dump`. | Sin verificar |
| 7 | S2 | El scheduler sólo llama a `runBackup`; `backupAllTenants` existe y no se invoca. | Sin verificar |
| 8 | S2 | No existe restore del backup global, sólo `runTenantRestore`. | Sin verificar |
| 9 | S2 | El restore de tenant duplica el árbol en `.before-restore-<ts>` y no lo limpia. | Sin verificar |
| 10 | S2 | La retención se decide con el reloj y el manifiesto; `0` desactiva la purga sin aviso. | Sin verificar |
| 11 | S2 | El backup de tenant copia perfiles de Chromium completos, sin compresión ni dedupe. | Sin verificar |
| 12 | S3 | Un Postgres en `localhost` se clasifica como PGlite y el backup sale sin base. | Sin verificar |
| 13 | S3 | El manifiesto no lleva checksums ni lista de ficheros; no hay prueba de restore. | Sin verificar |

## Arreglos propuestos

1. **Copiar lo que existe**: `DATA_DIR/tenants/<id>/files` y `clientes/`, no `DATA_DIR/files`. Un backup que omite documentos no es un backup.
2. **Base incluida o fallo explícito**: con Postgres externo, `pg_dump` o el backup se declara incompleto; nunca éxito con `logWarn`.
3. **Fuera del volumen de datos** y **sin la signing key**: la clave va en el gestor de secretos, no en el `.tar`.
4. **PGlite con checkpoint** antes de copiar, no `cp` en caliente.
5. **Prueba de restore en CI**: checksums + lista de ficheros en el manifiesto y un restore de verdad sobre un directorio temporal.

## Plan

- **P1 (contenido)**: rutas correctas, signing key fuera, base incluida o incompleto declarado.
- **P2 (ubicación y retención)**: destino separado, `0` con aviso, limpieza de `.before-restore`.
- **P3 (verificación)**: manifiesto con checksums y job de restore periódico.

---

## Revisión de destino

Un backup que no contiene los documentos ni la base no es un backup, y "30 días sin intervención" se apoya en él:

- Copiar `DATA_DIR/tenants/<id>/files` y `clientes/`.
- Base incluida (`pg_dump`) o backup declarado incompleto.
- Fuera del volumen de datos y sin `session-signing-key`.
- Prueba de restore en CI con checksums.

## Conclusión

Es el bloque donde el fallo es silencioso y total: se descubre el día que hace falta restaurar. **P0** antes de cualquier cliente real.
