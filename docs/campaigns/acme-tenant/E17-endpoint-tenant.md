# E17 · Endpoint con `ViewEnvelope` correcto (H11)

**Etapa**: E17 de `ACME_CAMPAIGN_V1`
**Estado**: completada
**Verificación**: `tsc --noEmit` 0 · `tests/workspaces-tenant.test.ts` 5 pass / 0 fail · `tenant-acme-isolation` 6 pass / 1 todo → **6 pass / 0 todo** (el caso 5b pasa) · `views-route`, `workspace-*` y los tests de ACME siguen en verde.

---

## 1. El bug

`apps/server/src/routes/workspaces.ts` tenía, en los tres endpoints de ejecución:

```ts
const tenantId = c.get("tenantId") ?? owner;
```

`owner` es un userId. Cuando el middleware no dejaba `tenantId` (lo normal: solo lo ponen `leads-routes` y `voice-routes`), el `ViewEnvelope` salía con `tenantId = <uuid del usuario>`. El caso 5b de E05 lo demostró en cuanto el módulo existió: esperaba `acme` y recibía un uuid.

Consecuencias: las queries leían con un tenant inexistente (vacío), el envelope mentía sobre la empresa y `permissions`/`provenance` se construían sobre un tenant falso.

## 2. El cambio (mínimo, 3 sitios)

```ts
const owner = c.get("owner");
const tenantId = c.get("tenantId") ?? c.get("ctx")?.tenantId;
if (!tenantId) return c.json({ error: "Sesion sin empresa resuelta", code: "TENANT_REQUIRED" }, 403);
```

- **`ctx.tenantId`** es lo que `app.ts` deja resuelto para toda `/api/*` tras `resolveTenantPrincipal` (JWT → tenant elegido en sesión → membership), así que el tenant no lo elige el cliente.
- **`c.get("tenantId")`** sigue teniendo prioridad para las rutas que ya resolvieron su propio scope (`leads`, `voice`), que lo ponen tras validar membership.
- **Sin tenant resuelto: 403 `TENANT_REQUIRED`.** No se inventa un tenant y no se devuelve un envelope con el owner.
- El tipo de `Variables` pasa a `{ owner: string; tenantId?: string; ctx?: { tenantId?: string } }`, que es la verdad del runtime (Hono devuelve `undefined` si nadie lo puso).

No se toca `routes/views.ts` (ya usaba `c.get("ctx")?.tenantId`), ni el adapter, ni el registry, ni los módulos.

## 3. Tests

`tests/workspaces-tenant.test.ts` monta un Hono con el mismo contrato de variables que `app.ts`:

| caso | resultado |
|---|---|
| `ctx.tenantId = "acme"` | 200, `view.tenantId === "acme"` (no el owner), `id = acme-obras:tablero`, `spec.kind = board`, `freshness.generatedAt` ISO con offset, `provenance.ref = acme-obras/obras.tablero` |
| sin tenant | 403 `{ error, code: "TENANT_REQUIRED" }` |
| `tenantId` de ruta + `ctx` distinto | manda el de la ruta (`acme`) |
| `/query` y `/command` sin tenant | 403 |
| vista inexistente con tenant | 404 (no 403: el tenant está bien, la vista no) |

Y el caso **5b** de `tests/tenant-acme-isolation.test.ts` deja de estar en `todo`: con el servidor real (`createApp`), Bearer de Carlos por JWT con claim `acme`, `POST /api/workspaces/acme-obras/view` devuelve 200, cabecera `X-Tenant-Id: acme` y `view.tenantId === "acme"`, `view.id === "acme-obras:tablero"`.

## 4. Lo que esto no arregla

- El envelope de un tenant sigue siendo válido aunque el actor no tenga permiso sobre la vista concreta: `permissions` se construye con `declaration.actions` (H24, sin acciones todavía).
- No hay endpoint de analítica: el Centro de Mando sigue fuera (E19).
- La sesión de UI todavía no se etiqueta con el tenant resuelto (E18).
