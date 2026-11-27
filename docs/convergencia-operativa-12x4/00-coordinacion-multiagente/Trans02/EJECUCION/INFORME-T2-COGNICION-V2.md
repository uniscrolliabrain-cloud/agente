# Trans02 — Cognition V2: frontera Fast/Slow, ontología y atención

**Turno:** Trans02/T1 · **Rama:** `converge/trans00-core` · **Base de campaña:** `892061c9`
**Commit evaluado:** `5a7ea97a` · **Alcance:** local, sin red, sin proveedores reales, sin despliegue.

---

## 1. Verificación ejecutada

42 ficheros de suite (14 `tests/trans02-*` + 28 `tests/cognition-v2-*`), en seis tandas para
caber en el límite del runner. Todas las tandas con exit 0.

| Tanda | Suites | Tests | PASS | SKIP | FAIL |
|---|---|---|---|---|---|
| 1 · `trans02-*` (atención, contexto, chat-agent, revocación, Fast) | 7 | 14 | 14 | 0 | 0 |
| 2 · `trans02-*` (journal, contrato humano, ontología, JEV, chunks, serving, slow) | 8 | 32 | 31 | 1 | 0 |
| 3 · `cognition-v2-*` (backfill, business-read, cache, contratos, cyber, entrega, durabilidad) | 7 | 22 | 19 | 3 | 0 |
| 4 · `cognition-v2-*` (receipts, fallos, http, egress JEV, JEV, kernel, memoria) | 7 | 22 | 20 | 2 | 0 |
| 5 · `cognition-v2-*` (migración, ontología, eventos, rag, rls, runtime-outcome) | 7 | 13 | 11 | 2 | 0 |
| 6 · `cognition-v2-*` (runtime, seguridad, slow, transacciones, voz, workers, postgres) | 7 | 13 | 11 | 2 | 0 |
| **Total** | **42** | **116** | **106** | **10** | **0** |

`npx --no-install tsc --noEmit -p tsconfig.json` → exit 0.

El corpus declaraba 114 tests (104 PASS, 10 SKIP) para las 42 suites. La diferencia es exactamente
`tests/trans02-fast-text-only.test.ts`, añadido en este turno: **116/106/10/0**. Los 10 SKIP son los
mismos que el corpus documenta.

---

## 2. Paso 1 — la lane Fast no recibe herramientas, y se comprueba en código

No es un prompt. En `apps/server/src/engine/cognition/v2/provider.ts`:

- el proveedor se construye como `BuiltInAgent({ type: "custom", factory })`, no en modo clásico que
  inyectaría herramientas de estado de AG-UI;
- la llamada al modelo es `languageModel.doStream({ prompt, maxOutputTokens })`: no existe el
  parámetro `tools`;
- `agent.run({ ...input, tools: [] })` descarta las herramientas que traiga el caller;
- cualquier parte de respuesta `tool-*` o `error` aborta con `PROVIDER_TEXT_ONLY_REQUIRED` (línea 40),
  de modo que una tool call nunca se convierte en evento público.

`tests/trans02-fast-text-only.test.ts` (nuevo, 2 tests) lo fija con la lane **fast** real:

1. el caller pasa una herramienta `send_email`; el cuerpo enviado al proveedor **no** contiene
   `tools`, ni `tool_choice`, ni el nombre de la herramienta, y solo se emiten eventos de texto;
2. el proveedor responde con `tool_calls`; el stream se rechaza y no se emite ningún evento con
   `TOOL`.

---

## 3. Paso 3 — ontología con nombre, versión y rechazo explícito

`apps/server/src/engine/cognition/chromatic/ontology-registry.ts` no reinterpreta en silencio:

| Situación | Resultado |
|---|---|
| misma `ontologyId`+`version` con contenido distinto | `ONTOLOGY_VERSION_CONFLICT` |
| registro persistido con forma inválida | `ONTOLOGY_STORED_INVALID` |
| id pedido que no corresponde al `ontologyId`/`version` persistidos | `ONTOLOGY_BINDING_MISMATCH` |
| versión no `approved` | `CHROMATIC_BLOCKED_DECISION` |
| aprobación revocada | `ONTOLOGY_APPROVAL_REVOKED` |
| eje desconocido o valor fuera de rango | `UNKNOWN_CHROMATIC_AXIS` / `CHROMATIC_VALUE_OUT_OF_RANGE` |

`tests/trans02-ontology-registry-integrity.test.ts` (2 tests) prueba la sustitución bajo otra
identidad/versión y que el registro persistido se parsea **antes** de invocar a la autoridad de
aprobación (la autoridad no se llama con datos inválidos).

---

## 4. Paso 4 — atención con procedencia

`GlobalAttentionWorkspace` (`apps/server/src/engine/cognition/v2/attention.ts`) guarda, por vista:
identidad vinculada, `algorithmVersion: "attention-v2.3"`, `contextSnapshotId`, `sourceWatermark`,
seleccionados con su `epistemic` y `signals`, y `expiresAt`. La lectura vuelve a derivar la selección
desde el snapshot autorizado y devuelve `null` si cambia el digest de identidad, el `queryDigest`, el
watermark, la caducidad, la selección recalculada o el propio `id` de la vista. La `query` privada se
guarda para replay pero **no** se devuelve.

`tests/trans02-attention-integrity.test.ts` (3 tests) cubre: sustituir epistemia/puntuaciones/
referencias, recomputar el id con datos fabricados, y metadata malformada → fail closed.

---

## 5. Paso 5 — JEV separado de Slow

`apps/server/src/engine/cognition/v2/jev-classifier.ts` resuelve la credencial como
`JEV_OPENROUTER_API_KEY` **o** `OPENROUTER_API_KEY` (la cuenta JEV), nunca `OPEN_ROUTER_API_KEY`
(la cuenta de Slow, con guion bajo). `llm-config.ts` documenta la misma frontera: la lane Slow es la
única que puede caer en `OPEN_ROUTER_API_KEY`.

`tests/trans02-openrouter-jev.test.ts` (6 tests) lo prueba explícitamente: con solo
`OPEN_ROUTER_API_KEY` el adaptador falla con `/UNCONFIGURED/`; con ambas claves usa la de JEV, y el
cuerpo enviado al proveedor no contiene la clave, ni el tenant, ni la evidencia.

**Matiz declarado:** sí existe fallback de `JEV_OPENROUTER_API_KEY` a `OPENROUTER_API_KEY`, porque
son dos nombres de la misma cuenta JEV. Lo que no existe —y es lo que exige la campaña— es fallback
a la cuenta de Slow.

---

## 6. Los 10 SKIP, con su motivo

Ninguno es funcionalidad ausente: todos exigen PostgreSQL nativo o un flag sintético explícito.

1. `Postgres human journal: two connections admit one run and rollback a failed capture`
2. `C01 native concurrent backfill journals one import across two connections`
3. `two Postgres connections cannot execute the same operation concurrently`
4. `C09 native Postgres workers reconcile one expired lease once under concurrent connections`
5. `C08 native concurrent workers admit one in-flight request and rollback quota with failed transaction`
6. `C02 native competing receipt workers commit one projection under tenant fence`
7. `restricted Postgres role isolates voice and cyber module records across tenants`
8. `C01 restricted Postgres role: RLS rejects cross-tenant reads and writes without relying on SQL filters`
9. `C02 real Postgres: pinned connections, concurrent rollback, atomic event ordering and kernel capture`
   (`# Requires explicit local synthetic COG…`)
10. `separate Postgres worker publishes readiness and recovers events written while stopped`

---

## 7. Lo que este turno NO demuestra

- **Gate integral no ejecutado**: 116 tests focales no son las 12 fases × 4 pasadas.
- **Ledger sin tocar**: los 48 bloques de Trans02 siguen `PENDING`.
- **Ningún proveedor real**: JEV, Fast y Slow se ejercen con transporte sintético; siguen
  `LIVE_UNVERIFIED`.
- **Los 10 SKIP no son PASS**: la concurrencia multi-conexión sigue sin probarse aquí.
- **`07-owner-real` sigue `NOT_RUN`**.

---

## 8. Handoff

- **A Trans05:** los contratos de memoria y atención que V2 expone quedan verificados; la procedencia
  narrativa debe conservar `epistemic` tal cual.
- **A Trans04:** los eventos cognitivos (`cognition.v2.*`) son la fuente de métricas; no se ha medido
  latencia real.
- **A Trans00:** SHA, desglose de suites, 10 SKIP con motivo y deuda `LIVE_UNVERIFIED`.
