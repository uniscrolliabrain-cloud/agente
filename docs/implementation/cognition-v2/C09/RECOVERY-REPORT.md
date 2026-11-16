# C09 — Recuperación de entregas interrumpidas

Commits: `b323ab3`, `40b12dc`. Estado: IMPLEMENTED_LOCAL, no certificación operacional completa.

`CardDeliveryLedger.recover` procesa reservas leased/rendered caducadas en transacción, con selección acotada y FOR UPDATE SKIP LOCKED. Revalida identidad/política, preserva el propósito original del snapshot y eleva el fence. Si el snapshot sigue disponible, devuelve la entrega a pending; si caducó o quedó invalidado, marca invalidated. No genera envíos, recibos empresariales ni ACK. El conocimiento permanece en CardStore.

La actualización y el registro en `cognition_v2_delivery_recoveries` son atómicos. Los receipts incluyen estado previo, fence previo, motivo, fecha y revisión de política; no incluyen cuerpos privados de tarjetas. La nueva tabla está incluida en la migración RLS explícita.

`DeliveryRecoveryWorker` ejecuta un tercer bucle independiente de Slow/proyección. Revalida membresía por actor y usa lease/fence y scan_actor persistido. Una página de actores deshabilitados no impide avanzar a la siguiente; al envolver el cursor se reconsidera autorización restaurada. Un actor no autorizado no se suplanta ni se modifican sus entregas. No hay dependencia de timers para saber si el lease caducó.

Pruebas: dos casos funcionales PGlite PASS; concurrencia de dos conexiones en Postgres 17 PASS (una sola recuperación/un solo registro, ACK antiguo rechazado); transacciones nativas y RLS restringido PASS. Tanda nativa conjunta: 5/5 PASS.

Límites: el modo compartido global sigue bloqueado hasta integrar RLS extremo a extremo. Faltan panel operativo, retención, pruebas prolongadas y backfill de todo el legado; no se declara recuperación universal por estos fixtures.
