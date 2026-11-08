# Auditoría de idempotencia

> **Este fichero ya no es el informe.** Era una copia del audit generado el 2026-10-26 y se quedó obsoleta.

El informe real lo escribe el audit en `artifacts/gate/audits/AUDIT_IDEMPOTENCY.md` y `idempotency.json` (fuera de git):

```bash
pnpm audit:idempotency
```

**Medición del 2026-11-08** (`main` = `a3faf00`): 2.007 marcas, 156 duplicadas (índice informativo), 143 repetidas en el mismo fichero (índice informativo), 0 huérfanas y **0 bloques pegados dos veces**.

Los cinco casos de doble pegado estaban revisados y fechados en `scripts/audits/idempotency-allowlist.json` desde el 2026-10-28, pero sus rutas usaban separadores de Windows (`apps\\server\\...`) y la comparación era exacta, así que no casaban con la ruta POSIX del barrido y el audit los seguía tratando como defectos. Se normalizan al leer la allowlist (`ALLOWLIST_PATH_SEPARATORS_V1`).
