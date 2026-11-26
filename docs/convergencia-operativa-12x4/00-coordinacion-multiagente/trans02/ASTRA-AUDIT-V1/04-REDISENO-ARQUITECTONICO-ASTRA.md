# Entrega coherente de contexto en Cognition V2

## Recorrido que ya existe

En la revisión funcional `89c5925d7a30e70ff41cd81539408d8b0282b92c`, createApp toma la lista de tenants inscritos, construye CognitionV2Runtime cuando corresponde, pasa su sink al EventBus y monta las rutas en /api/cognition-v2. El handler CopilotKit usa makeRuntime. El backend AG-UI explícito construye HttpAgent. La ruta conversacional comprueba enabledForRequest en ConversationAgent y puede entrar en CognitionV2Runtime.chat. Una extracción de factory que conserve la misma decisión de ruta solo tiene valor si elimina decisiones duplicadas o arregla una discrepancia demostrada.

En chat, el servidor reclama el run, prepara el snapshot, reserva entregas y renderiza los segmentos dentro del prompt. Fast comprueba readSnapshot antes de llamar al proveedor y antes de confirmar el receipt. Un monitor periódico revalida durante el stream. La transacción final confirma el run y sus ACK del ledger. El receipt acredita la salida del consumidor servidor. El código filtra eventos públicos de texto y vacía herramientas, contexto extra y propiedades reenviadas al proveedor en este camino.

## Tres obligaciones distintas

1. **Vigencia.** La fuente sigue activa para el actor, empresa, propósito, revisión y política actuales. readSnapshot ya comprueba identidad y resuelve las referencias. En el experimento, una corrección de la card seleccionada invalida correctamente el snapshot anterior.
2. **Coherencia de selección.** La selección debe corresponder a la vista proyectada y a los parámetros declarados. El cursor al final del proceso no demuestra que el conjunto inicial incluyera todos los registros visibles en esa posición. Además, el conjunto de candidatos está acotado y ordenado por id antes de aplicar el scorer.
3. **Fidelidad de representación.** Cada segmento debe corresponder a una referencia y a un serializador conocido. La validación de las referencias y el límite de bytes son necesarios, pero no reconstruyen el texto entregado.

## Cambio de menor superficie

Conservar el único ContextServingFacade, el proyector existente, GlobalAttentionWorkspace y CardDeliveryLedger. Fijar la vista y el contrato de selección antes de reutilizar material preparado. Centralizar el serializador de segmento en el módulo que ya posee el contrato. Extraerlo de getSnapshot y reutilizarlo al leer material persistido. Derivar refs, segmentos, tokens y datos cromáticos del mismo conjunto, con orden reproducible.

En un cambio de watermark durante preparación, reintentar de manera acotada antes de emitir el stream. Si persiste la presión, usar una lectura coherente con aislamiento apropiado o degradar según contrato explícito. Separar dos tipos de cambio: crecimiento de la proyección, que puede dejar una selección incompleta, y revocación, que exige omitir el contenido retirado antes de cualquier nueva entrega. La latencia adicional de segunda lectura de cursor debe medirse para tenants con actividad sostenida.

La selección de anclas antiguas puede ampliar el conjunto candidato mediante referencias precisas aportadas por Trans05. Conservar resolve, autorización y puntuación en el camino común. Slow y JEV quedan fuera del camino síncrono de Fast. El bridge automático hacia Slow solo se activa tras validar una observación real y su familia de receipt. Conservar el comportamiento de abstención cuando falte evidencia. [Patchsets con pruebas y rollback](06-PATCHSETS-CONSOLIDADOS.md)
