# WhatsApp piloto: borradores, aprobación y reconciliación

Fecha: 2026-10-31. Entrega VS-02a. Estado: código implementado y pruebas locales; conexión real y despliegue pendientes. Proveedor de salida de esta entrega: Evolution, reutilizando el adaptador existente. No añade salida Meta.

## Qué cambia

El panel tiene una vista WhatsApp conectada a la API. Puede preparar un borrador, revisar número/texto completos, aprobar o rechazar y registrar una comprobación manual del proveedor. No contiene conversaciones ni métricas simuladas. Los borradores caducan a los 30 minutos y la aprobación incluye su revisión SHA-256.

Una fila única en whatsapp-outbound-operations decide la operación. Aprobar y rechazar compiten mediante insertIfAbsent: solo gana una decisión. Un reintento devuelve el estado persistido, aunque el proceso haya reiniciado o un escritor antiguo sobrescriba el borrador. No hay caducidad de lease que permita reenviar a ciegas. Una caída antes del efecto puede necesitar reconciliación aunque finalmente no se haya enviado: se prefiere eso a un duplicado.

accepted significa aceptado por el proveedor, no entregado ni leído. Network/timeout, HTTP 5xx/408 o confirmación inválida se tratan como outcome_unknown. Los rechazos HTTP restantes se registran como failed, sin guardar el cuerpo privado de error. El ledger conserva la identidad y el snapshot aprobado.

## Activación y aislamiento

Se requieren todas estas condiciones para enviar:

1. Config de aplicación en modo live.
2. WHATSAPP_OUTBOUND_ENABLED exactamente true. Sin esa variable la salida está apagada.
3. Conexión del tenant/usuario habilitada, credencial válida y destinatario dentro de su allowlist del piloto.
4. Aprobación explícita de la revisión vigente, con sesión y scope autorizados.

La ruta rechaza Store crudo sin aislamiento. En JWT usa el scope autenticado; en sesión exige una membership explícita y única y no usa el resolver fallback default. La credencial se cifra con TOKEN_ENCRYPTION_KEY y el contenido cifrado vincula tenant, owner, generación, URL e instancia. No cae al cliente WhatsApp global de AgentService.

Esta primera conexión es por tenant Y usuario (owner). No concede automáticamente a todo el equipo acceso al canal ni implementa una libreta compartida. Una futura conexión empresarial compartida necesita permisos explícitos y revisión propia.

## Provisionamiento por operador

Script nuevo: scripts/provision-whatsapp.ts. No está montado como endpoint público y nunca envía mensajes. La operación predeterminada muestra un plan, sin abrir la base. --apply guarda/rota la conexión y su generación; invalida las revisiones anteriores. --enable habilita esa conexión, no la salida global.

Datos necesarios: tenant ID, user/owner ID con membership owner/admin explícita, instancia y URL HTTPS de Evolution, destinatarios de prueba autorizados. No aceptar userinfo, query o fragmentos en URL. No usar credenciales de producción en tests.

Secretos del entorno de operador:

- WHATSAPP_PROVISION_API_KEY: nueva entrada de provisión; se introduce en Doppler, no en argumentos ni en Git.
- TOKEN_ENCRYPTION_KEY: clave de cifrado actual de la aplicación. No regenerarla para preparar esta conexión.
- DATA_DIR o DATABASE_URL apuntando a la instalación correcta. Parar el API si se abre la misma base PGlite; no abrir simultáneamente otro proceso sobre ella.

Comprobar ayuda:

```powershell
node --import tsx scripts/provision-whatsapp.ts --help
```

Plantilla de plan (sustituir IDs y recursos; no ejecutar los placeholders):

```powershell
doppler run --project PROYECTO --config CONFIG -- node --import tsx scripts/provision-whatsapp.ts --tenant=TENANT_ID --owner=USER_ID --instance=INSTANCIA --base-url=https://HOST_EVOLUTION --recipients=NUMERO_AUTORIZADO
```

Después de revisar el destino, el operador puede repetir con --enable --apply. Se requiere una decisión consciente de activar WHATSAPP_OUTBOUND_ENABLED=true en el entorno live para permitir envíos. El script no cambia DNS, números, plantillas ni recursos del proveedor.

Las nuevas variables están documentadas aquí y en la guía; no se modificó .env.example ni config.ts porque están sujetos al acuerdo NC-P00. La incorporación al catálogo común se coordina como cambio de documentación/configuración compartida.

## API autenticada

| Método | Ruta | Contrato |
| --- | --- | --- |
| GET | /api/whatsapp/connection | Estado y recursos no secretos de la conexión propia |
| GET | /api/whatsapp/drafts | Hasta 100 borradores, estado autoritativo y revisión |
| POST | /api/whatsapp/drafts | JSON to/text y cabecera Idempotency-Key explícita (8-200 caracteres permitidos) |
| POST | /api/whatsapp/drafts/:id/send | JSON revision exacta vista por la persona |
| POST | /api/whatsapp/drafts/:id/reject | JSON revision; no puede revertir un envío ya reservado |
| POST | /api/whatsapp/drafts/:id/reconcile | Comprobación manual, nunca reenvía |

La misma Idempotency-Key con otro contenido o generación se rechaza. Un nuevo intento comercial requiere un nuevo borrador y aprobación; no se crea automáticamente para recuperar un fallo. No usar nuevas claves para esquivar una operación desconocida sin comprobar primero al proveedor.

La respuesta send puede ser 202 dispatching si otra petición ya reservó el envío; accepted/rejected/failed/outcome_unknown se devuelven como estado explícito. Un HTTP 200 del endpoint no equivale por sí solo a mensaje enviado: leer status. Errores de validación/estado mantienen sus 4xx/5xx.

## Reconciliación y caídas

- dispatching durante más de un minuto aparece como pendiente de comprobación. No se libera ni reenvía por timeout.
- outcome_unknown requiere consultar el proveedor.
- El operador puede registrar provider_accepted con providerId, o confirmed_not_sent, más evidenceRef y providerChecked=true.
- La comprobación guarda actor, hora y estado anterior. Es una declaración humana documentada, no un webhook de entrega verificado automáticamente.
- No se admite reconciliar una ejecución todavía en la ventana inicial. Dos reconciliaciones contradictorias no pueden sobrescribirse.
- Si el proveedor no permite confirmar el resultado, mantenerlo desconocido y escalar; no inventar éxito o ausencia de efecto.
- No borrar el ledger, cambiar IDs o vaciar tablas para reintentar. Desactivar salida conserva datos y evita nuevos intentos; no puede retirar una petición ya enviada.

## Compatibilidad y límites pendientes

Los endpoints send/reject ahora requieren revision; los clientes antiguos deben actualizarse. La nueva vista del panel ya la envía. Los borradores antiguos sin scope/generación explícitos siguen visibles para revisión, pero no se envían con credenciales implícitas.

El tool prepare_whatsapp del chat aún escribe el esquema anterior y usa la configuración global: su adaptación es un puente pendiente sobre conversation.ts, reservado por NC. No se ha cambiado ese archivo. Por ahora preparar mediante la nueva vista/API autenticada. El SOP executor no tiene una herramienta WhatsApp en su enum: la cadena webhook -> SOP -> borrador no se presenta como completada.

Las rutas de entrada Meta/Evolution se conservan. Esta entrega no corrige worker, memoria, OAuth o tenancy global; consume el scope existente y se mantiene fuera de sus reservas. Tampoco implementa receipts de entrega, varias conexiones por empresa, renovación de credenciales del proveedor o mensajes Meta salientes.

No se ha provisionado una cuenta real ni enviado un mensaje real. La UI requiere revisión visual adicional: el navegador de automatización devolvió errores de attach/network suspendido; typecheck y build no sustituyen esa revisión. El recorrido HTTP y las garantías de persistencia se verifican con Store real y proveedor simulado.

## Rollback

Desactivar la bandera global de salida y/o la conexión. Conservar operaciones y credenciales cifradas. Una reversión de código no debe restaurar la ruta antigua de envío directo si ya hay operaciones reservadas: eso eliminaría la protección frente a duplicados. Revisar el ledger antes de cualquier migración o reintento manual.

## Continuación: inbox y respuesta manual vinculada

El panel incorpora Mensajes recibidos con contenido real de whatsapp-inbox, aislado por tenant/owner. GET /api/whatsapp/inbox no marca un mensaje como respondido por existir una tarea ni altera el estado del escritor de entrada. Solo ofrece respuesta si la conexión Evolution habilitada corresponde a la instancia original y el remitente es un teléfono permitido.

POST /api/whatsapp/inbox/:id/draft admite únicamente text y la cabecera Idempotency-Key. El servidor deriva destinatario y canal desde el mensaje persistido; no acepta to ni parámetros de canal del cliente. El borrador y la operación guardan inboxId y su revisión incluye esa referencia. Reutilizar la clave con otro mensaje se rechaza, aunque texto y destinatario coincidan. Las revisiones de borradores manuales sin inboxId conservan su formato anterior.

La comprobación dirigida atraviesa rutas HTTP reales y Store real: entrada Evolution autenticada -> persistencia/encolado -> inbox -> respuesta manual -> aprobación concurrente -> confirmación simulada del proveedor. El productor de tarea del test es una fixture y no ejecuta el worker/SOP. No acredita automatización LLM ni una conexión Evolution real.

Los mensajes de Meta siguen siendo legibles, pero no se responden desde esta conexión Evolution; no se mezclan proveedores ni se reutilizan credenciales por coincidencia de número. La bandeja se actualiza al abrir y mediante Actualizar; no se anuncia tiempo real sin ese cableado.

La operación conserva también una fotografía no secreta del canal usado (proveedor, instancia y URL interna) para reconciliar después de rotar la conexión. La vista muestra la cuenta original, sin publicar la URL interna. Nunca se consulta al canal nuevo como si fuera el que recibió el intento anterior.
