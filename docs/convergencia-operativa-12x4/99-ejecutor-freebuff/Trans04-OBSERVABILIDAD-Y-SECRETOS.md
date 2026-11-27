# Trans04 — Observabilidad, alertas y preflight de secretos

**Rol:** agente de observabilidad y configuración. Hace visible lo que el resto construye y garantiza
que la configuración se valide sin filtrar valores.
**Base:** `origin/integration/trans00-core` @ `892061c9`.
**Protocolo:** [`00-PROTOCOLO-GENERAL.md`](00-PROTOCOLO-GENERAL.md).

---

## 1. Misión

Dos misiones que comparten una misma propiedad —**no mentir**—:

1. **Observabilidad:** métricas, request-logger y alertas que reflejen hechos del runtime, con
   cardinalidad acotada y sin datos sensibles.
2. **Configuración:** preflight y provisión que detecten ausencia o inconsistencia de secretos y
   **fallen cerrado**, sin imprimir el valor en ningún caso.

Una alerta que no dispara cuando debe es peor que no tener alerta. Un preflight que "pasa" porque no
comprobó nada es una falsa certificación.

---

## 2. Estado forense verificado (`892061c9`)

| Requisito | Rutas / evidencia | Verificación | Estado |
|---|---|---|---|
| Métricas y registro | `apps/server/src/metrics-exporter.ts`, `apps/server/src/metrics/registry.ts` | 12 suites `tests/trans04-*`, 43 tests, 43 PASS, 0 FAIL | `INTEGRATED` + `IMPLEMENTED_TESTED` |
| Request logger | `apps/server/src/middleware/request-logger.ts` | PASS | `INTEGRATED` + `IMPLEMENTED_TESTED` |
| Alertas y fuentes | `tests/trans04-alert-sources.test.ts`, `tests/trans04-alert-concurrency.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Contrato de observabilidad | `tests/trans04-observability-contract.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Sink del kernel | `tests/trans04-kernel-sink.test.ts` | PASS | `INTEGRATED` |
| Límites de bundle | `tests/trans04-bundle-bounds.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Preflight de secretos | `scripts/secrets-check.ts`, `tests/trans04-secrets-preflight.test.ts` | PASS sin valores reales | `IMPLEMENTED_TESTED`; operación real `LIVE_UNVERIFIED` |
| Mapeo proveedor→secreto | `tests/trans04-provider-secret-mapping.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Provisión con lectura segura | `tests/trans04-provision-read-safety.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Seguridad del registro | `tests/trans04-registry-safety.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Métricas compartidas | `tests/trans04-shared-metrics.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Backup por tenant | `tests/trans04-tenant-backup.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Evidencia de gate | `tests/trans04-gate-evidence.test.ts` | PASS | `IMPLEMENTED_TESTED` |

Total focal reproducido: **43 tests, 43 PASS, 0 FAIL**.

El test `trans04-gate-evidence.test.ts` es especialmente relevante: valida la forma de la evidencia
del gate. Si Trans00 regenera `EVIDENCIA-GATE-05.json`, esta suite debe seguir pasando.

---

## 3. Alcance propio

Sí:

- `apps/server/src/metrics-exporter.ts`, `apps/server/src/metrics/**`;
- `apps/server/src/middleware/request-logger.ts`;
- alertas y sus fuentes; sink de eventos del kernel;
- `scripts/secrets-check.ts`, `scripts/connections.ts` y el preflight de provisión;
- `tests/trans04-*.test.ts`;
- evidencia de gate en su forma verificable.

No:

- emitir los eventos de kernel (Trans01) — Trans04 los consume;
- decidir autorización;
- gestionar el gestor de secretos del operador (Doppler) ni rotar credenciales;
- sondas de proveedor con efecto externo.

---

## 4. Los 48 bloques vistos desde observabilidad

| Fase | Bloques | Foco esperado |
|---|---|---|
| `01-consolidacion` | `01.01`–`01.04` | contrato de métrica: nombre, tipo, etiquetas, cardinalidad |
| `02-observabilidad` | `02.01`–`02.04` | exporter, registry, request-logger, alertas base |
| `03-proveedores` | `03.01`–`03.04` | mapeo proveedor→secreto y errores por proveedor |
| `04-whatsapp` | `04.01`–`04.04` | métricas de entrega y fallo de canal |
| `05-google` | `05.01`–`05.04` | métricas de auth y expiración de token |
| `06-data-sintetica` | `06.01`–`06.04` | fixtures de series temporales deterministas |
| `07-owner-real` | `07.01`–`07.04` | alerta real disparada por condición real (sin producción) |
| `08-ciberseguridad` | `08.01`–`08.04` | que ningún log o métrica contenga secretos ni PII |
| `09-observabilidad-v2` | `09.01`–`09.04` | trazas completas, latencias, saturación |
| `10-gestoria` | `10.01`–`10.04` | cuadro operativo del caso de negocio |
| `11-recompilacion` | `11.01`–`11.04` | build y límites de bundle |
| `12-validacion` | `12.01`–`12.04` | gate integral y evidencia verificable |

---

## 5. Plan de ejecución

### Paso 1 — Verificar que las métricas se emiten desde el runtime real

```bash
grep -rn "metricsExporter\|metrics/registry\|requestLogger" apps/server/src --include=*.ts | grep -v test
```

Una métrica registrada pero nunca incrementada es decoración. Cada métrica del contrato debe tener un
punto de emisión identificado.

### Paso 2 — Re-ejecutar suites

```bash
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-isolation=none --test-timeout=60000 --test-force-exit tests/trans04-*.test.ts
```

Esperado: 43 tests, 43 PASS, 0 FAIL.

### Paso 3 — Alertas: probar el disparo y el no-disparo

Para cada alerta: condición que debe dispararla, condición que **no** debe dispararla, y
comportamiento ante repetición (deduplicación / ventana). Una alerta sin prueba negativa es ruido
potencial.

### Paso 4 — Preflight de secretos sin filtrar valores

Reglas duras:

- el preflight reporta **nombre** de variable y estado (`presente`/`ausente`/`formato inválido`);
- nunca el valor, ni parcial, ni su hash reversible;
- un secreto ausente debe producir fallo explícito y exit code distinto de 0;
- la lectura de un secreto en provisión no debe escribirlo en logs ni en artefactos.

Verificar con una ejecución donde falte una variable y comprobar el código de salida.

### Paso 5 — Evidencia de gate

`tests/trans04-gate-evidence.test.ts` valida la forma. Coordinar con Trans00: si el formato cambia,
esta suite debe actualizarse en el mismo commit, no después.

### Paso 6 — Gate y ledger

Gate integral; ledger al día. Hoy `0/48` DONE.

---

## 6. Tests obligatorios

`tests/trans04-*.test.ts` (12 suites):

`alert-concurrency`, `alert-sources`, `bundle-bounds`, `gate-evidence`, `kernel-sink`,
`observability-contract`, `provider-secret-mapping`, `provision-read-safety`, `registry-safety`,
`secrets-preflight`, `shared-metrics`, `tenant-backup`.

Esperado: 43 tests, 43 PASS.

---

## 7. Criterios de DONE

- [ ] Cada métrica del contrato tiene emisor real y consumidor (dashboard/alerta).
- [ ] Cada alerta tiene prueba positiva y negativa.
- [ ] Ningún secreto aparece en logs, métricas, artefactos ni errores.
- [ ] Preflight falla cerrado con exit code distinto de 0.
- [ ] Evidencia de gate en formato verificable y suite de evidencia verde.
- [ ] 43 tests focales verdes y gate integral verde en el SHA declarado.
- [ ] Ledger actualizado.

---

## 8. Riesgos específicos

| Riesgo | Señal | Mitigación |
|---|---|---|
| Métrica decorativa | registrada, nunca incrementada | buscar punto de emisión |
| Cardinalidad explosiva | etiqueta con id de usuario o request | revisar etiquetas |
| Secreto en log | error con URL que incluye token | redacción en logger y test |
| Alerta que nunca dispara | umbral inalcanzable | prueba con valor que cruce umbral |
| Preflight que siempre pasa | no comprueba nada | prueba con variable ausente |
| Evidencia de gate rota | formato cambió sin actualizar test | mismo commit para ambos |

---

## 9. Handoff

A Trans00: formato de evidencia de gate y resultado del preflight. A Trans07: estado de métricas y
alertas para la certificación final. A Trans03: mapeo proveedor→secreto que debe coincidir con el
registro de conexiones trasplantado desde `infra`.
