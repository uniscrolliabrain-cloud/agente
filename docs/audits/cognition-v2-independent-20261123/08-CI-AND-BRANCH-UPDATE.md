# Actualización independiente — CI y ramas no UX

## CI del snapshot b59b2950ee8aff9f476d4f72c7b31a24d54d632d
GitHub Actions: https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45186714681

Instalación y typecheck PASS. Suites voz, conectores externos y chat V2 PASS. HTTP Cognition V2 FAIL. El mismo fallo persistió en el snapshot C06 `4f426ca`: stream `RUN_ERROR` con `Cannot read properties of undefined (reading 'chat')` en `tests/cognition-v2-http.test.ts:62`, https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45187387576. No certificar conversación E2E. El test del puente Slow solo existe en el segundo snapshot y pasó 2/2.

## Inventario de ramas técnicas comparadas con main (2026-11-23)
Criterio: se excluyen UX/UI Lab/landing/legal/mobile y ramas de presentación. El inventario siguiente es de ramas de backend, auditoría o documentación de arquitectura; ahead/behind es historia Git, no medida de falta de funcionalidad.

| Rama | Ahead | Behind | Lectura |
|---|---:|---:|---|
| audit/preflight-cognition-option3-20261115 | 57 | 97 | auditoría/docs históricos |
| audit/update-docs-20261118 | 75 | 97 | docs |
| campaign/c00-preflight | 1 | 32 | evidencia |
| campaign/c01-arqueologia | 1 | 32 | TSV evidencia |
| campaign/c03-cognition | 1 | 32 | test HTTP exclusivo |
| campaign/c04-conversacion-universal | 11 | 32 | integrado como ancestro de C05 |
| docs/audit-30-dominios-runtime-20261115 | 70 | 97 | docs |
| docs/doppler-auth | 1 | 40 | docs |
| docs/integracion-transversal-coherente-20261121 | 10 | 32 | docs/evidencia |
| docs/observability-dogfooding-audit-20261117 | 5 | 40 | docs |
| docs/vigencia-2026-11-10 | 4 | 103 | docs |
| docs/2026-11-17-universal-conversation | 16 | 45 | docs |
| feat/cognition-v2-W4-backfill | 1 | 68 | cambios backfill/rls, requieren equivalencia |
| feat/cognition-v2-W5-outcomes | 1 | 66 | cambios outcome, requieren equivalencia |
| feat/cognition-v2-W6-jev-contract | 2 | 66 | cambios JEV, requieren equivalencia |
| feat/cognition-v2-runtime-C00-C15 | 0 | 53 | ancestro de main |
| feat/cognition-v2-stepwise-001-504c0b5b | 0 | 44 | ancestro de main |
| feat/cognition-v2-worker-reliability-504c0b5b | 0 | 45 | ancestro de main |
| feat/continuacion-c05-voz-cognition-v2 | 51 | 32 | backend activo; incluye C06.P03a |
| feat/voice-avatar-scaffold | 11 | 97 | divergente; no merge global |

El inventario también excluye `campaign/c02-baseline-movil` por orientación móvil y `docs/audit-time-scheduler-mobile-push-20261122` por alcance móvil. Las ramas de auditoría creadas en esta conversación contienen documentación y workflow de pruebas, no funcionalidades de producto.

**Pendiente para declarar auditoría completa:** ejecutar pruebas en un árbol integrado, revisar patch-equivalence W4/W5/W6, comprobar seguridad de AG-UI remoto y hacer E2E de evento→Slow→tarjeta. No fusionar ni borrar ramas con este inventario solamente.
