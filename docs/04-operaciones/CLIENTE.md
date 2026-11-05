# Guía del Cliente

> v1 · 2026-10-27 · Estado: current

## Qué es OpenMuse

OpenMuse es tu sistema operativo de negocio con IA. Te ayuda a:
- Gestionar tareas y procedimientos de tu empresa.
- Conectar tus herramientas (Gmail, Drive, Calendar, WhatsApp, Stripe, etc.).
- Automatizar procesos con aprobaciones humanas antes de acciones externas.
- Tener un chat conversacional con tu empresa que prepara emails y gestiona operaciones.

## Tu panel

Accede a tu panel privado en la URL que te proporcionó tu proveedor de OpenMuse. Desde allí puedes:
- Ver tus tareas y su estado.
- Revisar y aprobar acciones preparadas por el agente.
- Conectar tus cuentas de Google, WhatsApp, etc.
- Hablar con el chat de tu empresa.

## Aprobaciones

Toda acción externa (enviar email, crear evento de calendario, enviar WhatsApp, cobrar con Stripe) requiere tu aprobación explícita. El agente prepara la acción; tú decides si se ejecuta.

## Conectar herramientas

1. **Google**: Desde el panel, ve a Integraciones > Google y completa el flujo de OAuth.
2. **WhatsApp**: Tu proveedor configura Evolution API. Los mensajes entrantes crean tareas para tu revisión.
3. **Stripe**: Configurado por tu proveedor para pagos.

## Soporte

Tu plan de mantenimiento incluye soporte mensual. Contacta a tu proveedor para cualquier incidencia.

## Seguridad

- Tus datos están aislados de otros clientes (multi-tenant).
- Las credenciales de Google están cifradas.
- Ninguna acción externa se ejecuta sin tu aprobación.
