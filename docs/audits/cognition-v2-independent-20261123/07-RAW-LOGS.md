# Evidencia bruta y limitaciones

Snapshot fuente: `b59b2950ee8aff9f476d4f72c7b31a24d54d632d` (2026-11-23T13:43:15Z), mensaje `docs(c06): independent agent testing handoff for V2 chat, event-to-card pipeline and branch reconciliation`.

1. GitHub `compare_commits(base=main,head=b59b2950ee8aff9f476d4f72c7b31a24d54d632d)`: ahead=45, behind=32, files=37.
2. GitHub `compare_commits(base=b59b2950ee8aff9f476d4f72c7b31a24d54d632d,head=campaign/c04-conversacion-universal)`: ahead=0, behind=34.
3. GitHub `fetch_commit_workflow_runs(commit_sha=b59b2950ee8aff9f476d4f72c7b31a24d54d632d)`: `workflow_runs=[]` (API limitada a runs PR-triggered; no deducir CI total).
4. Entorno local: `git ls-remote https://github.com/uniscrolliabrain-cloud/agente.git HEAD` → `fatal: unable to access ... Could not resolve host: github.com`. No checkout ni `pnpm` ejecutados.
5. GitHub `fetch_file(ref=b59b2950ee8aff9f476d4f72c7b31a24d54d632d)`: inspeccionados agent.ts, chat-agent.ts, runtime.ts, slow.ts, workers.ts, context.ts, external-connectors.ts, voice-session-routes.ts.
6. GitHub compare de 12 ramas: tabla en `04-BRANCH-RECONCILIATION.md`.

No inventar tiempos, cobertura ni exit codes de tests que no se han ejecutado. Los datos de lectura son evidencia estática y las conclusiones están etiquetadas como tales.
