# Catálogo de 50 microejercicios · reels

Cada ejercicio: vídeo IA 20–45 s + caption + CTA contextual + prueba real autorizada + resultado comprobable. Los nombres de operaciones son **capacidades propuestas**, no endpoints confirmados de Composio. Todos los efectos externos deben pasar por kernel/SOP; las escrituras requieren aprobación según política.

## organiza tu dia

### R01 · Consulta tu agenda de mañana
- **Hook/reel:** «LAIA, consulta tu agenda de mañana.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Leer agenda y devolver bloques con contexto. Conecta Google Calendar / Outlook Calendar una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Google Calendar / Outlook Calendar; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `calendar.events.read` (identificador conceptual).
- **Ejercicio:** Leer agenda y devolver bloques con contexto; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R02 · Convierte un correo en tarea
- **Hook/reel:** «LAIA, convierte un correo en tarea.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Elegir correo y proponer tarea con referencia. Conecta Gmail / Outlook + Todoist una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Gmail / Outlook + Todoist; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `mail.read + tasks.create` (identificador conceptual).
- **Ejercicio:** Elegir correo y proponer tarea con referencia; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R03 · Reorganiza un bloque de trabajo
- **Hook/reel:** «LAIA, reorganiza un bloque de trabajo.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Proponer cambio de franja y confirmar. Conecta Google Calendar una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Google Calendar; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `calendar.events.update` (identificador conceptual).
- **Ejercicio:** Proponer cambio de franja y confirmar; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R04 · Prepara tu briefing matinal
- **Hook/reel:** «LAIA, prepara tu briefing matinal.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Sintetizar pendientes sin inventar compromisos. Conecta Gmail + Calendar + Tasks una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Gmail + Calendar + Tasks; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `mail.read + calendar.read + tasks.read` (identificador conceptual).
- **Ejercicio:** Sintetizar pendientes sin inventar compromisos; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R05 · Detecta conflictos de reuniones
- **Hook/reel:** «LAIA, detecta conflictos de reuniones.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Comparar eventos y ofrecer alternativas. Conecta Calendar una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Calendar; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `calendar.events.read` (identificador conceptual).
- **Ejercicio:** Comparar eventos y ofrecer alternativas; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R06 · Crea un recordatorio desde la voz
- **Hook/reel:** «LAIA, crea un recordatorio desde la voz.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Transcribir intención y crear recordatorio aprobado. Conecta Todoist una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Todoist; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `tasks.create` (identificador conceptual).
- **Ejercicio:** Transcribir intención y crear recordatorio aprobado; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R07 · Prepara tu modo concentración
- **Hook/reel:** «LAIA, prepara tu modo concentración.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Bloquear tiempo y solicitar reproducción compatible. Conecta Calendar + Spotify una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Calendar + Spotify; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `calendar.events.create + spotify.playback` (identificador conceptual).
- **Ejercicio:** Bloquear tiempo y solicitar reproducción compatible; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R08 · Organiza las prioridades del día
- **Hook/reel:** «LAIA, organiza las prioridades del día.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Ordenar tareas existentes sin alterarlas automáticamente. Conecta Todoist / Asana una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Todoist / Asana; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `tasks.read` (identificador conceptual).
- **Ejercicio:** Ordenar tareas existentes sin alterarlas automáticamente; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R09 · Busca el correo de Marta
- **Hook/reel:** «LAIA, busca el correo de marta.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Buscar por persona y periodo y citar mensaje. Conecta Gmail / Outlook una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Gmail / Outlook; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `mail.search` (identificador conceptual).
- **Ejercicio:** Buscar por persona y periodo y citar mensaje; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R10 · Cierra tu jornada con un resumen
- **Hook/reel:** «LAIA, cierra tu jornada con un resumen.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Resumir trabajo y pendientes verificables. Conecta Calendar + Tasks una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Calendar + Tasks; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `calendar.read + tasks.read` (identificador conceptual).
- **Ejercicio:** Resumir trabajo y pendientes verificables; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

## documentos y conocimiento

### R11 · Encuentra el documento perdido
- **Hook/reel:** «LAIA, encuentra el documento perdido.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Buscar por nombre o contenido permitido. Conecta Google Drive una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Google Drive; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `drive.search` (identificador conceptual).
- **Ejercicio:** Buscar por nombre o contenido permitido; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R12 · Resume un PDF de trabajo
- **Hook/reel:** «LAIA, resume un pdf de trabajo.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Extraer y resumir con referencia al archivo. Conecta Drive una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Drive; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `drive.read` (identificador conceptual).
- **Ejercicio:** Extraer y resumir con referencia al archivo; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R13 · Prepara una presentación
- **Hook/reel:** «LAIA, prepara una presentación.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Proponer estructura y generar borrador si la API lo permite. Conecta Canva una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Canva; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `canva.design.create` (identificador conceptual).
- **Ejercicio:** Proponer estructura y generar borrador si la API lo permite; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R14 · Ordena archivos de un proyecto
- **Hook/reel:** «LAIA, ordena archivos de un proyecto.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Proponer movimientos y pedir confirmación. Conecta Drive una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Drive; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `drive.files.move` (identificador conceptual).
- **Ejercicio:** Proponer movimientos y pedir confirmación; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R15 · Convierte notas en checklist
- **Hook/reel:** «LAIA, convierte notas en checklist.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Leer página y proponer checklist. Conecta Notion una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Notion; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `notion.pages.read + tasks.create` (identificador conceptual).
- **Ejercicio:** Leer página y proponer checklist; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R16 · Compara dos versiones
- **Hook/reel:** «LAIA, compara dos versiones.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Recuperar versiones y resumir diferencias. Conecta Drive una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Drive; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `drive.files.read` (identificador conceptual).
- **Ejercicio:** Recuperar versiones y resumir diferencias; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R17 · Crea un documento de reunión
- **Hook/reel:** «LAIA, crea un documento de reunión.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Crear acta a partir de datos verificados. Conecta Google Docs una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Google Docs; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `docs.create` (identificador conceptual).
- **Ejercicio:** Crear acta a partir de datos verificados; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R18 · Recupera una decisión antigua
- **Hook/reel:** «LAIA, recupera una decisión antigua.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Buscar decisión con enlaces de origen. Conecta Notion una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Notion; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `notion.search` (identificador conceptual).
- **Ejercicio:** Buscar decisión con enlaces de origen; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R19 · Clasifica documentos nuevos
- **Hook/reel:** «LAIA, clasifica documentos nuevos.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Proponer etiquetas o carpetas sin mover sin permiso. Conecta Dropbox / Drive una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Dropbox / Drive; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `files.search + files.update` (identificador conceptual).
- **Ejercicio:** Proponer etiquetas o carpetas sin mover sin permiso; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R20 · Prepara un dossier de proyecto
- **Hook/reel:** «LAIA, prepara un dossier de proyecto.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Seleccionar fuentes y compilar borrador. Conecta Drive + Docs una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Drive + Docs; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `drive.read + docs.create` (identificador conceptual).
- **Ejercicio:** Seleccionar fuentes y compilar borrador; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

## colaboracion

### R21 · Resume lo que pasó en el canal
- **Hook/reel:** «LAIA, resume lo que pasó en el canal.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Leer canal autorizado y sintetizar. Conecta Slack una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Slack; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `slack.messages.read` (identificador conceptual).
- **Ejercicio:** Leer canal autorizado y sintetizar; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R22 · Prepara una reunión de equipo
- **Hook/reel:** «LAIA, prepara una reunión de equipo.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Reunir agenda y documentos vinculados. Conecta Calendar + Drive una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Calendar + Drive; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `calendar.read + drive.read` (identificador conceptual).
- **Ejercicio:** Reunir agenda y documentos vinculados; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R23 · Transforma acuerdos en tareas
- **Hook/reel:** «LAIA, transforma acuerdos en tareas.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Extraer acuerdos de transcripción disponible y proponer tareas. Conecta Zoom + Asana una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Zoom + Asana; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `meeting.read + asana.tasks.create` (identificador conceptual).
- **Ejercicio:** Extraer acuerdos de transcripción disponible y proponer tareas; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R24 · Avisa al equipo de un cambio
- **Hook/reel:** «LAIA, avisa al equipo de un cambio.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Preparar mensaje y enviar con aprobación. Conecta Slack una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Slack; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `slack.messages.send` (identificador conceptual).
- **Ejercicio:** Preparar mensaje y enviar con aprobación; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R25 · Consulta el estado del proyecto
- **Hook/reel:** «LAIA, consulta el estado del proyecto.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Leer tablero y resumir bloqueos. Conecta Trello una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Trello; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `trello.boards.read` (identificador conceptual).
- **Ejercicio:** Leer tablero y resumir bloqueos; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R26 · Crea un ticket de seguimiento
- **Hook/reel:** «LAIA, crea un ticket de seguimiento.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Proponer issue con contexto y origen. Conecta Linear una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Linear; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `linear.issues.create` (identificador conceptual).
- **Ejercicio:** Proponer issue con contexto y origen; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R27 · Prepara el orden del día
- **Hook/reel:** «LAIA, prepara el orden del día.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Construir agenda con enlaces verificables. Conecta Notion + Calendar una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Notion + Calendar; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `notion.read + calendar.read` (identificador conceptual).
- **Ejercicio:** Construir agenda con enlaces verificables; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R28 · Busca una conversación anterior
- **Hook/reel:** «LAIA, busca una conversación anterior.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Localizar mensajes permitidos y citar fuentes. Conecta Teams / Slack una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Teams / Slack; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `messages.search` (identificador conceptual).
- **Ejercicio:** Localizar mensajes permitidos y citar fuentes; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R29 · Distribuye tareas acordadas
- **Hook/reel:** «LAIA, distribuye tareas acordadas.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Crear tareas con responsables validados. Conecta Asana una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Asana; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `asana.tasks.create` (identificador conceptual).
- **Ejercicio:** Crear tareas con responsables validados; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R30 · Prepara el seguimiento del viernes
- **Hook/reel:** «LAIA, prepara el seguimiento del viernes.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Generar borrador de actualización y pedir confirmación. Conecta Slack + Tasks una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Slack + Tasks; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `tasks.read + slack.messages.send` (identificador conceptual).
- **Ejercicio:** Generar borrador de actualización y pedir confirmación; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

## creacion y comunicacion

### R31 · Encuentra inspiración visual
- **Hook/reel:** «LAIA, encuentra inspiración visual.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Buscar referencias para un proyecto. Conecta Pinterest una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Pinterest; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `pinterest.search` (identificador conceptual).
- **Ejercicio:** Buscar referencias para un proyecto; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R32 · Diseña una pieza sencilla
- **Hook/reel:** «LAIA, diseña una pieza sencilla.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Crear un borrador editable donde sea compatible. Conecta Canva una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Canva; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `canva.design.create` (identificador conceptual).
- **Ejercicio:** Crear un borrador editable donde sea compatible; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R33 · Prepara un post profesional
- **Hook/reel:** «LAIA, prepara un post profesional.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Generar borrador sin publicar automáticamente. Conecta LinkedIn una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** LinkedIn; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `linkedin.posts.draft` (identificador conceptual).
- **Ejercicio:** Generar borrador sin publicar automáticamente; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R34 · Convierte notas en contenido
- **Hook/reel:** «LAIA, convierte notas en contenido.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Extraer ideas y generar propuesta creativa. Conecta Notion + Canva una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Notion + Canva; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `notion.read + canva.create` (identificador conceptual).
- **Ejercicio:** Extraer ideas y generar propuesta creativa; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R35 · Busca un tutorial específico
- **Hook/reel:** «LAIA, busca un tutorial específico.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Encontrar vídeos y devolver fuentes. Conecta YouTube una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** YouTube; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `youtube.search` (identificador conceptual).
- **Ejercicio:** Encontrar vídeos y devolver fuentes; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R36 · Prepara un calendario editorial
- **Hook/reel:** «LAIA, prepara un calendario editorial.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Proponer calendario de publicaciones. Conecta Calendar + Notion una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Calendar + Notion; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `calendar.create + notion.create` (identificador conceptual).
- **Ejercicio:** Proponer calendario de publicaciones; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R37 · Reutiliza una presentación
- **Hook/reel:** «LAIA, reutiliza una presentación.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Extraer puntos clave para nuevas piezas. Conecta Drive + Canva una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Drive + Canva; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `drive.read + canva.create` (identificador conceptual).
- **Ejercicio:** Extraer puntos clave para nuevas piezas; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R38 · Prepara respuestas a comentarios
- **Hook/reel:** «LAIA, prepara respuestas a comentarios.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Redactar respuestas para revisión humana. Conecta LinkedIn una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** LinkedIn; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `linkedin.comments.read` (identificador conceptual).
- **Ejercicio:** Redactar respuestas para revisión humana; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R39 · Guarda referencias creativas
- **Hook/reel:** «LAIA, guarda referencias creativas.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Guardar enlaces y notas en colección. Conecta Pinterest + Notion una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Pinterest + Notion; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `pinterest.read + notion.create` (identificador conceptual).
- **Ejercicio:** Guardar enlaces y notas en colección; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R40 · Comparte una propuesta de diseño
- **Hook/reel:** «LAIA, comparte una propuesta de diseño.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Preparar enlace y mensaje para aprobación. Conecta Canva + Slack una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Canva + Slack; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `canva.read + slack.send` (identificador conceptual).
- **Ejercicio:** Preparar enlace y mensaje para aprobación; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

## vida digital

### R41 · Pon música para concentrarte
- **Hook/reel:** «LAIA, pon música para concentrarte.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Seleccionar playlist y controlar dispositivo compatible. Conecta Spotify una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Spotify; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `spotify.playback` (identificador conceptual).
- **Ejercicio:** Seleccionar playlist y controlar dispositivo compatible; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R42 · Prepara tu ruta a una reunión
- **Hook/reel:** «LAIA, prepara tu ruta a una reunión.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Leer ubicación del evento y proponer trayecto. Conecta Google Maps + Calendar una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Google Maps + Calendar; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `calendar.read + maps.routes` (identificador conceptual).
- **Ejercicio:** Leer ubicación del evento y proponer trayecto; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R43 · Organiza una salida de equipo
- **Hook/reel:** «LAIA, organiza una salida de equipo.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Buscar lugares y preparar invitación. Conecta Maps + Calendar una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Maps + Calendar; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `maps.places + calendar.create` (identificador conceptual).
- **Ejercicio:** Buscar lugares y preparar invitación; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R44 · Guarda una idea espontánea
- **Hook/reel:** «LAIA, guarda una idea espontánea.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Convertir nota de voz en apunte. Conecta Notion una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Notion; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `notion.pages.create` (identificador conceptual).
- **Ejercicio:** Convertir nota de voz en apunte; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R45 · Prepara tu lista personal
- **Hook/reel:** «LAIA, prepara tu lista personal.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Añadir tareas personales con conexión propia. Conecta Todoist una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Todoist; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `todoist.tasks.create` (identificador conceptual).
- **Ejercicio:** Añadir tareas personales con conexión propia; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R46 · Encuentra una cafetería para trabajar
- **Hook/reel:** «LAIA, encuentra una cafetería para trabajar.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Buscar lugares con criterios del usuario. Conecta Google Maps una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Google Maps; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `maps.places` (identificador conceptual).
- **Ejercicio:** Buscar lugares con criterios del usuario; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R47 · Consulta tu actividad deportiva
- **Hook/reel:** «LAIA, consulta tu actividad deportiva.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Resumir actividades autorizadas. Conecta Strava una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Strava; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `strava.activities.read` (identificador conceptual).
- **Ejercicio:** Resumir actividades autorizadas; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R48 · Planifica tus vacaciones
- **Hook/reel:** «LAIA, planifica tus vacaciones.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Consultar días libres y crear propuesta de agenda. Conecta Calendar una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Calendar; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `calendar.read + calendar.create` (identificador conceptual).
- **Ejercicio:** Consultar días libres y crear propuesta de agenda; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R49 · Revisa tus suscripciones
- **Hook/reel:** «LAIA, revisa tus suscripciones.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Buscar recibos y preparar inventario, sin cancelar. Conecta Gmail una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Gmail; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `mail.search` (identificador conceptual).
- **Ejercicio:** Buscar recibos y preparar inventario, sin cancelar; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

### R50 · Prepara una rutina de fin de semana
- **Hook/reel:** «LAIA, prepara una rutina de fin de semana.» Demostrar la petición, la vista previa y el resultado sin simular éxito.
- **Caption:** «Proponer plan multiapp con permisos independientes. Conecta Calendar + Maps + Spotify una sola vez y prueba esta experiencia con LAIA. Si ya lo conectaste, continúa directamente.»
- **Conector(es):** Calendar + Maps + Spotify; validar cobertura y scopes antes de publicarlo.
- **Capacidad propuesta:** `calendar.read + maps.places + spotify.playback` (identificador conceptual).
- **Ejercicio:** Proponer plan multiapp con permisos independientes; confirmar efectos externos y mostrar recibo o error real.
- **CTA:** Conectar aplicación → Pruébalo con LAIA → Ver resultado.
- **Aprendizaje:** identificar qué dato se usa, qué permiso se concede y qué acción requiere confirmación.

