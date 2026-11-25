# UI Lab — actualización visual y despliegue automático

## Desarrollo

`pnpm --filter @agente/ui-lab dev` inicia Vite en el puerto 5178; HMR refleja cambios locales. En Codespaces, usar puerto privado cuando corresponda.

## GitHub Actions actual

`.github/workflows/ui-lab.yml` hace typecheck y build con cada push relevante a `main` y a las ramas expresamente listadas. El job `deploy` **no** se ejecuta con un push: solo con `workflow_dispatch` en `main` y `deploy=true` (`if: github.event_name == 'workflow_dispatch' && inputs.deploy`). Requiere secrets `UI_LAB_VERCEL_TOKEN`, `UI_LAB_VERCEL_ORG_ID`, `UI_LAB_VERCEL_PROJECT_ID` y environment `ui-lab`. Las aprobaciones configuradas en el environment pueden bloquear el deploy hasta su autorización.

El preview que se revisa antes de cualquier deploy real es **GitHub Pages**, no Vercel: `.github/workflows/ui-lab-pages.yml` publica el clon navegable de la app en https://uniscrolliabrain-cloud.github.io/agente/ con cada push a `main` que toque el laboratorio. Ver la sección «Publicación» de [`../README.md`](../README.md).

El despliegue usa `vercel build --prod` y `vercel deploy --prebuilt --prod` **sobre el proyecto dedicado de UI Lab**, no sobre el proyecto de producción de AgntiaPro. No configurar otra integración automática redundante si se quieren evitar builds duplicados.

## Actualización de la página

El botón Buscar actualización consulta `/version.json` y ofrece recargar cuando detecta otro SHA. Recargar vista remonta el iframe. Ninguno de los dos inicia GitHub Actions. Las versiones registradas en `src/versions.ts` son etiquetas de previews, no historial de snapshots.

## Política

Pages publica automáticamente desde `main`; Vercel solo bajo `workflow_dispatch`. El laboratorio es interno y sintético, no requiere nivel de producción; evitar credenciales y datos reales y verificar builds en Actions antes de anunciar una publicación.
