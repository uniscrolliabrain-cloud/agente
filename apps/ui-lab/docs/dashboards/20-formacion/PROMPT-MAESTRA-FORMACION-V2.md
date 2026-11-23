# PROMPT MAESTRA V2 — FORMACIÓN · TRABAJA CON LAIA
## Especificación UX/UI adaptada al branding real de AgntiaPro

> **Estado:** especificación documental para el agente que construirá la interfaz. No implica que Formación, los vídeos, las conexiones o los SOP estén implementados. Adaptación fiel a la prompt original aportada por el founder el 23-11-2026. Conservar el lema, las seis colecciones, los 60 ejercicios, el enfoque de biblioteca audiovisual y la conexión contextual. El diseño de marca se rige por las referencias UX existentes de AgntiaPro, no por la identidad de Spotify.

### Orden de precedencia — obligatorio
1. Decisiones explícitas del founder: Formación dentro de AgntiaPro, biblioteca audiovisual inspirada conceptualmente en Spotify, 60 ejercicios, LAIA protagonista y conexión mientras se aprende.
2. Branding **actual y efectivo** de la landing premium y Studio Demo en el repositorio; componentes y tokens compartidos que ya estén implementados.
3. Documentación UX de UI Lab, especialmente `../02-login/PROMPT-MAESTRA-LOGIN-V2.md`, `../11-apps/PROMPT-MAESTRA-APPS-V2.md` y la nomenclatura `../19-general/NOMENCLATURA-UI-FINAL.md`.
4. Catálogo y contratos de esta carpeta: `ejercicios/50-reels.md`, `ejercicios/10-introduccion.md`, `UX-FORMACION.md`, `CONTRATOS-Y-DATOS.md`, `ARQUITECTURA-Y-SEGURIDAD.md`.
5. Esta prompt, como composición e interacción objetivo. Los colores numéricos siguientes son **referencias contrastables**, no un reemplazo de los tokens de código.

---

## 1. Contexto de producto: no estamos creando una academia

Estás trabajando en el dashboard de **AgntiaPro**, plataforma de gestión empresarial agéntica en la que empleados humanos trabajan junto a LAIA y otros agentes IA. Diseña **Formación**, una sección integrada en el producto que permita descubrir nuevas capacidades mediante experiencias audiovisuales muy breves y ponerlas en práctica en el propio software.

El lema es literal y no debe reescribirse:

**«Deja de aprender la IA y empieza a trabajar con LAIA».**

El juego entre «la IA» y «LAIA» es deliberado. No sustituirlo por «Aprende inteligencia artificial», «Academia IA» ni «Domina tus prompts».

La persona no necesita estudiar un curso teórico para empezar a trabajar. Descubre una tarea que le interesa, ve un reel, conecta la aplicación cuando sea necesario, se lo pide a LAIA y verifica el resultado. La experiencia enseña **haciendo trabajo real**, no acumulando lecciones, insignias o certificados.

**Qué es:** biblioteca de experiencias, repertorio práctico de cosas que LAIA puede hacer, reproductor de reels, colecciones, continuidad y práctica contextual.

**Qué no es:** un LMS académico, un catálogo de cursos de pago, un marketplace de herramientas, un panel de KPIs, un nuevo runtime, un menú paralelo a AgntiaPro o un clon visual de Spotify.

No convertir Formación en una de las 34 Apps comerciales del catálogo de gestión: es una **sección general** de la plataforma, documentada como `20-formacion`.

## 2. Filosofía visual: inspiración Spotify, identidad AgntiaPro

Tomar de una biblioteca musical la **lógica de descubrimiento**: portada editorial de colección, listas de piezas, carruseles horizontales, recomendaciones, continuar donde lo dejaste, reproductor inmediato y paso fluido a la siguiente pieza. El contenido aquí no son canciones: son **acciones que puedes hacer con LAIA**.

No copiar: verde Spotify, negro dominante, barra de reproducción idéntica, logos, iconos, jerarquías de marca ni elementos propietarios. La inspiración es estructural, no estética ni una plantilla.

La sensación objetivo: **una biblioteca premium, cálida, viva y extraordinariamente fácil de explorar**. Al entrar, debe parecer inequívocamente una superficie de AgntiaPro, no una aplicación externa incrustada. Evitar pantallas oscuras por inercia, tarjetas interminables, ilustraciones genéricas de robots y saturación de datos.

**Principios no negociables:**
- Belleza y legibilidad antes que densidad.
- Un contenido protagonista por momento.
- Aire, proporción, ritmo y composición editorial.
- LAIA como compañera digital, no como mascota o adorno.
- La acción útil está a un gesto del contenido.
- La conexión es opcional para mirar y necesaria solo para operar.
- La persona entiende en qué estado está cada ejercicio, sin ver jerga de infraestructura.
- Ninguna simulación se presenta como ejecución real.

## 3. Sistema de diseño — heredar la marca, no recrearla

Inspecciona los tokens, CSS y componentes **reales** de la landing premium y Studio Demo antes de implementar. La guía documental UX de Login y Apps utiliza esta paleta como referencia de marca; verifica cualquier discrepancia con el código vigente:

| Token orientativo | Valor | Uso en Formación |
|---|---|---|
| `--bg` | `#FDFBF7` | Fondo marfil cálido principal |
| `--bg-alt` | `#F4EEE3` | Secciones secundarias, hover, paneles |
| `--surface` | `#FFFFFF` | Superficies limpias, tarjetas y reproductor |
| `--border` | `#E8DFD2` | Divisiones finas, inputs, tarjetas |
| `--ink` | `#211D18` | Titulares, contenido principal |
| `--ink-soft` | `#3A332C` | Texto explicativo |
| `--muted` | `#85796A` | Metadatos y ayudas |
| `--violet` | `#5B4BDB` | CTA, selección, foco y progreso activo |
| `--violet-dark` | `#4A3FB8` | Hover de CTA |
| `--violet-soft` | `#ECE9FF` | Resaltados de LAIA y selección |
| `--lav` | `#E7E2F7` | Superficies suaves |
| `--gold` | `#C9A86A` | Acento escaso de LAIA |
| `--green-soft` | `#E6F4EA` | Estado completado verificable |
| `--amber-soft` | `#FEF3C7` | Pendiente de autorización |
| `--pink-soft` | `#FDE8E8` | Error o bloqueo real |

**Tipografía:** Fraunces para titulares editoriales, nombres grandes de colección y el lema; Manrope para navegación, captions, controles, fichas, metadatos y acciones. Usar los pesos y tamaños del sistema efectivo, no cargar familias duplicadas por pantalla. Títulos amplios con interlineado corto y párrafos de lectura cómoda.

**Tratamiento de superficies:** tarjetas blancas o marfil con borde fino; radios aproximadamente 16–24 px según componente; botones de 10–12 px de radio o pill cuando sean chips; sombras discretas. Las portadas sí pueden ser visualmente expresivas, pero deben respetar la paleta, el lenguaje fotográfico y la calidad editorial de la landing.

**Prohibiciones:** degradados intensos, halos morados grandes, dots decorativos, confeti, iconos de apps de terceros como identidad propia, paneles oscuros gratuitos, dashboards llenos de gráficos, carruseles automáticos, avatares 3D genéricos, fotografías de stock corporativo frías, tipografía minúscula o exceso de badges.

**Iconografía:** reutilizar iconos y componentes compartidos. Los servicios conectados pueden nombrarse para explicar qué cuenta necesita el ejercicio, pero no convertir sus logos en el branding de Formación. No inventar activos de LAIA: usar la representación aprobada cuando esté disponible; en su ausencia, placeholder honesto.

## 4. Arquitectura de la pantalla principal

La pantalla se integra en el **shell real del dashboard**. Antes de codificar, inspecciona navegación, menú lateral, chat transversal y rutas. No crear otro sidebar propio para Formación ni un segundo sistema de menú. El usuario llega desde la navegación general y vuelve sin perder contexto.

**Desktop:** contenedor amplio, composición editorial, carruseles que aprovechan la anchura, portada protagonista, área de continuidad y biblioteca. Mantener márgenes generosos y jerarquía clara. No llenar todo el ancho de tarjetas pequeñas. Si el shell ya aporta cabecera, no duplicarla.

**Móvil:** columna única, cabecera compacta, portadas de proporción adecuada, carruseles desplazables con gesto, controles táctiles cómodos y reproductor vertical protagonista. Respetar safe areas, teclado, orientación y botón atrás. No imponer 100vh fijo si el contenido necesita scroll.

**Orden visual recomendado:**
1. Encabezado compacto «Formación» y acceso a búsqueda.
2. Hero editorial con lema exacto, una portada de colección destacada y CTA «Explorar ejercicios».
3. «Continúa donde lo dejaste» si existe progreso; si no, una propuesta clara para empezar.
4. «Para empezar con LAIA»: introducción profesional de 10 ejercicios.
5. Cinco colecciones prácticas de 10 reels.
6. «Para ti» o recomendaciones solo si hay reglas/datos; en demo, rotular recomendaciones de ejemplo.
7. Acceso discreto a «Mis conexiones» y progreso.
8. Biblioteca completa navegable, sin perder la sensación de descubrimiento.

No crear un hero gigante que obligue a varios scrolls antes de ver el primer ejercicio. No mostrar todas las fichas de golpe en la portada. Priorizar entrada inmediata al contenido.

## 5. Seis colecciones, sesenta ejercicios: inventario cerrado

El contenido inicial es exactamente el que ya existe en los dos documentos de ejercicios. No generar títulos, proveedores, capacidades ni guiones nuevos como sustitutos del catálogo.

| Colección visible | Nº | Documento fuente | Contenido |
|---|---:|---|---|
| Organiza tu día | 10 | `ejercicios/50-reels.md` | Correo, agenda, tareas y productividad |
| Documentos y conocimiento | 10 | `ejercicios/50-reels.md` | Archivos, búsquedas, resúmenes y documentos |
| Colaboración | 10 | `ejercicios/50-reels.md` | Comunicación, reuniones y proyectos |
| Creación y comunicación | 10 | `ejercicios/50-reels.md` | Contenido, diseño y publicaciones |
| Vida digital | 10 | `ejercicios/50-reels.md` | Aplicaciones personales y organización cotidiana |
| Empieza con LAIA | 10 | `ejercicios/10-introduccion.md` | Introducción profesional y práctica guiada |

Cada colección tiene portada propia, título, frase de contexto, número de ejercicios y estado de progreso. Las portadas deben distinguirse visualmente sin parecer seis marcas distintas. Crear un sistema de composición reutilizable, no seis diseños inconexos.

**Tarjeta de reel:** miniatura vertical o portada, título real del catálogo, duración si existe, una frase de utilidad y estado discreto. No mostrar nombres de SOP, IDs de herramientas, schemas ni endpoints en la tarjeta.

**Página de colección:** hero reducido con portada, resumen, botón «Empezar» o «Continuar», lista de diez ejercicios, indicador de avance real y acceso al ejercicio siguiente. La lista debe poder leerse y recorrerse con teclado; no obligar a usar carruseles.

**Búsqueda:** buscar títulos y descripciones del catálogo, con resultados y estado vacío útil. Los filtros pueden ser colección, aplicación necesaria, nivel y estado, solo si hay datos reales o fixtures consistentes para soportarlos.

## 6. Reproductor de reels — el contenido es protagonista

Un ejercicio se presenta mediante vídeo vertical, normalmente **20–45 segundos** para los reels cotidianos; los introductorios pueden durar **30–60 segundos**. No inventar vídeos definitivos ni presentar una imagen estática como un vídeo reproducible.

**Desktop:** zona de vídeo vertical con proporción 9:16, área contigua de caption y acción; suficiente espacio negativo. La ficha puede desplazarse independientemente solo si es necesario y accesible. No superponer toda la explicación al vídeo.

**Móvil:** vídeo vertical grande, controles mínimos, caption debajo o en hoja inferior accesible, CTA claro y navegación siguiente/anterior sin gestos ocultos. No impedir que se pause, retroceda o se activen subtítulos.

**Contenido de ficha:**
- Título real, preferentemente con la voz «LAIA, ...» cuando así figure en el catálogo.
- Vídeo o placeholder explícito «Vídeo pendiente de producción».
- Caption: qué consigue, qué aplicación interviene, qué autorización se necesita y qué resultado esperar.
- Estado de conexión del proveedor necesario.
- Acción principal contextual.
- Progreso de visionado y práctica **diferenciados**.
- Limitaciones o fuentes cuando correspondan.
- Siguiente ejercicio y regreso a la colección.

Controles: reproducir/pausar, sonido, subtítulos, avance y retroceso razonable. Sin barras de edición, paneles técnicos ni métricas de consumo innecesarias. Autoplay con sonido prohibido; respetar preferencias de movimiento reducido.

**Estados visuales honestos:** vídeo pendiente, cargando, reproduciendo, pausado, error, completado de visionado. Si todavía no hay assets, usar fichas editoriales de demostración, no reproductores falsos con temporizadores inventados.

## 7. Conectar mientras aprendes — el diferencial del producto

Ejemplo narrativo de referencia: el usuario abre **«LAIA, organiza mi agenda de mañana»**, ve cómo LAIA puede utilizar Google Calendar y encuentra «Conectar Google Calendar». Tras autorizar su cuenta mediante el backend, el CTA pasa a «Pruébalo con LAIA». Si ya conectó Calendar en otro ejercicio con el mismo principal, tenant y alcance de permisos, no se le pide conectar de nuevo.

**Estados obligatorios de interfaz:**
1. **Sin conexión necesaria:** «Practicar con LAIA» sin obligar a conectar nada.
2. **Conexión necesaria, no autorizada:** «Conectar [aplicación]», con explicación breve de qué se autoriza y para qué.
3. **Conectada y con permisos suficientes:** «Pruébalo con LAIA».
4. **Conectada pero con permisos insuficientes o caducados:** explicar y ofrecer revisar o renovar autorización.
5. **Práctica que requiere escritura externa:** «Revisar y aprobar» antes de ejecutar, según política.
6. **Ejercicio completado y verificado:** «Completado» y «Repetir ejercicio».
7. **Integración no disponible:** «Ver demostración» / «Disponible próximamente», sin botones que simulen una conexión.
8. **Error o revocación:** estado claro y recuperación; la revocación no borra el progreso histórico.

La conexión debe ser reutilizable entre ejercicios dentro de los permisos y ámbitos correctos. **Nunca** asumir que una cuenta personal equivale a la cuenta de la empresa o que un usuario autoriza acciones para todos.

La interfaz de autorización muestra proveedor, identidad de cuenta, permisos solicitados, consecuencias y opción de cancelar. No mostrar tokens, claves ni datos privados en el frontend. La decisión final de OAuth, cobertura y Composio es backend, fuera de esta campaña visual.

## 8. LAIA: compañera de trabajo, no profesora de herramientas

La protagonista de Formación es **LAIA**. El usuario descubre lo que puede pedirle en lenguaje natural. Los títulos deben sonar a conversación útil, no a temario técnico.

Ejemplos de tono de la prompt original:
- «LAIA, ¿qué tengo mañana?»
- «LAIA, encuentra aquel correo».
- «LAIA, prepara mi reunión».
- «LAIA, organiza mis documentos».
- «LAIA, ponme música para concentrarme».
- «LAIA, ayúdame a preparar esta presentación».

Estos son **ejemplos de copy**, no autorización para reemplazar los 60 títulos documentados.

El lenguaje es español de España, cálido, directo y profesional. No usar «ejecuta el capability», «invoca MCP», «valida schema Zod» ni «compila SOP» en la interfaz. Sí explicar en lenguaje corriente: «LAIA necesita permiso para consultar tu calendario» o «Revisa este borrador antes de enviarlo».

El avatar y la voz de LAIA, cuando se utilicen, deben ser los activos aprobados. No generar una LAIA diferente para Formación. Evitar chats ficticios que afirmen haber enviado correos o modificado documentos. Una propuesta visual de LAIA no es una ejecución verificada.

## 9. Progreso, continuidad y recomendaciones sin convertirlo en escuela

El progreso tiene tres capas distintas:
- **Visto:** el usuario ha consumido el reel; no significa que sepa hacerlo.
- **Conectado:** existe autorización válida para el proveedor requerido; no significa que haya practicado.
- **Practicado/completado:** existe evidencia o recibo de la acción, revisión humana o lectura verificada según el contrato.

La experiencia debe invitar a continuar, no presionar con streaks, puntos, ranking o certificados. Una línea discreta de progreso por colección es suficiente. «Continúa donde lo dejaste» lleva al ejercicio pendiente, no al inicio del catálogo.

Las recomendaciones pueden priorizar ejercicios de las aplicaciones que ya usa la persona, colecciones iniciadas y tareas relevantes para su puesto, **pero no inventar un algoritmo inteligente operativo**. En la primera versión se permiten reglas locales o fixtures explícitos; no perfilar al usuario con datos empresariales sin una fuente y política definidas.

Estados vacíos con microcopy útil: «Todavía no has empezado. Prueba con un ejercicio de dos minutos»; «No encontramos ejercicios con esa búsqueda»; «No tienes aplicaciones conectadas. Puedes ver todos los vídeos igualmente».

## 10. Arquitectura de integración: Cognition V2, kernel, SOP y Composio

**Cognition V2 es el puente cognitivo objetivo.** El puente anterior es legado sujeto a migración y pruebas de paridad. El LLM interpreta y propone, pero **no ejecuta herramientas externas libremente**.

Flujo conceptual: empleado → LAIA → Cognition V2 → kernel de identidad, tenant, permisos y aprobaciones → SOP tipado y versionado → executor determinista → adaptador autorizado → proveedor de conectividad (Composio si se valida) → recibo y verificación → LAIA presenta el resultado.

La interfaz solo necesita contratos visuales para: catálogo, progreso, estado de conexión, solicitud de autorización, propuesta de práctica, aprobación, ejecución, error y recibo. **No implementar** OAuth real, SDK Composio, llamadas directas a herramientas, rutas de ejecución paralelas ni SOPs nuevos dentro de esta campaña UX.

No convertir los nombres de capacidades del catálogo en endpoints supuestamente existentes. Revisar cobertura real, permisos, región, costes y términos antes de publicar una acción como disponible. Las escrituras requieren política de aprobación y evidencia. El frontend no puede declararse autoridad de permisos.

## 11. Componentes y comportamiento esperado

Organiza la interfaz con componentes reutilizables y tipados, adaptados al árbol real del repo; los nombres siguientes son **responsabilidades sugeridas**, no rutas obligatorias:

- **FormationHome:** hero, continuar, colecciones y recomendaciones.
- **CollectionShelf:** carrusel accesible con encabezado y «Ver todos».
- **CollectionDetail:** portada, descripción y diez ejercicios.
- **ExerciseCard:** miniatura, título, duración y estado.
- **ReelPlayer:** vídeo/placeholder honesto, controles, subtítulos.
- **ExerciseDetail:** caption, proveedor, resultado esperado y navegación.
- **ConnectionAction:** CTA derivado de autorización real o fixture explícito.
- **PracticePanel:** petición a LAIA, propuesta, aprobación y resultado.
- **FormationSearch:** búsqueda, filtros y estados vacíos.
- **ProgressIndicator:** visionado, conexión y finalización separados.

**Interacciones mínimas:** abrir colección, abrir reel, pausar, siguiente/anterior, buscar, filtrar, continuar, volver, revisar caption, abrir diálogo de conexión de ejemplo, visualizar estados y consultar progreso. Todos los controles deben funcionar o estar visiblemente deshabilitados con explicación. No botones decorativos que aparenten ejecutar acciones.

En UI Lab, una vista nueva de Formación solo debe registrarse si existe un componente real que renderizar. El laboratorio es un **visualizador de ingeniería** con selector simple; no introducir otro menú ni reescribir `apps/web` por accidente.

## 12. Responsive, accesibilidad y calidad editorial

Comprobar anchos de referencia **320, 390, 768, 1024 y 1440 px**, con zoom del navegador y tamaños de fuente aumentados. Las portadas y el reproductor deben conservar proporciones sin recortar textos esenciales. Carruseles con controles accesibles, foco visible, navegación por teclado y alternativa en lista. No depender de hover para acciones fundamentales.

Usar contraste legible, semántica de encabezados, nombres accesibles, subtítulos y controles multimedia, `prefers-reduced-motion`, estados de carga y error anunciables, y no capturar el foco al cambiar de reel sin necesidad. Las transiciones deben ser suaves y breves, nunca un espectáculo visual.

El vídeo debe seguir siendo el protagonista tanto en móvil como en escritorio. En desktop, más espacio no significa más widgets: significa mejor composición.

## 13. Datos de demostración y límites de implementación

El catálogo de 60 ejercicios ya está documentado. Convertirlo a fixtures tipados solo cuando se implemente; preservar IDs `R01–R50` y `P01–P10`, títulos, captions, proveedores y limitaciones. No generar 60 vídeos de prueba con contenido inventado ni simular conexiones exitosas.

La demo puede representar visualmente estados **no conectado / conectado de ejemplo / completado de ejemplo**, rotulados en el laboratorio. Las acciones externas quedan deshabilitadas. No almacenar secretos ni información empresarial en fixtures. Separar claramente la presentación de la lógica futura de backend.

No modificar kernel, Cognition V2, executor, conectores ni políticas de autorización para cumplir esta especificación de UI. No tocar otras pantallas ni el menú transversal salvo integración mínima previamente comprobada.

## 14. Orden de trabajo para el agente

**Fase 1 — Auditoría visual:** leer la landing, Studio Demo, tokens, componentes compartidos y el shell actual; documentar qué se reutiliza. Comparar con las guías de Login y Apps y señalar divergencias reales.

**Fase 2 — Inventario editorial:** leer completos los 60 ejercicios y confirmar seis colecciones, diez fichas por colección, IDs y captions. No sustituir el catálogo por placeholders inventados.

**Fase 3 — Estructura UX:** diseñar home, colección, reproductor, práctica y conexiones; establecer estados, rutas y navegación coherentes con el dashboard.

**Fase 4 — Componentes:** construir con el sistema de diseño real, sin crear CSS global duplicado, y con fixtures sintéticos explícitos.

**Fase 5 — Pruebas:** typecheck, build, navegación, responsive, teclado, estados vacíos, comparación visual con landing y Studio Demo. Registrar qué se ejecutó realmente y qué quedó pendiente.

**Fase 6 — Handoff:** documentar decisiones visuales, componentes, rutas, datos, limitaciones, conectores futuros y pruebas. No presentar prototipo como integración operativa.

## 15. Entregables y criterios de aceptación

La campaña futura de implementación debe entregar:
1. Una sección **Formación** visualmente integrada en el dashboard, con el branding real de AgntiaPro.
2. Biblioteca con seis colecciones, sus portadas y navegación funcional.
3. Fichas de los **60 ejercicios reales**, sin inventar ni omitir títulos.
4. Reproductor vertical con caption, subtítulos previstos y CTA contextual.
5. Estados diferenciados de visionado, conexión, práctica, aprobación y completado.
6. Experiencia responsive de móvil a escritorio.
7. Documentación de componentes, decisiones UX, rutas, contratos y conexiones futuras.
8. Evidencia de typecheck, build y comprobaciones de frontend, sin fingir pruebas no ejecutadas.

**Fuera de alcance:** OAuth real, Composio conectado, ejecución de SOPs, producción definitiva de los 60 vídeos, activación de cuentas externas, cambios de arquitectura del runtime.

**Criterio final de calidad:** cuando un empleado entre en Formación no debe sentir que ha entrado en una academia de inteligencia artificial. Debe sentir que ha abierto una biblioteca de experiencias útiles, bellas y fáciles de explorar, donde cada vídeo le enseña algo nuevo que puede hacer con LAIA y le ofrece un camino sencillo para probarlo.

**«Deja de aprender la IA y empieza a trabajar con LAIA».**

---

## Nota de trazabilidad

Esta V2 conserva el alcance, la organización de 11 apartados, el lema, las seis colecciones, el reproductor, la reutilización de conexiones, la centralidad de LAIA y Cognition V2 de la prompt original del founder. La amplía con especificaciones de composición, paleta de referencia, estados, accesibilidad, componentes, fases y criterios de aceptación siguiendo el patrón de las prompts maestras UX de AgntiaPro. Es documentación de diseño, **no código ejecutado**.
