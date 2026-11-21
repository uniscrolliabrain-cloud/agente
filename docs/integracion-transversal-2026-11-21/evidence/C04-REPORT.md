# C04 · Persistencia de mensajes en un hilo común

Base de producto: `main@3023637`. Alcance del PR: persistencia de mensajes de chat y primer inventario documental. Fuentes: auditoría 06 del handoff, especificación de concurrencia, ruta de hilos, hook de chat y router demo.

El chat enviaba la lista completa a un PUT sin versión. Dos clientes podían conservar historiales distintos y el último guardado sustituía al anterior. El nuevo POST `/api/threads/:id/messages` añade IDs aún ausentes. La transacción toma el bloqueo de la fila del hilo antes de leer el historial y guarda historial y metadatos juntos. El navegador reenvía su historial elegible para conservar el reintento al siguiente turno. El endpoint deduplica por ID respetando el contenido ya persistido.

El PUT permanece disponible para clientes anteriores y adquiere el mismo bloqueo. Su contrato de reemplazo sigue vigente y `expectedUpdatedAt` sigue siendo opcional en esa ruta. PATCH aplica cambios parciales a los metadatos. La demo acepta el nuevo POST. Se conserva el formato previo por propietario. El incremento de aislamiento descrito abajo verifica también el tenant activo.

Se verificó la concurrencia con dos append sobre el mismo hilo, replay idempotente y el 409 histórico para una versión desactualizada. El límite de 1.000 mensajes sigue vigente.

## D00 · Punto de partida

El árbol de main contiene 1.121 archivos Markdown, 539 bajo `docs/`. Recuento reproducible con `git ls-tree -r --name-only origin/main`. Los primeros lotes a contrastar contra el código son conversación, Cognition V2, auditoría móvil y despliegue. Quedan por inventariar las referencias de ramas fuente, clasificar por archivo y enlazar fuentes canónicas. Los documentos históricos conservan su contenido.

## Decisión

GO para revisar este incremento. C04 queda abierta para autorización del agente, fuente canónica del historial durante inferencia, revocación de sesiones y tránsito texto → voz → vídeo → texto. Las pruebas aquí cubren la ruta de chat con almacenamiento local. Doppler y proveedores reales quedan fuera de esta ejecución.

Rollback: revertir el commit con servidor y cliente juntos. El cambio conserva el formato de los registros existentes y no requiere migración.


## Segundo incremento · Aislamiento de hilos por tenant

Las operaciones de listado, presencia, estado, detalle, escritura y borrado de hilos verifican el tenant y el actor autenticados por el middleware. Los hilos nuevos guardan el tenant de creación y los históricos sin etiqueta se atribuyen al tenant primario resuelto por el servidor, porque sus registros anteriores carecen de procedencia. Las escrituras exitosas fijan ese tenant. La conversación principal antigua conserva su ID para el tenant al que se vincula y usa un ID separado para las demás empresas del mismo actor.

La prueba HTTP con dos membresías verifica acceso al historial anterior desde el primario, exclusión en el secundario, append y borrado rechazados desde el tenant incorrecto y separación de las conversaciones principales. Los hilos anteriores sin etiqueta requieren revisión de procedencia si se trasladaron entre empresas antes de este cambio. La conversación principal histórica y los hilos del chat aún usan interfaces distintas.

## Tercer incremento · Autorización antes de inferencia

La entrada HTTP de CopilotKit verifica un hilo existente del actor y tenant antes de iniciar el stream, tanto en el alias web como en la ruta del SDK. Conserva la conversación principal del cliente antiguo cuando su vínculo pertenece al tenant. Un rol explícito debe existir y estar activo en el registro del actor dentro del tenant. La identidad del actor proviene del middleware y el runtime usa el tenant activo para contexto, kernel y cuotas.

La regresión HTTP comprueba rechazo de un hilo de otra empresa, del ID principal histórico desde otro tenant y de un rol o persona no autorizados. Un hilo del tenant correcto inicia el stream de prueba. El runtime V2 conserva su selección de agente actual. Quedan abiertas su persona multiagente, la fuente canónica del historial consumido por inferencia y las rutas de sesión de voz y vídeo.

## Cuarto incremento · Historial persistido para inferencia

Tras autorizar el hilo, la entrada HTTP de CopilotKit lee los mensajes persistidos y conserva los turnos válidos de usuario y asistente más recientes. Añade únicamente el último mensaje de usuario de la petición. El frontend envía ese turno y los clientes anteriores pueden seguir enviando una lista completa con el turno nuevo al final. Se devuelve 409 si el mensaje nuevo ya está guardado. El contexto histórico se recorta a 99 mensajes previos dentro del presupuesto de entrada de Cognition V2. Si el mensaje nuevo agota el presupuesto, no se añade historial y V2 mantiene su validación de tamaño.

Las pruebas cubren sustitución del historial enviado por el historial persistido, descarte de registros incompatibles, deduplicación, límites de mensajes y bytes UTF-8 y rechazo HTTP de un mensaje ya persistido. La UI todavía guarda el turno terminado mediante el endpoint de anexado. Un turno previo cuyo guardado falló queda fuera de la inferencia siguiente hasta persistirse. Quedan abiertos el guardado del asistente desde el servidor, la selección de persona en Cognition V2 y la continuidad de las sesiones de medios en el mismo hilo.

## Quinto incremento · Perfil de agente en Cognition V2

Fast resuelve el rol seleccionado en el almacén del actor dentro del tenant autenticado. Usa su nombre, objetivo y tono como datos de presentación. Laia sigue siendo el perfil por defecto. Un rol inactivo, inválido o incompatible con la persona solicitada se rechaza. Fast vuelve a comprobar el perfil antes de llamar al proveedor, durante el monitor de revocación y antes de consolidar el recibo del turno. Una revocación impide aceptar el turno como completado. Los fragmentos ya entregados al cliente son irreversibles.

El proveedor continúa recibiendo el estado vacío y ninguna herramienta. La prueba con dos tenants comprueba que el mismo ID de rol se resuelve dentro de su tenant, que el rol inactivo queda bloqueado y que revocarlo durante el turno impide consolidar el recibo. Se usó un proveedor simulado.
