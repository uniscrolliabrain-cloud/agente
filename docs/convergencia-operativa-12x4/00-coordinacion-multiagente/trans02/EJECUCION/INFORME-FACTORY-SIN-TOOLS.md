# Factory de texto sin herramientas implícitas

Código `66cec0c0`. Prueba sobre la petición HTTP real del SDK mostró AGUISendStateSnapshot/Delta aunque config y input indicaran tools:[]; los fixtures anteriores no acreditaban ausencia en wire. Se usa el modo custom factory público de BuiltInAgent con el mismo cliente AI SDK, una llamada doStream y la misma normalización pública. No segundo runtime, cola o dependencia nueva.

Solo se pasan prompt del servidor y mensajes textuales user/assistant; contexto/state/resume/forwardedProps y definiciones de tools no eligen permisos ni modelo. No se anuncian herramientas al proveedor; cualquier stream tool-* se rechaza antes de ejecución o eventos públicos. Reader cancelado al abortar y errores sanitizados; reasoning y metadatos no se publican.

Suite dedicada 5/5 PASS, cero SKIP, más integración Muse de Trans01 17/17 PASS (solapadas). Incluye SDK real con SSE simulado, petición sin tools, respuesta maliciosa que intenta herramienta de estado, stream vacío, salida pública y revocación. Typecheck raíz PASS. Logs /tmp/trans02-text-only-factory-{final,tsc}.log. No conexión real ni efecto de negocio.
