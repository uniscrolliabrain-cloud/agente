# Comunicaciones · UI Lab V1

Workspace de canales de AgntiaPro, dentro de `apps/ui-lab/src/comunicaciones/`. Diseño de demostración aislado: **no se envían mensajes, SMS ni llamadas**, no se ejecutan SOPs, no se escriben memorias persistentes. Los datos son sintéticos y las acciones se guardan solo en el estado React.

## Pantallas
- [WhatsApp Business](./01-WHATSAPP-BUSINESS.md): bandeja, chat, contexto, aprobaciones y reglas.
- [Teléfono, llamadas y SMS](./02-TELEFONO-LLAMADAS-SMS.md): historial, escucha visual, transcripción, supervisión, SMS, contactos y teclado.
- [Slack](./03-SLACK.md): pestaña reservada, sin integración.
- [Diseño y arquitectura](./04-ARQUITECTURA-Y-BRANDING.md): estructura, contratos futuros, privacidad, responsive y criterios de validación.

## Código
- `ComunicacionesWorkspace.tsx`: shell, navegación de canales y WhatsApp.
- `comunicaciones.css`: estilo y responsive del shell y WhatsApp.
- `telefono/TelefonoWorkspace.tsx`: pestaña de voz y SMS.
- `telefono/telefono.css`: estilo y responsive de teléfono.

## Recorrido de revisión
Abrir UI Lab > Comunicaciones > WhatsApp Business / Llamadas y SMS / Slack. Probar escritorio y móvil; seleccionar Taller Bruma; inspeccionar la llamada, transcripción, propuesta de mejora y aprobación. Cambiar a SMS, escribir un mensaje de prueba y comprobar que se etiqueta como simulación.

## Límites V1
Sin audio real, WebRTC, Vapi, ElevenLabs, Asterisk, grabación, API, backend, consentimientos reales ni persistencia. No atribuir a un servicio real los datos de prueba.
