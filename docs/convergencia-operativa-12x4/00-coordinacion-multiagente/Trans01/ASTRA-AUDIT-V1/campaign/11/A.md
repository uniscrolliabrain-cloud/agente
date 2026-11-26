# 11A. Localizar escrituras por paso

Fase 11 · Recompilación y SOP. Correspondencia con D01, S01 de la especificación original.

Inventariar cada case de runStep e identificar las operaciones que leen, crean borradores, escriben artefactos o cambian estado. Seguir transition_entity desde lectura del estado hasta apply y updateEntity. Registrar versión del SOP usada por execute y walk.

**Criterio de salida.** El mapa incluye los efectos que pasan directamente por servicios del kernel y sus precondiciones.

**Superficies de partida.** [Fuente, blob 1243cab4a380](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/sop-executor.ts) · [Prueba de referencia, blob 2b7ea21e2be3](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-sop-authz.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/11-recompilacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
