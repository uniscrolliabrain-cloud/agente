# Trans02 — Cognition V2: atención, contexto, roles y separación de lanes

**Rol:** agente de cognición. Implementa la parte "Slow propone / Fast comunica" sin conceder
autoridad a ningún modelo.
**Base:** `origin/integration/trans00-core` @ `892061c9`.
**Protocolo:** [`00-PROTOCOLO-GENERAL.md`](00-PROTOCOLO-GENERAL.md).

---

## 1. Misión

Preparar **contexto autorizado** para que Fast comunique bien, y recibir de Slow **propuestas
estructuradas** que el kernel decidirá. Cognition V2 no ejecuta, no autoriza y no inventa hechos:
organiza conocimiento, atención y representación.

Regla que Trans02 debe hacer cumplir en código:

- Fast: recibe contexto preparado, interpreta la conversación, comunica. **No** propone operaciones ni
  llama herramientas.
- Slow: comprende, relaciona, propone operaciones o representaciones cognitivas estructuradas.
- JEV: clasifica y evalúa semánticamente. **Nunca** autoridad de ejecución.
- Atención: selecciona contexto pertinente y autorizado, con procedencia.
- Ontología: registra tipos con nombre y versión; una forma persistida no se reinterpreta en silencio.

---

## 2. Estado forense verificado (`892061c9`)

| Requisito | Rutas / evidencia | Verificación | Estado |
|---|---|---|---|
| Cognition V2 (atención, contexto, chat-agent, runtime) | `apps/server/src/engine/cognition/v2/*` | 14 suites `tests/trans02-*` (44 tests: 43 PASS, 1 SKIP) + 28 suites `tests/cognition-v2-*` (70 tests: 61 PASS, 9 SKIP) | `INTEGRATED` + `IMPLEMENTED_TESTED` |
| Separación JEV / Fast / Slow | `tests/trans02-openrouter-jev.test.ts`, `tests/trans01-llm-profiles.test.ts` | PASS con SSE sintético | `INTEGRATED`; proveedor `LIVE_UNVERIFIED` |
| Registro de ontología | `INFORME-REGISTRO-ONTOLOGIA.md`; `tests/cognition-v2-ontology.test.ts` | PASS (5/5 según informe de campaña) | `IMPLEMENTED_TESTED` |
| Factory sin tools para Fast | `INFORME-FACTORY-SIN-TOOLS.md` | PASS | `IMPLEMENTED_TESTED` |
| Integridad de atención | `INFORME-INTEGRIDAD-ATENCION.md` | PASS | `IMPLEMENTED_TESTED` |
| Journal humano (contrato) | `tests/trans02-human-turn-contract.test.ts` | PASS | `INTEGRATED` |
| Compatibilidad SDK | `INFORME-COMPAT-SDK.md` | PASS local | `IMPLEMENTED_TESTED` |
| Composición de proveedores | `INFORME-COMPOSICION-PROVEEDORES.md` | contratos con dobles | `IMPLEMENTED_TESTED`; real `LIVE_UNVERIFIED` |

Total focal reproducido por el auditor: **114 tests, 104 PASS, 10 SKIP, 0 FAIL**.

Los 10 SKIP son de concurrencia multi-conexión que exige PostgreSQL nativo (journal humano y
reconciliación), no funcionalidad ausente.

---

## 3. Alcance propio

Sí:

- `apps/server/src/engine/cognition/v2/**` (atención, contexto, chat-agent, runtime, ontología,
  proyecciones cognitivas);
- contratos de propuesta cognitiva y su validación/proyección;
- `tests/trans02-*.test.ts` y `tests/cognition-v2-*.test.ts`;
- documentación de campaña en `00-coordinacion-multiagente/trans02/EJECUCION/`.

No:

- kernel, autorización, leases y receipts (Trans01);
- clientes HTTP de proveedores y adaptadores de canal (Trans03);
- métricas y alertas (Trans04), aunque consuman eventos cognitivos;
- extracción narrativa y memoria longitudinal (Trans05), que consume contratos de V2.

---

## 4. Los 48 bloques vistos desde Cognition V2

| Fase | Bloques | Foco esperado |
|---|---|---|
| `01-consolidacion` | `01.01`–`01.04` | que Fast no tenga tools y JEV no autorice; contratos de propuesta |
| `02-observabilidad` | `02.01`–`02.04` | trazas de atención: qué contexto se seleccionó y por qué |
| `03-proveedores` | `03.01`–`03.04` | lanes separados: Fast / Slow / JEV, cada uno con su config |
| `04-whatsapp` | `04.01`–`04.04` | contexto de canal sin filtrar datos de otro tenant |
| `05-google` | `05.01`–`05.04` | identidad y permisos en la recuperación de contexto |
| `06-data-sintetica` | `06.01`–`06.04` | fixtures deterministas de conversación y atención |
| `07-owner-real` | `07.01`–`07.04` | recorrido conversacional real con contexto autorizado |
| `08-ciberseguridad` | `08.01`–`08.04` | aislamiento de contexto, deny-by-default en recuperación |
| `09-observabilidad-v2` | `09.01`–`09.04` | procedencia de cada fragmento de contexto |
| `10-gestoria` | `10.01`–`10.04` | caso de negocio: consulta → contexto → respuesta |
| `11-recompilacion` | `11.01`–`11.04` | build reproducible del paquete cognitivo |
| `12-validacion` | `12.01`–`12.04` | gate y ablación de atención (evidencia de escala) |

---

## 5. Plan de ejecución

### Paso 1 — Verificar la frontera Fast/Slow

```bash
code_search 'createFast|fast.*tools|toolChoice' -g '*.ts'
grep -rn "assertNoTools\|tools: \[\]" apps/server/src/engine/cognition --include=*.ts
```

Criterio: debe existir una comprobación **activa** (no solo un prompt) de que el factory de Fast no
recibe herramientas. Un prompt que lo pide no es una garantía.

### Paso 2 — Re-ejecutar suites

```bash
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-isolation=none --test-timeout=60000 --test-force-exit \
  tests/trans02-*.test.ts tests/cognition-v2-*.test.ts
```

Esperado: 114 tests, 104 PASS, 10 SKIP, 0 FAIL. Registrar SHA y exit code.

### Paso 3 — Ontología: nombre + versión + forma persistida

Comprobar que un registro persistido con una versión anterior no se lee como si fuera la actual.
Debe haber rechazo explícito o migración, nunca interpretación silenciosa.

### Paso 4 — Atención con procedencia

Para cada fragmento de contexto inyectado debe poder responderse: origen, autorización, tenant,
fecha. Si no hay traza, no hay integridad de atención demostrable.

### Paso 5 — JEV separado de Slow

Verificar que la cuenta OpenRouter de JEV y la de Slow se resuelven por variables distintas y que
falta de una clave **no** hace fallback silencioso a la otra. Este requisito lo comparte con Trans00
(trasplante de readiness) y Trans03 (proveedores).

### Paso 6 — Gate y ledger

Gate integral en runner con tiempo; actualizar solo bloques con evidencia. Hoy `0/48` DONE.

---

## 6. Tests obligatorios

| Conjunto | Archivos | Esperado |
|---|---|---|
| Trans02 | `tests/trans02-*.test.ts` (14) | 44 tests, 43 PASS, 1 SKIP |
| Cognition V2 | `tests/cognition-v2-*.test.ts` (28) | 70 tests, 61 PASS, 9 SKIP |
| JEV/OpenRouter | `tests/trans02-openrouter-jev.test.ts` | PASS |
| Journal humano | `tests/trans02-human-turn-contract.test.ts` | PASS |
| Ontología | `tests/cognition-v2-ontology.test.ts` | PASS |

---

## 7. Criterios de DONE

- [ ] Fast sin tools verificado por código, no por prompt.
- [ ] JEV sin autoridad de ejecución, con test que lo demuestre.
- [ ] Ontología versionada: forma persistida + rechazo/migración ante versión desconocida.
- [ ] Atención con procedencia y aislamiento por tenant probados.
- [ ] 114 tests focales verdes (o SKIP documentados con motivo).
- [ ] Gate verde en el SHA declarado y evidencia reproducible.
- [ ] Ledger actualizado sin inflar `DONE`.

---

## 8. Riesgos específicos

| Riesgo | Señal | Mitigación |
|---|---|---|
| Fast con tools por configuración heredada | factory compartido con Slow | test que inspeccione el factory |
| Fallback silencioso entre lanes | una clave sirve para dos roles | validar por variable y por lane |
| Contexto sin procedencia | respuesta plausible sin traza | exigir traza en atención |
| Ontología "viva" sin versión | lectura de forma vieja como nueva | versión obligatoria + rechazo |
| SKIP de journal tomado como PASS | 10 skips en el conteo | separar y ejecutar con PostgreSQL 17 |

---

## 9. Handoff

A Trans05: contratos de memoria y extracción narrativa que V2 expone; qué proyecciones ya existen y
cuáles no. A Trans04: eventos cognitivos disponibles para métricas. A Trans00: SHA, suites, SKIP y
deuda de proveedor real.
