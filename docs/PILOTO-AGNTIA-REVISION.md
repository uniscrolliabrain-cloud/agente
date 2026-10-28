# Piloto AGNTIA: revisión e integración

Fecha: 2026-10-28. Base revisada: campaign/authz-tenant, c5a8c7c, sobre main c69e028.

## Dictamen

El trabajo aporta un webhook público y pruebas útiles, pero no validaba por sí solo un canal de producción multitenant. Esta rama incorpora correcciones y conserva el trabajo original para revisión. No implica un despliegue ni valida el envío real a proveedores.

## Correcciones incorporadas

- Meta verifica HMAC SHA-256 hexadecimal sobre los bytes originales. El token GET solo verifica el handshake.
- Evolution usa un secreto dedicado por instancia en x-webhook-secret; no se presupone que emita HMAC base64.
- Cada cuenta de proveedor se vincula explícitamente a tenant, responsable y SOP activa. Una cuenta desconocida se rechaza; no hay caída al usuario system.
- Se procesa el lote completo. La bandeja de entrada persiste en Store con identidad estable por tenant/cuenta/mensaje. Las reentregas recuperan la misma tarea incluso tras reiniciar el Store.
- Las peticiones concurrentes no crean varias tareas ni varios eventos task.created. Esto no promete atomicidad transaccional entre persistencia de tarea y emisión de evento si el proceso cae entre ambas operaciones.
- createTask conserva el tenant del contexto autenticado activo, incluso si el usuario pertenece a más de una empresa.
- Dominio del panel y API acordado: https://www.agntiapro.com. Configuración de Fly, enlaces y smoke de despliegue alineados. No se ha cambiado la dirección de correo comercial.

## Evidencia y límites

Instalación frozen completada. Las 38 pruebas dirigidas de JWT, webhook e inbox pasan. Bootstrap de agencia: 4/4 en ejecución aislada con presupuesto de 60 segundos. La suite amplia sigue bajo diagnóstico: el arranque de PGlite excede presupuestos de 20 segundos en este equipo y también hay fallos que requieren clasificar. Los audits de contratos e idempotencia siguen devolviendo error; no se han rebajado sus controles. El informe final de integración debe conservar los logs y no llamar verde a la suite completa por estos resultados parciales.

## Configuración manual del primer tenant

1. Crear el usuario, tenant y SOP con el bootstrap existente. Elegir un responsable cuyo tenant primario sea el de la empresa. Esta restricción evita que el worker resuelva el tenant equivocado; el contexto completo del worker queda como siguiente campaña.
2. Configurar WHATSAPP_WEBHOOK_BINDINGS con provider, accountId, tenantId, owner y sopId. Para Evolution, añadir secretEnv apuntando a un secreto WHATSAPP_* dedicado de al menos 32 caracteres.
3. Meta: callback https://www.agntiapro.com/api/whatsapp/webhook, WHATSAPP_APP_SECRET y WHATSAPP_VERIFY_TOKEN. Evolution: https://www.agntiapro.com/api/whatsapp/incoming y cabecera x-webhook-secret en su configuración.
4. No guardar secretos en Git ni en un handoff. Las credenciales por cliente deben pertenecer a su conexión y tenant, nunca deducirse del texto del usuario.
5. Antes de activar tráfico real: configurar reentregas, comprobar recuperación y revisar política de retención de datos personales de la inbox. Las pruebas locales no sustituyen una entrega real controlada.

## Bloqueos de publicación observados

www.agntiapro.com no resuelve en DNS en la comprobación realizada. Cloudflare tiene los nameservers del dominio, pero no se ha creado ningún registro. Fly y Vercel CLI no tienen sesión iniciada. No se han modificado DNS, certificados ni producción. Elegir un único frontal para panel y API, o configurar un proxy de mismo origen explícito; no basta con cambiar PUBLIC_API_URL. Revisar el callback OAuth real en el router antes de registrarlo en Google.

## Campañas siguientes para Freebuff

1. Contexto de ejecución: persistir/restaurar tenant y actor al reclamar y reanudar tareas. Pruebas del mismo usuario en dos tenants, reinicio de worker y acceso denegado cruzado.
2. Salida WhatsApp: conexión y credenciales por tenant; ligar aprobación a tenant, destinatario y contenido exacto. Resolver envíos concurrentes y estados ambiguos sin reenvío ciego. El envío actual del panel sigue dependiendo del cliente Evolution y no completa salida Meta.
3. Conexiones Google: OAuth ligado a sesión/tenant, state de un uso, renovación y revocación; Gmail primero como borrador revisable y Calendar con identidad de operación estable. Comprobar permisos y límites por tenant.
4. Primer producto vendible: agencia propia provisionada manualmente, chat conversacional, inbox y aprobaciones reales, errores visibles, métricas de contactos/citas y auditoría. Activación por tenant, reversión y límites de gasto. No hace falta completar los 34 módulos ni la red agéntica para este piloto.

## Encargo documental para Cline

Actualizar documentación a partir de rutas, pruebas y configuración verificables. Separar implementado, probado localmente, conectado a proveedor y desplegado. Mantener las instantáneas históricas como tales. No editar código ni sustituir evidencia por marcadores o recuentos de tests. No asumir que todos los servicios de la visión de producto ya están conectados.
