# Acta de campaña AgntiaPro · R01–R10

8 de noviembre de 2026 · Estado de entrega: **parcial**.

La integración de R01–R04 y sus evidencias por agente están en el [informe de la beta](INFORME-CIERRE-BETA-R01-R04.md). El [plan](SPRINTS-10-AGENTES-10-RONDAS.md) conserva las 60 tareas y los criterios de aceptación de R05–R10. Este corte parte de `c2dba91`.

| Ronda | Evidencia y trabajo registrado | Qué falta para cerrar |
| --- | --- | --- |
| R05 · WhatsApp | El código de salida liga la aprobación a la revisión, expiración, conexión y datos del destinatario. Reserva la operación antes de enviar y conserva los resultados ambiguos para reconciliación. La prueba ampliada registró 50 solicitudes y un solo intento al proveedor simulado. La ejecución focalizada pasó 4/4, incluidos reapertura del Store, resultado ambiguo y vínculo con la bandeja. | Trazabilidad del SOP entrante completo, estados de entrega del proveedor y reentrega tras reinicio. |
| R06 · Correo y agenda | Inventario de permisos OAuth solicitado por el código. | Diagnóstico de correo contra la base, dos buzones aislados, borrador sin envío, cita idempotente con zona horaria, reconciliación, consentimiento revocado y métricas. |
| R07 · Captación | Los criterios de procedencia y revisión humana se conservan en el plan. | Acreditar ingesta Places con deduplicación, procedencia por campo, ICP reproducible, exclusiones, interrupción de cadencias y revisión humana de extremo a extremo. |
| R08 · Panel | La evidencia previa de bandeja y respuesta manual está en docs/verification/vertical/2026-10-31/vs-02a-whatsapp-approval/. | Verificar las seis vistas y sus contratos HTTP, estados y acciones de error, cambio de empresa, métricas, exportación, accesibilidad y guía. |
| R09 · Voz y economía | Criterios de medición y aceptación registrados en el plan. | Ejecutar pruebas de llamada y traspaso, deduplicación de reserva, recuperación de caída, pausa, límites y medición real de coste y latencia por tenant. |
| R10 · Release | El último CI observado para la base `c2dba91` falló. El gate local dejó logs de typecheck con exit 0 para raíz y worker. | Gate completo con artefactos, SHA real de imagen, smoke de dominio, rollback, restauración aislada, alertas, segundo tenant, barrido de secretos y enlaces. |

## R05 · Contrato de aprobación

- Una revisión describe el borrador concreto. La aprobación queda vinculada al tenant, destinatario, texto, bandeja, canal, generación de conexión y expiración.
- La reserva persistente precede a la llamada al proveedor. Un segundo intento consulta el registro de operación.
- La aceptación del proveedor acredita recepción de la solicitud. La entrega requiere evidencia posterior.
- Si el transporte deja un resultado ambiguo, se conserva la operación y se exige reconciliación antes de decidir si se prepara un nuevo intento. El contrato evita que el servicio vuelva a invocar el proveedor por la misma aprobación. La garantía de entrega depende del proveedor.

## R06 · Inventario de permisos de Google

El código de apps/server/src/google-auth.ts solicita estos permisos por grupos. La separación por operación y el consentimiento incremental quedan por acreditar.

| Scope | Uso asociado |
| --- | --- |
| gmail.readonly | Leer mensajes y conversaciones. |
| gmail.send | Enviar mensajes. |
| gmail.modify | Modificar mensajes o etiquetas. |
| calendar.events.readonly | Leer eventos. |
| calendar.calendarlist.readonly | Enumerar calendarios accesibles. |
| calendar.events | Crear o modificar eventos. |
| calendar | Acceso amplio a Calendar. Revisar si el uso puede acotarse a eventos. |
| drive.readonly | Leer archivos. |
| drive | Acceso amplio a Drive. Revisar operaciones requeridas. |
| userinfo.email | Identificar el correo de la cuenta conectada. |
| userinfo.profile | Obtener el perfil de la cuenta conectada. |

## Criterio de reapertura

El siguiente corte necesita un gate completo sobre un SHA fijo y evidencia de los recorridos de producto pendientes. R10 requiere resultados reales de CI, infraestructura y dominio para acreditar un release.

## Relevo de ejecución · 8 de noviembre de 2026

El operador da por terminado el experimento de coordinación en paralelo. Los pendientes de producto pasan a ejecución directa y mantienen sus criterios de aceptación.

- El gate local finalizó con 8 de 10 pasos aprobados. Fallaron la suite de tests y la auditoría de contratos. Esta última registró 79 contratos sin uso ni decisión. El SHA del encabezado se leyó al escribir el informe, tras cambiar de commit durante la ejecución. Este resultado es diagnóstico y requiere una repetición sobre un SHA fijo.
- En la ejecución CI 42480943283, integración, web y worker pasaron. Unit devolvió código 1 después de imprimir 555 aprobadas, 12 omitidas, 5 TODO y cero fallos o cancelaciones. El job de release quedó omitido por dependencia. El comando habitual adopta el cierre de proceso de node:test que ya usa el gate. El resultado de la CI posterior queda por comprobar.
- Las dos pruebas focalizadas de tarjetas pasaron con el comando actualizado. Los pendientes de R05–R10 de la tabla siguen abiertos.
