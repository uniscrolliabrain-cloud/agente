# Trans01 · Un envío termina con dos resultados durables

El runtime debe permitir reconstruir qué ocurrió con una operación autorizada. En ActionService, el proceso que recibe la confirmación y el que reconcilia intentos pendientes escriben el resultado por caminos distintos.

**Evidencia.** Con una única llamada al adaptador simulado, la acción acabó en `succeeded` mientras su intención de despacho quedó en `reconciled` con `actionStatus=outcome_unknown`. Ocurrió tanto al confirmar antes del CAS del barrido como al confirmar después. Sin barrido, ambos registros coincidieron. Resultado reproducido en PGlite y PostgreSQL 17.12.

**Impacto.** Dos lectores pueden informar resultados distintos sobre el mismo despacho. El experimento acredita la divergencia de datos con un proveedor simulado.

[Código examinado](https://github.com/uniscrolliabrain-cloud/agente/blob/97f5671cd06793c2c907fb027f31461decf379c2/apps/server/src/actions.ts#L926) · [Evidencia del ensayo](https://github.com/uniscrolliabrain-cloud/agente/blob/c1e2f365d8c54d2603f404af58ae6dfae16cb109/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/ASTRA-AUDIT-V1/EXPERIMENTO-RECONCILIACION.md)
