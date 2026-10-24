# 14 — Templates reales

> v2 · 2026-10-04 · Estado: audited-deep
> Fuente: repodump apps/web/src/templates/*, view/ViewRenderer.tsx, código real

## Ontología

ViewRenderer, DashboardTemplate, QueueTemplate, placeholders honestos para inbox, board, table, detail, form.

## Estado real

ViewRenderer con assertNever. DashboardTemplate y QueueTemplate reales. Los otros 5 kinds muestran un placeholder honesto.

## Evidencia

De los 7 kinds del schema, solo 2 tienen componente real. No hay tests de render por kind.

## Huecos declarados

- InboxTemplate, BoardTemplate, TableTemplate, DetailTemplate, FormTemplate.
- Test de render por kind.
- assertNever real.

## Huecos profundos (auditoría extendida)

1. **`assertNever` no se usa**: los 5 kinds faltantes caen a un `default` que devuelve un div con texto. No es exhaustividad real.
2. **DashboardTemplate con KPIs hardcodeados**: el spec trae KPIs pero el template no los pinta con formato (currency, percent).
3. **QueueTemplate sin agrupación por columna**: pinta items en lista plana, no por columnId.
4. **Sin soporte de `trend` en KPIs**: `DashboardSpec.kpis[].trend` existe pero el template no lo usa.
5. **Sin soporte de `actions` en QueueSpec**: cada item puede tener hasta 3 actions pero el template solo pinta botones sin onClick.
6. **Sin "estado vacío" en templates**: si el spec no tiene items, se pinta un div vacío sin mensaje.
7. **Sin "loading state"**: los templates reciben spec con datos o sin datos. Sin estado intermedio.
8. **Sin "error state"**: si un campo del spec no cuadra, el template crashea sin boundary.
9. **Sin lazy loading de templates**: todos los templates se importan al cargar la app. Bundle grande.
10. **CSS de templates inline con style={{}}: no hay hoja de estilos dedicada. Duplicación.
11. **Sin "responsive"**: los templates se rompen en móvil.
12. **Sin "dark mode"**: los colores están hardcodeados.
13. **Sin "accessibility"**: sin `role`, sin `aria-*`, sin keyboard navigation.
14. **Sin "focus management"**: al abrir el panel, el foco no va al template.
15. **Sin test de render con spec vacío**: no se prueba el caso de spec sin datos.
16. **Sin test de render con spec lleno**: no se prueba con 100 filas.
17. **Sin "vista de impresión"**: los templates no se pueden imprimir.
18. **Sin "export a PDF"**: no se puede exportar un DashboardSpec a PDF.
19. **Sin "compartir vista"**: un usuario no puede pasar su vista a otro.
20. **`ViewRenderer` recibe `spec: unknown`**: pierde tipado. Debería ser `RuntimeViewSpec | null`.

## Interrelación

Sin templates, la UI servida no muestra nada útil. Depende de 13.

## Riesgos

Spec cambia y template no lo soporta. Template falla con datos vacíos. CSS del template choca con el shell.

## Tipo de fixes

5 componentes. Test de render por kind. assertNever real. Loading/error/empty states. Responsive. Dark mode. Accessibility. Lazy loading.
