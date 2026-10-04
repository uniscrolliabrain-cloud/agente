# 01 — Tests

> v1 · 2026-10-04 · Estado: audited
> Fuente: docs/audits/_prep/test-full.txt (pnpm test, 218 casos)

## Ontología del área

Conceptos que cubre esta rama: `AgentTask`, `ActionProposal`, `Mail`,
`CalendarEvent`, `BrowserSession`, `ComputerCommand`, `Thought`, `Turn`,
`AuditEntry`, `CapabilityContract`, `Outcome`, `Goal`, `Verification`.

Los tests son la única forma de verificar que la ontología declarada
funciona de verdad.

## Estado real del código

- 218 casos en `tests/*.test.ts`.
- **11 tests con timeout a 20s**. No por bug de código, sino porque sus
  `before` hooks dependen de servicios externos que se cuelgan:
  - `tests/agent-api.test.ts` → `createApp` no resuelve a tiempo.
  - `tests/auth.test.ts`, `tests/api.test.ts` → idem.
  - `tests/browser.test.ts` → arranca un server HTTP en cada test.
  - `tests/computer-api.test.ts` → `createStore` + Docker.
  - `tests/memory.test.ts`, `tests/tasks-reassign.test.ts`, `tests/workflows.test.ts`
    → su `after` revienta con `TypeError: Cannot read properties of undefined (reading 'agent')`,
    porque el `before` no llegó a asignar `server`.
  - `tests/persistence.test.ts`, `tests/rag.test.ts` → PGlite con contención de disco.
  - `tests/model-worker.test.ts` → agota la cuota de Gemini (429).

## Evidencia

De `test-full.txt`:
- Los tests unitarios (actions, computer, google, pdf, vault, event-bus,
  policy, rag unitarios) pasan en <500ms.
- Los tests de integración con `createApp` se cuelgan en `before` o en `after`.
- 429 de Gemini: `Quota exceeded for metric: generate_content_free_tier_requests,
  limit: 5, model: gemini-3.6-flash`.
- Muchos tests muestran tiempos bajos (0.4ms, 0.8ms) pero el runner los marca
  como timeout, señal de que algo del runner se cuelga al final.

## Huecos concretos

- **Los `after` hooks no están protegidos**. Si `before` falla, `after`
  revienta con `TypeError`. Falta `if (server) await server.agent.stop()`.
- **Los tests de integración no aíslan servicios externos**. Dependen de
  Gemini (429), PGlite (contención), Docker.
- **No hay cobertura medida**. Sin `c8` ni `nyc`.
- **No hay test de kernel cognitivo**: `Thought`, `Turn`, `AttentionVector`,
  `Promoter`, `Meta`, `Presenter` no tienen tests directos.
- **No hay test de `closeTurnAndChildren`**, ni de race entre `promote` y `close`.
- **No hay test multi-tenant con N tenants concurrentes**.

## Interrelación

- Depende de **todos** los módulos: es transversal.
- Bloquea el cierre de cualquier rama: no puedes declarar un área "cerrada"
  sin tests verdes.
- Comparte infraestructura con `14-google-drive-gmail` (mocks HTTP),
  `20-computer-sandbox` (Docker), `21-browser-worker` (Playwright).

## Riesgos

- Que un fix en `service.ts` (por ejemplo el de `systemContext`) rompa los
  tests de `memory` que ya están colgados.
- Que un test pase pero por la razón equivocada (falso verde).
- Que la suite entera tarde >3 min y nadie la corra.

## Tipo de fixes

1. Aislar tests de servicios externos: mocks en lugar de llamadas reales
   a Gemini/OpenRouter.
2. Proteger `after` hooks: `if (server) await server.agent.stop()`.
3. Instrumentar cobertura (`c8` o `nyc`).
4. Tests del kernel: `tests/kernel/*.test.ts` con fixtures de `Thought`.
5. Test de crash-recovery: matar el proceso, reiniciar, verificar.
6. Configurar `--test-concurrency=1` si la contención de PGlite es el cuello.
