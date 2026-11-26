# Auditoría estática adicional GPT — Trans01

Fecha: 2026-11-26. Baseline fijado: `77fefd2a14df40deb8ec61142b2da9c5dae38582`.

Estado: DIAGNÓSTICO ESTÁTICO · NO_GO funcional. Solo hallazgos con camino concreto en el código; los ensayos son regresiones propuestas, NO ejecutadas. No se ha cambiado código, configuración, campaña canónica, documentos Astra/Codex ni arquitectura. No se reclama novedad frente a todo el archivo histórico: varios hallazgos precisan un patchset ya diseñado.

## Referencias y límites

- [README general, main fijado](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/README.md)
- [Whitepaper de producto y fundamento Trans06](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/whitepaper.md)
- [Canónica fijada](https://github.com/uniscrolliabrain-cloud/agente/tree/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4)
- [Diagnóstico Codex de esta rama](https://github.com/uniscrolliabrain-cloud/agente/blob/77fefd2a14df40deb8ec61142b2da9c5dae38582/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/ASTRA-AUDIT-V1/DIAGNOSTICO.md)

Fast comunica; Slow propone; JEV clasifica; kernel autoriza; runtime ejecuta. Mantener arquitectura y contratos actuales, una sola implementación por superficie. Observabilidad primero; calibración semántica, pesos, propagación y núcleo axiomático futuro quedan para evidencia del dogfooding. No iniciar otra campaña ni ejecutar patchsets aquí.

## G01-01 · Anchor de auditoría y entrada no son atómicos en append

**Ancla:** [apps/server/src/kernel/audit/store-store.ts#L139-L175](https://github.com/uniscrolliabrain-cloud/agente/blob/77fefd2a14df40deb8ec61142b2da9c5dae38582/apps/server/src/kernel/audit/store-store.ts#L139-L175).

**Evidencia estática:** append cambia/inserta __audit_anchor__ y después ejecuta put(entry), sin abrir transacción propia. Fuera de una transacción externa, un fallo del segundo write deja anchor apuntando a hash sin entrada. No afirmo que todo llamador carezca de transacción.

**Prueba de regresión pendiente:** Fixture: store real, append sin transacción externa, inyectar fallo de put tras CAS; comprobar que el hash y la entrada no divergen. Control con dos append concurrentes.

**Destino de integración:** A03/E03: transacción existente, anchor y entrada como unidad; no borrar histórico.

## G01-02 · Verificación de auditoría incompleta o fail-open

**Ancla:** [apps/server/src/kernel/audit/store-store.ts#L88-L95](https://github.com/uniscrolliabrain-cloud/agente/blob/77fefd2a14df40deb8ec61142b2da9c5dae38582/apps/server/src/kernel/audit/store-store.ts#L88-L95); #L221-L264; [apps/server/src/db.ts#L119-L135](https://github.com/uniscrolliabrain-cloud/agente/blob/77fefd2a14df40deb8ec61142b2da9c5dae38582/apps/server/src/db.ts#L119-L135).

**Evidencia estática:** verifyAndAppend convierte excepción de verify en true. verify recorre páginas DESC e invierte cada página, no el conjunto; con más de una página de entradas reales, compara la parte reciente con una anterior. Tampoco verifica previousHash inicial ni compara el último hash con anchor, por lo que una cadena truncada puede ser aceptada.

**Prueba de regresión pendiente:** Pruebas: excepción de lectura impide append verificado; 1001+ entradas en orden causal; eliminación de primera/última entrada y anchor inconsistente deben detectarse; control válido. No asumir que timestamps de transacciones concurrentes equivalen a orden causal.

**Destino de integración:** E03/G01: verificar por enlaces/orden causal y anchor, distinguir corrupción de indisponibilidad.

## G01-03 · Filtros declarados no aplicados en replay SQL

**Ancla:** [apps/server/src/engine/events/sinks/store.ts#L138-L186](https://github.com/uniscrolliabrain-cloud/agente/blob/77fefd2a14df40deb8ec61142b2da9c5dae38582/apps/server/src/engine/events/sinks/store.ts#L138-L186); [apps/server/src/engine/events/bus.ts#L343-L371](https://github.com/uniscrolliabrain-cloud/agente/blob/77fefd2a14df40deb8ec61142b2da9c5dae38582/apps/server/src/engine/events/bus.ts#L343-L371).

**Evidencia estática:** pageTenant aplica sinceId, since, until y type, pero omite sourceId y projectId; replayTenant devuelve esa página directamente. El camino SQL de recent omite sinceId mientras el fallback sí lo aplica (store.ts:70–114). La paginación anterior al LIMIT ya fue corregida: no repetir ese patch.

**Prueba de regresión pendiente:** Emitir dos eventos mismo tenant/tipo, distintos source/project; pedir filtro exacto con limit=1, comprobar que solo llega el esperado. Matriz recent con sinceId SQL vs fallback; preservar semántica legacy del cursor.

**Destino de integración:** E02 ya contempla filtros; actualizar hunk contra HEAD, sin segundo bus.

## Cierre

No tests de repositorio ejecutados; sin certificación PGlite, PostgreSQL, proveedores ni integrado. Reconfirmar blobs y llamadores al alinear sobre SHA común; ejecutar prueba roja antes de modificar. Si un patchset actual ya resuelve el defecto, añadir solo regresión; no duplicar. Conservar documentos y trabajo previo. No activar producción.
