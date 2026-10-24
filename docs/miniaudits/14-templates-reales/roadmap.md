# Roadmap — 14 templates reales

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
7 templates cubren el 90% del trabajo de una pyme.

## 2. Estado verificado
- DashboardTemplate y QueueTemplate reales.
- 5 kinds con placeholder honesto.
- Fuente: repodump apps/web/src/templates/*.

## 3. Huecos contra producción
- InboxTemplate, BoardTemplate, TableTemplate, DetailTemplate,
  FormTemplate.
- Sin tests de render por kind.
- assertNever no garantiza exhaustividad.

## 4. Objetivo
Los 7 templates reales.

## 5. Fronteras
- No drag & drop complejo.

## 6. Conexiones
- Depende de: 13.
- Archivos compartidos: templates/*, view/ViewRenderer.tsx.

## 7. Principios del PRODUCT.md
UI servida.

## 8. Cómo se verifica el cierre
- 7 tests de render por kind.
- assertNever real.
