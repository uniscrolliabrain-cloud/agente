# W11 — Adaptador de escritura experimental retirado

El prototipo `CognitionBusinessWrite` de `cb39d18` se retiró en `feat/cognition-v2-stepwise-001-504c0b5b`; no forma parte del código actual de esta rama. Su prueba usaba aprobaciones sintéticas con `hash` y `consumedBy` que `ActionService` no emite. Además, el adaptador simulaba un registro `executing` para satisfacer `CapabilityRunner`, sin usar el claim, el flujo de decisión ni la ejecución reales de `ActionService`. Sus tests pasaban sobre ese stub, no probaban la integración de Google ni justificaban marcar A03 como migrada.

La integración Google V1 y su aprobación humana en `ActionService` permanecen intactas. A03 queda `NOT_RUN` hasta migrar una operación de verdad: el modelo podrá proponer contenido; el kernel deberá validar y registrar la propuesta; la aprobación humana existente conservará su hash y vínculo a conexión; y solo el `ActionService` podrá reclamar y ejecutar el efecto mediante el adapter actual, produciendo un recibo correlacionado. No añadir una segunda puerta ni exponer `send_email` como tool del modelo.

Verificación de esta corrección: `node --import tsx scripts/audits/bridges.ts` → 16/16; `tsc --noEmit` → PASS; `git diff --check` → PASS. No se cambió el flujo de Google ni se ejecutaron APIs externas.
