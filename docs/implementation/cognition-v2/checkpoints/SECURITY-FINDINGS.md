# Hallazgos de seguridad y arquitectura

Checkpoint UTC: 2026-11-16T13:47:34.208372+00:00. Código auditado: [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3). Base: [54b8d5407a8576459448c4d059a877297d18ca7a](https://github.com/uniscrolliabrain-cloud/agente/commit/54b8d5407a8576459448c4d059a877297d18ca7a). Evidencia local sintética; no certificación de producción.

Severidad: P0 incidente crítico; P1 bloquea aceptación/cutover; P2 limitación o riesgo que requiere cierre; P3 mantenimiento. No se confirmó P0 en la superficie inspeccionada. Esto no certifica ausencia global de vulnerabilidades. Se distinguen defectos reproducidos de funciones deshabilitadas por diseño.

## P1-01 — Delivery reutilizado entre ejecuciones

**P1.** [apps/server/src/engine/cognition/v2/context.ts:142](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/context.ts#L142)

Evidencia: ID incluye snapshot/card/revisión, no consumidor/run; runtime.ts:104–143 reutiliza snapshot y entrega contexto aun sin nueva reserva. Fixture: 3 runs, 1 ACK.

Impacto: Auditoría de entrega incompleta para el mismo actor. No se ha probado fuga entre tenants.

Corrección propuesta: Incluir consumerRef estable por run en identidad y recibo; reservar/renderizar solo contexto entregable; conservar idempotencia por run, fencing y reintentos.

## P1-02 — Reenvío de eventos privados del proveedor

**P1.** [apps/server/src/engine/cognition/v2/runtime.ts:133](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/runtime.ts#L133)

Evidencia: Callback solo excluye RUN_STARTED/RUN_FINISHED. provider.ts:51 también reenvía el resto. Fixture inyecta REASONING_MESSAGE_CONTENT: 3/3 llegan al observable público.

Impacto: Un proveedor que emita eventos de razonamiento puede exponerlos al cliente. Fixture sintética, ningún incidente con datos reales observado.

Corrección propuesta: Allowlist de TEXT_MESSAGE_START/CONTENT/END validada en frontera pública; rechazar reasoning/state/custom/tool no autorizados; tests de no divulgación y streaming.

## P1-03 — RLS compartida todavía sin certificación integral

**P1.** [apps/server/src/engine/cognition/v2/runtime.ts:65](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/runtime.ts#L65)

Evidencia: MULTI_TENANT_SHARED=true lanza COGNITION_V2_SHARED_RLS_NOT_CERTIFIED. Tests restrictivos focales cubren tablas cognitivas; no toda la aplicación, voz y bridge.

Impacto: Impide activar modo compartido; gate seguro cerrado, no fuga activa demostrada.

Corrección propuesta: Inventario completo de tablas/roles; HTTP+workers+kernel+voz+bridge bajo rol restringido; pruebas cruzadas entre empresas y actores antes de habilitar.

## P1-04 — Paridad empresarial y sustitución legacy incompletas

**P1.** [apps/server/src/engine/cognition/v2/runtime.ts:119](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/runtime.ts#L119)

Evidencia: Prompt declara ausencia de ejecución empresarial; tools=[] en línea133. Las acciones empresariales siguen en runtime V1.

Impacto: V2 no sustituye aún todo el flujo de ejecución/delegación; no apto para retirar legacy ni habilitar globalmente.

Corrección propuesta: Migrar capacidades con PDP, aprobaciones, recibos y rollback E2E; cutover gradual con métricas, luego retirada de consumidores legacy.

## P1-05 — Consumidores secundarios legacy sin recibo durable

**P1.** [apps/server/src/kernel/subscribers/audit-consumer.ts:20](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/kernel/subscribers/audit-consumer.ts#L20)

Evidencia: audit-consumer.ts:20–32 y notifications-consumer.ts:33–46 realizan escrituras fire-and-forget con catch vacío; service.ts:772–787 registra suscriptores.

Impacto: Un fallo del store puede perder una proyección secundaria aunque el evento canónico siga persistido. No equivale a pérdida del journal nuevo.

Corrección propuesta: Migrar consumidores a inbox/cursor/lease durable y reconciliación; pruebas de crash entre efecto y ACK.

## P1-06 — Egress JEV real todavía sin implementación PDP/cuota durable

**P1.** [apps/server/src/engine/cognition/v2/jev-classifier.ts:1](https://github.com/uniscrolliabrain-cloud/agente/blob/1f63fa9929a48c16f02344a0b1efa52216f2e91a/apps/server/src/engine/cognition/v2/jev-classifier.ts#L1)

Evidencia: Solo W6: contrato oficial y adaptador probado con transporte simulado; JevEgressGate obligatorio no tiene bootstrap productivo configurado.

Impacto: Bloquea activación externa y prueba de costes/consentimiento; clasificador determinista sigue operativo.

Corrección propuesta: Implementar gateway durable de grants, cuota y reconciliación; credencial y consentimiento explícito; pruebas staging. No activar por detectar una API key.

## P2-01 — ACK es recibo de consumidor servidor

**P2.** [apps/server/src/engine/cognition/v2/runtime.ts:142](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/runtime.ts#L142)

Evidencia: ACK después de persistir respuesta, antes de RUN_FINISHED. No confirma recepción en navegador ni reproducción de audio.

Impacto: No permite afirmar que el usuario recibió/escuchó la respuesta; ledger solo demuestra consumo interno.

Corrección propuesta: Tipar consumer y alcance del ACK; añadir ACK cliente si se requiere garantía de recepción, con reintento/reconciliación sin borrar conocimiento.

## P2-02 — Voz sin proveedor audiovisual operativo

**P2.** [apps/server/src/engine/voice-v2/coordinator.ts:1](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/voice-v2/coordinator.ts#L1)

Evidencia: Coordinador probado con adaptador falso; no cliente Anam/ElevenLabs ni sesión real.

Impacto: No hay garantía física de stop/playback/barge-in ni de limpieza remota de sesiones.

Corrección propuesta: Implementar adaptador desde contrato oficial, consentimiento, credenciales de prueba, callback autenticado y pruebas reales de interrupción/reaper.

## P2-03 — Presupuesto por bytes y calibración incompleta

**P2.** [apps/server/src/engine/cognition/v2/context.ts:21](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/context.ts#L21)

Evidencia: Límite conservador por UTF-8; atención y dimensiones ontológicas no calibradas con dataset empresarial/proveedor real.

Impacto: Eficiencia cognitiva/costes/TTFT p50-p99 no demostrados en carga real.

Corrección propuesta: Tokenización del proveedor cuando proceda, métricas sin PII, evaluación de calidad, coste y latencia por tenant y carril.

## P2-04 — Backfill limitado a referencias verificables

**P2.** [apps/server/src/engine/cognition/v2/legacy-backfill.ts:105](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/apps/server/src/engine/cognition/v2/legacy-backfill.ts#L105)

Evidencia: Resolver por defecto admite Thoughts propios y memorias ya migradas; bloquea entidades empresariales no resolubles.

Impacto: Cobertura de migración parcial, retirada V1 bloqueada; comportamiento fail-closed evita inventar procedencia.

Corrección propuesta: Resolvers versionados por dominio, export/import verificado y ensayos de rollback/recovery sin borrar V1.

## P2-05 — Pruebas browser/cobertura no operativas en entorno actual

**P2.** [package.json:1](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/package.json#L1)

Evidencia: test:browser devuelve BROWSER_UNAVAILABLE; coverage devuelve c8: not found.

Impacto: No hay evidencia actual de cobertura ni browser canónico verde.

Corrección propuesta: Restaurar dependencia justificada de coverage y Chromium permitido; rerun sin debilitar aserciones.

## P3-01 — Auditorías estáticas legacy incompatibles con parte del corte nuevo

**P3.** [scripts/audits/bridges.ts:1](https://github.com/uniscrolliabrain-cloud/agente/blob/640a55db01fc9f934bf927dec53e97035f0455f3/scripts/audits/bridges.ts#L1)

Evidencia: Contratos:6 huérfanos. Bridges:12/16. Baseline ya fallaba; deben reconciliarse marcadores/consumidores reales.

Impacto: Gate completo no verde; riesgo de ruido ocultando defectos nuevos.

Corrección propuesta: Actualizar detección con imports/wiring efectivo y retirar aliases sin uso tras verificar compatibilidad; no suprimir fallos ni añadir marcadores ficticios.

## Hallazgos previos cerrados y límites de revisión

La revisión anterior corrigió revocación antes del dispatch/admisión de lane; actor inactivo; digest RAG a igual revisión; generación RAG obsoleta; y COMMIT exitoso con ACK de conexión perdido (resultado desconocido, sin fingir rollback). Véase [revisión histórica](../C15/SECURITY-REVIEW.md). El checkpoint añade los defectos P1-01/P1-02 sin ocultarlos tras tests verdes. No se realizó pentest de producción, escaneo de activos externos, revisión exhaustiva de todos los middleware ni certificación independiente final.

