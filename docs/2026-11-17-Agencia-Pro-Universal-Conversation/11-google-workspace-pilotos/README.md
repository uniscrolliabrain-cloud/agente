# Pilotos Google Workspace — Gmail + Laia + Universal Conversation

**Fecha:** 2026-11-17. **Objetivo:** permitir que 2–3 empresas piloto conecten sus cuentas Google mediante OAuth y abran un panel de LAIA en Gmail, usando la misma conversación persistente de AgntiaPro. Documento de diseño, no implementación ni garantía de aprobación de Google.

## Qué se quiere probar

1. Usuario de empresa piloto abre Gmail.
2. En barra lateral derecha encuentra complemento AgntiaPro/LAIA.
3. Abre el panel, se identifica ante AgntiaPro y elige su empresa si corresponde.
4. El panel recupera el hilo activo autoritativo por tenant + usuario.
5. Envía un mensaje, LAIA responde a través del harness central.
6. Aunque AgntiaPro web estuviese cerrada, el mensaje y la respuesta quedan persistidos.
7. Al abrir AgntiaPro o Drive, se muestra el mismo historial y el mismo hilo activo.
8. «Nuevo chat» crea un nuevo hilo y sincroniza el puntero; los anteriores se conservan.

## Tres conceptos que NO son equivalentes

- **Google OAuth:** concede a una aplicación acceso a identidad/datos según scopes; no instala un panel en Gmail.
- **Google Workspace Add-on:** interfaz nativa del panel lateral mediante tarjetas y acciones del host; restricciones de UI, streaming y distribución.
- **Extensión Chrome:** UI React rica inyectada en navegador de escritorio; alternativa independiente que el fundador no prefiere para este piloto.

## Costes

| Partida | Orientación |
|---|---|
| Crear código y configurar OAuth / add-on | Sin tarifa de Google por crear el proyecto |
| Pruebas internas y cuentas autorizadas | Normalmente sin tarifa de Google |
| Publicación Marketplace | Google no suele cobrar tarifa de listado; revisar condiciones vigentes |
| Gmail API | Cuotas de uso; comprobar límites y precios vigentes |
| Hosting backend, logs, DB, LLM, avatar | Costes propios según proveedor/consumo |
| Verificación OAuth ordinaria | Normalmente sin tasa directa de Google |
| Auditoría de seguridad externa para scopes restringidos | Potencialmente costosa, depende del uso y los requisitos |
| Google Workspace de cada cliente | Suscripción propia si su organización utiliza plan de pago; no confundir con coste de publicar el add-on |

**No presupuestar 0 € total garantizados.** El piloto chat-only puede ser casi gratuito en tasas de Google, pero su infraestructura y cumplimiento no lo son necesariamente.

## Distribución y límites

- OAuth consent screen en modo Testing permite usuarios de prueba concretos, hasta el límite que establezca Google (históricamente 100); verificar en consola.
- Tokens de autorización en modo Testing pueden expirar a 7 días para scopes que no sean únicamente identidad básica; verificar excepciones actuales.
- Añadir usuarios de prueba OAuth **no distribuye ni instala automáticamente** el Workspace Add-on.
- Una publicación privada de Workspace Marketplace suele limitarse a la organización que la publica, no a tres dominios empresariales independientes.
- Para instalación autoservicio por empresas externas, estudiar Marketplace público con ficha unlisted y proceso de revisión. **Unlisted no equivale a exento de revisión**.
- Antes de prometer acceso a clientes externos, comprobar rutas oficiales de test deployments, deployment IDs, instalación de testers, requisitos de Google Workspace vs Gmail consumidor y permisos administrativos de cada dominio.
- No asumir que un complemento instalado en Gmail también tiene automáticamente UI idéntica en Drive/Calendar: verificar hosts y triggers disponibles.

## Camino recomendado para el piloto

**P0 chat-only:** OAuth/OIDC mínimo, login AgntiaPro, panel de tarjetas de Gmail, leer y enviar mensajes a Universal Conversation. No pedir scopes de lectura general de correos para probar la sincronización.

**P1 contexto del correo:** añadir, con consentimiento incremental, únicamente permisos y contexto que el host permita. El contenido de correos es no confiable y no se inyecta como instrucciones del sistema.

**P2 acciones:** borradores, lectura/búsqueda, enviar con aprobaciones; scopes específicos, auditoría y verificación según clasificación Google.

**P3 Drive/Calendar y Microsoft:** reutilizar API/harness y adaptar presentación, permisos y contexto.

## Riesgo de scopes

Los scopes de Gmail pueden clasificarse como sensibles o restringidos. Si datos obtenidos mediante scopes restringidos pasan a servidores propios, pueden aplicar verificación y evaluaciones de seguridad independientes. Confirmar la clasificación exacta de cada scope y las obligaciones vigentes antes de habilitar lectura de Gmail en producción. Evitar pedir https://mail.google.com/ si no es imprescindible.

## Seguridad y tenancy

- Un único add-on y un backend AgntiaPro multi-tenant; no instalar un backend separado por empresa.
- Sesión AgntiaPro autenticada; tenant y usuario derivados en servidor, nunca de parámetros de la tarjeta.
- OAuth de cada cuenta ligado al tenant y al usuario, con tokens cifrados y revocación.
- Validar CSRF/state, audiencia de tokens, permisos del recurso, idempotencia y rate limits.
- El chat es persistente en AgntiaPro; el panel Google solo es cliente y caché temporal.
- Evitar almacenar tokens o contenido de Gmail en logs o mensajes del modelo.

## Limitaciones de UX

Google Workspace Add-ons usan tarjetas/widgets y acciones controladas por Google, no React arbitrario como panel nativo. El chat podrá usar campos, botones y refrescos soportados, pero el streaming de tokens y una videollamada embebida requieren investigación por host. La experiencia rica de vídeo + documento dividido pertenece inicialmente a Agntia Live Workspace dentro de AgntiaPro.

## Criterios de aceptación

- Tres usuarios de prueba pertenecientes a empresas diferentes, cada uno con OAuth propio.
- Chat desde Gmail queda guardado sin que la web AgntiaPro esté abierta.
- Mismo historial al abrir AgntiaPro; «Nuevo chat» propaga cambio.
- Revocación OAuth no borra el historial.
- No hay fugas entre tenants o usuarios.
- Instalación externa y permisos validados mediante documentación vigente y prueba real, no solo suposiciones.

## Referencias oficiales a verificar

- https://developers.google.com/workspace/add-ons
- https://developers.google.com/workspace/add-ons/how-tos/testing-workspace-addons
- https://developers.google.com/workspace/marketplace/how-to-publish
- https://developers.google.com/identity/protocols/oauth2
- https://support.google.com/cloud/answer/13463073
- https://developers.google.com/workspace/gmail/api/auth/scopes

**Estado:** planificación. No se ha creado ni aprobado ningún proyecto OAuth ni publicado un add-on.
