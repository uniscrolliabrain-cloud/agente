# W4 — Migración verificable, sin pérdida silenciosa

Preparada en un worktree aislado desde 11b3ebd mientras el gate W3 validaba su fuente congelada. Base de pruebas Postgres separada (`cognition_v2_w4`) para no alterar las políticas del gate W3.

Código: LegacyCardBackfill, resolvedor predeterminado autorizado, planes/receipts versionados, transacción común, rutas prepare/apply autenticadas, claves owner+tenant y 19 tablas incluidas en el catálogo de RLS. [Informe detallado](../C01/BACKFILL-REPORT.md).

Validación local: suite V2 42/42 PASS, foco nativo/HTTP 8/8 PASS, foco de integridad/versionado 5/5 PASS; typecheck raíz exit 0 tras completar enlaces locales de dependencias del worktree. El primer typecheck del worktree falló por ausencia de node_modules de apps/web y apps/worker; no era un error de tipos de producto. No se instalaron ni modificaron dependencias de la rama que ejecutaba W3.

No se borran fuentes, no se aplica a clientes reales ni se hace push/merge/deploy. Pendiente gate completo tras integrar este patchset. La resolución de ontología ya está aprobada; no se usa como motivo para detener migraciones independientes.

Gate completo ejecutado tras integración en af3b16d: **832 tests, 815 PASS, 0 FAIL/cancelados, 12 skip y 5 TODO**, 826.5 s total. **8/10** controles: siguen fallando bridges 12/16 y los mismos seis contratos huérfanos; typecheck raíz/worker y cinco auditorías pasan. C15 conserva NO_GO. No se atribuye esta tanda a patchsets posteriores.
