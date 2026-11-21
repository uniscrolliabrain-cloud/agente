# 26 — multijugador humano agente con presencia

> FUTURO / BRAINSTORM. No implementado por esta ficha. La inspiración no demuestra éxito comercial en AgntiaPro.

## Experiencia y caso
Presencia y edición con actores humanos y agentes. Ejemplo: Dos usuarios revisan una misma tarea. La composición debe permanecer reversible y comprensible para usuarios de microempresas.

## Inspiración
Figma, Liveblocks. Investigar sus decisiones de UX, limitaciones, documentación y licencias antes de escoger dependencia.

## Stack candidato
Yjs, WebSocket, Postgres. Reutilizar React/Vite/Tailwind, Zod, Postgres/Neon, ViewEnvelope, ViewRenderer, kernel, grafo, SOP executor y AG-UI existentes. No introducir un segundo runtime ni un segundo RAG.

## Implementación paso a paso
1. Auditar rama main y ramas recientes: App.tsx, workspace registry, ViewRenderer, contracts, conversation, cognition V2, kernel, eventos y componentes UX; detectar implementaciones equivalentes.
2. Especificar `UXCapabilityManifest` con `schemaVersion`, `componentId`, `workspaceId`, `allowedOperations`, `requiredPermissions` y `renderVariant`. Extender los contratos existentes, no duplicarlos.
3. Añadir reducer/selector programado: entradas de contexto y preferencias validadas, salida de layout/operación determinista. Ningún LLM genera código ni modifica permisos.
4. Emitir eventos semánticos con `tenantId`, `actorId`, `sessionId`, `correlationId`, `revision`; guardar estado efímero separado de hechos de negocio.
5. Validar target, revisión y capabilities en runtime; frontend aplica UICommand tipado y devuelve ACK. Acciones empresariales pasan por SOP/approval y recibos.
6. Integrar atención y tarjetas cognitivas solo si aporta contexto al turno; Fast/LAIA recibe proyección de pocos tokens, Slow/JEV trabajan asíncronamente.
7. Probar prototipo ACME, instrumentar métricas y habilitar feature flag con rollback.

## Contratos de ejemplo
```ts
type UXCapabilityManifest = {
  schemaVersion: 1;
  id: 'multijugador-humano-agente-con-presencia';
  componentId: string;
  workspaceId?: string;
  allowedOperations: string[];
  requiredPermissions: string[];
};
type UXDecision = { id: string; expectedRevision: number;
  outcome: 'proposed'|'applied'|'rejected'|'stale'; reason: string };
```

## Superficies y archivos a inspeccionar
`apps/web/src/App.tsx`, `apps/web/src/workspaces/registry.ts`, `apps/web/src/view/ViewRenderer.tsx`, `packages/domain/src/views.ts`, `packages/domain/src/view-envelope.ts`, `apps/server/src/engine/conversation.ts`, `apps/server/src/engine/cognition/v2/`, `apps/server/src/kernel/`. Proponer paths nuevos solo tras auditoría de ramas.

## Pruebas y riesgos
Contract tests Zod; permisos cross-tenant, multiusuario, revocación, stale ACK, idempotencia; E2E móvil con teclado, accesibilidad, reduced motion y reconexión; medir pasos, tiempo, errores, p95, tokens y satisfacción. Riesgos: estado desincronizado, complejidad, filtración de datos y personalización intrusiva. Mitigar con consentimiento cuando proceda, previews, rollback y trazabilidad.

## Decisión futura
¿Existe ya en código? ¿Qué mejora medible produce? ¿Qué dependencias nuevas justifica? ¿Cómo se revierte? No autorizar implementación desde este brainstorming.
