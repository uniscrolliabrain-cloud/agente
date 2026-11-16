# Ejecución C15 — informe de pruebas y límites

Código congelado para la última tanda: `13caec2f0ec47b859b9613965a9967c8ae64d418`.
Decisión integral: **NOT_CERTIFIED / NO_GO**. [Matriz A01–A30](ACCEPTANCE-MATRIX.md).

## Evidencia ya ejecutada

- Contratos, transacciones, 501-event replay, crash recovery, fencing, persistencia/revocación y ACK: focos locales con exit 0.
- `tests/cognition-v2-http.test.ts`: exit 0; autenticación real, dos tenants, body spoof 422, lecturas cruzadas 404, job 202, captura Thought real, journey y revocación; pérdida de membership 403.
- Runtime, cinco memorias/atención, Slow independiente y RAG real: focos de integración con exit 0. RAG fuera del hot path, revisión/generación y revocación comprobadas.
- Postgres 17 local: exit 0; conexión fijada, rollback concurrente, orden de 20 commits concurrentes, cursor excluyente y captura kernel idempotente concurrente.
- Fault injection final: late revoke, provider abort, job agotado con evento terminal, circuitos independientes, publicación posterior a commit y commit ACK desconocido: exit 0.
- Voz interna: 4/4 pass; restart real de PGlite, consentimiento/TTL/epoch. No hay llamada Anam ni media real acreditada.
- Cyber padre: 5/5 pass; SDK alpha.2 real con transporte sintético, contratos, minimización, rollback y ACK después de commit. Nuevo foco Cyber→bus→contexto: 1/1 pass, conserva partial/not_reported/securityGuarantee=false.
- Hijo: SDK 7 pass/1 skip; el contrato live se ejecutó por separado mediante Python. Contrato real Python↔SDK + outbox/budget: **9 pass, 0 skip**, exit 0, loopback sintético.
- Typecheck raíz y worker: exit 0 en la tanda actual. Web typecheck: exit 0. Build web correcto en apps/web: exit 0 (31.62 s); el primer intento desde la raíz falló por cwd/index.html y se corrigió el comando, no el producto.
- `verify:slice`: exit 0; fixtures locales, sin proveedor real.
- Chromium 156 local sobre el build/tenant demo sintético: SVG 16 círculos, aria-hidden, reduced-motion sin animación, desaparece al llegar contenido, Enter y layout de 390 px sin overflow. No es auditoría WCAG integral. Artefactos UI bajo `artifacts/cognition-v2/ui/`.
- Browser worker canónico: exit 1 por DNS_UNAVAILABLE hacia httpbin; igual en main congelado. No se cambió su assertion ni se acreditó su navegación externa.

## Tanda general de cierre

Gate completo sobre `13caec2`: 817 tests, 799 PASS, 1 FAIL, 0 cancelados, 12 skipped, 5 TODO; 651.942 s para el gate. Typecheck raíz/worker y cinco auditorías pasan. El FAIL nuevo corresponde a la fixture exhaustiva del Event Bus: no incluía los tres payloads V2. Se corrigió en `019ca7d` y la prueba focal pasa (1/1). Se conserva el gate fallido como evidencia, sin reinterpretarlo como verde.

Los otros dos controles fallidos coinciden con main congelado: bridges 12/16 y seis contratos huérfanos (ActionSpec, CognitionCardScope, CognitionCardStatus, ColumnSpec, DataSourceSpec, ViewProvenance). No se añadieron marcas ficticias ni excepciones para ocultarlos.

Nueva tanda completa iniciada sobre `24b4e8d`, que incluye la corrección y la migración RLS explícita. Resultado pendiente. Los intentos interrumpidos anteriores no se presentan como gates completos.

El gate de C15 lee un gate completo real y siempre conserva NO_GO mientras existan los bloqueos explícitos. No modifica ni relaja el gate de repositorio. RLS compartido con rol restringido, proveedores reales, costes/SLO, canary, migración/retiro completo y aprobación del fundador no se convierten en PASS por documentación.

## Métricas

`evidence/FIXTURE-LATENCY.json` contiene 10 muestras locales y p50/p95/p99 observados. No incluye red/proveedor ni costes reales; no se extrapola a producción. La medición no fija un SLA numérico.

## Revisión

[Revisión independiente y repros](SECURITY-REVIEW.md). Los cinco últimos P1 quedaron corregidos/reverificados. La revisión local no certifica todas las superficies o dependencias externas.

## Avance RLS — 16 de noviembre

Migración transaccional explícita para las 16 tablas cognitivas: ENABLE/FORCE ROW LEVEL SECURITY, USING y WITH CHECK con app.tenant_id. Prueba real con rol NOSUPERUSER/NOBYPASSRLS: 1/1 PASS. Sin scope no lee; con scope A no lee/borra B aunque conozca el ID; inserción falsificada falla; SET LOCAL no sobrevive a la transacción. El runtime compartido sigue bloqueado: falta integrar y verificar el contexto de conexión a lo largo de HTTP, identidad global y workers. No equivale a certificación compartida ni se activó sobre datos reales.
