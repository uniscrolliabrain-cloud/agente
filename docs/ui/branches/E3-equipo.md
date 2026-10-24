# E3 - Equipo (matriz de permisos)

> **UI_CAMPAIGN_E3_EQUIPO_V1** · Última actualización: 2026-10-03.
> Estado: HECHO.

## Objetivo

Matriz editable `Resource × Action` con toggles. Fila de recurso con `sticky: left`. Filas bloqueadas con `opacity: 0.5`.

## Ficheros nuevos (2)

- `apps/web/src/components/PermissionMatrix.tsx`.
- `tests/permissions.test.ts`.

## Ficheros modificados (3)

- `apps/web/src/components/UsersView.tsx`.
- `apps/web/src/components/UserModal.tsx`.
- `apps/web/src/index.css`.

## Nota sobre D01

`roleIds: string[]` (D01) va en un branch aparte `feat/multi-role`, fuera de la campaña. `UserModal.tsx` queda preparado con marca `E3_USERMODAL_ROLEIDS_V1`.

## Verificación

- `PermissionMatrix.tsx` existe.
- `UsersView.tsx` tiene `WIRE_USERS_MATRIX_V1`.
- `UserModal.tsx` tiene `E3_USERMODAL_ROLEIDS_V1`.
- `index.css` tiene `E3_PERMISSION_MATRIX_CSS_V1`.

**Fin de E3.**