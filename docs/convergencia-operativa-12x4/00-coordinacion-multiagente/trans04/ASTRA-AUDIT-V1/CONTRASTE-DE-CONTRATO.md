# Integridad del informe de certificación

Revisión de partida `731604c865cb6193047ad6bd10bba204ca35f47d`. Superficie auditada `scripts/gate-cognition-v2.ts`, blob `d8b9240028f7080600a8bed7c87641f775a8d18b`. Símbolos examinados: Consumidor C15 y productor allSteps de gate-report. [Especificación original](../REDISENO-PASADA-05-EJECUCION-CONSOLIDADA.md)

## Propuesta original y código actual

P12 propone validar todos los pasos de allSteps. El consumidor actual acepta un HEAD no vacío y un array que contenga un paso test. repositoryGateOk usa every(step.ok). El documento mantiene NOT_CERTIFIED y NO_GO.

## Diagnóstico

La conclusión sobre el gate del repositorio tiene menor fuerza que el manifiesto que pretende resumir. Una lista parcial puede dar repositoryGateOk=true aunque la decisión final siga siendo NO_GO. Un log presente tampoco prueba que el runner ejecutó los targets exigidos.

## Decisión propuesta

MEJORAR P12. Resolver una vez el manifiesto esperado desde la revisión examinada. Asociar a cada registro el id de ejecución, SHA, comando, cwd, resultado estructurado, digest de log y conteos ejecutados. El consumidor rechaza faltantes, duplicados o entradas atribuidas a otro run. Separar la integridad del reporte de la conclusión técnica.

## Contrato e invariantes

Estados separados para no ejecutado, abortado, fallido y aprobado. La certificación Postgres requiere rol restringido, versión de servidor y operaciones desde dos sesiones. Un resultado PGlite solo habilita el nivel local.

## Prueba discriminante pendiente

Generar una evidencia sintética con solo test y exit 0. Esperar informe incompleto. Reutilizar un log de otra ejecución y verificar rechazo. Mantener un caso de suite íntegra con skips permitidos y política de exclusión explícita. Contrastar el resultado con los contadores del runner.

## Compatibilidad y rollback

Emitir manifest v2 junto a v1 durante una ventana de migración. Los consumidores antiguos deben conservar su NO_GO. Archivar informes con el lector que les corresponde.
