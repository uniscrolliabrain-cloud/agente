# Trans01 · Un envío termina con dos resultados durables

El runtime debe permitir reconstruir qué ocurrió con una operación autorizada. En ActionService, el proceso que recibe la confirmación y el que reconcilia intentos pendientes escriben el resultado por caminos distintos.

**Evidencia.** Con una única llamada al adaptador simulado, la acción acabó en `succeeded` mientras su intención de despacho quedó en `reconciled` con `actionStatus=outcome_unknown`. Ocurrió tanto al confirmar antes del CAS del barrido como al confirmar después. Sin barrido, ambos registros coincidieron. Resultado reproducido en PGlite y PostgreSQL 17.12.

**Impacto.** Dos lectores pueden informar resultados distintos sobre el mismo despacho. El experimento acredita la divergencia de datos con un proveedor simulado.

[Código examinado](https://github.com/uniscrolliabrain-cloud/agente/blob/97f5671cd06793c2c907fb027f31461decf379c2/apps/server/src/actions.ts#L926) · [Evidencia del ensayo](https://github.com/uniscrolliabrain-cloud/agente/blob/c1e2f365d8c54d2603f404af58ae6dfae16cb109/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/ASTRA-AUDIT-V1/EXPERIMENTO-RECONCILIACION.md)

## El mantenimiento marca como interrumpidas acciones que siguen en curso

Aprobé una acción con un proveedor simulado y lo mantuve a la espera de respuesta. En ese mismo proceso, al invocar la recuperación que llama `maintain()` cada minuto, el estado pasó de `executing` a `outcome_unknown`. Al liberar el proveedor, pasó a `succeeded`. Durante ese intervalo, quien consulta la acción recibe un aviso de reinicio aunque el proceso y la llamada continúan activos. El barrido se ejecuta antes del filtro de antigüedad.

[Mantenimiento](https://github.com/uniscrolliabrain-cloud/agente/blob/4b0e9b9ce7750a4a22863c8bbe8affb5cf3da033/apps/server/src/engine/service.ts#L479) · [Actualización de estado](https://github.com/uniscrolliabrain-cloud/agente/blob/4b0e9b9ce7750a4a22863c8bbe8affb5cf3da033/apps/server/src/db.ts#L413)

## La recuperación del proveedor admite varias llamadas de prueba

Con el circuito abierto adelanté el reloj hasta el fin de la espera y lancé tres llamadas antes de resolver la primera. Las tres alcanzaron el proveedor simulado mientras el estado seguía en `half-open`. El proveedor recién recuperado recibe toda esa concurrencia en la fase prevista para un solo intento. [circuit-breaker.ts, línea 57](https://github.com/uniscrolliabrain-cloud/agente/blob/f72d66c6148245767535c220445abe5ce4319b07/apps/server/src/engine/circuit-breaker.ts#L57)

## Una entrada inválida puede abrir el circuito del proveedor

Con umbral de un fallo, `recordFailure` dejó cerrado el circuito ante un error HTTP 422. Con el mismo error, `call` lo abrió. Una petición rechazada por sus datos puede así cortar el paso a la siguiente petición válida, según la interfaz empleada. [circuit-breaker.ts, línea 66](https://github.com/uniscrolliabrain-cloud/agente/blob/f72d66c6148245767535c220445abe5ce4319b07/apps/server/src/engine/circuit-breaker.ts#L66) · [circuit-breaker.ts, línea 102](https://github.com/uniscrolliabrain-cloud/agente/blob/f72d66c6148245767535c220445abe5ce4319b07/apps/server/src/engine/circuit-breaker.ts#L102)
