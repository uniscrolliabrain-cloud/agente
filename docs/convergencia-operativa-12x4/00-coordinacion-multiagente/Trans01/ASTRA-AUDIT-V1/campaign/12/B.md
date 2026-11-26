# 12B. Ejercitar el orden de commit

Fase 12 · Certificación y devolución. Correspondencia con G01, B6 de la especificación original.

Ejecutar las pruebas de replay en PostgreSQL con dos conexiones concurrentes y las de conciliación con barreras controladas. Guardar estado inicial, orden impuesto, llamadas al proveedor simulado y las filas finales.

**Criterio de salida.** Un caso negativo distingue pérdida de causalidad de una diferencia legítima de reloj.

**Superficies de partida.** [Fuente, blob 2c85a553d61b](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/scripts/gate-report.ts) · [Prueba de referencia, blob d1cb211da6b0](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-replay-concurrency.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/12-validacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
