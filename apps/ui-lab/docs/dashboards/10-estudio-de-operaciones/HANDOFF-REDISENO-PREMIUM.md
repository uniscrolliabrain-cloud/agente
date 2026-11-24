# HANDOFF · Estudio de Operaciones · estándar de rediseño premium

Estado: instrucciones para una futura campaña, no autorización de cambios funcionales ni certificación visual. Baseline: main 74f8dccbf6e56a81c4c8ead83bacea7e9251cd9b. Fuente: implementación Formación V4 y código de Landing/Studio; no se ha consultado ni reproducido la UX Branding Guide. La copia de esa guía que aporte el founder será una lectura adicional independiente.

## 0. Orden obligatorio de lectura (antes de editar)
1. README.md y documentación existente de esta carpeta; inventario [componentes reales](./componentes-reales/README.md). Leer todos los archivos relevantes y contrastarlos con main actual; el snapshot es histórico, no un árbol ejecutable.
2. [Landing: inventario](../01-landing/componentes-reales/README.md), [Landing.jsx](../01-landing/componentes-reales/apps/ui-lab/src/vendor/landing/Landing.jsx), [landing.css](../01-landing/componentes-reales/apps/ui-lab/src/vendor/landing/landing.css), [ProductScene.jsx](../01-landing/componentes-reales/apps/ui-lab/src/vendor/landing/ProductScene.jsx). Leerlos completos, incluidos media queries, animaciones, estados y composición. Revisar también sus imports y assets activos.
3. [Studio: inventario](../10-estudio-de-operaciones/componentes-reales/README.md), BusinessCommandStudio.tsx, Inspector.tsx, Preview.tsx, Timeline.tsx, Visualizer.tsx, model.ts y studio.css. Es la referencia para interfaces densas de trabajo, no para copiar su distribución indiscriminadamente.
4. [Formación: inventario](../20-formacion/componentes-reales/README.md), FormationV4Workspace.tsx, formation-v4.css, catálogo legacy y manifest de imágenes. Leer también [campaña V4](../20-formacion/CAMPANAS-V4-FORMACION-NIVEL-9.md) distinguiendo plan de implementación real y la decisión de 12 lecciones.
5. Resolver imports, ruta en registry.tsx/App.tsx, estilos compartidos, contratos, permisos y fixtures. Si existe copia de UX Branding Guide añadida por el founder, leerla aparte; no inferir su contenido de este handoff.

## 1. Qué transferir de Formación V4 y qué no
V4 separó una nueva preview de legacy, redujo alcance a una selección de 12, reutilizó fotografías existentes, construyó una escena principal, colecciones y tarjetas con jerarquía, añadió navegación Inicio/Buscar/Biblioteca, búsqueda normalizada, favoritos locales y ficha lateral/móvil. El código emplea CSS aislado fv-*, Cover/CourseCard/CourseSheet, aria-current/aria-pressed, Escape, foco inicial y retorno. La ficha dice explícitamente vídeo en preparación. La compilación no certifica calidad visual ni accesibilidad completa. No copiar hero, fotos, tarjetas o navegación de Formación a una tabla, login o herramienta operativa por defecto. Transferir el proceso de reducción de ruido, jerarquía, interacción, composición y validación.

## 2. Objetivo específico de Estudio de Operaciones
Preservar inspector, visualizador y timeline sincronizados; refinamiento sin perder capacidad.
Superficies a inspeccionar: BusinessCommandStudio, Inspector, Preview, Timeline, Visualizer, model y CSS.
Recorridos mínimos: Seleccionar entidad desde cada panel, cambiar vista, zoom/scroll si existe, reset demo.
No eliminar capacidades por simplificar; separar lo existente, lo propuesto y lo bloqueado. Si no hay componente real, no inventar una copia ni presentar una maqueta como funcional.

## 3. C00 — Inventario y baseline
- Registrar SHA, rutas activas, imports directos/transitivos, estilos, assets, entrypoints, contratos de props, eventos, estados, permisos, API, fixtures y efectos secundarios. Clasificar cada componente como activo, demo, legacy, stub o no localizado.
- Capturar vista completa y detalles a 1440×900, 1280×800, 768×1024, 390×844 y 360×800; incluir teclado, scroll y estados no ideales. Si no hay navegador, registrar bloqueo y no inventar capturas.
- Crear auditoria-baseline.md con matriz componente → función → problema → evidencia → riesgo → decisión. Identificar elementos que no deben cambiar. Medir overflow, densidad, contraste y tiempos de interacción. Guardar capturas antes.
- Gate: rutas y funciones trazables; si falta fuente, detener el rediseño de esa superficie.

## 4. C01 — Dirección visual derivada del código
- Extraer de landing.css los valores reales --lp-paper #fcfaf6, --lp-ink #242421, --lp-muted #6e6c66, --lp-line #e6e1d8, --lp-violet #6550dd, --lp-gold #b49665; contrastar con tokens activos de Studio (--ag-*). Son evidencia de código, no una nueva guía de marca. Preferir aliases de tokens compartidos; no propagar divergencias de fv-muted/fv-line.
- Fraunces para títulos expresivos cuando corresponda; Manrope para UI, lectura operativa y controles. Definir escala por rol, no por componente arbitrario. Un título principal por vista; jerarquía clara de secundarios, metadatos y ayuda. Comprobar fuentes fallback y textos largos.
- Dibujar wireframe de escritorio y móvil con zonas de intención: orientación, tarea primaria, contexto, detalle y acciones secundarias. Priorizar alineación, espacio negativo, ritmo y agrupación; no hacer un grid homogéneo de tarjetas si una lista o tabla comunica mejor.
- Definir densidad por tarea: editorial amplia, trabajo intermedio, inspección compacta. Bordes discretos, elevación solo para capas y foco, radios coherentes con controles reales. Violeta para acción/selección, oro puntual; colores de estado con texto/icono, no solo color.
- Inventariar iconos y fotografías reales. Usar BrandLockup donde corresponda; no repetir logotipo ni shell. No generar imágenes pagadas sin aprobación. Si hay imágenes, definir recorte, punto focal, dimensiones, alt y fallback; no usarlas como decoración obligatoria.
- Entregar direccion-visual.md con decisiones por componente y comparación explícita Landing/Studio; storyboard de cada recorrido. Gate: cada decisión tiene razón funcional y evidencia visual.

## 5. C02 — Arquitectura y patchset
- Mantener código original y snapshot intactos; nueva preview aislada en UI Lab si se autoriza implementación. Elegir carpeta y registro nuevos tras verificar colisiones; no renombrar rutas productivas ni tocar backend.
- Separar contenedor, componentes presentacionales, estado y adaptadores; reutilizar contratos y handlers existentes. Identificar archivos a crear/modificar, imports, estilos, dependencias y límites de escritura. No añadir librerías sin justificar necesidad y coste.
- CSS con namespace local, box-sizing y min-width:0; evitar selectores globales, z-index arbitrario y !important para tapar conflictos. Usar grid/flex, clamp y breakpoints según contenido; no dimensiones fijas que rompan móvil.
- Crear matriz de paridad: cada control original → nuevo control → handler → estado → prueba. Proteger permisos, aprobaciones, errores, cancelación y datos. Los fixtures son explícitos; no enviar operaciones reales desde demo.
- Gate: patchset revisado, rollback definido, cero cambios funcionales no autorizados.

## 6. C03 — Construcción componente por componente
- Construir primero estructura y jerarquía sin animación; después estados, tipografía, espacios y microcopy; finalmente detalle y movimiento. Para cada componente registrar props, variantes, dimensiones, comportamiento responsive, interacción, accesibilidad y prueba.
- Controles: normal, hover, focus-visible, pressed/selected, disabled, loading, error. Formularios con labels, ayuda y error asociados; botones con nombre accesible y acciones reales. Evitar botones anidados, iconos ambiguos y CTA falsos.
- Datos: vacío útil, carga sin salto de layout, error recuperable, datos parciales, texto largo, permisos insuficientes, offline si aplica. No inventar valores ni progreso. Mantener orden de lectura y acciones destructivas separadas.
- Detalle contextual: cuando sea apropiado, panel lateral en escritorio y bottom sheet móvil, como CourseSheet; no imponerlo si la tarea necesita pantalla completa. Definir apertura, cierre, scroll interno, backdrop, foco inicial, trap, Escape, retorno de foco y bloqueo de interacción de fondo. Probar cambios internos sin reset de foco.
- Gate: todos los recorridos funcionan sin motion y conservan semántica.

## 7. C04 — Coreografía cinematográfica contenida
- Evidencia: V4 usa fv-rise (16px), fv-fade, fv-sheet-in (45px), hover de imagen y transiciones de 0.2–0.8s; Landing tiene lp-portrait-enter, lp-message-enter y transiciones de escena; Studio usa bcs-reveal y transiciones breves. No confundir estos ejemplos con un sistema de motion completo ya certificado.
- Propuesta de estándar: feedback 120–200ms; transición de panel 260–420ms; revelado 280–450ms; cascada discreta 30–60ms entre pocos elementos, máximo 250ms acumulado; desplazamiento 8–24px. Ajustar según pruebas. Entrada y salida coherentes, continuidad de selección, sin bloquear acciones.
- Storyboard por transición: disparador, elemento origen/destino, propiedad, duración, easing, orden, cancelación, estado final y fallback. Animar opacity/transform; no animar altura de listas grandes ni provocar CLS. No reanimar toda la vista al escribir o recibir datos.
- Reduced motion: eliminar desplazamientos y cascadas no esenciales; preservar feedback y funcionalidad. No autoplay decorativo, parallax excesivo, rebotes ni animación continua sin motivo. Verificar salida de overlays antes de desmontar si se implementa.
- Gate: grabación corta de entrada/salida, navegación, detalle y reduced motion; no declarar calidad cinematográfica solo por tener keyframes.

## 8. C05 — Responsive, accesibilidad y rendimiento
- Probar los cinco tamaños del baseline, zoom 200%, teclado completo, touch, nombres largos, safe-area y teclado virtual. Controles táctiles objetivo 44×44 CSS px donde sea viable; foco visible y contraste WCAG AA (4.5:1 texto normal, 3:1 texto grande/controles relevantes).
- Revisar landmarks, headings, labels, aria-current/pressed, live regions para cambios pertinentes, modales y orden DOM. No ocultar información esencial en móvil. Tablas densas: scroll local explícito, columnas prioritarias, alternativa de detalle; no scroll horizontal global.
- Lazy-load de recursos secundarios, dimensiones reservadas, evitar fetch duplicado, revisar consola y red. Comprobar assets en dist, no solo en public: Formación tuvo un fallo real porque Vite publicDir apuntaba a web/public; se corrigió emisión explícita de imágenes. Verificar MIME y decodificación, no solo HTTP 200 de fallback HTML.
- Gate: sin errores de consola, assets rotos, overflow global ni bloqueo de teclado; registrar mediciones reales y excepciones.

## 9. C06 — Pruebas y distribución local
- Ejecutar pnpm --filter @agente/ui-lab typecheck y pnpm --filter @agente/ui-lab build desde raíz con dependencias del lockfile. Añadir pruebas de interacción según herramientas existentes, sin declarar PASS si no se ejecutan.
- Verificar preview por id real, tanto directa como integrada en shell si corresponde; comprobar aislamiento de fixtures y ausencia de llamadas productivas inesperadas. Ejecutar recorridos específicos de §2 y regresión en Landing/Studio/Formación.
- Usar GitHub Actions UI Lab para generar artefacto estático descargable; probar con servidor local Python en Chromebook. No desplegar en Vercel por cada iteración; publicación manual solo con autorización. No confundir HTML de entrada con render correcto.
- Entregar evidencias: SHA, comandos, códigos de salida, run URL, capturas antes/después, vídeo de motion si disponible, inventario de assets y fallos pendientes.

## 10. C07 — Auditoría adversarial y aceptación
Rúbrica propuesta /100: composición y jerarquía 20; coherencia con código Landing/Studio 15; calidad de componentes y estados 15; paridad funcional 15; responsive 10; accesibilidad 10; motion 10; rendimiento y assets 5. Objetivo >=90 con evidencias por criterio, no autoevaluación sin capturas. Bloqueantes aunque la suma sea alta: pérdida funcional, permisos rotos, datos falsos, assets ausentes, teclado bloqueado, build fallido o cambios globales no autorizados. Revisor distinto si es posible. No promocionar ni borrar legacy hasta aceptación explícita del founder.

## 11. Entregables y handoff al siguiente agente
En esta carpeta crear, cuando se ejecute la campaña, auditoria-baseline.md, direccion-visual.md, storyboard.md, patchset.md, matriz-paridad.md, QA.md y bitacora.md (sin sobrescribir documentos existentes; usar subcarpeta de campaña si hay colisión). Bitácora: fecha, SHA, agente, archivos, decisión, prueba, resultado, bloqueo, siguiente acción. Reportar por separado implementado, probado, publicado y aprobado. Mantener documentación en main, sin ramas documentales. Este handoff no modifica componentes ni autoriza despliegue.
