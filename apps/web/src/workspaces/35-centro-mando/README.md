# 35 — Centro de Mando

Workspace de control operativo unificado. Vista unica de KPIs, retencion,
tickets criticos, obras activas, performance de agentes, top clientes e
insights IA para todas las empresas del tenant.

## Estructura

- CentroMandoWorkspace.tsx — componente raiz. Acepta data, onAction, initialRange.
- data.ts — CENTRO_MANDO_MOCK, RANGE_LABEL, RANGE_START.
- types.ts — CentroMandoData, CentroMandoAction, y tipos de dominio.
- centro-mando.css — estilos scoped bajo .cm-root.
- docs/ — ui-map, roadmap, spec.
- index.ts — export default from './CentroMandoWorkspace'.

## Uso

  import CentroMandoWorkspace from '@/workspaces/35-centro-mando';

  <CentroMandoWorkspace />

## Acciones emitidas (CentroMandoAction)

export-ai, resolve-billing, view-funnel, export-pipeline, view-thread,
view-queue, fix-bot, generate-report, edit-agent, view-logs,
client-action, insight-cta, range-change.

## Estado

- UI: completa con datos mock.
- Backend: pendiente. CentroMandoData se servira desde un hook de datos real.
