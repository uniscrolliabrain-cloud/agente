# 03 — Spec · Centro de Mando

## Objetivo
Vista única de control operativo: KPIs, retención, tickets, obras, agentes,
clientes e insights IA. Sustituye la navegación entre vistas dispersas.

## Alcance
- Solo lectura + acciones IA sobre datos ya existentes.
- No introduce nuevos endpoints en esta fase (los datos llegan por hooks locales).

## Convenciones
- Tokens CSS: --bg, --ink, --border, --muted
- Paleta: #6D5BFF (primario), #111113 (ink), #F8F7FF (surface), #EDE8FF (lavanda),
  #10B981 (ok), #FFE4E6 (riesgo), #FEF3C7 (ámbar)
- Nomenclatura: PascalCase para componentes, useXxx para hooks, tipos en types.ts

## Acciones emitidas (CentroMandoAction)
export-ai, resolve-billing, view-funnel, export-pipeline, view-thread,
view-queue, fix-bot, generate-report, edit-agent, view-logs,
client-action, insight-cta, range-change

## Accesibilidad
- aria-label en secciones
- :focus-visible outline 2px
- prefers-reduced-motion respetado
