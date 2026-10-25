# Etapa 09 — Integraciones empresariales y capa de conectores

## 1. Objetivo y alcance

Conectar los procesos de la empresa con sistemas externos reales: CRM, Holded, Stripe, correo, calendario, almacenamiento, mensajería. No es "añadir HTTP": es dar capacidades empresariales fiables con credenciales por tenant, mapeo a ontología, y registro de operaciones.

## 2. Subsistemas involucrados

- `packages/integrations/src/` — Google, PDF, vault, stubs.
- `apps/server/src/engine/actions.ts` — propuestas y ejecución.
- `apps/server/src/engine/tool-executors.ts` — ejecutores de capability.
- `apps/server/src/engine/workspaces/bridge.ts` — bridge de workspaces.
- `apps/server/src/engine/workspace.ts` — `WorkspaceService`.
- `apps/server/src/engine/google-auth.ts` — OAuth Google.
- `packages/domain/src/capability.ts` — contrato de capability.

## 3. Fases y tareas

- [ ] Fase 1 — Seleccionar conectores del piloto (los imprescindibles para la primera empresa).
- [ ] Fase 2 — Contrato de conector: `execute(action, credentials) → result`, errores, timeouts, retries.
- [ ] Fase 3 — Credenciales por tenant: vault, OAuth, rotación.
- [ ] Fase 4 — Mapeo modelo externo ↔ ontología interna.
- [ ] Fase 5 — Registro de operaciones y conciliación.
- [ ] Fase 6 — Webhooks, sincronización, límites de API.
- [ ] Fase 7 — Ampliar catálogo según necesidades reales del piloto.

## 4. Criterios de auditoría

| # | Criterio | Cómo se audita |
|---|---|---|
| A1 | Cada conector tiene contrato `execute` | `packages/integrations/src/` |
| A2 | Cada conector valida credenciales del tenant | `Select-String` de `tenantId` |
| A3 | Cada operación queda registrada | `Select-String` de `audit` |
| A4 | Un fallo de conector no tumba el worker | Test de aceptación |

## 5. Criterios de aceptación (tests)

| # | Test | Fichero | Casos |
|---|---|---|---|
| T1 | Un conector válido ejecuta | `tests/roadmap/etapa-09.test.ts` | mock de API + execute |
| T2 | Un conector con credencial inválida falla explícito | idem | 401 del provider |
| T3 | Un timeout se recupera | idem | provider lento + retry |
| T4 | Un tenant no usa credencial de otro | idem | tenant A con credencial de B |

## 6. Evidencia actual en el repo

| Subsistema | Estado | Evidencia |
|---|---|---|
| Google (Gmail, Calendar, Drive) | `EXISTE` | `packages/integrations/src/google.ts`, `engine/google-auth.ts` |
| PDF | `EXISTE` | `packages/integrations/src/pdf.ts` |
| Vault | `EXISTE` | `packages/integrations/src/vault.ts` |
| WhatsApp stub | `PARCIAL` | `packages/integrations/src/stubs/whatsapp.ts` |
| Stripe stub | `PARCIAL` | `packages/integrations/src/stubs/stripe.ts` |
| GMB stub | `PARCIAL` | `packages/integrations/src/stubs/gmb.ts` |
| Social stub | `PARCIAL` | `packages/integrations/src/stubs/social.ts` |
| Holded | `NO_EXISTE` | — |
| CRM genérico | `NO_EXISTE` | — |
| Contrato de conector unificado | `NO_EXISTE` | — |
| Credenciales por tenant | `PARCIAL` | `google-auth.ts` (solo Google) |
| Registro de operaciones externas | `PARCIAL` | `actions.ts` (audit) |
| Webhooks / sync | `PARCIAL` | `whatsapp-routes.ts` |

## 7. Brecha

- [ ] Contrato `Connector` unificado.
- [ ] Conectores del piloto (según sector).
- [ ] Credenciales por tenant para todos los conectores.
- [ ] Registro de operaciones externas unificado.
- [ ] Webhooks y sync.

## 8. Handoff

- [ ] Conectores del piloto → etapa 10 (piloto).
- [ ] Contrato `Connector` → etapa 12 (industrialización, catálogo de conectores).

## 9. Miniroadmaps internos

`09-integraciones/` con fases 1–7.