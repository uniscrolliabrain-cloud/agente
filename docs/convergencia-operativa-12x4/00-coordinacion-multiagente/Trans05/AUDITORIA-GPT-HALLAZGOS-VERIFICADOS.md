# Auditoría estática adicional GPT — Trans05

Fecha: 2026-11-26. Baseline fijado: `48ee6dfe72b53a8cc923ec944e579eedf8db22fc`.

Estado: DIAGNÓSTICO ESTÁTICO · NO_GO funcional. Solo hallazgos con camino concreto en el código; los ensayos son regresiones propuestas, NO ejecutadas. No se ha cambiado código, configuración, campaña canónica, documentos Astra/Codex ni arquitectura. No se reclama novedad frente a todo el archivo histórico: varios hallazgos precisan un patchset ya diseñado.

## Referencias y límites

- [README general, main fijado](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/README.md)
- [Whitepaper de producto y fundamento Trans06](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/whitepaper.md)
- [Canónica fijada](https://github.com/uniscrolliabrain-cloud/agente/tree/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4)
- [Diagnóstico Codex de esta rama](https://github.com/uniscrolliabrain-cloud/agente/blob/48ee6dfe72b53a8cc923ec944e579eedf8db22fc/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans05/ASTRA-AUDIT-V1/DIAGNOSTICO.md)

Fast comunica; Slow propone; JEV clasifica; kernel autoriza; runtime ejecuta. Mantener arquitectura y contratos actuales, una sola implementación por superficie. Observabilidad primero; calibración semántica, pesos, propagación y núcleo axiomático futuro quedan para evidencia del dogfooding. No iniciar otra campaña ni ejecutar patchsets aquí.

## G05-01 · Score de consulta modifica contenido de evento con identidad estable

**Ancla:** [apps/server/src/engine/cognition/v2/rag.ts#L18-L45](https://github.com/uniscrolliabrain-cloud/agente/blob/48ee6dfe72b53a8cc923ec944e579eedf8db22fc/apps/server/src/engine/cognition/v2/rag.ts#L18-L45); [apps/server/src/engine/cognition/v2/storage.ts#L71-L78](https://github.com/uniscrolliabrain-cloud/agente/blob/48ee6dfe72b53a8cc923ec944e579eedf8db22fc/apps/server/src/engine/cognition/v2/storage.ts#L71-L78).

**Evidencia estática:** id RAG deriva de fuente, fragmento y texto; payload incluye signals.relevance derivado de hit.score, no de identidad. Dos consultas al mismo fragmento con scores distintos dentro de [0,1] generan mismo id de evento y distinto digest; sink rechaza EVENT_ID_CONFLICT. También policyRevision participa en payload pero no id. P08 Trans02 ya anticipa la familia; no crear almacenamiento paralelo.

**Prueba de regresión pendiente:** Doble RAG con misma fuente/revisión/indexedAt/text/id y scores 0.2/0.9; prepare dos veces bajo misma política. Ambas deben servir el conocimiento sin conflicto, atención diferente. Variante política cambiada.

**Destino de integración:** P08 Trans02 dueño de RAG; P05 Trans05 consume score contextual. Separar representación estable y atención, no calibrar aún.

## G05-02 · Recuperación por clase de memoria limita antes de filtrar la clase

**Ancla:** [apps/server/src/engine/cognition/v2/memory.ts#L67-L75](https://github.com/uniscrolliabrain-cloud/agente/blob/48ee6dfe72b53a8cc923ec944e579eedf8db22fc/apps/server/src/engine/cognition/v2/memory.ts#L67-L75); [apps/server/src/engine/cognition/v2/storage.ts#L173-L180](https://github.com/uniscrolliabrain-cloud/agente/blob/48ee6dfe72b53a8cc923ec944e579eedf8db22fc/apps/server/src/engine/cognition/v2/storage.ts#L173-L180).

**Evidencia estática:** recall(kind) pide latest hasta 2000 filas de todos los tipos ordenadas por id; filtra memoryKind después. 2000 registros de otras clases con id anterior pueden ocultar una memoria solicitada. Devuelve degraded, por lo que no es falso éxito; sí cobertura insuficiente para recuperar la clase pedida. Misma familia del anchor de Astra, diferente consumidor.

**Prueba de regresión pendiente:** Corpus sintético: 2000 registros ajenos a clase y una memoria de clase pedida con id posterior; verificar consulta filtra antes de límite y mantiene degraded/truncation honesto.

**Destino de integración:** P02/P05 Trans05 + P02 Trans02: filtro tipado previo a límite en store común, sin otra memoria ni selector.

## Cierre

No tests de repositorio ejecutados; sin certificación PGlite, PostgreSQL, proveedores ni integrado. Reconfirmar blobs y llamadores al alinear sobre SHA común; ejecutar prueba roja antes de modificar. Si un patchset actual ya resuelve el defecto, añadir solo regresión; no duplicar. Conservar documentos y trabajo previo. No activar producción.
