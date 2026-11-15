# Dos motores API Fast/Slow y migración del harness legacy
**Alcance:** `agente`; Ciberseguridad como primer dominio consumidor. **Estado:** diseño detallado, requiere call graph real antes de patchsets.

## 1. Problema de partida
El chat legacy combina demasiadas responsabilidades antes de contestar: contexto, memoria, RAG, consultas, kernel, cuotas, herramientas y proveedor. El informe de latencia de 2026-11-11 estimó múltiples viajes, pero **no es una medición actual**. Cambiar de modelo sin rediseñar la distribución cognitiva no soluciona el problema. La solución acordada es que el trabajo cognitivo se prepare desde kernel/grafo/bus y se distribuya en tarjetas, mientras el Fast recibe una vista preparada y conversa.

## 2. Topología objetivo
```text
                         [EVENT BUS + GRAPH + MEMORY]
                                    |
                        [ATTENTION + SLOW API]
                                    |
                             [PRESENTER]
                                    |
                          [RAC/RAG CARD STORE]
                                    |
                   +----------------+----------------+
                   |                                 |
         [WEB CHAT SESSION]                  [ANAM VOICE SESSION]
                   |                                 |
                   +-----------[FAST API]------------+
                                   |
                       structured user intent
                                   |
                     [KERNEL / POLICY / APPROVALS]
                                   |
                          [SOP / WORKERS / SDK]
                                   |
                          [CYBERSECURITY API]
                                   |
                            receipts/events
                                   |
                           back to EVENT BUS
```
**Importante:** Slow no es un paso obligado después de Fast. Puede estar trabajando antes, durante o después del turno, por iniciativa de eventos y tareas. Presenter no se limita a embellecer respuestas del Slow: compila estado del sistema en contexto consumible.

## 3. Taxonomía de responsabilidades
### Fast engine
Conversación, estilo, turn-taking, streaming, aclaraciones, continuidad inmediata, integración texto/voz. No tiene permisos de efectos externos, no crea hechos, no valida política por sí mismo. Puede expresar propuestas tipadas hacia el kernel. Configuración propia: `fastProvider`, `fastModel`, `fastTimeout`, `fastTokenBudget`, `fastStreaming`, `fastCircuitBreaker`.

### Slow engine
Planificación, análisis de conflictos, síntesis de estado complejo, enriquecimiento de tarjetas, propuesta de SOP, revisión cognitiva y verificación cuando se necesita razonamiento. Resultados estructurados con Zod, provenance, presupuesto y errores explícitos. Configuración independiente: `slowProvider`, `slowModel`, `slowTimeout`, `slowReasoningBudget`, `slowQueue`, `slowCircuitBreaker`. No puede ejecutar acciones directamente.

### Presenter
Interfaz semántica que adapta estado y resultados para Fast y UI: comprensibilidad, prioridad, incertidumbre, estado confirmado, referencias. Puede recibir productos del Slow y hechos deterministas. No crea permisos ni finge éxito.

### Kernel
Autoriza acciones; identidad, scopes, policy, mandates, approvals, auditoría y task lifecycle. No delega decisión de seguridad a ninguno de los dos LLM.

## 4. Contratos propuestos, NO existentes
```ts
interface ContextSnapshot {
  snapshotId: string; tenantId: string; actorId: string;
  agentId: string; sessionId: string; cardRefs: Array<{id:string;version:string}>;
  generatedAt: string; expiresAt: string; totalEstimatedTokens: number;
}
interface FastTurnRequest {
  tenantId: string; actorId: string; sessionId: string;
  channel: 'web'|'anam'; input: string; contextSnapshotId: string;
  correlationId: string;
}
interface SlowWorkRequest {
  tenantId: string; principalId: string; reason: 'task_plan'|'card_synthesis'|'review'|'verification';
  inputRefs: string[]; outputSchemaId: string; correlationId: string;
  deadlineAt: string;
}
interface IntentProposal {
  tenantId: string; actorId: string; sessionId: string; turnId: string;
  intentId: string; requestedCapabilityId?: string;
  userUtteranceRef: string; idempotencyKey: string; correlationId: string;
}
interface AcceptedTaskReceipt {
  taskId: string; tenantId: string; status: 'accepted'|'rejected'|'awaiting_approval';
  correlationId: string; recordedAt: string; evidenceRef?: string;
}
```
Los contratos se concretarán tras leer `packages/domain`, `engine/conversation`, `kernel`, `policy`, `events` y SDK Ciberseguridad. La voz no puede confiar en un tenantId proporcionado por el navegador.

## 5. Actualización en caliente de contexto
El Card Store publica nuevas versiones. La sesión Fast consume un snapshot coherente al inicio de cada generación; si llegan nuevas tarjetas durante el stream, no se modifica a mitad de token el prompt ya enviado al proveedor. La siguiente generación utiliza el nuevo snapshot. Una alerta crítica puede disparar notificación independiente, respetando permisos y sin cortar audio por defecto. Cambios de permisos invalidan snapshots y pueden obligar a interrumpir una sesión insegura.

## 6. Latencia: separar objetivos de mediciones
Medir `speech_end`, `transcript_ready`, `session_resolved`, `snapshot_ready`, `llm_request`, `first_token`, `tts_first_chunk`, `first_audio`, `avatar_playback`. El documento previo sugería objetivos orientativos de TTFB y audio; **no son SLAs ni resultados observados**. Comparar chat y voz, warm/cold, p50/p95/p99, coste, calidad de contexto y carga. Evitar optimizaciones que sacrifiquen seguridad.

## 7. Fases de migración
**M0 Inventario:** call graph de rutas, ConversationAgent, providers, herramientas, memorias, permisos y puntos de espera; fixtures reales anonimizados y baseline.

**M1 Contratos:** vocabulario unificado de tarjeta/snapshot/intención/task receipt; schema version y tests de compatibilidad. No duplicar `cognition-card.ts` existente.

**M2 Cognitive pipeline:** EventBus→Graph→Attention→CardCompiler→Store; priorizar estado real de tareas y alertas ciber; asegurar invalidación y tenant scope.

**M3 Slow API separada:** mover razonamiento fuera del camino crítico; permitir solicitudes del kernel y generación de tarjetas con schemas y presupuestos propios.

**M4 Fast API separada:** nueva ruta con contexto precalculado, streaming y sin herramientas de efectos. Mantener legacy detrás de feature flag, rollback probado.

**M5 Presenter y UI:** tarjetas, fases SVG, progreso real y timeline pedagógico; reconexión, snapshots, a11y.

**M6 Anam:** conectar al mismo Fast/session/card pipeline, adaptador audiovisual, barge-in y gestión de sesiones. Verificar SDK/API actuales antes de codificar.

**M7 Ciberseguridad:** registrar capacidades autorizadas por tenant y adaptador SDK TS server-only→Python/FastAPI, recibos y evidencia, error/partial/unknown; probar sin proveedores primero.

**M8 Canary:** un tenant interno, luego dos empresas dogfood, métricas y pruebas de aislamiento; rollback y revisión humana.

**M9 Legacy retirement:** solo con paridad y aprobación explícita. No borrar `conversation.ts` por anticipado.

## 8. Fallos y comportamiento degradado
| Fallo | Conducta |
|---|---|
| Slow API no disponible | Fast conversa con snapshot válido; tareas complejas quedan pendientes/error claro |
| Card Store caído | Fast en modo limitado con contexto mínimo autorizado; no inventar hechos |
| Evento no persistido | no afirmar operación auditada; acciones críticas fail-closed |
| Fast caído | tareas y kernel siguen operativos; canales muestran fallo |
| Anam caído | chat escrito puede continuar; no perder task |
| Ciberseguridad offline | tarea no confirmada; retry controlado y resultado unknown si procede |
| Revocación de usuario | invalidar tarjetas, sesiones y permisos; impedir nuevos efectos |
| Evento duplicado | proyección idempotente; no duplicar notificaciones/acciones |

## 9. Matriz de pruebas
- Fast no realiza llamadas síncronas a Slow, embeddings o escaneo completo de datos por turno.
- Evento de tarea crea tarjeta sin usuario conectado.
- Tarjeta nueva aparece en siguiente turno sin regenerar todo el grafo.
- El mismo agente en dos empresas nunca mezcla tarjetas.
- Sin aprobación no hay efectos, aunque el Fast los pida.
- Un resultado parcial no se anuncia completado.
- El camino SVG puede ser pedagógico, sin alterar el estado real.
- Barge-in interrumpe voz, no trabajo aceptado.
- Caída de Slow no bloquea conversación general.
- Reconexión conserva sesión y progreso autorizado.
- Límite de tokens mantiene restricciones críticas.
- Primer dominio Ciberseguridad produce receipts y evidencia trazable.

## 10. Tareas de auditoría antes de editar código
1. Rutas reales y dependencias de `conversation.ts`; localizar `runWithModelFallback` y providers.
2. Verificar implementación actual de `cognition-card.ts` y dónde se inyecta.
3. Identificar Slow LLM real, Presenter y background jobs; no crear duplicados.
4. Inspeccionar `EventBus.emit` y manejo de `persisted:false` en callers críticos.
5. Verificar `Actor`, tenant y `PolicyEngine` con pruebas negativas.
6. Diseñar patchsets concretos, cada uno con archivos, tests, rollback, métricas y estado.
7. Ejecutar solo tras revisión y autorización; esta documentación no implica despliegue.
