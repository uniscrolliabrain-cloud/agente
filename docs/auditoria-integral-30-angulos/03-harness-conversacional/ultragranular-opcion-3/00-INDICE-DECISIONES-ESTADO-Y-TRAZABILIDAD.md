# Opción 3 — Índice maestro, decisiones y trazabilidad
**Fecha:** 2026-11-15. **Alcance:** exclusivamente `uniscrolliabrain-cloud/agente` y contrato de `agntia-ciberseguridad`. **Fase:** documentación exhaustiva antes de tocar implementación. **No hay tests ejecutados en esta entrega ni cambios en main.**

## Objetivo
Ultimar lo ya pensado y parcialmente implementado: kernel autoritativo, Event Bus, grafo multicapa, cromos, cinco memorias, attention vectors, metacognición, Slow LLM productor de Thoughts y tarjetas RAC/RAG con metadatos, JEV AI clasificador futuro (no juez), Presenter, servidor de tarjetas del runtime, Fast LLM conversacional y canales chat/Anam; integrar Ciberseguridad con contratos verificables. El usuario no ha pedido reescribir el kernel, crear 14 repos ni desplegar.

## Invariantes no negociables
D1. El kernel determina autoridad y políticas; los LLM, JEV y los cromos no autorizan acciones.
D2. La cognición no depende del turno del chat: se proyecta desde hechos/eventos de fondo.
D3. Slow **también crea** tarjetas con metadatos; el builder determinista actual es base, no diseño final.
D4. JEV AI **clasifica y evalúa**, propone, y nunca se convierte en juez final.
D5. El runtime sirve contexto precompilado y filtrado al Fast por tenant/actor/agente/sesión/tarea.
D6. La voz Anam y el chat web consumen el mismo cerebro, con adaptadores de canal.
D7. Tarjetas de contexto persistente ≠ novedades de entrega una sola vez ≠ documentos RAG de detalle.
D8. Event Bus es transporte y registro de eventos, no prueba automática de un hecho ni garantía exactly-once.
D9. El grafo es multicapa, pero no se debe afirmar que todas sus capas ya estén cableadas.
D10. Los cromos son una ontología/estructura propuesta y parcialmente codificada, no ejecutor ni permiso.
D11. Cinco memorias: arquitectura prevista; **no se han verificado aún cinco implementaciones operativas**.
D12. SVG y cinco fases pueden ser representación pedagógica; estados factuales requieren receipts.
D13. Ciberseguridad es dominio independiente Python/FastAPI + SDK TS server-only; no fusionar runtimes.
D14. Ningún cambio en código productivo antes de inventario y tests de contratos.
D15. El histórico menciona tarjetas ~1000 tokens; los presupuestos totales y repartos exactos siguen sin recuperar.

## Matriz de madurez — no mezclar
| Elemento | Estado evidenciado en archivos | Qué falta demostrar |
|---|---|---|
| Slow→Thought→Card | `captureSlowCognition` real | callers y condiciones de activación, semántica de dedupe |
| Card schema | Zod estricto | metadata enriquecida, clasificación, scopes por actor |
| Card store | save/list/pending/consume/release | persistencia transaccional real, ACL, concurrencia |
| Chat injection | 3 tarjetas/700 tokens aproximados | snapshot persistente, tokenizador real |
| Attention | operaciones matemáticas tipadas | atención global continua y priorización por rol |
| Cromos | schema `logic/physics/intent/memory/policy` | wiring operativo, persistencia y evaluación |
| Metacognición | reglas/hints | JEV y metacognición semántica real |
| Bus→Kernel | `subscribeAll` + `runCognitionCycle` | durable cursor, replay automático, errores |
| Grafo de negocio | rutas de promoción parciales | topología completa y consistencia |
| Ciberseguridad | contrato, API/SDK según estado publicado | compatibilidad de schema binaria y E2E |
| Fast/Slow API separadas | dirección arquitectónica acordada | implementación, latencias, failover |

## Glosario controlado
**Fact:** dato de origen verificable. **Event:** registro de cambio. **Thought:** pensamiento tipado con autor y atención. **Cromo:** unidad tipada con axiomas/procedencia. **AttentionVector:** pesos sobre nodos y relaciones. **Memory:** persistencia y recuperación scoped. **RAG:** recuperación fundamentada. **RAC:** denominación histórica de tarjetas; expansión literal pendiente. **CognitionCard:** tarjeta Zod actual originada en Thought. **EnrichedCard:** extensión propuesta con clasificación y política de difusión. **ContextSnapshot:** vista seleccionada y autorizada de tarjetas. **Presenter:** representación legible para agente/usuario. **JEV:** clasificador/metacognición futura. **Receipt:** confirmación de resultado/estado respaldada por runtime. **Projection:** vista derivada reconstruible de eventos. **Cursor:** posición durable de consumo. **Causation:** evento desencadenante. **Correlation:** operación de negocio transversal.

## Índice de documentos de esta ampliación
1. `01-INVENTARIO-REAL-ARCHIVOS-FLUX-Y-BRECHAS.md`: código leído, funciones, efectos y riesgos.
2. `02-CONTRATOS-CARD-RAG-JEV-CROMOS-GRAFO-MEMORIAS.md`: modelos, taxonomías, invariantes y compatibilidad.
3. `03-ORQUESTACION-EVENTOS-CYBER-Y-SECUENCIAS.md`: pipelines, flujos, estados, fallos y causalidad.
4. `04-SERVIDOR-CONTEXTO-FAST-SLOW-PRESENTER-ANAM-UX.md`: servir tarjetas, budgets, voz, UX.
5. `05-PLAN-IMPLEMENTACION-PATCHSETS-GATES-TESTS-HANDOFF.md`: fases ultradetalladas, pruebas y entregables.
6. `06-REGISTRO-PENDIENTES-DECISIONES-Y-EVIDENCIA.md`: riesgos, decisiones abiertas y checklist de auditoría.

## Orden de lectura
Primero este índice y los documentos `00-ARQUITECTURA-COGNITIVA-CONVERSACIONAL-MASTER.md` y `04-AUDITORIA-REAL-KERNEL-CROMOS-ATENCION-JEV-CYBER-3-ORQUESTACIONES.md` del directorio superior. Después 01→06. Si un contrato propuesto contradice el código actual, **no se implementa directamente**: se redacta ADR, migración compatible y test de regresión.

## Convención de evidencia
`OBSERVADO`: leído directamente en archivo; `REPORTADO`: README/estado del repo, no validado en ejecución; `PROPUESTO`: arquitectura nueva; `PENDIENTE`: requiere código/tests o export histórico. La documentación no certifica un sistema operativo extremo a extremo.
