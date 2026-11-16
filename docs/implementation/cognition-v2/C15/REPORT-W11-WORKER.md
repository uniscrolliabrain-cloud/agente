# W11 — Worker V2 y PostgreSQL sintético

Base: `685ef3a17e77245fdb2d7b438584c237beccd91e`. Sin merge, despliegue ni datos reales.

GitHub: ramas y PR/issue abiertos consultados antes del patchset; no se encontró trabajo concurrente publicado para estos paths. El registro histórico NC consultado solo muestra reserva activa sobre sus documentos. Esta búsqueda no detecta cambios no publicados ni constituye un lock de archivos.

El worker ejecuta cuatro carriles independientes por tenant, con reintentos y backoff acotado, heartbeat por instancia y limpieza al cierre. La API devuelve 503 si algún tenant habilitado no tiene señal reciente de todos los carriles. Un heartbeat es evidencia de tick reciente, no de backlog vacío, conectividad externa ni capacidad empresarial. Un fallo abrupto tarda hasta 90 segundos en reflejarse; operaciones atrapadas en DB pueden seguir bloqueadas y se necesita supervisión externa del proceso. Multiworker puede agregar señales por carril. El worker dedicado cierra la DB incluso si falla su arranque. No se inicia V2 automáticamente.

Pruebas: `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/cognition-v2-workers.test.ts` con PostgreSQL sintético 17.9 local: 3/3 PASS, 0 omitidos. Incluye reintento por tenant, caducidad, salud HTTP, recuperación de recibo, y conexiones API/worker separadas a Postgres. La prueba de restart reinicia los bucles en el mismo proceso; no simula SIGKILL ni un despliegue real. TypeScript raíz `tsc --noEmit`: PASS.

Antes de añadir el tercer caso focal, la suite `tests/cognition-v2-*.test.ts` sobre este patchset con Postgres 17.9 en loopback y base nueva: 64/64 PASS, 0 omitidos. Los seis casos nativos anteriormente omitidos incluyen concurrencia y RLS con rol restringido. El caso adicional pasó posteriormente por separado. El servidor es temporal y su cluster vive bajo `artifacts/`, no contiene datos reales. RLS global compartida sigue bloqueada; la prueba aislada no certifica HTTP, voz o workers completos con rol restringido.

Seguimiento posterior: health comprueba también inbox `retry`/`dead_letter` de los proyectores cognitivo y de auditoría, y elimina heartbeats caducados; prueba focal worker con Postgres 3/3 PASS y typecheck raíz PASS. Esto no certifica backlog completo, trabajos Slow ni indisponibilidad externa.

No se ha validado supervisión en una plataforma de producción ni la recuperación tras muerte del sistema operativo. Mantener NO_GO de C15. No se ha ejecutado el gate general en este patchset.
