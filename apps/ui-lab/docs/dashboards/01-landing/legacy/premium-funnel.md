# Landing editorial y recorrido comercial

Rama: `feat/landing-premium-funnel`. Parte de `91b423a`, versión de producción previa al rediseño.

## Dirección

Se mantienen marca, paleta cálida, serif editorial, violeta, secciones y retratos originales. El recorrido es propuesta → demo → equipo → funcionamiento → implantación y precio → conversación. No se añaden testimonios, cifras de clientes ni promesas de resultados no comprobados.

El hero explica el equipo coordinado por LAIA y ofrece dos caminos: explorar el producto o descubrir el equipo en una primera conversación. El chat empieza con una pregunta sobre el negocio, en lugar de una incidencia de conexión. La reserva explica duración, propósito y dos procesos por los que empezar. Los precios conservan las cifras existentes: 1.500 € de implantación y servicio desde 1.000 €/mes.

## Visuales

- Retratos y logo: archivos y componente existentes, sin regenerar caras.
- `public/landing/product-dimension.webp`: composición generada a partir de `public/images/AgntiaPro.png`; es un concepto visual, rotulado como demo. Original generado conservado en el entorno de trabajo.
- `ProductScene.jsx`: escenas de conversación, operaciones y workspaces construidas con HTML/CSS y basadas en el lenguaje de la aplicación; no simulan datos reales.
- Animaciones discretas, reducción de movimiento, navegación por teclado en tabs, diálogos nativos y formulario con errores asociados a los campos.

## Demos deliberadas

Chat de respuestas locales, presentaciones con fotos/subtítulos y formulario sin envío. No se conectan proveedores, CRM, micrófono ni agenda. El formulario informa explícitamente de su estado demo y no afirma una reserva real. Los datos introducidos permanecen en memoria de la página.

## Conexión y medición posteriores

Cuando se apruebe la landing, conectar el formulario a un endpoint de leads y agenda con consentimiento y gestión de errores. Conectar la conversación a un runtime público separado del espacio autenticado. Conservar el routing existente de clientes.

Medir, una vez habilitado el sistema de analítica: clic en CTA del hero, exploración de producto, inicio de conversación demo, apertura de presentación, inicio/completado del formulario y reserva confirmada real. La métrica principal será reservas confirmadas por sesión de visitante; segmentar móvil/escritorio. Este rediseño propone mejorar el recorrido, pero no afirma una mejora de conversión sin datos.

## Entrega

La rama permite revisar y fusionar el cambio sin reemplazar el dashboard. El enlace privado de Sites sirve para validar el diseño antes de publicar esta nueva dirección en el dominio de clientes.
