# C06.P03a — dictamen independiente

Snapshot: `4f426ca79b6b865e064103b02ca3c28c3e321bec`. **BLOCKED para PASS de pruebas; NO-GO provisional para conectar C06.P03b sin los tests de carrera y autorización.** El puente implementa correctamente una frontera estrecha hacia SlowCognitionQueue y no realiza inferencia síncrona. No se ha ejecutado una suite local sobre el snapshot.

Hallazgos: **H01 ALTO (riesgo por verificar):** carrera entre `context.resolve` y `slow.enqueue`, que revalida autorización/evidencia pero no bajo una misma transacción/versión de política. **H02 MEDIO (confirmado):** clave de idempotencia omite prompt y policyRevision; SlowCognitionQueue compara el input completo y responde `IDEMPOTENCY_CONFLICT` en lugar de reutilizar contenido divergente. **H03 MEDIO (confirmado):** operaciónId permite IDs arbitrarios distintos para la misma evidencia; límites de gasto/frecuencia quedan para P03b. **H04 MEDIO (confirmado):** test nuevo utiliza `as any` y doubles que no simulan persistencia ni carreras. **H05 MEDIO (confirmado):** no hay prueba de que la identidad de la observación corresponda al actor/operación del receipt original; P03b debe imponer procedencia y ownership.

No penalizar por ausencia de suscriptor automático: P03b está fuera del alcance de P03a. No confundir hallazgos potenciales con exploits demostrados.
