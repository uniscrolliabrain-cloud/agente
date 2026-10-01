# OpenMuse Enterprise - Cognitive Kernel V2

Durable: Tasks (kind=sop) -> SOPExecutor (leases + CAS + allowedTools + cycle/depth + ask_user + approval) -> Computer Docker 512MB no-network no-new-privileges -> Business HTTP/PG/sample -> Learning deduplicada sop:<taskId>.

+ Kernel feat/cognitive-kernel d9d5066 32 archivos +2142: Grafo efimero Turn, Thought con AttentionVector completo Zod (author/id/thoughtId/timestamp/metadata + matchReason 9 + ignoreReason 8 + matched/ignored con kind/metadata + superRefine no-solape/no-duplicados), ProgressEvent progress|partial|ready|failed, Meta 4 reglas slow_ready_fast_idle/medium, slow_long_no_output/low 30s, slow_failed_urgent/high, nothing_to_report/low, Views readView vs computeView, Promoter rules.ts explicitas + decisions + consolidate duplicados/contradicciones, Store V2 con tenantId, authors fast/slow/user, presenter PRIORITY ampliada.

Stack: pnpm 11.19.0 Node>=22 Hono 4.11 AG-UI 0.0.59 pglite 0.3.14
Quickstart: pnpm dev, pnpm beta:smoke, docker build -t openmuse-computer:local apps/computer; COMPUTER_ENABLED=true pnpm beta:vertical
Garantia: service.kernel opcional, fallback transparente. KERNEL_NONFATAL.