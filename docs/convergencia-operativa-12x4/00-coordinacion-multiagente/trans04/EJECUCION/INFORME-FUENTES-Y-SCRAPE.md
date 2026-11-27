# Trans04 — fuentes y scrape, en curso

Código `c0f58b7f8a7fa6727a7be7c3cf4f61a296018b32`. 42 pruebas PASS/cero skip en suite de observabilidad y gate; refinamiento de lectura compartida: 3/3 PASS, suite solapada. Typecheck raíz/worker exit 0 antes del último refinamiento local. No certificación ni full gate todavía.

Collector ABI createAlertSnapshotReader obtiene tareas fallidas recientes, DLQ sin resolver y acciones desconocidas del Store visible al rol DB; cachea y comparte una consulta en curso. Counters HTTP vía API pública, circuito real y p99 observado. Fuentes inexistentes o lectura fallida quedan undefined y gauge de disponibilidad 0, no cero medido. Cuota sin productor sigue desconocida. No se acredita cobertura global RLS por contar filas visibles. Montaje de collector en index reservado a Trans01; no se afirma activo antes de montarlo.

Scrape por token compara digests en tiempo constante y agrega únicamente familias revisadas sin labels de negocio/tenant/owner/actor. Histogramas agregan buckets/sum/count; gauges usan política por familia, no suma genérica. Shared requiere token dedicado y rechaza filtro tenant. Fallback admin sólo con METRICS_ALLOW_LOCAL_ADMIN=true en sample fuera de shared; no fallback automático en live. No se establece valor de configuración productiva.

Gate rechaza directorio de logs desviado por symlink y valida duración; runner TAP con concurrencia 2 y resumen cuenta verdes reales. Se preserva separación entre advisory y bloqueo. Sin secretos ni SDK nuevo ni deploy. Pendientes H02/H03, OTLP verificado, CI, secrets GitHub-first/Supabase, PG restringido, fencing de provision y certificación conjunta. Sigue abierto el ledger de 48 bloques, sin convertir estos resultados en cierre global.
