# 14 — Templates reales

> v1 · 2026-10-04 · Estado: audited
> Fuente: repodump apps/web/src/templates/*, view/ViewRenderer.tsx

## Ontología

ViewRenderer, DashboardTemplate, QueueTemplate, y placeholders honestos
para inbox, board, table, detail, form.

## Estado real

ViewRenderer con assertNever. DashboardTemplate y QueueTemplate reales.
Los otros 5 kinds muestran un placeholder honesto ("Este tipo de vista se
sirve pero aún no tiene template dedicado").

## Evidencia

De los 7 kinds del schema, solo 2 tienen componente real. Faltan 5. No hay
tests de render por kind.

## Huecos

InboxTemplate, BoardTemplate, TableTemplate, DetailTemplate, FormTemplate.
Test de render por kind con datos mínimos y vacíos. assertNever real que
no se alcance en producción.

## Interrelación

Sin templates, la UI servida no puede mostrar nada útil. Depende de 13.

## Riesgos

Spec cambia y el template no lo soporta. Template falla con datos vacíos.
CSS del template choca con el shell.

## Tipo de fixes

5 componentes. Test de render por kind. assertNever real.
