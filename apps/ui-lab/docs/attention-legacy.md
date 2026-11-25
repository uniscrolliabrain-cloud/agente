# Atención · vistas legacy retiradas de la demo

**Estado:** retiradas de la demo el 25/11/2026 por decisión del founder.
**Alcance:** solo UI Lab y el clon de demostración. Producción no se tocó.

El founder cubrió estas superficies en otros workspaces, así que **Usuarios, Centro de control,
Operaciones y Workspaces dejan de existir en la demo**. Si vuelves a UI Lab y no las encuentras, no
es un bug: es esta retirada.

## Qué se retiró

| Superficie | Vista interna (`AppView`) | Preview del laboratorio | Componente de producción | Copia archivada en `docs/` |
|---|---|---|---|---|
| Usuarios | `users` | `users` (retirada) | `apps/web/src/components/UsersView.tsx` | [`dashboards/17-equipo/componentes-reales/`](./dashboards/17-equipo/componentes-reales/) |
| Centro de control | `control-center` | `control` · «Control de actividad» (retirada) | `apps/web/src/components/ControlCenterView.tsx` | [`dashboards/08-centro-de-mando/componentes-reales/`](./dashboards/08-centro-de-mando/componentes-reales/) |
| Operaciones | `operations` | `operations` (retirada) | `apps/web/src/components/VerticalSliceOperationsView.tsx` | [`dashboards/10-estudio-de-operaciones/componentes-reales/`](./dashboards/10-estudio-de-operaciones/componentes-reales/) |
| Workspaces | `workspace` | no tenía preview propia (monta `WorkspaceShell`) | `apps/web/src/workspaces/WorkspaceShell.tsx` | [`dashboards/11-apps/componentes-reales/`](./dashboards/11-apps/componentes-reales/) |

Las tres previews (`users`, `control`, `operations`) salieron de `apps/ui-lab/src/registry.tsx`: el
catálogo del laboratorio pasa de 29 a **26** previews.

## Cómo se retiraron

- **Menú lateral de la demo.** `apps/web/src/components/SidebarV2.tsx` acepta el prop
  `hideLegacyViews`. El clon lo enciende desde `apps/web/src/App.tsx` con `Boolean(demoViews)`, así
  que en la demo desaparecen las tres entradas del menú (`Centro de control`, `Operaciones`,
  `Workspaces`) y el acceso de admin a `Usuarios`. Producción no pasa el prop y conserva su menú
  exactamente igual.
- **Acción «Abrir equipo» del centro de mando.** En la demo lleva a `Equipo` (`team`), que es la
  vista vigente; en producción sigue llevando a `Usuarios` como antes.
- **Catálogo del laboratorio.** `registry.tsx` ya no registra `users`, `control` ni `operations`, y
  se retiraron sus imports perezosos.

## Qué NO se hizo

- No se borró ningún componente de `apps/web`: producción sigue montando las cuatro vistas. Su
  retirada de producción es otra campaña, con su propio alcance.
- No se borraron carpetas de documentación. Se conservan como archivo, con una nota
  `NOTA-LEGACY.md` en cada una (ver tabla).
- No se tocó kernel, runtime, cognición, SOP, Event Bus, persistencia, multitenancy, permisos ni
  infraestructura. No hay migraciones ni cambios en Doppler, Fly, Neon o Supabase.

## Reglas para el siguiente agente

1. **No reintroduzcas estas cuatro vistas en la demo** sin una decisión nueva del founder. No es
   código muerto que falte: es una retirada deliberada.
2. Las copias en `componentes-reales/` y `legacy/` son **baseline histórico**: se leen, no se
   actualizan. Sirven para comparar o para un rollback puntual, no como fuente de la UI actual.
3. Si el founder pide retirarlas también de producción, hazlo como campaña aparte: tocar
   `apps/web/src/App.tsx`, `SidebarV2.tsx` y el router/permisos, con su verificación y su despliegue
   autorizado. Nada de eso se hizo aquí.
4. La nomenclatura oficial de pantallas y Apps vive en
   [`dashboards/19-general/NOMENCLATURA-UI-FINAL.md`](./dashboards/19-general/NOMENCLATURA-UI-FINAL.md):
   no la reescribas a partir de esta retirada.
