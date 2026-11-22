# AgntiaPro UI Lab (integración aislada)

Aplicación Vite independiente en `apps/ui-lab` que importa componentes existentes de `apps/web/src` sin modificar el frontend productivo. **No es un clon funcional íntegro ni un snapshot de la web publicada**: las pantallas dependientes del backend pueden mostrar estados vacíos o errores. El catálogo incluye la aplicación original de `main`, no la landing premium que permanece en otra rama.

## Desarrollo y QA
Desde la raíz: `pnpm install --frozen-lockfile`, `pnpm --filter @agente/ui-lab typecheck`, `pnpm --filter @agente/ui-lab build`, `pnpm --filter @agente/ui-lab dev`. Revisar escritorio y móvil con navegador real antes de compartir la URL. La selección de versiones registra **vistas**, no historial de snapshots. La comparación muestra dos vistas actuales.

## Aislamiento obligatorio
Desplegar en **otro proyecto Vercel y otro origen**; nunca montar en `agntiapro.com`. No suministrar credenciales, tokens, variables de entorno de producción ni cookies reales. El laboratorio deniega peticiones de red de componentes importados por `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` y `sendBeacon`; permite `fetch` de `/version.json` para comprobar nuevas versiones. La CSP restringe conexiones. **Estas defensas no equivalen a aislamiento de seguridad completo**, especialmente para recursos HTML, navegación, almacenamiento y nuevos canales de red. Proteger el despliegue con controles de acceso de Vercel; no usarlo con datos sensibles.

## Vercel
Crear un proyecto separado desde el mismo repo y elegir **Root Directory `apps/ui-lab`**. Framework: Vite; build `pnpm --filter @agente/ui-lab build` desde raíz si Vercel detecta el workspace, o configurar el comando apropiado al root elegido; output `dist`. Validar una compilación real de Vercel antes de activar publicación. No reutilizar el Project ID de producción.

## GitHub Actions
`.github/workflows/ui-lab.yml` compila el laboratorio en `main` y en la rama aislada. El deploy está desactivado por defecto y solo se ejecuta desde `main` con `workflow_dispatch` y `deploy=true` (GitHub Actions → UI Lab → Run workflow); requiere secretos dedicados `UI_LAB_VERCEL_TOKEN`, `UI_LAB_VERCEL_ORG_ID` y `UI_LAB_VERCEL_PROJECT_ID`.

## Publicación y actualización
El botón **Buscar actualización** solo consulta `version.json`; **no inicia un despliegue**. Para publicar una versión, usar el workflow manual protegido de GitHub Actions o configurar auto-deploy de Vercel únicamente para el proyecto UI Lab. No incorporar tokens de GitHub ni Vercel al navegador. El laboratorio reproduce el código de la revisión que se compila; la fidelidad con el deploy público requiere verificar el commit realmente desplegado, sus variables, assets y los estados de datos.

## Limitaciones conocidas
No hay pruebas visuales automatizadas, versiones persistentes ni fidelidad pixel-perfect certificada. Las pantallas con APIs desconectadas son inspecciones visuales, no flujos operativos. No se ha desplegado este proyecto todavía.
