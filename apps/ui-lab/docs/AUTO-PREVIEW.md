# UI Lab — actualización visual y despliegue automático

## Desarrollo

`pnpm --filter @agente/ui-lab dev` inicia Vite en el puerto 5178; HMR refleja cambios locales. En Codespaces, usar puerto privado cuando corresponda.

## GitHub Actions actual

`.github/workflows/ui-lab.yml` hace typecheck y build con cada push relevante a `main` y a las ramas expresamente listadas. Tras un build correcto en `main`, el job `deploy` **se ejecuta automáticamente**; no depende de la variable `UI_LAB_AUTO_DEPLOY`. También puede iniciarse manualmente en `main` con `workflow_dispatch` y `deploy=true`. Requiere secrets `UI_LAB_VERCEL_TOKEN`, `UI_LAB_VERCEL_ORG_ID`, `UI_LAB_VERCEL_PROJECT_ID` y environment `ui-lab`. Las aprobaciones configuradas en el environment pueden bloquear el deploy hasta su autorización.

El despliegue usa `vercel build --prod` y `vercel deploy --prebuilt --prod` **sobre el proyecto dedicado de UI Lab**, no sobre el proyecto de producción de AgntiaPro. No configurar otra integración automática redundante si se quieren evitar builds duplicados.

## Actualización de la página

El botón Buscar actualización consulta `/version.json` y ofrece recargar cuando detecta otro SHA. Recargar vista remonta el iframe. Ninguno de los dos inicia GitHub Actions. Las versiones registradas en `src/versions.ts` son etiquetas de previews, no historial de snapshots.

## Política

El founder mantiene auto-deploy de UI Lab desde `main`. El laboratorio es interno y sintético, no requiere nivel de producción; evitar credenciales y datos reales y verificar builds en Actions.
