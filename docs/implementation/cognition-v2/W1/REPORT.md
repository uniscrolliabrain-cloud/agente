# W1 — Contratos, transacciones y proyecciones durables

Base: main 54b8d5407a8576459448c4d059a877297d18ca7a; documentación 1e007d75b470490fe2ca8943ed5dc91803af039a.
Rama: feat/cognition-v2-runtime-C00-C15. Ningún merge, push a main ni despliegue.

## Implementación y clasificación

REUTILIZAR: Store, EventBus, source records, kernel/policy y validación Zod.
SUSTITUIR: flag global de transacción y BEGIN vía pool; consumidor sin cursor; consumo one-shot para V2.
LEGACY TEMPORAL: rutas V1 para tenants fuera de la allowlist explícita.

- C01 schemas strict versionados: identidad, evidencia, visibilidad, epistemia, objetos de proyección, relaciones, clasificación sin autoridad y ontología sin semántica inventada.
- C02 conexión transaccional por AsyncLocalStorage; PGlite transaction nativa y pg.Pool client dedicado; cierre/rollback/release. pgvectorReady preservado tras revisión.
- EventBus separa persistencia confirmada de errores post-commit; rechaza emit dentro de transacción exterior para evitar notificaciones fantasma. El pipeline nuevo escribe source/outbox juntos vía sink y publica mediante replay tras commit.
- Journal aditivo del bus existente, orden serializado por tenant bajo bloqueo de fila; projector con cursor, inbox, lease/fence, retry/DLQ y efecto+checkpoint atómicos. No exactly-once distribuido.
- Proyecciones inmutables por revisión; conflictos explícitos; grafo de referencias y tombstones transitivos; no resurrección de versiones antiguas.
- ContextServingFacade auth-first, private scope, límite conservador por bytes UTF-8, snapshots/deltas/referencias y revalidación. No hay tokenizer de proveedor certificado ni benchmark externo.
- Ledger separado: reserve/render/ACK con fence y lease; el ACK no consume conocimiento. ACK interno, no endpoint arbitrario de navegador.

## Verificación ejecutada

`node --import tsx --test --test-isolation=none --test-timeout=60000 tests/cognition-v2-*.test.ts` (log /tmp/cognition-v2-focused-detail.log): en curso al escribir; los focos de schemas, 501-event replay, crash rollback, takeover, restart de PGlite, privacidad, revocación y ACK ya pasaron. Salida final se incorpora al informe global.

`node node_modules/typescript/bin/tsc --noEmit`: exit 0 antes de las siguientes integraciones; repetir al cierre de ola.

Revisión independiente: identificó pgvector flag perdido, selección de revisión antes/después de revoke, revocación de evidencia, ACL tras LIMIT, tenant del sink, fence en fallo y ACK tras TTL. Correcciones aplicadas; nuevas regresiones se ejecutarán antes del cierre. No equivale a aprobación integral.

## Límites y rollback

No certificación C00–C15. Postgres real/RLS todavía no probado; activación V2 shared falla cerrada. Sin ontología cromática aprobada, JEV ni Anam sandbox. Apagar COGNITION_V2_TENANTS devuelve tenants a ruta V1 sin borrar fuentes ni proyecciones; no usar rollback para eludir políticas/revocación. Migraciones son aditivas; no eliminar tablas como rollback.
