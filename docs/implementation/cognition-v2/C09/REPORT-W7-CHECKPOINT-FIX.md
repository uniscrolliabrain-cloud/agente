# C09 W7 — Entregas por consumidor después del checkpoint

Referencia de auditoría: `734b687c3936e7157ee184410736a69049a605d9`; código auditado `640a55db01fc9f934bf927dec53e97035f0455f3`. Corrige P1-01 del checkpoint sin modificar su evidencia histórica.

Cada reserva Fast incorpora el identificador opaco persistente del chat run (tenant/actor/thread/run), independiente del snapshot cacheado. `consumer_ref` es una columna nullable aditiva; reservas previas sin consumidor conservan su identidad y semántica. No se borran datos ni se ejecuta una migración sobre empresas reales.

La respuesta completada y los ACK internos se confirman en la misma transacción; un ACK fallido revierte la finalización. El runtime exige reserva/render válido antes de enviar tarjetas o hints al modelo. El conocimiento sigue persistiendo tras cada entrega. Esto acredita consumo interno, no recepción del navegador/playback; ese gate continúa pendiente.

Verificación sobre fixture local y Postgres 17 sintético: `node --import tsx --import ./tests/setup.ts --test tests/cognition-v2-delivery-recovery.test.ts tests/cognition-v2-runtime.test.ts`, habilitando la variable de conexión local sin publicar su valor: 5 tests, 5 pass, 0 fail, 0 skip, 14.501642 s. Incluye dos consumidores concurrentes con ACK independiente, retry de consumidor ya confirmado, recovery/fencing, diez runs sobre contexto preparado y rollback cuando falla el ACK. El primer intento con CLI tsx no arrancó por EPERM del IPC de sandbox; la ejecución node --import tsx sí completó la verificación.

C09 sigue EN CURSO: ACK cliente, fallos de streaming distribuidos y retirada de consumidores one-shot pendientes. No se ha hecho merge a main ni desplegado.
