# Diferencias frente a la canónica

Rama `Trans01` en `8967243326ccf5e22224e0693ac9155ea70d9765`. Revisión canónica `8672f8c1035067e77de76080aabbe8d4c8030fe5`. Ancestro común `751eab413aef2ca124d42dcba602b91696b71c9d`. La tabla compara las dos puntas. Se incluyen fuentes y pruebas de las superficies de desarrollo, junto con manifiestos raíz. El inventario documental original figura en [fuentes versionadas](FUENTES-VERSIONADAS.md).

| Ruta | Blob canónico | Blob de rama |
|---|---|---|
| `apps/server/src/actions.ts` | `b8af1e88b7901970ae084add44085598ea82a2b5` | `1299d51bf99948c5c010f217def209cc7869f4d6` |
| `apps/server/src/db-tenant.ts` | `581b242b25d5a83ed63d6eb983a4a2921e8f647e` | `83c36c737f4061cb5c1e67dcceb230d1d86b835e` |
| `apps/server/src/db.ts` | `d57a47395f41bda1ab4917f875f66e804b4eae4d` | `30a66bfccfa492f91b4436baa26e727f95ef5705` |
| `apps/server/src/engine/capabilities/bootstrap.ts` | `c2fa779fd06652ce8638ffd3c85d964bfed1a051` | `05bdceb1c6f4cd8d4a2c45ae941c2378a0d5a21f` |
| `apps/server/src/engine/events/bus.ts` | `6dfd601db9fd60ad1f0276021fbd5d4c2e9f86ec` | `574533725890d19623bcb7ac2368e31ce0c2e4ae` |
| `apps/server/src/engine/events/index.ts` | `f3aebba346f86458160da2023c4fcd0c3c57072a` | `1f8d9120702b69e1970b9f91ce73b1b784d5c2f4` |
| `apps/server/src/engine/events/service-principal.ts` | `ausente` | `063274db6ebbed1c188d178d6b5985f00173a4e5` |
| `apps/server/src/engine/events/sinks/store.ts` | `659fd85a1d0f9bf62ba5f730235defcc97260055` | `a2109ccc689cb183f697595afced11444d8bb887` |
| `apps/server/src/engine/events/types.ts` | `8fa15f614276942e085a8112a0790b94d0d95d22` | `c33a9fb14b8a08e3fb3c7cb5f72af8950d0ee89b` |
| `apps/server/src/engine/execution/capability-runner.ts` | `493a3beaecee2510af52e53e7b7be713784ba9f6` | `6c3778ed6520c6940cdbcdd8f567678cf128a448` |
| `apps/server/src/engine/execution/outcome.ts` | `ausente` | `006ce2ae34aa9ddb96b56fd4dcdd303b7dd2304b` |
| `apps/server/src/engine/execution/tool-executors.ts` | `6e00a90323d4d2d73457f317ebf7db7e9df473bd` | `ff75733832c2ecd8a1149b97221c98c51ae42394` |
| `apps/server/src/engine/observability/hooks.ts` | `ausente` | `4d2d8c68cf15f4fca3a0bf02290fedbe536f7c59` |
| `apps/server/src/engine/service.ts` | `8b47bf2619e0b501cdd3a5e49ea030056eefce47` | `6000721c566cf6f644438e5ed9aaf32e4e942e2f` |
| `apps/server/src/engine/sop-executor.ts` | `1ab7a390ac0866021b62e0a8632e684ebb4ab377` | `1243cab4a380fd9a5d7de5fa1da197ea242d19e6` |
| `packages/domain/src/execution-context.ts` | `44b8552b035c19a1931378b72e9559e8c489582a` | `f96148cd0d8b4f86952ac12167f24cd59df9a767` |
| `packages/domain/src/index.ts` | `4cd981b79f96e20a2c87f6cd9cf7f36ab3d59787` | `adbf97cec2b68ba054143be1dd2258a5b27e082c` |
| `tests/gate/idempotency-execution.test.ts` | `9203b594bc619de5dddf5dd42237a547b3d94e1b` | `812e502784c494d04ac6bfe1a472b46ff2a67371` |
| `tests/trans01-approval-binding.test.ts` | `ausente` | `972cf5d3cc45e5f244dd2be82944dd1ac302f1d4` |
| `tests/trans01-approval-hash-race.test.ts` | `ausente` | `2b336e5da413fb3db7334b83bf5081dca58a1d07` |
| `tests/trans01-causal-envelope.test.ts` | `ausente` | `33f74ea64ddb6829b49662d5aaee10044293f7da` |
| `tests/trans01-claim-cas.test.ts` | `ausente` | `7ab69aaf9be67b9328d79215abe2e4369a94d0f4` |
| `tests/trans01-dispatch-outbox.test.ts` | `ausente` | `8ae764b666794fc57f90535239f456245b9ee83f` |
| `tests/trans01-effect-boundary.test.ts` | `ausente` | `a2ea1c92f38fa78df8a05f0073f4fac273e359be` |
| `tests/trans01-emit-commit.test.ts` | `ausente` | `e1b51c9d6a11559a57ed2a95f888148f0496655f` |
| `tests/trans01-event-page.test.ts` | `ausente` | `1c1b69d292303f8f761722113583d63823d3e8e9` |
| `tests/trans01-governed-runner.test.ts` | `ausente` | `10bc2664d05523ec0434d5b47443bf2d9bb85381` |
| `tests/trans01-outcome-semantics.test.ts` | `ausente` | `476395aa8eb6362ee1fad0cf07c90f5f42fe1f45` |
| `tests/trans01-replay-concurrency.test.ts` | `ausente` | `d1cb211da6b0e442d374ad6957184b3b898937c1` |
| `tests/trans01-replay-durable.test.ts` | `ausente` | `5aa20d7da4f8dd2a7c6b21884ec4f4b874b38f95` |
| `tests/trans01-service-principal.test.ts` | `ausente` | `b999441d79dd678aba3e457ca5713cbf561f873d` |
| `tests/trans01-sop-authz.test.ts` | `ausente` | `2b7ea21e2be3c789f870abd306bc7091b3b227d6` |
| `tests/trans01-telemetry-hooks.test.ts` | `ausente` | `dbc1eb92e19e40993ef8e303ec3ae45d775a6674` |
