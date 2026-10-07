# Auditoria de idempotencia

> Generado por `scripts/audits/idempotency.ts` el 2026-10-04T11:50:21.968Z.

- Ficheros revisados: **311**
- Marcas encontradas: **713**
- Marcas unicas: **595**
- Marcas duplicadas con cuerpo distinto: **75**
- Marcas huerfanas (sin codigo real debajo): **4**
- Marcas repetidas en el mismo fichero: **64**

## Duplicadas con cuerpo distinto

La misma marca aparece en varios sitios con contenido distinto. Una de las dos aplicaciones puede ser erronea.

| Marca | Fichero:linea | Hash cuerpo |
|---|---|---|
| `APP_TENANT_DB_V1` | `apps\server\src\app.ts:17` | 3fb36d5013dac97e |
| `APP_TENANT_DB_V1` | `apps\server\src\app.ts:64` | 78feba17f4ddb885 |
| `SERVICE_TENANT_RESOLVER_WIRE_V1` | `apps\server\src\app.ts:46` | e90b22cf31808909 |
| `SERVICE_TENANT_RESOLVER_WIRE_V1` | `apps\server\src\app.ts:152` | 289f704a8bcb3490 |
| `ENGINE_TENANT_V1` | `apps\server\src\app.ts:50` | 3bebc31dccf80e3b |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:75` | a0e5c80b3c88f7e5 |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:131` | bb7f84da2fd4cc6e |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:162` | 955f4f96353353ef |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\service.ts:217` | d37aab94a0faca2f |
| `ENGINE_TENANT_V1` | `apps\server\src\engine\tenant.ts:1` | 2ca90b8f1df37e76 |
| `POLICY_EARLY_V1` | `apps\server\src\app.ts:70` | 4f42b08795433e39 |
| `POLICY_EARLY_V1` | `apps\server\src\app.ts:94` | 3e612b1aa004bca6 |
| `HEALTH_DEEP_V2` | `apps\server\src\app.ts:276` | fa19ebb111ec5f95 |
| `HEALTH_DEEP_V2` | `apps\server\src\app.ts:280` | 50d38c3d34692d5c |
| `SIGNUP_RATE_LIMIT_V1` | `apps\server\src\auth-signup.ts:39` | 67a2bd22c6ec98a7 |
| `SIGNUP_RATE_LIMIT_V1` | `apps\server\src\auth-signup.ts:47` | b467a218d7f4acbc |
| `TENANT_SCAN_SQL_FILTER_V1` | `apps\server\src\db-tenant.ts:78` | 7532264f45af98ed |
| `TENANT_SCAN_SQL_FILTER_V1` | `apps\server\src\db-tenant.ts:88` | b9e7e3df2468aa73 |
| `TENANT_SCAN_PEEL_V1` | `apps\server\src\db-tenant.ts:84` | 970c3e6f932aeeee |
| `TENANT_SCAN_PEEL_V1` | `apps\server\src\db-tenant.ts:128` | 7b8a382ba03d7b2a |
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
| `CAPABILITY_REGISTRY_V1` | `apps\server\src\engine\service.ts:81` | a1f247354a577a8d |
| `CAPABILITY_REGISTRY_V1` | `apps\server\src\engine\service.ts:172` | 913d34c4b1df02d5 |
| `CONTEXT_BUDGET_V1` | `apps\server\src\engine\context\budget.ts:1` | 170528f19d8b239f |
| `CONTEXT_BUDGET_V1` | `apps\server\src\engine\context\engine.ts:39` | 3a4258d551ca4643 |
| `CONTEXT_INCLUDE_LEARNING_V1` | `apps\server\src\engine\context\engine.ts:97` | 9c98a28f7e88771c |
| `CONTEXT_INCLUDE_LEARNING_V1` | `apps\server\src\engine\context\engine.ts:118` | c4783c7abe1f2ec0 |
| `KERNEL_PROMOTER_IMPORT_V1` | `apps\server\src\engine\conversation.ts:17` | 1914af4d79bd7a30 |
| `KERNEL_PROMOTER_IMPORT_V1` | `apps\server\src\engine\model.ts:10` | 77c31aa64a3a4643 |
| `AGENT_RUNTIME_WIRE_V2` | `apps\server\src\engine\conversation.ts:59` | 8d3d26c3176af2be |
| `AGENT_RUNTIME_WIRE_V2` | `apps\server\src\engine\conversation.ts:88` | 12ba7518494e4dac |
| `VIEWS_READ_WIRE_V1` | `apps\server\src\engine\conversation.ts:100` | a0073b3db5936651 |
| `VIEWS_READ_WIRE_V1` | `apps\server\src\engine\conversation.ts:110` | 8b74988973aceb5e |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:125` | 1480a4412eb4fee3 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:676` | 23df737d046d6682 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:681` | b3d7fe459d4285a8 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:744` | 115d2b4738563c92 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:764` | a1c171f6fac095fb |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts:781` | c6e6e22040c98745 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\model.ts:72` | ad1942d90695bd2e |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\model.ts:548` | 58ae01a51619ff39 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\service.ts:2077` | 93a7aa4d1d649659 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\service.ts:2099` | 38fdc4f17fb7c810 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\sop-executor.ts:134` | 5328598d0de0f838 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\sop-executor.ts:163` | 74f92dfad74c41b6 |
| `ROLE_PROMPT_V2` | `apps\server\src\engine\conversation.ts:525` | 5940f67351504a46 |
| `ROLE_PROMPT_V2` | `apps\server\src\engine\model.ts:421` | 117b72d8feef71cb |
| `FAST_SLOW_CONFIG_WIRE_V1` | `apps\server\src\engine\conversation.ts:593` | f89077db51fc0920 |
| `FAST_SLOW_CONFIG_WIRE_V1` | `apps\server\src\engine\conversation.ts:621` | b25ce51f29a2b41e |
| `KERNEL_FAST_RESPONSE_V1` | `apps\server\src\engine\conversation.ts:629` | c30791258ff99577 |
| `KERNEL_FAST_RESPONSE_V1` | `apps\server\src\engine\conversation.ts:748` | d670d4ac6e73a186 |
| `KERNEL_PROMOTE_PERSIST_V1` | `apps\server\src\engine\conversation.ts:722` | 7d4cbb7583b66cc6 |
| `KERNEL_PROMOTE_PERSIST_V1` | `apps\server\src\engine\service.ts:2033` | 768a758a1a8ec078 |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts:27` | 504614834baf72f8 |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts:71` | ff250176b30cf5d7 |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts:93` | a81fbbb6ba2ed139 |
| `EVENTBUS_DEDUPE_OWNER_FIX_V1` | `apps\server\src\engine\events\bus.ts:73` | 041cd8ab0c6a3d0c |
| `EVENTBUS_DEDUPE_OWNER_FIX_V1` | `apps\server\src\engine\events\bus.ts:95` | 0a755ad2b209745f |
| `A2_EVENTS_V1` | `apps\server\src\engine\events\schemas.ts:51` | 92d01924e56f5ff2 |
| `A2_EVENTS_V1` | `apps\server\src\engine\events\types.ts:28` | 2bbb4dc841fa6e4c |
| `D2_VIEW_RESOLVED_V1` | `apps\server\src\engine\events\schemas.ts:64` | c148862c7a562cf8 |
| `D2_VIEW_RESOLVED_V1` | `apps\server\src\engine\events\types.ts:31` | be0e3fc64c6efd39 |
| `VERIFICATION_EVENT_V1` | `apps\server\src\engine\events\schemas.ts:158` | 08c12161dd255ca9 |
| `VERIFICATION_EVENT_V1` | `apps\server\src\engine\events\types.ts:47` | bba8f658d840bfca |
| `GUARDRAILS_V1` | `apps\server\src\engine\guardrails\service.ts:1` | bce2c20d708f96d0 |
| `GUARDRAILS_V1` | `apps\server\src\engine\service.ts:77` | 1f6c607605e97fb9 |
| `GUARDRAILS_V1` | `apps\server\src\engine\service.ts:164` | 5672a1abdaa5dc67 |
| `HANDOFF_SERVICE_V1` | `apps\server\src\engine\handoff\service.ts:2` | e1da5c636b6e1301 |
| `HANDOFF_SERVICE_V1` | `apps\server\src\engine\service.ts:93` | c6a048accc0565db |
| `HANDOFF_SERVICE_V1` | `apps\server\src\engine\service.ts:184` | dab61fca6f617faf |
| `LEARNING_OBSERVER_V1` | `apps\server\src\engine\learning\observer.ts:2` | 98862962589ce015 |
| `LEARNING_OBSERVER_V1` | `apps\server\src\engine\service.ts:100` | 4e5aa52394e10400 |
| `LEARNING_OBSERVER_V1` | `apps\server\src\engine\service.ts:188` | 1711a54ae0fed4d5 |
| `LEARNING_OBSERVER_V2` | `apps\server\src\engine\learning\observer.ts:67` | 4d76da066ec2dda3 |
| `LEARNING_OBSERVER_V2` | `apps\server\src\engine\learning\observer.ts:95` | cc8430343b9c7095 |
| `MODEL_TASK_CONTEXT_ASSEMBLE_V1` | `apps\server\src\engine\model.ts:402` | 7ffb875399794dfd |
| `MODEL_TASK_CONTEXT_ASSEMBLE_V1` | `apps\server\src\engine\model.ts:416` | 83e5e21df4924a35 |
| `MODEL_SLOW_CHAIN_OUT_OF_SCOPE_V1` | `apps\server\src\engine\model.ts:486` | f219d1eb6085734c |
| `MODEL_SLOW_CHAIN_OUT_OF_SCOPE_V1` | `apps\server\src\engine\model.ts:601` | f409234826497c1c |
| `BUSINESS_OS_ORCHESTRATOR_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts:3` | 6572705574942fde |
| `BUSINESS_OS_ORCHESTRATOR_V1` | `apps\server\src\engine\service.ts:91` | 025f5f79ee0c8c78 |
| `BUSINESS_OS_ORCHESTRATOR_V1` | `apps\server\src\engine\service.ts:182` | ccf5bbe061cf53f7 |
| `ORCHESTRATOR_LEARNING_WIRE_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts:17` | 53fc47accfaeab49 |
| `ORCHESTRATOR_LEARNING_WIRE_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts:94` | 8a55bf62dd51703c |
| `PLANNER_V1` | `apps\server\src\engine\planner\planner.ts:2` | 0edef434acfa9f72 |
| `PLANNER_V1` | `apps\server\src\engine\service.ts:84` | 0258bc8811525e11 |
| `PLANNER_V1` | `apps\server\src\engine\service.ts:174` | 059e99d4a797c62c |
| `STATEMACHINE_ENTITY_TYPE_V1` | `apps\server\src\engine\policy\state-machine.ts:48` | d33997f652bca616 |
| `STATEMACHINE_ENTITY_TYPE_V1` | `apps\server\src\engine\policy\state-machine.ts:71` | 609ac270c3cf70bc |
| `REACTION_ENGINE_V1` | `apps\server\src\engine\reactions\engine.ts:1` | 0ac8a6fd67fe5ec4 |
| `REACTION_ENGINE_V1` | `apps\server\src\engine\service.ts:95` | 46e58c69d77c7a94 |
| `REACTION_ENGINE_V1` | `apps\server\src\engine\service.ts:186` | f40a8b805a8746f0 |
| `REACTION_EVAL_EXEC_V1` | `apps\server\src\engine\reactions\engine.ts:33` | 91c83b5c2a4c1f12 |
| `REACTION_EVAL_EXEC_V1` | `apps\server\src\engine\reactions\engine.ts:51` | 4e078274255145fc |
| `A1_MEMORY_PATCH_V2` | `apps\server\src\engine\routes.ts:17` | 694d43bcc82854a4 |
| `A1_MEMORY_PATCH_V2` | `apps\server\src\engine\routes.ts:199` | f0c50e4404791af7 |
| `A1_MEMORY_PATCH_V2` | `apps\server\src\engine\routes.ts:217` | 3d250165801feb21 |
| `A1_MEMORY_PATCH_V2` | `apps\web\src\components\MemoryView.tsx:65` | f566dfa83f8273ea |
| `SERVICE_TENANT_DB_V1` | `apps\server\src\engine\service.ts:48` | a3966b71d19c99da |
| `SERVICE_TENANT_DB_V1` | `apps\server\src\engine\service.ts:193` | c14f1c70e16912b8 |
| `SERVICE_RATE_LIMIT_TENANT_V1` | `apps\server\src\engine\service.ts:79` | 831ba9b5f7943456 |
| `SERVICE_RATE_LIMIT_TENANT_V1` | `apps\server\src\engine\service.ts:170` | 5973f1e8d82047f6 |
| `SERVICE_RATE_LIMIT_TENANT_V1` | `apps\server\src\engine\service.ts:963` | c770600014ba1f3f |
| `VERIFIER_V1` | `apps\server\src\engine\service.ts:88` | 5d01191a7cb59cd1 |
| `VERIFIER_V1` | `apps\server\src\engine\service.ts:180` | c0dd882bef338148 |
| `VERIFIER_V1` | `apps\server\src\engine\verification\verifier.ts:1` | 40bc03a664c670e1 |
| `EXECUTOR_WIRE_V1` | `apps\server\src\engine\service.ts:102` | 12e58e9e1f32ed65 |
| `EXECUTOR_WIRE_V1` | `apps\server\src\engine\service.ts:190` | 51f633baaddb9e92 |
| `EXECUTOR_WIRE_V1` | `apps\server\src\engine\service.ts:276` | d3f8898fea5b0641 |
| `EVENTBUS_MONITOR_EMIT_V1` | `apps\server\src\engine\service.ts:114` | c14c063c1fa0c605 |
| `EVENTBUS_MONITOR_EMIT_V1` | `apps\server\src\engine\service.ts:115` | 24ea3254d09f3f4d |
| `KERNEL_WIRE_A_V1` | `apps\server\src\engine\service.ts:133` | 6ad3979ed0a17db7 |
| `KERNEL_WIRE_A_V1` | `apps\server\src\engine\service.ts:160` | 91135c446cfc5a0c |
| `MAINTAIN_PURGE_V1` | `apps\server\src\engine\service.ts:145` | 2760c84dba9a950a |
| `MAINTAIN_PURGE_V1` | `apps\server\src\engine\service.ts:409` | 55e68548f13b9fa0 |
| `SERVICE_METRICS_WIRE_V1` | `apps\server\src\engine\service.ts:166` | 501347c6b079cc1f |
| `SERVICE_METRICS_WIRE_V1` | `apps\server\src\engine\service.ts:1817` | b8394f74eaa4f556 |
| `PLANNER_VERIFIER_TYPES_FIX_V1` | `apps\server\src\engine\service.ts:175` | cb750e89e3bd3d59 |
| `PLANNER_VERIFIER_TYPES_FIX_V1` | `apps\server\src\engine\service.ts:232` | 44e8ba1d1e48be1f |
| `SERVICE_REACTIONS_LOAD_V1` | `apps\server\src\engine\service.ts:289` | f5448e9335cfe49d |
| `SERVICE_REACTIONS_LOAD_V1` | `apps\server\src\engine\service.ts:324` | 06cca3d46dc4d2ac |
| `MAINTAIN_TENANT_CURSOR_V1` | `apps\server\src\engine\service.ts:371` | 287e2784e6a7ad82 |
| `MAINTAIN_TENANT_CURSOR_V1` | `apps\server\src\engine\service.ts:2102` | 935f6bce3904de78 |
| `SERVICE_ALERTS_V1` | `apps\server\src\engine\service.ts:387` | 0643b9e38604769a |
| `SERVICE_ALERTS_V1` | `apps\server\src\engine\service.ts:2128` | b4b33f997346ee1e |
| `SYSTEM_CONTEXT_CACHE_V1` | `apps\server\src\engine\service.ts:761` | 5fd8dceeb3f01718 |
| `SYSTEM_CONTEXT_CACHE_V1` | `apps\server\src\engine\service.ts:824` | f5ae936611333c10 |
| `MATERIALIZE_ENTITY_ON_FINISH_V1` | `apps\server\src\engine\service.ts:1966` | 411001dd39cf47cd |
| `MATERIALIZE_ENTITY_ON_FINISH_V1` | `apps\server\src\engine\service.ts:2036` | ef9bd6cd70f2ac73 |
| `MAINTAIN_TENANT_REAL_V1` | `apps\server\src\engine\service.ts:2161` | f1e91f582dbebbf8 |
| `MAINTAIN_TENANT_REAL_V1` | `apps\server\src\engine\service.ts:2176` | 3aac9cc0940bba6d |
| `MATCHES_PRICE_PARSE_V1` | `apps\server\src\engine\service.ts:2543` | 22da262146f50e10 |
| `MATCHES_PRICE_PARSE_V1` | `apps\server\src\engine\service.ts:2555` | 2d76b0ab896f3570 |
| `SOP_THOUGHTS_V1` | `apps\server\src\engine\sop-executor.ts:22` | 6744c24173bfd2b0 |
| `SOP_THOUGHTS_V1` | `apps\server\src\engine\sop-executor.ts:174` | 45e0144e6282dc8e |
| `SOP_THOUGHT_STEP_V1` | `apps\server\src\engine\sop-executor.ts:101` | ee6d80e0fdbde66e |
| `SOP_THOUGHT_STEP_V1` | `apps\server\src\engine\sop-executor.ts:385` | 0d1fbe55f89090d5 |
| `SOP_OUTCOME_STRUCTURED_V1` | `apps\server\src\engine\sop-executor.ts:144` | caab453996a1ca61 |
| `SOP_OUTCOME_STRUCTURED_V1` | `apps\server\src\engine\sop-executor.ts:158` | ca12d4bfb7333267 |
| `WORKER_GUARD_INVALIDATE_V1` | `apps\server\src\engine\worker.ts:171` | 76bafa57d20824ff |
| `WORKER_GUARD_INVALIDATE_V1` | `apps\server\src\engine\worker.ts:187` | 588d70b3a63973dc |
| `WORKER_GUARD_INVALIDATE_V1` | `apps\server\src\engine\worker.ts:263` | f486dab82263b7a7 |
| `WORKER_DEDUPE_PERSIST_V1` | `apps\server\src\engine\worker.ts:195` | 92912f431ff55c88 |
| `WORKER_DEDUPE_PERSIST_V1` | `apps\server\src\engine\worker.ts:218` | 6382f76520f64733 |
| `FILES_TENANT_STRICT_V2` | `apps\server\src\files.ts:83` | 005851472781f18d |
| `FILES_TENANT_STRICT_V2` | `apps\server\src\files.ts:130` | 1ac3384443bb9238 |
| `FILES_TENANT_STRICT_V2` | `apps\server\src\files.ts:196` | f6c2e8a795878596 |
| `AUTHOR_MATCHED_METADATA_V1` | `apps\server\src\kernel\authors\fast-author.ts:27` | d1e940a355e44a96 |
| `AUTHOR_MATCHED_METADATA_V1` | `apps\server\src\kernel\authors\slow-author.ts:29` | bd7ce3060f174f5c |
| `AUTHOR_METADATA_NORMALIZE_V1` | `apps\server\src\kernel\authors\fast-author.ts:42` | 4720e815997b88e3 |
| `AUTHOR_METADATA_NORMALIZE_V1` | `apps\server\src\kernel\authors\slow-author.ts:44` | 47b8a74dcb3fbde8 |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:25` | d22d4410e24cfb2b |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:33` | 480bd1a66ef11f18 |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:44` | bf74040f7e2726fe |
| `CONSOLIDATE_TENANT_V1` | `apps\server\src\kernel\graph\consolidate.ts:110` | 4ca5dc59ac28d821 |
| `SERVICE_TENANT_RESOLVER_V1` | `apps\server\src\kernel\index.ts:43` | 41cfe8612344daab |
| `SERVICE_TENANT_RESOLVER_V1` | `apps\server\src\kernel\tenancy\service-resolver.ts:1` | 387b265164fa8f6c |
| `UI_ANIMATED_NUMBER_V1` | `apps\web\src\components\AnimatedNumber.tsx:1` | ba69cc049d8fef26 |
| `UI_ANIMATED_NUMBER_V1` | `apps\web\src\components\ControlCenterView.tsx:2` | d824617ac0bc7911 |
| `CHATPANEL_RESOLVEVIEW_V1` | `apps\web\src\components\ChatPanel.tsx:1` | 6994ad50f6f6d736 |
| `CHATPANEL_RESOLVEVIEW_V1` | `apps\web\src\components\ChatPanel.tsx:41` | 3d6da9c760e32a38 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx:23` | 8bd0183ea64d8802 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx:85` | 7b3c8f4e35aabce8 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx:100` | faf94234bf8a458d |
| `CONTEXT_CHIPS_V1` | `apps\web\src\components\ContextChips.tsx:1` | baa5a908be42a86d |
| `CONTEXT_CHIPS_V1` | `packages\domain\src\context-chips.ts:1` | 049374c04f507b6f |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\detail\DetailTemplate.tsx:1` | 11e106ee378684db |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\form\FormTemplate.tsx:1` | 470c5b23a53e4bfb |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\graph\GraphTemplate.tsx:1` | 7c9467ff8e2d281d |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\kanban\KanbanTemplate.tsx:1` | e1ed55a7df6eb6fd |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\list\ListTemplate.tsx:1` | 018760f116844e25 |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\table\TableTemplate.tsx:1` | b7f86dee84374cf4 |
| `UI_TEMPLATES_V1` | `apps\web\src\templates\timeline\TimelineTemplate.tsx:1` | 88ac3dcd3934ea0f |
| `OUTCOME_V1` | `packages\domain\src\agent.ts:57` | 0e04ebd65a68f716 |
| `OUTCOME_V1` | `packages\domain\src\outcome.ts:1` | ccf6b815b297d3da |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts:115` | ffba90c2f53c111e |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts:154` | 52099863e36fc9af |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts:237` | dbc5fde69ee781f8 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:167` | e490f272dd9c0c5a |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:199` | 988ff224ee263077 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:201` | 6b2d7cfe4026a7b3 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:203` | 3f3bcff5ef8fade8 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:205` | 7d7353806027f4d9 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts:247` | aed3a32cb6d07fb3 |

## Huerfanas

La marca aparece en un comentario pero debajo no hay codigo real. Probable marca puesta a mano sin aplicar el bloque.

| Marca | Fichero:linea | Lineas de codigo |
|---|---|---|
| `FIX_RAG_DEAD_CODE_V1` | `apps\server\src\engine\rag.ts:309` | 0 |
| `EXPORT_BUSINESS_WEB_V1` | `apps\web\src\api\index.ts:12` | 2 |
| `FALLBACK_V1` | `apps\web\src\view\fallback.tsx:1` | 1 |
| `FIX_02_LIVE_V2` | `packages\domain\src\live.ts:44` | 0 |

## Repetidas en el mismo fichero

La misma marca aparece dos veces en el mismo fichero. Probable bloque aplicado dos veces.

| Marca | Fichero | Veces |
|---|---|---|
| `APP_TENANT_DB_V1` | `apps\server\src\app.ts` | 2 |
| `SERVICE_TENANT_RESOLVER_WIRE_V1` | `apps\server\src\app.ts` | 2 |
| `POLICY_EARLY_V1` | `apps\server\src\app.ts` | 2 |
| `HEALTH_DEEP_V2` | `apps\server\src\app.ts` | 2 |
| `SIGNUP_RATE_LIMIT_V1` | `apps\server\src\auth-signup.ts` | 2 |
| `TENANT_SCAN_SQL_FILTER_V1` | `apps\server\src\db-tenant.ts` | 2 |
| `TENANT_SCAN_PEEL_V1` | `apps\server\src\db-tenant.ts` | 2 |
| `RUNTIME_TENANT_V1` | `apps\server\src\engine\agents\runtime.ts` | 2 |
| `GRAPH_RESOLVER_WIRE_V1` | `apps\server\src\engine\business\graph.ts` | 2 |
| `BUSINESS_SCHEMA_WIRE_V2` | `apps\server\src\engine\business\graph.ts` | 2 |
| `BUSINESS_GRAPH_VERSION_V1` | `apps\server\src\engine\business\graph.ts` | 3 |
| `CONTEXT_INCLUDE_LEARNING_V1` | `apps\server\src\engine\context\engine.ts` | 2 |
| `AGENT_RUNTIME_WIRE_V2` | `apps\server\src\engine\conversation.ts` | 2 |
| `VIEWS_READ_WIRE_V1` | `apps\server\src\engine\conversation.ts` | 2 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\conversation.ts` | 6 |
| `FAST_SLOW_CONFIG_WIRE_V1` | `apps\server\src\engine\conversation.ts` | 2 |
| `KERNEL_FAST_RESPONSE_V1` | `apps\server\src\engine\conversation.ts` | 2 |
| `EVENTBUS_DEDUPE_KEY_V1` | `apps\server\src\engine\events\bus.ts` | 3 |
| `EVENTBUS_DEDUPE_OWNER_FIX_V1` | `apps\server\src\engine\events\bus.ts` | 2 |
| `LEARNING_OBSERVER_V2` | `apps\server\src\engine\learning\observer.ts` | 2 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\model.ts` | 2 |
| `MODEL_TASK_CONTEXT_ASSEMBLE_V1` | `apps\server\src\engine\model.ts` | 2 |
| `MODEL_SLOW_CHAIN_OUT_OF_SCOPE_V1` | `apps\server\src\engine\model.ts` | 2 |
| `ORCHESTRATOR_LEARNING_WIRE_V1` | `apps\server\src\engine\orchestrator\orchestrator.ts` | 2 |
| `STATEMACHINE_ENTITY_TYPE_V1` | `apps\server\src\engine\policy\state-machine.ts` | 2 |
| `REACTION_EVAL_EXEC_V1` | `apps\server\src\engine\reactions\engine.ts` | 2 |
| `A1_MEMORY_PATCH_V2` | `apps\server\src\engine\routes.ts` | 3 |
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
| `PLANNER_VERIFIER_TYPES_FIX_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SERVICE_REACTIONS_LOAD_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MAINTAIN_TENANT_CURSOR_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SERVICE_ALERTS_V1` | `apps\server\src\engine\service.ts` | 2 |
| `SYSTEM_CONTEXT_CACHE_V1` | `apps\server\src\engine\service.ts` | 2 |
| `MATERIALIZE_ENTITY_ON_FINISH_V1` | `apps\server\src\engine\service.ts` | 2 |
| `KERNEL_NONFATAL_V1` | `apps\server\src\engine\service.ts` | 2 |
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
| `CHATPANEL_RESOLVEVIEW_V1` | `apps\web\src\components\ChatPanel.tsx` | 2 |
| `COMMAND_PALETTE_SEARCH_V1` | `apps\web\src\components\CommandPalette.tsx` | 3 |
| `AGENT_ROLE_V2` | `packages\domain\src\agent.ts` | 3 |
| `AGENT_ROLE_V3` | `packages\domain\src\agent.ts` | 6 |
