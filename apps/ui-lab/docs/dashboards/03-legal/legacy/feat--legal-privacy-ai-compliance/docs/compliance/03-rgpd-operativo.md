# Campaña 03 — RGPD operativo

## Meta
Hacer ejercitables derechos y políticas de retención con runtime determinista, no mediante prompts LLM.

## Fases
1. **Sujetos y alcance**: distinguir datos de cuenta del owner, empleados, invitados, contactos/lead y terceros en datos de cliente. Verificar identidad, autoridad y rol de AgntiaPro antes de actuar.
2. **Solicitudes**: modelo tipado de solicitud (tipo, sujeto, tenant, responsable, verificación, plazos, estados, decisiones, evidencia). No permitir al usuario de un tenant borrar datos de otro.
3. **Exportación**: export tenant-scoped en formato estructurado legible, con filtrado por identidad y autorización; proteger descarga, expiración y registro.
4. **Rectificación/supresión**: orquestar jobs idempotentes y reintentables en Postgres, memorias, RAG/embeddings, ficheros, snapshots, eventos, índices, cache, proveedores y backups según obligaciones/excepciones. Registrar tombstones y restricciones de conservación.
5. **Retención**: tabla por categoría/finalidad; scheduler, dry-run, purga y verificación; auditar `engine/events/retention.ts`, backups y hash-chain. Hash o seudónimo NO equivalen automáticamente a anonimización.
6. **Otros derechos**: acceso, limitación, oposición y decisiones automatizadas cuando aplique; respuesta asistida al responsable, sin borrado automático indiscriminado.
7. **Brechas**: procedimiento de detección, evaluación, contención, documentación y notificación con plazos legales cuando corresponda; pruebas de restauración.

## Contratos sugeridos (adaptar a existentes)
`DataSubjectRequest`, `DataExportJob`, `ErasurePlan`, `RetentionRule`, `ProviderDeletionReceipt`; Zod, tenantId, correlationId, actorId, timestamps, estados cerrados. No añadir tablas sin revisar schema existente.

## Pruebas
Acceso cruzado denegado; idempotencia; reintentos; datos residuales; backup restore; proveedores fallidos; auditoría sin PII; rechazo por permisos.

## Entregables
`inventario/RETENCION-Y-BORRADO.md`, `reports/CAMPANA-03-REPORTE.md`, runbook de derechos, evidencias de pruebas. Pendientes externos y excepciones jurídicas documentadas.

## Aceptación
Cada tipo de solicitud tiene proceso operativo y evidencias; el sistema no promete borrado instantáneo universal si existen retenciones legítimas o backups sujetos a ciclo.
