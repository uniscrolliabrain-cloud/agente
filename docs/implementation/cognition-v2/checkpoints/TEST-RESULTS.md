# Verificación reproducible

Checkpoint UTC: 2026-11-16T13:47:34.208372+00:00. Código auditado: [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3). Base: [54b8d5407a8576459448c4d059a877297d18ca7a](https://github.com/uniscrolliabrain-cloud/agente/commit/54b8d5407a8576459448c4d059a877297d18ca7a). Evidencia local sintética; no certificación de producción.

Node v24.22.1; pnpm 11.25.0 (packageManager del repo 11.19.0). Configuración WORKSPACE_MODE=sample y Postgres 17 local sintético para pruebas nativas. Se publican resultados depurados, nunca variables con valores sensibles ni logs brutos.

| Comando exacto | Estado / salida | Duración s | Total / pass / fail / omitidos / todo / cancelados | Causa / alcance |
|---|---|---:|---|---|
| `pnpm typecheck` | PASS / 0 | 26.837 | — / — / — / — / — / — | TypeScript raíz y worker; sin contador de tests. |
| `pnpm secrets:check` | PASS / 0 | 1.198 | — / — / — / — / — / — | Modo sample: verifica contrato de presencia de configuración; no escanea todos los secretos del código. |
| `pnpm audit:contracts` | FAIL / 1 | 22.652 | — / — / — / — / — / — | 6 contratos exportados sin consumidores detectados: ActionSpec, ColumnSpec, DataSourceSpec, ViewProvenance, CognitionCardScope, CognitionCardStatus. Ya observados en baseline. |
| `pnpm audit:idempotency` | PASS / 0 | 3.337 | — / — / — / — / — / — | Auditoría estática aprobada; no demuestra por sí sola exactamente una vez distribuido. |
| `pnpm audit:bridges` | FAIL / 1 | 2.4 | — / — / — / — / — / — | 12/16 bridges reconocidos; detectores esperan marcadores legacy. No se añadieron comentarios para falsear el resultado. Mismo fallo de baseline. |
| `pnpm test:browser` | FAIL / 1 | 5.292 | 1 / 0 / 1 / 0 / 0 / 0 | BROWSER_UNAVAILABLE: Chromium no inicia en este entorno. La prueba esperaba NAVIGATION_FAILED. Se conserva la aserción. |
| `pnpm test:coverage` | FAIL / 1 | 4.533 | — / — / — / — / — / — | c8: not found. No se ejecutaron casos ni se midió cobertura; c8 no está instalado/declarado en este checkout. |
| `pnpm verify:slice` | PASS / 0 | 74.477 | 7 / 7 / 0 / 0 / 0 / 0 | 7 casos más smoke autenticado local sintético. |
| `pnpm test` | PASS / 0 | 663.972 | 835 / 818 / 0 / 12 / 5 / 0 | Suite completa sobre código congelado; Postgres sintético loopback para casos nativos. |
| `pnpm gate` | FAIL / 1 | 677.818 | 835 / 818 / 0 / 12 / 5 / 0 | Orquestador completo; consultar resultado estructurado y contadores. |
| `pnpm release:verify` | BLOCKED_NOT_EXECUTED / None | None | — / — / — / — / — / — | BLOQUEADO / NO EJECUTADO: requiere destino de release autorizado en ejecución. No se contactó producción ni se desplegó. |

Evidencia estructurada: [COMMAND-RESULTS.json](COMMAND-RESULTS.json). Un guion no produce contadores TAP: «—» no equivale a cero casos aprobados.

## Evidencia adicional con alcance distinto

| Prueba | Ref | Resultado exacto | Duración |
|---|---|---|---:|
| Suite focal V2 con Postgres nativo | W6 `1f63fa9929a48c16f02344a0b1efa52216f2e91a` | 52 total, 52 pass, 0 fail, 0 skip | 113.837 s |
| SDK hijo `npm --prefix typescript test` | hijo `0a809a18f31aeaba03277d2399549bd1603cd68c` | 8 total, 7 pass, 0 fail, 1 skip | TAP suite 198.680 ms; tiempo wall no instrumentado |
| `CI=1 python -m unittest tests.contracts.test_python_ts tests.integration.test_budget_concurrency` | hijo mismo SHA | 9/9 PASS | 3.196 s |
| Wire JEV sintético validado con OpenAPI oficial / jsonschema | W6 | request y response válidos; 0 inferencias reales | no instrumentada |
| Reproducción ledger `node --import tsx scripts/repro-cognition-delivery-reuse.ts` | principal SHA auditado | exit 1 esperado: 3 runs completados / 1 delivery ACK, esperado 3 | no instrumentada |
| Reproducción eventos privados `node --import tsx docs/implementation/cognition-v2/checkpoints/REPRO-FAST-EVENTS.ts` | principal SHA auditado; helper publicado con informe | exit 1 esperado: 3 eventos REASONING_MESSAGE_CONTENT reenviados; esperado 0 | no instrumentada |

Las reproducciones son fixtures sintéticas sin proveedor ni red: el primer fallo evidencia pérdida de correlación por ejecución; el segundo una frontera de presentación demasiado permisiva. No son parte de `pnpm test` en este checkpoint y explican por qué una suite verde no certifica el programa.

Gate actual: **8/10 checks aprobados**, 677.818 s; fallan `audit:contracts` y `audit:bridges`. Suite interna: 835 total, 818 aprobados, 0 fallidos, 12 omitidos, 5 todo, 0 cancelados. [Resultado estructurado](GATE-RESULT.json).

## Comparación histórica (no ejecución actual)

Baseline main: 790 total, 772 pass, 0 fail, 1 cancelado, 12 omitidos, 5 todo; cancelación LAIA focal rerun PASS. Gate W4: 832 total / 815 pass / 0 fail / 12 omitidos / 5 todo, 8/10 checks, 826.5 s; contratos/bridges fallaban también allí. La comprobación UI previa con Chromium real y build web corresponde a evidencia histórica en C15, no a la prueba browser actual. No se declara cobertura porcentual ni latencia/coste de proveedores reales.

