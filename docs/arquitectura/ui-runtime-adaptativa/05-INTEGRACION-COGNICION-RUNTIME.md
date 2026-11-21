# 05 — Integración con el cerebro existente, sin crear otro

## Código verificado en main (lectura puntual 2026-11-21)
- `apps/server/src/engine/context/cognition-cards.ts`: `assembleCognitionCards`, `selectCognitionCards`, máximo 3 tarjetas, 700 caracteres por body y presupuesto de 700 tokens estimados por bloque; CAS de consumo y tratamiento como datos no instrucciones.
- `apps/server/src/engine/conversation.ts`: `COGNITION_CARD_CHAT_INJECT_V1` llama a `assembleCognitionCards` por tenant/owner/thread/query; emite `cognition.card.injected` y contempla release en fallos. También indica que la resolución de vistas va por HTTP y no emite specs en el turno.
- `apps/server/src/engine/cognition/v2/context.ts`: `ContextServingFacade`, snapshots con referencias/revisiones/watermark/digest/TTL, autorización y revocación.
- `apps/server/src/engine/cognition/v2/runtime.ts`: `CognitionV2Runtime` ensambla proyecciones, cinco memorias, atención, Fast lane, Slow queue, ontology y delivery ledger.
- `apps/server/src/engine/cognition/v2/slow.ts`: Slow asíncrono con trabajos durables, evidencia y clasificador.
- `apps/server/src/engine/cognition/v2/jev-classifier.ts` y `jev-egress.ts`: clasificador con grants, minimización y policy; no presumir JEV activado en producción.
- `apps/server/src/kernel/cognition/card-builder.ts`: convierte pensamientos en tarjetas deterministas con evidencia, attention, provenance, TTL y hash idempotente.
- `apps/server/src/engine/cognition/v2/attention.ts`: ranking por señales de relevancia/urgencia/novedad, scoped al actor.
- `apps/web/src/workspaces/registry.ts`: 35 workspaces identificados.
- `apps/web/src/App.tsx`: `view`, `activeWorkspaceId`, thread activo, chat dock, chat móvil, modales, navegación; estado hoy distribuido en React.
- `packages/domain/src/views.ts`: Zod de siete ViewSpecs.
- `packages/domain/src/view-envelope.ts`: identidad/procedencia/permisos/frescura de vistas.
- `apps/web/src/view/ViewRenderer.tsx`: render de templates programados.
- `apps/server/src/engine/form-builder.ts`: construcción y sugerencias para formularios.

**No se ha certificado end-to-end** que las ramas más recientes estén integradas ni que todos los caminos chat→runtime→UI→ACK estén disponibles. No convertir documentos legacy en verdad de producción.

## Diseño de extensión
1. Registrar componentes semánticos con IDs estables en el frontend y mantener catálogo de capabilities.
2. Añadir eventos de UI al bus existente (versionados, append-only, correlation/causation, tenancy), diferenciando telemetría efímera de hechos de negocio. No inundar el grafo con hover/teclas.
3. Proyectar el estado de sesión UI en un store de runtime; relacionar refs de UI con entidad, actor, hilo, tarea y workspace cuando tenga valor semántico.
4. Para un turno de chat, el runtime recupera estado de sesión + evidencia pertinente y produce **una microtarjeta `ui.context`** con metadata, TTL, scope y capacidades autorizadas.
5. Reutilizar la política de ContextServing y el delivery ledger cuando corresponda; no duplicar cinco memorias, atención ni card store. Revisar si la ontología de tarjetas existente admite `ui.context` antes de extenderla: no inyectar `kind` fuera de schema.
6. La ruta de ViewResolver/ViewEnvelope se une a un protocolo de UI Commands tipados. El runtime decide `navigate/open/applyFilter/setDraftValue`; frontend valida target y confirma ACK.
7. Slow/JEV pueden enriquecer decisiones semánticas asíncronas y documentar outcomes, sin bloquear la primera respuesta del Fast ni conceder autoridad.
8. El estado y los recibos se proyectan en memoria/grafo solo cuando corresponda; la tarjeta de resultado a LAIA es breve, factual y se envía si es relevante.

## Advertencia de integración
Hay potencialmente dos circuitos de tarjetas: el legacy `CognitionCardStore` inyectado por conversación y Cognition V2 con `ContextServingFacade` y `CardDeliveryLedger`. Antes de extender la UI, Codex debe mapear su wiring real y elegir un único contrato canónico o una transición explícita, evitando dobles inyecciones, doble consumo y metadatos incompatibles. Lo mismo para `App.tsx` y ramas de UX móvil.

## No hacer
- No inyectar árboles React, todos los dashboards ni el catálogo completo de 35 workspaces en el prompt Fast.
- No usar el LLM como source of truth de navegación, permisos, tenant o datos.
- No crear segundo motor de RAG ni duplicar kernel.
- No convertir tarjetas en instrucciones ejecutables.
- No añadir UI commands a eventos conversacionales sin ACK ni policy.
- No bloquear Fast esperando a Slow/JEV si no es estrictamente necesario.
