# Evidencia ejecutada

Rama Trans03, revisión `24c232c8bf8239155d9afa45a234be1a2edf322e`. Node 24.22.3 y pnpm 11.19.0, dependencias instaladas desde el lockfile congelado de esta rama.

```bash
ALLOW_NETWORK=0 corepack pnpm exec tsx --import ./tests/setup.ts --test --test-concurrency=1 --test-timeout=90000 --test-force-exit tests/whatsapp-outbound.test.ts tests/connections-adapters.test.ts
```

| Descubiertas | Aprobadas | Fallidas | Canceladas | Omitidas | TODO |
|---:|---:|---:|---:|---:|---:|
| 49 | 48 | 1 | 0 | 0 | 0 |

La aserción de connections-adapters.test.ts:186 espera un error 422 que incluya «Invalid OAuth». El adaptador conserva el 422 y devuelve «Meta rechazo el mensaje (HTTP 401)». La divergencia se reprodujo con fakeFetch. Conservar la redacción del cuerpo del proveedor y especificar una categoría estable para el rechazo. Antes de cambiar el test, verificar que los consumidores distinguen rechazo y resultado desconocido por el contrato tipado.

La selección se limita a los archivos del comando. Los circuitos completos de producción y la ejecución concurrente con dos conexiones Postgres quedan pendientes.
