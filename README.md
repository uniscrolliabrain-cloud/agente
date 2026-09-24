# OpenMuse Enterprise Beta

Durable enterprise agent runtime built around **Tasks → SOPs → Skills → Tools → Validation → Learning**.

This repository is the Enterprise branch reconstructed from the supplied OpenMuse codebase. The original durable task engine, CAS/lease checkpoints, ActionService approval flow and isolated Docker computer are preserved; the Enterprise layer is now wired into the runtime instead of being prompt-only metadata.

## Beta vertical slice

```text
POST /api/agent/tasks
        ↓
   kind = "sop"
        ↓
     SOPExecutor
        ↓
  current SOP step
        ↓
 computer / business / browser / approval / artifact
        ↓
 durable checkpoint
        ↓
 next step
        ↓
 LearningService
        ↓
 memory linked to task
```

### Implemented

- First-class `sop` task kind.
- SOP validation and CRUD.
- Durable SOP step index, results, version and execution stack.
- Allowlisted SOP tools.
- Nested SOP cycle/depth protection.
- `ask_user` pause/resume.
- Reviewed email/calendar actions with existing idempotency and approval receipts.
- Skill bootstrap into the private Docker workspace from the built-in skill library.
- HTTP/PostgreSQL business queries plus deterministic sample-mode business records.
- Deduplicated learning memories after successful SOP execution.
- Beta smoke and computer vertical-slice scripts.
- Existing Docker computer isolation, leases, CAS checkpoints and action recovery retained.

## Start

```bash
corepack pnpm install
cp .env.example .env
pnpm dev
```

The deterministic SOP runtime does **not** require `CPK_INTELLIGENCE_API_KEY`. Open-ended model tasks still require their configured model/provider credentials.

## Smoke test

With the API running:

```bash
pnpm beta:smoke
```

This verifies task creation → SOP execution → business lookup → artifact → learning.

## Computer vertical slice

Build the sandbox image:

```bash
docker build -t openmuse-computer:local apps/computer
```

Set `COMPUTER_ENABLED=true`, restart the API, then:

```bash
pnpm beta:vertical
```

This verifies task → SOP → skill bootstrap → isolated Python skill → artifact → learning.

See [`BETA.md`](BETA.md) for the exact beta boundaries and failure semantics.
