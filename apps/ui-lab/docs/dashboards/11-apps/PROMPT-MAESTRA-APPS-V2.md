# PROMPT MAESTRA V2 — AgntiaPro Apps · metadashboard adaptativo

> Adaptación extensa de la prompt original aportada por el founder. Conserva las 17 secciones y el detalle de interacción, pero corrige los conflictos de branding, arquitectura y catálogo real. Ver [auditoría](./AUDITORIA-PROMPT-V2.md).

```txt
PROMPT ULTRA-LARGA — UX DESIGN / LINEAR / FIGMA — ESPECIFICACIÓN V2 ADAPTADA A AGNTIAPRO
PROYECTO: "AgntiaPro · Apps — catálogo adaptativo de módulos/workspaces"

OBJETIVO ABSOLUTO:
Diseña una interfaz de Apps premium, funcional y verificable, fiel a la intención
del founder y a la identidad REAL de la landing y Studio Demo de AgntiaPro.
Conserva la riqueza de las interacciones descritas en esta prompt, pero NO
interpretes los ejemplos sintéticos como datos reales ni los nombres propuestos
como sustitutos de los 35 workspaces registrados. El sistema de diseño vivo
y sus tokens efectivos son la fuente de verdad: inspecciónalos antes de codificar.
Las medidas de esta prompt son referencias de composición, no órdenes que
obliguen a romper accesibilidad, responsive o el branding existente.

PRIORIDAD DE FUENTES:
1. Instrucciones explícitas del founder sobre la sección Apps.
2. Landing premium + Studio Demo reales y guía de branding vigente.
3. Registro de 35 workspaces existentes en apps/web/src/workspaces.
4. Esta prompt para jerarquía, navegación, microinteracciones y escenarios demo.
5. Decisiones razonadas documentadas donde haya conflictos.

ROL QUE DEBES ASUMIR:
Eres un Product Designer Senior estilo Linear + Figma + Android OS + iOS Home,
obsesionado con:
- jerarquía visual clarísima
- aire, respiración, densidad baja, nada de launcher denso tipo cajón de apps de Android viejo
- radio grande, bordes finos, sombras sutiles
- tipografía editorial para títulos + UI geométrica limpia para el resto
- consistencia total de tokens
- estados visibles, nunca ambiguos
- microcopy en español de España, cercano, profesional, sin anglicismos innecesarios

QUÉ ES Y QUÉ NO ES:
ES: Agntia Apps.
ES: el metadashboard de la SECCIÓN APPS de AgntiaPro, NO el OS completo.
ES: la pantalla que ves cuando enciendes tu móvil Android, pero en branding AgntiaPro.
ES: en PC, la misma lógica adaptada: más ancho, más aire, misma jerarquía.
ES: una App Store / Home de módulos: cada workspace agéntico es una App.
ES: 35 workspaces registrados HOY, mostrados como Apps; catálogo ampliable con miniapps.
ES: desplazamiento vertical natural y rejilla adaptable. Priorizar iconos legibles y aire;
    NO exigir 20 apps simultáneamente en un teléfono pequeño.
ES: algorítmica: un algoritmo examina tu uso GENERAL (histórico) + tu uso EN ESE INSTANTE
    (qué estás haciendo ahora, qué hora es, qué cliente, qué urgencia) y te acerca arriba
    lo que más necesitas. Eso es el metadashboard. No es una lista alfabética muerta.
NO ES: landing.
NO ES: un sustituto del Centro de Mando (que SÍ figura en el catálogo de Apps).
NO ES: Estudio de Operaciones.
NO ES: un sustituto de WhatsApp (que SÍ puede abrirse desde Apps).
NO ES: un sustituto de Teléfono (superficie de Comunicaciones, no uno de los 35 identificadores).
NO ES: Slack.
NO ES: Analítica.
NO ES: un launcher de Android copiado con iconos de Google.
NO ES: marketplace público de terceros. Las Apps son módulos AgntiaPro; los nombres técnicos actuales pueden mencionar productos de referencia o integraciones, sin adoptar sus logos.
NO ES: un dashboard denso de KPIs.

USUARIO Y CONTEXTO:
Usuaria: Ana Ferrer — Admin — avatar AF negro con punto verde online.
Workspace: Interfaz Studio / ACME · PYME.
Caso central que atraviesa TODO: Propuesta ACME + Factura vencida 1042 + Lanzamiento otoño 2026.
Hora ejemplo: 10:05, martes. LAIA sabe que Ana está en #ventas, con ACME pendiente,
y por eso sube arriba: LAIA, Ventas, Facturación, Propuesta ACME.
Si fuera por la mañana temprano, subiría: Hoy, Calendario, Correo.

============================================================
1. SISTEMA DE DISEÑO — TOKENS DE REFERENCIA, VALIDAR CONTRA BRANDING
============================================================

COLORES — HIPÓTESIS DE LA PROMPT ORIGINAL; CONTRASTAR CON TOKENS REALES:
--bg: #FDFBF7 — fondo principal, warm white, casi blanco cálido
--bg-home: #FDFBF7 en móvil, #F4EEE3 muy sutil en PC detrás de las cards si hace falta
--ivory: #F4EEE3 — marfil para hover, fondos secundarios, dock, carpetas
--border: #E8DFD2 — borde 1px en TODAS las cards, header, dock, buscador, carpetas
--ink: #211D18 — texto principal
--muted: #85796A — texto secundario, subtítulos, horas, descripciones
--violet: #5B4BDB — color primario, botones, LAIA ON, seleccionado, badge "Para ti"
--violet-strong: #5B4BDB a #7C5CFF — SOLO degradado sutil en icono LAIA y en botón "Abrir LAIA"
--lav: #E7E2F7 — lavanda, fondos de iconos
--violet-soft: #ECE9FF — fondo suave violeta para seleccionado, sugerencias, chips
--gold: #C9A86A — SOLO para "— LAIA —", ✦ de LAIA, y "LAIA sugiere"
--surface: #FFFFFF — cards blancas, iconos sobre blanco, dock
--black: #211D18 / #111 — botones negros, dock activo, texto principal
--pink: #FDE8E8 — urgente, riesgo, factura vencida, badge "Urgente"
--pink-text: #B91C1C
--amber: #FFF3C4 / #FEF3C7 — pendiente, aprobación, "Pendiente de ti"
--amber-text: #92400E
--green: #E6F4EA / #DCFCE7 — resuelto, en línea, "Listo"
--green-text: #166534
--green-dot: #2BA84A — punto online
--blue-soft: #DBEAFE — "Falta un dato"
--orange: #F97316 — solo para un icono de alerta / Soporte

COLORES DE ICONOS DE APPS — PALETA PROPIA AGNTIAPRO, NO GOOGLE:
Cada App tiene su propio logo cuadrado, NO logo de terceros.
Usa SOLO estos fondos para iconos, con icono lucide blanco o violeta oscuro dentro:
- Violeta #5B4BDB: LAIA, Ventas, Propuestas, Clientes, Operaciones
- Negro #211D18: Centro de Mando, Chat, Teléfono, Archivos
- Marfil #F4EEE3 con icono #211D18: Calendario, Notas, Documentos, Tareas
- Lavanda #E7E2F7 con icono #5B4BDB: Analítica, Correo, Marketing, Diseño
- Dorado #C9A86A con icono blanco: LAIA Pro / LAIA Plus (solo LAIA)
- Verde suave #DCFCE7 con icono #166534: Facturación, Cobros, Pagos
- Rosa suave #FDE8E8 con icono #B91C1C: Alertas, Urgente, Fallos
- Ámbar #FEF3C7 con icono #92400E: Aprobaciones, Pendientes, Revisión
- Azul suave #DBEAFE con icono #1E40AF: Equipo, RRHH, Formación
- Naranja suave #FFEDD5 con icono #9A3412: Soporte, Mantenimiento
- Gris #E7E5E4 con icono #44403C: Ajustes, Seguridad, Integraciones

PROHIBIDO ABSOLUTO:
- fondo oscuro general — SOLO widget LAIA puede ser oscuro si se decide, pero en esta versión TODO claro
- degradados morados grandes — SOLO degradado sutil en icono LAIA
- partículas, dots decorativos, confetti, wallpapers de Android
- verde WhatsApp #25D366, azul Gmail, rojo YouTube, colores Google
- logos de Google, Apple, WhatsApp, Meta, Slack, Gmail, Outlook, Shopify, Notion
- iconos de apps de terceros. TODOS los iconos son AgntiaPro, con lucide-react.
- densidad alta tipo cajón de apps Android viejo
- KPIs densos, gráficos, barras, donuts

TIPOGRAFÍA:
- Títulos grandes / "Agntia Apps" / "Buenos días, Ana" / nombres de sección:
  Fraunces, serif, weight 600-700. Clase font-serif-x
- TODO lo demás: Manrope, sans-serif, 400 / 500 / 600 / 700 / 800
- Labels de sección: 10-11px, UPPERCASE, letter-spacing 0.12em, weight 800, color --muted
  Ejemplos: "PARA TI AHORA", "TU DÍA", "TODAS LAS APPS · 35", "SIGUE TRABAJANDO",
  "CARPETAS", "RECIENTES", "SUGERENCIAS DE LAIA"
- Nombre de App en grid: 11-12px, medium, centrado, 2 líneas máximo, truncate
- Nombre de App en lista: 14px, semibold
- Descripción App: 12px, color --muted
- Botones: 12-13px, bold

RADIOS:
- Icono App en grid: 22-24px (squircle Android: rounded- aprox, NO círculo perfecto, NO cuadrado duro)
- Icono App en lista / detalle: 16px
- Card sección: 20px
- Widget: 20-24px
- Dock: 28px pill
- Carpeta: 20px
- Botón pill: 999px
- Chip: 999px
- Buscador: 999px
- Badge contador: 999px

SOMBRAS:
- Solo shadow-sm en cards y dock. Iconos: SIN sombra, solo fondo de color + borde 1px sutil si es claro.
- Iconos sobre fondo claro: border 1px #E8DFD2.

ESPACIADO / DENSIDAD — CLAVE:
- Móvil: grid 4 columnas, gap-x 12px, gap-y 16px, padding horizontal 16px
  En una pantalla de móvil (844px alto) caben EXACTAMENTE unas 20 Apps visibles
  (4 columnas x 5 filas) antes de hacer scroll. NO más. NO 30 por pantalla.
  Si caben más, aumenta el tamaño de icono y el gap hasta que sean 20.
- PC: grid 6-8 columnas, gap 20-24px, max-width 1200px centrado, padding 32px
- Secciones: gap 24-28px vertical, mucho aire entre secciones.

============================================================
2. LAYOUT GLOBAL — SCROLL VERTICAL ADAPTABLE
============================================================

- Página: scroll vertical infinito, NO 100vh fijo. Se puede desplazar la pantalla.
  Contenedor raíz: min-height 100dvh, bg #FDFBF7, overflow-x clip.
- En móvil: vista tipo Home Android: status bar simulada + header + buscador + widgets + grid + dock fijo abajo.
- En PC: misma jerarquía, centrada, más ancha, dock abajo centrado, sidebar NO obligatoria.
  En PC NO hay sidebar de navegación lateral como en Analítica. El Home ES la navegación.
- Dock fijo: en móvil fixed bottom-0, en PC fixed bottom-24px centrado.
- Botón flotante Chat: NO en esta vista. El Chat es una App más (icono Chat en dock).
  NO duplicar botón Chat flotante aquí.

ESTRUCTURA VERTICAL DE REFERENCIA (permitir compactar, plegar o reordenar bloques según pantalla y validación):
1. Status bar / Header superior (60px)
2. Saludo + Fecha + Clima de trabajo (Hero LAIA)
3. Buscador + Filtros (Todos / Para ti / Recientes / Favoritas)
4. Sección PARA TI AHORA — algoritmo — 4-6 Apps grandes
5. Widget LAIA — "Qué haría LAIA ahora"
6. Sección SIGUE TRABAJANDO — continuar donde lo dejaste
7. Sección TODAS LAS APPS · 35 — grid completo agrupado por carpetas / categorías
8. Sección CARPETAS — 4 carpetas
9. Sección SUGERENCIAS DE LAIA — 3 sugerencias
10. Pie: "35 Apps · Todas de AgntiaPro · Sin apps de terceros"
11. Dock fijo abajo (móvil y PC)

============================================================
3. HEADER SUPERIOR — 60px — EXACTO
============================================================

- Contenedor: sticky top-0 z-30, h-, flex items-center gap-3, px-4 sm:px-6,
  border-bottom 1px --border, bg #FDFBF7 / 90% blur
- Izquierda: Logo AgntiaPro:
  Cuadrado 32x32 bg black texto "A" blanco Fraunces bold radio 8px
  + a su derecha, leading-none:
    "AgntiaPro" Fraunces bold 17px
    "— LAIA —" 9px extrabold letter-spacing 0.12em color --gold
  PROHIBIDO duplicar nombre. PROHIBIDO "ACME" en logo.
- Centro (md+): pill "Interfaz Studio · ACME" 12px medium, punto verde + texto
- Derecha, en orden:
  1. Pill "Agente activo": flex gap-1.5 px-3 py-1.5 rounded-full border bg white 12px:
     punto verde 8x8 + "Interfaz · Agente activo"
  2. Campana: relative p-2 rounded-full hover bg --ivory, Bell 19px + badge 16x16
     rounded-full bg --violet texto blanco 10px "3"
     Al hacer clic: notice "Tienes 3 sin leer: ACME, factura 1042 y aprobación."
  3. Avatar Ana Ferrer: 32px, iniciales AF bg black texto blanco, punto verde online
     Al hacer clic: abre perfil / ajustes.

STATUS BAR SIMULADA MÓVIL (solo móvil, encima del header, 28px):
- flex justify-between px-5 pt-2, 12px medium color --ink:
  Izquierda: "10:05" bold
  Derecha: "📶 📡 🔋 87%" — usa iconos lucide Wifi / Battery, NO emojis reales.
  Es decorativa, no funcional.

============================================================
4. HERO — SALUDO LAIA — EXACTO
============================================================

- Contenedor: px-4 sm:px-6 pt-5 pb-2, max-width 1200px mx-auto
- Fila superior: flex justify-between items-start:
  Izquierda:
    "Buenos días, Ana" — Fraunces bold 28-32px, leading-none
    Debajo: "Martes · 10:05 · Tienes 2 aprobaciones y 1 factura pendiente." — 13-14px mt-2 color --muted
  Derecha (PC): botón "Abrir LAIA" — px-4 py-2 rounded-full bg --violet texto blanco 13px bold,
    Sparkles 14px + "Abrir LAIA ✦" → abre DM LAIA.
- Debajo: pill algoritmo — flex gap-2 items-center mt-3, px-3 py-2 rounded-full border bg white 12px:
  Icono Sparkles 14px color --violet + texto:
  "LAIA ha ordenado esto por ti: usas mucho Ventas por la mañana y tienes ACME pendiente ahora."
  + botón derecha "¿Por qué?" 12px bold color --violet underline → abre modal "Cómo ordena LAIA".
  ESTE PILL ES CLAVE: explica el algoritmo, no es magia negra.

============================================================
5. BUSCADOR + FILTROS — EXACTO
============================================================

- Contenedor: px-4 sm:px-6, max-width 1200px mx-auto, sticky top- z-20 bg #FDFBF7 py-3
- Buscador: flex gap-2 px-4 py-3 rounded-full border bg white 14px:
  Search 17px color --muted + input flex-1 border-0 "Buscar Apps, archivos, personas, tareas…"
  + pill derecha "⌘K" 11px px-1.5 py-0.5 rounded bg --ivory
  Al escribir: filtra TODAS las Apps por nombre, categoría o descripción, en vivo.
  Si no hay resultados: "Sin resultados para “{query}”. Prueba con “factura” o “propuesta”."
- Filtros debajo: flex gap-2 overflow-x-auto no-scrollbar, py-2:
  Botones pill 12-13px bold px-4 py-2 rounded-full border:
    "Todos" activo: bg --ink color #fff
    "Para ti" / "Recientes" / "Favoritas" / "Trabajo" / "Clientes" / "Agentes":
    inactivo: bg white color --ink border --border
  Al hacer clic: filtra el grid principal.
  "Para ti" = solo las que el algoritmo sube arriba.
  "Recientes" = solo las usadas en las últimas 24h.
  "Favoritas" = solo las marcadas con ★.

============================================================
6. SECCIÓN PARA TI AHORA — ALGORITMO — EXACTA
============================================================

- Contenedor: px-4 sm:px-6, max-width 1200px mx-auto, mt-4
- Cabecera: flex justify-between items-center:
  Label "PARA TI AHORA · ALGORITMO LAIA" 10px bold letter-spacing 0.12em color --muted
  + derecha: pill "Actualizado hace 2 min" 11px px-2 py-1 rounded-full bg --violet-soft color --violet
- Sub: "LAIA ha acercado lo que más necesitas ahora, por tu uso general y por lo que estás haciendo en este instante." 12-13px color --muted mt-1
- Grid: grid-cols-2 en móvil, 4 en PC, gap-3 / gap-4, mt-3
- Cards PARA TI — 4 cards, en este orden EXACTO (ejemplo 10:05, Ana en Ventas con ACME):
  Cada card: bg white border 1px --border rounded- p-4, flex flex-col gap-2,
  hover border --violet, cursor pointer. Al hacer clic: abre la App.

  Card 1 — LAIA — Prioridad 1 — Algoritmo: "Estás en Ventas + ACME pendiente":
    Fila: icono LAIA 48x48 rounded- bg degradado violeta #5B4BDB→#7C5CFF, ✦ blanco 24px + derecha pill "PARA TI" bg --violet color white 10px bold px-2 py-1 rounded-full
    Título bold 15px "LAIA" + "✦ Coordinación" 12px color --muted
    Texto 12-13px color --muted: "Tienes 2 aprobaciones pendientes. ¿Empezamos por ACME?"
    Botón abajo: "Abrir LAIA →" 12px bold color --violet

  Card 2 — Ventas — Prioridad 2 — Algoritmo: "Usas Ventas cada mañana 09:00-11:00":
    Icono 48x48 bg #5B4BDB, icono TrendingUp blanco 24px
    Título "Ventas" bold + "Propuestas · Seguimiento" 12px color --muted
    Texto: "Propuesta ACME 5.400 € lista para enviar."
    Pill "3 sin leer" bg --violet color white 10px bold
    Botón "Abrir Ventas →"

  Card 3 — Facturación — Prioridad 3 — Algoritmo: "Factura vencida 1042 detectada":
    Icono 48x48 bg #DCFCE7, icono Receipt color #166534 24px
    Título "Facturación" + "Cobros · Vencimientos" 12px
    Texto: "Factura 1042 · 4.800 € vencida. LAIA preparó recordatorio."
    Pill "URGENTE" bg #FDE8E8 color #B91C1C 10px bold
    Botón "Revisar factura →"

  Card 4 — Propuestas — Prioridad 4 — Algoritmo: "Estabas editando Propuesta ACME":
    Icono 48x48 bg #5B4BDB, icono FileText blanco 24px
    Título "Propuestas" + "ACME · Junio" 12px
    Texto: "Propuesta_ACME.pdf · 2,4 MB · Lista."
    Pill "Listo" bg #DCFCE7 color #166534
    Botón "Abrir propuesta →"

- Si el usuario cambia de contexto (ej: abre Soporte), el orden cambia en vivo:
  Sube Soporte, baja Ventas. El algoritmo NO es fijo. Debe explicarse en el pill "¿Por qué?".

============================================================
7. WIDGET LAIA — QUÉ HARÍA LAIA AHORA — EXACTO
============================================================

- Contenedor: px-4 sm:px-6, max-width 1200px mx-auto, mt-5
- Card: bg white border 1px --border rounded- p-4 / p-5, flex gap-3
- Izquierda: icono LAIA 44x44 rounded- degradado violeta, ✦ blanco 22px
- Centro flex-1 min-width 0:
  Fila: "✦ LAIA sugiere" 12px bold color --gold + "· hace 2 min" 11px color --muted
  Título bold 14-15px mt-1: "Si ACME no responde en 24h, te propongo un seguimiento amable."
  Texto 12-13px color --muted mt-1: "Ya lo tengo redactado. Solo tienes que aprobarlo."
- Derecha: flex flex-col gap-2:
  Botón "Aprobar" px-4 py-2 rounded-full bg --violet texto blanco 12px bold
  Botón "Ver" px-4 py-2 rounded-full border bg white 12px bold
- Al hacer clic Aprobar: notice "Aprobado. LAIA lo programó para mañana 09:00."

============================================================
8. SECCIÓN SIGUE TRABAJANDO — CONTINUAR — EXACTA
============================================================

- Contenedor: px-4 sm:px-6, max-width 1200px mx-auto, mt-5
- Cabecera: Label "SIGUE TRABAJANDO · DONDE LO DEJASTE" + botón derecha "Ver todo" 12px bold color --violet
- Lista horizontal scroll: flex gap-3 overflow-x-auto no-scrollbar, py-2, snap-x
- 3 cards horizontales, cada una min-width 280px, bg white border rounded- p-4:
  Card 1: "Rediseño del checkout" — "Proyectos · 33% · Hace 2h" + barra progreso 33% violeta + botón "Continuar →"
  Card 2: "Resumen semanal de soporte" — "Documentos · 21h" + botón "Continuar →"
  Card 3: "Lanzamiento otoño 2026" — "Proyectos · 50% · En curso" + barra 50% + botón "Continuar →"
- Al hacer clic: abre esa App / documento.

============================================================
9. SECCIÓN TODAS LAS APPS · 35 WORKSPACES REALES — GRID COMPLETO
============================================================

- Contenedor: px-4 sm:px-6, max-width 1200px mx-auto, mt-6, pb-32 (para que el dock no tape)
- Cabecera: flex justify-between items-center:
  Título: "Todas las Apps" Fraunces bold 22-24px + pill "35" 12px bold px-2.5 py-1 rounded-full bg --ink color white
  Derecha: toggle vista: 2 botones pill: "Grid" activo bg --ink color white / "Lista" inactivo bg white — 12px bold
  Al hacer clic Lista: cambia a vista lista (ver punto 10).

- Sub: "35 workspaces agénticos. Todos de AgntiaPro. Cada uno es una App." 12-13px color --muted

- AGRUPACIÓN: usar categorías útiles y configurables; las categorías de abajo son UN EJEMPLO de navegación, no el inventario técnico real:
  Cada categoría: Label 10px bold letter-spacing 0.12em color --muted, mt-6 mb-3, + grid debajo.

CATEGORÍA 1 — "COORDINACIÓN · LAIA" — 3 Apps:
1. LAIA — ✦ Coordinación — icono degradado violeta, ✦ blanco — badge "2 pendientes" rosa
   Desc: "Tu coordinadora. Resume, redacta, pide aprobación."
2. Centro de Mando — icono negro, LayoutDashboard blanco — badge "3"
   Desc: "Tu día en 10 segundos."
3. Hoy — icono marfil, CalendarCheck negro — sin badge
   Desc: "Tareas, reuniones y pendientes de hoy."

CATEGORÍA 2 — "VENTAS Y CLIENTES" — 6 Apps:
4. Ventas — violeta, TrendingUp blanco — badge "3"
   Desc: "Propuestas y seguimiento."
5. Propuestas — violeta, FileText blanco
   Desc: "Propuestas listas para enviar."
6. Clientes — violeta, Users blanco
   Desc: "Fichas, historial y contexto."
7. CRM — violeta, HeartHandshake blanco
   Desc: "Pipeline y oportunidades."
8. Presupuestos — lavanda, Calculator violeta
   Desc: "Presupuestos en revisión."
9. Seguimiento 24h — ámbar, Clock ámbar oscuro
   Desc: "Seguimiento automático si no responden."

CATEGORÍA 3 — "DINERO" — 4 Apps:
10. Facturación — verde suave, Receipt verde oscuro — badge "URGENTE" rosa
    Desc: "Facturas, cobros y vencimientos."
11. Cobros — verde suave, Wallet verde oscuro
    Desc: "Recordatorios amables de cobro."
12. Pagos — verde suave, CreditCard verde oscuro
    Desc: "Pagos y enlaces de pago."
13. Contabilidad — marfil, BookOpen negro
    Desc: "Verifactu y libros."

CATEGORÍA 4 — "COMUNICACIÓN" — 5 Apps:
14. WhatsApp — negro, MessageCircle blanco — badge "2"
    Desc: "WhatsApp Business con LAIA."
15. Teléfono — negro, Phone blanco
    Desc: "Llamadas agénticas y agenda."
16. Correo — lavanda, Mail violeta — badge "5"
    Desc: "Gmail y Outlook con LAIA."
17. Chat interno — negro, MessagesSquare blanco — badge "3"
    Desc: "Slack-like para tu equipo."
18. Videollamadas — lavanda, Video violeta
    Desc: "Llamadas con LAIA y clientes."

CATEGORÍA 5 — "TRABAJO" — 6 Apps:
19. Proyectos — violeta, FolderKanban blanco
    Desc: "Proyectos activos y entregas."
20. Tareas — marfil, CheckSquare negro
    Desc: "Tareas de todo el equipo."
21. Documentos — marfil, FileText negro
    Desc: "Documentos, PDFs y plantillas."
22. Notas — marfil, StickyNote negro
    Desc: "Notas rápidas con LAIA."
23. Calendario — marfil, Calendar negro
    Desc: "Reuniones y recordatorios."
24. Archivos — negro, Folder blanco
    Desc: "Todos tus archivos."

CATEGORÍA 6 — "EQUIPO Y AGENTES" — 5 Apps:
25. Equipo — azul suave, Users azul oscuro
    Desc: "Personas, roles y presencia."
26. Agentes — violeta, Bot blanco
    Desc: "LAIA, Marcos, Juan, Ana, Pedro, Antonio y los agentes disponibles según tenant."
27. RRHH — azul suave, UserRound azul oscuro
    Desc: "Vacaciones, horarios y equipo."
28. Formación — azul suave, GraduationCap azul oscuro
    Desc: "Formación para ti y tu equipo."
29. Seguridad — gris, Shield gris oscuro
    Desc: "Seguridad y accesos."

CATEGORÍA 7 — "CRECIMIENTO" — 4 Apps:
30. Marketing — lavanda, Megaphone violeta
    Desc: "Campañas y contenido."
31. Diseño — lavanda, Palette violeta
    Desc: "Diseño y marca."
32. Analítica — lavanda, BarChart3 violeta
    Desc: "Analítica y Centro de Mando."
33. Automatizaciones — violeta, Zap blanco
    Desc: "Automatizaciones agénticas."

CATEGORÍA 8 — "SISTEMA" — 2 Apps:
34. Integraciones — gris, Plug gris oscuro
    Desc: "Gmail, Drive, Outlook, Slack, Shopify."
35. Ajustes — gris, Settings gris oscuro
    Desc: "Ajustes de tu OS agéntico."

TOTAL: esta taxonomía de ejemplo suma 35 nombres de producto CONCEPTUALES, pero NO corresponde uno a uno a los 35 directorios reales. Para implementar el catálogo usar obligatoriamente el inventario real del APÉNDICE A; las miniapps y accesos a capacidades se distinguen de las Apps registradas.

CADA CELDA DE APP EN GRID:
- Contenedor: flex flex-col items-center gap-2, p-2, rounded-, hover bg --ivory, cursor pointer, text-center
- Icono: 64x64 en móvil (56x56 en PC si grid 8 columnas), rounded-, flex center,
  fondo según color de la App arriba, icono lucide 26-28px, color según especificación
- Badge si aplica: absolute -top-1 -right-1, 18x18 rounded-full bg --violet texto blanco 10px bold,
  o bg #FDE8E8 texto #B91C1C si es "URGENTE"
- Nombre: 11-12px medium, line-height 1.2, 2 líneas máximo, truncate
- Si es favorita: ★ dorada 12px encima del nombre
- Al hacer clic: abre la App (en demo: setActiveApp(id), notice "Abriendo {nombre}…", y en móvil cambia a vista App)
- Al mantener pulsado (long-press): abre menú: "★ Favorita" / "Quitar de Favoritas" / "Ocultar" / "Mover arriba"
  En demo: clic derecho o botón "···" abre ese menú.
- Al arrastrar (drag): reordena dentro de su categoría (en demo: visual, no persistente obligatorio).

============================================================
10. VISTA LISTA — ALTERNATIVA AL GRID — EXACTA
============================================================

- Si vista = Lista: en lugar de grid, muestra lista vertical:
  Cada fila: flex gap-3 items-center, bg white border rounded- p-3, mb-2
  Icono 44x44 rounded- + centro flex-1:
    Nombre bold 14px + desc 12px color --muted
  Derecha: badge si aplica + ChevronRight 16px color --muted
- Mismo orden, mismas 35 Apps, mismas categorías con Label encima de cada grupo.

============================================================
11. SECCIÓN CARPETAS — 4 CARPETAS — EXACTA
============================================================

- Contenedor: px-4 sm:px-6, max-width 1200px mx-auto, mt-6
- Cabecera: Label "CARPETAS" + botón "Nueva carpeta" 12px bold color --violet
- Grid: grid-cols-2 móvil, 4 PC, gap-3
- Cada carpeta: bg --ivory border 1px --border rounded- p-4, cursor pointer
  Contenido:
    Mini-grid 2x2 de 4 iconos pequeños 28x28 rounded- en la parte superior
    Nombre bold 14px mt-2 + "4 Apps" 12px color --muted
  Carpetas EXACTAS:
  1. "Ventas" — iconos: Ventas, Propuestas, Clientes, CRM — "4 Apps"
  2. "Dinero" — iconos: Facturación, Cobros, Pagos, Contabilidad — "4 Apps"
  3. "Comunicación" — iconos: WhatsApp, Teléfono, Correo, Chat interno — "4 Apps"
  4. "Equipo" — iconos: Equipo, Agentes, RRHH, Formación — "4 Apps"
- Al hacer clic carpeta: abre modal carpeta con sus 4 Apps en grid 2x2 grande.

============================================================
12. SECCIÓN SUGERENCIAS DE LAIA — EXACTA
============================================================

- Contenedor: px-4 sm:px-6, max-width 1200px mx-auto, mt-6
- Cabecera: Label "SUGERENCIAS DE LAIA"
- Lista: space-y-3, 3 cards bg white border rounded- p-4 flex gap-3:
  Card 1: icono LAIA 36x36 degradado + texto: "Usas mucho Facturación los martes. ¿La pongo en Favoritas?" + botones "Sí" violeta / "No" borde
  Card 2: icono LAIA + "No usas Videollamadas desde hace 3 semanas. ¿La oculto de Para ti?" + botones "Ocultar" / "Mantener"
  Card 3: icono LAIA + "Tienes 3 Apps sin abrir: Formación, Diseño, Pagos. ¿Quieres un tour de 2 min?" + botones "Ver tour" / "Ahora no"
- Al hacer clic: notice correspondiente, y si es Sí, marca favorita / oculta.

============================================================
13. PIE — EXACTO
============================================================

- Contenedor: px-4 py-8 text-center, max-width 1200px mx-auto
- Texto: "35 Apps · Todas de AgntiaPro · Sin apps de terceros" 12px color --muted
- Debajo: "Tu OS agéntico. LAIA ordena, tú decides." 12px bold color --ink
- Logo pequeño: cuadrado 24x24 bg black "A" blanco + "AgntiaPro — LAIA —" 11px color --gold

============================================================
14. DOCK FIJO — ANDROID-LIKE — EXACTO
============================================================

- Contenedor móvil: fixed bottom-0 left-0 right-0 z-40, bg #FDFBF7 / 95% blur,
  border-top 1px --border, px-4 pt-2 pb-[max(8px,var(--safe-area-inset-bottom))]
- Contenedor PC: fixed bottom-24px left-1/2 -translate-x-1/2 z-40,
  bg white border 1px --border rounded- px-3 py-2 shadow-sm, flex gap-2
- Contenido dock: 5 Apps fijas, en este orden EXACTO:
  1. LAIA — icono degradado violeta, ✦ blanco 26px — si activo, pill debajo "LAIA" 10px bold color --violet
  2. Teléfono — icono negro, Phone blanco
  3. Centro — icono negro, Home / LayoutDashboard blanco — CENTRO, ligeramente más grande 60x60
  4. WhatsApp — icono negro, MessageCircle blanco — badge "2" violeta
  5. Chat interno — icono negro, MessagesSquare blanco — badge "3" violeta
- Al hacer clic dock: abre esa App, y en móvil hace scroll top.
- Indicador activo: punto 6x6 bg --violet debajo del icono activo.

============================================================
15. MODALES — 3 MODALES — EXACTOS
============================================================

Estilo común: overlay fixed inset-0 bg-black/30 z-50, contenedor center p-4,
card w-full max-width 520px bg white rounded- p-5

MODAL 1 — Cómo ordena LAIA:
- Título "Cómo ordena LAIA" Fraunces 22px bold + X
- Texto 13-14px: "LAIA mira 2 cosas:"
- Lista: "1. Tu uso general: qué Apps usas más, a qué hora, qué día."
  "2. Tu instante: qué estás haciendo ahora, qué cliente, qué urgencia."
- Ejemplo: "Hoy 10:05: usas Ventas por la mañana + tienes ACME pendiente → sube Ventas, Facturación y Propuestas."
- Nota: "Tú siempre puedes fijar Favoritas. LAIA nunca oculta una App sin tu permiso."
- Botón "Entendido" w-full py-2.5 rounded-full bg --violet texto blanco bold → cierra.

MODAL 2 — Carpeta:
- Título nombre carpeta Fraunces 22px bold + X
- Grid 2x2 de sus 4 Apps, cada una icono 64x64 + nombre
- Al hacer clic App: cierra modal, abre App.

MODAL 3 — App abierta (vista App):
- Si se abre una App desde el Home: en móvil, pantalla completa con header:
  Header: botón Volver < + nombre App + X "Cerrar"
  Cuerpo: "Vista previa de {nombre}. En la versión real, aquí se abre el workspace completo."
  + botón "Abrir workspace completo" bg --violet blanco
  En PC: panel lateral derecho 400px con la misma vista previa.

============================================================
16. ESTADO INICIAL — EXACTO
============================================================

- activeApp = null (Home)
- search = ''
- filter = 'Todos' (Todos / Para ti / Recientes / Favoritas / Trabajo / Clientes / Agentes)
- view = 'Grid' (Grid / Lista)
- favorites = ['LAIA', 'Ventas', 'Facturación'] — con ★
- hidden = []
- paraTi = ['LAIA', 'Ventas', 'Facturación', 'Propuestas'] — orden algoritmo ejemplo 10:05
- recents = ['Rediseño del checkout', 'Resumen semanal de soporte', 'Lanzamiento otoño 2026']
- range = 'Hoy'
- laiaOn = true
- showExplain = false
- showFolder = null
- showApp = null
- notice = ''

PERSISTENCIA (opcional): guardar favorites, hidden, orden en records 'agntiapro_apps'.
Si falla, seguir en sesión. NO romper UI.

============================================================
17. REGLAS DE FIDELIDAD — BRANDING Y PRODUCTO
============================================================

1. Mostrar los 35 workspaces reales existentes como base actual; el catálogo podrá crecer con miniapps. El número se deriva del registro, nunca se fija artificialmente.
   Si el usuario dijo 50 antes, esta versión usa 35 como número final.
2. NO uses logos de terceros. TODOS los iconos son AgntiaPro + lucide-react.
3. Las categorías son etiquetas de presentación, no el modelo de datos ni una jerarquía obligatoria; validarlas con el founder.
4. No sustituir los 35 IDs técnicos por la lista conceptual de 35 nombres de esta prompt; consultar APÉNDICE A y definir alias comerciales solo tras aprobación.
5. Mantener los tokens reales de AgntiaPro; los hexadecimales originales son una referencia que requiere comprobación contra landing y Studio Demo.
6. En móvil, rejilla fluida con iconos accesibles; no forzar 20 por viewport si perjudica legibilidad.
7. El algoritmo DEBE verse: pill "LAIA ha ordenado esto por ti" + modal "Cómo ordena LAIA" + sección PARA TI AHORA.
8. LAIA SIEMPRE con ✦ dorada / degradado violeta.
9. Fraunces SOLO titulares. Todo lo demás Manrope.
10. Scroll vertical SIEMPRE permitido. NO 100vh fijo sin scroll.
11. Dock contextual y personalizable, sin duplicar ni interferir con la navegación global; LAIA, Teléfono, Centro, WhatsApp y Chat interno son ejemplos, no IDs obligatorios.
12. Si dudas entre espectacular y limpio, elige LIMPIO, con aire, pro, como un Android pero en branding AgntiaPro.

ENTREGA:
- React + TypeScript + tokens compartidos; componentes modulares (AppsHome, AppTile, AppGrid, AppSearch, AppFilters, Recommendations, AppDock, AppFolder, AppPreview, ExplanationModal, hooks y fixtures), NO un único App.tsx monolítico
- estilos encapsulados reutilizando tokens reales y clases .font-serif-x, .label, .scroll-thin, .no-scrollbar
- Sin backend obligatorio: si fetch falla, sigue en sesión.
- Resultado final debe conservar la intención UX y la coherencia visual, con evidencias de móvil y PC, interacciones funcionales y diferencias justificadas frente al borrador original.

============================================================
APÉNDICE A — INVENTARIO CANÓNICO ACTUAL (35 WORKSPACES)
============================================================

No confundir con la lista ilustrativa del punto 9. Los siguientes son los nombres
EXACTOS de los directorios del repositorio y deben ser la fuente del catálogo:

01. 01-gmail — apps/web/src/workspaces/01-gmail
02. 02-whatsapp — apps/web/src/workspaces/02-whatsapp
03. 03-hubspot — apps/web/src/workspaces/03-hubspot
04. 04-holded — apps/web/src/workspaces/04-holded
05. 05-google-drive — apps/web/src/workspaces/05-google-drive
06. 06-google-calendar — apps/web/src/workspaces/06-google-calendar
07. 07-linear — apps/web/src/workspaces/07-linear
08. 08-chatgpt — apps/web/src/workspaces/08-chatgpt
09. 09-airtable — apps/web/src/workspaces/09-airtable
10. 10-perdoo — apps/web/src/workspaces/10-perdoo
11. 11-holded-tesoreria — apps/web/src/workspaces/11-holded-tesoreria
12. 12-odoo-purchase — apps/web/src/workspaces/12-odoo-purchase
13. 13-productive — apps/web/src/workspaces/13-productive
14. 14-zendesk — apps/web/src/workspaces/14-zendesk
15. 15-docusign — apps/web/src/workspaces/15-docusign
16. 16-n8n — apps/web/src/workspaces/16-n8n
17. 17-process-street — apps/web/src/workspaces/17-process-street
18. 18-factorial — apps/web/src/workspaces/18-factorial
19. 19-personio — apps/web/src/workspaces/19-personio
20. 20-ramp — apps/web/src/workspaces/20-ramp
21. 21-stripe — apps/web/src/workspaces/21-stripe
22. 22-canva — apps/web/src/workspaces/22-canva
23. 23-buffer — apps/web/src/workspaces/23-buffer
24. 24-shopify — apps/web/src/workspaces/24-shopify
25. 25-intercom — apps/web/src/workspaces/25-intercom
26. 26-odoo-inventory — apps/web/src/workspaces/26-odoo-inventory
27. 27-maintainx — apps/web/src/workspaces/27-maintainx
28. 28-odoo-manufacturing — apps/web/src/workspaces/28-odoo-manufacturing
29. 29-isms-online — apps/web/src/workspaces/29-isms-online
30. 30-microsoft-entra — apps/web/src/workspaces/30-microsoft-entra
31. 31-suitedash — apps/web/src/workspaces/31-suitedash
32. 32-notion — apps/web/src/workspaces/32-notion
33. 33-langsmith — apps/web/src/workspaces/33-langsmith
34. 34-trello — apps/web/src/workspaces/34-trello
35. 35-centro-mando — apps/web/src/workspaces/35-centro-mando

Estos nombres pueden ser inspiraciones de producto o referencias de integración.
NO significan que exista un conector activo ni que la interfaz esté completa.
Cada App podrá tener un nombre visible propio y un logo de AgntiaPro; no inventar
ni desplegar alias comerciales sin revisar las fichas individuales.

============================================================
APÉNDICE B — MINIAPPS, ALGORITMO Y LÍMITES DE LA DEMO
============================================================

- Miniapps adicionales: calculadora de desempeño laboral, calculadora de presupuestos,
  y otras utilidades empresariales futuras; no contarlas dentro de los 35 directorios.
- Algoritmo contextual: priorizar en base a historial de uso, actividad inmediata,
  tareas pertinentes y preferencias del usuario; no afirmar que LAIA haya inferido
  algo que no esté sustentado por datos de la sesión o fixtures explícitos.
- Preferencias: favoritos y orden manual no deben ser invalidados arbitrariamente;
  explicar recomendaciones, ofrecer control y acceso a catálogo completo.
- Permisos: no recomendar acciones inaccesibles ni revelar títulos/datos de otros
  tenants; no ejecutar operaciones al cambiar la posición de una App.
- Privacidad: telemetría mínima, finalidad clara y configuración; no usar datos
  sensibles sin autorización y diseño explícito.
- Estado demo: Ana Ferrer, ACME, factura 1042 y propuesta son fixtures sintéticos,
  no hechos observados ni identidad obligatoria de producción.
- Las cifras de badges y pendientes deben derivarse del fixture de la misma sesión;
  no inventar incoherencias entre el home, la App y el informe de LAIA.
- PC: launcher espacioso integrado con navegación existente; no sustituir el
  Estudio de Operaciones ni el Centro de Mando.
- Móvil: respetar safe areas, teclado, accesibilidad táctil, tamaño de pantalla,
  modo reducido de movimiento y estados offline.
- Arquitectura: componentes reutilizables y desacoplados de datos reales;
  registry de Apps, adaptador de recomendaciones y fixtures compartidos.
- QA: captura a 360/390/768/1440 px; navegación teclado; búsqueda, favoritos,
  ordenación, carpetas, lista/grid, dock, modal, estados vacíos y persistencia.
- Aprobación: solo documentación ahora; no modificar main, producción ni deploy.

```
