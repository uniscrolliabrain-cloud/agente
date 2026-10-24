# Auditoria de idempotencia

> Generado por `scripts/audits/idempotency.ts` el 2026-10-03T15:43:49.518Z.

- Ficheros revisados: **284**
- Marcas encontradas: **535**
- Marcas unicas: **432**
- Marcas duplicadas con cuerpo distinto: **65**
- Marcas huerfanas (sin codigo real debajo): **2**
- Marcas repetidas en el mismo fichero: **53**

## Duplicadas con cuerpo distinto

La misma marca aparece en varios sitios con contenido distinto. Una de las dos aplicaciones puede ser erronea.

| Marca | Fichero:linea | Hash cuerpo |
|---|---|---|
| `APP_TENANT_DB_V1` | `apps\server\src\app.ts:17` | 838cc37fb323e104 |
| `APP_TENANT_DB_V1` | `apps\server\src\app.ts:66` | 78feba17f4ddb885 |
| `SERVICE_TENANT_RESOLVER_WIRE_V1` | `apps\server\src\app.ts:48` | e90b22cf31808909 |
| `SERVICE_TENANT_RESOLVER_WIRE_V1` | `apps\server\src\app.ts:140` | a51ad35f3d5dde48 |
| `ENGINE_TENANT_V1` | `apps\server\src\app.ts:52` | 3bebc31dccf80e3b |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:73` | a0e5c80b3c88f7e5 |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:129` | bb7f84da2fd4cc6e |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:160` | 0a76c6525d209a11 |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:211` | 147f11527faff0ce |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\tenant.ts:1` | b7ced222c76d3e96 |
| `POLICY_EARLY_V1` | `apps\server\src\app.ts:72` | 4f42b08795433e39 |
| `POLICY_EARLY_V1` | `apps\server\src\app.ts:96` | 3e612b1aa004bca6 |
| `HEALTH_DEEP_V2` | `apps\server\src\app.ts:262` | fa19ebb111ec5f95 |
| `HEALTH_DEEP_V2` | `apps\server\src\app.ts:266` | 50d38c3d34692d5c |
| `SIGNUP_RATE_LIMIT_V1` | `apps\server\src\auth-signup.ts:39` | 67a2bd22c6ec98a7 |
| `SIGNUP_RATE_LIMIT_V1` | `apps\server\src\auth-signup.ts:47` | b467a218d7f4acbc |
| `RUNTIME_TENANT_V1` | `apps\server\src\engine\agents\runtime.ts:10` | 73733152e3ca22ea |
| `RUNTIME_TENANT_V1` | `apps\server\src\engine\agents\runtime.ts:25` | 2a7854d832e09d08 |
| `GRAPH_RESOLVER_WIRE_V1` | `apps\server\src\engine\business\graph.ts:61` | 3ab6c9d117b3fc56 |
| `GRAPH_RESOLVER_WIRE_V1` | `apps\server\src\engine\business\graph.ts:65` | c533f3c9f239735b |
| `BUSINESS_SCHEMA_WIRE_V2` | `apps\server\src\engine\business\graph.ts:63` | 80b4cc15233254ae |
| `BUSINESS_SCHEMA_WIRE_V2` | `apps\server\src\engine\business\graph.ts:181` | a6c26bc3904f8bd8 |
| `BUSINESS_GRAPH_VERSION_V1` | `apps\server\src\engine\business\graph.ts:93` | 458076ddc515a731 |
| `BUSINESS_GRAPH_VERSION_V1` | `apps\server\src\engine\business\graph.ts:132` | 882994f6938136f0 |
| `BUSINESS_GRAPH_VERSION_V1` | `apps\server\src\engine\business\graph.ts:145` | 1e7a00639b72e8af |
| `CAPABILITY_REGISTRY_V1` | `apps\server\src\engine\capabilities\registry.ts:1` | 33ec34f5b1cdb9e3 |
| `CAPABILITY_REGISTRY_V1` | `apps\server\src\engine\service.ts:79` | a1f247354a577a8d |
| `CAPABILITY_REGISTRY_V1` | `apps\server\src\engine\service.ts:170` | a7b2d7356b8a8914 |
| `CONTEXT_BUDGET_V1` | `apps\server\src\engine\context\budget.ts:1` | 170528f19d8b239f |
| `CONTEXT_BUDGET_V1` | `apps\server\src\engine\context\engine.ts:36` | 3a4258d551ca4643 |
| `KERNEL_PROMOTER_IMPORT_V1` | `apps\server\src\engine\conversation.ts:14` | 80a92948e67acb2f |
| `KERNEL_PROMOTER_IMPORT_V1` | `apps\server\src\engine\model.ts:10` | 77c31aa64a3a4643 |
| `AGENT_RUNTIME_WIRE_V2` | `apps\server\src\engine\conversation.ts:50` | c7d55748d2e13c4c |
| `AGENT_RUNTIME_WIRE_V2` | `apps\server\src\engine\conversation.ts:73` | 12ba7518494e4dac |
| `VIEWS_READ_WIRE_V1` | `apps\server\src\engine\conversation.ts:85` | a0073b3db5936651 |
| `VIEWS_READ_WIRE_V1` | `apps\server\src\engine\conversation.ts:95` | ddeeb01795072b0f |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:110` | 4fa5f134908d64ed |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:635` | 0a924b8738b51c2d |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:655` | 396719d8a3ca89ba |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\model.ts:72` | ad1942d90695bd2e |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\model.ts:525` | 58ae01a51619ff39 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\service.ts:1842` | 3ab7c0b82ce58e28 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\sop-executor.ts:134` | 5328598d0de0f838 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\sop-executor.ts:163` | 74f92dfad74c41b6 |
| `ROLE_PROMPT_V2` | `apps\server\src\engine\conversation.ts:489` | 5940f67351504a46 |
| `ROLE_PROMPT_V2` | `apps\server\src\engine\model.ts:402` | 117b72d8feef71cb |
| `KERNEL_FAST_RESPONSE_V1` | `apps\server\src\engine\conversation.ts:539` | c30791258ff99577 |
| `KERNEL_FAST_RESPONSE_V1` | `apps\server\src\engine\conversation.ts:639` | 4a117ea86672edb4 |
| `KERNEL_PROMOTE_PERSIST_V1` | `apps\server\src\engine\conversation.ts:613` | 7d4cbb7583b66cc6 |
| `KERNEL_PROMOTE_PERSIST_V1` | `apps\server\src\engine\service.ts:1808` | fd7746e62e674b7d |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts:27` | 504614834baf72f8 |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts:71` | d66bc1f71f66891c |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts:90` | fff740b9eb00bb5c |
| `VERIFICATION_EVENT_V1` | `apps\server\src\engine\events\schemas.ts:138` | 08c12161dd255ca9 |
| `VERIFICATION_EVENT_V1` | `apps\server\src\engine\events\types.ts:42` | bba8f658d840bfca |
| `GUARDRAILS_V1` | `apps\server\src\engine\guardrails\service.ts:1` | bce2c20d708f96d0 |
| `GUARDRAILS_V1` | `apps\server\src\engine\service.ts:75` | 1f6c607605e97fb9 |
| `GUARDRAILS_V1` | `apps\server\src\engine\service.ts:162` | 484fd59285062c01 |
| `HANDOFF_SERVICE_V1` | `apps\server\src\engine\handoff\service.ts:2` | e1da5c636b6e1301 |
| `HANDOFF_SERVICE_V1` | `apps\server\src\engine\service.ts:91` | c6a048accc0565db |
| `HANDOFF_SERVICE_V1` | `apps\server\src\engine\service.ts:178` | dab61fca6f617faf |
| `LEARNING_OBSERVER_V1` | `apps\server\src\engine\learning\observer.ts:2` | 98862962589ce015 |
| `LEARNING_OBSERVER_V1` | `apps\server\src\engine\service.ts:98` | 4e5aa52394e10400 |
| `LEARNING_OBSERVER_V1` | `apps\server\src\engine\service.ts:182` | 1711a54ae0fed4d5 |
| `LEARNING_OBSERVER_V2` | `apps\server\src\engine\learning\observer.ts:67` | 4d76da066ec2dda3 |
| `LEARNING_OBSERVER_V2` | `apps\server\src\engine\learning\observer.ts:95` | cc8430343b9c7095 |
| `BUSINESS_OS_ORCHESTRATOR_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts:3` | 6572705574942fde |
| `BUSINESS_OS_ORCHESTRATOR_V1` | `apps\server\src\engine\service.ts:89` | 025f5f79ee0c8c78 |
| `BUSINESS_OS_ORCHESTRATOR_V1` | `apps\server\src\engine\service.ts:176` | ccf5bbe061cf53f7 |
| `ORCHESTRATOR_LEARNING_WIRE_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts:17` | 53fc47accfaeab49 |
| `ORCHESTRATOR_LEARNING_WIRE_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts:94` | 8a55bf62dd51703c |
| `PLANNER_V1` | `apps\server\src\engine\planner\planner.ts:2` | 0edef434acfa9f72 |
| `PLANNER_V1` | `apps\server\src\engine\service.ts:82` | 0258bc8811525e11 |
| `PLANNER_V1` | `apps\server\src\engine\service.ts:172` | 5d070e6a75ef9b0a |
| `STATEMACHINE_ENTITY_TYPE_V1` | `apps\server\src\engine\policy\state-machine.ts:48` | d33997f652bca616 |
| `STATEMACHINE_ENTITY_TYPE_V1` | `apps\server\src\engine\policy\state-machine.ts:71` | 609ac270c3cf70bc |
| `REACTION_ENGINE_V1` | `apps\server\src\engine\reactions\engine.ts:1` | 0ac8a6fd67fe5ec4 |
| `REACTION_ENGINE_V1` | `apps\server\src\engine\service.ts:93` | 46e58c69d77c7a94 |
| `REACTION_ENGINE_V1` | `apps\server\src\engine\service.ts:180` | f40a8b805a8746f0 |
| `REACTION_EVAL_EXEC_V1` | `apps\server\src\engine\reactions\engine.ts:33` | 91c83b5c2a4c1f12 |
| `REACTION_EVAL_EXEC_V1` | `apps\server\src\engine\reactions\engine.ts:51` | 4e078274255145fc |
| `SERVICE_TENANT_DB_V1` | `apps\server\src\engine\service.ts:46` | a3966b71d19c99da |
| `SERVICE_TENANT_DB_V1` | `apps\server\src\engine\service.ts:187` | c14f1c70e16912b8 |
| `SERVICE_RATE_LIMIT_TENANT_V1` | `apps\server\src\engine\service.ts:77` | 831ba9b5f7943456 |
| `SERVICE_RATE_LIMIT_TENANT_V1` | `apps\server\src\engine\service.ts:168` | 9ddbf1fde68f5559 |
| `SERVICE_RATE_LIMIT_TENANT_V1` | `apps\server\src\engine\service.ts:815` | c770600014ba1f3f |
| `VERIFIER_V1` | `apps\server\src\engine\service.ts:86` | 5d01191a7cb59cd1 |
| `VERIFIER_V1` | `apps\server\src\engine\service.ts:174` | 2936796a4e83482c |
| `VERIFIER_V1` | `apps\server\src\engine\verification\verifier.ts:1` | 40bc03a664c670e1 |
| `EXECUTOR_WIRE_V1` | `apps\server\src\engine\service.ts:100` | 12e58e9e1f32ed65 |
| `EXECUTOR_WIRE_V1` | `apps\server\src\engine\service.ts:184` | 51f633baaddb9e92 |
| `EXECUTOR_WIRE_V1` | `apps\server\src\engine\service.ts:270` | d3f8898fea5b0641 |
| `EVENTBUS_MONITOR_EMIT_V1` | `apps\server\src\engine\service.ts:112` | c14c063c1fa0c605 |
| `EVENTBUS_MONITOR_EMIT_V1` | `apps\server\src\engine\service.ts:113` | 24ea3254d09f3f4d |
| `KERNEL_WIRE_A_V1` | `apps\server\src\engine\service.ts:131` | 6ad3979ed0a17db7 |
| `KERNEL_WIRE_A_V1` | `apps\server\src\engine\service.ts:158` | 5f1c6b895fcb31e5 |
| `MAINTAIN_PURGE_V1` | `apps\server\src\engine\service.ts:143` | 2760c84dba9a950a |
| `MAINTAIN_PURGE_V1` | `apps\server\src\engine\service.ts:403` | 67916e54228abd6f |
| `SERVICE_METRICS_WIRE_V1` | `apps\server\src\engine\service.ts:164` | 6149db25fd7bfdf0 |
| `SERVICE_METRICS_WIRE_V1` | `apps\server\src\engine\service.ts:1609` | b8394f74eaa4f556 |
| `SERVICE_REACTIONS_LOAD_V1` | `apps\server\src\engine\service.ts:283` | f5448e9335cfe49d |
| `SERVICE_REACTIONS_LOAD_V1` | `apps\server\src\engine\service.ts:318` | 06cca3d46dc4d2ac |
| `MAINTAIN_TENANT_CURSOR_V1` | `apps\server\src\engine\service.ts:365` | 287e2784e6a7ad82 |
| `MAINTAIN_TENANT_CURSOR_V1` | `apps\server\src\engine\service.ts:1845` | 8317dec867cd76e9 |
| `SERVICE_ALERTS_V1` | `apps\server\src\engine\service.ts:381` | 0643b9e38604769a |
| `SERVICE_ALERTS_V1` | `apps\server\src\engine\service.ts:1857` | 849a71659f4f950b |
| `MATERIALIZE_ENTITY_ON_FINISH_V1` | `apps\server\src\engine\service.ts:1750` | 411001dd39cf47cd |
| `MATERIALIZE_ENTITY_ON_FINISH_V1` | `apps\server\src\engine\service.ts:1811` | 69eb667ff6175343 |
| `MAINTAIN_TENANT_REAL_V1` | `apps\server\src\engine\service.ts:1885` | aa8901385c0fc4f4 |
| `MAINTAIN_TENANT_REAL_V1` | `apps\server\src\engine\service.ts:1900` | 643903a9ce0ecf33 |
| `MATCHES_PRICE_PARSE_V1` | `apps\server\src\engine\service.ts:2258` | a1536e37660f1744 |
| `MATCHES_PRICE_PARSE_V1` | `apps\server\src\engine\service.ts:2270` | 20f026c03845297f |
| `SOP_THOUGHTS_V1` | `apps\server\src\engine\sop-executor.ts:22` | 6744c24173bfd2b0 |
| `SOP_THOUGHTS_V1` | `apps\server\src\engine\sop-executor.ts:174` | 45e0144e6282dc8e |
| `SOP_THOUGHT_STEP_V1` | `apps\server\src\engine\sop-executor.ts:101` | ee6d80e0fdbde66e |
| `SOP_THOUGHT_STEP_V1` | `apps\server\src\engine\sop-executor.ts:385` | 0d1fbe55f89090d5 |
| `SOP_OUTCOME_STRUCTURED_V1` | `apps\server\src\engine\sop-executor.ts:144` | caab453996a1ca61 |
| `SOP_OUTCOME_STRUCTURED_V1` | `apps\server\src\engine\sop-executor.ts:158` | ca12d4bfb7333267 |
| `VIEW_RESOLVER_V1` | `apps\server\src\engine\views\resolver.ts:1` | 8d98904ba4909ef6 |
| `VIEW_RESOLVER_V1` | `apps\web\src\view\resolver.ts:1` | b7726e0f3c62258d |
| `WORKER_GUARD_INVALIDATE_V1` | `apps\server\src\engine\worker.ts:165` | 76bafa57d20824ff |
| `WORKER_GUARD_INVALIDATE_V1` | `apps\server\src\engine\worker.ts:181` | 588d70b3a63973dc |
| `WORKER_GUARD_INVALIDATE_V1` | `apps\server\src\engine\worker.ts:257` | f486dab82263b7a7 |
| `WORKER_DEDUPE_PERSIST_V1` | `apps\server\src\engine\worker.ts:189` | 92912f431ff55c88 |
| `WORKER_DEDUPE_PERSIST_V1` | `apps\server\src\engine\worker.ts:212` | 6382f76520f64733 |
| `FILES_TENANT_STRICT_V2` | `apps\server\src\files.ts:83` | 005851472781f18d |
| `FILES_TENANT_STRICT_V2` | `apps\server\src\files.ts:130` | 2bc1355fcc9aa232 |
| `FILES_TENANT_STRICT_V2` | `apps\server\src\files.ts:184` | 102b9e31523f0aa3 |
| `AUTHOR_MATCHED_METADATA_V1` | `apps\server\src\kernel\authors\fast-author.ts:27` | 9e67e260c5eab203 |
| `AUTHOR_MATCHED_METADATA_V1` | `apps\server\src\kernel\authors\slow-author.ts:29` | 3e97afe3503c37a5 |
| `AUTHOR_METADATA_NORMALIZE_V1` | `apps\server\src\kernel\authors\fast-author.ts:42` | 0da02dd1c7816c45 |
| `AUTHOR_METADATA_NORMALIZE_V1` | `apps\server\src\kernel\authors\slow-author.ts:44` | 73571c0956e4b601 |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:25` | 115cebfa1a88c05b |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:33` | 1e52924bda1594b4 |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:41` | bf74040f7e2726fe |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:107` | 2d7c1ba77dbe806c |
| `SERVICE_TENANT_RESOLVER_V1` | `apps\server\src\kernel\index.ts:43` | 41cfe8612344daab |
| `SERVICE_TENANT_RESOLVER_V1` | `apps\server\src\kernel\tenancy\service-resolver.ts:1` | 387b265164fa8f6c |
| `STUB_112_V1` | `apps\web\src\components\AgentsView.tsx:1` | 90a6cefd4db306cc |
| `STUB_112_V1` | `apps\web\src\components\ContextualPanel.tsx:2` | c4129ccd8620bd08 |
| `UI_ANIMATED_NUMBER_V1` | `apps\web\src\components\AnimatedNumber.tsx:1` | ba69cc049d8fef26 |
| `UI_ANIMATED_NUMBER_V1` | `apps\web\src\components\ControlCenterView.tsx:1` | d5338bde60d93484 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx:23` | 8bd0183ea64d8802 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx:85` | 7b3c8f4e35aabce8 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx:100` | faf94234bf8a458d |
| `CONTEXT_CHIPS_V1` | `apps\web\src\components\ContextChips.tsx:1` | baa5a908be42a86d |
| `CONTEXT_CHIPS_V1` | `packages\domain\src\context-chips.ts:1` | 049374c04f507b6f |
| `MESSAGE_ATTACHMENT_PREVIEW_V1` | `apps\web\src\components\MessageBubble.tsx:5` | c44d4251dcb16b7c |
| `MESSAGE_ATTACHMENT_PREVIEW_V1` | `apps\web\src\components\MessageBubble.tsx:34` | ceca4264d3506d5e |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\dashboard\DashboardTemplate.tsx:1` | ad8643244569956d |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\detail\DetailTemplate.tsx:1` | 11e106ee378684db |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\form\FormTemplate.tsx:1` | 470c5b23a53e4bfb |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\graph\GraphTemplate.tsx:1` | 7c9467ff8e2d281d |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\kanban\KanbanTemplate.tsx:1` | e1ed55a7df6eb6fd |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\list\ListTemplate.tsx:1` | 018760f116844e25 |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\table\TableTemplate.tsx:1` | b7f86dee84374cf4 |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\timeline\TimelineTemplate.tsx:1` | 88ac3dcd3934ea0f |
| `OUTCOME_V1` | `packages\domain\src\agent.ts:55` | 0e04ebd65a68f716 |
| `OUTCOME_V1` | `packages\domain\src\outcome.ts:1` | ccf6b815b297d3da |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts:113` | ffba90c2f53c111e |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts:152` | 52099863e36fc9af |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts:235` | dbc5fde69ee781f8 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:165` | e490f272dd9c0c5a |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:197` | 988ff224ee263077 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:199` | 6b2d7cfe4026a7b3 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:201` | 3f3bcff5ef8fade8 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:203` | 7d7353806027f4d9 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:245` | aed3a32cb6d07fb3 |

## Huerfanas

La marca aparece en un comentario pero debajo no hay codigo real. Probable marca puesta a mano sin aplicar el bloque.

| Marca | Fichero:linea | Lineas de codigo |
|---|---|---|
| `EXPORT_BUSINESS_WEB_V1` | `apps\web\src\api\index.ts:12` | 2 |
| `FALLBACK_V1` | `apps\web\src\view\fallback.tsx:1` | 1 |

## Repetidas en el mismo fichero

La misma marca aparece dos veces en el mismo fichero. Probable bloque aplicado dos veces.

| Marca | Fichero | Veces |
|---|---|---|
| `APP_TENANT_DB_V1` | `apps\server\src\app.ts` | 2 |
| `SERVICE_TENANT_RESOLVER_WIRE_V1` | `apps\server\src\app.ts` | 2 |
| `POLICY_EARLY_V1` | `apps\server\src\app.ts` | 2 |
| `HEALTH_DEEP_V2` | `apps\server\src\app.ts` | 2 |
| `SIGNUP_RATE_LIMIT_V1` | `apps\server\src\auth-signup.ts` | 2 |
| `RUNTIME_TENANT_V1` | `apps\server\src\engine\agents\runtime.ts` | 2 |
| `GRAPH_RESOLVER_WIRE_V1` | `apps\server\src\engine\business\graph.ts` | 2 |
| `BUSINESS_SCHEMA_WIRE_V2` | `apps\server\src\engine\business\graph.ts` | 2 |
| `BUSINESS_GRAPH_VERSION_V1` | `apps\server\src\engine\business\graph.ts` | 3 |
| `AGENT_RUNTIME_WIRE_V2` | `apps\server\src\engine\conversation.ts` | 2 |
| `VIEWS_READ_WIRE_V1` | `apps\server\src\engine\conversation.ts` | 2 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts` | 3 |
| `KERNEL_FAST_RESPONSE_V1` | `apps\server\src\engine\conversation.ts` | 2 |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts` | 3 |
| `LEARNING_OBSERVER_V2` | `apps\server\src\engine\learning\observer.ts` | 2 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\model.ts` | 2 |
| `ORCHESTRATOR_LEARNING_WIRE_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts` | 2 |
| `STATEMACHINE_ENTITY_TYPE_V1` | `apps\server\src\engine\policy\state-machine.ts` | 2 |
| `REACTION_EVAL_EXEC_V1` | `apps\server\src\engine\reactions\engine.ts` | 2 |
| `SERVICE_TENANT_DB_V1` | `apps\server\src\engine\service.ts` | 2 |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts` | 4 |
| `GUARDRAILS_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SERVICE_RATE_LIMIT_TENANT_V1` | `apps\server\src\engine\service.ts` | 3 |
| `CAPABILITY_REGISTRY_V1` | `apps\server\src\engine\service.ts` | 2 |
| `PLANNER_V1` | `apps\server\src\engine\service.ts` | 2 |
| `VERIFIER_V1` | `apps\server\src\engine\service.ts` | 2 |
| `BUSINESS_OS_ORCHESTRATOR_V1` | `apps\server\src\engine\service.ts` | 2 |
| `HANDOFF_SERVICE_V1` | `apps\server\src\engine\service.ts` | 2 |
| `REACTION_ENGINE_V1` | `apps\server\src\engine\service.ts` | 2 |
| `LEARNING_OBSERVER_V1` | `apps\server\src\engine\service.ts` | 2 |
| `EXECUTOR_WIRE_V1` | `apps\server\src\engine\service.ts` | 3 |
| `EVENTBUS_MONITOR_EMIT_V1` | `apps\server\src\engine\service.ts` | 2 |
| `KERNEL_WIRE_A_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MAINTAIN_PURGE_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SERVICE_METRICS_WIRE_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SERVICE_REACTIONS_LOAD_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MAINTAIN_TENANT_CURSOR_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SERVICE_ALERTS_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MATERIALIZE_ENTITY_ON_FINISH_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MAINTAIN_TENANT_REAL_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MATCHES_PRICE_PARSE_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SOP_THOUGHTS_V1` | `apps\server\src\engine\sop-executor.ts` | 2 |
| `SOP_THOUGHT_STEP_V1` | `apps\server\src\engine\sop-executor.ts` | 2 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\sop-executor.ts` | 2 |
| `SOP_OUTCOME_STRUCTURED_V1` | `apps\server\src\engine\sop-executor.ts` | 2 |
| `WORKER_GUARD_INVALIDATE_V1` | `apps\server\src\engine\worker.ts` | 3 |
| `WORKER_DEDUPE_PERSIST_V1` | `apps\server\src\engine\worker.ts` | 2 |
| `FILES_TENANT_STRICT_V2` | `apps\server\src\files.ts` | 3 |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts` | 4 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx` | 3 |
| `MESSAGE_ATTACHMENT_PREVIEW_V1` | `apps\web\src\components\MessageBubble.tsx` | 2 |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts` | 3 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts` | 6 |
