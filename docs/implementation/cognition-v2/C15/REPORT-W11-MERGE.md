# W11 — Integración en `main`

Autorizado explícitamente por el fundador en esta campaña («pushear y mergeas todo a main»). Rama `feat/cognition-v2-worker-reliability-504c0b5b`, derivada de `685ef3a`, fast-forward sobre `main` (`54b8d54`): `main` era ancestro, sin conflictos ni merge alternativo.

Gate previo al merge sobre `cb39d18` (`tsx scripts/gate-report.ts`): **GATE OK 10/10**, 123.9 s reales. `typecheck` y `typecheck:worker` OK; `test` 865 ejecutadas / 838 PASS / 0 FAIL / 0 canceladas / 22 omitidas / 5 TODO; audits layers 0 violaciones, bridges 16/16, console 25 ocurrencias en 286 ficheros (informativo), anchors, contracts, idempotency (183 duplicadas, 0 huérfanas), tenant-default (158 permitidas, 0 prohibidas).

Las 22 omitidas del gate son pruebas que requieren `COGNITION_TEST_POSTGRES_URL`, que el gate no define. Se ejecutaron aparte contra PostgreSQL 17.9 sintético loopback: suite `tests/cognition-v2-*.test.ts` **72/72 PASS, 0 omitidas**, y `tests/cognition-v2-business-write.test.ts` **3/3 PASS** incluyendo concurrencia entre dos conexiones. Los casos nativos restantes siguen omitidos fuera de ese entorno.

Este merge **no es un GO de C15**. Se integra código con gates locales verdes y bloqueos explícitos: no hay proveedores reales, aceptación empresarial, RLS compartida certificada, canary, retiro del legacy ni supervisión de plataforma. Los adaptadores empresariales siguen desconectados de HTTP/chat, `tools` V2 sigue vacío y `CAMPAIGN-STATUS.md` conserva C15 en NO_GO. No se desplegó nada ni se modificaron datos productivos. El PostgreSQL sintético y sus datos bajo `artifacts/` no forman parte del repositorio.

## Corrección posterior (W12)

El adaptador experimental `CognitionBusinessWrite` y `tests/cognition-v2-business-write.test.ts` citados arriba se retiraron en `feat/cognition-v2-stepwise-001-504c0b5b`: solo probaban un approval stub incompatible con `ActionService`. Por tanto, los 3 tests de ese adaptador no son evidencia de integración y no deben contarse como gate de negocio. A03 vuelve a `NOT_RUN`; Google V1 queda intacto. La suite V2 de 72 tests y el gate del repo registrados arriba sí son evidencia del SHA fusionado `2b117b6` y no cambian por esta corrección no fusionada.
