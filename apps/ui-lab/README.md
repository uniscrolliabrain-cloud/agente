# AgntiaPro UI Lab — laboratorio visual de ingeniería

UI Lab es una aplicación Vite separada en `apps/ui-lab` para visualizar componentes y pantallas reales de AgntiaPro. No es un producto final ni una segunda navegación empresarial. La opción **AgntiaPro completo** carga la aplicación original con su propia navegación.

## Navegación y previsualización

El laboratorio no tiene menú lateral propio. Un selector compacto **Vista** en la barra superior permite cambiar entre las 18 previews registradas en `src/registry.tsx`. Se conservan modos móvil/tablet/PC, zoom, comparación, recarga y pantalla completa. El selector de versiones históricas se retiró del menú anterior; `src/versions.ts` solo define vistas registradas, no snapshots reales. El catálogo de vistas no equivale a los 35 workspaces documentados individualmente.

## Desarrollo

Desde raíz: `pnpm install --frozen-lockfile`, `pnpm --filter @agente/ui-lab typecheck`, `pnpm --filter @agente/ui-lab build`, `pnpm --filter @agente/ui-lab dev`. Vite HMR actualiza durante desarrollo.

## Publicación automática (decisión del founder)

El workflow `.github/workflows/ui-lab.yml` ejecuta typecheck y build en pushes relevantes a `main` y ramas listadas. **En `main`, un push relevante dispara también el job deploy**, si build pasa y existen los secrets dedicados. También permite ejecución manual desde `main` con `deploy=true`. El job utiliza el environment `ui-lab` y el proyecto Vercel independiente configurado con `UI_LAB_VERCEL_TOKEN`, `UI_LAB_VERCEL_ORG_ID` y `UI_LAB_VERCEL_PROJECT_ID`. Si el environment exige aprobación, esta puede frenar la publicación. El workflow no despliega `agntiapro.com` por diseño; hay que configurar correctamente los IDs.

El botón Buscar actualización consulta `version.json`; no despliega. El manifiesto identifica el commit compilado.

## Límites

Las previews pueden usar fixtures o depender de APIs no conectadas. El guard de red bloquea fetch salvo `version.json`, XHR, WebSocket, EventSource y sendBeacon, pero no es un sandbox de seguridad completo. No cargar cuentas ni secretos reales. El iframe actual permite scripts y same-origin: válido solo para este laboratorio interno de código confiable y datos sintéticos. No hay certificación pixel-perfect ni pruebas visuales automatizadas. No se afirma aquí que un despliegue concreto haya terminado: verificarlo en GitHub Actions.
