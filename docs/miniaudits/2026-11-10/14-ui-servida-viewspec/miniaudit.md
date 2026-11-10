# Bloque 14 · UI servida y viewspec

> Campaña UX · 2026-11-10 · **15 hallazgos** (S0 0 · S1 4 · S2 8 · S3 3)
> Estado: informe recibido. Validación: parcial.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | Los 34 workspaces con `VIEWS = []`: cualquier `/resolve` con `workspaceId` da 404. | **Vigente con matiz**: 34 legacy siguen vacíos; los 3 de ACME declaran 21 vistas y resuelven. |
| 2 | S1 | `findDeclaration` cae a `views[0]` si el `intent` no casa: devuelve otra vista sin error. | Sin verificar |
| 3 | S1 | `canView: true` y `canAct` con todas las acciones declaradas, sin PDP. | Sin verificar |
| 4 | S1 | El `tenantId` del envelope se resuelve con `?? owner`. | **Vigente en `/api/views/resolve`** (`routes/views.ts:81`); corregido en `/api/workspaces` (E17). |
| 5 | S2 | KPIs del dashboard inventados: "Elementos" y el id de la query. | **Confirmado** en E15/E19 (H23): el adapter sigue produciendo 2 KPIs genéricos. |
| 6 | S2 | `board` corta a 10 columnas y no filtra 200 tarjetas: tarjetas huérfanas. | Sin verificar |
| 7 | S2 | `detail` y `form` se construyen con `rows[0] ?? {}` y salen vacíos como si existieran. | Sin verificar |
| 8 | S2 | `form` marca todo `provenance: "missing"` y `required: false`. | Sin verificar |
| 9 | S2 | El tipo de columna se adivina por regex sobre el nombre de la clave. | Sin verificar |
| 10 | S2 | `queue` e `inbox` descartan todo campo fuera de la lista blanca. | Sin verificar |
| 11 | S2 | La vista legacy cambia de id en cada llamada y nace `stale: true`. | Sin verificar |
| 12 | S2 | `Cache-Control: no-store` global también para JS, CSS y fuentes. | Sin verificar |
| 13 | S3 | El renderer no registra un spec inválido: sólo pinta el mensaje de error. | Sin verificar |
| 14 | S3 | `onAction` sólo se cablea en `queue` e `inbox`, no en `form`, `board`, `table` ni `detail`. | Sin verificar |
| 15 | S3 | La CSP se fija en un único punto (`app.ts:1055`). | Sin verificar |

## Arreglos propuestos

1. **Terminar el `?? owner`** también en `/api/views/resolve`: es el mismo bug que E17 cerró en workspaces y sigue vivo aquí.
2. **`intent` desconocido = 404/422**, no `views[0]`: devolver otra vista es peor que no devolver ninguna.
3. **KPIs por dato**: si no hay KPI declarado, no se inventa "Elementos"; el dashboard de ACME ya demuestra que se pueden sumar importes.
4. **`form`/`detail` honestos**: sin fila no hay detalle (404), no `rows[0] ?? {}`.
5. **`no-store` sólo para HTML/JSON**: los estáticos necesitan caché.

## Plan

- **P1 (tenant y resolución)**: `?? owner` fuera, `intent` estricto.
- **P2 (specs)**: KPIs reales, board sin huérfanas, form/detail con ausencia declarada.
- **P3 (render)**: `onAction` en los 7 `kind`, spec inválido registrado, CSP y caché afinadas.

---

## Revisión de destino

"El usuario escribe y el panel sirve la vista correcta" es el criterio de terminado de Fase 1, y aquí faltan las piezas que lo hacen verdad:

- **PolicyEngine** en la ruta, no `canView: true`.
- `onAction` en los 7 `kind` (form, board, table, detail incluidos), con idempotencia y recibo.
- KPIs y `detail`/`form` con dato real: hoy "Elementos" y `rows[0] ?? {}` son placeholders.
- Cerrar el `?? owner` también en `/api/views/resolve`.

## Conclusión

Es el bloque más cercano al producto y el que más promete de más: la UI pinta permisos y acciones que el backend no concede ni ejecuta. **P0** el tenant y el PolicyEngine; **P1** acciones y KPIs.
