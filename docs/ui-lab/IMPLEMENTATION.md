# UI Lab — Entrega inicial
Rama: `feat/agntiapro-ui-lab`. Basada en `feat/ui-conocimiento-notion-like-c01`. **No se ha fusionado ni desplegado.**

## Inventario real de la aplicación
En `apps/web/src/App.tsx` se importan: Landing, CommandCenterView, TasksView, DocumentsView, MemoryView, ProjectsView, ControlCenterView, UsersView, WhatsAppView, TeamView, VerticalSliceOperationsView, CentroMandoWorkspace, BusinessCommandStudio, ChatPanel, WorkspaceShell. El catálogo registra **13 vistas** de alto nivel; no confundir con «todas las 34 workspaces», que no están todas desarrolladas ni necesariamente son componentes independientes. ChatPanel, shell, modales y componentes anidados requieren catálogo específico y no están aún disponibles como previews independientes.

## Entregado
- App independiente `apps/ui-lab`, selector de 13 vistas reales importadas del repositorio, móvil/tablet/PC, zoom, recarga, modo fullscreen y búsqueda.
- Datos ficticios para Conocimiento y Tareas; Studio usa su propio demo. Vistas con API renderizan su estado de error/carga; **no son clones funcionales completos**.
- Interceptor de fetch `/api` mismo origen para evitar llamadas accidentales. No proporciona sandbox seguro completo frente a XHR/WebSocket y navegación externa; revisar antes de abrir acceso público.
- Workflow GitHub Actions con build automático de la rama y despliegue **solo manual** `workflow_dispatch deploy=true`. Usa secrets **dedicados** del UI Lab y environment `ui-lab`. No reutilizar proyecto Vercel de producción.

## Pendiente crítico
1. Ejecutar workflow build y resolver fallos de TS, imports, Vite y lockfile. No se ejecutaron tests desde esta sesión.
2. Comprobar assets públicos de landing: si faltan, configurar `publicDir` en Vite para `apps/web/public` y validar rutas.
3. Validar import de CSS global, fuente y tokens; verificar que los estilos del laboratorio no se mezclan con las vistas.
4. Revisar vista por vista los componentes dependientes de API; crear fixtures y adaptadores tipados para cada uno si se desea una clonación visual completa, sin cambiar componentes de producción.
5. Incorporar los componentes de chat, sidebar, topbar, modales, overlays y workspaces secundarios al catálogo.
6. Proteger el proyecto Vercel mediante Deployment Protection. La página `noindex` no protege privacidad.
7. Comprobar responsive con viewport real; el zoom CSS del lab no reproduce por sí solo media queries de viewport móvil.

## Pasos del propietario para el deploy
Crear proyecto Vercel nuevo `agntiapro-ui-lab`, enlazar repo, root directory `apps/ui-lab`, y copiar **solo** sus tres valores en GitHub Actions secrets `UI_LAB_VERCEL_TOKEN`, `UI_LAB_VERCEL_ORG_ID`, `UI_LAB_VERCEL_PROJECT_ID`. Crear environment `ui-lab` con aprobación manual si se desea. Probar primero workflow con `deploy=false`; solo con build verde y protección activada ejecutar `deploy=true`. No hacer merge a main para el laboratorio hasta decidir su política de publicación.
