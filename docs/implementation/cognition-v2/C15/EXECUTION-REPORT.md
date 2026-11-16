# Ejecución C15 — informe de pruebas y límites

Primera tanda completa: `13caec2f0ec47b859b9613965a9967c8ae64d418`. Segunda tanda core iniciada en `24b4e8d`; patchsets web/migración posteriores se verifican por separado y no se atribuyen al snapshot inicial del gate.
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

Segunda tanda completa iniciada sobre `24b4e8d`: 818 tests, 801 PASS, 0 FAIL, 0 cancelados, 12 skipped y 5 TODO. Duración: 709.1 s de gate, 678.2 s de tests. Ocho de diez controles verdes; únicamente bridges 12/16 y los seis contratos huérfanos heredados fallan. C15 ejecutado después: exit 1, NOT_CERTIFIED/NO_GO como corresponde. Los cambios posteriores de frontend, corpus de migración y endurecimiento del harness tienen evidencia focal separada; no se atribuyen al SHA inicial del gate. Los intentos interrumpidos anteriores no se presentan como gates completos.

El gate de C15 lee un gate completo real y siempre conserva NO_GO mientras existan los bloqueos explícitos. No modifica ni relaja el gate de repositorio. RLS compartido con rol restringido, proveedores reales, costes/SLO, canary, migración/retiro completo y aprobación del fundador no se convierten en PASS por documentación.

## Métricas

`evidence/FIXTURE-LATENCY.json` contiene 10 muestras locales y p50/p95/p99 observados. No incluye red/proveedor ni costes reales; no se extrapola a producción. La medición no fija un SLA numérico.

## Revisión

[Revisión independiente y repros](SECURITY-REVIEW.md). Los cinco últimos P1 quedaron corregidos/reverificados. La revisión local no certifica todas las superficies o dependencias externas.

## Avance RLS — 16 de noviembre

Migración transaccional explícita para las 16 tablas cognitivas: ENABLE/FORCE ROW LEVEL SECURITY, USING y WITH CHECK con app.tenant_id. Prueba real con rol NOSUPERUSER/NOBYPASSRLS: 1/1 PASS. Sin scope no lee; con scope A no lee/borra B aunque conozca el ID; inserción falsificada falla; SET LOCAL no sobrevive a la transacción. El runtime compartido sigue bloqueado: falta integrar y verificar el contexto de conexión a lo largo de HTTP, identidad global y workers. No equivale a certificación compartida ni se activó sobre datos reales.

## C12 — Timeline incremental

El frontend ahora continúa desde el cursor durable, limita a cuatro páginas por ráfaga y 50 eventos en memoria (ocho visibles), deduplica por eventId y consulta sin esperar a un nuevo mensaje. Se pausa en pestaña oculta/offline, retoma al volver y elimina estados ante 401/403/404. No inventa estados por tiempo. `node scripts/check-cognition-timeline.mjs`: PASS en Chromium local (paginación 100→101, completion en idle, duplicado de replay, fallo 503/recuperación, denegación y parada); typecheck web exit 0. El primer intento del harness omitía abrir details y agotó timeout; corregida la interacción del harness, no la aserción de producto. Este patchset web posterior se verifica por separado de la tanda general core congelada en 24b4e8d.

## C01 — Corpus de adaptación V1

`tests/cognition-v2-migration.test.ts`: 2/2 PASS, cubriendo ocho combinaciones status/scope, determinismo, aislamiento y datos manipulados. Se corrige la promoción de epistemicidad (legacy sin receipt queda unknown) y se valida actor=owner. IDs V1 de 200 caracteres ya no desbordan V2 al añadir prefijo: clave hash determinista scoped por tenant. El adapter no ejecutó backfill real, no migra ledger de entregas ni resuelve revisiones de todas las referencias legacy. EntityRefs/memoryIds y metadatos cromáticos no se consideran migrados; se requiere inventario/backfill con resolución autorizada antes del cutover. Este patchset posterior tiene evidencia focal propia, no se atribuye a la tanda core iniciada anteriormente.

Build web tras la timeline incremental: exit 0, 9.99 s; assets generados en apps/web/dist. Sin publicar.

Event Bus: el harness de emisión se reforzó para exigir `persisted=true` por cada tipo, payload vacío válido para eventos opcionales y total almacenado igual al catálogo. Antes solo exigía al menos una fila y podía ocultar ZodErrors. Prueba focal real con `--test-isolation=none`: 3/3 PASS; contratos+migración+bus previos: 7/7 PASS. No se relajaron schemas ni assertions.

## Verificación consolidada posterior

Código `55eb692`: `pnpm test:cognition-v2` con Postgres sintético: **30 tests / 30 PASS / 0 FAIL / 0 skip / 0 cancelados**, 52.558 s. Incluye corpus nuevo y RLS; typecheck raíz actual exit 0. Frontend separado: typecheck/build y Chromium de timeline exit 0. No se extrapolan estos resultados a costes/proveedores, RLS integrado compartido o certificación C15.

## W3 — Diseño aprobado y código integrado

El fundador aprobó la propuesta de ontologías del commit 83ae5a0. C05 ya no está BLOCKED_DECISION: véanse decisión e informe C05. Gate completo 11b3ebd: 827 tests / 810 PASS / 0 FAIL / 0 cancelados / 12 skip / 5 TODO; 8/10 pasos, únicamente los bridges/contratos heredados fallan. Suite V2: 37/37 PASS con Postgres. Evidencia JSON W3 conservada. C15 mantiene NO_GO por la integración/certificación restantes, sin atribuir la falta de aprobación a la ontología.
