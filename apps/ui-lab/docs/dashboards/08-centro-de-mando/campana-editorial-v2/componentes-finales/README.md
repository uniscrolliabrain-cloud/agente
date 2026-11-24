# Componentes finales — clon documental

Copia **byte a byte** de lo que se entrega en la campaña editorial V2. La fuente de verdad sigue
siendo el código de la app:

```
apps/ui-lab/src/command-center-editorial/
```

Este clon existe para revisión, auditoría y archivo: permite leer la composición final sin abrir el
proyecto, comparar con `componentes-reales/` y verificar que lo documentado es lo entregado.

## Contenido

| Archivo | Responsabilidad |
|---|---|
| `CommandCenterEditorial.tsx` | Composición completa y contratos de la vista |
| `CommandCenterEditorialPreview.tsx` | Carga real (`getCompanyOverview`), polling y arnés `?cce-state=` |
| `EditorialFrame.tsx` | Marco aislado `.cce-root` |
| `command-center-editorial.css` | Tokens, composición, motion, responsive y re-vestido de `cc-*` |
| `components/EditorialHero.tsx` | Identidad, rol, fecha y acciones con permisos |
| `components/EditorialBriefing.tsx` | Briefing con `briefingText` reutilizado |
| `components/EditorialKpis.tsx` | Cuatro cifras y su relación con los filtros |
| `components/EditorialFilters.tsx` | Cinco perspectivas sobre un único `CommandFilter` |
| `components/EditorialAttention.tsx` | Tareas que esperan decisión o fallaron |
| `components/EditorialFeed.tsx` | «Lo que te has perdido» desde `tasks.recent` |
| `components/EditorialWork.tsx` | En marcha y trabajo cerrado |
| `components/EditorialOperational.tsx` | Seis bloques de estado con detalle y hoja móvil |
| `components/EditorialPanels.tsx` | Equipo y agentes con permisos |
| `components/EditorialSheet.tsx` | Hoja modal con foco, Escape y scroll lock |
| `components/EditorialStates.tsx` | Aviso de ejemplo, error, carga y vacíos |
| `fonts/*.woff2` | Fraunces y Manrope (OFL) self-hosted |

## Integridad

`SHA256SUMS` contiene el hash de cada archivo de este clon. Para comprobar que coincide con el
código entregado:

```bash
cd apps/ui-lab/docs/dashboards/08-centro-de-mando/campana-editorial-v2/componentes-finales
sha256sum -c SHA256SUMS
diff -r . ../../../../src/command-center-editorial --exclude README.md --exclude SHA256SUMS
```

## Reglas

- No se edita aquí: cualquier cambio va al módulo de la app y se vuelve a copiar.
- El build del artifact (`2bda0e581941`) se generó con este mismo código; el manifiesto del ZIP
  lleva el SHA del commit, no el de estos archivos, para evitar confusión.
- `componentes-reales/` queda intacto como baseline de la auditoría.
