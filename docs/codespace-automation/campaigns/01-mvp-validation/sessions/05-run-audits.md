# Sesion 05 - Ejecutar auditorias

**Estado:** ejecutada; tres gates fallidos.

- `audit:layers`: 0 violaciones.
- `audit:bridges`: 16/16 cableados.
- `audit:console`: 21 ocurrencias en 206 ficheros; el script termino correctamente.
- `audit:tenant-default`: 60 permitidas, 16 prohibidas.
- `audit:idempotency`: 90 duplicadas, 10 huerfanas y 67 repetidas.
- `audit:contracts`: 82 OK, 14 pending y 154 huerfanos.
- Ver [informe de auditorias](../../../deliverables/04-informe-auditorias.md).

**Siguiente paso:** clasificar findings reales frente a falsos positivos y reparar las marcas/contracts antes de reactivar el gate estricto en una rama verde.
