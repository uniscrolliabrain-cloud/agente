# Context Serving Runtime, Fast/Slow APIs, Presenter, Anam y UX
**Estado:** contrato objetivo ultradetallado, sin código implementado en esta entrega.

## 1. Problema que resuelve
La IA conversacional no debe leer todo el grafo, toda la memoria y todos los eventos en cada turno. Debe consumir una proyección **materializada y autorizada** que se mantiene viva desde el kernel, el Event Bus, el grafo y los procesos de Slow. No convertir el Fast en controlador del negocio ni en orquestador de un enjambre de agentes. Un mismo agente LAIA sirve a múltiples empresas sin compartir datos.

## 2. ContextServingFacade: API lógica
`getSnapshot({tenantId,actorId,agentId,sessionId,threadId,taskId?,query?,channel,modelId,tokenBudget}) → ContextSnapshot`
`getDeltas({tenantId,actorId,agentId,cursor,limit}) → CardDeltaPage`
`getReference({tenantId,actorId,cardId,detailRef}) → AuthorizedDetail`
`ackDeltas({tenantId,actorId,sessionId,deliveryIds}) → AckResult`
`invalidate({tenantId,scope,reason,revision}) → InvalidationReceipt`
`getProjectionStatus({tenantId,projectorId}) → LagAndVersion`.
Son **interfaces propuestas**, no endpoints actuales. Implementar primero como servicios TS internos, no exponer API pública hasta justificarlo.

## 3. Algoritmo de selección
S1 Autenticar sesión; derivar tenant y principal del servidor. S2 Resolver persona/agente, workspace, permisos y tarea activa. S3 Obtener proyección cacheada por scope y revision. S4 Filtrar tarjetas expiradas, revocadas, reemplazadas o de otro tenant. S5 Separar `must_include` (restricciones/estado factual crítico), `relevant` y `optional`. S6 Aplicar scoring de atención + coincidencia semántica/léxica + recencia + prioridad de tarea + utilidad previa; score no cambia ACL. S7 Deduplicar tarjetas sobre mismo hecho/revision y no borrar negaciones. S8 Asignar budgets por canal/modelo. S9 Compactar manteniendo provenance y epistemic status. S10 Construir snapshot inmutable con ids/versiones/hash. S11 Registrar qué tarjetas se inyectaron, sin contenido sensible. S12 Liberar reserva de delta solo cuando se confirme el uso según política; no consumir contexto persistente. S13 Si una tarjeta crítica no cabe, degradar o pedir recuperación adicional, nunca silenciar restricción.

## 4. Tres carriles de entrega
**Delta:** novedad entregada una vez por destinatario, ACK por sesión, reintento idempotente, cursor. **Snapshot:** estado vigente reutilizable, con version, ACL y TTL; no `markConsumed`. **Reference:** contenido largo RAG recuperable con autorización y límites; nunca inyectar corpus entero. Una tarjeta puede estar en snapshot y producir un delta de “actualizada” sin duplicar texto. Evitar que un delta se pierda si el modelo falla antes de responder.

## 5. Presupuestos de tokens
**Histórico recuperado:** tarjetas de aproximadamente 1.000 tokens; no se conoce distribución exacta. **Actual verificado:** `MAX_CARDS=3`, `MAX_BLOCK_TOKENS=700` agregado y `MAX_BODY_CHARS=700` en `engine/context/cognition-cards.ts`, estimación chars/4.
Propuesta de configuración:
```ts
interface ContextBudgetPolicy {
  modelId: string; channel: "web"|"voice";
  maxCardTokens: number; maxAggregateCardTokens: number;
  personaTokens: number; dialogueTokens: number;
  memoryTokens: number; responseReserveTokens: number;
  criticalCardReserveTokens: number;
  tokenizerId: string;
}
```
**Valores por decidir tras medir:** no fijar 1000 como agregado ni 700 como SLA futuro. Presupuestos separados de Slow y JEV, cuyos tokens se contabilizan en trabajos de background. Calcular tokens con tokenizer real y métricas por proveedor. Los modelos pueden tener ventanas distintas; la reserva de salida no debe desaparecer por tarjetas.

## 6. Fast LLM
Entrada: `FastTurnRequest` autenticado + snapshot + conversación reciente + persona/estilo. Salida: stream de respuesta y, cuando proceda, `IntentProposal` validada. Fast no accede a DB global, no ejecuta Cyber ni aprueba, no crea hechos. Permitir preguntas de aclaración, interrupción, charla natural y explicaciones sobre trabajo. Si el snapshot está obsoleto o inaccesible, informar limitación. Separar provider, timeout, retry, fallback, streaming, tokens y telemetría de Slow.

## 7. Slow LLM
Entradas: eventos seleccionados, cambios de grafo, solicitudes de análisis, tareas complejas y revisión de memoria. Salidas tipadas: Thought, propuesta de plan, síntesis, metadata, tarjetas, quality flags, posibles contradicciones. Disparadores: importancia, novedad, conflicto, incertidumbre, vencimiento, solicitud humana o cadencia; no generar tarjeta por cada token/evento irrelevante. Procesamiento en cola con idempotency, costes y prioridades. El Slow no inventa hallazgos Cyber ni concede permisos. La clasificación JEV posterior no sustituye el razonamiento ni la validación.

## 8. Presenter
Dos productos semánticos:
**CardPresenter:** convierte Thought/graph/fact en contexto compacto con evidencia, estado epistemológico, asunto, vigencia y sugerencia de redacción para Fast.
**JourneyPresenter:** convierte tareas, approvals, receipts y progreso a estados comprensibles y fases UX.
No tiene autoridad sobre TaskStatus. Las presentaciones deben poder reconstruirse desde fuentes y versión del template. Los textos de tarjetas son datos no instrucciones; evitar prompt injection.

## 9. Anam y voz
Anam representa LAIA visual y vocalmente, pero el cerebro y permisos son los del padre. Chat y voz comparten session context service, card selection, Fast engine y pipeline de intent. El adaptador de voz añade ASR/transcripción, TTS/streaming, barge-in, turn detection, sesiones y latencia audio. Un corte de voz no cancela tareas persistentes. No inyectar tarjetas a mitad de stream LLM; usar snapshot al inicio de generación y aplicar cambios al siguiente turno. Si hay revocación crítica, terminar la sesión insegura. Los tokens de voz se pueden presupuestar de modo distinto, sin cambiar permisos.

## 10. SVG y camino de acciones
**Microanimación:** espiral de puntos clara, compacta, fondo blanco/transparente, pulso de opacidad y rotación. `prefers-reduced-motion` y estado accesible.
**Fases educativas (cinco, ajustables):** comprender solicitud, identificar necesidad, preparar trabajo, coordinar operación, organizar respuesta. No son la traza real del runtime ni duran necesariamente dos segundos; no retrasan TTFT ni primer audio.
**Timeline factual:** solicitud aceptada, queued, running, approval, partial, completed, failed, reconciliation_required, cancelled. Se alimenta de receipts y eventos. Un DAG de 40 nodos puede verse como cinco hitos pedagógicos; no equivale a 40 operaciones completadas. Las fases decorativas no se confunden con una afirmación de efecto real.

## 11. Estado del frontend
`thinking`, `streaming`, `speaking`, `task_accepted`, `task_running`, `awaiting_approval`, `task_partial`, `task_completed`, `task_failed`, `task_unknown`. Separar `ConversationVisualState` de `OperationalTaskState` en tipos distintos. Una animación puede terminar sin que termine la tarea. Reconexión reconstruye estado factual, no inventa progreso. Mensajes `aria-live` solo para hitos importantes.

## 12. Métricas y acceptance
TTFT chat p50/p95/p99, primer audio voz, tasa snapshot hit, tiempo de proyección evento→card, tokens por tarjeta y por turno, gasto Slow/JEV, caducidad, alertas no entregadas, cancelaciones por barge-in y tasas de hallucination factual. Test: Fast responde sin Slow en camino crítico; cambios Cyber llegan a LAIA sin consulta manual; revocación borra contexto; contexto de dos tenants no se mezcla; UI nunca presenta `partial` como completado; no se impone espera artificial por animación.
