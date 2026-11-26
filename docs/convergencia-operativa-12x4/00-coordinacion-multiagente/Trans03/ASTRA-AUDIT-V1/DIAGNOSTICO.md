# Trans03 · Calendar pierde el resultado remoto cuando falla la caché local

La decisión de repetir una escritura externa depende de saber si el proveedor llegó a ejecutarla. WorkspaceService.execute espera a que Google confirme el borrado de un evento y después elimina la copia local. Un fallo en este segundo paso llega a ActionService como fallo de la operación entera.

**Evidencia.** En PGlite, con un doble local de Calendar, se aprobó un borrado con revisión fijada. El doble confirmó exactamente una llamada. Con caché disponible, la acción terminó en `succeeded`. Al fallar solo la eliminación local, terminó en `failed` y `retry` la devolvió a `awaiting_review`.

**Impacto.** El historial pierde la confirmación observada y vuelve a ofrecer para aprobación una operación ya ejecutada por el doble. El ensayo terminó al volver a revisión, antes de un segundo envío.

[Código examinado](https://github.com/uniscrolliabrain-cloud/agente/blob/fd032cdba91701d2f99cc4507df9056b46a805fb/apps/server/src/workspace.ts#L845)
