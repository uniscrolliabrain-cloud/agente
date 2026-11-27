# Trans01 — Kernel, autorización, leases, receipts y replay

**Rol:** agente de kernel. Es el que hace cierta la segunda cláusula de la autoridad del sistema.
**Base:** `origin/integration/trans00-core` @ `892061c9`.
**Protocolo:** [`00-PROTOCOLO-GENERAL.md`](00-PROTOCOLO-GENERAL.md).

---

## 1. Misión

Garantizar que **toda operación con efecto pasa por kernel, se autoriza, se ejecuta una sola vez y
deja receipt verificable**. El kernel valida y autoriza; no ejecuta. El runtime ejecuta; no decide.

Todo lo demás de Trans01 (journal humano, bus de eventos, outbox, replay, truth ranking) existe para
que esa garantía sea reconstruible y auditable.

---

## 2. Estado forense verificado (`892061c9`)

| Requisito | Rutas | Verificación | Estado |
|---|---|---|---|
| Kernel + autorización + leases + receipts | `apps/server/src/engine/**` | 29 suites `tests/trans01-*.test.ts`, 142 tests: 139 PASS, 3 SKIP, 0 FAIL | `INTEGRATED` + `IMPLEMENTED_TESTED` |
| Bus de eventos tipado | `apps/server/src/engine/events/bus.ts` | ejercido por suites de kernel y Trans04 | `INTEGRATED` |
| Journal humano / envelope causal de turno | `tests/trans01-human-turn-envelope.test.ts`, `tests/trans02-human-turn-contract.test.ts` | PASS en lote | `INTEGRATED` + `IMPLEMENTED_TESTED` |
| Truth ranking | `apps/server/src/engine/business/truth-resolver.ts` | `tests/trans01-truth-integrity.test.ts` PASS | `INTEGRATED` + `IMPLEMENTED_TESTED` |
| Perfiles LLM y wiring de proveedores | `tests/trans01-llm-profiles.test.ts`, `tests/trans01-meta-muse.test.ts`, `tests/trans01-openrouter-app-wiring.test.ts` | PASS con dobles | `INTEGRATED`; proveedor `LIVE_UNVERIFIED` |
| Alertas kernel→HTTP | `docs/.../Trans01/EJECUCION/INFORME-KERNEL-HTTP-ALERTAS.md` | gate documentado | `DOCUMENTED_ONLY` + implementación en Trans04 |
| Evidencia de typecheck del acta | `Trans01/EJECUCION/EVIDENCIA.json` → `tsc` | **SHA-256 de archivo vacío** (`e3b0c442…b855`) | evidencia inválida (H1) |

Typecheck propio: `corepack pnpm typecheck` → exit 0 en `892061c9` (verificado por el auditor).
Gate documentado en `9eb03fd5`: 1.173 tests, 1.143 PASS, 0 FAIL, 25 SKIP, 5 TODO, 10/10 checks.

**Conclusión honesta:** el kernel está implementado, montado y probado de forma focal. Lo que falta
no es código: es evidencia válida y cobertura de concurrencia real (PostgreSQL nativo).

---

## 3. Alcance propio

Sí es de Trans01:

- `apps/server/src/engine/**` (kernel, autorización, leases, receipts, outbox, replay, proyecciones);
- `apps/server/src/engine/events/bus.ts` y contratos de eventos;
- `apps/server/src/engine/business/truth-resolver.ts` en lo que toca a integridad de verdad;
- `tests/trans01-*.test.ts` y las suites de kernel que Trans04/Trans06 reutilizan;
- las evidencias de `Trans01/EJECUCION/`.

No es de Trans01:

- métricas y alertas (Trans04), aunque el kernel emita los eventos que las alimentan;
- cognition, atención y contexto (Trans02);
- adaptadores de proveedor (Trans03), salvo el contrato que el kernel exige;
- el diagnóstico de negocio completo (Trans06), aunque comparta `truth-resolver.ts`.

---

## 4. Los 48 bloques vistos desde el kernel

Los bloques son índice de cobertura (§5 del protocolo). Para Trans01, el foco por fase:

| Fase | Bloques | Qué debe demostrar el kernel |
|---|---|---|
| `01-consolidacion` | `01.01`–`01.04` | invariantes: deny-by-default, fail-closed, idempotencia, un solo efecto por operación |
| `02-observabilidad` | `02.01`–`02.04` | eventos de kernel emitidos con tipado y sin pérdida; sink verificable |
| `03-proveedores` | `03.01`–`03.04` | el contrato de proveedor no concede autoridad; propuesta ≠ permiso |
| `04-whatsapp` | `04.01`–`04.04` | entrada de canal crea operación autorizada, no ejecución directa |
| `05-google` | `05.01`–`05.04` | identidad y scopes no eluden la autorización |
| `06-data-sintetica` | `06.01`–`06.04` | fixtures deterministas para leases/replay |
| `07-owner-real` | `07.01`–`07.04` | recorrido real: humano → propuesta → autorización → receipt |
| `08-ciberseguridad` | `08.01`–`08.04` | aislamiento por tenant, límites de autorización, revocación |
| `09-observabilidad-v2` | `09.01`–`09.04` | trazabilidad causal reconstruible desde receipts |
| `10-gestoria` | `10.01`–`10.04` | flujo de negocio completo bajo autorización |
| `11-recompilacion` | `11.01`–`11.04` | build reproducible del kernel (`corepack pnpm build:server`) |
| `12-validacion` | `12.01`–`12.04` | gate integral y pruebas de concurrencia reales |

---

## 5. Plan de ejecución

### Paso 1 — Verificar montaje, no solo existencia

```bash
code_search 'from .*engine/(kernel|authorization|leases|receipts|outbox)' -g '*.ts'
grep -rn "executeOperation\|authorize(" apps/server/src --include=*.ts | head -40
```

Pregunta que hay que responder por escrito: **¿quién llama al kernel y con qué contrato?** Si un
símbolo del kernel solo lo llama su propio test, el requisito está `UNMOUNTED`, no `INTEGRATED`.

### Paso 2 — Re-ejecutar las suites focalizadas

```bash
ALLOW_NETWORK=0 node --import tsx --import ./tests/setup.ts --test \
  --test-isolation=none --test-timeout=60000 --test-force-exit tests/trans01-*.test.ts
```

Registrar `total/pass/fail/skip` y el SHA. Los 3 SKIP esperados son de concurrencia multi-conexión.

### Paso 3 — Reparar la evidencia del acta (H1)

El `EVIDENCIA.json` de Trans01 declara un log `tsc` con SHA-256 de fichero vacío. Regenerar:

```bash
mkdir -p docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/EVIDENCIA/logs
corepack pnpm typecheck > docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/EVIDENCIA/logs/typecheck-<sha>.log 2>&1
echo "exit=$?"
sha256sum docs/.../logs/typecheck-<sha>.log
```

Sustituir la entrada `tsc` con `path`, `sha256` real, `exitCode` y `testedCommit`. No borrar el acta
anterior: corregirla y anotar la corrección en `INFORME-E-M1-EN-CURSO.md`.

### Paso 4 — PostgreSQL 17 para los SKIP

Los tests que hoy se saltan verifican garantías distribuidas (dos conexiones no ejecutan la misma
operación a la vez, una lease expirada se reconcilia una sola vez). Con una instancia desechable:

```bash
docker run --rm -d --name pg-audit -e POSTGRES_PASSWORD=... -p 55432:5432 postgres:17
# apuntar DATABASE_URL al puerto efímero y ejecutar SOLO las suites de concurrencia
```

Si el runner no tiene PostgreSQL nativo, dejar los SKIP con motivo y entorno, y marcar el requisito
como parcialmente certificado. No convertir SKIP en PASS.

### Paso 5 — Gate y ledger

Ejecutar el gate en un runner con tiempo (`corepack pnpm gate`), adjuntar evidencia reproducible y
actualizar solo los bloques con evidencia de su pasada. Recordar: `0/48` DONE hoy.

---

## 6. Tests obligatorios

| Conjunto | Archivos | Esperado |
|---|---|---|
| Kernel/autorización/leases | `tests/trans01-*.test.ts` (29 suites) | 142 tests, 139 PASS, 3 SKIP, 0 FAIL |
| Truth ranking | `tests/trans01-truth-integrity.test.ts` | PASS |
| Envelope humano | `tests/trans01-human-turn-envelope.test.ts` | PASS |
| Perfiles LLM / wiring | `tests/trans01-llm-profiles.test.ts`, `tests/trans01-meta-muse.test.ts`, `tests/trans01-openrouter-app-wiring.test.ts` | PASS con dobles |
| Regresiones compartidas | `tests/kernel*.test.ts` | PASS |

---

## 7. Criterios de DONE

- [ ] Cada invariante (deny-by-default, fail-closed, idempotencia, un efecto) tiene test que lo ejerce.
- [ ] Todo símbolo del kernel tiene consumidor identificado o justificación escrita.
- [ ] Evidencia con hash no vacío y `testedCommit` real.
- [ ] Typecheck y gate verdes en el SHA declarado.
- [ ] Los SKIP de concurrencia documentados; ejecutados si hay PostgreSQL 17.
- [ ] Ledger actualizado con evidencia de la pasada correspondiente.

---

## 8. Riesgos específicos

| Riesgo | Señal | Mitigación |
|---|---|---|
| Kernel "integrado" solo por tests | ningún import externo | buscar consumidores antes de afirmar |
| Replay duplica efectos | receipt ausente o repetido | prueba de idempotencia con dos ejecuciones |
| Lease sin fencing | dos workers aceptan la misma operación | test con dos conexiones PostgreSQL |
| Evidencia cosmética | hash vacío, ruta `/tmp` | validar tamaño y versionar log |
| Autorización eludida por canal | WhatsApp/Google ejecutan directo | revisar entrada de canal (Trans03) |

---

## 9. Handoff

Al cerrar el turno, entregar a Trans00 y Trans02: SHA evaluado, suites ejecutadas, SKIP con motivo,
consumidores encontrados, evidencia corregida y **qué contrato del kernel no debe romperse**.
Trans02 depende del envelope y del bus; Trans04 depende de los eventos del kernel.
