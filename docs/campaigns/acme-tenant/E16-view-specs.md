# E16 · Vistas ACME y contrato de spec

**Etapa**: E16 de `ACME_CAMPAIGN_V1`
**Estado**: completada
**Verificación**: `tsc --noEmit` 0 · `tests/acme-view-specs.test.ts` 5 pass / 0 fail.

---

## 1. Qué se valida

No se valida una maqueta ni un fixture de UI: se ejecuta el camino real (query del módulo → adapter → `runtimeViewSpecSchema`) con un store que solo expone `list`, y se comprueba el contrato del spec.

Para cada una de las 21 vistas:

1. El envelope existe (`adaptWorkspaceView` no devuelve `null`).
2. `runtimeViewSpecSchema.safeParse(spec)` pasa.
3. `spec.kind` es el declarado: ninguno cae al `default` `table`.
4. Ninguna clave del spec queda fuera de las que admite su `kind`.

Claves admitidas (de `packages/domain/src/views.ts`, sin tocar el schema):

| kind | claves |
|---|---|
| dashboard | `kind`, `title`, `kpis` |
| queue / inbox | `kind`, `title`, `items` |
| board | `kind`, `title`, `entityType?`, `columns`, `cards` |
| table | `kind`, `title`, `columns`, `rows` |
| detail | `kind`, `title`, `entityId?`, `entityType?`, `properties`, `relations` |
| form | `kind`, `title`, `entityType`, `fields`, `submitLabel` |

## 2. Resultado

- 21 specs válidos; 7 `kind` distintos por módulo (`dashboard`, `board`, `queue`, `inbox`, `table`, `detail`, `form`).
- Con el store **vacío** los 21 siguen siendo válidos: la vista se pinta vacía, no rompe (R8).
- Topes respetados: ≤50 items, ≤10 columnas de tablero, ≤200 filas, ≤6 KPIs.

## 3. Decisiones

- **No se relaja ni se extiende `runtimeViewSpecSchema`.** Lo que no encaje se corrige en el adapter o en la query, nunca en el schema.
- **No se añaden campos "porque el renderer los pinta".** El test 3 falla si aparecen.
- Las tres `form` (`parte-nuevo`, `alta`, `pedido-nuevo`) tienen `fields: []` y son válidas: un formulario sin campos es un formulario que aún no tiene comando detrás. Se documenta, no se rellena con datos de otra entidad.
- Los KPIs del dashboard siguen siendo los dos genéricos del adapter (H23). El schema admite 6; calcularlos con importes reales es una decisión de producto, no de contrato, y se aborda con el endpoint de analítica de E19.
