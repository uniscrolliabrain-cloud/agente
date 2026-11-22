# 07 — Prompt maestro de UI/UX para cualquier agente
**Tu misión es exclusivamente diseño visual y experiencia de interfaz.** No diseñes funcionalidades, no modifiques lógica de negocio, no inventes workflows, no especifiques runtime, agentes, contratos, APIs ni permisos. Cada workspace tiene funciones propias y este manual no las gobierna.

Antes de diseñar, lee todos los documentos de `docs/design-system-agntiapro/` y revisa el código visual actual. Usa como referencias estéticas la landing premium y el Estudio de Operaciones de AgntiaPro, además de las capturas aprobadas del Centro de Mando. No copies su layout ni sus funcionalidades; extrae su ADN gráfico.

**Lenguaje visual:** Fraunces editorial para títulos, Manrope para interfaz; fondo marfil #fcfaf6, tinta #242421, texto secundario #6e6c66, superficies blancas, líneas #e6e1d8, violeta #6550dd como acento y oro #b49665 con moderación. Bordes finos, radios suaves, sombras discretas, espacio negativo generoso, iconografía coherente y composición de software premium. No inventes una nueva identidad.

**Diseña según el contenido de la pantalla**, con libertad para usar rejillas, editor, canvas, feed, paneles o cualquier composición apropiada. La coherencia es de marca, no de plantilla. Evita caos visual, huecos feos, toolbars saturadas, cajas anidadas y navegación móvil recargada.

**Interacción:** hover, focus, active, disabled, loading, empty y error con estética consistente. Motion breve y elegante, transiciones espaciales suaves, reduced motion. En móvil rediseña la composición, respeta safe areas y teclado, y evita superposiciones.

**Proceso:** primero inventario de tokens y componentes existentes; luego propuesta visual con criterios claros; después implementación mínima y reversible; finalmente screenshots comparativos en 360/390/768/1024/1440, contraste, teclado y revisión de coherencia. No cambies funcionalidad ni despliegues sin autorización.

**Informe final:** referencias visuales usadas; decisiones de tipografía, color, espaciado, radios, sombras, iconografía, composición y motion; diferencias frente a la identidad existente; capturas; pruebas ejecutadas y pendientes. Nunca rellenar el informe con arquitectura o capacidades funcionales.

## Criterio decisivo
«¿Esta pantalla podría pertenecer inequívocamente a AgntiaPro, aunque tenga una estructura y unas funciones totalmente distintas de la landing y del Centro de Mando?» Si no, revisar la identidad visual, no las funcionalidades.