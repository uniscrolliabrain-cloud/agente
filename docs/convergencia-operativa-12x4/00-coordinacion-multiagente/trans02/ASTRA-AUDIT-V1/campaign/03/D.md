# 03D. Cancelar antes y después del envío

Fase 03 · Inferencia y evaluación semántica. Correspondencia con P04, P06 de la especificación original.

Usar dos proveedores de prueba: uno obedece abort y otro mantiene el trabajo tras cancelar el cliente. Medir slots y operaciones del doble. Comparar aceptación, interrupción y confirmación de término antes de admitir otro trabajo.

**Criterio de salida.** El informe publica el máximo local y el máximo observado en el doble sin inferir garantías para proveedores reales.

**Superficies de partida.** [Fuente, blob a1d8f64543fb](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/apps/server/src/engine/cognition/v2/inference.ts) · [Prueba de referencia, blob 7fd81dc8eff0](https://github.com/uniscrolliabrain-cloud/agente/blob/20e5dd36929c8c6e56a4f95649c9cf9c5696f1aa/tests/cognition-v2-slow-lanes.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/03-proveedores/PATCHSETS.md)

[Índice de la campaña](../README.md)
