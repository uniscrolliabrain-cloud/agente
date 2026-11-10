# RESULT · campaña tenant ACME (20 etapas)

- **Fecha**: 2026-11-10
- **Rama**: `feat/acme-tenant`, base `6b9b28c` (`docs(campaña): plan de 20 etapas para el tenant ACME`)
- **Estado**: campaña ejecutada E01–E20. **Sin commit**: todo el trabajo sigue en el árbol de trabajo, a la espera de autorización (R11).
- **Baseline de comparación**: `artifacts/acme/baseline.txt` (E01) + gate medido sobre un worktree limpio de `6b9b28c`.

## 1. Typecheck

| Check | Baseline (E01) | Cierre (E20) |
|---|---|---|
| `tsc --noEmit` raíz | exit 0 | **exit 0** |
| `typecheck` worker (`apps/worker`) | exit 0 | **exit 0** |

Sin errores nuevos ni cambios en `tsconfig`/`package.json`.

## 2. Tests

`node_modules/.bin/tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests`

- exit **0**, **0 fallos**, 603 pruebas en 130 ficheros.
- `tests/tenant-acme-isolation.test.ts` en verde dentro de la suite.

Suites nuevas de la campaña (todas en verde):

| Fichero | Pruebas | Qué fija |
|---|---|---|
| `tests/acme-dataset.test.ts` | 9 | modelo explícito y schemas cerrados (R4/R6) |
| `tests/tenant-acme-isolation.test.ts` | — | prefijo `acme:` en cada escritura, sin fugas a `default` |
| `tests/acme-workspaces.test.ts` | 12 | 3 módulos, 7 vistas y specs válidas |
| `tests/acme-queries.test.ts` | 28 | 21 handlers leyendo por tenant |
| `tests/acme-view-specs.test.ts` | 5 | specs reales contra `view-envelope` sin relajarlo |
| `tests/workspaces-tenant.test.ts` | 5 | endpoint tenant-scoped, 403 `TENANT_REQUIRED` |
| `tests/auth-me-tenant.test.ts` | 2 | `/api/auth/me` devuelve `tenantId` |
| `tests/analytics-overview.test.ts` | 5 | overview por tenant, 403 sin tenant, `default` a cero |

## 3. Nuevo tenant ACME aislado

- Tenant `acme` creado con `scripts/provision-acme-tenant.ts`; datos sintéticos **sólo** en `DATA_DIR=artifacts/demo/acme` (PGlite real en `<DATA_DIR>/postgres`), con prefijo `acme:` verificado en cada `put`.
- Seed idempotente `scripts/seed-acme.ts` (ejecutado 2×, exit 0): 4 usuarios, 4 agentes, 10 memorias, 10 tareas (8 estados), 3 obras (78/64/42 %), 2 artefactos, 4 leads, 3 clientes, 4 facturas (27 450 €), WhatsApp `acme-demo` + 2 borradores + 2 bandeja, 4 documentos / 3 fuentes / 6 chunks, 4 acciones, 4 notificaciones.
- 3 workspaces nuevos (`acme-obras`, `acme-clientes`, `acme-suministros`) con 7 vistas y 21 handlers tenant-scoped; `readTenantRows` usa `scanByPrefix(kind, tenantId, …)` con fallback a `list(owner)`.
- Superficie nueva: `GET /api/workspaces/<id>/view` (tenant de `ctx`, 403 `TENANT_REQUIRED`) y `GET /api/analytics/overview` (KPIs y filas del tenant).
- Comprobación real con backend (`artifacts/acme/verify-e19.ts`): ACME 200 con `openTasks 7`, `pendingAmountEur 16900`, 10 tareas / 3 proyectos / 4 leads / 3 clientes / 4 acciones / 3 avisos / 4 agentes; `default` 200 con todo a 0.

## 4. Gate

`node_modules/.bin/tsx scripts/gate-report.ts` → **8/10 steps en verde**, mismos dos fallos que la base:

| Step | Baseline `6b9b28c` | Cierre |
|---|---|---|
| `audit:contracts` | FAIL · 6 huérfanos | FAIL · **6 huérfanos, los mismos** |
| `audit:bridges` | FAIL · 12/16 wired | FAIL · **12/16 wired** (4 marcadores de `kernel/subscribers`) |

Comparación hecha de verdad: worktree limpio en `6b9b28c`, `node --import tsx scripts/audits/{contracts,bridges}.ts`, y los mismos scripts en el árbol de campaña.

Los 7 alias de tipo de `packages/domain/src/acme-dataset.ts` (`AcmeLead`, `AcmeProject`, `AcmeTicket`, sus estados y `AcmeAgentMetric`) aparecían como huérfanos porque los schemas se usan pero las vistas aún no anotan sus filas. Se declaran con `PENDING(2026-11-30)` y el motivo, que es el mecanismo previsto por el propio audit: `PENDING` pasó de 2 a 9 y la lista de huérfanos volvió a los 6 preexistentes. No se tocaron schemas, `views.ts` ni `view-envelope.ts`.

Los 4 puentes que faltan (`bus-to-kernel`, `kernel-audit-consumer`, `kernel-metrics-consumer`, `kernel-notifications-consumer`) son de `apps/server/src/kernel/subscribers/`, código que esta campaña no toca.

## 5. Doble sesión ACME / `default`

Verificado a nivel **HTTP**, no con dos navegadores:

- `tests/tenant-http-e2e.test.ts`: dos sesiones simultáneas contra `/api/threads`, cero cruces.
- `tests/tenant-acme-isolation.test.ts`: `/api/agent` y `/api/threads` con la sesión ACME no devuelven nada de `default`, y cada escritura del seed cae bajo el prefijo `acme:`.
- `tests/workspaces-tenant.test.ts`: `/api/workspaces/<id>/view` sirve filas para ACME y lista vacía para otro tenant; sin `tenantId` → 403 `TENANT_REQUIRED`.
- `tests/analytics-overview.test.ts`: ACME con KPIs reales, `default` con todo a 0.

Cruce en dos navegadores reales: **no ejecutado**; ver §8.

## 6. Suspensión

Cubierto por `tests/tenant-permissions.test.ts`: `POST /api/admin/tenants/<id>/suspend` → siguiente `GET /api/agent` responde 403 `{"error":"Empresa suspendida","code":"TENANT_SUSPENDED"}` y `resume` lo devuelve a 200. El mecanismo es común a todos los tenants; no se suspendió `acme` en el backend de demo para no dejar el dataset inservible.

## 7. Sandbox de UI `apps/web/src/demo`

**Decisión: se mantiene**, aislado y sin backend.

- Sólo se activa con el token `demo:interfaz`; `apiFetch` corta antes de la red.
- El Centro de Mando demo vive en `useDemoCentroMandoData.ts` (hook antiguo, intacto) y el hook real en `useCentroMandoData.ts`. Con sesión real no se pinta ninguna cadena "Interfaz": comprobado con `grep` sobre `CentroMandoWorkspace.tsx`.
- Retirarlo habría cambiado el comportamiento de la demo sin que la campaña lo pidiera.

## 8. Qué queda abierto

1. **Sin captura ni revisión visual**: no se abrió backend + web en navegador; las 21 vistas y el panel están compilados (`vite build` exit 0) y sus datos verificados por HTTP, pero no vistos en pantalla.
2. **Agentes del panel vacíos a propósito**: no existe `AgentMetric` en el seed y no se inventa una confianza calculada (el demo sí la deriva).
3. **Formularios de las vistas nuevas no persisten**: sólo lectura + navegación; el alta de datos no estaba en el alcance de E14–E19.
4. **H23 abierto**: el dashboard usa 2 KPIs genéricos del spec.
5. **Catálogo global**: los 37 módulos los ve cualquier tenant; un tenant sin datos ve las vistas vacías (documentado en E14).
6. **Sin commit**: pendiente de autorización explícita.

## 9. Cómo reproducir

```bash
node_modules/.bin/tsc --noEmit
npm --prefix apps/worker run typecheck
node_modules/.bin/tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests
node_modules/.bin/tsx scripts/gate-report.ts

DATA_DIR=artifacts/demo/acme node_modules/.bin/tsx scripts/seed-acme.ts
DATA_DIR=artifacts/demo/acme node_modules/.bin/tsx artifacts/acme/verify-e19.ts
```

Evidencias por etapa en `docs/campaigns/acme-tenant/E02…E19-*.md`; logs de este cierre en `artifacts/acme/e20-tests.log` y `artifacts/acme/e20-gate.log` (gitignored).
