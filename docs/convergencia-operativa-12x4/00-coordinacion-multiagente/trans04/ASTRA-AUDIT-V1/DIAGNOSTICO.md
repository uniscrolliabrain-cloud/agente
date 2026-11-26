# Trans04 · El gate admite evidencia parcial como ejecución completa

La campaña canónica exige evidencia de los pasos ejecutados para acreditar la operación del núcleo. El lector de Cognition V2 admite un informe con un HEAD no vacío y al menos un paso llamado test.

**Evidencia.** Se suministró un informe sintético que contenía únicamente `test`, con `ok=true`, `exitCode=0` y `logFile=null`. El lector devolvió `repositoryGateOk=true`. El fixture omitía los demás pasos del gate.

**Impacto.** Un consumidor que mire ese indicador puede interpretar como completa una validación parcial. La decisión global permaneció en `NO_GO` y el proceso terminó con código 1.

[Código examinado](https://github.com/uniscrolliabrain-cloud/agente/blob/9e89d800a0c175761a37725cf312736234ca8cbc/scripts/gate-cognition-v2.ts#L11) · [Evidencia del ensayo](https://github.com/uniscrolliabrain-cloud/agente/blob/9e89d800a0c175761a37725cf312736234ca8cbc/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/trans04/ASTRA-AUDIT-V1/11-EVIDENCIA-Y-REAUDITORIA.md) · [Validación canónica](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/12-validacion/README.md)
