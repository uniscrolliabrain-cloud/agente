# Decisión aprobada y reconciliación de resultados

Revisión de partida `8967243326ccf5e22224e0693ac9155ea70d9765`. Superficie auditada `apps/server/src/actions.ts`, blob `1299d51bf99948c5c010f217def209cc7869f4d6`. Símbolos examinados: ActionService.decide y reconcileDispatchIntents. [Especificación original](../ESPECIFICACION-IMPLEMENTACION-V3.md)

## Propuesta original y código actual

A01 especifica pasar la revisión al claim y construir el registro desde el ganador. El HEAD ya pasa hash al claim dentro de transaction y escribe desde winner tanto la aprobación como el intento de despacho. Una implementación literal de V3 repetiría trabajo.

## Diagnóstico

En reconciliación, la escritura CAS sobre actions y la posterior escritura CAS sobre action-dispatch usan predicados diferentes. La segunda marca reconciled con actionStatus outcome_unknown incluso si la primera perdió la carrera. La variable moved gobierna el contador, pero no ese segundo write.

## Decisión propuesta

MEJORAR A03/E03. Ejecutar la transición de acción y la actualización de intención en una transacción local con lectura del estado efectivo. Cuando el CAS pierde, releer la acción dentro de la transacción y derivar el cierre desde el resultado persistido. Si sigue ejecutando en otra revisión, devolver conflicto y dejar pendiente. Conservar la prohibición de redespachar por timeout.

## Contrato e invariantes

La identidad de observación incluye tenant, id del intento y revisión aprobada. El estado proyectado debe corresponder al último receipt admisible de ese intento. Un acuse tardío puede añadir evidencia con procedencia. Para elevarlo a confirmación se necesita una correlación verificable con la misma operación.

## Prueba discriminante pendiente

Colocar una barrera entre lectura de executing y CAS del reconciliador. Confirmar desde el productor ordinario durante la barrera. Verificar que la intención no publique unknown tras observar el estado confirmado. Repetir invirtiendo los ganadores, con otro tenant usando el mismo id y con caída entre escrituras. Contar las invocaciones al adaptador.

## Compatibilidad y rollback

La reversión conserva decisiones, receipts y pendientes. Desactivar el nuevo reconciliador y revisar explícitamente los intentos cuyo estado discrepe del receipt antes de reutilizar el consumidor antiguo.
