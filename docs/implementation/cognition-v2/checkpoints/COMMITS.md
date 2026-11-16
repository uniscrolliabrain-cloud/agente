# Historial y ramas

Checkpoint UTC: 2026-11-16T13:47:34.208372+00:00. Código auditado: [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3). Base: [54b8d5407a8576459448c4d059a877297d18ca7a](https://github.com/uniscrolliabrain-cloud/agente/commit/54b8d5407a8576459448c4d059a877297d18ca7a). Evidencia local sintética; no certificación de producción.

## Referencias publicadas

| Rama | HEAD auditado | Base común |
|---|---|---|
| [feat/cognition-v2-runtime-C00-C15](https://github.com/uniscrolliabrain-cloud/agente/tree/feat/cognition-v2-runtime-C00-C15) | [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3) | `54b8d5407a8576459448c4d059a877297d18ca7a` |
| [feat/cognition-v2-W4-backfill](https://github.com/uniscrolliabrain-cloud/agente/tree/feat/cognition-v2-W4-backfill) | [88f4246e930e3cea9f96ae8be97a7f5475358804](https://github.com/uniscrolliabrain-cloud/agente/commit/88f4246e930e3cea9f96ae8be97a7f5475358804) | `54b8d5407a8576459448c4d059a877297d18ca7a` |
| [feat/cognition-v2-W5-outcomes](https://github.com/uniscrolliabrain-cloud/agente/tree/feat/cognition-v2-W5-outcomes) | [33f97608c2d62935e019e06ab38963b4fc51b9b7](https://github.com/uniscrolliabrain-cloud/agente/commit/33f97608c2d62935e019e06ab38963b4fc51b9b7) | `54b8d5407a8576459448c4d059a877297d18ca7a` |
| [feat/cognition-v2-W6-jev-contract](https://github.com/uniscrolliabrain-cloud/agente/tree/feat/cognition-v2-W6-jev-contract) | [1f63fa9929a48c16f02344a0b1efa52216f2e91a](https://github.com/uniscrolliabrain-cloud/agente/commit/1f63fa9929a48c16f02344a0b1efa52216f2e91a) | `54b8d5407a8576459448c4d059a877297d18ca7a` |
| [hijo: feat/cognition-v2-sdk-ack](https://github.com/uniscrolliabrain-cloud/agntia-ciberseguridad/tree/feat/cognition-v2-sdk-ack) | [0a809a18f31aeaba03277d2399549bd1603cd68c](https://github.com/uniscrolliabrain-cloud/agntia-ciberseguridad/commit/0a809a18f31aeaba03277d2399549bd1603cd68c) | `c3a87cd7991e18a89cb5d8bae938be4ace5b9ae6` |

Los refs W4/W5 conservan sus patchsets originales, incorporados por cherry-pick en la rama principal. W6 incluye el adaptador JEV y evidencia propia todavía no incorporados al HEAD auditado. No representan servicios duplicados en ejecución. Ningún push forzado.

## Commits de implementación principal

| SHA completo | Fecha UTC | Mensaje y finalidad del patchset |
|---|---|---|
| [8ac7a0003d42d6609fbf3fc4d64dd3b39eba792f](https://github.com/uniscrolliabrain-cloud/agente/commit/8ac7a0003d42d6609fbf3fc4d64dd3b39eba792f) | 2026-11-15T20:13:36Z | docs(cognition): C00 freeze references and substitution baseline |
| [cb2ddebcccbf440e7f5086f4b0abbb720c62e500](https://github.com/uniscrolliabrain-cloud/agente/commit/cb2ddebcccbf440e7f5086f4b0abbb720c62e500) | 2026-11-15T20:20:02Z | feat(cognition): C01 PS01 strict versioned cognitive contracts |
| [cf72046f34b37ae5fa4595f71d0b7048eb616ead](https://github.com/uniscrolliabrain-cloud/agente/commit/cf72046f34b37ae5fa4595f71d0b7048eb616ead) | 2026-11-15T20:20:02Z | fix(cognition): C02 bind transactions to async connection scope |
| [ff07febdad307023b379014fff2bfe8d6cdce243](https://github.com/uniscrolliabrain-cloud/agente/commit/ff07febdad307023b379014fff2bfe8d6cdce243) | 2026-11-15T20:31:04Z | feat(cognition): C02-C10 durable projection and authorized card delivery slice |
| [d674bc8ad3e6bdc4528e4aeeae19c21ed651cb2b](https://github.com/uniscrolliabrain-cloud/agente/commit/d674bc8ad3e6bdc4528e4aeeae19c21ed651cb2b) | 2026-11-15T23:25:51Z | build(cognition): pin independent provider clients and verified cyber SDK |
| [0f77eb42d3cb1f5d4f72f3b1130f6881ea9c6dc6](https://github.com/uniscrolliabrain-cloud/agente/commit/0f77eb42d3cb1f5d4f72f3b1130f6881ea9c6dc6) | 2026-11-15T23:25:51Z | feat(cognition): C07 capture asynchronous results idempotently in kernel |
| [1da67c68e3b87566046ed8c29cc3d11dcd80209d](https://github.com/uniscrolliabrain-cloud/agente/commit/1da67c68e3b87566046ed8c29cc3d11dcd80209d) | 2026-11-15T23:25:51Z | feat(cognition): C03-C06 project scoped memories graph RAG and attention |
| [1f3eeb4aea8ca4526dd5967aa4da8c84d9261592](https://github.com/uniscrolliabrain-cloud/agente/commit/1f3eeb4aea8ca4526dd5967aa4da8c84d9261592) | 2026-11-15T23:26:09Z | fix(cognition): C02 publish nested events only after outer commit |
| [eb08ef1335ab17ddaa60666b0494398707b77dd9](https://github.com/uniscrolliabrain-cloud/agente/commit/eb08ef1335ab17ddaa60666b0494398707b77dd9) | 2026-11-15T23:26:09Z | feat(cognition): C07-C12 wire independent inference and factual runtime receipts |
| [eba49879c55a974608789a40a7c9c7b60f0a5dfb](https://github.com/uniscrolliabrain-cloud/agente/commit/eba49879c55a974608789a40a7c9c7b60f0a5dfb) | 2026-11-15T23:26:09Z | feat(cognition): C12 show receipt timeline and accessible SVG activity |
| [e9b0b66cc00df8c1b82d14a0825862e1126ccea5](https://github.com/uniscrolliabrain-cloud/agente/commit/e9b0b66cc00df8c1b82d14a0825862e1126ccea5) | 2026-11-15T23:26:10Z | feat(cognition): C13 govern durable voice sessions and interruption epochs |
| [b8b99fcc35e20a806120b9367335436952b3f1fb](https://github.com/uniscrolliabrain-cloud/agente/commit/b8b99fcc35e20a806120b9367335436952b3f1fb) | 2026-11-15T23:26:10Z | feat(cognition): C14 connect governed SDK reads and durable outbox ACK relay |
| [738a5762c7b80c834f1a8b8718d08dd1560026a7](https://github.com/uniscrolliabrain-cloud/agente/commit/738a5762c7b80c834f1a8b8718d08dd1560026a7) | 2026-11-15T23:40:31Z | fix(cognition): C15 close dispatch revocation and unknown commit gaps |
| [11f5df32658a9da2689b6a3c9c7975a005b5b0ce](https://github.com/uniscrolliabrain-cloud/agente/commit/11f5df32658a9da2689b6a3c9c7975a005b5b0ce) | 2026-11-15T23:40:31Z | feat(cognition): C14 project minimized child receipts into shared context |
| [13caec2f0ec47b859b9613965a9967c8ae64d418](https://github.com/uniscrolliabrain-cloud/agente/commit/13caec2f0ec47b859b9613965a9967c8ae64d418) | 2026-11-15T23:40:31Z | test(cognition): C15 separate local gate evidence from production acceptance |
| [019ca7dce8385c1e192adaf92da83a2f007755fc](https://github.com/uniscrolliabrain-cloud/agente/commit/019ca7dce8385c1e192adaf92da83a2f007755fc) | 2026-11-16T00:06:31Z | test(cognition): C15 cover V2 events in exhaustive payload harness |
| [24b4e8db5363c1cd034bd833c05dcf8812530585](https://github.com/uniscrolliabrain-cloud/agente/commit/24b4e8db5363c1cd034bd833c05dcf8812530585) | 2026-11-16T00:06:31Z | feat(cognition): C01 add explicit tenant RLS migration and restricted-role proof |
| [f7143b5a244496b7c1f2b2f4f48f274cc1909515](https://github.com/uniscrolliabrain-cloud/agente/commit/f7143b5a244496b7c1f2b2f4f48f274cc1909515) | 2026-11-16T00:07:34Z | docs(cognition): C15 record executed evidence and outstanding migration gates |
| [d1922bbc7f7dcc69edc595d92ddab3b9b1f411ec](https://github.com/uniscrolliabrain-cloud/agente/commit/d1922bbc7f7dcc69edc595d92ddab3b9b1f411ec) | 2026-11-16T00:10:53Z | feat(cognition): C12 resume durable timeline with bounded cursor polling |
| [119fbf285e60220e92c2fcda0c52e2d9ee09d68e](https://github.com/uniscrolliabrain-cloud/agente/commit/119fbf285e60220e92c2fcda0c52e2d9ee09d68e) | 2026-11-16T00:12:26Z | fix(cognition): C01 preserve uncertainty and scope in legacy migration |
| [825fc694b9ecb71852f930ad4472d0d0b72eb438](https://github.com/uniscrolliabrain-cloud/agente/commit/825fc694b9ecb71852f930ad4472d0d0b72eb438) | 2026-11-16T00:13:46Z | docs(cognition): C01 C12 record migration corpus and reconnect evidence |
| [55eb692d921cf10b43432a8f2f208bf49da5375d](https://github.com/uniscrolliabrain-cloud/agente/commit/55eb692d921cf10b43432a8f2f208bf49da5375d) | 2026-11-16T00:15:03Z | test(cognition): C02 require durable receipts for every event type |
| [754231cc7a85f4a68169e6f4d6982c2cfe0b36d7](https://github.com/uniscrolliabrain-cloud/agente/commit/754231cc7a85f4a68169e6f4d6982c2cfe0b36d7) | 2026-11-16T00:20:17Z | docs(cognition): C15 capture passing tests and inherited gate failures |
| [83ae5a0fc92028e89da21dcd7af5e26678b84060](https://github.com/uniscrolliabrain-cloud/agente/commit/83ae5a0fc92028e89da21dcd7af5e26678b84060) | 2026-11-16T11:38:24Z | docs(cognition): C05 propose card ontologies and measured adoption |
| [b323ab358d4e5ddb59efcd7e3032d20edd0ae4c9](https://github.com/uniscrolliabrain-cloud/agente/commit/b323ab358d4e5ddb59efcd7e3032d20edd0ae4c9) | 2026-11-16T12:07:30Z | feat(cognition): C09 recover abandoned deliveries with durable scan and fencing |
| [40b12dc3b83e069ab81ffc3d8290131db60d446e](https://github.com/uniscrolliabrain-cloud/agente/commit/40b12dc3b83e069ab81ffc3d8290131db60d446e) | 2026-11-16T12:12:20Z | test(cognition): C09 prove concurrent recovery on native Postgres |
| [fab62999b735838d310bed2dbcd0a21482bbe9df](https://github.com/uniscrolliabrain-cloud/agente/commit/fab62999b735838d310bed2dbcd0a21482bbe9df) | 2026-11-16T12:13:57Z | feat(cognition): C05 apply approved card ontology to Slow projections and context |
| [393b990338a9ceb7f54cdcdabae2f364bd71feb2](https://github.com/uniscrolliabrain-cloud/agente/commit/393b990338a9ceb7f54cdcdabae2f364bd71feb2) | 2026-11-16T12:14:37Z | fix(cognition): C10 bind prepared snapshots to the requested query |
| [11b3ebd0dfdf18ef101fa8bc22a3ba4ad4603e99](https://github.com/uniscrolliabrain-cloud/agente/commit/11b3ebd0dfdf18ef101fa8bc22a3ba4ad4603e99) | 2026-11-16T12:16:38Z | docs(cognition): W3 record approved ontology and verified recovery flow |
| [97adb8bd666fea77687600b7cca07c7d6578ff50](https://github.com/uniscrolliabrain-cloud/agente/commit/97adb8bd666fea77687600b7cca07c7d6578ff50) | 2026-11-16T12:30:50Z | docs(cognition): C15 record W3 full gate and resolved ontology decision |
| [af3b16d244b64660a28faa7d47f0b4f73edf5ec2](https://github.com/uniscrolliabrain-cloud/agente/commit/af3b16d244b64660a28faa7d47f0b4f73edf5ec2) | 2026-11-16T12:36:24Z | feat(cognition): C01 stage resumable legacy backfill with scoped evidence and receipts |
| [38d0c6afaf3022d724fae49846667a19c22e749d](https://github.com/uniscrolliabrain-cloud/agente/commit/38d0c6afaf3022d724fae49846667a19c22e749d) | 2026-11-16T12:51:59Z | docs(cognition): C15 preserve full W4 migration gate evidence |
| [812ea3601473257a03292926b79299d31822c657](https://github.com/uniscrolliabrain-cloud/agente/commit/812ea3601473257a03292926b79299d31822c657) | 2026-11-16T12:51:58Z | feat(cognition): C05 derive scoped outcome cards from verified runtime receipts |
| [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3) | 2026-11-16T13:18:56Z | test(cognition): C09 checkpoint reproduce per-run delivery ledger gap |

## Commits exclusivos de refs auxiliares

### feat/cognition-v2-W4-backfill

- [88f4246e930e3cea9f96ae8be97a7f5475358804](https://github.com/uniscrolliabrain-cloud/agente/commit/88f4246e930e3cea9f96ae8be97a7f5475358804) — feat(cognition): C01 stage resumable legacy backfill with scoped evidence and receipts
### feat/cognition-v2-W5-outcomes

- [33f97608c2d62935e019e06ab38963b4fc51b9b7](https://github.com/uniscrolliabrain-cloud/agente/commit/33f97608c2d62935e019e06ab38963b4fc51b9b7) — feat(cognition): C05 derive scoped outcome cards from verified runtime receipts
### feat/cognition-v2-W6-jev-contract

- [33f97608c2d62935e019e06ab38963b4fc51b9b7](https://github.com/uniscrolliabrain-cloud/agente/commit/33f97608c2d62935e019e06ab38963b4fc51b9b7) — feat(cognition): C05 derive scoped outcome cards from verified runtime receipts
- [1f63fa9929a48c16f02344a0b1efa52216f2e91a](https://github.com/uniscrolliabrain-cloud/agente/commit/1f63fa9929a48c16f02344a0b1efa52216f2e91a) — feat(cognition): C08 implement governed TypeSafe Jev contract adapter without live activation

Hijo: [0a809a18f31aeaba03277d2399549bd1603cd68c](https://github.com/uniscrolliabrain-cloud/agntia-ciberseguridad/commit/0a809a18f31aeaba03277d2399549bd1603cd68c): añade ACK al SDK TypeScript, fixture de contrato Python/TS y evidencia.

## Worktrees y PR

```text
worktree /workspace/uniscrolliabrain-cloud-agente
HEAD 640a55db01fc9f934bf927dec53e97035f0455f3
branch refs/heads/feat/cognition-v2-runtime-C00-C15

worktree /tmp/agente-cognition-v2-baseline
HEAD 54b8d5407a8576459448c4d059a877297d18ca7a
detached

worktree /workspace/agente-cognition-w4
HEAD 1f63fa9929a48c16f02344a0b1efa52216f2e91a
branch refs/heads/feat/cognition-v2-W6-jev-contract
```

Todos limpios al congelar código. Hijo independiente en `/workspace/agntia-ciberseguridad`, limpio. W4/W5 tienen refs sin worktree propio activo. La documentación de este checkpoint se incorpora después del SHA auditado: el commit del informe no puede incluir su propio hash, que se entrega en la respuesta de publicación.

Consultas GitHub: ninguna PR abierta en el padre; ninguna PR para la rama principal ni para la rama SDK del hijo. La PR histórica #8 no pertenece a este checkpoint. No se ha creado ni fusionado ninguna PR.

