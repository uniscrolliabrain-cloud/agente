# Contributing

The project is currently focused on the Enterprise beta runtime.

1. Install dependencies with `corepack pnpm install`.
2. Run `pnpm typecheck` and `pnpm test`.
3. Start the sample API with `pnpm dev`.
4. Run `pnpm beta:smoke`.
5. If Docker is available, build `apps/computer` and run `pnpm beta:vertical`.

Changes to the execution engine should preserve durable checkpoints, lease ownership, idempotency and explicit approval boundaries.
