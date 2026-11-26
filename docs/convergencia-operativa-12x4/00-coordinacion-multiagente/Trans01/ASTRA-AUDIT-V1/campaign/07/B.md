# 07B. Vincular apply a revisión aprobada

Fase 07 · Owner y provisionamiento. Correspondencia con O01 de la especificación original.

Especificar la comparación del digest aprobado con el manifiesto que apply obtiene justo antes de reservar. Mantener la reserva y el journal preexistentes. Detener cambios de contenido bajo la misma operación lógica.

**Criterio de salida.** Dos ejecuciones concurrentes sobre el mismo plan comparten un resultado durable o devuelven conflicto inequívoco.

**Superficies de partida.** [Fuente, blob 3ae48b168b14](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/scripts/provision-vertical-slice.ts) · [Prueba de referencia, blob ab43063b1eda](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/vertical-slice-provision.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/07-owner-real/PATCHSETS.md)

[Índice de la campaña](../README.md)
