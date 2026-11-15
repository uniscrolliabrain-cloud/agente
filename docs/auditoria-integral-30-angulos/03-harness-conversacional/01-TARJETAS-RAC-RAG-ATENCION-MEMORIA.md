# Sistema de tarjetas RAC/RAG, atención, grafo y memorias — especificación extensa
**Ámbito:** `agente`. **Estado:** diseño, no afirmación de implementación.

## A. Distinciones semánticas obligatorias
- **Hecho:** resultado verificable del kernel/runtime/dominio con provenance.
- **Evento:** notificación versionada de que algo ocurrió; no equivale por sí solo a estado actual.
- **Grafo:** vista relacional que enlaza hechos, agentes, empresas, objetivos y tareas.
- **Memoria:** persistencia/retrieval de información con permisos y caducidad.
- **Atención:** priorización dinámica, no permiso ni verificación.
- **RAG:** recuperación fundamentada de información autorizada.
- **RAC:** denominación usada en conversación para tarjetas/contexto; **expansión pendiente de recuperar**.
- **Tarjeta:** unidad compacta de contexto lista para consumir por el Fast, derivada de fuentes.
- **Snapshot:** selección coherente de tarjetas y conversación para un turno.
- **Presenter:** transformación semántica entre estado técnico y lenguaje útil para agentes/personas.
- **Slow:** razonamiento selectivo y estructurado, no generador obligatorio de cada tarjeta.

## B. Pipeline incremental, no recomputación por turno
```text
[Event Bus] --event_id--> [Normalizer] --entity refs--> [Graph Projector]
                                  |                          |
                                  v                          v
                            [ACL / provenance]          [Attention Index]
                                  \                         /
                                   [Card Compiler / Presenter]
                                               |
                                        [Card Store]
                                               |
                                 [Session Context Projection]
                                               |
                                           [Fast API]
```
El Slow entra en el compilador cuando una transformación exige inferencia/síntesis; los cambios triviales pueden mapearse por reglas. La atención puede funcionar como índices vectoriales y reglas por prioridad, recencia, relación y vigencia. Un evento no siempre crea tarjeta: puede invalidar una existente, actualizar metadatos o no ser relevante para esa persona.

## C. Taxonomía funcional y ejemplos
| Clase | Ejemplo de contenido | Fuente | Regla de vigencia |
|---|---|---|---|
| Persona | LAIA, rol, tono, relación con usuario | perfiles autorizados | cambio de configuración |
| Tenant | resumen de empresa y permisos | kernel/identidad | cambio de membresía |
| Task | “Auditoría en cola; no iniciada” | task status | sustituir al cambiar estado |
| Outcome | “Auditoría finalizada con evidencia E-123” | receipt verificado | persistente con revisión |
| Alert | “Hallazgo alto pendiente de aprobación” | Ciberseguridad + política | hasta resolución o revocación |
| Memory | preferencia de formato de informes | memoria autorizada | TTL/rectificación |
| Attention | prioridad de tres asuntos actuales | ranking de atención | corto y recalculable |
| Policy | “No publicar sin autorización” | política vigente | invalidación inmediata |
| Reasoning | resumen de riesgos con incertidumbre | Slow + Presenter | versionar fuentes y modelo |
| Domain | estado de controles ciber | SDK y eventos del dominio | sincronización/TTL |

**No confundir:** tarjeta `Outcome` con permiso de ejecutar otra acción. Una tarjeta `Attention` puede sugerir urgencia pero no conferir prioridad de autorización.

## D. Esquema conceptual, pendiente de reconciliar con Zod real
```ts
type CardKind =
  | 'persona' | 'tenant' | 'task' | 'outcome' | 'alert'
  | 'memory' | 'attention' | 'policy' | 'reasoning' | 'domain';

interface CognitiveCardDraft {
  cardId: string; schemaVersion: string;
  tenantId: string; agentId: string;
  kind: CardKind; classification: string;
  visibility: { actorIds?: string[]; roles?: string[]; taskIds?: string[] };
  sourceEventIds: string[]; evidenceRefs: string[];
  priority: number; validFrom: string; expiresAt?: string;
  supersedes?: string; epistemicStatus: 'verified'|'derived'|'hypothesis';
  content: string; tokenEstimate: number; contentHash: string;
}
```
Este bloque es un **contrato propuesto**, no debe copiarse a producción sin auditar `packages/domain/src/cognition-card.ts` y la infraestructura de eventos/memoria existente.

## E. Selección de tarjetas para cada turno
1. Resolver sesión, tenant y principal autenticados.
2. Consultar **snapshot ya materializado**; no disparar una reconstrucción global síncrona.
3. Aplicar permisos antes de scoring y antes de envío al modelo.
4. Eliminar tarjetas expiradas, revocadas, reemplazadas o incompatibles con versión.
5. Deduplicar por hecho/entidad, no solo por texto.
6. Conservar tarjetas obligatorias de seguridad y estado de tarea vinculada.
7. Ordenar por relevancia para intención actual, prioridad, recencia, cercanía al grafo, relación con agente y coste en tokens.
8. Comprimir tarjetas extensas con referencias al detalle, preservando negaciones y advertencias.
9. Ensamblar prompt con persona, conversación, memoria y tarjetas.
10. Registrar IDs/versiones de tarjetas efectivamente inyectadas y presupuesto consumido, sin volcar secretos en telemetría.

## F. Presupuesto de tokens y límites epistemológicos
La conversación menciona tarjetas **~1.000 tokens**. **No conocemos de manera recuperada el reparto exacto del presupuesto total**. Separar explícitamente:
- `perCardTokenCap`: techo de una tarjeta (~1.000 como referencia conversacional).
- `maxInjectedCards`: configurable por modelo/canal/turno, **valor por decidir**.
- `cardsAggregateTokenBudget`: configurable y medido, **valor por decidir**.
- `personaBudget`, `dialogueBudget`, `memoryBudget`, `responseReserve`: **valores por decidir**.
- `slowReasoningBudget`: independiente del Fast, **valor por decidir**.

No convertir ~1.000 tokens en “1.000 tokens para todo el contexto”. Una tarjeta puede tener 60 tokens y otra 800. La selección depende del coste total, latencia y criticidad. Truncar un aviso de autorización por superar presupuesto debe producir un fallback seguro, no omisión silenciosa. Medir con tokenizador del proveedor elegido.

## G. Cinco memorias y grafo cromático
La arquitectura previa contempla **cinco memorias** y atención vectorial sobre un grafo multicapa/cromático. No atribuir nombres ni pesos exactos a las cinco memorias sin contrastar el contrato original; diseñar interfaces de `memoryRead`, `memoryWrite`, `memoryInvalidate` y `memoryProject` con scopes. La geometría o metáfora del grafo no debe sustituir permisos de lectura/escritura. JEV AI puede aportar mecanismos cognitivos adicionales más adelante, sin convertirse en autoridad de ejecución.

## H. Coherencia, concurrencia y revocación
- Usar `cardVersion`, `sourceRevision`, `updatedAt`, `supersedes` para evitar regresión.
- Un evento fuera de orden no resucita tarjetas revocadas.
- Al revocar acceso, invalidar caché de sesión, tarjetas y retrieval.
- `tenantId` debe acompañar índices, stores, consultas y delivery de sesión.
- No asumir exactly-once en Event Bus; consumidores idempotentes y cursores durables.
- Una tarjeta `derived` conserva vínculos a fuentes y incertidumbre.
- La ausencia de tarjetas no es permiso para inventar hechos; degradación explícita.

## I. Escenario de ejemplo
Tarea ciber `T-17` creada → `task.created` → tarjeta “recibida” para LAIA → worker inicia → nueva versión “en ejecución” → escáner produce findings → grafo enlaza activo/empresa/hallazgo → Slow sintetiza riesgos si se necesita → Presenter genera resumen legible con evidencia → Fast informa al usuario. Si se revoca el permiso entre dos eventos, se invalidan las tarjetas aunque la tarea siga en curso. Si el escaneo falla, se genera estado `failed` y nunca `completed`.

## J. Pruebas de contrato obligatorias
- Misma persona LAIA en dos tenants no mezcla tarjetas.
- Cambio de rol revoca tarjeta antes del siguiente turno.
- Evento duplicado no genera dos alertas; eventos factuales distintos no se pierden por dedupe.
- Actualización fuera de orden no hace retroceder un estado.
- Tarjeta `hypothesis` no se comunica como hecho confirmado.
- Presupuesto de tokens mantiene avisos críticos o bloquea con seguridad.
- Slow caído permite Fast en modo limitado.
- Tarjeta invalidada desaparece del prompt y del canal de voz.
- El evento de Ciberseguridad se puede rastrear hasta evidencia y recibo.
- Inyección en sesión activa no altera audio en curso de forma abrupta.

## K. Auditoría siguiente de código
Rastrear `cognition-card.ts`, `memory/`, `rag/`, `kernel/`, `events/`, `conversation.ts`, `views/`, `policy/`. Por cada mecanismo: evidencia de archivo y SHA, estado implementado/parcial/propuesto, test y migración. No implementar un segundo Card Engine paralelo antes de localizar el existente.
