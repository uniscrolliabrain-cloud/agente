# Empieza aquí — estado real del repo

> v1 · 2026-11-10 · Estado: current
>
> Escrito leyendo el código de `main` (`2693917`), no la documentación.
> **Si otro documento contradice este, gana este.** Si el código contradice
> este, gana el código: actualiza este fichero en el mismo cambio.
> Mapa de documentación por estado: [00-MAPA-DOCS.md](./00-MAPA-DOCS.md).

## 1. Qué es

Runtime de agentes durables para PYMES y agencias: backend Hono/TypeScript que
guarda tareas que sobreviven reinicios, ejecuta SOPs deterministas con
aprobaciones humanas, mantiene memoria de empresa y **sirve vistas de UI desde
el servidor** (`ViewEnvelope`). El frontend React pinta lo que el backend
decide. Encima viven 34 conectores de negocio, un chat con LLM y personas-agente
configurables por empresa.

No es un prototipo de chat ni un ERP: es un producto a medio camino entre
plataforma de agentes y ERP ligero.

## 2. Topología: multitenant clásico, **un despliegue**

El modelo anterior era *un deployment por cliente* (single-tenant). **Hoy no lo
es.** Lo que hay en el código:

| Pieza | Dónde | Qué hace |
|---|---|---|
| Un despliegue, N empresas | `fly.toml` | Una app (`agntiapro-api`) sirve panel y API; los tenants conviven. |
| Resolución de tenant por petición | `app.ts:622` + `resolveTenantPrincipal` | El tenant sale del JWT o de la sesión y se valida contra la membership. `?tenantId=`/`x-tenant-id` solo se aceptan si coinciden; si no, 403 `TENANT_MISMATCH`. |
| Fallback a `"default"` | `app.ts:626-628` | Solo sobrevive en `mode=sample` o `authProvider=session` (modo legacy). En multitenant no aplica. |
| Aislamiento de datos en aplicación | `app.ts:107`, `tenant-scope.ts` | `TenantScopedStore` compone la clave `tenantId:owner`; el tenant activo viaja por `AsyncLocalStorage`, no por estado de proceso. |
| RLS (defensa en profundidad) | `db-rls.ts:22-30` | Solo se enciende con Postgres **y** `MULTI_TENANT_SHARED=true`. Sin la variable es un no-op silencioso. |
| Guard de arranque | `index.ts:27-40` | Con `MULTI_TENANT_SHARED=true` y sin RLS efectiva, **aborta el arranque**. |
| Producción hoy | `fly.toml` | **No define `MULTI_TENANT_SHARED`.** Luego en producción el aislamiento es de aplicación, no de base de datos. |

Consecuencia práctica: el aislamiento entre empresas depende de que todas las
consultas pasen por el store con scope. RLS no está protegiendo hoy en
producción. No prometas aislamiento físico ni "cada cliente en su servidor".

## 3. Qué está implementado y qué no

Verificado en código:

- Tareas durables: lease con CAS, heartbeat, checkpoint, DLQ,
  `outcome_unknown` no reintentable (`engine/worker.ts`, `engine/actions.ts`).
- Aprobaciones de todo efecto externo (`requiresApproval` en capabilities).
- Vistas servidas: `ViewEnvelope` Zod, adapter de workspace, 7 templates
  (`dashboard`, `queue`, `inbox`, `board`, `table`, `detail`, `form`).
  Los 34 módulos declaran `VIEWS = []` y el servidor los cubre con una vista
  `table` genérica sobre su primera query (`engine/workspaces/default-views.ts`,
  aplicada en `registry.ts`). No hay 404 por vista ausente; lo que no hay son
  las vistas específicas que el producto promete.
- Google: Gmail, Calendar, Drive y Places con cliente HTTP real.
- Chat con LLM, kernel cognitivo, computer (Docker) y browser worker.

No verificado o pendiente:

- Autorización real de vistas: el envelope nace con `permissions.canView: true`
  y las rutas construyen el contexto con `permissions: []`.
- RLS probada contra un Postgres real con rol de staging.
- Restore de backups probado de punta a punta.
- Contrato de gestoría (`docs/07-integraciones/GESTORIA.md`): escrito, sin
  implementación.
- Varias integraciones de negocio siguen siendo stubs: `stripe`, `gmb`,
  `social` y el `whatsapp` de `packages/integrations/src/stubs/`. Hay cliente
  real de Meta aparte. Compruébalo antes de prometer la integración.

## 4. Números medidos (2026-11-10)

No salen de la documentación; salen de ejecutar:

| Comprobación | Resultado |
|---|---|
| `npx pnpm@11.19.0 test` | 726 casos, exit 0 |
| `npx pnpm@11.19.0 audit:contracts` | 340 contratos: 288 OK, 43 MODULE, 1 HARNESS, 2 PENDING, 0 allowlist, **6 huérfanos**; exit 1 → gate rojo |
| `pnpm docs:check` | **no existe** como script, aunque el ROADMAP lo cita como FASE-04 |
| Documentación | 441 ficheros en `docs/`, 404 `.md`, 118 en `miniaudits`, 24 `roadmap.md` |

## 5. Hacia dónde va

- Corto plazo: cerrar los 6 contratos huérfanos, aplicar permisos de verdad en
  las vistas y probar RLS con un rol real.
- Fase 3 del producto: RLS por defecto y tenant por subdominio (2027-Q1). Eso es
  lo que falta del multitenant; el multitenant en sí ya está.
- Gestoría: el contrato está escrito para que `agntia-gestoria` se adapte; en
  este repo no hay implementación.
- El vertical comercial va por delante del plan: campañas sobre fixtures, con la
  acreditación con datos y humanos reales como puerta pendiente.

## 6. Reglas para agentes

1. Traza el código antes de creer un documento y cita `fichero:línea`.
2. Separa lo verificado de lo no comprobable. No rellenes huecos con la docu.
3. `docs/miniaudits/`, `docs/archive/`, `docs/campaigns/` y los `REPORTE.md`
   fechados son **histórico**: describen el repo en su fecha, no hoy.
4. No uses "single-tenant" ni "un deployment por cliente" salvo para hablar del
   modo legacy (`authProvider=session`).
5. Si cambias topología, RLS o el contrato de vistas, actualiza este fichero y
   `00-MAPA-DOCS.md` en el mismo cambio.
