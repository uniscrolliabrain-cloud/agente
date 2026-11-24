# Patchset y rollback (C02/C03)

## Regla de oro

Ningún archivo de `apps/web` se modifica. Ningún archivo del baseline documental
(`componentes-reales/`) se toca. La campaña es aditiva dentro de UI Lab.

## Creado

```
apps/ui-lab/src/command-center-editorial/
├── CommandCenterEditorial.tsx          composición y paridad funcional
├── CommandCenterEditorialPreview.tsx   carga de datos + arnés de estados
├── EditorialFrame.tsx                  marco .cce-root
├── command-center-editorial.css        tokens, composición, motion, responsive, herencia cc-*
├── fonts/                              Fraunces + Manrope (OFL), latin y latin-ext
└── components/
    ├── EditorialHero.tsx
    ├── EditorialBriefing.tsx
    ├── EditorialKpis.tsx
    ├── EditorialFilters.tsx
    ├── EditorialAttention.tsx
    ├── EditorialFeed.tsx
    ├── EditorialWork.tsx               (en marcha + trabajo cerrado)
    ├── EditorialOperational.tsx        (bloques + detalle + hoja móvil)
    ├── EditorialPanels.tsx
    ├── EditorialSheet.tsx              (hoja modal con foco y Escape)
    └── EditorialStates.tsx             (avisos, ejemplo, error, carga, vacío)
```

## Modificado

- `apps/ui-lab/src/registry.tsx`: nueva vista `today-editorial`
  («Inicio · Editorial V2», categoría Trabajo, estado demo) y su import lazy.
  La vista `today` sigue apuntando al componente original.

## Sin tocar (verificado en el diff)

- `apps/web/**` (incluye `CommandCenterView`, `command-center/*`, `index.css`, `AppShell`, workspace 35,
  `ControlCenterView`).
- `apps/ui-lab/src/App.tsx`, `lab.css`, `safety.ts`, `versions.ts`.
- `apps/ui-lab/docs/dashboards/08-centro-de-mando/componentes-reales/**`.
- Rutas, contratos de API, permisos y fixtures compartidos.

## Límites de escritura

- CSS con namespace `cce-*` y todo bajo `.cce-root`; las clases `cc-*` solo se re-visten en ese
  ámbito. Sin `:root`, sin `!important`, sin `z-index` arbitrario (la hoja va a portal con `z-index: 60`).
- Nada de librerías nuevas: solo React, `lucide-react` y el sistema existente.
- `min-width: 0` y `overflow-wrap: anywhere` en todos los contenedores flex/grid.

## Rollback

1. Quitar la entrada `today-editorial` de `registry.tsx` y el import de `TodayEditorial`.
2. Borrar `apps/ui-lab/src/command-center-editorial/`.
3. Sin migraciones, sin cambios de datos, sin endpoints: no hay nada más que revertir.

`main` y la vista `today` no cambian en ningún momento; el laboratorio puede seguir usándose con el
Centro de Mando original.
