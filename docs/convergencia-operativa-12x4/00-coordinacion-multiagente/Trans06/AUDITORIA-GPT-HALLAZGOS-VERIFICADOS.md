# Auditoría estática adicional GPT — Trans06

Fecha: 2026-11-26. Baseline fijado: `bb1802d06658605bbfe07d7f09a1f320500f1ac2`.

Estado: DIAGNÓSTICO ESTÁTICO · NO_GO funcional. Solo hallazgos con camino concreto en el código; los ensayos son regresiones propuestas, NO ejecutadas. No se ha cambiado código, configuración, campaña canónica, documentos Astra/Codex ni arquitectura. No se reclama novedad frente a todo el archivo histórico: varios hallazgos precisan un patchset ya diseñado.

## Referencias y límites

- [README general, main fijado](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/README.md)
- [Whitepaper de producto y fundamento Trans06](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/whitepaper.md)
- [Canónica fijada](https://github.com/uniscrolliabrain-cloud/agente/tree/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4)
- [Diagnóstico Codex de esta rama](https://github.com/uniscrolliabrain-cloud/agente/blob/bb1802d06658605bbfe07d7f09a1f320500f1ac2/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans06/ASTRA-AUDIT-V1/DIAGNOSTICO.md)

Fast comunica; Slow propone; JEV clasifica; kernel autoriza; runtime ejecuta. Mantener arquitectura y contratos actuales, una sola implementación por superficie. Observabilidad primero; calibración semántica, pesos, propagación y núcleo axiomático futuro quedan para evidencia del dogfooding. No iniciar otra campaña ni ejecutar patchsets aquí.

## G06-01 · Append de Thought no es idempotente

**Ancla:** [apps/server/src/kernel/graph/store-store.ts#L126-L156](https://github.com/uniscrolliabrain-cloud/agente/blob/bb1802d06658605bbfe07d7f09a1f320500f1ac2/apps/server/src/kernel/graph/store-store.ts#L126-L156); [apps/server/src/kernel/graph/in-memory-store.ts#L49-L62](https://github.com/uniscrolliabrain-cloud/agente/blob/bb1802d06658605bbfe07d7f09a1f320500f1ac2/apps/server/src/kernel/graph/in-memory-store.ts#L49-L62).

**Evidencia estática:** Ambos stores hacen put/set por id y push del id en thoughtIds sin comprobar repetición. Mismo Thought válido en turno abierto dos veces aumenta contador y duplica referencias (fallback thoughtsOf recorre array). Distinto contenido mismo id puede sobreescribir el Thought. La carrera de escritores requiere prueba PG separada; no afirmo pérdida observada.

**Prueba de regresión pendiente:** Append del mismo objeto dos veces: una referencia, mismo contenido; mismo id con contenido diferente: conflicto explícito, no overwrite. Paridad memoria/persistente y prueba PG con dos escritores.

**Destino de integración:** P01/P06 Trans06 con propietario Trans01 kernel: identidad idempotente, lock/CAS del turno según puerto existente, sin nuevo store.

## G06-02 · Cierre por quiescencia usa un instante antiguo

**Ancla:** [apps/server/src/kernel/graph/store-store.ts#L214-L244](https://github.com/uniscrolliabrain-cloud/agente/blob/bb1802d06658605bbfe07d7f09a1f320500f1ac2/apps/server/src/kernel/graph/store-store.ts#L214-L244).

**Evidencia estática:** closeTurn calcula wait desde lectura inicial, espera y relee turno en transacción; no reevalúa quiescentAt actualizado antes de cerrar. Si append ocurre durante la espera, el turno puede cerrarse antes del intervalo desde última actividad. Es una carrera deducible, no observada en ejecución.

**Prueba de regresión pendiente:** Reloj controlado: turno con quiescenceMs, iniciar closeTurn y append durante espera; comprobar que cierre solo procede tras intervalo desde última actividad, con comprobación bajo misma frontera de concurrencia. No cambiar cierres explícitos.

**Destino de integración:** P01/P09 Trans06 + Trans01: revalidar quiescencia, preservar orden causal y límites.

## Cierre

No tests de repositorio ejecutados; sin certificación PGlite, PostgreSQL, proveedores ni integrado. Reconfirmar blobs y llamadores al alinear sobre SHA común; ejecutar prueba roja antes de modificar. Si un patchset actual ya resuelve el defecto, añadir solo regresión; no duplicar. Conservar documentos y trabajo previo. No activar producción.
