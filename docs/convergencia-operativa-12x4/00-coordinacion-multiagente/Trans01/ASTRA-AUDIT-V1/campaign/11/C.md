# 11C. Validar transición y proyección

Fase 11 · Recompilación y SOP. Correspondencia con D01, S01 de la especificación original.

Ejecutar dos transiciones concurrentes desde el mismo estado. Verificar en conjunto historial, estado de entidad y recibo. Acordar con el dueño del grafo cómo vincularlos al commit o recuperar la proyección.

**Criterio de salida.** Una sola transición gana el estado esperado. El historial permite explicar cada resultado y el replay no repite el efecto.

**Superficies de partida.** [Fuente, blob 1243cab4a380](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/sop-executor.ts) · [Prueba de referencia, blob 2b7ea21e2be3](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-sop-authz.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/11-recompilacion/PATCHSETS.md)

[Índice de la campaña](../README.md)
