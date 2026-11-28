# Composición horizontal 01/03/04/06 — en curso

Código `83d090656a361b45dda8a68c221179b5f6c57287`; commits b32de7c4 y 83d09065. Conserva informes E-M1. No cierre de los 48 bloques ni certificación global.

La app consume executeEffect de Trans03 con schema común en execution-context. ActionService valida familia, operación, recurso conocido y modo esperado; guarda el recibo aceptado o simulado con la acción. Un string o recibo incompatible en la composición gobernada da outcome_unknown y no admite retry. El wrapper legacy sigue disponible para consumidores históricos: su string no constituye recibo verificado.

Conversación dejó de efectuar tres caminos de escritura de memoria. Usa persistPromotionDestinations; éste valida tenant/owner/turno/rol y persiste un recibo por thought en la misma transacción que la memoria. Replay concurrente no vuelve a publicarla. Un error revierte también el recibo. Texto mayor de 500 caracteres se conserva en el thought y se marca deferred_oversize, sin curar una proposición truncada. Un thought no autoriza crear una entidad empresarial: ese destino debe volver al circuito gobernado. El promotor conserva su ABI legacy, pero la composición de conversación ya no inyecta memory/graph para escrituras paralelas.

El sink kernel de Trans04 se monta una vez en index y se retira al shutdown. AlertService usa cooldown durable con db. Fuentes reales de alertas y exportación compartida siguen pendientes de Trans04; no se acredita que esas alertas funcionen integralmente.

Nuevo defecto reproducido: claims compartían tenant+step+capability+inputs entre operaciones distintas y permitían otro efecto al cambiar inputs del mismo paso. Protocolo v2 vincula owner y operación estable (task, turn o request con actor); la reasignación de worker de una tarea conserva su identidad. Inputs y versión contractual tienen digest separado: su cambio exige conciliación. Se captura contexto/inputs antes de awaits. El canonicalizador retiene claves JSON __proto__; lookup histórico conserva expresamente el algoritmo anterior para no perder un efecto ambiguo durante migración.

## Verificación y límites

Composición: 160 pruebas, 158 PASS, cero FAIL, dos SKIP; los skips no acreditan sus comprobaciones. Claims/autorización/outcomes: 54/54 PASS, cero skips. Typecheck raíz y worker exit 0. Los árboles se probaron durante el trabajo y después se comprometieron sin cambios de código adicionales; no son un gate global ejecutado sobre checkout limpio. Control de composición previo: 4 fallos nuevos/5 pruebas; nuevo scope: 3/3 fallos; canonicalizador: fallo específico reproducido. Evidencia exacta en EVIDENCIA-COMPOSICION.json, sin sumar suites solapadas.

**Barrera de despliegue del protocolo de claves:** v1 y v2 no pueden convivir despachando durante una transición: los workers antiguos no conocen las nuevas claves. Antes de cualquier activación real se requiere detener/drain de todos los dispatchers antiguos, inventario de claims y conciliación; rollback exige el mismo aislamiento y preservar claims v2. No se hace despliegue ni migración productiva aquí. La búsqueda histórica evita reenvíos de claims existentes, pero no certifica rolling upgrades entre protocolos. Claims históricos ambiguos quedan bloqueados, no se reescriben como éxito ni se vacían para reintentar.

Reserva de dependencia concreta: engine/idempotency.ts pertenece a Trans01 para corrección del digest y lectura compatible de claves históricas. Nuevo kind records/kernel-promotion-receipts sólo para deduplicación transaccional del consumidor; no segundo bus ni proveedor. Falta prueba PG multiproceso de ese consumidor, verificador de familias por Trans02/03 y full gate horizontal.
