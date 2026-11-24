# Menú lateral · La empresa al alcance de una mano

## Mandato
Diseño UX documental en UI Lab. Leer las cinco preguntas y respuestas del CEO y founder en ../../agntia-demo/01-kick-off y ../../agntia-demo/02-vision-founder, y ../../agntia-demo/03-compilacion-y-dataset/OWNER-JOURNEY-UX.md. Contrastar con componentes reales de esta carpeta, guía de branding y handoff; con Landing, Studio y Formación V4. La empresa determina capacidades, las capacidades determinan UX y el UX determina la data posterior. No auditar backend ni implementar código. Las ampliaciones descritas son propuestas de experiencia.

El menú es la columna vertebral de la experiencia, no un inventario de pantallas. El owner debe reconocer dónde está, llegar a cualquier parte de su empresa y volver a una conversación sin esfuerzo. El SidebarV2 actual ya tiene navegación principal, rail plegado, hilos recientes, acceso a chat y ajustes. Conserva esas capacidades, pero reduce ruido y crea una jerarquía comprensible.

## Composición desktop
Una columna de 248–272 px, fondo papel ligeramente diferenciado del contenido, borde vertical fino. Arriba marca real compacta, control de plegado y selector/contexto de empresa. Debajo una acción de nuevo chat y búsqueda global accesible. No usar logo gigante, tarjetas apiladas ni nombres internos del software. La empresa activa se reconoce de un vistazo, con etiqueta de simulación cuando proceda.
El cuerpo se organiza por intención. Propuesta de orden: Centro de Mando y Chat como accesos principales; después trabajo cotidiano (Tareas y automatizaciones, Proyectos, Estudio de Operaciones); después recursos y relaciones (Comunicación, Documentos, Conocimiento, Equipo); después exploración (Apps, Data/Analítica, Formación). Conserva acceso al Centro de Control como superficie diferenciada de supervisión técnica. Los nombres definitivos se contrastan con los veinte folders y no se crean rutas nuevas en esta tarea. La agrupación es una propuesta visual, no una sustitución de la navegación existente.
Cada fila tiene icono coherente de 18 px, texto de 13–14 px, altura 38–42 px y estado activo con fondo violeta muy suave o marca lateral discreta. Evita pintar toda la barra de violeta. Un indicador de actividad solo cuando tiene significado. Los grupos se pueden plegar si el volumen lo requiere, sin esconder las funciones esenciales.

## Conversaciones y recientes
Debajo de navegación, una zona de conversaciones recientes con título discreto, búsqueda y acceso a todas. Los títulos se leen como asuntos de trabajo, no como IDs. Cada fila tiene menú contextual para renombrar, fijar, archivar o eliminar cuando corresponda. El menú aparece al hover y al foco, sin desplazar texto. Una conversación activa conserva su señal aunque se esté consultando un proyecto. Como propuesta, favoritos y recientes de otros objetos pueden aparecer en una sección limitada, no una segunda navegación interminable.
El pie queda fijo: avatar, identidad, ajustes y acceso transversal a LAIA. La lista central es la única zona que necesita scroll. Si se abre el chat lateral, el menú cede espacio sin crear una segunda barra de chat.

## Rail y móvil
Al plegar, ancho 60–68 px, mismos iconos y orden, tooltip accesible, marca compacta y pie reconocible. No esconder ajustes ni impedir volver al menú completo. En móvil, drawer de ancho cómodo, con búsqueda y contexto arriba, cierre claro y retorno al workspace. No introducir una falsa barra de estado del teléfono ni una navegación inferior duplicada. 
## Coreografía y estados
Plegado con transición de ancho y desaparición de etiquetas coordinada; el contenido principal no debe dar saltos. Al navegar, indicador activo cambia suavemente y el nuevo workspace realiza su propia entrada. Grupos se expanden con movimiento breve. Estados sin conversaciones, búsqueda sin resultados, nombre largo, empresa nueva y acceso restringido. 
## Recorridos
Abrir el día, ir a proyecto, recuperar conversación, buscar un documento, abrir Apps, plegar para ganar espacio, usar móvil, acceder a perfil y volver. Diseña primero con etiquetas y espacios de contenido; los nombres de hilos, contadores y recientes se crearán después.

## Entrega y contraste con Formación V4
Preparar escenas de escritorio 1440/1280 y móvil 390/360, composición, jerarquía, estados y recorridos; especificar movimiento de entrada, selección, cambio de vista y salida. Mantener identidad de Landing, Fraunces/Manrope, papel cálido, violeta intencional, oro como firma LAIA. Como Formación V4, usar inspiración reconocible sin copiar branding, alternar densidades, priorizar pocas experiencias completas sobre volumen y evitar tarjetas homogéneas. No duplicar shell ni chat transversal. Usar etiquetas y estructuras vacías de datos definitivos; revisar con founder antes de la fase de contenido. Sin código ni despliegue.
