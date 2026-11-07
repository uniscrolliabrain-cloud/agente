# A07 · Captación (leads)

**Carril:** C7 · **Rama:** `sprint/r01-a07-captacion` · **Superficie:** `sprints/r01/a07-captacion/`, `apps/server/src/leads-routes.ts`

## Estado medido sobre `0c8fe81`

`apps/server/src/leads-routes.ts` tiene exactamente dos endpoints y está razonablemente hecho:

- `GET /` — lista leads filtrando por `tenantId` del scope.
- `POST /discover` — Google Places, dedupe por `placeId`, guarda bajo `owner` + `tenantId`.
- El middleware exige sesión, exige `TenantScopedStore` y **rechaza** si el actor del scope no coincide con el owner. Sin membresía única, `409`.

## Los huecos

1. **La clave de Google sale de `process.env.GOOGLE_MAPS_API_KEY` directamente** (`const client = () => new GoogleMapsClient({ apiKey: process.env.GOOGLE_MAPS_API_KEY })`), no de `service.config`. Es el único sitio del carril que se salta el patrón de configuración del server; si esa variable no está, el error llega como fallo del proveedor, no como "falta configurar".
2. **Cada dato no lleva su fuente**: el lead guarda `source: "google_places"`, `query` y `discoveredAt` a nivel de fila. Si el teléfono viene del sitio web y el rating de Places, no se distingue.
3. **El pipeline está vacío** en `clientes/agntia/agency.json` (`"pipeline": []`), así que un lead nunca avanza de `new`. La captación termina donde empieza.
4. No hay test del dedupe por `placeId` ni del `403` de actor cruzado.

## Preguntas

1. ¿Qué devuelve `searchLeads` y cuántos resultados mete en una sola transacción? ¿Hay límite duro?
2. Si Places devuelve 20 y 19 son duplicados, ¿qué responde el endpoint y cuántas escrituras hace?
3. ¿Un lead con `phone` inventado por el proveedor se puede distinguir de uno verificado?
4. ¿Qué estados admite `status` y quién los cambia? Busca escritores de `leads` fuera de este fichero.

## Entregable del sprint

`sprints/r01/a07-captacion/dedupe.test.ts` que pruebe: misma búsqueda dos veces → **0** filas nuevas la segunda, y `403` cuando el actor no es el dueño del scope. Más `FUENTE-POR-DATO.md` proponiendo el esquema `fieldSources` (sin implementarlo si toca migración).

## Gate

```bash
node --import tsx --test --test-timeout=30000 sprints/r01/a07-captacion/*.test.ts
node --import tsx tests/tenant-http-e2e.test.ts
```

## Trampa

Escribir el test contra un `GoogleMapsClient` real: sin red, y el setup de tests bloquea hosts. Usa el doble y deja claro en el reporte que el proveedor no se ha llamado.
