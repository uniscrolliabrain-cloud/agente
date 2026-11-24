# Ajustes · Tu entorno de trabajo, a tu medida

## Mandato
Diseño UX documental en UI Lab. Leer las cinco preguntas y respuestas del CEO y founder en ../../agntia-demo/01-kick-off y ../../agntia-demo/02-vision-founder, y ../../agntia-demo/03-compilacion-y-dataset/OWNER-JOURNEY-UX.md. Contrastar con componentes reales de esta carpeta, guía de branding y handoff; con Landing, Studio y Formación V4. La empresa determina capacidades, las capacidades determinan UX y el UX determina la data posterior. No auditar backend ni implementar código. Las ampliaciones descritas son propuestas de experiencia.

Quiero que configurar AgntiaPro sea tan fácil como configurar una buena aplicación personal. Hoy SettingsMenu es un menú de cuenta con identidad, empresa, perfil, salida de demo y cierre de sesión. Conserva esa puerta rápida y diseña detrás una experiencia de ajustes de verdad, sin convertirla en un panel de administración de infraestructura.

## Dos escalas de interacción
El engranaje del menú lateral abre un popover compacto, alineado al pie del sidebar, de 280–320 px. Arriba identidad con avatar, nombre, correo y empresa; debajo Mi perfil, Ajustes, contexto de empresa y cierre de sesión separado por una línea. No llenar el popover de opciones. Si se está en simulación, indicar ese contexto y ofrecer salir de ella con claridad.
Ajustes abre un espacio de trabajo tranquilo, con título serif y descripción de una línea. En escritorio, índice local de 200–230 px y columna de lectura de 650–780 px; margen derecho libre. Inspiración: ajustes de macOS y Linear, reinterpretados con el papel cálido y la tipografía de AgntiaPro. No copiar su estética ni crear un segundo menú global.

## Categorías y capacidades propuestas
**Experiencia:** apariencia, tamaño de texto, densidad, movimiento reducido, preferencias de navegación y apertura de chat. Una miniatura del cambio permite comprenderlo antes de aplicarlo. No llenar de interruptores sin explicación.
**Comunicación:** preferencias de resúmenes de LAIA, notificaciones, horarios tranquilos y canales preferidos. Cada opción explica qué cambia para la persona, no qué servicio técnico se configura.
**Mi empresa:** identidad de la organización, idioma, zona horaria y horario de trabajo; acceso a Equipo para personas y responsabilidades. Distinguir ajustes personales de los que afectan a todos. 
**Agentes y supervisión:** preferencias de presentación de actividad, decisiones pendientes y comunicación de resultados. No inventar niveles universales de autonomía; explicar las responsabilidades y remitir a la superficie adecuada.
**Conexiones y privacidad:** resumen de servicios conectados, enlace a Apps para gestionar herramientas y a Perfil para identidad personal; información sobre datos y seguridad. No duplicar el catálogo de Apps.
**Cuenta:** enlace al perfil, cambio de contexto empresarial cuando exista y cierre de sesión. Acciones sensibles separadas, sin grandes zonas rojas.

## Composición de cada categoría
Encabezado de sección de 22–26 px, frase de ayuda y filas de 52–72 px con etiqueta, descripción y control alineado a la derecha. Agrupar por intención, no por tipo de control. Selectores de apariencia con muestras visuales; controles de horario con resumen legible; cambios complejos abren detalle. Las preferencias inmediatas muestran confirmación breve; las ediciones de empresa tienen guardar y cancelar visibles solo al modificar. Diseñar estado sin permiso con explicación y alternativa, estado sin cambios, error y confirmación. La acción de cerrar sesión no debe confundirse con salir del entorno de simulación.

## Móvil y coreografía
El menú rápido aparece como hoja inferior; Ajustes como navegación de lista a detalle, con volver y título persistentes. No comprimir dos columnas. El cambio de categoría mantiene la altura de cabecera y revela contenido con una transición breve. Al cerrar un popover se devuelve el foco al engranaje. Mantener el contexto del workspace al regresar. 
## Recorridos
Ajustar notificaciones antes de trabajar; cambiar apariencia; entender una preferencia de LAIA; revisar qué empresa está abierta; llegar a Perfil o Apps; cancelar una edición; salir de simulación. La fase data definirá los valores concretos y ejemplos después de aprobar esta estructura.

## Entrega y contraste con Formación V4
Preparar escenas de escritorio 1440/1280 y móvil 390/360, composición, jerarquía, estados y recorridos; especificar movimiento de entrada, selección, cambio de vista y salida. Mantener identidad de Landing, Fraunces/Manrope, papel cálido, violeta intencional, oro como firma LAIA. Como Formación V4, usar inspiración reconocible sin copiar branding, alternar densidades, priorizar pocas experiencias completas sobre volumen y evitar tarjetas homogéneas. No duplicar shell ni chat transversal. Usar etiquetas y estructuras vacías de datos definitivos; revisar con founder antes de la fase de contenido. Sin código ni despliegue.
