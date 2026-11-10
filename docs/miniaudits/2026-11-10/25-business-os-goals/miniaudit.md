# Bloque 25 · Business OS y objetivos

> Campaña UX · 2026-11-10 · **16 hallazgos** (S0 0 · S1 6 · S2 6 · S3 4)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | `createGoal` pasa `successCriteria: []` y el verificador determinista con cero criterios devuelve `verified: true`. | Sin verificar |
| 2 | S1 | El outcome siempre lleva `metrics: []`: cualquier criterio real queda en `missing`. | Sin verificar |
| 3 | S1 | `POST /goals/:id/run` pasa un `Goal` de `agent.ts` como `Goal` de `goal.ts`: sin `successCriteria`, el verificador itera `undefined` y da 500. | Sin verificar |
| 4 | S1 | El resultado del ciclo se descarta y el goal queda `active` para siempre. | Sin verificar |
| 5 | S1 | Nada pone un goal en `completed`. | Sin verificar |
| 6 | S1 | El reconcile por CAS falla porque el registro no tiene `version`; comparar contra el default 1 no basta. | Sin verificar |
| 7 | S2 | El guardrail de cuota se llama con `current = 0`. | **Confirmado** por analogía: `orchestrator.ts:82` pasa `0` (ver 05-3 y 10-9). |
| 8 | S2 | El plan se valida contra todas las capabilities, sin filtro de tenant ni de rol. | Sin verificar |
| 9 | S2 | El observador sólo ve éxitos: bloqueos, planes inválidos y replans agotados no se registran. | Sin verificar |
| 10 | S2 | El ciclo no escribe audit trail ni persiste plan u outcome. | Sin verificar |
| 11 | S2 | `query_business` ejecuta SQL interpolado con lista negra; la defensa real es un rol `GRANT SELECT` opcional. | Sin verificar |
| 12 | S2 | Sin `BUSINESS_DATABASE_URL` emula la query con un único `where`: resultados distintos del Postgres real. | Sin verificar |
| 13 | S3 | `objective.created`, `keyresult.updated` y `objective.closed` existen como eventos y no tienen productor. | Sin verificar |
| 14 | S3 | `DELETE /business/entities/:id` borra en duro, sin PDP ni aprobación, con actor fijo `"user"`. | Sin verificar |
| 15 | S3 | `export` y `workspace-templates` sirven todo sin paginar; el segundo es el catálogo global. | Sin verificar |
| 16 | S3 | El adaptador de Goal convierte estados desconocidos en `failed`. | Sin verificar |

## Arreglos propuestos

1. **Cero criterios no es "verificado"**: el verificador debe devolver `unknown`/`unverifiable` cuando no hay criterios. Hoy firma un éxito que nadie comprobó.
2. **`successCriteria` y `metrics` reales**: un goal sin criterios no se crea, y el outcome lleva las métricas que el verificador usó.
3. **Un solo tipo `Goal`**: pasar el de `agent.ts` como el de `goal.ts` es un bug de tipos que acaba en 500; el adaptador debe mapear campos explícitamente.
4. **Cierre del ciclo**: `active → completed/failed` con evento y audit trail; hoy el resultado se descarta y el goal queda vivo para siempre.
5. **SQL sin interpolar**: parámetros + rol de sólo lectura obligatorio, no lista negra; y la emulación sin Postgres debe declararse como tal en el resultado.

## Plan

- **P1 (verificación)**: criterios obligatorios, `verified` honesto, tipo `Goal` único.
- **P2 (ciclo)**: transición final, audit trail, persistencia de plan y outcome.
- **P3 (datos)**: SQL parametrizado, paginación en export/catálogo, eventos con productor o retirados.

---

## Revisión de destino

El ciclo `Goal → Outcome → Verifier → Learning` es literalmente el producto (`BUSINESS_OS.md`). Faltan arreglos que el informe no propone:

- **Criterios obligatorios**: un goal sin `successCriteria` no se crea; cero criterios no puede dar `verified: true`.
- Un solo tipo `Goal` (hoy se pasa el de `agent.ts` como el de `goal.ts` y da 500).
- Cierre del ciclo (`completed`/`failed`) con audit trail y persistencia de plan y outcome.
- SQL parametrizado con rol de sólo lectura, no lista negra.

## Conclusión

Hoy el verificador firma éxito sin criterios, el resultado se descarta y ningún goal llega a `completed`: el ciclo existe en el papel y no en el dato. **P0**; es el bloque que define si el Business OS funciona o sólo compila.
