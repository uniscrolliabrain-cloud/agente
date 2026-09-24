# Beta readiness

This branch wires the previously declarative Enterprise layer into the durable task runtime.

## What is now executable

- `kind: "sop"` is a first-class task kind.
- SOPs are validated on write and executed step-by-step with durable `sopStepIndex` and `sopResults`.
- SOP tools are allowlisted by `allowedTools`.
- Nested SOPs have cycle detection and a depth limit.
- `ask_user` pauses and resumes from the same step.
- `prepare_email` / `prepare_event` reuse the existing approval + idempotency system and resume after approval.
- Skills are bootstrapped into the private Docker workspace from `apps/computer/workspace-template/skills` when first used.
- `query_business` has real HTTP and PostgreSQL adapters plus a local durable dataset for sample mode.
- Successful SOPs create deduplicated learning memories linked to the task.
- Existing leases, CAS checkpoints, action receipts and computer isolation remain the execution substrate.

## Local smoke test

1. Copy `.env.example` to `.env`.
2. Install dependencies with `corepack pnpm install`.
3. Start the API: `pnpm dev`.
4. In another terminal: `pnpm beta:smoke`.

The smoke test exercises: task creation → SOP execution → business lookup → artifact → learning.

## Computer vertical slice

Build the isolated computer image first:

`docker build -t openmuse-computer:local apps/computer`

Set `COMPUTER_ENABLED=true`, start the API, then run:

`pnpm beta:vertical`

This exercises: task → SOP → skill bootstrap → isolated computer command → artifact → learning.

## Beta boundaries

- Python package installation is deliberately not made network-capable inside the sandbox. A requirement step fails honestly when the package is not already available; do not enable network merely to make pip convenient.
- Live Google/email/calendar writes still go through the existing reviewed ActionService.
- Business connectors beyond HTTP/PostgreSQL use the local durable adapter in this beta and should be treated as an extension point, not as production integrations.
- The model remains optional for deterministic SOPs. Open-ended `agent` tasks still use the existing CopilotKit runtime.
