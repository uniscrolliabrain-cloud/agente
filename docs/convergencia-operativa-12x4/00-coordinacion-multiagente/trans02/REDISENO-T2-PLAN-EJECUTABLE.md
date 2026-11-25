# T2 — entrada consolidada de ejecución candidata
No sustituye autorización founder ni gate. Leer T1-CIERRE y T2-M1-PATCHSETS, T2-P05-P08, T2-P09-P14. En conflicto prevalece esta consolidación. Historial intacto. NO_GO / NOT_RUN.
## Orden y ownership
M1: P01 selector (Trans01 composition reservation) y P10 preflight RLS sin activar shared; P03 contratos/evidence antes de P02 snapshots; P04 admission después P03; P05 H02 y P06 JEV después P04. P09 fixtures antes de integración. M2: P07/P08, P11/P12, P13 y owner real P10 únicamente tras M1 gate. M3 P14. Cada grupo scaffold→coding→reaudit→hardening; no avanzar con gate rojo. Dependencias externas bloquean solo el wiring afectado, no autorizan mock PASS.
## Correspondencia histórica por descripción
Plan C01 selector→P01; C02 bridge→P04; C03 queue→P04; C04 lanes/JEV→P06; C05 scorer/ledger/persona→P02/P01; C06 receipts→P03/P07/P08/P11/P12; C07 fixtures/owner→P09/P10; C08 cyber/gestoría/recompile→P11/P12/P13. Evaluación C01 selector P01, C02 bridge P04, C03 H02 P05, C04 JEV/persona P06/P01, C05 WhatsApp P07, C06 Google P08, C07 fixtures P09, C08 owner P10, C09 cyber P11, C10 observability P05, C11 gestoría P12, C12 recompile P13, C13 E2E P14, C14 cross audit P14, C15 hardening P14. Gate cognition Cxx es tercera taxonomía, no renumerar.
## Hunks adicionales candidatos
P03 presenter: tras regex cursor, if (BigInt(after) > 9223372036854775807n) throw Error("INVALID_CURSOR"); adaptar nombre real y error HTTP. Graph: resolver kind/revision exacta, edge solo después de ambos nodos; no aceptar latest sustituto.
P04 slow-observation.ts 09c39a2296efbe2db43025245fc0ba21f159468c: conservar observe(input) manual/compat y default deny; nuevo puerto interno de productor automático separado, no aceptar prompt arbitrario. Propuesta:
```ts
type ObservationGrant = Readonly<{
 tenantId:string; actorId:string; policyRevision:string; purpose:CognitiveIdentity["purpose"];
 operationId:string; sourceId:string; sourceRevision:number;
 templateVersion:string; promptDigest:string; expiresAt:string;
}>;
```
Resolver grant desde receipt persistido, no caller. Compare digest del prompt renderizado por template versionado; Date.parse finito y > now; revalidar identity/record dentro de transacción de admission. No cambiar boolean verifier a grant sin migrar callers/tests. Enqueue existente dentro de tx solo tras comprobar Store nesting; inbox+cursor+job una unidad, retry no duplica.
P03 runtime-outcome.ts 6bedfe5913b5868676aad6eff4ca0391fc492ab1: preserve fromSlowReceipt y validates digest reconstruido. No ampliar scope por cast. Nuevo verifier por familia requiere schema discriminado aprobado en packages/domain/src/runtime-outcome.ts y evidence resolver correspondiente; default deny. No business verified hasta ABI Trans01/03.
P05 H01 real Trans01 engine/observability/hooks.ts 4d2d8c68cf15f4fca3a0bf02290fedbe536f7c59 exports observeKernel, registerKernelTelemetrySink, KernelObservation (stage/status/durationMs/correlationId?/capabilityId?/errorClass?). KernelStage cerrado, no cognition stage. H02 extensión coordinada con Trans04; no cast KernelStage. Sink.record síncrono puede bloquear aunque no await: bounded enqueue en sink, no IO síncrono. H02 candidate interface P05 anterior, adapter aprobado y test de saturación; no duplicar globalMetrics.
P11 require project en composición de consumidor cognitivo, no romper relay genérico: factory interna valida callback y same Store antes de construir CyberEventRelay; no ACK si journal rollback. Lease consumer durable, check fence antes de commit/cursor; ACK externo idempotente según SDK, no prometer exactly once.
## Criterios de entrega por patchset
Archivo y símbolo, SHA pre-edit, diff mínimo, test positivo/negativo/fault, comando exacto, resultado, rollback y dependencia. Si firma o contrato no verificado: BLOCKED_CONTRACT y no aplicar. P01 AGUI precedence ADR pendiente; P05 H02 ABI pendiente; P07/P08/P12 receipt/ACL pendientes; P06 JEV consent/sandbox; P11 parent PDP/broker. No autorizar cambios en app.ts/domain sin reserva Trans01. No tocar UX/demo.
## Ejecución
pnpm typecheck; ALLOW_NETWORK=0 pnpm test:cognition-v2; ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test --test-isolation=none --test-timeout=90000 tests/trans02-*.test.ts; pnpm gate; pnpm verify:slice; pnpm gate:cognition-v2. Confirmar flags y entorno de cada script antes de ejecutar; PG restringido obligatorio para certificación. Registrar SHA/Node/backend/exit/skips. No egress real sin autorización.
## Estado
14 grupos especificados, no todos hunks completos ni ABI cerrados. T3 debe auditar contra Trans01 con rúbrica común, corregir inconsistencias y no asignar 9 por volumen. No código funcional ni tests ejecutados.
