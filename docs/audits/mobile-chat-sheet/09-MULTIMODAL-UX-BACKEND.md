# Compositor móvil e integración con el backend

La rama `feat/mobile-chat-multimodal-ux` parte de `18ee1c1`, el commit desplegado y validado del chat móvil. La entrada del prototipo es el botón flotante que abre la hoja móvil. El chat de escritorio y la vista completa mantienen su compositor habitual.

## Comportamiento en esta rama

| Control | Flujo disponible |
| --- | --- |
| Más | Abre un diálogo con nueve acciones y navegación de vuelta. Archivo, foto y cámara reutilizan la subida existente para los formatos admitidos. Vídeo abre el selector y muestra el nombre en un borrador local porque el servidor actual rechaza ese formato. Cliente, proyecto, SOP, creación de vídeo y búsqueda web preparan texto editable. Enviar sigue siendo una acción explícita. |
| Micrófono | Un toque inicia o detiene el dictado en los navegadores compatibles. El control se pone rojo y la transcripción se inserta en el cursor. Al mantener pulsado, se graba con `MediaRecorder`. Al soltar se añade una nota al hilo visible. La nota se puede reproducir, descargar y copiar. Si el portapapeles rechaza el formato de audio, se copia un enlace temporal válido mientras la hoja siga abierta. |
| Teléfono | El compositor cede el espacio a una conversación simulada con reloj, control de silencio e ideas de ejemplo que aparecen durante la sesión. Finalizar abre el informe y deja un acceso en el hilo. |
| Cámara de vídeo | Abre la videollamada demo directamente con el retrato de Juan, agente de Finanzas, y el recuadro propio. El interruptor permite ocultar y volver a mostrar la vista de vídeo. Encender la cámara habilita una vista previa local con permiso del navegador. El flujo finaliza en el mismo tipo de informe. |

Las grabaciones y los informes de ejemplo quedan vinculados al hilo mientras la hoja está montada. Al cerrarla se liberan las URL temporales y se descartan las entradas locales. Para grabar y previsualizar cámara se necesita HTTPS o localhost. El navegador puede procesar el dictado mediante su propio servicio. La cámara de videollamada se detiene al apagarla, finalizar o cerrar la hoja.

## Secuencia de ramas propuesta

1. **`feat/chat-media-messages`**. Partir de la rama de UX. Ampliar el contrato de `ChatMessage` con adjuntos tipados, manteniendo lectura de mensajes históricos con `attachment`. Integrar la subida y el historial antes de conectar la transcripción. Aceptar reintentos con la misma clave y mostrar los estados de envío, error y reintento en la burbuja.
2. **`feat/chat-composer-capabilities`**. Partir de la rama de UX en paralelo con medios. Resolver qué acciones están disponibles desde identidad, empresa, workspace, rol y conectores. Sustituir los formularios de texto por búsqueda y selección de IDs cuando exista una fuente autorizada. Integrar borradores y aprobaciones del runtime en las operaciones con efectos.
3. **`feat/chat-live-sessions`**. Partir de UX y del contrato de mensajes ya integrado. Implementar sesión web bidireccional, acceso a medios con credencial efímera, eventos de ideas y generación asíncrona del informe. Probar interrupción de voz, pérdida de red y fin de sesión con un adaptador de proveedor falso.
4. **`feat/chat-live-video`**. Partir de sesiones. Agregar negociación de vídeo, detección de cámara y cambio de dispositivo. Reutilizar identidad, timeline, ideas e informe de la llamada de voz. Mantener audio si falla el vídeo y soportar finalizar desde cualquiera de las dos vistas.

## Puntos de integración

### Adjuntos y notas de voz

La subida actual pasa por `apps/web/src/api/files.ts` y `apps/server/src/files.ts`. El chat conserva el hilo con `useChat` y `/api/threads`, y envía el turno al agente por `/api/copilotkit/run`. Para audio y vídeo, añadir una ruta de medios o ampliar la existente con una lista explícita de formatos, límites por tipo y cuota por empresa. Validar contenido y duración en servidor. Para archivos grandes, entregar una URL de subida de corta duración y registrar el medio solo después de validarlo. Reutilizar el almacenamiento de artefactos para recuperación y descarga autorizadas.

Proponer un mensaje con `kind: "audio"`, `mediaId`, `mimeType`, `durationMs` y estado de transcripción. Crear el mensaje con `clientMessageId` único por hilo después de confirmar la subida. El cliente puede mostrar una URL provisional hasta recibir su versión persistida y revocarla después. Copiar el audio requiere soporte del navegador. Para compartir un enlace estable, usar una ruta autorizada por sesión en lugar de una URL pública de almacenamiento. Transcribir en segundo plano y asociar el texto al mensaje. Entregar la transcripción al agente según la intención del usuario y la política del workspace.

### Acciones del menú

- **Cliente y proyecto.** Consultar las vistas y capacidades del workspace mediante `/api/workspaces`. Persistir referencias tipadas con IDs y verificar su acceso en servidor al seleccionar y al usar el contexto. Usar el nombre solo para mostrarlo.
- **Crear SOP.** Producir un borrador revisable y crear la entidad con el contrato de `/api/sops` cuando el usuario lo confirme. Mostrar el ID o enlace del resultado en el hilo.
- **Crear vídeo.** Preparar primero guion y parámetros. Al confirmar, encolar la generación con clave de idempotencia y devolver estado, error o `mediaId`. Aplicar límites de coste por empresa.
- **Buscar en la web.** Ejecutar una capacidad declarada y autorizada desde el turno del agente. Mostrar fuentes con los resultados. Restringir el acceso a redes privadas desde el recuperador y tratar el contenido de páginas como datos externos.

### Voz, vídeo e informe

Crear una sesión web en `POST /api/threads/:id/live-sessions` con modo, estado y consentimiento. El servidor verifica acceso al hilo y emite una credencial efímera para WebRTC o para el transporte del proveedor. `apps/server/src/voice-routes.ts` proporciona un precedente de aislamiento e idempotencia para Vapi. Es telefonía saliente y la sesión dentro del navegador requiere su propio adaptador de medios. Evaluar ElevenLabs para conversación y Anam para avatar/vídeo tras comprobar SDK, latencia, interrupción, tratamiento de datos y coste. Mantener sus claves y configuración en el servidor.

Separar medios en tiempo real de los eventos del runtime. Un canal del servidor por sesión puede emitir `session.started`, `transcript.final`, `idea.upserted`, `session.ended`, `report.ready` y `session.failed`. Cada evento lleva ID y secuencia para reanudar tras un corte sin duplicar ideas. La fuente de las ideas son turnos finalizados con marcas de tiempo. El cliente recibe texto y referencias para mostrar, y el resumen no autoriza acciones externas.

Al finalizar, una operación idempotente cierra la sesión y encola un informe con resumen, decisiones, preguntas abiertas y próximas acciones. Incluir marcas de tiempo o referencias a los turnos de origen. Publicar un único mensaje de informe en el hilo cuando esté listo y conservar estados de procesamiento y error. Aplicar pertenencia a empresa, permisos sobre el hilo y retención a grabaciones, transcripciones y resúmenes. Pedir consentimiento para guardar medios antes de capturarlos para el servidor.

## Validación antes de integrar

Probar en Android Chrome e iOS Safari con teclado abierto, permiso concedido y denegado, toque corto y largo, interrupción del gesto, cambio de hilo y cierre de la hoja. Para el backend, cubrir adjuntos históricos, formatos inválidos, reintentos, carga interrumpida, acceso cruzado entre empresas y expiración de credenciales. Para sesiones, comprobar reconexión sin ideas duplicadas, fin de sesión repetido, un solo informe por sesión y liberación de micrófono y cámara en todos los estados terminales.
