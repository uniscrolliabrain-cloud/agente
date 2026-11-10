# Bloque 19 · Deploy e infra

> Campaña UX · 2026-11-10 · **13 hallazgos** (S0 0 · S1 5 · S2 6 · S3 2)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | `fly.browser.toml` declara `primary_region = "mad"`, región que no existe; el `fly.toml` del API ya lo documenta y usa `fra`. | Sin verificar |
| 2 | S1 | El worker de tareas fija `DATA_DIR=/data` sin volumen: todo lo que escriba desaparece al reiniciar. | Sin verificar |
| 3 | S1 | La imagen de runtime copia el `node_modules` del build completo, sin `--prod`: TypeScript y tooling de test dentro. | Sin verificar |
| 4 | S1 | El gate de deploy corre `typecheck`, `test` y `audit:coherence`, pero no `audit:contracts` (6 huérfanos, EXIT 1). | **Confirmado** en E20: `audit:contracts` falla con 6 huérfanos y el deploy no lo ejecuta. |
| 5 | S1 | Una sola VM de 1 CPU y 1 GB, sin `release_command`: las migraciones corren dentro del proceso que sirve tráfico. | Sin verificar |
| 6 | S2 | El health check de Fly usa `/api/health`, no `health-deep`: puede quedarse en rotación una máquina con la base caída. | Sin verificar |
| 7 | S2 | `shutdown` limpia el timer del backup pero no espera al que ya está copiando; este escribe tras `db.close()`. | Sin verificar |
| 8 | S2 | El primer backup se dispara 30 s después de cada arranque: con redeploys más frecuentes que 24 h, no corre nunca. | Sin verificar |
| 9 | S2 | Panel, SSE y API comparten `hard_limit = 100` sobre 1 CPU. | Sin verificar |
| 10 | S2 | Si se activa el computer, el proceso del API necesita el socket de Docker: control root efectivo del host. | Sin verificar |
| 11 | S2 | La imagen no lleva `clientes/`, sólo `_template`, mientras la ruta de datos apunta a `/data/clientes`. | Sin verificar |
| 12 | S3 | La imagen no define `HEALTHCHECK`; fuera de Fly no hay sonda. | Sin verificar |
| 13 | S3 | El worker no tiene check posible y sólo se observa por logs o por `health-deep` del API. | Sin verificar |

## Arreglos propuestos

1. **`mad` fuera**: una región inexistente no arranca; unificar con `fra` y validar la config en CI.
2. **El worker con volumen** o sin persistencia declarada: `DATA_DIR=/data` sin montaje es pérdida de datos silenciosa.
3. **`node_modules --prod`** en runtime y `HEALTHCHECK` en la imagen.
4. **Gate de deploy = gate real**: incluir `audit:contracts` (aunque falle, que falle el deploy o se acepte explícitamente).
5. **Migraciones fuera del proceso que sirve**: `release_command` o job previo.

## Plan

- **P1 (arranque y datos)**: región, volumen del worker, `--prod`, `HEALTHCHECK`.
- **P2 (gate)**: alinear deploy con el gate; health check profundo con degradación.
- **P3 (capacidad)**: separar panel/SSE/API por límites y documentar el riesgo de Docker en el host.

---

## Revisión de destino

Fase 2 es "30 días sin intervención", y eso depende de que el despliegue no pierda datos ni arranque en una región inexistente:

- Volumen para el worker (hoy `DATA_DIR=/data` sin montaje).
- `node_modules --prod` y `HEALTHCHECK`.
- Gate de deploy alineado con el real (incluido `audit:contracts`).
- Migraciones fuera del proceso que sirve tráfico.

## Conclusión

El deploy actual puede perder todo lo que escriba el worker y aceptar una máquina con la base caída. **P1**, con el volumen y la región en **P0** si hay producción.
