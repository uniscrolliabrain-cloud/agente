# UI Lab — estado de implementación (23-11-2026)

## Estado vigente

La aplicación está presente en `main` bajo `apps/ui-lab`. Los textos sobre la rama original `feat/agntiapro-ui-lab` y sobre una entrega sin fusionar son históricos y no describen el árbol actual.

El catálogo `src/registry.tsx` registra 18 vistas, entre ellas AgntiaPro completo, landing, Studio, Centro de Mando, Chat, Tareas, Equipo y Comunicaciones. El inventario documental de 35 workspaces es distinto de estas previews y no garantiza 35 vistas independientes.

## Decisión de navegación

Se retira el menú lateral propio de UI Lab, porque duplicaba y desalineaba la navegación real de AgntiaPro. La selección de vistas pasa a un único control compacto en la barra superior. En `full-app` se carga `apps/web/src/App`, con la navegación propia del producto. Se mantienen zoom, dispositivos, comparación, fullscreen, recarga y consulta de versión. El laboratorio no decide el menú de negocio.

## CI/CD vigente

El workflow `.github/workflows/ui-lab.yml` hace build en pushes relevantes a `main` y ramas configuradas. En `main`, el job de deploy se ejecuta automáticamente tras build correcto; también admite ejecución manual con `deploy=true`. Requiere secrets Vercel dedicados y puede estar sujeto a aprobaciones del environment `ui-lab`. La decisión del founder es conservar este despliegue automático.

## Alcance de ingeniería

Es un laboratorio de visualización, no una réplica de producción. Las vistas pueden ser fixtures, demos o pantallas con dependencias API. Los interceptores de red y la separación de origen son precauciones básicas, no garantías de aislamiento completo. No se han ejecutado pruebas de navegador en esta revisión; el resultado del build y despliegue se comprueba en GitHub Actions.

## Próximas mejoras opcionales

- Capturas de regresión responsive de las vistas más utilizadas.
- Mejorar comparación a igual viewport.
- Mantener la documentación y el catálogo sincronizados al incorporar pantallas.
- No introducir un segundo menú lateral ni categorías de navegación propias del laboratorio.
