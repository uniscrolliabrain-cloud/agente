# Alcance de publicación de AgntiaPro

La landing y sus seis páginas legales describen el sitio informativo y el contacto por correo. La web no ofrece altas, contratación, formularios, acceso al panel ni la activación de herramientas. El titular indicó que no hay clientes y aprobó la redacción de las páginas antes de esta adaptación de alcance. La identidad y el canal de contacto proceden de la rama autorizada.

El despliegue manual con `scope=site` publica únicamente `apps/site` en Vercel tras el gate existente. Los builds y pruebas siguen ejecutándose. El despliegue de API y worker en Fly queda fuera de esta publicación. La landing no enlaza la aplicación operativa.

Antes de activar el servicio para clientes se mantiene el plan de trabajo de la campaña, con inventario de tratamientos y proveedores de la aplicación, bases, retención y transferencias, gestión de derechos, contratos y DPA cuando correspondan, y verificación de canales de IA y conectores. La publicación informativa no activa esas superficies.

## Verificación

- Los controles de enlaces y publicación pasaron para las siete páginas.
- Chromium verificó las seis rutas locales y el estado indexable. En la landing candidata no se observaron cookies, escrituras en localStorage o sessionStorage ni solicitudes a terceros. La versión pública anterior sí intentó cargar Google Fonts.
- Playwright pasó en escritorio y móvil emulado. El typecheck y la compilación web pasaron. Vite emitió un aviso por el tamaño de un chunk.
- La suite estándar con Node 22 terminó con código distinto de cero. `tests/browser.test.ts` y `tests/business-graph.test.ts` alcanzaron el límite de 30 segundos. El archivo de navegador pasó sus 16 casos por separado con un límite de 90 segundos. El gate conserva su configuración.
