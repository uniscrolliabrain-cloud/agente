# Trans05 · Turno T1 — montaje longitudinal

**Base:** `892061c9` · **Rama:** `converge/trans00-core` · **Fecha:** 2026-11-27
**Autorización:** continuación ordenada por el operador. Sin merge, sin despliegue, sin proveedores.

## 1. Qué estaba desmontado

Los cinco ficheros de `cognition/v2/longitudinal/` estaban `IMPLEMENTED_TESTED` pero **sin ningún consumidor fuera de su carpeta**: `segmentText`, `validateNarrativeExtraction`, `packLongitudinalContext`, `validateLongitudinalProposal` y `selectSkills` solo los llamaban sus propios tests. Eso es `UNMOUNTED`, no `INTEGRATED`.

## 2. Qué se montó

| Fichero | Cambio |
| --- | --- |
| `apps/server/src/engine/cognition/v2/longitudinal/memory.ts` | **nuevo**: `installLongitudinal(db)` y `LongitudinalMemory` con `ingest`, `segments` y `context` |
| `apps/server/src/engine/cognition/v2/context.ts` | **consumidor real**: `ContextServingFacade` acepta la memoria y expone `longitudinalContext()` |
| `tests/trans05-longitudinal-mounted.test.ts` | **nuevo**: recorrido completo con dos tenants |

El recorrido que exige la campaña queda así:

1. **un evento entra al extractor** → `ingest` parte el texto con `segmentText` (offsets UTF-16 exactos, digest por segmento);
2. **segmentos con procedencia** → tabla `cognition_v2_longitudinal_segments` con `source_event_id`, `source_digest`, `start_offset`, `end_offset`, `digest`;
3. **persistencia idempotente** → clave `(tenant, source_event_id, segment_index)`; reprocesar devuelve `created: 0`; contenido distinto con la misma clave lanza `LONGITUDINAL_SEGMENT_CONFLICT`, no sobrescribe;
4. **el selector recupera un pack** → `context()` devuelve lo que valida `packLongitudinalContext`, con presupuesto y cuotas reales, `serialized` incluido;
5. **la atención lo consume** → `ContextServingFacade.longitudinalContext()` revalida autorización antes y después de leer, y falla cerrado (`LONGITUDINAL_MEMORY_NOT_MOUNTED`) si no hay memoria.

### Aislamiento

El tenant se toma **solo** de la identidad autenticada (`assertIdentity`); no hay parámetro de tenant en la API. La prueba ingiere dos tenants y comprueba que cada uno ve únicamente sus segmentos, incluso reutilizando el mismo `source_event_id`.

## 3. Criterios de DONE de la campaña

| Criterio | Estado |
| --- | --- |
| Consumidor real fuera de `longitudinal/` | **cumplido** (`context.ts`) |
| Recorrido evento → persistencia → selección probado de extremo a extremo | **cumplido** |
| Idempotencia demostrada por test | **cumplido** |
| Aislamiento por tenant con dos tenants | **cumplido** |
| Retención/borrado definido o declarado como deuda | **declarado deuda** (§4) |
| `07.01`–`07.04` con datos del owner o en `NOT_RUN` | **`NOT_RUN`** (sin autorización ni datos del owner) |
| Gate verde y evidencia reproducible | **parcial**: suites y typecheck sí, gate integral no |

## 4. Deuda declarada, no ignorada

- **Retención**: no hay ruta de borrado por tenant para `cognition_v2_longitudinal_segments`. Quédate con esto como deuda explícita; no se implementa aquí porque el criterio de retención del producto no está definido.
- **`07-owner-real`**: sigue `NOT_RUN`. No hay datos del owner ni autorización; inventar un recorrido lo convertiría en evidencia falsa.
- **Ledger**: `01.02`, `01.03` y `12.02` siguen `IN_PROGRESS` y el resto `PENDING`. El montaje avanza el contenido, pero un turno no satisface el criterio de 12 fases × 4 pasadas; ascender bloques aquí sería el error que el protocolo prohíbe.

## 5. Verificación

| Comprobación | Resultado |
| --- | --- |
| `tests/trans05-*.test.ts` (3 suites) | **12/12 PASS**, 0 fail, exit 0 |
| `tsc --noEmit -p tsconfig.json` | **exit 0**, 0 errores |

La primera ejecución falló: el texto del fixture medía 2.198 caracteres y cabía en **un solo** segmento, así que la aserción «se parte en segmentos» era falsa por el fixture, no por el montaje. Se corrigió el fixture a ~6.500 caracteres y el presupuesto del pack a 9.000 bytes; no se relajó ninguna aserción.

## 6. Siguiente

- **Trans06**: verdad de negocio (hecho vs inferencia) contra el código vigente.
- **Retención**: definir política antes de dar por cerrado `01-consolidacion`.
- **`07-owner-real`**: necesita autorización explícita y datos del owner.
