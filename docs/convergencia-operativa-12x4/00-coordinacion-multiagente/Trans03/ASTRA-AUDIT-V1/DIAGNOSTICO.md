# Trans03 · Calendar pierde el resultado remoto cuando falla la caché local

La decisión de repetir una escritura externa depende de saber si el proveedor llegó a ejecutarla. WorkspaceService.execute espera a que Google confirme el borrado de un evento y después elimina la copia local. Un fallo en este segundo paso llega a ActionService como fallo de la operación entera.

**Evidencia.** En PGlite, con un doble local de Calendar, se aprobó un borrado con revisión fijada. El doble confirmó exactamente una llamada. Con caché disponible, la acción terminó en `succeeded`. Al fallar solo la eliminación local, terminó en `failed` y `retry` la devolvió a `awaiting_review`.

**Impacto.** El historial pierde la confirmación observada y vuelve a ofrecer para aprobación una operación ya ejecutada por el doble. El ensayo terminó al volver a revisión, antes de un segundo envío.

[Código examinado](https://github.com/uniscrolliabrain-cloud/agente/blob/fd032cdba91701d2f99cc4507df9056b46a805fb/apps/server/src/workspace.ts#L845)

## Google Places presenta una respuesta ilegible como búsqueda vacía

Probé `searchLeads` con tres respuestas HTTP 200 de un proveedor simulado. Un cuerpo JSON truncado (`{`) y una respuesta válida con `places: []` devolvieron la misma lista vacía. Una respuesta válida con un lugar devolvió un resultado. El adaptador convierte el error de lectura en `null` y el servicio de leads recibe cero coincidencias incluso cuando desconoce el resultado real de la búsqueda.

[Adaptador de Places](https://github.com/uniscrolliabrain-cloud/agente/blob/32f75479c5bed56e2debf2de4db70d27f6c23481/packages/integrations/src/google-maps.ts#L102) · [Consumidor](https://github.com/uniscrolliabrain-cloud/agente/blob/32f75479c5bed56e2debf2de4db70d27f6c23481/apps/server/src/engine/leads.ts#L293)

## El clasificador de bajas invierte dos mensajes habituales

`looksLikeOptOut` devolvió `false` para «No me escribas más» y `true` para «¿El precio baja en junio?». En el flujo de seguimiento, ese booleano decide si se registra una oposición persistente o una respuesta ordinaria. Ambos mensajes procedían de datos de prueba. [leads.ts, línea 272](https://github.com/uniscrolliabrain-cloud/agente/blob/b52581eb8a403f1e88304c7a0ebdc3fe9804848d/apps/server/src/engine/leads.ts#L272) · [leads.ts, línea 545](https://github.com/uniscrolliabrain-cloud/agente/blob/b52581eb8a403f1e88304c7a0ebdc3fe9804848d/apps/server/src/engine/leads.ts#L545)

## Un mensaje posterior puede ocultar una baja explícita del mismo hilo

Después de un seguimiento simulado, el contacto envió «Quiero darme de baja» a las 11:00 UTC y «Gracias» a las 12:00 UTC. Procesada sola, la primera respuesta activó la baja. Con las dos disponibles en la misma lectura, `detectFollowUpReply` seleccionó solo «Gracias» y la clasificación fue `false`. La decisión de oposición pierde así una petición inequívoca que ya está en el buzón. [leads.ts, línea 257](https://github.com/uniscrolliabrain-cloud/agente/blob/b52581eb8a403f1e88304c7a0ebdc3fe9804848d/apps/server/src/engine/leads.ts#L257) · [actions.ts, línea 774](https://github.com/uniscrolliabrain-cloud/agente/blob/b52581eb8a403f1e88304c7a0ebdc3fe9804848d/apps/server/src/actions.ts#L774)
