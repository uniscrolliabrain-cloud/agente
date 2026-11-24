# T01 · Propuesta de contratos y ownership para B1

Estado: propuesta congelada para revisión coordinada. El contrato ejecutable y las migraciones quedan para el turno autorizado siguiente.

## Circuito y contratos

1. **Entrada autenticada.** Resolver tenant, actor, owner y propósito desde el servidor. La presentación Fast puede solicitar una acción mediante contrato tipado con objetivo, capability, operación, idempotencia y evidencia. El PDP y el kernel revalidan por petición. El rol de presentación y el contexto del modelo no son credenciales.
2. **Ejecución.** El runtime identifica SOP/step y registra la decisión y el claim antes del adaptador. Para un efecto externo, el lease lleva fence y la autorización cubre la acción y objeto concretos. Clave propuesta por tenant, operación durable, versión y destino. Los cambios de inputs canónicos tras el claim se rechazan o generan una operación nueva explícita.
3. **Envelope.** Mantener lectores 1.0. Para el circuito reconciliado exigir schemaVersion, eventId, tenantId, actorId, owner, emittedAt, source, correlationId y causationId salvo evento raíz documentado. Correlation conecta el recorrido; causation refiere al antecedente comprobado en el mismo tenant. Nunca copiar secretos, payload personal innecesario ni razonamiento privado.
4. **Receipts.** Distinguir decisión/approval, efecto de negocio, resultado ambiguo, job Slow, consumo de contexto y reproducción. El de negocio vincula operationId, tenant, actor, capability, origen, estado y evidencia del adaptador. Un resultado ambiguo requiere reconciliación; replay no despacha nuevamente el efecto. Sin receipt verificable, no se produce un hecho empresarial.
5. **Outbox e inbox.** Commit atómico de estado, receipt y evento durable en el store compartido. Publicar después del commit. Los consumidores usan inbox y cursor por tenant y familia, con fence, retries y DLQ. Slow observa solo eventos admisibles y no consume sus derivados como nueva causa.
6. **Retorno cognitivo.** Proyección de dominio y grafo → observación autorizada → evaluación/clasificación según egress → evidencia y estado epistémico → snapshot acotado con ACL y revocación → Fast. Fast sigue disponible si Slow o JEV están caídos. Ningún consumidor usa una tarjeta o una inferencia como permiso.

## Contratos a revisar en B1

| Solicitud | Propietario | Cambio propuesto y prueba |
| --- | --- | --- |
| T01-R01 | trans02 | Verificador de receipt y admisión de evento por tenant/actor/propósito, claves de dedupe y exclusión de derivados. Probar receipt ajeno/revocado y Slow caído sin bloquear Fast. |
| T01-R02 | Trans03 | Cada adaptador declara capability, efecto, identificador externo y contrato de resultado ambiguo. Probar rechazo por revocación y reconciliación sin repetir envío. |
| T01-R03 | trans04 | Instrumentar causalidad, retrasos, cuotas y resultados sin payloads. Fijar SHA de fixtures y registrar exit codes separados por motor. |
| T01-R04 | Trans01 | Unificar autoridad y criterios de aceptación para acción V1, SOP y capability. Probar identidad faltante, aprobación ajena y claim concurrente. |

## Paths y reservas

Escritura efectiva de T01 limitada a `docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/`. Propuesta de reserva para T02: `apps/server/src/app.ts`, `apps/server/src/engine/service.ts`, `apps/server/src/actions.ts`, `apps/server/src/actions-deferred.ts`, `apps/server/src/kernel/kernel.ts`, `apps/server/src/kernel/audit/entry.ts`, `apps/server/src/kernel/subscribers/bus-emitter.ts`, `apps/server/src/engine/events/{bus,types,schemas}.ts`, `apps/server/src/engine/execution/{executor,capability-runner}.ts`, `apps/server/src/engine/capabilities/{registry,bootstrap}.ts`, `apps/server/src/engine/{sop-executor,sop-triggers}.ts`, `apps/server/src/engine/authz/pdp.ts` y `packages/domain/src/{agent,cognition-v2,business}.ts`. Auth, tenancy, migraciones y pruebas existentes requieren reserva por path antes de escribir. Cognition/voz, adaptadores externos, CI, métricas, UX y demo conservan sus propietarios.

## Migración y rollback

Expandir primero con registros aditivos y lectores capaces de leer 1.0. Validar role/grants Postgres y aislamiento antes de activar el nuevo consumidor. Hacer backfill reanudable por tenant con checkpoint y comparar conteos/digests sintéticos antes del cutover. Encender por tenant y controlar latencia/saturación. Para rollback, desactivar el consumidor, conservar eventos/outbox/inbox/receipts y volver al lector previo. Reconciliar efectos ambiguos antes de reprocesar. Los cambios irreversibles y la retirada de legacy requieren aprobación posterior. T01 revierte únicamente su documentación.

## Pruebas rojas o contratos negativos para el candidato combinado

| Caso | Resultado exigido | Ancla de baseline |
| --- | --- | --- |
| Mismo actor en A y B, receipt o snapshot ajeno | Rechazo y cero efectos o datos cruzados. | `tests/tenant-http-e2e.test.ts`, `tests/cognition-v2-rls.test.ts` |
| Identidad incompleta, aprobación equivocada o persona no autorizada | PDP bloquea antes del adaptador. Sin escalada desde Fast. | `tests/actions.test.ts`, `tests/kernel-persona-isolation.test.ts` |
| Dos consumidores, replay o timeout tras envío | Un efecto, receipt verificable y reconciliación si ambiguo. | `tests/cognition-v2-kernel-receipts.test.ts`, `tests/cognition-v2-transactions.test.ts` |
| Interrupción entre coordinadores sin salida del proveedor | Señal alcanzada antes del plazo de prueba y ausencia de persistencia tardía. | `tests/cognition-v2-voice.test.ts` en C04 |
| Slow saturado o revocado durante proyección | Fast continúa; no se entrega snapshot inválido ni se duplica un trabajo. | `tests/cognition-v2-runtime.test.ts` y suite del observador en C05/C06 |
| Reinicio entre estado, receipt y publish | Se reanuda el outbox sin repetir efecto, con cursor coherente. | Necesita prueba del árbol combinado y fault injection. |

Los casos propuestos para el candidato combinado quedan NOT_RUN hasta que ese árbol exista. Una prueba previa de un componente no acredita por sí sola el circuito completo.
