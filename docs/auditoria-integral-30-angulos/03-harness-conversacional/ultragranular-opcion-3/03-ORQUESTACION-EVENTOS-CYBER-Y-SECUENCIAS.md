# Orquestación híbrida — secuencias, contratos de eventos y resiliencia
**Opción elegida:** kernel autoritativo + proyecciones cognitivas asíncronas + servicio de contexto del runtime. **No hay implementación nueva en este documento.**

## 1. Topología lógica
```text
Usuario / LAIA Fast / Anam
   | solicitudes tipadas                 ^ snapshots seleccionados
   v                                     |
Agente Kernel / Policy / Approval      ContextServingFacade
   |                                     ^
   v                                     |
SOP Executor / Cyber SDK TS           CardStore + DeliveryLedger
   |                                     ^
   v                                     |
Cyber FastAPI → jobs → receipts      Presenter / CardCompiler
   |                                     ^
   v                                     |
Cyber outbox → Agente Ingest → Bus → CognitiveProjector
                                      |      |      |
                                     Graph Memory Attention
                                      \      |      /
                                       Slow LLM
                                          |
                                     JEV classifier port
```
El diagrama expresa dependencias, no obliga a invocar Slow para cada evento ni a ejecutar JEV antes de publicar un hecho confirmado.

## 2. Secuencia A: tarea iniciada desde conversación
A1 Usuario pide auditoría de activo. A2 Fast interpreta solicitud y emite `IntentProposal` sin ejecutar. A3 Kernel verifica actor, tenant, scope, capacidad, consentimiento, presupuesto y aprobación. A4 Si faltan datos, pide aclaración; si falta aprobación, crea `awaiting_approval` sin efecto. A5 Si autorizado, crea Task y registra evento persistente. A6 Executor invoca SDK server-only con authorization_id, correlation/causation, idempotency y expected_revision. A7 Cyber devuelve `202 accepted` o rechazo; **202 no es completado**. A8 UI muestra tarea aceptada y camino pedagógico. A9 Cyber worker progresa con leases/fencing y outbox. A10 Adapter ingiere eventos validados; kernel/bus registran transiciones. A11 Projector actualiza grafo y memoria; atención prioriza; Slow resume si procede; CardCompiler genera tarjetas. A12 ContextServingFacade las ofrece al siguiente turno de LAIA y, si autorizado, notifica resultado. A13 Si se requiere remediación, nuevo flujo de aprobación; nunca se infiere aprobación de una tarjeta.

## 3. Secuencia B: trabajo de fondo sin usuario conectado
B1 Cyber produce finding o job transition. B2 Outbox durable retiene hasta ACK válido. B3 Ingest autentica origen y verifica tenant/capability/schema. B4 Bus persiste eventId único. B5 Projector por cursor procesa y produce grafo + cards. B6 Un snapshot del owner/LAIA se actualiza aunque no haya sesión. B7 Al abrir chat, Fast recibe estado preparado. B8 Si el usuario pregunta “¿qué cambió?”, se consultan delta cards y snapshot; se comunica con provenance y sin recomputación global.

## 4. Secuencia C: clasificación con JEV futuro
C1 Slow produce Thought/metadata; C2 builder crea tarjeta factual o derivada; C3 clasificador rules produce primera clasificación; C4 en background se solicita JEV si habilitado; C5 JEV devuelve labels/sugerencias tipadas; C6 validator comprueba esquema, references y tenant; C7 policy decide visibilidad, no JEV; C8 se crea nueva revisión y se invalidan snapshots afectados; C9 Fast recibe versión nueva en siguiente turno. **JEV ausente o fallido:** continuar con clasificación rules y marcar calidad limitada.

## 5. Secuencia D: recuperación de eventos perdidos
D1 Evento durable persiste pero subscriber live cae. D2 Cursor del proyector no avanza. D3 Worker reinicia y lee desde último ACK. D4 Reprocesa con idempotency `tenant+eventId+projectorVersion`. D5 Upsert de proyecciones por revision, no append ciego. D6 ACK solo tras persistir resultados. D7 Métrica lag retorna a cero. D8 Snapshot converge al mismo resultado que ejecución sin fallo. Si el bus no permite este patrón hoy, construir adaptador/outbox/cursor antes de afirmar durabilidad.

## 6. Secuencia E: revocación
E1 Owner retira permiso o cambia rol. E2 Kernel registra revocación con revisión. E3 Proyector invalida tarjetas y snapshots por scope. E4 ContextServingFacade rechaza versiones anteriores. E5 Fast/Anam dejan de recibir datos revocados; sesiones activas pueden necesitar cancelación segura. E6 Ciberseguridad revalida authorization antes de nuevos efectos; trabajos en curso siguen su protocolo de cancelación/reconciliación. **No** prometer reversión de efectos externos ya completados.

## 7. Contrato de evento puente propuesto
```ts
interface CyberBridgeEvent {
  schemaVersion: number; eventId: string; tenantId: string;
  source: {system:"agntia-ciberseguridad"; resourceId:string};
  type: string; occurredAt: string;
  correlationId: string; causationId?: string; idempotencyKey: string;
  actorRef?: string; authorizationId?: string; jobId?: string;
  entityRefs: string[]; evidenceRefs: string[];
  revision?: number; payload: unknown; // parse por type, nunca aceptar arbitrary
}
```
Tipos iniciales propuestos desde doc Cyber: `security.audit.completed`, `security.finding.created`, `security.finding.changed`, `security.policy.denied`, `security.remediation.proposed`, `security.remediation.verified`, `security.incident.opened`, `security.budget.threshold`. **Verificar cuáles se emiten realmente** antes de registrar schemas. Añadir `security.job.updated` solo mediante ADR y contrato versionado, no inventarlo como ya existente.

## 8. Matriz de estados de Cyber
| Cyber Job | Kernel/Task | Tarjeta | UX |
|---|---|---|---|
| pending | queued | solicitud pendiente | en cola |
| running | running | ejecución confirmada | en curso |
| partial | partial | resultado parcial, gaps | incompleto |
| completed | completed **solo con receipt** | resultado verificado | finalizado |
| failed | failed | error y alcance | fallido |
| cancelled | cancelled tras confirmación | cancelación | cancelado |
| blocked | awaiting_dependency/blocked (propuesto) | bloqueo | requiere intervención |
| reconciliation_required | outcome_unknown/reconciliation (propuesto) | estado incierto | conciliación necesaria |
**Advertencia:** mapping exacto a enums existentes del padre requiere inspección; no cambiar TaskStatus unilateralmente.

## 9. Matriz de confianza
Frontera browser→server: sesión, CSRF, auth, no confiar tenant de body.
Fast→Kernel: intención propuesta, Zod, allowlist, idempotencia, approvals.
Kernel→Cyber: credencial scoped, audiencia, autorización, profile/asset allowlist.
Cyber→Bus: autenticación de emisor, schema, firma o canal privado, dedupe.
Bus→Graph: hechos y revisiones, provenance, no instrucciones.
Graph→Slow/JEV: minimización, redactar evidencias, token limits, no secrets.
Cards→Fast: ACL server-side, epistemia, delimitación de datos no instrucciones.
Fast→Usuario: distinguir verificado/inferido/pendiente; no inventar recibos.

## 10. Fallos
- **Emit persisted:false:** no registrar éxito de negocio; fail-closed para acciones críticas o reconciliar.
- **Cyber 202:** estado aceptado, no completado.
- **Cyber timeout tras efecto:** `reconciliation_required`, no retry ciego.
- **Duplicate webhook:** ACK idempotente, sin segundo trabajo.
- **Out-of-order:** revision/fencing previene retroceso de estado.
- **Slow timeout:** tarjeta factual determinista, encolar enriquecimiento.
- **JEV timeout:** clasificación rules, no bloqueo del kernel.
- **CardStore down:** Fast modo degradado, sin inventar hechos.
- **Revocación:** invalidación y denegación, incluso con caché caliente.
- **Prompt injection en finding:** tratar evidencia como dato no confiable.
- **Cross-tenant:** denegar antes de scoring/retrieval, registrar alerta sin filtrar datos.
- **PII/secret:** no incluir raw en eventos, cards, telemetry o prompts.

## 11. Observabilidad
Métricas `event_ingest_lag_ms`, `projection_lag_ms`, `projector_retry_total`, `dead_letter_count`, `card_generation_ms`, `card_delivery_total`, `snapshot_cache_hit`, `revocation_propagation_ms`, `slow_cost_tokens`, `jev_cost_tokens`, `fast_ttft_ms`, `voice_first_audio_ms`, `cyber_job_reconciliation_count`. Trazas con correlationId, causationId, tenant pseudonimizado, eventId y cardId, nunca prompt/evidence completos. Baselines p50/p95/p99 por canal y modelo.
