# Trans05 — Cognición longitudinal: extracción narrativa y memoria montada

**Rol:** agente de memoria longitudinal. Tiene la única tarea de la convergencia que es
**montar algo ya implementado y probado**.
**Base:** `origin/integration/trans00-core` @ `892061c9`.
**Protocolo:** [`00-PROTOCOLO-GENERAL.md`](00-PROTOCOLO-GENERAL.md).

---

## 1. Misión

Convertir el paquete longitudinal —hoy aislado— en **memoria viva del producto**: que la extracción
narrativa consuma journal real, que los segmentos y packs se persistan, y que la atención pueda
seleccionarlos como contexto.

Hoy el módulo es correcto y está probado. Simplemente **nadie lo llama**. Ese es el trabajo.

---

## 2. Estado forense verificado (`892061c9`)

| Requisito | Rutas / evidencia | Verificación | Estado |
|---|---|---|---|
| Extracción narrativa | `apps/server/src/engine/cognition/v2/longitudinal/narrative-extraction.ts`, `tests/trans05-narrative-extraction.test.ts` | PASS | `IMPLEMENTED_TESTED` |
| Segmentos | `.../longitudinal/segments.ts` | PASS en `tests/trans05-pure-longitudinal.test.ts` | `IMPLEMENTED_TESTED` |
| Pack | `.../longitudinal/pack.ts` | PASS | `IMPLEMENTED_TESTED` |
| Selector | `.../longitudinal/selector.ts` | PASS | `IMPLEMENTED_TESTED` |
| Propuesta | `.../longitudinal/proposal.ts` | PASS | `IMPLEMENTED_TESTED` |
| **Consumidor / montaje** | búsqueda de imports de `longitudinal/` fuera de la carpeta en `apps/server/src` | **0 referencias** | **`UNMOUNTED`** |
| Persistencia y serving | `INFORME-CONVERGENCIA-EN-CURSO.md` los declara pendientes | no existe | `PARTIAL_IMPLEMENTATION` |
| Contratos consumidos | `INFORME-CONTRATOS-CONSUMIDOS.md` | documental | `DOCUMENTED_ONLY` |

Evidencia de ejecución: las suites `tests/trans05-*.test.ts` (2) pasan; en la tanda combinada con
Trans06 se ejecutaron 5 suites / 25 tests / 25 PASS / 0 FAIL sobre `892061c9`.

**Ledger de Trans05 (el único con bloques no-PENDING):**

| Bloque | Fase / pasada | Estado |
|---|---|---|
| `01.02` | `01-consolidacion/02-coding-audit-transversal` | `IN_PROGRESS` |
| `01.03` | `01-consolidacion/03-reaudit-refactoring` | `IN_PROGRESS` |
| `12.02` | `12-validacion/02-coding-audit-transversal` | `IN_PROGRESS` |
| `07.01`–`07.04` | `07-owner-real/*` | `NOT_RUN` |

Los 41 restantes están `PENDING`. Ninguno `DONE`.

---

## 3. Alcance propio

Sí:

- `apps/server/src/engine/cognition/v2/longitudinal/**`;
- el **consumidor** que la campaña previó (journal → extracción → segmentos/packs → selección);
- persistencia y lectura de segmentos/packs, con aislamiento por tenant;
- `tests/trans05-*.test.ts` y el test de recorrido completo que hoy no existe;
- `Trans05/EJECUCION/*`.

No:

- reescribir atención o contexto de V2 (Trans02): se **integra** con ellos;
- inventar un modelo de datos nuevo si ya hay tablas/contratos previstos;
- serving HTTP nuevo si la campaña preveía una ruta concreta: usar la prevista.

---

## 4. Los 48 bloques vistos desde longitudinal

| Fase | Bloques | Foco esperado |
|---|---|---|
| `01-consolidacion` | `01.01`–`01.04` | **montaje**: quién llama, con qué contrato, dónde se persiste (`01.02`/`01.03` en curso) |
| `02-observabilidad` | `02.01`–`02.04` | traza de extracción: cuántos segmentos, de qué fuente, con qué coste |
| `03-proveedores` | `03.01`–`03.04` | qué lane ejecuta la extracción y con qué límites |
| `04-whatsapp` | `04.01`–`04.04` | narrativa proveniente de conversación de canal |
| `05-google` | `05.01`–`05.04` | narrativa proveniente de correo/calendario autorizado |
| `06-data-sintetica` | `06.01`–`06.04` | corpus sintético reproducible para segmentar |
| `07-owner-real` | `07.01`–`07.04` | **NOT_RUN**: recorrido real del owner, sin datos de terceros |
| `08-ciberseguridad` | `08.01`–`08.04` | aislamiento por tenant y retención |
| `09-observabilidad-v2` | `09.01`–`09.04` | calidad de selección (¿el pack elegido era el relevante?) |
| `10-gestoria` | `10.01`–`10.04` | memoria útil en un caso de negocio |
| `11-recompilacion` | `11.01`–`11.04` | build del paquete y migraciones |
| `12-validacion` | `12.01`–`12.04` | test de recorrido completo (`12.02` en curso) |

---

## 5. Plan de ejecución

### Paso 1 — Confirmar que sigue desmontado

```bash
grep -rn "longitudinal/" apps/server/src --include=*.ts | grep -v "cognition/v2/longitudinal/"
grep -rn "narrative-extraction\|selectSegments\|buildPack\|proposeLongitudinal" apps/server/src --include=*.ts
```

Buscar también re-exports (`index.ts`, barrels), imports dinámicos y consumidores indirectos por
nombre de tipo. Si aparece un consumidor, el estado cambia y hay que re-auditarlo antes de escribir
código.

### Paso 2 — Identificar el punto de entrada previsto

Leer `INFORME-CONTRATOS-CONSUMIDOS.md` y el README de la fase `01-consolidacion` de Trans05. El
consumidor no se inventa: la campaña ya declaró cuál era (journal → extracción → persistencia →
selección para contexto). Si el documento no lo dice con precisión, escribirlo **antes** de codificar
y validarlo con Trans00.

### Paso 3 — Montar el recorrido mínimo

Recorrido mínimo aceptable:

1. un hecho del journal (turno humano o evento de negocio) entra al extractor;
2. se producen segmentos con procedencia (tenant, fuente, fecha, referencia al evento);
3. se persisten de forma idempotente (reprocesar el mismo evento no duplica);
4. el selector recupera un pack para un tenant y una consulta;
5. la atención de V2 puede consumirlo como contexto (o se declara por qué aún no).

Cada paso con test. Sin el paso 5, el estado sigue siendo `UNMOUNTED` funcional aunque haya
persistencia.

### Paso 4 — Aislamiento y retención

- Toda consulta filtra por tenant derivado del contexto autenticado, nunca de un parámetro libre.
- Reprocesar no duplica (`UNIQUE` por tenant + referencia de evento, o hash estable).
- Borrado/retención: qué pasa con la memoria de un tenant que se elimina. Si no está definido, se
  declara como deuda, no se ignora.

### Paso 5 — Prueba de recorrido completo

Añadir una suite de extremo a extremo (una sola, no una batería):

`tests/trans05-longitudinal-mounted.test.ts` — evento → extracción → persistencia → selección →
contexto, con dos tenants para probar aislamiento.

### Paso 6 — `07-owner-real`

Solo con autorización y datos del owner (no de terceros). Si no hay authorization, los cuatro bloques
siguen `NOT_RUN`, no `DONE`.

---

## 6. Tests obligatorios

| Conjunto | Archivos | Esperado |
|---|---|---|
| Extracción narrativa | `tests/trans05-narrative-extraction.test.ts` | PASS |
| Puro longitudinal | `tests/trans05-pure-longitudinal.test.ts` | PASS |
| Recorrido montado (nuevo) | `tests/trans05-longitudinal-mounted.test.ts` | PASS con 2 tenants |
| Idempotencia | dentro de la suite nueva | reprocesar no duplica |
| Regresión de contexto | suite de atención de V2 | PASS |

---

## 7. Criterios de DONE

- [ ] Existe al menos un consumidor real fuera de `longitudinal/`.
- [ ] El recorrido evento → persistencia → selección está probado de extremo a extremo.
- [ ] Idempotencia demostrada por test.
- [ ] Aislamiento por tenant demostrado con dos tenants.
- [ ] Retención/borrado definido o declarado como deuda con dueño.
- [ ] `07.01`–`07.04` ejecutados con datos del owner o mantenidos en `NOT_RUN`.
- [ ] Gate verde y evidencia reproducible.

---

## 8. Riesgos específicos

| Riesgo | Señal | Mitigación |
|---|---|---|
| "Montado" solo por re-export | barrel que nadie importa | buscar import real, no export |
| Duplicación al reprocesar | dos packs del mismo evento | clave idempotente |
| Fuga entre tenants | selector sin filtro | test con dos tenants |
| Coste descontrolado | extracción en cada turno | límites y traza de coste |
| `07-owner-real` simulado | datos inventados presentados como owner | mantener `NOT_RUN` |
| Cerrar por documentación | informe sin test de recorrido | exigir suite de extremo a extremo |

---

## 9. Handoff

A Trans02: contrato exacto con el que la atención consume packs. A Trans00: decisión de punto de
entrada y estado de los cuatro bloques `07-*`. A Trans06: procedencia narrativa disponible para el
diagnóstico de verdad de negocio.
