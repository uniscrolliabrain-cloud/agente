# C04 · Persistencia de mensajes en un hilo común

Base de producto: `main@3023637`. Alcance del PR: persistencia de mensajes de chat y primer inventario documental. Fuentes: auditoría 06 del handoff, especificación de concurrencia, ruta de hilos, hook de chat y router demo.

El chat enviaba la lista completa a un PUT sin versión. Dos clientes podían conservar historiales distintos y el último guardado sustituía al anterior. El nuevo POST `/api/threads/:id/messages` añade IDs aún ausentes. La transacción toma el bloqueo de la fila del hilo antes de leer el historial y guarda historial y metadatos juntos. El navegador reenvía su historial elegible para conservar el reintento al siguiente turno. El endpoint deduplica por ID respetando el contenido ya persistido.

El PUT permanece disponible para clientes anteriores y adquiere el mismo bloqueo. Su contrato de reemplazo sigue vigente y `expectedUpdatedAt` sigue siendo opcional en esa ruta. PATCH aplica cambios parciales a los metadatos. La demo acepta el nuevo POST. Se conserva el almacenamiento previo por propietario. El aislamiento por tenant para un mismo actor con múltiples membresías requiere una reconciliación explícita antes de conectar adaptadores.

Se verificó la concurrencia con dos append sobre el mismo hilo, replay idempotente y el 409 histórico para una versión desactualizada. El límite de 1.000 mensajes sigue vigente.

## D00 · Punto de partida

El árbol de main contiene 1.121 archivos Markdown, 539 bajo `docs/`. Recuento reproducible con `git ls-tree -r --name-only origin/main`. Los primeros lotes a contrastar contra el código son conversación, Cognition V2, auditoría móvil y despliegue. Quedan por inventariar las referencias de ramas fuente, clasificar por archivo y enlazar fuentes canónicas. Los documentos históricos conservan su contenido.

## Decisión

GO para revisar este incremento. C04 queda abierta para identidad y autorización de tenant/actor/agente, fuente canónica del historial durante inferencia, revocación y tránsito texto → voz → vídeo → texto. Las pruebas aquí cubren la ruta de chat con almacenamiento local. Doppler y proveedores reales quedan fuera de esta ejecución.

Rollback: revertir el commit con servidor y cliente juntos. El cambio conserva el formato de los registros existentes y no requiere migración.
