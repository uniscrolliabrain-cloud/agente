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

## Sexto incremento · Guardado del turno de texto desde Cognition V2

El navegador solicita guardado por servidor en turnos de texto sin adjuntos. El endpoint lo acepta para hilos gestionados en Cognition V2 local. El servidor anexa usuario y asistente con el mismo bloqueo que usa la ruta pública de mensajes. El historial, el recibo del turno y los ACK de contexto quedan en una sola transacción. Un turno con IDs ya presentes se rechaza y una cancelación observada durante la transacción provoca rollback. El evento de confirmación sale después del commit. El navegador usa el ID que devuelve el servidor y evita duplicar el guardado. Una desconexión sin confirmación se muestra como error.

Los clientes antiguos, adjuntos, demo, runtime externo y conversación principal histórica conservan su ruta de guardado anterior. La prueba HTTP usa un proveedor simulado y verifica historial persistido, replay con 409 y error sin confirmación al exceder el límite. La prueba de recibos fuerza un fallo de ACK después de escribir y verifica rollback del turno. Sigue pendiente verificar la continuidad de voz y vídeo, así como el tratamiento de adjuntos desde servidor.

## Séptimo incremento · Adjuntos en turnos guardados por el servidor

El cliente envía el ID del archivo y el texto del turno. Antes de iniciar inferencia, el servidor resuelve el archivo usando el almacén del actor y tenant autenticados. Si el archivo existe, construye la referencia para el runtime a partir de su nombre e ID reales. El historial guarda el texto visible y los metadatos disponibles para la UI (ID, nombre y tamaño) con la misma transacción del sexto incremento. La referencia de inferencia y las URLs firmadas quedan fuera del historial guardado.

La prueba HTTP comprueba que un archivo registrado para el mismo actor en otro tenant devuelve 404, y que un archivo propio se guarda y se vuelve a leer con sus metadatos correctos. El proveedor de prueba solo recibe la referencia. Este incremento no añade lectura ni envío de bytes al modelo. Voz y vídeo siguen pendientes.

## Octavo incremento · Historial común en el adaptador de voz

El coordinador pasa el rol autorizado de la sesión a Fast. Antes de iniciar inferencia, el adaptador verifica la identidad, el hilo del actor y su tenant, y el snapshot que autorizó la sesión. Construye la entrada con el mismo historial persistido y los mismos límites que el chat HTTP. Un hilo de otra empresa se rechaza antes de que el runtime reciba texto. Las pruebas sintéticas verifican el historial y el rol, además de conservar la cancelación cuando el consumidor rechaza una salida.

El adaptador es interno. Sigue pendiente consolidar las transcripciones y respuestas de voz como mensajes del hilo tras validar el epoch y el fence en la transacción de cierre. También quedan pendientes el cableado HTTP, vídeo y las pruebas con proveedores. No se habilitaron rutas nuevas ni se usaron credenciales.

## Noveno incremento · Cierre de voz en el historial del chat

El coordinador acepta `saveToThread` como consentimiento explícito para conservar el texto de los turnos completados. Los consentimientos anteriores conservan su comportamiento. Una sesión con guardado exige un hilo etiquetado con el tenant activo. Al completar el turno se vuelven a verificar identidad, consentimiento, snapshot, epoch, lease y fence. La transcripción final, la respuesta, la actualización de sesión y el recibo del coordinador se confirman en la misma transacción. Los IDs derivados del turno y el fence evitan duplicados. El recibo del coordinador representa cierre de texto, no reproducción de audio.

Las pruebas cubren el rechazo de un hilo de otra empresa, la ausencia de escritura tras interrupción, la continuidad con un turno previo de texto, el replay y el rollback al alcanzar el límite del historial. El coordinador sigue siendo interno. Quedan pendientes su montaje HTTP, vídeo y la comprobación con proveedores.

## Décimo incremento · API y continuidad del hilo

Los tenants habilitados para Cognition V2 disponen de una API autenticada bajo `/api/cognition-v2/voice`. Permite conceder y revocar consentimiento, abrir una sesión de voz o vídeo asociada a un hilo y a un rol activo, enviar transcripciones, interrumpir y cerrar. Los IDs de actor y tenant salen de la sesión autenticada. El snapshot sale del servidor. Una transcripción parcial no encola un turno y repetir una final completada devuelve el estado existente.

La prueba HTTP con inferencia simulada ejecuta texto → voz → vídeo → texto y comprueba que el historial conserva ese orden, que un turno de texto posterior recibe ambas transcripciones, que el replay no duplica y que la revocación bloquea turnos posteriores. Las pruebas del coordinador cubren interrupción en curso y rollback. Este cierre cubre el contrato conversacional y las transcripciones sintéticas. Captura, reproducción, imagen, conexión de la interfaz e integración con Anam/ElevenLabs quedan para las campañas de medios. El rollback consiste en revertir el montaje y las rutas; las tablas aditivas conservan los datos existentes.

## Cierre de hallazgos de revisión del PR #19

Base revisada: `020f6a1d9df6688f1dd4f581e4f421a0c49d532e`. El commit que incorpora esta sección contiene la corrección.

| Hallazgo | Evidencia y corrección |
| --- | --- |
| Cancelación P1 | Se confirmó que el código anterior invalidaba el epoch, pero no avisaba directamente al proveedor silencioso. Ahora el commit de interrupción, cierre o revocación aborta el trabajo local. En otra instancia se detecta el epoch inválido con un sondeo nominal de 250 ms, sujeto a latencia de la base. El adaptador cancela la suscripción y Fast propaga el aborto al proveedor. El test HTTP espera una señal observada por el proveedor simulado antes de comprobar el estado y el historial. |
| Transporte P1 | La API actual devuelve JSON al finalizar. Los fragmentos se consumen internamente para aplicar el fence. El tiempo hasta el primer audio, TTS, reproducción y facturación tras abortar quedan sin medir. |
| Expiración P2 | La llamada previa de `reap` a `close` reutilizaba la conexión transaccional por AsyncLocalStorage. El bloqueo por transacción anidada era un riesgo preventivo, sin fallo reproducido. El cierre ahora comparte una operación interna sobre la fila ya bloqueada. El montaje HTTP inicia un barrido al arrancar y cada 15 s para tenants habilitados, con hasta 100 candidatos por tenant y revalidación bajo bloqueo. El temporizador se detiene al cerrar el servicio. |
| API P2 | El cuerpo expone `code`. Consentimiento faltante o revocado devuelve 403, sesión expirada o cerrada 410, límite concurrente 429 e interrupción o conflicto de turno 409. Una sesión de otro actor o tenant devuelve 404. |

### Contrato previsto para el transporte incremental C05–C07

Cada evento de salida llevará `sessionId`, `threadId`, `turnId`, `epoch` y una secuencia monotónica. Tipos previstos: fragmento de texto, fragmento de audio, confirmación del turno, interrupción y error terminal. El adaptador de TTS debe recibir la misma señal de cancelación, dejar de enviar fragmentos de epochs anteriores y limitar los buffers. El cliente debe invalidar su cola de reproducción al cambiar de epoch. La confirmación del turno, la entrega de un fragmento y la reproducción efectiva requieren estados separados. La reanudación tras desconexión deberá definir el alcance de replay antes de habilitarse.

### Reproducción de la validación

- `ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test --test-timeout=45000 --test-force-exit tests/{cognition-v2-http,cognition-v2-voice}.test.ts`
- La recuperación se verifica reabriendo el almacén. Para PostgreSQL sintético local, definir `COGNITION_TEST_POSTGRES_URL` y ejecutar el mismo archivo de voz con `--test-name-pattern='expiry/silence'`.
- `pnpm typecheck` y `pnpm audit:coherence`.

El recorrido texto → voz → vídeo → texto se conserva con transcripciones sintéticas. Las pruebas ejercitan aislamiento, replay concurrente, interrupción, revocación, rollback y reapertura del almacén. Los proveedores reales y la interfaz móvil quedan fuera de este PR.

Resultado local: 6/6 pruebas en PGlite, 1/1 de recuperación de expiración en PostgreSQL 17.9 desechable, typecheck aprobado y coherencia 7/7. La CI de GitHub debe evaluarse sobre el SHA corregido antes de cualquier aprobación de merge.
