# AgntiaPro UI Lab
Laboratorio de **componentes reales importados desde `apps/web/src`**. No duplica la implementación de las pantallas. Catálogo de 13 superficies observadas en `App.tsx` y landing; **no implica que las 34 workspaces futuras estén implementadas**.

## Ejecución
Desde raíz del monorepo: `pnpm install`, `pnpm --filter @agente/ui-lab dev`, `pnpm --filter @agente/ui-lab build`. Node >=22.6 y pnpm 11.

## Seguridad y límites
No configurar secrets de producción. El laboratorio intercepta llamadas fetch same-origin a `/api` para evitar operaciones reales; algunos componentes de producción necesitan APIs y mostrarán loading/error, **no son clones funcionales completos**. Las pantallas con fixtures son Conocimiento y Tareas; el Studio tiene demo interna. La landing es el componente original y puede enlazar fuera del lab: no usar enlaces externos para probar acciones. La intercepción de fetch **no es una frontera de seguridad completa**: el acceso al despliegue debe protegerse, y futuras dependencias deben auditarse por XHR/WebSocket/URLs externas antes de habilitarlas. No montar backend real en el mismo origen.

## GitHub Actions
`ui-lab.yml` tiene build manual y job de despliegue Vercel solo bajo `workflow_dispatch` con `deploy=true`. Para despliegue hacen falta secrets dedicados `UI_LAB_VERCEL_TOKEN`, `UI_LAB_VERCEL_ORG_ID`, `UI_LAB_VERCEL_PROJECT_ID`. **El project ID debe ser de un proyecto Vercel nuevo**, nunca el de producción. Proteger acceso desde Vercel Deployment Protection según el plan.

## Registro
`src/registry.tsx` enumera las pantallas. Añadir cada nueva pantalla con import del componente original y adaptador de datos si es necesario. No copiar código ni prometer conexión real. El viewport de la barra es una simulación CSS en el mismo DOM; el modo móvil **no sustituye pruebas con navegador de viewport real**.

## Pendiente de QA
El código fue escrito por GitHub API, sin entorno de ejecución local. Ejecutar typecheck/build y revisar errores de importación o contratos de props. Tomar capturas en móvil y PC, verificar assets de landing, tipografías, scroll y dependencias. No publicar antes de revisar.
