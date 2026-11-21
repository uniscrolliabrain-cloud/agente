# Retención, derechos y borrado

| Superficie | Implementación observada | Pendiente antes de borrado |
|---|---|---|
| Postgres/PGlite | `db.ts`, `db-tenant.ts`: records por kind y clave tenant/owner. Stores SQL aparte en cognition/voz | Trazar relaciones y registros históricos, fijar excepciones |
| Chat, RAG, archivos y memoria | `threads-routes.ts`, `rag-routes.ts`, `files.ts`, `engine/cognition/v2/storage.ts` | Relacionar documentos, embeddings, índices, memorias derivadas, snapshots y ficheros |
| Eventos | `engine/events/retention.ts`, `retention-purge.ts`: reglas técnicas de 7 a 365 días con 90 por defecto | Verificar scheduler y ejecución real por almacén |
| Auditoría | `kernel/audit/entry.ts`: cadena con actor, owner y payload | Tratar digest como potencialmente vinculable, definir acceso y conservación con legal |
| Backups | `backup.ts`, `backup-tenant.ts`, scheduler en `index.ts` | Probar expiración y reconciliación tras restaurar, incluyendo copias externas |
| Proveedores | Google tiene revocación, las demás operaciones dependen del proveedor | Confirmar proceso por contrato, conservar evidencias mínimas y verificar recibos |

## Operación de solicitudes

Un usuario autenticado registra un tipo de derecho con referencia UUID en su tenant. El registro pasa a revisión humana. El operador de datos con acceso al almacén puede listar pendientes con `pnpm exec tsx scripts/privacy-review.ts <tenant> list`, tomar el caso con `<tenant> start <owner> <id>` y marcar `<tenant> answer <owner> <id>` después de enviar la respuesta por un canal verificado. El listado contiene identificadores internos y no se debe adjuntar a evidencias públicas.

Antes de responder, validar identidad con un canal apropiado, autoridad, alcance, responsable aplicable, plazo legal y necesidad de prórroga. Registrar por separado decisiones, fechas y justificantes en el sistema aprobado de casos. Escalar al responsable cuando intervengan datos de empresa o de terceros. El panel muestra estado y referencia. No hay exportación automatizada, ejecución de rectificación o supresión, calendario legal ni envío de respuesta. El fundador debe asignar propietario de la cola y confirmar el canal, revisión de acceso y cadencia antes de habilitar una operación real.

En shared Postgres, revisar RLS del repositorio y probar los flujos contra la configuración objetivo. La prueba local con PGlite verifica el scope de aplicación.

El backup general con base gestionada cubre ficheros y clave de sesión, mientras la recuperación de DB depende de PITR del proveedor. El backup por tenant parte de los directorios del tenant. Verificar por separado la cobertura de records, snapshots SQL y copias externas. En el store actual, `tenant_id` de records figura como campo legacy sin uso en `db.ts`, mientras `db-rls.ts` lo usa cuando shared está habilitado. Confirmar política y contexto de conexión runtime antes de certificar esta combinación.
