# M1 — inventario del circuito intención, observación y autoridad

Revisión estática Trans02. Complementa matriz canónica y reconciliación founder. No GO.

## Anclas verificadas
- runtime.ts 776d1567:88–175 chat; identidad autenticada, presupuesto, key digest tenant/actor/thread/run, INSERT accepted, latest user del envelope cliente, snapshot, Fast sin tools, ACK transaccional. No persistencia del mensaje humano ni evento de intención en este método. No confundir accepted con intención durable. No afirmar ausencia global hasta inspeccionar rutas y persistencia threads.
- chat-agent.ts 3ab50c7e: adapter existente, clone conserva cognition/owner, run bound. P01 reutiliza clase; no crear otro adapter.
- public-text-event.ts d1ed4191: reconstruye solo eventos de texto assistant. No convertir eventos privados del proveedor ni respuesta textual en comandos.
- workers.ts 98ce694e: cuatro lanes projection/slow/delivery/receipts por tenant; actor worker no equivale a actor humano. Readiness solo consulta retry/dead_letter de dos consumers; heartbeat no demuestra backlog vacío.
- storage.ts af4a25c9: DurableProjector.batch usa cursor FOR UPDATE, fence, secuencia, inbox y transacción; candidato para observación durable, no otro sistema de colas. Verificar nested transaction y RLS antes de enqueue dentro de callback.
- kernel-receipts.ts 1a16b677: mismo blob Trans01 V3; audit y notification en transacción pinned; no verificador universal.
- projector.ts 4e173086: procesa record.proposed, slow.status terminal y source.revoked. No usar todos los eventos como triggers automáticos.
- business-read.ts 314cc808: puerto interno limitado read_workspace; identidad humana, PDP, contrato low/read, binding, insertIfAbsent y estado unknown. Construye CapabilityRunner local con registry fijado y sin governance/db inyectados. No generalizar este seam a propuestas operativas. El PDP existente es control real; no afirmar bypass explotable sin callers.

## Diseño candidato para P04 (pendiente ABI)
1. Localizar persistencia threads y ACL; el historial AGUI aportado por cliente no prueba autenticidad de cada mensaje. Solo la nueva intención admitida por servidor puede ser raíz; historial assistant nunca fuente de autorización.
2. Persistir intención mínima autorizada y referencia estable antes de RUN_STARTED, junto con aceptación del run si Store permite atomicidad. No guardar texto duplicado en bus; usar referencia versionada y ACL. Si no existe mensaje durable, diseñar almacenamiento aditivo tras reserva de schema/RLS. No asumir runId equivale a messageId: reenvío con otro runId requiere dedupe por identidad de mensaje autorizada.
3. Consumidor durable independiente: filtrar allowlist de tipos raíz, resolver identidad humana actual y propósito, verificar fuente y revisión; registrar skip terminal para evento irrelevante. Para intención sin card previa, definir evidencia tipada o proyección de intención con estado epistémico no verificado; no falsear verified_fact ni relajar SlowObservationBridge globalmente.
4. Enqueue idempotente ligado a intención, plantilla, identidad y revisión; cursor/inbox/job atómicos si mismo Store y nesting certificado. Si no, journal de handoff recuperable con dedupe y no avance prematuro. No llamada LLM dentro de transacción.
5. Slow actual produce record.proposed y thought; no se ha confirmado schema operativo de salida. Añadir discriminante candidato solo tras ABI Trans01: interpretación vs propuesta operativa, esta última se admite por puerto kernel. No invocar runner desde Slow.
6. Receipts operativos por familia: validar persistencia, scope, estado, binding y revisión. Proyección de hechos separada de hipótesis. No realimentar slow.status, record.proposed, hint o derivados sin política explícita y presupuesto causal.
7. Fast sigue usando snapshot preparado y publicTextEvent. Caída Slow no impide conversación; fallo de persistencia de intención no se anuncia como solicitud operativa aceptada. Distinguir ACK servidor de recepción cliente.

## P03/P04 — reconciliar business-read
Conservar contrato estrecho y comportamiento de lectura hasta inventario de callers/tests. Trans01 A02/A03 exige perfil gobernado explícito; acordar puerto de lectura autorizado en composición service, no instanciar runner general nuevo desde Cognition. No migrar a API void perdiendo resultados ni eliminar comprobación PDP. Receipt local completed acredita ejecución de lectura, no contenido verificado de negocio. Evaluar CAS started→completed/unknown y fallo de ACK antes de extender. No retry automático unknown. Reservar cambios compartidos con Trans01.

## Pruebas candidatas y aceptación
- tests/cognition-v2-http.test.ts y runtime.test.ts: identidad A/B, historial assistant falsificado, mismo mensaje con dos runs, run duplicado, abort antes/después de aceptación, fallo de commit. Assert no propuesta Fast, cero tools, una intención durable o rechazo explícito.
- tests/cognition-v2-public-events.test.ts: tool call/rawEvent/metadata no cruzan ni disparan operación.
- tests/cognition-v2-transactions.test.ts y durability.test.ts: crash entre intención y enqueue, lease perdido, doble worker, replay, cursor no salta, no llamada externa en tx.
- tests/cognition-v2-business-read.test.ts: preservar PDP deny, binding conflict, unknown; agregar spy de puerto gobernado y ausencia de segundo runner tras migración.
- tests/cognition-v2-workers.test.ts: si se añade consumer/lane, readiness y lag reflejan retry/dead_letter; tenant bloqueado no bloquea otro. No ampliar lanes sin medir capacidad.
- tests/cognition-v2-runtime-outcome.test.ts y kernel-receipts.test.ts: receipt falso, accepted no confirmed, no duplicar audit/notification, derivados no disparan bucle.

Comandos candidatos: pnpm typecheck; ALLOW_NETWORK=0 pnpm test:cognition-v2; PG restringido según gate existente. Verificar scripts y fixtures antes de ejecución. Rollback: desactivar productor/consumer nuevo, conservar intención/journal/jobs y cursor; no fallback de ejecución ni reset de eventos.

## Pendientes
Inventario de rutas threads, schema events, callers business-read y contratos de composición; lectura individual de 48 README aún pendiente. ABI de intención/propuesta/receipt requiere Trans01 y decisión founder sobre canónica. No código funcional ni pruebas ejecutadas; no nueva nota.
