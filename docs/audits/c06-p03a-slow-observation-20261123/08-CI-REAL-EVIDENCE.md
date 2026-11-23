# Evidencia CI real, posterior al primer dictamen

Commit de código auditado: `4f426ca79b6b865e064103b02ca3c28c3e321bec`.

**GitHub Actions ejecutó la suite original:** https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45187387576

- Instalación pnpm: PASS.
- `pnpm typecheck`: PASS.
- Voz V2: 14 PASS / 0 FAIL.
- Conectores externos C06: 3 PASS / 0 FAIL.
- CopilotKit V2: 1 PASS / 0 FAIL.
- **SlowObservationBridge: 2 PASS / 0 FAIL.**
- **HTTP Cognition V2: 0 PASS / 1 FAIL.** Error exacto en SSE: `RUN_ERROR: Cannot read properties of undefined (reading 'chat')`, seguido de aserción fallida en `tests/cognition-v2-http.test.ts:62`. El endpoint HTTP devolvió 200, pero el stream falló. **La respuesta HTTP 200 no implica éxito de conversación.**

**Diagnóstico estático plausible (no demostrado):** `apps/server/src/agent.ts` construye un `AgentsFactory` async y consulta `service.cognitionV2?.enabledForRequest()` mediante contexto de tenant; `CognitionV2ChatAgent.run` llama `this.cognition.chat`. La excepción sugiere que el objeto de cognition usado al ejecutar el agente no estaba disponible; confirmar con instrumentación y test de factory/routing, no suprimir la aserción.

Ejecución independiente iniciada desde la rama de auditoría: https://github.com/uniscrolliabrain-cloud/agente/actions/runs/45188822885 . Consultar resultado final antes de certificar. Las pruebas de carrera, revocación y Postgres específico del puente **siguen sin estar implementadas**; los dos tests actuales solo cubren dobles.

**Estado revisado:** P03a typecheck y tests existentes PASS; integración HTTP global FAIL; P03b NO-GO hasta pruebas de seguridad y regresión.
