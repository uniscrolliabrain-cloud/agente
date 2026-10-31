# AFTER — VS-02a: aprobación durable de WhatsApp

Estado: ready_for_review. Código: a3f77ac1fd0ca77184cfc313021bef4be5666578. Base: main 4f81f2293b67048ec4f6a32801f5940439b832cf. Sin merge, despliegue, conexión real ni envíos reales al redactar este informe.

## Resultado concreto

Se añade al panel una vista WhatsApp y un circuito HTTP para crear un borrador, revisar número/texto, aprobar/rechazar y registrar comprobaciones manuales del proveedor. El envío usa una conexión cifrada propia de tenant/owner, no el cliente global de AgentService. El ledger persistente es autoritativo y evita volver a despachar la misma operación ante concurrencia, rechazo simultáneo, reinicio o pérdida de confirmación.

La salida exige modo live, bandera global explícita, conexión habilitada, destinatario permitido y aprobación de la revisión exacta. Sample no puede activar efectos por tener una key o una bandera. El token cifrado vincula también tenant/owner/generación/URL/instancia. El adapter valida correctamente E.164, elimina respuestas privadas de error y distingue confirmación válida de resultado desconocido. accepted no significa delivered.

Se incluye provision-whatsapp.ts, de operador: por defecto solo muestra un plan sin abrir la base; --apply cifra/guarda y rota generación, con membership owner/admin explícita. No se ejecutó --apply ni se leyeron credenciales de Alfonso.

## Evidencia

- Pruebas finales dirigidas: 31/31, sin skips/cancelaciones. Store real PGlite, adapter/fetch simulados.
- Durante desarrollo se ejecutó regresión de entrada/salida: 54/54. Esa cifra corresponde a un estado anterior de la rama; no se presenta como suite final completa.
- Typecheck servidor y worker: correcto sobre el código final.
- Typecheck web: correcto; build web: ver manifest/log final.
- Ayuda y plan del provisionador: ejecutados sin abrir una base real ni guardar secretos.
- Revisión visual: blocked. Browser Use falló al adjuntar webview y después devolvió net::ERR_NETWORK_IO_SUSPENDED. No hay captura ni comprobación visual aprobada. Se retiró la fixture sintética y se detuvo el servidor local de revisión.

Se corrigió un fallo de prueba: la fixture tenía fecha fija mientras el router usaba reloj real; el borrador caducó y devolvía 409. Se ajustó el reloj de la fixture, sin rebajar la caducidad ni el bloqueo en sample.

Las pruebas de fallos intermedios inyectan excepciones antes/después de persistencia. La recuperación comprobada cierra y reabre el Store; no se afirma que se haya matado y reiniciado el proceso completo. La reconciliación manual guarda una declaración humana con referencia; no verifica el proveedor de forma automática.

## Diferencias de alcance y reservas

Además del backend previsto en BEFORE se conectó una vista mínima real del panel (App.tsx/SidebarV2 y archivos nuevos WhatsApp), dentro del territorio VS, para que la revisión no requiera terminal. Se documenta esta ampliación; no se tocó la UI cognitiva.

Archivos de implementación: engine/whatsapp-outbound.ts; whatsapp-routes.ts; adapter de integración WhatsApp; scripts/provision-whatsapp.ts; API/vista/CSS WhatsApp web; dos líneas de montaje y entrada de navegación; dos tests nuevos. Los documentos de campaña e inventario enlazan el runbook y distinguen implementado de desplegado.

Se respetaron las reservas: sin cambios en service.ts, worker.ts, model.ts, model-chain.ts, conversation.ts, app.ts del servidor, config.ts, db.ts, db-tenant.ts, tenant-scope.ts, bus, contratos de dominio, dependencias, lockfile o CI. El jefe NC confirmó PS-01 en el chat Estudia el repo y asume NC; sus correcciones documentales 0f8e277/cc92823 quedaron locales según su respuesta, no se presume integración.

## Límites abiertos

1. No cierra VS-02 completo: falta adaptar prepare_whatsapp del chat y añadir el puente SOP -> borrador cuando se liberen los archivos compartidos. El esquema legacy se muestra, pero su envío con credencial implícita se bloquea.
2. No añade salida Meta, receipts de entrega, conexión compartida entre todos los usuarios de una empresa ni múltiples canales por owner.
3. No se conectó Evolution real: el endpoint/payload reutiliza el adapter existente y se comprueba con mock. Las llamadas reales y la revisión visual quedan como puertas antes de activar el piloto.
4. send/reject ahora requieren revision. Clientes anteriores necesitan migración. La vista añadida usa el contrato nuevo.
5. No se ha ejecutado la suite completa del repositorio ni los audits generales en esta entrega. No se declaran verdes ni corregidos sus fallos de base.
6. .env.example/config compartidos siguen intactos. La incorporación de las nuevas variables al catálogo común se coordina con NC; su lector y significado ya están documentados.

## Rollback y revisión solicitada

Mantener salida apagada por defecto. Desactivar no borra el ledger ni retira efectos ya iniciados. No restaurar el antiguo envío directo sin revisar operaciones: permitiría duplicados. Para reintento tras estado desconocido, comprobar primero el proveedor; la reconciliación nunca reenvía automáticamente.

Revisar especialmente las transiciones de ledger, los puntos de pérdida de confirmación, la revisión ligada a conexión/contenido y la migración de clientes legacy. Cline puede registrar esta actividad como implementación finalizada, manteniendo revisión/conexión/despliegue pendientes. Copilot puede verificar el SHA objetivo con el estándar de informes existente.
