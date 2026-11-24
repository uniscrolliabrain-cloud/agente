# Trans01 · M1 — evidencia de ejecución

Rama `Trans01`. Base `85c8fd7`. Commits de código: `026eca0` (A01+A02 borde), `5bca1d0` (A02 perfil+A03),
`9ccd1a3` (E01/E02/E03), `ed7b505` (S01). Entorno: Node `v26.13.1`, pnpm `11.19.0` (via `npx`),
`pnpm install --frozen-lockfile` exit 0 (lockfile sin cambios). Sin proveedores reales, sin Postgres
restringido, sin deploy.

## Secuencia ejecutada

Inspección (campaña en lectura, HANDOFF, BITACORA, TURNOS, PROTOCOLO-3-MACROTURNOS,
PLAN-EJECUCION, ESPECIFICACION-V3, EVALUACION V1/V2, T02-RECONCILIACION) → baseline → patchsets
A01, A03, E01, E02, E03, S01, A02 → pruebas focales → regresión → audits → commit → bitácora.

## Baseline (antes de tocar código)

| Comprobación | Comando | Resultado |
|---|---|---|
| Typecheck | `pnpm typecheck` | exit 0 |
| Regresión focal inicial | `tsx --import ./tests/setup.ts --test tests/actions.test.ts tests/event-bus.test.ts tests/sop-contract.test.ts tests/gate/idempotency-execution.test.ts tests/campaign-3/e2e-05-authz.test.ts tests/deferred-actions.test.ts` | 29 tests, 29 PASS, 0 FAIL |

## Pruebas nuevas (M1)

| Fichero | Casos | Cubre |
|---|---|---|
| `tests/trans01-approval-hash-race.test.ts` | 4 | edicion entre lectura y claim, deny con revision vieja, claim con hash incorrecto, rollback de claim+approval |
| `tests/trans01-effect-boundary.test.ts` | 2 | generacion rotada y cuenta cambiada entre claim y `execute`; `execute` no se invoca |
| `tests/trans01-governed-runner.test.ts` | 5 | sin actor, sin PDP, sin store de claims, ruta gobernada completa, ruta legacy |
| `tests/trans01-claim-cas.test.ts` | 5 | dos workers, stale -> `outcome_unknown`, error incierto sin retry, worker tardio no pisa `done`, `failed` legacy sin fence bloqueado |
| `tests/trans01-causal-envelope.test.ts` | 8 | raiz, derivado valido, sin antecedente, tenant ajeno, correlacion distinta, actor/tenant/correlacion obligatorios, persona ≠ actor, evento legacy legible |
| `tests/trans01-event-page.test.ts` | 4 | 250 eventos en 3 paginas sin perdidas ni repeticiones, filtro de tipo antes del limite, cursor ajeno, cursor inexistente |
| `tests/trans01-sop-authz.test.ts` | 5 | sin governance, rol borrado, denegacion, autorizacion, abort |
| `tests/trans01-emit-commit.test.ts` | 2 | `pendingCommit` hasta commit; rollback no publica |
| **Total** | **35** | |

## Comandos y salidas reales (HEAD `ed7b505`)

| Comando | Exit | Salida |
|---|---|---|
| `pnpm typecheck` | 0 | `tsc --noEmit` + worker sin errores |
| `tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit` con los 7 ficheros nuevos + `actions.test.ts`, `event-bus.test.ts`, `sop-contract.test.ts`, `gate/idempotency-execution.test.ts`, `campaign-3/e2e-05-authz.test.ts`, `deferred-actions.test.ts` | 0 | **62 tests, 62 PASS, 0 FAIL** |
| `tsx ... tests/trans01-emit-commit.test.ts` | 0 | 2 tests, 2 PASS |
| Regresión ampliada: `actions-deferred-wire`, `actions`, `auth-me-tenant`, `c05-approval-permission`, `c05-shared-actions`, `cognition-v2-event-receipts`, `cognition-v2-kernel-receipts`, `cognition-v2-runtime-outcome`, `deferred-actions`, `event-bus-dedupe`, `event-bus-stress`, `event-bus`, `events-sse`, `policy-engine`, `sop-contract`, `sop-triggers`, `tenant-isolation`, `tenant-permissions`, `tenant-worker-claim`, `vertical-slice-approval`, `workflows`, `roadmap/b30-computer-governance`, `kernel` | 0 | **92 tests, 90 PASS, 2 SKIP, 0 FAIL** |
| `pnpm run audit:contracts` | 0 | 307 OK / 65 MODULO / 1 HARNESS / 9 PENDING / 0 HUERFANOS |
| `pnpm run audit:idempotency` | 0 | 2414 marcas, 0 huerfanas, 0 pegadas dos veces |
| `pnpm run audit:anchors` | 0 | sin bloques que revisar |
| `pnpm run audit:tenant-default` | 0 | 161 permitidas, 0 prohibidas |
| `pnpm run audit:coherence` | 0 | 7/7 checks OK |
| `pnpm run audit:layers` | 0 | 0 violaciones |
| `pnpm run audit:bridges` | 0 | 16/16 wired |
| `pnpm run audit:console` | 0 | 25 ocurrencias en 287 ficheros |

## Ownership comprobado

`git diff --name-only 85c8fd7..HEAD` limitado a:

- `apps/server/src/actions.ts`, `apps/server/src/db.ts`, `apps/server/src/db-tenant.ts`
- `apps/server/src/engine/events/{types,bus}.ts`, `apps/server/src/engine/events/sinks/store.ts`
- `apps/server/src/engine/execution/capability-runner.ts`
- `apps/server/src/engine/sop-executor.ts`
- `tests/trans01-*.test.ts` y esta carpeta documental

Ningun path de trans02, Trans03, Trans04, UX, `agntia-demo`, gates o CI. Ningun test existente
modificado. Sin merges, sin force push, sin despliegues, sin secretos.

## No ejecutado (NOT_RUN, nunca PASS)

- `pnpm gate` completo y suite global de 176 ficheros: el README declara ~165 fallos preexistentes
  ajenos a esta rama; se ejecutaron en su lugar los 8 audits del gate y las suites afectadas.
- Postgres restringido real, concurrencia multi-proceso y restore (`pnpm verify:slice`,
  `pnpm test:cognition-v2`, `pnpm test` global).
- Proveedores reales (Google, WhatsApp, computer Docker) y cualquier efecto externo.
- Caso crash post-commit / pre-publish en proceso separado: solo se cubre por simulacion de rollback
  y por `pendingCommit`.

## Bloqueos vigentes

- **C01** selector unico de conversacion: ABI de trans02.
- **H01** hooks de telemetria: interfaz de Trans04.
- **E03** recibo empresarial verificado: contrato compartido Trans02/03/04.
- **A03** clasificacion `rejectedBeforeDispatch`/`accepted` por adaptador: contrato de Trans03.
- **A02** activacion de `governed_v2` en `service.ts`: inventario de callers + aprobacion de B2.
- **B2**: revision combinada del supervisor; el gate combinado sigue pendiente y NO_GO se mantiene.
