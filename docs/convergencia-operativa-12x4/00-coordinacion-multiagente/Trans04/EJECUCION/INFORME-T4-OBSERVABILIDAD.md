# Trans04 — Observabilidad, alertas y preflight de secretos

**Turno:** Trans04/T1 · **Rama:** `converge/trans00-core` · **Base de campaña:** `892061c9`
**Commit evaluado:** `498d8ddc` · **Alcance:** local, sin red, sin valores secretos, sin despliegue.

---

## 1. Verificación ejecutada

| Comando | Resultado |
|---|---|
| `tests/trans04-*.test.ts` (12 suites) | **43 tests, 43 PASS, 0 FAIL, 0 SKIP**, exit 0 |
| `tsc --noEmit -p tsconfig.json` | exit 0 |
| `scripts/secrets-check.ts --json` (muestra) | exit 0, `ok: true`, 53 nombres, `missingRequired: []` |
| `scripts/secrets-check.ts --mode=live --json` | **exit 1**, `ok: false`, 10 nombres obligatorios ausentes |

Coincide con el corpus: 12 suites, 43 tests, 43 PASS.

---

## 2. Paso 1 — cada familia de métrica tiene punto de emisión real

No hay métricas decorativas registradas y nunca incrementadas:

| Familia | Emisión | Consumo |
|---|---|---|
| `agente_http_requests_total`, `http_errors_by_route_total`, histograma de latencia | `apps/server/src/middleware/request-logger.ts:99,108,117` | `requestLogger()` montado en `apps/server/src/app.ts:420` |
| `agente_kernel_turns_opened_total`, `agente_kernel_thoughts_total`, `agente_kernel_turns_total` | `apps/server/src/kernel/kernel.ts:50-106`, `kernel/subscribers/metrics-consumer.ts:21,25` | bus del kernel |
| `agente_llm_calls_total`, `agente_llm_tokens_total` | `apps/server/src/engine/service.ts:2355,2359` | llamadas LLM reales |
| `background_failures_total` | `apps/server/src/log.ts:181` | fallos de background |
| `agente_kernel_observations_total` | `apps/server/src/engine/observability/hooks.ts:72` | hooks de observabilidad |
| Exportación | `metricsRoutes(agent, users)` en `apps/server/src/app.ts:836`, ruta `/metrics` | `apps/server/src/metrics-exporter.ts` |

El registro (`apps/server/src/metrics/registry.ts`) mantiene contadores/gauge acumulativos, histogramas
con buckets acumulativos y cuantiles calculados sobre copia, sin mutar el registro al exportar.

---

## 3. Paso 3 — alertas: disparo, no-disparo y concurrencia

Las dos suites de alertas cubren la prueba negativa que la campaña exige:

- `trans04-alert-sources`: un snapshot lee fallos durables, DLQ sin resolver y acciones desconocidas;
  **un fallo de almacenamiento o un productor ausente quedan `unavailable`, no en cero medido** (la
  diferencia entre «no hay errores» y «no lo sé»); lectores concurrentes comparten una sola consulta en
  vuelo.
- `trans04-alert-concurrency`: evaluaciones solapadas envían **una** notificación; el cooldown durable
  sobrevive a una instancia nueva; un fallo síncrono de notificación queda contenido.

La regla «una alerta que no dispara cuando debe es peor que no tener alerta» se sostiene: el caso de
fuente ausente no se convierte en un cero tranquilizador.

---

## 4. Paso 4 — preflight de secretos sin filtrar valores

Ejecutado dos veces sobre el mismo árbol:

```
$ node --import tsx scripts/secrets-check.ts --json
… "ok":true, 53 filas, "missingRequired":[], "issues":[]        → exit 0

$ node --import tsx scripts/secrets-check.ts --mode=live --json
… "ok":false, missingRequired:[DATABASE_URL, PUBLIC_API_URL, TOKEN_ENCRYPTION_KEY,
   AGENTE_ACCESS_KEY, ALLOWED_ORIGINS, AUTH_PROVIDER, SUPABASE_URL, ADMIN_EMAIL,
   ADMIN_PASSWORD, MODEL]                                       → exit 1
```

- El JSON emite **nombre, grupo, `present`, `required`**: ni valores, ni fragmentos, ni hashes.
- En modo `live` la ausencia produce fallo explícito y **exit 1**, no un «pasa» vacío.
- El modo muestra (sin perfil) no exige secretos de producción: `ok: true` es correcto, no una
  certificación de que producción esté lista.

Ambos JSON quedan versionados como evidencia; contienen solo presencia y nombres.

---

## 5. Paso 5 — evidencia de gate

`tests/trans04-gate-evidence.test.ts` valida la forma de la evidencia del gate y pasa en este commit.
Si Trans00 regenera `EVIDENCIA-GATE-05.json`, esta suite es la que debe seguir verde en el mismo
commit. No se ha regenerado ninguna evidencia de gate en este turno.

---

## 6. Lo que este turno NO demuestra

- **Gate integral no ejecutado**: 43 tests focales no son las 12 fases × 4 pasadas.
- **Ledger de Trans04 sin tocar**: sus 48 bloques siguen `PENDING`.
- **Ninguna alerta disparada por una condición real** (`07-owner-real`): todo es sintético.
- **Ninguna métrica observada en producción**: no hay serie temporal real ni latencia medida.
- **Doppler no se toca**: no se leen, escriben ni rotan credenciales.
- El preflight en `live` falla por diseño en este entorno (no hay secretos de producción): eso prueba
  el fallo cerrado, **no** que falten en el entorno del owner.

---

## 7. Handoff

- **A Trans00:** el preflight es la fuente de verdad de nombres; el mapeo proveedor→secreto vive en
  `scripts/connections.ts` y `scripts/secrets-check.ts`, sin valores.
- **A Trans03:** cada error de proveedor ya deja un código estable; puede etiquetarse sin exponer
  secretos ni PII.
- **A Trans07:** el gate sigue siendo la deuda común; aquí solo se certifica la forma de su evidencia.
