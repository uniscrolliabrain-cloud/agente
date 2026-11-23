# Reconciliación contra snapshot C05

Comparaciones hechas con GitHub compare usando `b59b2950ee8aff9f476d4f72c7b31a24d54d632d` como base, no con una rama que siga avanzando. Conteos: commits exclusivos de rama comparada / exclusivos del snapshot.

| Rama | Ahead / Behind | Decisión provisional |
|---|---:|---|
| campaign/c00-preflight | 1 / 45 | docs/evidencia; no merge masivo |
| campaign/c01-arqueologia | 1 / 45 | evidencia; recuperar ledger si aporta datos |
| campaign/c02-baseline-movil | 23 / 45 | baseline web; excluir UX de backend, validar useChat en candidato |
| campaign/c03-cognition | 1 / 45 | test de regresión, evaluar cherry-pick |
| campaign/c04-conversacion-universal | 0 / 34 | ya ancestro de C05; no repetir merge |
| feat/cognition-v2-W4-backfill | 1 / 81 | comparar equivalencia patch; no sobrescribir runtime |
| feat/cognition-v2-W5-outcomes | 1 / 79 | comparar equivalencia; no sobrescribir proyector |
| feat/cognition-v2-W6-jev-contract | 2 / 79 | contrato histórico; comprobar equivalencia con main |
| feat/cognition-v2-runtime-C00-C15 | 0 / 66 | ancestro del snapshot |
| feat/cognition-v2-worker-reliability-504c0b5b | 0 / 58 | ancestro del snapshot |
| feat/cognition-v2-stepwise-001-504c0b5b | 0 / 57 | ancestro del snapshot |
| feat/voice-avatar-scaffold | 11 / 110 | no merge completo; estudiar perfiles y puertos útiles |

El snapshot C05 estaba 45 commits por delante y 32 por detrás de main en la comparación realizada. La divergencia incluye commits recientes de documentación/UI Lab; revisar por archivo y no interpretar detrás como falta de backend.

**Recomendación:** una rama de integración backend derivada de main actualizado, con C04+C05 reconciliados selectivamente y tests de C03. Conservar UX separada. No fusionar ni borrar sin aprobación.
