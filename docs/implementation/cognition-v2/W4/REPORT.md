# W4 — Migración verificable, sin pérdida silenciosa

Preparada en un worktree aislado desde 11b3ebd mientras el gate W3 validaba su fuente congelada. Base de pruebas Postgres separada (`cognition_v2_w4`) para no alterar las políticas del gate W3.

Código: LegacyCardBackfill, resolvedor predeterminado autorizado, planes/receipts versionados, transacción común, rutas prepare/apply autenticadas, claves owner+tenant y 19 tablas incluidas en el catálogo de RLS. [Informe detallado](../C01/BACKFILL-REPORT.md).

Validación local: suite V2 42/42 PASS, foco nativo/HTTP 8/8 PASS, foco de integridad/versionado 5/5 PASS; typecheck raíz exit 0 tras completar enlaces locales de dependencias del worktree. El primer typecheck del worktree falló por ausencia de node_modules de apps/web y apps/worker; no era un error de tipos de producto. No se instalaron ni modificaron dependencias de la rama que ejecutaba W3.

No se borran fuentes, no se aplica a clientes reales ni se hace push/merge/deploy. Pendiente gate completo tras integrar este patchset. La resolución de ontología ya está aprobada; no se usa como motivo para detener migraciones independientes.
