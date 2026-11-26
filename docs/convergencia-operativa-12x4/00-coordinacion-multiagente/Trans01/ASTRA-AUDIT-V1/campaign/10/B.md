# 10B. Definir borrador contable

Fase 10 · Gestoría y alcance de autoridad. Correspondencia con X02 de la especificación original.

Especificar entrada de importe decimal con moneda, periodo y origen revisado. Si falta ABI autorizado para registrar un asiento, guardar únicamente propuesta gobernada. Evitar redondeo binario implícito en comparación o hash.

**Criterio de salida.** Los casos de fracciones y monedas distintas producen revisiones estables y claramente distinguibles.

**Superficies de partida.** [Fuente, blob 9722c4cabf6a](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/apps/server/src/engine/finance.ts) · [Prueba de referencia, blob 10bc2664d055](https://github.com/uniscrolliabrain-cloud/agente/blob/5440f9c7d8de92c2495c2cd7d09675dbafc837c2/tests/trans01-governed-runner.test.ts) · [Patchsets canónicos de la fase](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/10-gestoria/PATCHSETS.md)

[Índice de la campaña](../README.md)
