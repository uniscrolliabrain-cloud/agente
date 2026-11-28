# Trans06 — Verdad de negocio: verificación, cuatro casos y diagnóstico

**Turno:** Trans06/T1 · **Rama:** `converge/trans00-core` · **Base de campaña:** `892061c9`
**Alcance:** local, sin red, sin datos del owner, sin despliegue.

Este informe sustituye como **estado vigente** a `INFORME-TRUTH-DIAGNOSTICO.md`, que se conserva
intacto como reproducción histórica. No se reescribe: se contrasta.

---

## 1. Qué se ha hecho

1. Se contrastó cada afirmación del informe histórico contra el código del árbol actual.
2. Se re-ejecutaron las suites de verdad y de kernel con su SHA.
3. Se añadió `tests/trans06-truth-cases.test.ts`: los cuatro casos que definen la verdad, más el
   límite de autoridad de una inferencia y el diagnóstico.
4. Se añadió un diagnóstico operativo ejecutable, `scripts/trans06-truth-diagnose.ts`, con su
   fixture sintético y su salida real registrada.

---

## 2. Afirmaciones del informe histórico, contrastadas

Contexto verificado: el informe se emitió en `ab4e7be3` (2026-11-27 10:17:45 +0000) sobre el blob
`f2744f767f1dde82e6d348d9c2c6a1138823fd56`. Ese blob **coincide exactamente** con
`git rev-parse ab4e7be3:apps/server/src/engine/business/truth-resolver.ts`, así que su procedencia es
correcta. El fix llegó después, en `64f160b3` (2026-11-27 11:31:51 +0000,
`fix(truth): validate ranking candidates and cap future timestamp freshness`), y el blob actual es
`4bcc283d690a8f43942645e96a594422a0f74e84`.

| # | Afirmación del informe | Ruta · símbolo | Test que lo ejerce hoy | Estado |
|---|---|---|---|---|
| 1 | Una observación futura (2099) con `reliability` 0.01 gana a una actual con 0.9 porque `freshness` puede exceder 1 | `apps/server/src/engine/business/truth-resolver.ts` · `freshness()` + `TruthResolver.resolve` | `tests/trans01-truth-integrity.test.ts` → «future observation cannot amplify…» | `FIXED` en `64f160b3` · reproducido hoy como PASS |
| 2 | Un candidato de otro `field` devuelve su valor etiquetado con el `field` solicitado | mismo archivo · guarda `TRUTH_FIELD_MISMATCH` | `tests/trans01-truth-integrity.test.ts` → «resolving one field cannot relabel…» | `FIXED` en `64f160b3` · PASS |
| 3 | Fecha inválida → score `NaN` y puede ganar por orden de entrada | `packages/domain/src/truth.ts` · `truthCandidateSchema` (`z.iso.datetime`) + validación en `resolve` | `tests/trans01-truth-integrity.test.ts` → «malformed dates and nonfinite confidence…» | `FIXED` en `64f160b3` · PASS |
| 4 | «Caller directo encontrado `BusinessTruth.resolveField`; hace falta revisar sus entradas y persistencia» | `apps/server/src/engine/business/truth.ts:39` · `BusinessTruth.resolveField` | `tests/trans06-truth-cases.test.ts` (validación de entrada) | `VERIFIED`: el consumidor existe y delega en `TruthResolver`; el resolver es puro, **no persiste** |
| 5 | «Ranking no es evidencia ni autoriza `verified_fact` o efectos» | `packages/domain/src/cognition-v2.ts` · `cognitiveRecordSchema.superRefine` | `tests/trans06-truth-cases.test.ts` → «an inference never raises privileges…» | `VERIFIED_TESTED` |
| 6 | «La fecha futura ya estaba señalada en el diseño P4» | — | — | `DOCUMENTED_ONLY` (sin símbolo ejecutable; no se acredita) |
| 7 | «No se acredita explotación HTTP ni modificación de negocio» | `grep resolveField` en `apps/ packages/ scripts/` | — | `VERIFIED` por ausencia: no hay ruta HTTP que llame a `resolveField` |
| 8 | «Sin cambios funcionales en este incremento» | `git log -1 64f160b3` | — | `SUPERSEDED`: el fix de Trans01 sí cambió el comportamiento, 74 min después |

**Conclusión:** los tres defectos que el informe reproduce eran reales en `ab4e7be3` y están
cerrados en el árbol actual con regresión propia. Ninguna afirmación queda como «verdadera por
prosa»: las que no tienen símbolo ejecutable se marcan `DOCUMENTED_ONLY`.

---

## 3. Los cuatro casos que definen la verdad

Suite nueva: `tests/trans06-truth-cases.test.ts` (9 tests).

| Caso | Qué se prueba | Resultado esperado y obtenido |
|---|---|---|
| **Contradicción** | `crm=active` (0.9) vs `erp=overdue` (0.7) | gana `active`, `wasConflict: true`, el perdedor queda en `conflicts[]` con fuente y fecha; el ganador no depende del orden de entrada. Dos fuentes que coinciden **no** generan conflicto |
| **Ambigüedad de proveedor** | clasificación con `fallbackReason: "timeout"` y `review: "proposed"` | puede viajar como `inference`; como `verified_fact` falla por «verified fact requires receipt». `slowOutputSchema` solo admite `hypothesis/inference/unknown`: la salida del proveedor no puede ser hecho |
| **Repetición** | la misma inferencia ×50 y 30 fuentes distintas repitiendo la misma inferencia | el `kind` sigue siendo `inference`, la confianza es la declarada (0.55, no 1), no hay conflicto entre copias idénticas y con 30 fuentes los conflictos se acotan a 10: repetición no agrega autoridad |
| **Corrección** | hecho antiguo `active` (1.0) vs corrección `cancelled` (0.9) del día anterior | gana `cancelled`, y `active` con su `observedAt` sigue visible en `conflicts[]`; una inferencia obsoleta con `reliability` y `confidence` 1.0 no desplaza a un hecho fresco |

**Autoridad:** un `verified_fact` sin `receipt` en `evidence` es rechazado por schema; con `receipt`
del mismo tenant es aceptado; el `receipt` de otro tenant se rechaza. `TruthResolver` nunca devuelve
`verified_fact` porque `KnowledgeKind` no lo contiene: solo `fact`, `inference`, `user_assertion`.

---

## 4. Diagnóstico operativo

`scripts/trans06-truth-diagnose.ts` (npm: `trans06:diagnose`). No escribe, no llama a proveedores y
no imprime el candidato completo.

```bash
npx tsx scripts/trans06-truth-diagnose.ts \
  --candidates docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans06/EJECUCION/diagnostico-sintetico.json \
  --now 2026-11-27T12:00:00Z
```

Salida real (fixture sintético, sin datos personales):

```
Dato: status
Valor: "active"
Fuente: crm-sintetico
Fecha de observacion: 2026-11-27T10:00:00Z
Resuelto: 2026-11-27T12:00:00.000Z
Estado epistemico: hecho_declarado
Certeza: 0.9
Receipt: ausente (no modelado en TruthCandidate)
Conflictos: 1
  - "overdue" · erp-sintetico · 2026-11-27T09:00:00Z · inferencia
Autoridad: ninguna (el ranking no concede verified_fact ni permisos)
```

Decisiones declaradas, no maquilladas:

- **`receipt`**: `TruthCandidate` no modela receipt. El diagnóstico lo declara **ausente** en vez de
  inventarlo. Un hecho verificado se emite en `cognition-v2` con `evidence.kind === "receipt"`.
- **`observedAt`**: el resolver no lo devuelve; se deriva del candidato ganador por fuente + valor
  (el más reciente). Queda anotado en `notes` de la salida JSON.
- **Validación**: un candidato con fecha inválida o `field` distinto hace que el diagnóstico termine
  con código 2 y mensaje, en lugar de puntuar `NaN`.

---

## 5. Verificación ejecutada

Comando (7 ficheros de suite, incluidos los tres `trans06-*` previos):

```bash
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-isolation=none --test-timeout=60000 --test-force-exit \
  tests/trans06-*.test.ts tests/trans01-truth-integrity.test.ts tests/kernel.test.ts tests/truth-resolver.test.ts
```

- **36 tests, 36 PASS, 0 FAIL, 0 SKIP**, exit 0.
- `npx --no-install tsc --noEmit -p tsconfig.json` → exit 0.
- Diagnóstico sobre el fixture → exit 0 con la salida de §4.

Los hashes de los logs y el `testedCommit` están en `EVIDENCIA.json`.

---

## 6. Lo que este turno NO demuestra

- **Gate integral no ejecutado**: 36 tests de campaña y kernel no son las 12 fases × 4 pasadas.
- **Ledger sin tocar**: `ESTADO-48-BLOQUES.json` sigue con sus 48 bloques en `PENDING`. Un pase no
  promueve ningún bloque a `DONE`.
- **`07-owner-real` (`07.01`–`07.04`) sigue `NOT_RUN`**: no hay autorización ni datos del owner. El
  diagnóstico se ha ejercido solo con fixtures sintéticos.
- **Sin verificación HTTP**: no hay ruta que exponga el diagnóstico ni que llame a `resolveField`;
  no se acredita explotación ni endpoint.
- **Sin proveedores contactados**: la ambigüedad se prueba en el contrato (`fallbackReason`,
  `slowOutputSchema`), no contra un proveedor real.
- **La persistencia del dato de negocio no se ha probado**: `BusinessTruth.resolveField` es puro;
  qué hace el caller con el resultado (guardarlo, marcarlo `verified_fact`) queda fuera de alcance y
  protegido solo por el schema de `cognition-v2`.

---

## 7. Handoff

- **A Trans00:** tabla de §2. Lo verificable está verificado; lo que era prosa histórica se conserva
  como `DOCUMENTED_ONLY`.
- **A Trans05:** la procedencia narrativa debe respetar `fact` / `inference` / `user_assertion` y no
  presentar un `conflict` como certeza.
- **A Trans07:** queda certificada la semántica de verdad (resolución, conflicto, corrección,
  repetición, autoridad) sobre datos sintéticos. La verdad sobre datos del owner sigue fuera.
