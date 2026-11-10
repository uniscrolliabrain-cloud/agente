# Bloque 02 · Tests

> Campaña UX · 2026-11-10 · **12 hallazgos** (S0 1 · S1 5 · S2 4 · S3 2)
> Estado: informe recibido. Validación: parcial.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | 134 `background_failure` durante una suite con 0 rojos; sin criterio de salida. | Sin verificar (el contador no se imprime en el reporter `dot`) |
| 2 | S1 | 128 salen de `tests/event-bus.test.ts:123`, que emite payload inválido sin fallback a `{}`. | Sin verificar |
| 3 | S0 | 9 `test.skip` vacíos en `tests/campaign-3/e2e-02..12`: kernel, aislamiento, authz, idempotencia, worker interrumpido, compensación, promoción, aprendizaje y `KernelPort`. | Sin verificar |
| 4 | S1 | 5 `test.todo` de aceptación se muestran en verde. | **Confirmado**: 5 coincidencias de `test.todo` en `tests/`. |
| 5 | S1 | 3 ficheros fuera del glob: `apps/computer/smoke.test.ts`, `apps/worker/tests/lifecycle.test.ts`, `docker.test.ts`. | Sin verificar |
| 6 | S1 | `test:coverage` llama a `c8`, que no está instalado: la cobertura no se mide. | **Confirmado**: `require.resolve('c8')` falla. |
| 7 | S2 | La suite no cierra sola; depende de `--test-force-exit`, con `test:hanging` para reproducirlo. | Confirmado por uso: toda la sesión ejecutó con `--test-force-exit`. |
| 8 | S2 | Timeout de 30 s por caso en una suite de 63 s. | Sin verificar |
| 9 | S2 | Bloqueo de red por subcadena de URL y sólo 7 hosts; `undici` o un redirect se escapan. | Sin verificar |
| 10 | S2 | El job `integration` repite la suite con `ALLOW_NETWORK=1`: cero casos nuevos. | Sin verificar |
| 11 | S3 | `release-gate` repite typecheck y suite: tres ejecuciones completas por push. | Sin verificar |
| 12 | S3 | 2666 aserciones para 726 casos; varios sólo comprueban que no lanza o el status. | Sin verificar |

## Arreglos propuestos

1. **Fallo ≠ log.** Un `background_failure` debe poder convertir la suite en roja (`FAIL_ON_BACKGROUND_FAILURE=1` en CI) o, como mínimo, imprimir el recuento al final. Hoy 134 fallos silenciosos conviven con "0 rojos".
2. **`test.todo` no es verde.** El reporter debe distinguir `todo` de `pass`; si la aceptación no está implementada, se vea.
3. **Cobertura real o nada.** Instalar `c8` (o cambiar a `--experimental-test-coverage`) y publicar el número; un script que falla por dependencia ausente no es cobertura.
4. **Un solo gate.** `release-gate` debe reutilizar el resultado de `typecheck`/`test` en vez de repetirlos: tres ejecuciones por push son 3× coste y 3× deriva.
5. **Los 3 ficheros huérfanos** entran en el glob o se mueven a `tests/`; si no, no cuentan y se pudren.

## Plan

- **P1 (rojo honesto)**: `test.todo` visible + recuento de `background_failure` en el resumen + criterio de CI.
- **P2 (cobertura)**: `c8` o cobertura nativa; umbral mínimo y salida en el gate.
- **P3 (coste)**: deduplicar `release-gate` y decidir qué job es la fuente de verdad.

---

## Revisión de destino

El criterio de terminado es por fase (`beta:smoke`, `beta:vertical`, "el usuario escribe y el panel sirve la vista correcta", "30 días sin intervención"). Los arreglos de arriba miden higiene de suite; faltan los que acreditan producto:

- **E2E con backend y base reales**: un workspace y una acción con store real, no sólo el fake.
- Un test de render por cada `kind` y uno de `onAction` con idempotencia y recibo.
- Criterio de rojo honesto: `background_failure`, `skip` y `todo` no pueden convivir con "0 fallos".

## Conclusión

Una suite de 603 pruebas en verde no dice que el producto funcione: dice que el contrato se comporta. Mientras los 9 `skip` del kernel y los 5 `todo` de aceptación sigan en pie, el verde es una media verdad. **P0** el rojo honesto y el E2E del vertical; el resto, P2.
