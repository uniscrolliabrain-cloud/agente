# 03D. Rotar la conexión entre decisión y efecto

Fase 03 · Proveedores e identidad. Correspondencia con A02, A03, C01 de la especificación original.

Intercalar cambio de generación, pérdida de membresía, timeout después de envío y caída antes de persistir. Guardar el estado y el número de llamadas para cada caso. Confirmar también el caso de lectura autorizada legacy.

**Criterio de salida.** Cada reintento conserva scope, binding y resultado anterior. Un intento ambiguo requiere conciliación documentada.

**Superficies de partida.** [Fuente, blob 6c3778ed6520](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/execution/capability-runner.ts) · [Prueba de referencia, blob 972cf5d3cc45](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-approval-binding.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/03-proveedores/PATCHSETS.md)

[Índice de la campaña](../README.md)
