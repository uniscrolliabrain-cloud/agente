# Auditoría de contratos del dominio

> **NOTA DE VIGENCIA · 2026-11-10.** Medición 2026-11-10 en `main@2693917`: **340 contratos, 288 OK, 43 MODULE, 1 HARNESS, 2 PENDING, 0 allowlist, 6 huérfanos**; el gate sigue rojo. Las cifras del cuerpo (322/150/79) son del 8-nov.


> **Este fichero ya no es el informe.** Era una copia del audit generado el 2026-10-26 y se quedó obsoleta: en `main` convivían dos verdades sobre los mismos contratos.

El informe real lo escribe el propio audit en `artifacts/gate/audits/AUDIT_CONTRACTS.md` (fuera de git), que es el que se relee en cada ejecución:

```bash
pnpm audit:contracts
```

**Medición del 2026-11-08** (`main` = `a3faf00`): 322 contratos, 150 usados desde otro módulo, 92 sólo en el suyo, 1 sólo en harness, 0 en PENDING, 0 en allowlist y **79 sin uso y sin decisión**, que es lo que mantiene el gate en rojo.

Para revisar un caso: consumirlo de verdad, marcarlo `PENDING(motivo, fecha)` junto a su declaración, o declararlo en `scripts/audits/contracts-allowlist.json` con motivo y fecha. Las 79 decisiones abiertas están inventariadas en `limpieza-general/pendientes.md`.
