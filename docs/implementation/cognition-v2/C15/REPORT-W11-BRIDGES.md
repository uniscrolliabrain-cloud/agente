# W11 — Auditoría de bridges y contrato de integración

Base del patchset: `19e52e9`. `importsAndCalls` resuelve identidad del símbolo con TypeScript, rechaza llamadas con variable sombreada, bloques con condición literalmente falsa y código después de return/throw, y para los cuatro bridges requiere la llamada dentro de `registerKernelListeners`. No es un análisis completo de alcanzabilidad ni prueba de ejecución. Doce checks legacy siguen basados en marcas; `16/16` no certifica todos los bridges.

Comando focal: `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 tests/audit-bridge-wiring.test.ts tests/audit-bridge-integration.test.ts`: 2/2 PASS. La integración crea la app y registra listeners reales, emite `policy.denied` con scope sintético, verifica persistencia de auditoría/notificación, turno de kernel cerrado tras quiescencia y aumento de métrica. No prueba todos los 16 bridges ni operación de producción. `AUDIT_REPORT_DIR=artifacts/audit-review node --import tsx scripts/audits/bridges.ts`: 16/16; `tsc --noEmit`: PASS.

Hallazgo observado durante la prueba: `StoreTurnStore.append` guarda índices `{id,turnId,thoughtId,tenantId}` bajo `cognitive-turns`; `StoreTurnStore.listTurns` y `listOpenTurnsForThread` intentan parsear todos esos registros como turnos. Con el store persistente real, listar tras añadir un thought produjo ZodError por owner/startedAt/status ausentes. La integración consulta directamente el turno real para comprobar su cierre sin modificar el comportamiento del producto. Requiere fix y regresión separados, preservando índices históricos y paginación; no se declara resuelto.

Sin merge ni despliegue. C15 sigue NO_GO.
