# ADR-009 — Rediseño sustitutivo: legacy transitorio, no arquitectura objetivo
**Fecha:** 2026-11-15
**Estado:** ACEPTADO POR EL FUNDADOR; corrige la interpretación de C00.
**Motivo:** la auditoría de compatibilidad anterior confundió proteger la migración con conservar el diseño actual.

## Decisión vinculante
El diseño conversacional y cognitivo actual **no satisface los requisitos del fundador** y debe ser rediseñado de manera profunda. Algunas piezas del runtime y del kernel pueden reutilizarse, pero **los flujos actuales no constituyen restricciones de arquitectura de destino**. Se pueden reemplazar, retirar, refactorizar y mover a legacy, con migración controlada. La opción 3 (kernel autoritativo + proyecciones cognitivas asíncronas + Context Serving Runtime) es el destino. **Paridad con legacy no es Definition of Done**: la nueva solución debe demostrar las capacidades nuevas.

## Tres categorías obligatorias en cada patchset
**REUTILIZAR:** componentes que cumplen el contrato de destino y preservan invariantes (por ejemplo kernel/policy, event provenance, validaciones tipadas), tras auditar su comportamiento real.
**SUSTITUIR:** componentes cuyo diseño impide cumplir requisitos; crear nuevas interfaces y rutas, migrar consumidores y retirar lo obsoleto.
**LEGACY TEMPORAL:** componentes antiguos que permanecen solo como compatibilidad operacional durante shadow/canary/rollback, con dueño, fecha o condición de retiro y pruebas. Nunca imponer su semántica a V2.

## Matriz de decisión de destino
| Superficie | Hoy | Destino | Tratamiento |
|---|---|---|---|
| Chat context | `assembleCognitionCards` consume hasta 3 tarjetas y ~700 tokens agregados | `ContextServingFacade` con delta, snapshot, reference, ACL, versiones y budgets | **SUSTITUIR**; V1 legacy temporal |
| Card lifecycle | `proposed→consumed` one-shot | snapshots reutilizables + ledger de entrega de deltas | **SUSTITUIR** semántica para V2; migración V1 |
| Slow capture | child turn sincrónico durante padre | enriquecimiento asíncrono con Thought/metadata/card y event provenance | **REDISEÑAR** mecanismo de autoría: no supeditar destino al child turn actual |
| Fast/Slow | fallback chain incluye Slow, rutas y prioridades por rol | APIs independientes, Fast de baja latencia con contexto preparado; Slow en background; fallback definido por SLA | **SUSTITUIR** routing cuando corresponda, sin obligación de reproducir fallback viejo |
| Event subscribers | live in-memory + ciclo async | proyector durable, cursor, replay, idempotencia | **REUTILIZAR** EventBus donde valga; **SUSTITUIR** consumer antiguo |
| Card builder | regex + dedupe por task | Slow genera metadata, clasificador rules/JEV, versiones y ACL | **SUSTITUIR/AMPLIAR** según tests |
| Presenter | selección de Thoughts | CardPresenter + JourneyPresenter con provenance | **EVOLUCIONAR O SUSTITUIR** según auditoría |
| Attention | matemáticas vectoriales | atención global proyectada por actor/agente/tarea | **REUTILIZAR** primitivas, completar motor |
| Cromos | schema pendiente de wiring | ontología conectada al grafo multicapa | **COMPLETAR**, no dar por existente |
| Memorias | implementación aún por inventariar | cinco memorias funcionales integradas, scoped y recuperables | **AUDITAR Y COMPLETAR**, sin inventar nombres |
| UX | chat legacy | Fast streaming + Anam + espiral SVG + fases pedagógicas y timeline factual | **SUSTITUIR** interfaz según diseño aprobado |
| Cyber | contrato y SDK separados | adapter autorizado + eventos a grafo/cognición | **INTEGRAR** sin fusionar runtime Python |

## Requisitos de aceptación V2, independientes de legacy
1. Fast puede contestar con baja latencia usando contexto ya preparado, sin bloquear por Slow ni JEV.
2. Slow trabaja en segundo plano y produce Thoughts y tarjetas enriquecidas con metadata, provenance y revisiones.
3. JEV AI clasifica y evalúa cuando esté disponible, sin ser autoridad de permisos/ejecución; fallback rules.
4. Kernel/policy/approval/SOP siguen siendo autoridad determinista.
5. Bus→proyector→grafo multicapa→memorias/atención/cromos→tarjetas→Context Serving→Fast funciona de extremo a extremo.
6. Contexto persistente sobrevive a turnos; novedades puntuales tienen entrega rastreable; referencia RAG se recupera bajo demanda.
7. Permisos, tenant, actor, rol, tarea y revocación se respetan en cada capa.
8. Ciberseguridad produce eventos/evidencia y estados parciales/unknown sin convertirlos en éxitos falsos.
9. Chat y voz Anam comparten arquitectura cognitiva; el canal no crea un cerebro separado.
10. SVG de fases es pedagógico, timeline factual está anclado a eventos y receipts.
11. Los componentes legacy retirados no quedan como dependencia obligatoria de V2.
12. Hay mediciones de latencia, coste, replay, fallos, recuperación y seguridad; objetivos numéricos solo tras baseline.

## Política de migración (seguridad sin conservadurismo)
**Fase M0** inventariar callers y caracterizar el comportamiento para evitar efectos colaterales. **M1** diseñar V2 con contratos propios sin heredar restricciones V1. **M2** implementar nuevo pipeline en paralelo/shadow y comprobar seguridad, corrección y nuevas capacidades. **M3** habilitar por tenant/canal con métricas y rollback. **M4** cortar dependencias legacy, retirar rutas y código antiguo cuando los consumidores estén migrados. **M5** limpiar y actualizar docs/tests; registrar la deuda cerrada. Los tests legacy pueden cambiarse o eliminarse **después** de sustituir la funcionalidad y demostrar la nueva; no son un veto permanente.

## Corrección explícita a C00
Donde C00 diga «preservar», interpretar **«no romper sin migración y validación»**, nunca «conservar como arquitectura definitiva». Donde diga «paridad», interpretar **«seguridad y continuidad transitoria»**, no «aceptación de V2». Las propuestas C00–C15 se deben reordenar por arquitectura de destino, no por minimizar cambios en código antiguo.

## No confundir con permiso de desplegar
Esta ADR autoriza la **dirección de diseño**. No afirma implementación, tests, merge ni despliegue. Cada patchset de reemplazo exige análisis de dependencias, pruebas, migración de datos y plan de rollback.
