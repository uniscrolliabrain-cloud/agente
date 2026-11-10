# Bloque 15 · Templates reales

> Campaña UX · 2026-11-10 · **12 hallazgos** (S0 0 · S1 3 · S2 6 · S3 3)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | Los 7 templates existen y no tienen fuente de datos: el contrato está vacío en los 34 módulos. | Sin verificar |
| 2 | S1 | Dos UIs paralelas: 35 páginas React propias y los templates, sin contrato compartido. | Sin verificar |
| 3 | S1 | `manifest.status: "implemented"` se escribe a mano y no depende de que haya vistas. | Sin verificar (cruce con 01-2) |
| 4 | S2 | Las 217 capabilities no están conectadas a ningún template. | Sin verificar |
| 5 | S2 | Etiquetas en español fijo ("Guardar", "Elemento N"), sin i18n. | Sin verificar |
| 6 | S2 | El formulario no tiene `onAction`: se pinta y no puede guardar. | Sin verificar (cruce con 14-14) |
| 7 | S2 | Tabla, board y colas truncan a 200/200/50 sin marcar truncamiento. | Sin verificar |
| 8 | S2 | Sólo `dashboard` usa `result.total`; el resto cuenta lo recibido. | Sin verificar |
| 9 | S2 | `asRow` aplana arrays y no-objetos a `{ value }`. | Sin verificar |
| 10 | S3 | No hay vista por defecto declarada: existe sólo por el fallback. | Sin verificar |
| 11 | S3 | Ningún test monta `ViewRenderer` con un spec de cada `kind`. | Sin verificar |
| 12 | S3 | `queue`/`inbox` normalizan `actions` a `[]` y pierden las declaradas. | Sin verificar |

## Arreglos propuestos

1. **Una UI, no dos.** El template debe ser el renderizador de la declaración; las 35 páginas React propias son deuda que se migra o se declara como excepción.
2. **Truncamiento visible**: `{ items, total, truncated }`; hoy el usuario no puede saber que hay 200 de 900.
3. **`actions` no se normaliza a `[]`**: si la declaración trae acciones, el spec las lleva.
4. **`asRow` no inventa `{ value }`**: una fila no-objeto es un error de contrato y debe verse como tal.
5. **Un test por `kind`** montando `ViewRenderer`: 7 casos, es la superficie donde viven los bugs de esta capa.

## Plan

- **P1 (contrato)**: `truncated`, `actions`, `rows` con forma declarada; test por `kind`.
- **P2 (i18n y estados)**: etiquetas fuera del template, `status` derivado de datos.
- **P3 (unificación)**: decidir qué páginas React se retiran a favor del template.

---

## Revisión de destino

Los 7 templates son la Fase 1 entera. Faltan arreglos que el informe no plantea:

- **Formulario que guarda**: submit, validación, estados de error e idempotencia (hoy `form` no tiene `onAction`).
- `truncated` explícito en tabla/board/colas.
- Un test de render por `kind` y uno de acción completa de punta a punta.

## Conclusión

Sin formulario funcional no hay "primera acción vertical", y sin acción vertical no hay producto demostrable. **P1**, con el submit en **P0** para el primer recorrido real.
