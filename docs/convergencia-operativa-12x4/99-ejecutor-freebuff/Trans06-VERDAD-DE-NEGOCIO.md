# Trans06 — Verdad de negocio: diagnóstico, procedencia y regresiones

**Rol:** agente de verdad operativa. Distingue lo que el sistema **sabe** de lo que **infiere**, y lo
demuestra con código y datos, no con prosa.
**Base:** `origin/integration/trans00-core` @ `892061c9`.
**Protocolo:** [`00-PROTOCOLO-GENERAL.md`](00-PROTOCOLO-GENERAL.md).

---

## 1. Misión

Que el producto pueda responder, sobre cualquier dato de negocio: **¿de dónde sale esto, cuándo se
verificó, y qué pasa si el proveedor se equivoca?** Trans06 convierte receipts y hechos en diagnóstico
comprensible, y evita que una inferencia se degrade en "hecho" por repetición.

La frase del sistema que Trans06 protege: *los receipts deterministas sustentan hechos verificados;
una inferencia o clasificación no se convierte automáticamente en un hecho ni concede permisos.*

---

## 2. Estado forense verificado (`892061c9`)

| Requisito | Rutas / evidencia | Verificación | Estado |
|---|---|---|---|
| Corrección de `truth-resolver` | `apps/server/src/engine/business/truth-resolver.ts` | compartida con Trans01; `tests/trans01-truth-integrity.test.ts` PASS | `INTEGRATED` (corrección) |
| Primitivas de verdad | `tests/trans06-primitives.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Composición | `tests/trans06-composition.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Regresiones de kernel | `tests/trans06-kernel-regressions.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Diagnóstico documentado | `INFORME-TRUTH-DIAGNOSTICO.md`, `EVIDENCIA-TRUTH-DIAGNOSTICO.json` | declarado en `f3b1b3ec`: 37 tests, 37 PASS, typecheck 0 | `DOCUMENTED_ONLY` en la parte no cubierta por tests |
| Evidencia de campaña | `Trans06/EJECUCION/EVIDENCIA.json` | `testedCommit` `f3b1b3ec`, logs con hash real | válida (a diferencia de Trans01) |

Ejecución reproducida por el auditor sobre `892061c9`: las suites `trans05-*` + `trans06-*` sumaron
5 suites, 25 tests, **25 PASS, 0 FAIL**. La evidencia de campaña declara 37 tests en `f3b1b3ec` con un
conjunto más amplio; ambas cifras son válidas **con su SHA y su conjunto de archivos**.

**Conclusión:** la implementación de diagnóstico existe y pasa. Lo que falta es cobertura documental
verificada contra el código vigente y criterios operativos ejecutados, no código nuevo.

---

## 3. Alcance propio

Sí:

- `apps/server/src/engine/business/truth-resolver.ts` en su semántica de verdad y procedencia;
- primitivas de diagnóstico y su composición;
- `tests/trans06-*.test.ts` y regresiones que protegen el kernel de cambios de verdad;
- `INFORME-TRUTH-DIAGNOSTICO.md` y su evidencia, verificados contra el árbol actual.

No:

- reescribir `truth-resolver.ts` si el comportamiento ya es correcto: se prueba y se documenta;
- métricas (Trans04) o contexto (Trans02);
- datos reales de negocio sin autorización del owner.

---

## 4. Los 48 bloques vistos desde verdad de negocio

| Fase | Bloques | Foco esperado |
|---|---|---|
| `01-consolidacion` | `01.01`–`01.04` | definición operativa de hecho vs inferencia vs propuesta |
| `02-observabilidad` | `02.01`–`02.04` | traza de por qué un dato se considera verdadero |
| `03-proveedores` | `03.01`–`03.04` | resultado de proveedor ambiguo → no es hecho |
| `04-whatsapp` | `04.01`–`04.04` | mensaje entregado vs mensaje afirmado |
| `05-google` | `05.01`–`05.04` | dato de correo/calendario con procedencia |
| `06-data-sintetica` | `06.01`–`06.04` | casos sintéticos de contradicción y corrección |
| `07-owner-real` | `07.01`–`07.04` | diagnóstico sobre datos del owner, con permiso |
| `08-ciberseguridad` | `08.01`–`08.04` | que una inferencia no eleve privilegios |
| `09-observabilidad-v2` | `09.01`–`09.04` | métricas de conflicto y de verdad degradada |
| `10-gestoria` | `10.01`–`10.04` | diagnóstico útil en el caso de negocio |
| `11-recompilacion` | `11.01`–`11.04` | build y migraciones de datos de verdad |
| `12-validacion` | `12.01`–`12.04` | gate y regresiones de verdad |

---

## 5. Plan de ejecución

### Paso 1 — Verificar cada afirmación del informe contra el código

`INFORME-TRUTH-DIAGNOSTICO.md` describe comportamiento. Para cada afirmación: ruta, símbolo, test que
lo ejerce. Si una afirmación no tiene test, se marca `DOCUMENTED_ONLY` — no se "arregla" el documento
para que parezca verificado.

### Paso 2 — Re-ejecutar y ampliar el conjunto

```bash
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-isolation=none --test-timeout=60000 --test-force-exit \
  tests/trans06-*.test.ts tests/trans01-truth-integrity.test.ts tests/kernel.test.ts
```

Esperado mínimo: 5 suites combinadas trans05+trans06 verdes (25 PASS en `892061c9`); la evidencia de
campaña declara 37 en `f3b1b3ec`. Registrar ambos con su SHA.

### Paso 3 — Probar los cuatro casos que definen la verdad

1. **Contradicción:** dos fuentes discrepan → el resolver no elige en silencio, registra conflicto.
2. **Ambigüedad de proveedor:** timeout o 5xx ambiguo → no se marca hecho; se reconcilia.
3. **Repetición:** la misma inferencia repetida N veces no se convierte en hecho.
4. **Corrección:** un hecho posterior invalida al anterior y la historia queda visible.

Cada caso con test. Estos cuatro son el corazón de Trans06.

### Paso 4 — Diagnóstico operativo

Producir una salida de diagnóstico (script o endpoint existente, no uno nuevo si ya hay ruta) que,
para un tenant y un dato, muestre: valor, fuente, receipt, fecha, estado epistémico y conflictos.
Sin datos personales en la evidencia.

### Paso 5 — Gate y ledger

Gate integral; actualizar solo bloques con evidencia. Hoy `0/48` DONE. El estado correcto de Trans06
es `INTEGRATED` para la corrección de `truth-resolver` y `DOCUMENTED_ONLY`/`IMPLEMENTED_TESTED` para el
resto, nunca "campaña cerrada".

---

## 6. Tests obligatorios

| Conjunto | Archivos | Esperado |
|---|---|---|
| Primitivas | `tests/trans06-primitives.test.ts` | PASS |
| Composición | `tests/trans06-composition.test.ts` | PASS |
| Regresiones de kernel | `tests/trans06-kernel-regressions.test.ts` | PASS |
| Integridad de verdad | `tests/trans01-truth-integrity.test.ts` | PASS |
| Contradicción/ambigüedad/repeso/corrección | suite propia o ampliación de primitivas | PASS |

---

## 7. Criterios de DONE

- [ ] Cada afirmación del informe tiene ruta + símbolo + test.
- [ ] Los cuatro casos (contradicción, ambigüedad, repetición, corrección) están probados.
- [ ] Diagnóstico operativo ejecutable sin exponer datos personales.
- [ ] Una inferencia no eleva privilegios ni se marca hecho (test).
- [ ] Gate verde y evidencia con hash real y `testedCommit`.
- [ ] Ledger actualizado sin inflar `DONE`.

---

## 8. Riesgos específicos

| Riesgo | Señal | Mitigación |
|---|---|---|
| Informe que describe código inexistente | ruta no encontrada | marcar `DOCUMENTED_ONLY` |
| Repetición convertida en hecho | umbral de confianza sin control | test de repetición |
| Conflicto resuelto en silencio | se elige la última fuente | registrar conflicto explícito |
| Ambigüedad tratada como éxito | timeout = verdad | reconciliación obligatoria |
| Cifras sin SHA | "37 tests" sin contexto | citar SHA y conjunto de archivos |

---

## 9. Handoff

A Trans00: tabla de afirmaciones verificadas vs documentales. A Trans07: qué parte de la verdad de
negocio queda certificada y qué depende de datos reales del owner. A Trans05: procedencia narrativa
que debe respetar la distinción hecho/inferencia.
