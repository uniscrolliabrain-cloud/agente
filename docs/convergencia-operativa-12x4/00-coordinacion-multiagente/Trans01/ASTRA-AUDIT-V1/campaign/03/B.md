# 03B. Versionar la identidad de operación

Fase 03 · Proveedores e identidad. Correspondencia con A02, A03, C01 de la especificación original.

Definir una clave estable por operación lógica con tenant, task o instancia de SOP, paso e invocación. Mantener los reintentos bajo esa clave y distinguir la revisión autorizada por digest. Resolver generación justo antes de despacho. Diseñar detección explícita del claim legacy al activar la nueva clave.

**Criterio de salida.** Dos tareas autorizadas independientes llegan a dos intentos diferentes. Un replay de una tarea conserva el mismo intento.

**Superficies de partida.** [Fuente, blob 6c3778ed6520](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/execution/capability-runner.ts) · [Prueba de referencia, blob 972cf5d3cc45](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-approval-binding.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/03-proveedores/PATCHSETS.md)

[Índice de la campaña](../README.md)
