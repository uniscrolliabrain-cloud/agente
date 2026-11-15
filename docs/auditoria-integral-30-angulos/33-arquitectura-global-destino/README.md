# Arquitectura global de destino — reauditoría V2

## Cinco planos separados
1. **Experience plane:** Chat/Voice/Anam/LAIA, workspaces, presentador, accesibilidad; no ejecución.
2. **Cognition plane:** FastConversationV2, tarjetas precargadas, Slow LLM, razonamiento, RAG/memorias con provenance; no autoridad.
3. **Authority plane:** identidad, tenancy, mandatos, políticas, aprobaciones, capacidades y presupuestos; fail-closed.
4. **Execution plane:** SOPs/skills/DAG, workers, adaptadores, outbox, idempotencia, retries, compensaciones y receipts.
5. **Domain plane:** 14 bounded contexts con datos, ontologías y procesos propios; conectados por contratos y eventos, no imports privados entre hermanos.

## Diseño de integración universal
```text
LAIA / humanos / workspaces
        ↓ intent tipado
FastConversationV2 → IntentBridge → Kernel/Policy/Approval
                                         ↓ autorización
                           Capability Registry / Planner
                                         ↓
                            SOP / DAG / Worker / Outbox
                                         ↓
                         Domain Adapter (1 de N repos)
                                         ↓
                     Domain Result / Evidence / Receipt
                                         ↓
                          Event Bus → ProgressProjector
                                         ↓
                              LAIA / workspace / audit
```

## Invariantes
- El padre es dueño de identidad y política transversal; el hijo verifica la delegación y conserva sus reglas específicas.
- Cada efecto lleva idempotency key, tenant, principal, scope, revisión esperada y aprobación si procede; el resultado diferencia `requested`, `accepted`, `executed`, `verified`.
- No compartir directamente tablas entre hijos; emplear eventos mínimos, consultas tipadas o proyecciones autorizadas.
- Ningún hijo puede ampliar permisos del padre; ninguna UI crea permiso por renderizar una acción.
- `CapabilityBundle` versionado por repo debe declarar schemas, efectos, límites, seguridad, observabilidad, coste, compatibilidad, documentación y lifecycle.
- La integración ha de funcionar sin LLM: humano→UI→runtime→dominio→resultado; después añadir slow y fast.
- Eventos at-least-once y consumidores idempotentes; no prometer exactly-once distribuido.
- Los estados de chat son proyecciones de hechos confirmados, no simulaciones engañosas de progreso.
- Contratos y vocabulario requieren CI de compatibilidad semántica, no solo TypeScript compila.

## Cuestiones nuevas que los 30 ángulos deben resolver
**A. Léxico/ontología:** ¿`OntologyBundle` soporta 14 vocabularios con colisiones, alias y versionado? ¿Se valida en bootstrap y también al cargar bundles nuevos? ¿Dónde vive la verdad del nombre?
**B. Capability Registry:** ¿puede negociar schemas por versión y validar inputs/outputs, o sigue aceptando `unknown`? ¿Cómo se revocan capacidades?
**C. Policy:** ¿hay un guard anterior que justifique el allow por rol vacío? ¿Cómo evitar bypass por composición interdominio?
**D. Executor:** ¿qué significa `succeeded` si un paso obligatorio fue omitido? ¿Cómo distinguir éxito técnico, negocio y compensación?
**E. Identity:** ¿cómo se transmite mandato entre padre, hijo, proveedor y operador regulado?
**F. Event Bus:** ¿cómo se evitan colisiones de nombres y se versionan 14 familias de eventos?
**G. Memory:** ¿cómo se indexan hechos de dominios distintos sin filtrar datos o mezclar certezas?
**H. UX:** ¿cómo proyecta LAIA el estado de trabajos distribuidos con latencia real?
**I. Cost:** ¿cómo se presupuestan recursos compartidos, LLM, voz, herramientas y APIs por tenant?
**J. Recovery:** ¿cómo reanudar una saga interdominio sin repetir cobros, mensajes ni cambios externos?
**K. Compliance:** ¿cómo se aplican jurisdicción, retención y revisión profesional sin convertir kernel en código de seguros/legal?
**L. Evolution:** ¿cómo añadir un nuevo hijo y retirar una versión antigua sin tocar las 14 integraciones previas?

## Estado de esta entrega
Solo documentación de arquitectura, no certificación de los 30 ángulos ni auditoría de los 14 códigos. Ningún código modificado, ningún test ejecutado, ningún merge. La reauditoría seguirá con inventario de código y crosswalk de léxicos antes de propuestas de patchsets.
