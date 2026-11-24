# Componentes finales — clon documental

Copia **byte a byte** de la implementación entregada. La fuente de verdad es:

```
apps/ui-lab/src/apps-launcher/
```

Este clon existe para revisión, auditoría y archivo: permite leer la implementación final sin abrir
el proyecto y verificar que lo documentado es lo entregado.

## Contenido

| Archivo | Responsabilidad | Ruta original |
|---|---|---|
| `AppsLauncher.tsx` | Raíz: superficies, modalidad de entrada, atajos | `src/apps-launcher/AppsLauncher.tsx` |
| `RestScreen.tsx` | Reposo: reloj, briefing, notificaciones, accesos | `src/apps-launcher/RestScreen.tsx` |
| `LauncherHome.tsx` | Escritorio: favoritas, carpetas, recientes, dock | `src/apps-launcher/LauncherHome.tsx` |
| `AppDrawer.tsx` | Cajón, buscador instantáneo y grupos | `src/apps-launcher/AppDrawer.tsx` |
| `AppIcon.tsx` | Icono con revelado de nombre y selección | `src/apps-launcher/AppIcon.tsx` |
| `LauncherDock.tsx` | Dock inferior | `src/apps-launcher/LauncherDock.tsx` |
| `LauncherFolder.tsx` | Carpeta como diálogo modal | `src/apps-launcher/LauncherFolder.tsx` |
| `RecentApps.tsx` | Pila de aplicaciones recientes | `src/apps-launcher/RecentApps.tsx` |
| `AppTransition.tsx` | Superficie de app y transición desde el icono | `src/apps-launcher/AppTransition.tsx` |
| `LauncherWidgets.tsx` | Briefing, agenda, pendientes y agentes | `src/apps-launcher/LauncherWidgets.tsx` |
| `launcher-catalog.ts` | 35 apps, iconos, carpetas, widgets y datos | `src/apps-launcher/launcher-catalog.ts` |
| `launcher-state.ts` | Estado, modalidad, persistencia y reloj | `src/apps-launcher/launcher-state.ts` |
| `launcher.css` | Tokens, composición, motion y responsive | `src/apps-launcher/launcher.css` |
| `icons/*.webp` | 35 iconos 320×320 del bundle | `src/apps-launcher/icons/` |

## Integridad

`SHA256SUMS` contiene el hash de cada archivo del clon:

```bash
cd apps/ui-lab/docs/dashboards/11-apps/campana-launcher-v3/componentes-finales
sha256sum -c SHA256SUMS
diff -r . ../../../../src/apps-launcher --exclude README.md --exclude SHA256SUMS
```

## Reglas

- No se edita aquí: cualquier cambio va al módulo de la app y se vuelve a copiar.
- Los iconos originales (1024) y los WebP 512 viven en `11-apps/iconos/final/`, no en este clon.
- El registro de la vista (`apps-launcher-v3`) está en `apps/ui-lab/src/registry.tsx`; no se duplica
  aquí porque el clon es del módulo, no del laboratorio.
