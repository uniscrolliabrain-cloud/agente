# Auditoría estática adicional GPT — Trans04

Fecha: 2026-11-26. Baseline fijado: `ad87862fcf976d85ac9013a8f0af6b9d0f8bb245`.

Estado: DIAGNÓSTICO ESTÁTICO · NO_GO funcional. Solo hallazgos con camino concreto en el código; los ensayos son regresiones propuestas, NO ejecutadas. No se ha cambiado código, configuración, campaña canónica, documentos Astra/Codex ni arquitectura. No se reclama novedad frente a todo el archivo histórico: varios hallazgos precisan un patchset ya diseñado.

## Referencias y límites

- [README general, main fijado](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/README.md)
- [Whitepaper de producto y fundamento Trans06](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/whitepaper.md)
- [Canónica fijada](https://github.com/uniscrolliabrain-cloud/agente/tree/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4)
- [Diagnóstico Codex de esta rama](https://github.com/uniscrolliabrain-cloud/agente/blob/ad87862fcf976d85ac9013a8f0af6b9d0f8bb245/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/trans04/ASTRA-AUDIT-V1/DIAGNOSTICO.md)

Fast comunica; Slow propone; JEV clasifica; kernel autoriza; runtime ejecuta. Mantener arquitectura y contratos actuales, una sola implementación por superficie. Observabilidad primero; calibración semántica, pesos, propagación y núcleo axiomático futuro quedan para evidencia del dogfooding. No iniciar otra campaña ni ejecutar patchsets aquí.

## G04-01 · Restore de tenant no comprueba manifiesto ni ausencia de directorios

**Ancla:** [apps/server/src/backup-tenant.ts#L60-L86](https://github.com/uniscrolliabrain-cloud/agente/blob/ad87862fcf976d85ac9013a8f0af6b9d0f8bb245/apps/server/src/backup-tenant.ts#L60-L86); #L107-L128.

**Evidencia estática:** El backup omite directorios ausentes y escribe tenantId pero no inventario/hash; restore solo usa createdAt y salta directorios ausentes. Por tanto conserva archivos actuales cuando faltaban en el backup; tampoco valida identidad declarada ni contenido. Puede informar restore completo con estado híbrido. No afirmar que el backup de Supabase esté averiado: backup.ts declara explícitamente que DB externa no está incluida.

**Prueba de regresión pendiente:** Fixture temporal: backup sin files, crear files después, restaurar y comprobar semántica explícita de ausencia; manifiesto de otro tenant o archivo alterado debe rechazarse antes de borrar. Inyectar fallo de copia y verificar recuperación; DB externa se certifica separadamente.

**Destino de integración:** P14 recuperación/gate: manifest e inventario verificables; staging y rollback existente; efectos externos apagados. No sustituir Supabase.

## G04-02 · Preflight de secretos informa incoherencias sin fallar

**Ancla:** `scripts/secrets-check.ts (bloque coherencias y process.exit final`; `blob 95f88ade73f7ab308e6c5e22a64fa2091219f04a)`.

**Evidencia estática:** El script registra coherence, pero decide salida exclusivamente por missingRequired. Con obligatorios presentes e incoherencia Google ID sin secret, imprime incoherencia y sale 0. El modo local puede ser informativo por diseño; no sirve como gate estricto sin adaptar. Ya contemplado por T04-S GitHub-first.

**Prueba de regresión pendiente:** Ejecutar fixture con obligatorios sintéticos y pareja Google incompleta; gate de perfil debe fallar, modo informativo conserva compatibilidad. Nunca usar secretos reales.

**Destino de integración:** T04-S S2: perfil estricto según campaña; conservar interfaz local y Supabase.

## Cierre

No tests de repositorio ejecutados; sin certificación PGlite, PostgreSQL, proveedores ni integrado. Reconfirmar blobs y llamadores al alinear sobre SHA común; ejecutar prueba roja antes de modificar. Si un patchset actual ya resuelve el defecto, añadir solo regresión; no duplicar. Conservar documentos y trabajo previo. No activar producción.
