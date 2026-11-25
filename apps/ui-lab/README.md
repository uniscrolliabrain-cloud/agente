# AgntiaPro UI Lab — laboratorio visual de ingeniería

UI Lab es una aplicación Vite separada en `apps/ui-lab` para visualizar componentes y pantallas reales de AgntiaPro. No es un producto final ni una segunda navegación empresarial. La opción **AgntiaPro completo** carga la aplicación original con su propia navegación.

## Navegación y previsualización

El laboratorio no tiene menú lateral propio. Un selector compacto **Vista** en la barra superior permite cambiar entre las 29 previews registradas en `src/registry.tsx`. Se conservan modos móvil/tablet/PC, zoom, comparación, recarga y pantalla completa. El selector de versiones históricas se retiró del menú anterior; `src/versions.ts` solo define vistas registradas, no snapshots reales. El catálogo de vistas no equivale a las 34 Apps documentadas individualmente ni al identificador técnico 35 del Centro de Mando. La nomenclatura de las 19 pantallas y las 34 Apps está en [NOMENCLATURA-UI-FINAL.md](./docs/dashboards/19-general/NOMENCLATURA-UI-FINAL.md).

## Desarrollo

Desde raíz: `pnpm install --frozen-lockfile`, `pnpm --filter @agente/ui-lab typecheck`, `pnpm --filter @agente/ui-lab build`, `pnpm --filter @agente/ui-lab dev`. Vite HMR actualiza durante desarrollo.

## Publicación: Pages primero, Vercel aparte

Hay dos destinos y no comparten nada:

- **GitHub Pages (preview antes del deploy real).** `.github/workflows/ui-lab-pages.yml` publica el clon navegable de la app (`full-app.html` → `index.html`, base `/agente/`) en https://uniscrolliabrain-cloud.github.io/agente/ con cada push a `main` que toque `apps/ui-lab/**`, `apps/web/src/**`, `apps/web/public/**`, `packages/domain/src/**` o el lockfile, y también a mano con `workflow_dispatch`. Ahí se ven los workspaces reales (Conocimiento, Documentos, WhatsApp, Apps, Legal) con datos sintéticos y sin backend. Es el sitio para revisar componentes y pantallas antes de desplegar.
- **Vercel (proyecto independiente).** El job `deploy` de `.github/workflows/ui-lab.yml` solo corre con `workflow_dispatch` y `deploy=true` sobre `main`; no se dispara con un push. Usa el environment `ui-lab` y los secrets `UI_LAB_VERCEL_TOKEN`, `UI_LAB_VERCEL_ORG_ID` y `UI_LAB_VERCEL_PROJECT_ID`. Ninguno de los dos flujos despliega `agntiapro.com`.

Los workspaces nuevos entran en el clon por el prop opcional `demoViews` de `apps/web/src/App.tsx`: sin ese prop, producción monta exactamente las mismas vistas de siempre.

El botón Buscar actualización consulta `version.json`; no despliega. El manifiesto identifica el commit compilado.

## Límites

Las previews pueden usar fixtures o depender de APIs no conectadas. El guard de red bloquea fetch salvo `version.json`, XHR, WebSocket, EventSource y sendBeacon, pero no es un sandbox de seguridad completo. No cargar cuentas ni secretos reales. El iframe actual permite scripts y same-origin: válido solo para este laboratorio interno de código confiable y datos sintéticos. No hay certificación pixel-perfect ni pruebas visuales automatizadas. No se afirma aquí que un despliegue concreto haya terminado: verificarlo en GitHub Actions.

## Formación

La nueva sección [Formación · Trabaja con LAIA](./docs/dashboards/20-formacion/README.md) reúne la documentación trasladada desde la rama de los 60 ejercicios: 50 reels, 10 introducciones, UX de biblioteca audiovisual, captions, contratos, seguridad y plan de implementación.

En la demo de Pages, Formación **sí es una vista funcional**: `apps/ui-lab/src/formation-v4/FormationV4Workspace.tsx` se registra en `demoViews.formation` y se abre desde el menú lateral (`showFormation`) y desde el menú general de Conocimiento V1, que navega con `onNavigate`. Las imágenes se resuelven con `import.meta.env.BASE_URL` para servir bajo `/agente/formation/images/`. La documentación de `20-formacion/` describe el plan de 120 cursos, que sigue sin implementar; la superficie montada es la V4 con 12 lecciones de demostración.
