# Auditoría estática adicional GPT — Trans03

Fecha: 2026-11-26. Baseline fijado: `81b69306413b468bea4ee98c706b8b3e6cbdd9a3`.

Estado: DIAGNÓSTICO ESTÁTICO · NO_GO funcional. Solo hallazgos con camino concreto en el código; los ensayos son regresiones propuestas, NO ejecutadas. No se ha cambiado código, configuración, campaña canónica, documentos Astra/Codex ni arquitectura. No se reclama novedad frente a todo el archivo histórico: varios hallazgos precisan un patchset ya diseñado.

## Referencias y límites

- [README general, main fijado](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/README.md)
- [Whitepaper de producto y fundamento Trans06](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/whitepaper.md)
- [Canónica fijada](https://github.com/uniscrolliabrain-cloud/agente/tree/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4)
- [Diagnóstico Codex de esta rama](https://github.com/uniscrolliabrain-cloud/agente/blob/81b69306413b468bea4ee98c706b8b3e6cbdd9a3/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans03/ASTRA-AUDIT-V1/DIAGNOSTICO.md)

Fast comunica; Slow propone; JEV clasifica; kernel autoriza; runtime ejecuta. Mantener arquitectura y contratos actuales, una sola implementación por superficie. Observabilidad primero; calibración semántica, pesos, propagación y núcleo axiomático futuro quedan para evidencia del dogfooding. No iniciar otra campaña ni ejecutar patchsets aquí.

## G03-01 · Snapshot de voz autorizado no es necesariamente el que consume Fast

**Ancla:** [apps/server/src/engine/voice-v2/fast-adapter.ts#L11-L30](https://github.com/uniscrolliabrain-cloud/agente/blob/81b69306413b468bea4ee98c706b8b3e6cbdd9a3/apps/server/src/engine/voice-v2/fast-adapter.ts#L11-L30); [apps/server/src/engine/cognition/v2/runtime.ts#L100-L127](https://github.com/uniscrolliabrain-cloud/agente/blob/81b69306413b468bea4ee98c706b8b3e6cbdd9a3/apps/server/src/engine/cognition/v2/runtime.ts#L100-L127); [apps/server/src/engine/voice-v2/coordinator.ts#L174-L205](https://github.com/uniscrolliabrain-cloud/agente/blob/81b69306413b468bea4ee98c706b8b3e6cbdd9a3/apps/server/src/engine/voice-v2/coordinator.ts#L174-L205).

**Evidencia estática:** Adapter comprueba input.contextSnapshotId pero no lo transmite al chat; el runtime prepara contexto por consulta. El coordinador comprueba vigencia del snapshot original, no el snapshot efectivamente utilizado. No presupone que ambos deban ser idénticos: el defecto es que el binding declarado no acredita el contexto servido.

**Prueba de regresión pendiente:** Con dos snapshots válidos distintos, capturar snapshot seleccionado realmente por runtime y comprobar binding de receipt/epoch y revocación de ese contexto; mismo Fast para voz y chat.

**Destino de integración:** P11/C13 con Trans02: binding explícito al snapshot realmente servido, sin segundo motor.

## G03-02 · Resend no valida el tipo de id remoto ni de error

**Ancla:** [packages/integrations/src/resend.ts#L144-L158](https://github.com/uniscrolliabrain-cloud/agente/blob/81b69306413b468bea4ee98c706b8b3e6cbdd9a3/packages/integrations/src/resend.ts#L144-L158).

**Evidencia estática:** El cast TypeScript no valida JSON. HTTP 200 con {id:123} ejecuta trim sobre número y lanza TypeError en lugar de OutcomeUnknownError; HTTP 400 con {message:{}} ejecuta slice sobre objeto. La categoría contractual se pierde aunque el envío pudiera haberse aceptado. No se afirma que Resend real haya emitido ese payload.

**Prueba de regresión pendiente:** Fetch doble 200 id numérico, 200 id vacío, 200 id válido, 400 message objeto. Assert unknown para éxito ilegible, rechazo normalizado para 4xx y aceptación solo con id string no vacío; sin llamada real.

**Destino de integración:** P01/P04 patrón de validación/redacción existente, extender a Resend sin alterar proveedor.

## Cierre

No tests de repositorio ejecutados; sin certificación PGlite, PostgreSQL, proveedores ni integrado. Reconfirmar blobs y llamadores al alinear sobre SHA común; ejecutar prueba roja antes de modificar. Si un patchset actual ya resuelve el defecto, añadir solo regresión; no duplicar. Conservar documentos y trabajo previo. No activar producción.
