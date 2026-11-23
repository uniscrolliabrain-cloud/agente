# PROMPT MAESTRA V3 — FORMACIÓN · TRABAJA CON LAIA

> **Biblioteca audiovisual con lógica Spotify, identidad AgntiaPro.** Revisión profunda de la prompt maestra V2 y de la prompt extensa aportada por el founder el 23/11/2026. Documento UX/UI de diseño; **no acredita implementación ni integraciones reales**.

## 00 · MANDATO Y PRECEDENCIA

Eres diseñador senior de producto y desarrollador de interfaces. Tu misión es convertir Formación en una **biblioteca audiovisual de trabajo con LAIA** que tenga la familiaridad, continuidad y profundidad de uso de Spotify, pero que se vea como AgntiaPro desde el primer píxel. No diseñes una academia tradicional ni un clon de marca ajena.

Precedencia: (1) decisiones del founder y lema literal; (2) landing y Studio Demo aprobados y tokens reales; (3) shell/navegación de AgntiaPro; (4) catálogo documental de 60 ejercicios; (5) esta prompt; (6) criterios razonados. Las cifras de maqueta son orientativas donde contradigan código, accesibilidad o verdad funcional.

Antes de construir lee: `apps/ui-lab/docs/dashboards/02-login/PROMPT-MAESTRA-LOGIN-V2.md`, `../11-apps/PROMPT-MAESTRA-APPS-V2.md`, `../19-general/NOMENCLATURA-UI-FINAL.md`, `./UX-FORMACION.md`, `./CONTRATOS-Y-DATOS.md`, `./ARQUITECTURA-Y-SEGURIDAD.md`, `./PRODUCCION-Y-CAPTIONS.md` y ambos archivos de ejercicios. Inspecciona los componentes, CSS y assets efectivos del frontend. Documenta divergencias.

---

## 01 · IDENTIDAD Y PROMESA

Nombre: **Formación · Trabaja con LAIA**. Lema literal: **«Deja de aprender la IA y empieza a trabajar con LAIA».** Mantén «la IA» separado y «LAIA» en mayúsculas. La experiencia enseña tareas de trabajo cotidiano mientras la persona utiliza el software, no cursos académicos.

Usuario: empleado o owner de una pyme; ejemplo sintético Ana Ferrer. LAIA es compañera digital visible, no una profesora robot. Su avatar usa los activos aprobados; si no están disponibles, un monograma editorial de LAIA con acento dorado, sin inventar fotografías ni una identidad nueva.

No usar: exámenes, diplomas, rankings, notas, streaks adictivos, vídeos eternos, panel de analítica, jerga técnica visible o popups de conexión antes de explorar.

---

## 02 · EL CAMBIO FUNDAMENTAL: MODELO SPOTIFY

No basta con seis tarjetas en un grid. Diseña el producto como un **sistema de consumo audiovisual con contexto persistente**:
- **Inicio:** descubrimiento y continuidad; parecido funcionalmente al Home de una biblioteca musical.
- **Buscar:** búsqueda universal del catálogo, colecciones, series, temas, apps y ejercicios.
- **Tu biblioteca:** guardados, «Mi lista», favoritos, historial, colecciones seguidas y pendientes; no una pestaña administrativa.
- **Ahora suena / Ahora ves:** un reproductor que sobrevive a navegación interna.
- **Cola:** qué se reproduce después, reordenable solo en demo si se implementa realmente.
- **Serie/colección:** página editorial con portada, metadatos, lista de episodios y acciones de guardar/compartir.
- **Descubrimiento contextual:** estanterías horizontales, portadas y recomendaciones, con un criterio honesto.
- **Práctica:** CTA del ejercicio asociado al vídeo, no una pantalla separada de tecnología.

La metáfora es playlist/álbum/podcast/reproductor, **no** música de fondo ni streaming de audio ajeno. Los vídeos son demostraciones propias de acciones con LAIA. La interacción entre biblioteca, reproductor, cola y ficha debe sentirse unitaria.

---

## 03 · BRANDING REAL AGNTIAPRO

La landing y Studio Demo mandan. Referencias documentales sujetas a validación con tokens actuales: fondo cálido `#FDFBF7`, marfil `#F4EEE3`, superficie blanca `#FFFFFF`, borde `#E8DFD2`, tinta `#211D18`, texto secundario `#3A332C`, muted `#85796A`, violeta de acción `#5B4BDB`, hover `#4A3FB8`, violeta suave `#ECE9FF`, lavanda `#E7E2F7`, oro LAIA `#C9A86A`. Estado éxito `#E6F4EA`, pendiente `#FEF3C7`, error `#FDE8E8`.

**Fraunces** solo para hero, nombre grande de serie y colecciones; **Manrope** para controles, títulos de reel, descripciones y navegación. Radios amplios, bordes finos, sombras sutiles, iconos del sistema compartido. Fotografía editorial/arte de portada coherente, no imágenes de stock frías. No usar verde Spotify `#1DB954`, fondo negro general, logos de Spotify/Netflix/YouTube ni interfaz idéntica. Un panel de vídeo puede ser oscuro para legibilidad; no convertir la app en dark mode.

Proporciones: portada de serie 4:3 o 16:9, portada de colección 1:1, reel 9:16, fila de episodio con miniatura 16:9. Mantener coherencia sin uniformar todo en rectángulos repetidos. La expresión visual debe proceder de portadas y tipografía, no de degradados grandes o partículas.

---

## 04 · SHELL Y NAVEGACIÓN

**No construir otro sistema de navegación global.** Formación vive dentro de la navegación existente de AgntiaPro. El menú principal, chat transversal, perfil y ajustes pertenecen al shell; no duplicarlos.

Dentro de Formación sí hay navegación **local** como en una biblioteca audiovisual: `Inicio`, `Buscar`, `Tu biblioteca` y contexto `Reproduciendo`. En escritorio puede ser una columna de biblioteca local discreta si el ancho y el shell lo permiten; en móvil una fila de pestañas o control segmentado compacto. No añadir una segunda bottom nav global que compita con la de la app.

No fabricar una status bar de teléfono con 20:01, 5G y batería 70% en producción. Solo se admite como marco visual del laboratorio si este ya dispone de modo dispositivo. No crear tabs globales «Mapa / Formación / Procesos / Proyectos / Clientes» dentro de la pantalla: esas rutas pertenecen al producto principal.

Mantener rutas/deep links para volver a serie, episodio y punto de reproducción. El botón atrás devuelve a la biblioteca sin detener el reproductor; al abrir otro ejercicio cambia la cola y el contenido activo.

---

## 05 · COMPOSICIÓN DESKTOP: BIBLIOTECA DE VERDAD

Desktop 1200–1440 px: estructura editorial en tres zonas **solo si el shell deja espacio**: biblioteca local estrecha (colecciones guardadas y filtros), contenido central de descubrimiento y panel opcional de «Ahora ves»/detalles. Si la app ya tiene sidebar global, no apilar dos sidebars pesadas; convertir la biblioteca local en panel plegable o tabs.

En la parte superior: saludo discreto o título «Trabaja con LAIA», buscador accesible, acceso a guardados. Debajo: **hero audiovisual destacado** con portada de «IA Act · Guía práctica para pymes» cuando exista en el catálogo de series, acciones «Reproducir» y «Guardar», metadatos verificados. El hero es una puerta a la serie, no una reproducción falsa por defecto.

Siguiente bloque: «Continúa donde lo dejaste» con tarjetas horizontales y progreso. Después estanterías «Empieza con LAIA», «Organiza tu día», «Documentos y conocimiento», «Colaboración», «Creación y comunicación», «Vida digital» y «Para ti». En vez de un grid monótono, combinar carruseles de portadas, filas de episodios y una o dos portadas editoriales.

La biblioteca tiene profundidad: abrir portada muestra página de colección, lista ordenada, botón de reproducir/continuar, guardar, compartir y menú contextual. El reproductor permanece en una franja inferior **dentro del área de Formación**, sin tapar chat ni controles del shell. El contenido reserva espacio para él.

---

## 06 · COMPOSICIÓN MÓVIL: LA EXPERIENCIA ES EL PRODUCTO

Móvil 320–430 px: la interfaz ocupa el ancho real del dispositivo, no una maqueta de teléfono centrada dentro de la web. Encabezado compacto; controles locales Inicio/Buscar/Biblioteca; portada destacada; carruseles de desplazamiento táctil; cards de colección de tamaño generoso; lista de episodios clara.

**Mini-player persistente** encima de la navegación global real cuando exista; respetar `env(safe-area-inset-bottom)`. Miniatura 40–48 px, título en una línea, estado, play/pause y abrir reproductor; barra de progreso fina. No duplicar el mini-player si el usuario ya está en la pantalla completa de reproducción.

Al tocar mini-player se abre **Now Playing** en hoja a pantalla completa o ruta modal, con vídeo 9:16, subtítulos, caption, cola, anterior/siguiente y CTA «Conectar / Pruébalo con LAIA». La hoja puede arrastrarse para cerrar solo si existe alternativa accesible. Evitar overlays que bloqueen el contenido o tapen botones.

La biblioteca y las listas siguen siendo desplazables, sin scroll horizontal global. Carruseles pueden desplazarse horizontalmente pero con botones y accesibilidad de teclado. Animación suave; respetar reduced motion.

---

## 07 · HERO EDITORIAL Y SERIE DESTACADA IA ACT

La prompt original adjunta presenta una serie de ejemplo **«IA Act · Guía práctica para pymes»** con seis episodios y una portada de vídeo. Conservarla como **serie editorial adicional de demostración**, claramente diferenciada de las **seis colecciones de diez ejercicios**. No declarar que esos seis episodios son seis de los 60 ejercicios, ni añadirlos a su contador sin una decisión editorial posterior.

Portada de serie: arte audiovisual con contraste, titular Fraunces «IA Act», subtítulo «Qué es, a quién afecta y cómo cumplirla», etiqueta «Serie · IA en la empresa», botón play central o CTA fuera de la imagen. Colores violeta/tinta/dorado en la imagen permitidos de manera contenida; el resto de UI sigue claro.

Ficha de serie: portada + título «IA Act · Guía práctica para pymes» + metadatos reales o explícitamente ilustrativos + acciones Reproducir, Guardar en Mi lista, Compartir y Ver cola. Tabs locales «Episodios / Resumen / Recursos / Transcripción»; no prometer PDFs o transcripciones inexistentes. Si no hay vídeo, mostrar «Vídeo pendiente de producción» y no inventar una duración reproducible.

Los seis episodios ilustrativos de la prompt aportada, **no verificados como material producido**, son:
1. Qué es el IA Act — Objetivos, alcance y nivel de riesgo — 8:32 (duración de maqueta).
2. Obligaciones para tu empresa — Registro, evaluación y documentación — 6:45.
3. Cómo usar la IA de forma segura — Buenas prácticas, prompts y control — 7:18.
4. GDPR y IA: lo que debes tener en cuenta — Datos, consentimiento y privacidad — 9:02.
5. Empieza con LAIA — Tu primera semana trabajando con LAIA — 5:40.
6. Conecta tu agenda — Prueba con LAIA y Google Calendar — 4:12.

Estas duraciones son **fixtures visuales**, no contenidos reales. Evitar promesas legales simplistas sobre el AI Act o RGPD; cualquier recurso jurídico publicado exige validación de contenido. En el prototipo mostrar «Serie de ejemplo».

---

## 08 · LAS SEIS COLECCIONES Y LOS 60 EJERCICIOS

Inventario obligatorio y separado de la serie IA Act:
1. **Organiza tu día** — 10 ejercicios — correo, agenda, tareas, productividad.
2. **Documentos y conocimiento** — 10 — archivos, búsquedas, resúmenes, documentos.
3. **Colaboración** — 10 — comunicación, reuniones, proyectos.
4. **Creación y comunicación** — 10 — contenido, diseño, publicaciones.
5. **Vida digital** — 10 — aplicaciones personales, organización cotidiana.
6. **Empieza con LAIA** — 10 — introducción profesional al trabajo con IA.

Fuente única de títulos y descripciones: `ejercicios/50-reels.md` y `ejercicios/10-introduccion.md`. IDs `R01–R50` y `P01–P10`. No inventar los diez títulos de «Organiza tu día» a partir de ejemplos de la prompt, pues algunos pertenecen a otras colecciones. No asignar 0:32 a todo el catálogo sin evidencia. Si faltan assets, mostrar portadas de placeholder con etiqueta de producción.

Cada colección: portada cuadrada distintiva dentro de la paleta; botón Reproducir/Continuar; diez filas con miniatura, título, subtítulo, estado, duración si existe, menú de guardar/compartir; barra de progreso discreta; «Siguiente» inteligente. Portadas de ejemplo: violeta (Organiza), tinta (Documentos), lavanda (Colaboración), dorado moderado (Creación), verde suave solo como estado/arte secundario (Vida digital), violeta+acento oro (Empieza con LAIA). No utilizar el verde de Spotify.

---

## 09 · INTERACCIONES SPOTIFY QUE DEBEN FUNCIONAR

**Play/pause** modifica el reproductor activo, no lanza un toast que dice «reproduciendo» sin vídeo. **Siguiente/anterior** respeta la cola; al finalizar puede avanzar si el usuario habilitó reproducción continua. **Seek** solo si existe media reproducible. **Guardar en Mi lista** cambia estado persistente del usuario y aparece en Biblioteca. **Favoritos** son una lista de ejercicios, no un corazón aislado sin destino. **Compartir** copia un deep link real de la vista o indica claramente que el enlace es de demo. **Descargar** solo cuando exista archivo y permiso; en caso contrario botón deshabilitado y explicación, nunca simular descarga. **Playlist** abre una lista real; no un aviso vacío. **Más** ofrece acciones que existan (guardar, compartir, ver colección, quitar de lista).

**Cola:** mostrar «A continuación», orden de ejercicios, colección de origen y posibilidad de seleccionar un elemento. No mezclar cola de la serie IA Act con los 60 reels por accidente. **Volver** conserva tiempo y contexto. **Buscar** filtra el catálogo real y enlaza al ejercicio. **Continuar** reanuda la posición guardada, no reinicia siempre en el primer episodio.

Las transiciones entre portada, ficha y Now Playing son coherentes y reversibles. El mini-player solo aparece cuando hay un elemento cargado. En una demo sin vídeo, el botón «Ver ficha» sustituye a «Reproducir» y el mini-player no simula audio ni progreso.

---

## 10 · REPRODUCTOR COMPLETO Y FICHA

El vídeo es protagonista: reel vertical 9:16, controles discretos y accesibles, subtítulos si hay vídeo, caption de 13–14 px, contexto del ejercicio, chips de servicios nombrados en texto y CTA claro. En desktop el reproductor puede estar al lado de la ficha; en móvil ocupar la pantalla y colocar caption en panel inferior expandible.

Estados de media: sin asset, cargando, listo, reproduciendo, pausado, terminado, error, sin subtítulos, subtítulos disponibles. Progreso de vídeo separado del progreso de práctica. No autoiniciar sonido. No bloquear el usuario por no conectar una aplicación. Cuando se cambia de reel, actualizar portada, caption, servicio requerido, cola y acciones en un solo estado compartido.

La serie IA Act tiene episodios largos; los 60 ejercicios son **reels cortos** (habitualmente 20–45 s, según fuente). Usar la misma infraestructura de reproducción, con dos tipos de contenido diferenciados. No forzar una duración de 8:32 a un reel.

---

## 11 · CAPTION Y CONECTAR MIENTRAS APRENDES

Debajo de cada vídeo: «✦ Qué vas a conseguir», descripción breve en voz de LAIA, servicios implicados, resultado esperado y acción principal. Ejemplo «LAIA, organiza mi agenda de mañana» → Google Calendar → «Conectar Google Calendar» → «Pruébalo con LAIA» → revisión/resultado.

**Estados:**
- No requiere integración: «Practicar con LAIA».
- Requiere integración y no está conectada: «Conectar [servicio]».
- Conectada con permisos válidos: «Pruébalo con LAIA».
- Conectada pero sin scope suficiente o caducada: «Revisar permisos» / «Volver a conectar».
- Escritura o envío sensible: «Revisar y aprobar».
- Completado con evidencia: «Completado · Repetir».
- Proveedor no disponible: «Ver demostración» / «Próximamente».
- Error: explicación y reintento seguro.

**Prohibido:** hacer `setConectada(true)` y mostrar «Conectado. Ahora puedes probarlo de verdad» en una demo sin OAuth. Para una maqueta, un control separado «Simular estado conectado» rotulado **Demostración**, sin engañar al usuario. El CTA operativo real se habilita únicamente por el estado confirmado del backend. No guardar tokens ni secretos en el navegador.

---

## 12 · LAIA Y LA PRÁCTICA GUIADA

LAIA aparece como interlocutora humana y profesional. Ejemplos de voz: «LAIA, ¿qué tengo mañana?», «LAIA, encuentra aquel correo», «LAIA, prepara mi reunión», «LAIA, ponme música para concentrarme». Los ejemplos no reemplazan títulos reales del catálogo.

La práctica puede abrir un panel conversacional contextual que muestre la petición editable, vista previa del resultado, permisos, aprobación cuando corresponda y recibo. Si no hay backend, presentar **ejemplo visual**, no respuesta ficticia que afirme haber consultado agenda, enviado correo o completado una tarea. En demo, «Aprobar» no puede cambiar un ejercicio a completado real; solo demostrar el estado en un fixture claramente rotulado.

Mantener el chat transversal de AgntiaPro como superficie real. No crear otro chat universal independiente dentro de Formación. El panel de práctica puede ser una variante de la conversación existente con contexto del ejercicio.

---

## 13 · MI BIBLIOTECA, PLAYLISTS Y RECOMENDACIONES

**Tu biblioteca** debe sentirse como el lugar donde vuelves: «Mi lista», «Guardados», «Continuar», «Completados», «Colecciones seguidas» y «Recientes». Priorizar lo útil; no mostrar seis filtros vacíos a la vez. Una playlist es una secuencia de ejercicios con orden, no un simple botón. Crear playlist solo si existe interfaz para nombrarla, añadir y quitar elementos; si no, limitar MVP a «Mi lista» y cola automática.

**Recomendados para ti**: usar reglas explicables como ejercicios no vistos de colecciones iniciadas o relacionados con conectores ya autorizados. Si se usa una demo, «Sugerencias de ejemplo» y datos ficticios explícitos. Nunca inferir un perfil empresarial privado sin permisos. No presentar una inteligencia de recomendación no implementada.

Progreso: `unseen → watched → connection_ready → attempted → completed`, con `blocked/failed/skipped`. «Visto» ≠ «Conectado» ≠ «Completado». Mostrar continuidad del vídeo y evidencia de práctica por separado. Una conexión revocada no borra aprendizaje, pero impide nuevas operaciones.

---

## 14 · ESTADO, PERSISTENCIA Y CONTRATOS

Estado visual compartido: `activeMediaId`, `mediaKind` (reel/serie), `isPlaying`, `positionSeconds`, `queueIds`, `collectionId`, `savedIds`, `favoriteIds`, `activeLocalTab`, `playerExpanded`, `captionExpanded`, `searchQuery`, `exerciseProgress`, `connectionStatusByScope`.

En demo, persistir solo favoritos, posición y guardados **si el laboratorio lo permite**, con clave de espacio aislada. No persistir estados falsos de OAuth como permisos reales. El estado de conexión debe venir de contrato de backend y estar ligado a identidad, tenant, proveedor, cuenta, scopes y caducidad. Nunca reutilizar una conexión entre tenants sin autorización.

Modelo de contenido: `id`, `kind`, `collectionId`, `title`, `subtitle`, `caption`, `durationSeconds?`, `mediaAssetUrl?`, `thumbnail?`, `providerIds[]`, `requirements[]`, `availability`, `progress`, `transcript?`. Campos ausentes se representan como ausentes; no inventar duraciones, vídeos ni recursos.

---

## 15 · ARQUITECTURA Y SEGURIDAD

Cognition V2 es el puente definitivo objetivo. El LLM propone, el kernel valida permisos, el runtime determinista ejecuta SOPs tipados, Composio puede actuar como proveedor de conectividad. La UI no ejecuta herramientas externas ni crea un segundo motor de acciones.

Esta campaña visual no implementa OAuth, Composio, SOP executor, pagos, acceso bancario ni escrituras. Cualquier integración de ejemplo muestra **Demostración**. Cuando se habilite el backend, pedir confirmación y aplicar aprobaciones, auditoría, recibos, idempotencia y revocación. No exponer credenciales, datos personales ni información real de clientes en fixtures.

---

## 16 · COMPONENTES REUTILIZABLES

Componentes sugeridos, sujetos al árbol real: `FormationHome`, `FormationLocalNav`, `FeaturedSeries`, `CollectionShelf`, `CollectionCover`, `CollectionDetail`, `EpisodeRow`, `ExerciseCard`, `MediaQueue`, `MiniPlayer`, `NowPlaying`, `ReelPlayer`, `ExerciseCaption`, `ConnectionCTA`, `PracticePanel`, `FormationLibrary`, `FormationSearch`, `ProgressStatus`.

Separar datos, estado, visuales y adaptadores. No escribir un App.tsx monolítico ni duplicar index.css global. Reutilizar botones, overlays, tipografía y estados de AgntiaPro. En UI Lab registrar preview solo cuando haya un componente renderizable real. No confundir la documentación con código ya creado.

---

## 17 · INTERACCIONES Y MICRODETALLES

Hover de portada: revelar play en desktop, sin depender de hover en móvil. Selección de episodio: resaltar fila actual con violeta suave y pequeña señal «Reproduciendo» solo si hay reproducción real. Guardar: corazón o bookmark con respuesta visible, reversible y sincronizada con Mi lista. Elipsis: menú contextual real. Progreso de vídeo: línea fina; progreso de colección: indicador separado. Cambios de pantalla: transiciones 150–220 ms si el sistema lo permite y reduced motion respetado.

La sensación de Spotify viene de que **todo está conectado**: tocar una portada cambia contexto, tocar un episodio cambia reproductor, cerrar la hoja devuelve a la biblioteca, continuar recupera la posición, guardar alimenta Mi lista, terminar propone el siguiente. Ningún control debe quedarse en toast decorativo.

Los botones «Compartir», «Descargar», «Transcripción» y «Recursos» solo están activos cuando existe la funcionalidad o el asset; de lo contrario mostrar explicación honesta y no fingir éxito.

---

## 18 · PRUEBAS Y CRITERIOS DE ACEPTACIÓN

Verificar responsive 320, 390, 768, 1024 y 1440 px; teclado, lector de pantalla, foco visible, contraste, safe area, reduced motion, captions y errores. Probar flujos: abrir Inicio → serie → episodio → minimizar → buscar → volver → reanudar; guardar → Biblioteca → quitar; colección → reel → siguiente; conectar (demo) → estado visual sin falsa autorización; permisos insuficientes; vídeo no disponible.

Typecheck y build del frontend afectado; smoke del laboratorio; inspección visual comparada con landing y Studio Demo; registrar qué se ejecutó de verdad. Un build verde no prueba despliegue. No cambiar el runtime ni otras pantallas por esta tarea.

**Entrega futura:** interfaz completa y modular, seis colecciones/60 fichas del catálogo, serie IA Act separada como ejemplo editorial, reproductor persistente, biblioteca, búsqueda, cola, CTA contextual, responsive, documentación de contratos y evidencia de tests. Si no hay vídeos, entregar UI honesta de portadas y fichas, no playback ficticio.

---

## 19 · CRITERIO FINAL

Al entrar, una persona debe reconocer la **lógica de Spotify**: descubrir, abrir una colección, ver episodios, reproducir, guardar, continuar y volver a su biblioteca. Al mirarla, debe reconocer **el branding de AgntiaPro**: marfil, violeta, Fraunces/Manrope, superficies limpias y LAIA. Al usarla, debe descubrir que el vídeo no termina en entretenimiento: conduce a **hacer algo útil con LAIA**.

No sacrificar la profundidad de producto por un mockup bonito ni sacrificar la belleza por una pantalla llena de controles. **«Deja de aprender la IA y empieza a trabajar con LAIA».**
