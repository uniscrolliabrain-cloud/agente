# Prioridad activa — AGENTE primero, Ciberseguridad después

**Decisión del fundador, 2026-11-15.** Este documento prevalece sobre la secuencia de trabajo sugerida por los anexos 31–33. Los 13 repositorios restantes **no están en alcance operativo**. Los Concept Masters sirven solo para mantener extensibilidad futura. El propietario termina por separado frontend, proveedores, cuentas y cierre del repo Ciberseguridad. Esta rama **solo audita y diseña el padre**; no modifica ni gobierna el desarrollo de Ciberseguridad.

## Objetivo verificable
Convertir `uniscrolliabrain-cloud/agente` en el sistema empresarial agéntico real: LAIA conversa con mínima latencia por chat/Anam; Fast API es interfaz, Slow API razona dentro del runtime; el kernel resuelve identidad y autoridad, el runtime ejecuta y verifica; el primer dominio conectado es Ciberseguridad, con evidencias, aprobación y estados trazables. Mantener opción de agregar dominios futuros sin implementarlos ahora.

## Orden de ejecución de investigación y reparación en AGENTE

### A0. Congelar verdad del código y medir baseline
- Auditar `apps/server/src/engine/conversation.ts`, `routes/copilotkit*`, middleware de autenticación, resolución de tenant, tool calls, streaming, fallback de modelos, sesiones y memoria; registrar rutas y secuencia real por turno.
- Instrumentar o especificar trazas: `request_received → auth → context_ready → llm_request → first_token → first_audio`, hot/cold, p50/p95, con traceId y sin PII. Las cifras 8–12/15–25 roundtrips del informe de latencia anterior son **estimaciones de SHA antiguo**.
- Inventariar API/model providers actuales, cachés, colas y persistencia antes de decidir patchsets. Tests y métricas de baseline, sin cambiar legacy.

### A1. Autoridad y kernel antes de efectos reales
- Reconstruir call graph de `PolicyEngine.can`, políticas ABAC, `Actor`, `ExecutionContext`, aprobación, mandatarios y multi-tenant. Revisar allow con `role.permissions` vacío y compatibilidad entre roles `admin/user/agent/system` y `owner/manager/employee/hr/compliance/agent`.
- Asegurar invariantes: deny-by-default para efectos, tenant/actor obligatorios, revocación, autorización por recurso/argumentos, no permitir ejecución desde texto LLM.
- Examinar semántica de `Executor.execute`: un paso obligatorio omitido no debe convertir un trabajo empresarial en éxito; definir partial/blocked/outcome_unknown y recibos.
- Revisar `EventBus.emit`: devuelve `persisted:false` en error; cada caller crítico debe decidir fail-closed. No confundir dedupe de eventos con idempotencia de acciones.

### A2. Dos motores API con fronteras reales
- **Fast API engine:** sesión y tarjeta de agente precargada, historial corto, streaming, conversación natural, respuesta y presentación; sin acceso directo a efectos ni dependencias síncronas de RAG profundo, embeddings, planificación o Slow.
- **Slow API engine:** análisis estructurado, planificación, propuestas de SOP, verificaciones y síntesis cuando runtime lo solicita; presupuestos y timeouts propios, schemas, guardrails y reintentos. No bloquear el primer token/audio conversacional.
- Contratos versionados para `AgentCard`, `IntentEnvelope`, `TaskAck`, `ReasoningRequest/Result`, `ProgressEvent` y `PresenterCard` con scopes y correlación. Los nombres son provisionales hasta cotejar léxico vigente.
- Mantener `ConversationAgent` como legacy con strangler y feature flag, rollback y pruebas de paridad; no borrarlo anticipadamente.

### A3. Harness único Chat + Anam
- `SessionGateway` y adaptadores de canal para texto/voz; Anam como interfaz audiovisual intercambiable, no dueño de identidad/memoria/decisiones.
- Barge-in corta streaming/audio, no cancela tasks ya aceptadas. Conversación y tareas tienen estados separados.
- Respetar documento `03-harness-conversacional/UX-ANIMACIONES-Y-FASES-V2.md`: cinco frases **pedagógicas opcionales**, animación SVG clara y compacta, sin retrasar respuesta; estados operativos solo por eventos verificados.

### A4. Primer dominio real: Ciberseguridad
- Reutilizar su middleware Python/FastAPI y SDK TS server-only; el padre no reimplementa escáneres ni herramientas del dominio.
- Conectar capability bundle **autorizado por tenant**, versionado y tipado; identidad/mandato; adaptador de errores; evidence/receipts; progreso y UI. Diseñar contrato y probar contra stub primero, integración real después.
- Escenarios: consultar postura sin efectos, solicitar auditoría autorizada, aprobar una acción sensible, recibir resultado verificable, cancelar/revocar, fallo parcial, retry, aislamiento entre dos empresas, caída del dominio, reconciliación.
- No declarar producción ni conexiones a proveedores que el fundador aún está terminando.

### A5. Dogfood y gates
- Sin LLM: humano → kernel → SOP → Ciberseguridad → evento/evidencia → UI.
- Con Slow: tarea compleja planificada y validada sin saltarse kernel.
- Con Fast: LAIA recibe, conversa y comunica estado real; chat/Anam conservan sesión y memoria autorizada.
- Gates: typecheck, tests de contrato, tests de aislamiento, E2E con fallos, traces p50/p95, rollback, aprobación humana para despliegue.

## Lecturas recuperadas de la auditoría original
- `03-harness-conversacional/REDISENO-V2-FAST-CHAT-VOICE.md`: M0–M7, FastConversationV2, IntentBridge, AgentCard, ProgressProjector, migración strangler, latencia y tests.
- `03-harness-conversacional/UX-ANIMACIONES-Y-FASES-V2.md`: separación entre indicador narrativo y progreso confirmado; 5 frases opcionales y timings experimentales.
- `docs/08-auditorias/latencia-anam-2026-11-11.md`: auditoría histórica de preprocesamiento, **no baseline actual**.
- Anexos 31–33: vocabulario y arquitectura futura, **referencia secundaria, no prioridad actual**.

## Entregables siguientes en esta misma auditoría
1. **A0: call graph real del chat** con rutas, I/O, puntos de espera y baseline medible.
2. **A1: kernel/policy/executor/eventos** con tablas de entradas, invariantes, defectos y pruebas.
3. **A2: Fast/Slow** con contratos y patchsets por archivo, flags, rollback y criterios de latencia.
4. **A4: bridge de Ciberseguridad** con contrato TS↔Python, semántica de errores, evidencia, idempotencia y UI.
5. **A5: plan de certificación transversal** para el primer dominio; solo después se considera un segundo.

## No hacer ahora
- No abrir auditorías de los otros 13 hijos ni nuevos Concept Masters.
- No inventar un tercer motor conversacional que duplique kernel.
- No sustituir código existente sin call graph y tests de regresión.
- No ejecutar despliegues, merge a main ni cambios de proveedores sin aprobación.

**Estado de este documento:** reencuadre de alcance y recuperación de decisiones; los entregables A0–A5 aún requieren auditoría de código y especificación detallada. Ningún código ha sido modificado.
