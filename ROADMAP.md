# Beta roadmap

## Current beta slice

- [x] Durable task engine with leases and CAS checkpoints.
- [x] Action approval/idempotency and outcome-unknown recovery.
- [x] Isolated Docker computer.
- [x] First-class SOP runtime.
- [x] Skill bootstrap/runtime path.
- [x] Business-data adapter seam with PostgreSQL/HTTP/sample paths.
- [x] Learning persistence with task provenance and deduplication.
- [x] Smoke test and computer vertical slice.

## Before calling it production

- [ ] Real connector acceptance tests for every supported business source.
- [ ] Stronger skill package provenance/signing and version pinning.
- [ ] Python dependency strategy that does not require network access from the sandbox.
- [ ] Per-step retry policy and explicit compensation semantics for non-idempotent operations.
- [ ] Full nested-SOP execution stack persistence rather than beta in-process nesting.
- [ ] Multi-tenant authentication and deployment hardening.
- [ ] Observability/metrics and retention policies.
- [ ] Real Google OAuth/mail/calendar acceptance on dedicated test accounts.

The beta deliberately prefers honest boundaries over pretending an adapter is production-ready.
