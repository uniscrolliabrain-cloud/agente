# Slow — rutas legacy y protocolo real del SDK

Código `3dcdfa64`. generateText ignoraba el perfil Slow de proceso y podía llamar al modelo global; la prueba roja confirmó intento contra /responses de otro endpoint. Ahora antepone el perfil Slow completo, conserva endpoint/clave/modelo juntos también con TenantConfig y evita heredar una clave Fast en tareas. executeModelTask consulta configuración de tenant aunque no haya roleId; si no dispone de ella, utiliza el perfil Slow de proceso. No duplica el mismo modelo en la cadena añadida.

El SDK real emite TEXT_MESSAGE_CHUNK, no solo CONTENT. Las rutas legacy ahora acumulan ambos formatos; antes una respuesta correcta podía terminar en llm_generate produced no text. La normalización pública estricta de V2 corresponde a Trans02 y mantiene fuera campos privados.

Suite focalizada final: 14/14 PASS, cero SKIP; typecheck raíz exit 0. Incluye generación real por BuiltInAgent con SSE simulado, tanto sin tenant como con tenant, y endpoint nativo distinto como control; se conservan pruebas del worker y cadenas. Logs /tmp/trans01-slow-routing-{red-confirmed,complete,complete-tsc}.log. El fixture SSE inicial requirió corregir escapes; no se cuenta ese fallo de fixture como bug. No inferencia real ni credenciales de usuario.
