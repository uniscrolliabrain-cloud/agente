# E14 · Módulos de workspace ACME

**Etapa**: E14 de `ACME_CAMPAIGN_V1`
**Rama**: `feat/acme-tenant`
**Estado**: completada
**Verificación**: `tsc --noEmit` 0 · `tests/acme-workspaces.test.ts` 12 pass / 0 fail · `workspace-default-views` y `workspace-view-adapter` siguen en verde.

---

## 1. Decisión: catálogo global, datos por tenant

Los tres módulos se registran en el catálogo **global** (`ALL_WORKSPACES`), igual que los 34 históricos. Eso significa que cualquier tenant los ve en `GET /api/workspaces`; lo que **no** comparte es el dato:

- la declaración (manifest, vistas, queries, capacidades) no lleva `owner`, `tenantId`, `DATA_DIR` ni rutas de fichero;
- cada handler lee de `services.db`, que es el store con scope: la clave es `${tenantId}:${owner}` y el tenant lo resuelve `currentTenantScope()` (H19), nunca el body;
- por tanto el tenant `default` ve los tres módulos con listas vacías, y ACME ve sus filas. No hay ninguna rama `if (tenant === "acme")` en el código: el aislamiento es el mismo mecanismo que protege al resto del repo.

Esto cierra el punto que quedaba abierto desde E03 (H18): el registry daba a los 34 una única vista `table:"default"` porque todos declaraban `VIEWS = []`. ACME **sí declara** sus vistas, así que `withDefaultViews` las respeta y los 7 `kind` llegan al adapter sin tocar el registry, el adapter ni los schemas.

## 2. Ficheros

```
packages/workspaces/acme-obras/
  src/index.ts
  src/contract.ts
  src/application/{views,queries,commands,capabilities}.ts
packages/workspaces/acme-clientes/   (idem)
packages/workspaces/acme-suministros/ (idem)
packages/workspaces/src/index.ts     (+3 imports, +3 entradas en ALL_WORKSPACES)
packages/workspaces/MANIFEST.yaml    (3 módulos, families actualizadas)
tests/acme-workspaces.test.ts        (12 tests)
```

`contract.ts` declara `status: "implemented"` — no `verified`: eso exige el camino HTTP real de E15/E17/E19.

## 3. Las 21 vistas

| Módulo | dashboard | board | queue | inbox | table | detail | form |
|---|---|---|---|---|---|---|---|
| `acme-obras` | Resumen de obras | Tablero de obras | Tareas en curso | Incidencias abiertas | Partes de obra | Ficha de obra | Nuevo parte |
| `acme-clientes` | Resumen comercial | Oportunidades | Facturas pendientes | Bandeja de clientes | Cartera de clientes | Ficha de cliente | Alta de cliente |
| `acme-suministros` | Resumen de compras | Pedidos por estado | Aprobaciones pendientes | Avisos de suministro | Documentos y fuentes | Ficha de suministro | Nuevo pedido |

Cada vista declara `query` propia (7 por módulo, ninguna repetida) y `actions: []`. Con `actions` vacío, `permissions.canAct` del envelope sale vacío y la UI no pinta botones que el runtime no sepa ejecutar (H24). `commands` está vacío a propósito.

## 4. Guardas cumplidas

- **Sin tocar los 34 módulos**: solo se añaden imports y tres elementos al array; ningún fichero existente de `01-gmail`…`34-trello` se modifica.
- **Sin tocar el contrato**: no se ha editado `workspace-module.ts`, `workspace-view.ts`, `views.ts`, `view-envelope.ts`, `registry.ts` ni `workspace-adapter.ts`.
- **Declaraciones válidas**: las 21 pasan `workspaceViewDeclarationSchema` y los 7 `kind` cubiertos una vez por módulo (test).
- **Sin datos incrustados**: el test comprueba que la serialización de las vistas no contiene `DATA_DIR`, `artifacts/`, `.agente`, `owner`, y que ningún `query` lleva prefijo de tenant (`:`).
- **Sin eventos prematuros**: `publishes` y `consumes` vacíos en módulo y manifest.

## 5. Lo que aún NO hacen las vistas

Los 21 handlers de query devuelven `{ status: "empty", items: [], total: 0 }`. Es deliberado: E15 los rellena con lecturas tenant-scoped. Hoy `POST /api/workspaces/acme-obras/view` responde 200 con una vista **vacía y válida**, no con filas inventadas ni con un 500. Ese es el estado honesto de E14.
