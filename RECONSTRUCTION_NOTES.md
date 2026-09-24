# Reconstruction notes — Enterprise beta

Source: supplied `Repodump.md` (105 file sections).

## Runtime changes

1. `AgentTask.kind` now includes `sop` as a real domain type.
2. `AgentService` dispatches SOP tasks to `SOPExecutor` instead of the generic LLM agent.
3. `SOPExecutor` persists step index/results/version/stack, enforces tool allowlists, handles pause/resume, approval resume, nested SOP depth/cycle protection, computer execution, business queries, artifacts and learning.
4. `LearningService` stores deduplicated memories with `sop:<taskId>` provenance.
5. `BusinessDataService` supports HTTP, PostgreSQL and deterministic sample-mode records.
6. Skill bootstrap copies built-in skill files into the isolated Docker workspace on first use.
7. SOP routes now validate against the domain schema instead of accepting arbitrary JSON.
8. The old `/api/skills/:id/install` response no longer pretends that `pip install` is performed; runtime installation happens when the skill is used.
9. Stale mobile-only package/test references were removed from this lean server repository.
10. Added `pnpm beta:smoke` and `pnpm beta:vertical`.

## Verification performed here

- Reconstructed 105 source sections into an actual folder tree.
- Removed repodump separator artifacts from reconstructed files.
- `package.json` parses successfully.
- TypeScript source was transpile-parsed with TypeScript 5.8.3: no syntax errors.
- All relative local imports were checked and resolve to existing `.ts/.tsx` files.
- Full `tsc --noEmit` could not be completed in this environment because the repository dependencies/node type declarations are not installed and this environment has no npm registry access. Run `corepack pnpm install && pnpm typecheck` on the development machine before the first GitHub push.
- Docker vertical execution could not be run here because Docker is not available in the execution environment.

## Intended next pass with Cline

Use Cline for provider-specific typecheck fixes after dependency installation, real connector credentials, UI polish, and any deployment-specific details. The execution architecture should not be replaced with prompt-only SOP behavior.
