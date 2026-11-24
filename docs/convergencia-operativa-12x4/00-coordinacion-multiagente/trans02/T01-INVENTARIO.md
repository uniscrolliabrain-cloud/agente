# T01 · Inventario y reconciliación de Cognition

Base de trabajo `217ef7423853a5f9d68eada476a4cf45427ac2f1`. Campaña de referencia `52dcd7ace6b88f4e33ec9c828cfbc4093766dade`. Leídos en la rama de campaña el contrato transversal, el wiring y el registro de pendientes. La documentación empresarial vive bajo `apps/ui-lab/docs/agntia-demo/`. El escenario empresarial exige que una señal observada conserve su procedencia y su alcance hasta llegar a LAIA. La operación simulada y la operación real deben conservar identidades y recibos distintos.

## Referencias congeladas y equivalencia

Comparación con la base de trans02. Los conteos de equivalencia son de `git cherry`; la equivalencia semántica requiere revisión del contrato y tests.

| Referencia origin | SHA | Merge base | Commits propios | Equivalentes por patch-id |
|---|---|---|---:|---:|
| `campaign/c00-preflight` | `ad8a34a6a952b4d40d5a940b034da15d3f9cb4f0` | `3023637d72994460b1aa4742f558557ec0c69922` | 1 | 0 |
| `campaign/c01-arqueologia` | `28bb383e6f0595a7d4f97062df77d76f88abaff4` | `3023637d72994460b1aa4742f558557ec0c69922` | 1 | 0 |
| `campaign/c02-baseline-movil` | `a61978e349e94cc54281e0a23a22eb61dfe6a9fd` | `3023637d72994460b1aa4742f558557ec0c69922` | 23 | 0 |
| `campaign/c03-cognition` | `add8798b71a6a4cb16855d76085e84d737cd5117` | `3023637d72994460b1aa4742f558557ec0c69922` | 1 | 0 |
| `campaign/c04-conversacion-universal` | `c8293e8bb56f3a549e64affc336c139b61979447` | `3023637d72994460b1aa4742f558557ec0c69922` | 11 | 0 |
| `feat/continuacion-c05-voz-cognition-v2` | `54f7fbfe99c20559049c0af585d70c475e306e32` | `3023637d72994460b1aa4742f558557ec0c69922` | 84 | 0 |
| `audit/c06-p03a-slow-observation-20261123` | `6d4e7eb3ef4a6b83770ef476820006e41fd53315` | `3023637d72994460b1aa4742f558557ec0c69922` | 65 | 0 |
| `audit/cognition-v2-independent-20261123` | `32f20ce7bd5687be09fd7268e91c19eda54f92fd` | `3023637d72994460b1aa4742f558557ec0c69922` | 57 | 0 |
| `feat/cognition-v2-runtime-C00-C15` | `685ef3a17e77245fdb2d7b438584c237beccd91e` | `685ef3a17e77245fdb2d7b438584c237beccd91e` | 0 | 0 |
| `feat/cognition-v2-stepwise-001-504c0b5b` | `770f86e86f84cf66790884f59e2734228db9e934` | `770f86e86f84cf66790884f59e2734228db9e934` | 0 | 0 |
| `feat/cognition-v2-worker-reliability-504c0b5b` | `2b117b6fa4f030651ced611da9860dfcfdd6fd71` | `2b117b6fa4f030651ced611da9860dfcfdd6fd71` | 0 | 0 |
| `feat/cognition-v2-W4-backfill` | `88f4246e930e3cea9f96ae8be97a7f5475358804` | `11b3ebd0dfdf18ef101fa8bc22a3ba4ad4603e99` | 0 | 1 |
| `feat/cognition-v2-W5-outcomes` | `33f97608c2d62935e019e06ab38963b4fc51b9b7` | `af3b16d244b64660a28faa7d47f0b4f73edf5ec2` | 0 | 1 |
| `feat/cognition-v2-W6-jev-contract` | `1f63fa9929a48c16f02344a0b1efa52216f2e91a` | `af3b16d244b64660a28faa7d47f0b4f73edf5ec2` | 0 | 2 |

## Reconciliación

- **P02.** En esta base, `apps/server/src/agent.ts::makeRuntime` construye `ConversationAgent` para sample/local y `HttpAgent` para AG-UI remoto. `engine/conversation.ts::run` delega en Cognition V2 si el contexto de petición lo habilita. El caso AG-UI remoto pasa por otra rama de la factory; requiere política explícita y cobertura antes de cualquier cutover. `app.ts` monta `/api/cognition-v2`, conecta `slow.capture` al kernel y asigna `agent.cognitionV2`. Las acciones legadas siguen activas. Candidato de destino T02: selector y binding de `chat-agent.ts` en la rama C05, con revisión de contratos y solicitud a Trans01 por el montaje.
- **P03a.** El informe `docs/audits/c06-p03a-slow-observation-20261123/09-FINAL-REGRESSION-CI.md` registra 11/11 Slow y 0/1 HTTP, con SSE `Cannot read properties of undefined (reading 'chat')`. La rama C05 atribuye el fallo al callback extraído de CopilotKit, incorpora un caso específico (`205ee036`) y conserva el diagnóstico (`d3fa4635`). El adaptador dedicado todavía no existe en la base auditada. El test HTTP existente de esta base recorre rutas REST y procesamiento Slow. El caso histórico reproduce otra entrada, `/api/copilotkit/run`.
- **P03b.** `53b88115` agrega un observador durable desactivado en la rama C05. `54f7fbfe` cubre recuperación de la cuota en el cambio de día UTC y competencia de workers. Revisar el cursor, transacción cuota/enqueue, rollback, decisión frente a revocación y pruebas Postgres con rol restringido antes de montar ese worker. Mantener el observador desactivado hasta acordar la política y la propiedad de los recibos.
- **Conservación.** Mantener los SHA anteriores como evidencia. No cerrar ni fusionar ramas. Comparar W4/W5/W6 con af3b16d, 812ea36 y 403bc74, respectivamente, por archivos, SQL y contratos de salida antes de reusar un parche.

## Circuito comprobado por inspección

| Productor y entrada | Consumidor y salida | Estado en la base |
|---|---|---|
| `app.ts`, contexto tenant/actor y runtime | `runtime.ts::identity` valida membresía y deriva revisión de política | V2 opt-in; modo Postgres compartido cerrado por defecto |
| `runtime.ts::chat` | `context.ts::prepared`, Fast con prompt fijo LAIA y lista de herramientas vacía | El chat usa snapshot preparado. `attention.ts::select` queda fuera de ese camino |
| `attention.ts::select` y `context.ts` | Ranking y referencias autorizadas | Dos puntos de selección. Versionar y medir antes de unificarlos |
| API de Slow y `slow.ts::enqueue/tick` | Cola durable, inferencia, classifier y captura por kernel | Entrada explícita conectada. Observador automático vive en la rama C05 |
| `storage.ts` y `projector.ts::tick` | Proyección de memoria, referencias y grafo | La proyección requiere validar procedencia y scope al recuperar |
| `jev-classifier.ts` y `jev-egress.ts` | Clasificación semántica y control de salida | Mantener salida cerrada si falta credencial o política. Una evaluación semántica carece de autoridad de ejecución |
| `kernel-receipts.ts`, `runtime-outcome.ts::fromSlowReceipt` | Evidencia verificada según el tipo de recibo | Estado terminal de trabajo Slow acredita ese trabajo. Un hecho empresarial exige el recibo de su propio ejecutor |
| `context.ts::CardDeliveryLedger` | Reserva, render y acuse del servidor con fence | El acuse acredita entrega del lado servidor; recepción cliente requiere señal propia |
