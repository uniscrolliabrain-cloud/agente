# 03A. Reconstruir la identidad del efecto

Fase 03 · Proveedores e identidad. Correspondencia con A02, A03, C01 de la especificación original.

Seguir la construcción de ExecutionContext desde el montaje de CapabilityRunner. Comparar tenant, principal autenticado, task, step, operación, revisión, credencial y generación con la clave calculada por makeIdempotencyKey. Incluir dos tareas con igual step e inputs.

**Criterio de salida.** Una tabla por campo distingue identidad de negocio, identidad del intento y observabilidad.

**Superficies de partida.** [Fuente, blob 6c3778ed6520](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/execution/capability-runner.ts) · [Prueba de referencia, blob 972cf5d3cc45](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-approval-binding.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/03-proveedores/PATCHSETS.md)

[Índice de la campaña](../README.md)
