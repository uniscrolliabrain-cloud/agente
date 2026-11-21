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
