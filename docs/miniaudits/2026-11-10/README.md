# Miniaudits · 2026-11-10

> 24 informes recibidos + el bloque 08 sin informe. **327 hallazgos**.
> Fuente: auditoría externa del 2026-11-10, contrastada contra `main` en `05126b1`.

## Cómo leer estos informes

- **Estado `Vigente` / `Confirmado`**: lo he comprobado en el código actual y sigue ahí.
- **`Parcial`**: existe la pieza, falta el cableado (o al revés).
- **`Ya arreglado`**: el informe lo describe, pero `main` ya lo corrigió; se indica dónde.
- **`Sin verificar`**: no lo he comprobado todavía. **No** significa que sea falso.

## Índice

| # | Bloque | Hallazgos | S0 | S1 | S2 | S3 | Informe |
|---|---|---|---|---|---|---|---|
| 01 | Coherencia | 10 | 0 | 4 | 3 | 3 | [01-coherencia](01-coherencia/miniaudit.md) |
| 02 | Tests | 12 | 1 | 5 | 4 | 2 | [02-tests](02-tests/miniaudit.md) |
| 03 | Observabilidad | 20 | 0 | 7 | 8 | 5 | [03-observabilidad](03-observabilidad/miniaudit.md) |
| 04 | Resiliencia | 14 | 1 | 4 | 7 | 2 | [04-resiliencia](04-resiliencia/miniaudit.md) |
| 05 | Multi-usuario | 11 | 0 | 4 | 4 | 3 | [05-multi-usuario](05-multi-usuario/miniaudit.md) |
| 06 | Motor de tareas | 14 | 1 | 4 | 6 | 3 | [06-motor-tareas](06-motor-tareas/miniaudit.md) |
| 07 | Aprobaciones | 13 | 0 | 5 | 5 | 3 | [07-aprobaciones](07-aprobaciones/miniaudit.md) |
| 08 | Aislamiento multi-tenant | — | — | — | — | — | [sin informe](08-aislamiento-multi-tenant/miniaudit.md) |
| 09 | Bus de eventos | 15 | 0 | 5 | 7 | 3 | [09-bus-eventos](09-bus-eventos/miniaudit.md) |
| 10 | Kernel cognitivo | 14 | 2 | 5 | 5 | 2 | [10-kernel-cognitivo](10-kernel-cognitivo/miniaudit.md) |
| 11 | Fast/slow | 13 | 0 | 5 | 6 | 2 | [11-fast-slow](11-fast-slow/miniaudit.md) |
| 12 | Chat con LLM | 15 | 0 | 5 | 6 | 4 | [12-chat-llm](12-chat-llm/miniaudit.md) |
| 13 | Contexto y memoria | 14 | 0 | 5 | 6 | 3 | [13-contexto-memoria](13-contexto-memoria/miniaudit.md) |
| 14 | UI servida y viewspec | 15 | 0 | 4 | 8 | 3 | [14-ui-servida-viewspec](14-ui-servida-viewspec/miniaudit.md) |
| 15 | Templates reales | 12 | 0 | 3 | 6 | 3 | [15-templates](15-templates/miniaudit.md) |
| 16 | Frontend | 13 | 0 | 3 | 6 | 4 | [16-frontend](16-frontend/miniaudit.md) |
| 17 | Autenticación | 13 | 0 | 5 | 6 | 2 | [17-autenticacion](17-autenticacion/miniaudit.md) |
| 18 | Seguridad básica | 14 | 0 | 5 | 5 | 4 | [18-seguridad](18-seguridad/miniaudit.md) |
| 19 | Deploy e infra | 13 | 0 | 5 | 6 | 2 | [19-deploy-infra](19-deploy-infra/miniaudit.md) |
| 20 | Backups y restore | 13 | 0 | 6 | 5 | 2 | [20-backups-restore](20-backups-restore/miniaudit.md) |
| 21 | Computer | 13 | 0 | 3 | 7 | 3 | [21-computer](21-computer/miniaudit.md) |
| 22 | Browser worker | 12 | 0 | 3 | 6 | 3 | [22-browser-worker](22-browser-worker/miniaudit.md) |
| 23 | Google | 13 | 0 | 4 | 6 | 3 | [23-google](23-google/miniaudit.md) |
| 24 | WhatsApp, Stripe y GMB | 15 | 0 | 8 | 5 | 2 | [24-whatsapp-stripe-gmb](24-whatsapp-stripe-gmb/miniaudit.md) |
| 25 | Business OS y objetivos | 16 | 0 | 6 | 6 | 4 | [25-business-os-goals](25-business-os-goals/miniaudit.md) |
| | **Total** | **327** | **5** | **113** | **139** | **70** | |

## Los cinco S0

| # | Bloque | Hallazgo |
|---|---|---|
| 1 | 02 · Tests | 9 `test.skip` vacíos en `tests/campaign-3/e2e-02..12` (kernel, aislamiento, authz, idempotencia, worker interrumpido, compensación, promoción, aprendizaje, `KernelPort`). |
| 2 | 04 · Resiliencia | Un timeout de tarea se reencola sin límite: `attempts` no se compara con ningún máximo y nunca llega a DLQ. |
| 3 | 06 · Motor | El timeout reencola en lugar de fallar (mismo defecto que 04-01). |
| 4 | 10 · Kernel | `ctx.roleId ?? "default"` contra un rol inexistente: `Role not found: default`. |
| 5 | 10 · Kernel | El fallo del goal queda en `background_failure` y el goal se queda en `draft`. |

## Ya comentado / matizado al contrastar

- **01-1, 14-1**: siguen 34 módulos legacy con `VIEWS = []`, pero el catálogo ya tiene 37 y los 3 de ACME declaran 21 vistas.
- **06-5**: `scanByStatusWithTenant` existe en `db-tenant.ts:164`; el acceso sin scope por tenant está corregido.
- **14-4**: el `?? owner` sigue en `/api/views/resolve` (`routes/views.ts:81`), pero `/api/workspaces` lo cerró en E17.
- **03-1**: `getTenantId` existe como opción del logger; falta comprobar el cableado en `app.ts`.
- **19-4**: confirmado en E20 — el gate falla en `audit:contracts` con 6 huérfanos.

## Qué falta

1. Validar el resto de los hallazgos (los `Sin verificar`) uno a uno contra el código.
2. Informe **08** de aislamiento multi-tenant.
3. Priorizar: los 5 S0 primero, después los 113 S1 agrupados por arreglo común (techo de intentos, tenant en el envelope, scopes, sesión invalidable).

---

## Modelo de despliegue vigente

`PRODUCT.md`, `WHITEPAPER.md` y `docs/operacion/TODO-FOR-PROD.md` dicen "un deployment por cliente, sin multitenancy". Eso es **legacy**. La decisión vigente es **un deployment compartido con N tenants**: `DEPLOY.md` §1 ya fija tenant por token, `EQUIPO.md` §8 propone multitenant ("un deployment, N tenants") y el código lo implementa — `resolveTenantPrincipal` resuelve tenant, actor y membership en un solo punto; `MULTI_TENANT_SHARED=true` activa RLS Postgres; y `"default"` sólo sobrevive con `AUTH_PROVIDER=session` o en modo sample. Los 25 informes se leen así: tenant siempre del principal/contexto, nunca del body ni del query string.

## Revisión contra el destino del repo

Los 24 informes son correctos en lo técnico, pero se escribieron sin el criterio de terminado del producto (`docs/02-producto/PRODUCT.md` —cuyo modelo de despliegue es legacy, ver arriba— y `docs/2026-11-10/06-futuro-y-plan-de-handoff.md`). Contrastados con él, faltan cinco familias de arreglos que ningún bloque propone y que he añadido a cada informe:

1. **Gobierno de datos (PolicyEngine).** El criterio de Fase 1 no es "la vista sale", es "sale si el actor puede verla". Hoy `canView: true` y `permissions: []`. Bloquea datos reales (08, 14, 18).
2. **Una acción vertical completa.** El handoff es explícito: contrato, endpoint, idempotencia, UI y recibo, **una sola**, antes de abrir catálogo. Ningún informe lo plantea; afecta a 07, 14, 15, 12.
3. **Procedencia y frescura reales.** `sourceAsOf`/`stale` desde el dato, no `generatedAt`. Sin eso la UI servida no puede declarar de dónde viene lo que pinta (14, 15, 13).
4. **Estado derivado, no escrito.** `status: "implemented"` a mano es la raíz de la confusión "contrato implementado ≠ producto terminado" (01, 15).
5. **Operación de 30 días.** Cuotas compartidas, trazas, backups con restore probado y deploy que no pierda datos (03, 05, 19, 20).

Cada `miniaudit.md` termina ahora con **Revisión de destino** y **Conclusión**, que sitúan el bloque en la fase correspondiente (Beta, Fase 1 UI servida, Fase 2 operación, Fase 3 RLS por defecto y escala) y dicen si bloquea el primer cliente.

## Orden recomendado

1. **S0 y producto**: 04/06 (techo de intentos), 10 (rol y goal en `draft`), 07 (aprobación con recibo), 25 (criterios y cierre del ciclo), 08/14 (PolicyEngine).
2. **Riesgo económico y de datos**: 24 (Stripe), 23 (scopes), 20 (backups), 18 (exposición).
3. **Fase 1**: 14/15 (acciones, KPIs, procedencia), 12/13 (chat y memoria).
4. **Fase 2**: 03, 05, 19 y el resto de P1.
