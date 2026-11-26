# 02B. Emitir después de la decisión durable

Fase 02 · Observación del kernel. Correspondencia con H01 de la especificación original.

Situar el hook de resultado después del CAS exitoso del intento. Si se pierde el fence medir el conflicto local. Registrar duración y categoría acotada. Revisar serialización de errores para evitar contenido de propuestas.

**Criterio de salida.** Un CAS perdido incrementa conflictos y deja intacto el contador de operaciones confirmadas.

**Superficies de partida.** [Fuente, blob 6c3778ed6520](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/execution/capability-runner.ts) · [Prueba de referencia, blob dbc1eb92e19e](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-telemetry-hooks.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/02-observabilidad/PATCHSETS.md)

[Índice de la campaña](../README.md)
