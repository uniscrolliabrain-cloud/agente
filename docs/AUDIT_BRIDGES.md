# Auditoria de puentes

> 2026-10-26T15:02:25.712Z

- Puentes definidos: **16**
- Wired: **16**
- Broken: **0**

| Puente | From | To | Estado | Ficheros | Marcas faltantes |
|---|---|---|---|---|---|
| bus-to-kernel | bus | kernel | OK | - | - |
| kernel-to-bus | kernel | bus | OK | - | - |
| promoter-to-memory | promoter | memory | OK | - | - |
| promoter-to-graph | promoter | graph | OK | - | - |
| promoter-to-audit | promoter | audit | OK | - | - |
| presenter-to-sse | presenter | sse | OK | - | - |
| meta-to-prompt | meta | prompt | OK | - | - |
| build-apply | build | registry | OK | - | - |
| state-changed-consumer | bus | state-log | OK | - | - |
| state-denied-consumer | bus | state-log | OK | - | - |
| verification-disagreement | bus | approval | OK | - | - |
| kernel-audit-consumer | bus | kernel-audit | OK | - | - |
| kernel-metrics-consumer | bus | metrics | OK | - | - |
| kernel-notifications-consumer | bus | notifications | OK | - | - |
| meta-hints-store | conversation | meta-hints-db | OK | - | - |
| personas-bootstrap | index | personas | OK | - | - |
