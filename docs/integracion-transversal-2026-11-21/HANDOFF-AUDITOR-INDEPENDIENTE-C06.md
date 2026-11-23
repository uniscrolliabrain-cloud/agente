# HANDOFF — Auditor independiente y tester de convergencia Cognition V2 (2026-11-23)

## Rol y mandato

Eres el **auditor y tester independiente**, no el implementador principal. Tu misión es contrastar el código vivo de `uniscrolliabrain-cloud/agente` en `feat/continuacion-c05-voz-cognition-v2` contra `main`, ejecutar pruebas reproducibles, localizar fallos y entregar evidencias y propuestas de corrección. **No hacer merge, deploy, push a main, eliminar legacy ni cambiar secrets.** No dar por hecho que la documentación refleja el código actual.

La visión del producto: runtime empresarial determinista con kernel como autoridad, bus append-only y grafo; slow LLM asíncrono que observa evidencias reales y propone tarjetas contextualizadas; LAIA/fast LLM conversa naturalmente y con latencia mínima mediante tarjetas autorizadas, sin bloquearse por slow. JEV.AI, Anam y ElevenLabs quedan en **stub no operacional** hasta la activación final y pruebas reales de frontend.

## Rama y commits a verificar

Rama: `feat/continuacion-c05-voz-cognition-v2`. Código reciente:
- `apps/server/src/engine/cognition/v2/external-connectors.ts`
- `apps/server/src/engine/cognition/v2/chat-agent.ts`
- `apps/server/src/agent.ts` (selección V2 para tenants habilitados)
- `apps/server/src/engine/voice-v2/media-lifecycle.ts`
- `apps/server/src/voice-session-routes.ts`
- `tests/cognition-v2-external-connectors.test.ts`
- `tests/cognition-v2-chat-agent.test.ts`
- `tests/cognition-v2-http.test.ts`
- `.github/workflows/c05-voice.yml`

Documentos de referencia: `docs/integracion-transversal-2026-11-21/evidence/C05-RECONCILIACION-INICIAL.md` y `C06-CONVERGENCIA-BACKEND-COGNITION-KERNEL.md`.

## Orden de ejecución

### A. Reproducibilidad y baseline

1. Obtener commit SHA exacto de HEAD y `main`; revisar `git status`; no sobrescribir trabajo de otros.
2. Inspeccionar scripts de `package.json`, lockfile, requisitos Node/pnpm y workflows. Instalar con lockfile congelado si el entorno lo permite.
3. Ejecutar typecheck, tests unitarios C05/C06, HTTP Cognition V2, gates de cognition, tests del kernel, bus, tenant y conversación que existan. Reportar **comandos, exit codes, duración, logs, rutas y commits**. Nunca marcar verde sin ejecutarlo.
4. Consultar GitHub Actions de la rama, incluyendo el workflow `c05-voice.yml`; adjuntar URLs y errores.

### B. Corte conversacional V2 (PRIORIDAD MÁXIMA)

5. Inspeccionar `apps/server/src/agent.ts`, `app.ts`, `engine/cognition/v2/chat-agent.ts`, `runtime.ts`, `engine/conversation.ts`, `conversation-turn.ts`, `conversation-history.ts`. Comprobar **con tests de integración HTTP reales** que `/api/copilotkit/agent/default/run` selecciona V2 para un tenant habilitado, conserva legacy para tenant no habilitado y respeta `agentBackend=agui` sin fuga de identidad.
6. Verificar que `CognitionV2ChatAgent extends AbstractAgent` satisface exactamente el contrato de `@ag-ui/client` y `CopilotRuntime`; comprobar que la factory de agentes conserva el AsyncLocalStorage de tenant durante streaming y que no hay fallback silencioso a V1. Inspeccionar el tipo y el lifecycle `run`/unsubscribe.
7. Verificar persistencia de turnos, idempotencia, cancelación, roles activos, expiración/revocación de snapshots, eventos AG-UI, orden de RUN_STARTED/TEXT/RUN_FINISHED, errores seguros, multiusuario y multiempresa. Probar sin proveedor externo usando dobles controlados. Detectar si la rama V2 devuelve 503 incorrectamente por `agentConfigured`, o si la ruta V1 se ejecuta pese a estar habilitada V2.
8. Verificar que no se filtran herramientas legacy, prompts privados, otras empresas ni claims falsos de acciones.

### C. Cognition / bus / grafo / kernel / slow

9. Construir un **mapa de productores y consumidores de eventos** del código vivo: `EventBus`, `DurableEventSink`, `CognitiveProjector`, `RuntimeOutcomeProjector`, `KernelReceiptProjector`, `GlobalAttentionWorkspace`, `SlowCognitionQueue`, `CardDeliveryLedger` y `DeliveryRecoveryWorker`.
10. Trazar si existe una ruta automática **evento de operación real → bus → proyección → evidencia → enqueue slow → job durable → inferencia → clasificación/ontología → kernel.captureAsyncResult → record.proposed → proyección → snapshot autorizado → tarjeta inyectada al fast → ACK**. Identificar con `archivo:línea` cada transición, y marcar las ausentes o manuales. No asumir que `slow.tick` implica que alguien haya encolado jobs.
11. Revisar fuente y veracidad de los datos: event IDs, revisión, causalidad, epistemic status, autorización por actor, contradicciones, TTL, retries, DLQ, fencing, replay, race conditions, ausencia de bloqueo fast por slow, memoria y graph.
12. Verificar `COGNITION_V2_TENANTS`, worker separado y `cognitionWorkerReady` bajo escenarios reales. Comprobar que el bridge slow→kernel no confiere permiso de ejecutar acciones. Revisar atomicidad entre captura de pensamiento, emisión de tarjeta y estado completado.
13. Localizar los canales fast/slow legacy aún **vivos** y enumerar sus rutas, workers, consumers y fallbacks; no borrar nada. Proponer cutover por tenant con gates, métricas y rollback.

### D. Stubs externos y seguridad

14. Confirmar que `jev`, `anam`, `elevenlabs` no hacen red, no requieren secretos, no afirman readiness y fallan cerrados. `assertConnectorGrant` es solo validación local, **no** un grant verificado contra kernel; comprobar que nadie lo usa como autoridad.
15. Revisar carreras de `VoiceMediaLifecycle.open/close/interrupt`, epoch fencing, consent, rol activo y tenant. En particular, dos opens concurrentes pueden provocar que el cleanup del antiguo cierre la sesión nueva; demostrar o descartar mediante test.

### E. Comparación transversal de ramas

16. Inventariar `main`, `campaign/c00..c04`, `feat/continuacion-c05-voz-cognition-v2`, `feat/cognition-v2-W4-backfill`, `W5-outcomes`, `W6-jev-contract`, `feat/voice-avatar-scaffold`, ramas de reliability y compliance que toquen backend. Usar `git merge-base`, `git log --left-right`, `git diff`, `git cherry` y comparación por equivalencia funcional, no solo conteo de commits.
17. Separar ramas UX demo de backend. Identificar commits realmente faltantes, duplicados, divergencias de schemas/migraciones, conflictos, archivos afectados y orden seguro de integración. **No ejecutar merges**.

## Entregables

Crear en la rama de auditoría propia `audit/cognition-v2-independent-20261123` (basada en HEAD actual de C05) una carpeta `docs/audits/cognition-v2-independent-20261123/` con:
- `00-EXECUTIVE-VERDICT.md`: PASS/FAIL/BLOCKED por objetivo, sin exageraciones.
- `01-TEST-MATRIX.md`: comandos, SHA, exit codes, logs, tiempos, entorno.
- `02-LIVE-ROUTING-MAP.md`: HTTP → AG-UI → V2/V1 por tenant.
- `03-EVENT-TO-CARD-TRACE.md`: transición por transición, con archivo:línea.
- `04-BRANCH-RECONCILIATION.md`: matriz de ramas, commits y riesgos.
- `05-SECURITY-CONCURRENCY.md`: tenant, policy, cancelación, epochs, races.
- `06-REMEDIATION-PATCHSETS.md`: correcciones propuestas con paths y tests.
- `07-RAW-LOGS.md`: logs relevantes (sin secrets), evidencia de CI y limitaciones.
- `README.md`: índice y resumen de reproducibilidad.

Puedes añadir **tests nuevos** en tu rama de auditoría, sin modificar producción. Si descubres un fallo crítico, escribe primero un test que falle (RED), deja la corrección propuesta en `06-REMEDIATION-PATCHSETS.md` y notifícalo. No maquilles tests ni uses mocks para afirmar conectividad real.

## Formato de reporte final

Incluye: SHA auditado, cantidad de pruebas pasadas/fallidas/bloqueadas, top 10 fallos ordenados por severidad, enlaces a commits y logs, diagrama de la ruta real, lista de conexiones faltantes, riesgos de integración y recomendación `GO / NO-GO` para continuar C06.P03. No declarar unificación ni listo para producción mientras no exista evidencia end-to-end.
