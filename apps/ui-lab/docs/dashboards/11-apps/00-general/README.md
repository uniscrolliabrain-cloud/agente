# Documentación general — Metadashboard Apps

## Alcance aprobado

Apps es la denominación comercial de la sección de workspaces de AgntiaPro. No es un nuevo sistema operativo, no sustituye el Centro de Mando ni cambia el runtime, los agentes o la arquitectura empresarial. El metadashboard es la interfaz de descubrimiento, acceso y organización de las Apps.

## Móvil y escritorio

En móvil, experiencia de pantalla de inicio inspirada en el launcher de Android, pero con identidad visual, iconos, logos y copy originales de AgntiaPro. En PC, adaptación a la superficie disponible sin copiar mecánicamente el móvil. Catálogo navegable, búsqueda, favoritos, organización, estados, accesos rápidos y continuidad entre dispositivos.

## Relevancia contextual

El metadashboard acercará las Apps que más convienen al usuario según uso general e histórico y actividad inmediata. Este es un objetivo de producto, no una funcionalidad cuya implementación se haya verificado. No alterar preferencias fijadas ni esconder el catálogo completo. La señalización de prioridades y los datos del tenant deben respetar permisos y aislamiento; no confundir sugerencia con ejecución.

## Miniapps

Admitir herramientas ligeras como calculadoras de desempeño del trabajo, presupuestos y otras utilidades empresariales. Son extensiones futuras y no forman parte de los 34 módulos documentados en este subárbol. Cada miniapp requerirá su propio contrato funcional y validación de fórmulas.

## Marca y copy

Los nombres comerciales de las 34 fichas son propuestas de copy propias de AgntiaPro; la plataforma de inspiración se conserva solo como referencia de UX o categoría funcional, nunca como logo, marca o producto propio. La landing y Studio Demo actuales mandan sobre colores, tipografía, espaciado, componentes y movimiento. Las capacidades exactas se verificarán en código y documentación antes de convertir una propuesta de copy en promesa funcional.

## Reglas de construcción

- Mantener identificadores técnicos, rutas y módulos existentes sin renombrarlos por la propuesta comercial.
- Construir componentes pequeños, tipados y reutilizables; integrar con el registro de workspaces real.
- Separar fixtures sintéticos de operaciones reales, y estado conceptual de implementación comprobada.
- Documentar flujos, desktop/móvil, búsqueda, favoritos, orden, accesibilidad, estados vacíos, errores y pruebas.
- No realizar merge, cambios funcionales ni despliegues sin autorización.

## Documentos vinculados

- [Prompt maestra V2](../PROMPT-MAESTRA-APPS-V2.md)
- [Auditoría de la prompt](../AUDITORIA-PROMPT-V2.md)
- [Inventario técnico de los 35 workspaces](../README.md)
- [Índice de las 34 Apps](../CATALOGO-34-APPS.md)

## Separación deliberada del Centro de Mando

`35-centro-mando` sigue en el inventario técnico de 35 workspaces, pero se excluye de estas 34 fichas comerciales para preservar su carácter transversal y su documentación propia. Esta decisión de organización documental no cambia su navegación ni su implementación.
