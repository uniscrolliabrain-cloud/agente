# E1 - Conocimiento por rol

> **UI_CAMPAIGN_E1_CONOCIMIENTO_V1** · Última actualización: 2026-10-03.
> Estado: HECHO.

## Objetivo

Board de memorias agrupado por categoría o por rol. Filtros por categoría, rol y búsqueda. Detección de duplicados con Jaccard + checksum exacto.

## Ficheros nuevos (3)

- `apps/web/src/lib/groupMemories.ts`.
- `apps/web/src/components/MemoryBoard.tsx`.
- `tests/memory-board.test.ts`.

## Ficheros modificados (2)

- `apps/web/src/components/MemoryView.tsx`.
- `apps/web/src/index.css`.

## Decisiones clave

- D09: umbral 0.6, checksum exacto primero.

## Verificación

- `groupMemories.ts` y `MemoryBoard.tsx` existen.
- `MemoryView.tsx` tiene `WIRE_MEMORY_BOARD_V1`.
- `index.css` tiene `E1_MEMORY_BOARD_CSS_V1`.

**Fin de E1.**