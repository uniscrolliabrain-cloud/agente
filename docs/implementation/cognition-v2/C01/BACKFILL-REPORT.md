# C01 — Backfill V1→V2 por planes verificables

Estado: IMPLEMENTED_LOCAL / PARTIAL_MIGRATION. No se ejecutó sobre empresas reales ni se retiró el almacenamiento V1.

## Flujo real

POST `/api/cognition-v2/migration/legacy-cards/prepare`, con sesión autenticada y `{key,afterId?,limit?}`, crea un plan durable acotado a tenant/owner antes de paginar. Devuelve ID, digest, número de entradas preparadas, bloqueos y cursor; no devuelve cuerpos privados del plan. La identidad no se acepta del body.

POST `/api/cognition-v2/migration/legacy-cards/:id/apply`, con `{planDigest}`, revalida sesión/política, integridad del plan, versión de formato/resolvedor, vigencia, fuentes y evidencias. Escribe eventos y receipts en una sola transacción. Respuesta **202 journaled** significa persistido para proyección, no entrega ni ejecución completada. Repetirlo es idempotente.

Los planes caducan y los cambios de fuente/revisión/mapping no se sobrescriben silenciosamente. La fuente y el plan se bloquean en Postgres durante aplicación. Un fallo revierte eventos, receipts y estado del plan. El constructor comprueba que journal y store de registros comparten la transacción real, incluso usando TenantScopedStore.

## Conservación y aislamiento

- `cognition_v2_import_plans` guarda la página preparada; `cognition_v2_import_receipts` conserva metadata V1, digest de origen/destino, versiones, fecha real de importación, IDs y procedencia. Las tablas se incluyen en RLS.
- Se conservan estado/scope/modelo/atención V1 como metadata histórica, sin volverlos permisos ni confianza verificada.
- Las tarjetas consumidas recuperan conocimiento activo; la entrega/ACK no se inventa. Expired/superseded y las fechas se mantienen.
- Una decision legacy queda epistemic=unknown; no se convierte en aprobación.
- Se resuelve tanto thoughtId principal como todos los Thoughts adicionales, memorias y entidades declaradas. Si cualquiera falta o está revocada, no se aplica la página.
- La clave canónica ahora incluye tenant **y owner** más ID legacy; dos usuarios con el mismo ID no colisionan.
- El resolvedor predeterminado verifica Thoughts inmutables por tenant/owner y memorias cognitivas ya autorizadas. Entidades u otros tipos requieren un adaptador de dominio autorizado; mientras tanto aparecen como UNRESOLVED_EVIDENCE. No se adivina su revisión.
- Source rows V1 no se modifican ni borran. El nuevo journal registra la fecha de importación; la tarjeta conserva la fecha de conocimiento original.

## Evidencia

Primer foco unitario: 3/3 PASS. Integración HTTP+backfill: 4/4 PASS. Foco nativo/RLS/migración/HTTP: 8/8 PASS. Se comprobó que otro tenant y otro usuario del mismo tenant no pueden aplicar un plan conocido; dos conexiones nativas producen un solo evento/receipt; un crash revierte la página; datos alterados, fuentes revocadas, caducidad y conflictos de revisión fallan cerrados.

Suite V2 de la ola: 42/42 PASS con Postgres sintético, 138.268 s. Tras explicitar versiones/digest de mapping, foco de backfill: 5/5 PASS. El gate completo se ejecutará al integrar en la rama principal de implementación; no se atribuye al snapshot W3.

## Límites

Esto es un backfill paginado reanudable por planes, no un snapshot global consistente de toda una empresa. Antes del cutover se necesita reconciliar cambios concurrentes/repetir pases o una ventana gobernada. Persisten integración completa de resolutores de dominio, migración de memorias V1, política/ACL completas, retención de planes/receipts, inventario a escala y retiro de lectores legacy. El modo compartido global continúa bloqueado aunque las políticas de estas tablas pasen con rol restringido.
