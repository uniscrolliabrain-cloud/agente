# 28 — ui multicapa por profundidad cognitiva

> BRAINSTORM FUTURO. Hipótesis, no funcionalidad aprobada ni implementada.

## Experiencia
Resumen, evidencia y auditoría de una misma entidad. Ejemplo: De KPI a factura y recibo.. Mantener control manual, reversibilidad, accesibilidad y permisos.

## Referencias de inspiración
Grafana drilldown, progressive disclosure. Investigar implementaciones, documentación, adopción y licencias; no asumir compatibilidad ni éxito trasladable.

## Stack propuesto
ViewSpec detail, evidence drawer; React/Vite/Tailwind, Zod, Postgres, kernel/event bus, AG-UI, ViewEnvelope y cognition V2 existentes. Instalar nuevas librerías solo tras auditoría y licencia.

## Plan de código detallado
1. Auditar main y ramas de cognition/kernel/chat/UX; localizar código existente y definir diferencias.
2. Definir un `UXManifest` versionado con ID estable, tipos de componentes, capacidades, esquema de datos y permisos; no serializar JSX ni DOM.
3. Resolver datos en runtime con identidad autenticada y referencias de entidades; validar policy y revisions. La UI no decide autoridad.
4. Implementar un selector determinista que traduzca contexto/preferencias en un ViewSpec, layout o UICommand permitido; no generar React por LLM.
5. Frontend registra componentes y aplica operaciones con expectedRevision y ACK. Las mutaciones de negocio requieren SOP, aprobación y recibo.
6. Guardar eventos semánticos con tenant/actor/session/correlation; separar preferencias, telemetría, snapshots y memoria de negocio.
7. Context Serving selecciona microtarjetas de pocos tokens para LAIA solo cuando aporten información; Slow/JEV asíncronos, sin bloquear Fast.
8. Feature flag, pruebas con ACME, medición de impacto y rollback.

## Contrato ilustrativo
```ts
type UXManifest = {schemaVersion:1; kind:'ui-multicapa-por-profundidad-cognitiva'; componentId:string;
  allowedOperations:string[]; requiredPermissions:string[]};
type UIChange = {commandId:string; sessionId:string; expectedRevision:number;
  targetId:string; operation:string; payload:unknown};
```
Definir discriminated unions Zod reales; estos tipos no afirman existencia en repositorio.

## Puntos de integración
`apps/web/src/App.tsx`, `apps/web/src/workspaces/registry.ts`, `apps/web/src/view/ViewRenderer.tsx`, `packages/domain/src/views.ts`, `packages/domain/src/view-envelope.ts`, `apps/server/src/engine/conversation.ts`, `apps/server/src/engine/cognition/v2/`, `apps/server/src/kernel/`. Reconciliar rutas con ramas más recientes.

## Pruebas y seguridad
Unit tests del selector; contract tests; aislamiento tenant/actor, policy revision, revocación, stale command, duplicados, reconexión; Playwright móvil/escritorio, accesibilidad, reduced-motion; p50/p95, errores, finalización y tokens. Evitar dark patterns, UI inestable, fugas y sobrecarga cognitiva.

## Preguntas abiertas
¿Ya existe? ¿Qué métrica mejora? ¿Qué coste añade? ¿Cómo se explica y revierte? ¿Se puede resolver con templates existentes? No implementar todavía.
