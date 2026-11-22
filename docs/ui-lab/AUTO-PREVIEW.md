# UI Lab: HMR, publicación automática y Refresh

## 1. Desarrollo instantáneo sin deploy
`pnpm --filter @agente/ui-lab dev --host 0.0.0.0`. Vite HMR actualiza la vista al guardar. En Codespaces, abrir el puerto 5178 y limitar la visibilidad del puerto a privado.

## 2. Push -> CI -> publicación de preview (opcional)
El workflow compila y ejecuta typecheck en cada push a `feat/agntiapro-ui-lab`. El job `deploy` se habilita solo con la variable de repositorio `UI_LAB_AUTO_DEPLOY=true` **o** con ejecución manual `deploy=true`. Requiere secrets dedicados y el environment `ui-lab`. Publica a la URL estable del proyecto Vercel **UI Lab**; nunca usa los IDs de AgntiaPro producción.

Para habilitar:
1. Crear un proyecto Vercel aislado y protegido, con directorio raíz `apps/ui-lab`.
2. Crear secrets `UI_LAB_VERCEL_TOKEN`, `UI_LAB_VERCEL_ORG_ID`, `UI_LAB_VERCEL_PROJECT_ID`.
3. Crear environment `ui-lab` y opcionalmente requerir aprobación para despliegues.
4. Ejecutar manualmente `deploy=true` para validar la primera publicación.
5. Solo después, establecer variable `UI_LAB_AUTO_DEPLOY=true` para despliegues tras push. Con la variable ausente o false, el job no se ejecuta.
6. Desactivar inmediatamente poniendo `UI_LAB_AUTO_DEPLOY=false`.

**Importante:** el deploy usa `--prod` únicamente en el proyecto independiente UI Lab para mantener URL estable; esto NO despliega la aplicación principal. Evitar habilitar el despliegue automático del proyecto Vercel por integración GitHub simultáneamente, o se duplicarán builds.

## 3. Botón Refresh
`version.json` contiene el SHA de Git y timestamp del build. El frontend lo consulta sin caché cada 30 s y al volver a la pestaña. Si detecta nueva versión, ofrece «Cargar actualización» que recarga la página. «Comprobar» solo consulta el manifiesto. «Recargar vista» vuelve a montar el iframe, no ejecuta ningún workflow ni backend. No se ponen tokens en frontend.

## 4. Versiones visuales
`src/versions.ts` declara variantes reales registradas; cada una apunta a una preview existente. No almacena snapshots automáticamente. Para conservar V2/V3, crear componente propio o rama/tag y registrar su import de forma explícita. El selector de versiones no simula guardado de cambios.

## 5. Seguridad
No conectar el UI Lab a cuentas owner reales. Proteger la URL de Vercel. `noindex` no equivale a autenticación. No configurar credenciales de backend, y auditar conexiones externas del frontend antes de compartirlo.
