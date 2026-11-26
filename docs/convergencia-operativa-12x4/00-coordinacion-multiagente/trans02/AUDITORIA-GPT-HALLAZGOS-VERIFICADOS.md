# Auditoría estática adicional GPT — Trans02

Fecha: 2026-11-26. Baseline fijado: `570da891f1191f6e31197e8bae61b6a7da88072d`.

Estado: DIAGNÓSTICO ESTÁTICO · NO_GO funcional. Solo hallazgos con camino concreto en el código; los ensayos son regresiones propuestas, NO ejecutadas. No se ha cambiado código, configuración, campaña canónica, documentos Astra/Codex ni arquitectura. No se reclama novedad frente a todo el archivo histórico: varios hallazgos precisan un patchset ya diseñado.

## Referencias y límites

- [README general, main fijado](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/README.md)
- [Whitepaper de producto y fundamento Trans06](https://github.com/uniscrolliabrain-cloud/agente/blob/4b2c5fd180c82d86d1e7b2cbdc148b20fcba87ed/whitepaper.md)
- [Canónica fijada](https://github.com/uniscrolliabrain-cloud/agente/tree/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4)
- [Diagnóstico Codex de esta rama](https://github.com/uniscrolliabrain-cloud/agente/blob/570da891f1191f6e31197e8bae61b6a7da88072d/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/trans02/ASTRA-AUDIT-V1/DIAGNOSTICO.md)

Fast comunica; Slow propone; JEV clasifica; kernel autoriza; runtime ejecuta. Mantener arquitectura y contratos actuales, una sola implementación por superficie. Observabilidad primero; calibración semántica, pesos, propagación y núcleo axiomático futuro quedan para evidencia del dogfooding. No iniciar otra campaña ni ejecutar patchsets aquí.

## G02-01 · Dependencia de inferencia distinta de cita declarada

**Ancla:** [apps/server/src/engine/cognition/v2/slow.ts#L105-L168](https://github.com/uniscrolliabrain-cloud/agente/blob/570da891f1191f6e31197e8bae61b6a7da88072d/apps/server/src/engine/cognition/v2/slow.ts#L105-L168); [apps/server/src/engine/cognition/v2/context.ts#L34-L55](https://github.com/uniscrolliabrain-cloud/agente/blob/570da891f1191f6e31197e8bae61b6a7da88072d/apps/server/src/engine/cognition/v2/context.ts#L34-L55).

**Evidencia estática:** Slow prepara todas las referencias del job; la salida solo debe citar un subconjunto. El commit final comprueba y persiste output.evidence, no todas las entradas efectivamente servidas. El monitor periódico no sustituye la dependencia durable. Si una entrada no citada se revoca después de publicar la card, la invalidación por evidencia no puede encontrar esa dependencia a partir de la card. Es una omisión estructural, no una fuga real acreditada.

**Prueba de regresión pendiente:** Job con A/B; mock Slow usa B pero cita A; publicar, revocar B, comprobar que la card derivada deja de servirse. Variante revocar antes del commit, sin depender del timer.

**Destino de integración:** P04/P03: conservar manifest de dependencias de inferencia y separar citas; integrar revocación existente, no nuevo grafo.

## G02-02 · Salida inválida durable se vuelve a consumir en cada reintento

**Ancla:** [apps/server/src/engine/cognition/v2/slow.ts#L115-L127](https://github.com/uniscrolliabrain-cloud/agente/blob/570da891f1191f6e31197e8bae61b6a7da88072d/apps/server/src/engine/cognition/v2/slow.ts#L115-L127); #L169-L177.

**Evidencia estática:** Se guarda raw antes de parse/validación. En siguiente claim job.output ?? lane.run reutiliza raw inválido; catch reencola hasta cinco intentos sin invalidar ese output. Para JSON no conforme pero serializable, el mismo error se repite sin nueva inferencia. El receipt raw es útil y debe conservarse; no debe confundirse con un resultado validado.

**Prueba de regresión pendiente:** Mock proveedor retorna JSON con schema incorrecto; avanzar reloj entre ticks; contar llamadas y estados. Esperar terminal explícito o política de reintento que distinga receipt raw de output utilizable; conservar evidencia.

**Destino de integración:** P04 ya separa raw/validación: añadir clasificación terminal vs retry seguro, no borrar evidencia.

## Cierre

No tests de repositorio ejecutados; sin certificación PGlite, PostgreSQL, proveedores ni integrado. Reconfirmar blobs y llamadores al alinear sobre SHA común; ejecutar prueba roja antes de modificar. Si un patchset actual ya resuelve el defecto, añadir solo regresión; no duplicar. Conservar documentos y trabajo previo. No activar producción.
