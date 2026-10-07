# E2 - Documentos (árbol + multi-upload)

> **UI_CAMPAIGN_E2_DOCUMENTOS_V1** · Última actualización: 2026-10-03.
> Estado: HECHO.

## Objetivo

Árbol de documentos con `<details>` nativo. Multi-upload con máximo 3 concurrentes, progreso por fichero, reintento por fichero.

## Ficheros nuevos (3)

- `apps/web/src/components/DocumentTree.tsx`.
- `apps/web/src/components/MultiUpload.tsx`.
- `tests/reingest.test.ts`.

## Ficheros modificados (3)

- `apps/web/src/api/files.ts` (XHR con progreso).
- `apps/web/src/components/DocumentsView.tsx`.
- `apps/web/src/index.css`.

## Verificación

- `DocumentTree.tsx` y `MultiUpload.tsx` existen.
- `api/files.ts` tiene `E2_UPLOAD_PROGRESS_V1`.
- `DocumentsView.tsx` tiene `WIRE_DOCS_TREE_UPLOAD_V1`.
- `index.css` tiene `E2_DOCS_CSS_V1`.

**Fin de E2.**