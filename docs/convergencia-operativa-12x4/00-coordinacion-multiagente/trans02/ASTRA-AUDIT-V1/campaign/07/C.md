# 07C. Ejercitar el ámbito en la transacción

Fase 07 · Identidad y multitenencia. Correspondencia con P10 de la especificación original.

Ejecutar las suites con dos tenants y el mismo id local. Comprobar lectura legítima, lectura cruzada, escritura rechazada y devolución de la conexión al pool. A nivel HTTP añadir dos actores de la misma empresa con permisos distintos.

**Criterio de salida.** El aislamiento por filas y el control de actor quedan acreditados mediante oráculos diferentes.

**Superficies de partida.** [Fuente, blob cde12970d1e7](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/rls.ts) · [Prueba de referencia, blob 3a22ec1c97f2](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-rls.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/07-owner-real/PATCHSETS.md)

[Índice de la campaña](../README.md)
