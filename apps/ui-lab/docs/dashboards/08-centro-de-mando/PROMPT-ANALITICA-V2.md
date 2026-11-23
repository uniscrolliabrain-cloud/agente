# Prompt maestra V2 — Analítica / Centro de Mando

> Adaptación de la prompt aportada por el founder. Se preserva el detalle original y se corrigen las contradicciones con los componentes reales. **No autoriza cambios en la interfaz actual.**

```txt
PROMPT MAESTRA V2 — CENTRO DE MANDO / ANALÍTICA — DISEÑO CONSERVADOR
PROYECTO: "AgntiaPro — vista Analítica (workspace 35-centro-mando)"

OBJETIVO ABSOLUTO:
Conservar el Centro de Mando actual de AgntiaPro TAL COMO ESTÁ. Esta prompt
describe y mejora SOLO la experiencia del workspace de Analítica
`apps/web/src/workspaces/35-centro-mando`, sin sustituir ni rediseñar
`apps/web/src/components/CommandCenterView.tsx`, que es el Centro de Mando
principal de inicio de la empresa.

Reutilizar los componentes que YA existen, conservar la composición,
las secciones y la baja densidad del diseño. Mejorar solo detalles de
consistencia, estados, accesibilidad, copy y wiring cuando se apruebe.
Esta entrega es DOCUMENTACIÓN, no autorización de implementar.

No sustituir datos reales del tenant por números fijos de la prompt.
Los números, nombres y porcentajes descritos abajo son exclusivamente
un escenario visual de demostración. No inventar integraciones ni
presentar un toast como si una acción de negocio hubiera ocurrido.

JERARQUÍA DE VERDAD:
1. Instrucción actual del founder: el Centro de Mando principal se queda como está.
2. Código actual de ambas superficies y sus componentes compartidos.
3. Tokens reales de la landing y Studio Demo / sistema de diseño vigente.
4. Esta prompt como especificación visual y escenario sintético.
5. La documentación histórica de workspace, contrastada con el código.

ROL QUE DEBES ASUMIR:
Eres un Product Designer Senior estilo Linear + Figma + Notion, obsesionado con:
- jerarquía visual clarísima
- aire, respiración, densidad baja-media, nunca dashboard financiero denso
- radio grande, bordes finos, sombras sutiles
- tipografía editorial para títulos + UI limpia para el resto
- consistencia total de tokens
- estados visibles, nunca ambiguos
- microcopy en español de España, cercano, profesional

QUÉ ES Y QUÉ NO ES:
ES: la vista Analítica del workspace técnico 35-centro-mando, con título visual «Centro de Mando» en el escenario descrito. Es distinta del Centro de Mando principal (vista today).
ES: la vista donde Ana Ferrer ve en 10 segundos: cuánto trabajo abierto hay,
cuánto dinero en presupuestos en revisión, cómo va el trabajo, qué oportunidades
hay en cartera, qué proyectos activos hay, qué requiere atención, qué clientes
y oportunidades hay, cómo rinden los agentes, y qué insights propone el agente.
ES: interfaz Studio, con sidebar de navegación a la izquierda.
NO ES: landing.
NO ES: WhatsApp.
NO ES: Teléfono.
NO ES: Slack / Comunicación Interna.
NO ES: Agntia Apps / Home Android.
NO ES: Kanban / Grafo / Digital Twin.
NO ES: timeline de operaciones tipo CapCut.
NO ES: dashboard oscuro denso con gráficos de líneas, donuts o barras complejas.
NO ES: una orden para modificar CommandCenterView ni sus componentes.

USUARIO Y CONTEXTO:
Usuaria: Ana Ferrer — Admin — avatar AF negro con punto verde online.
Workspace: Interfaz Studio.
Agentes: Marta, Bruno, Nora — más LAIA como coordinadora implícita.
Clientes: Casa Botànica, Estudio Lumen, Talleres Norte, Verde Oficina.
Proyectos: Rediseño del checkout, Lanzamiento otoño 2026, Soporte y mantenimiento.
Personas en Atención: Diego Salas, Lucía Prats, Ana Ferrer.

1. SISTEMA DE DISEÑO — REFERENCIAS VISUALES, CONTRASTAR TOKENS REALES


COLORES — VALORES DE LA REFERENCIA; EN IMPLEMENTACIÓN USAR TOKENS REALES VIGENTES:
--bg: #FDFBF7 — fondo principal, warm white, casi blanco cálido
--ivory: #F4EEE3 — marfil para fondos secundarios, hover, pills inactivas, mini-cards
--border: #E8DFD2 — borde 1px en TODAS las cards, sidebar, header, tablas, inputs
--ink: #211D18 — texto principal, casi negro cálido
--muted: #85796A — texto secundario, subtítulos, horas, descripciones
--violet: #5B4BDB — color primario, botones, links, barras de progreso, badges violeta
--violet-gradient: linear-gradient(135deg, #5B4BDB, #7C5CFF) — SOLO para botón "Exportar con IA"
  y para barra de pipeline en card Oportunidades. NO en fondos grandes.
--lav: #E7E2F7 — lavanda, fondos de avatares LP / CB / EL / TN / VO / DS
--violet-soft: #ECE9FF — fondo suave violeta para chips, pills, "Programada"
--gold: #C9A86A — uso mínimo, NO protagonista en esta vista
--surface: #FFFFFF — cards blancas
--black: #211D18 / #111111 — botones negros: "Nuevo chat", "Generar reporte", "Ver cola",
  "Ver logs", "Preparar propuesta", "Revisar propuesta", "Cualificar", "Reactivar", "ALTA", "MEDIA", "URGENCIA", "30d"
--pink: #FDE8E8 / #FEE2E2 — urgente, riesgo, fallidas, alta, fallo, "1 en riesgo"
--pink-text: #B91C1C / #9F1239 para texto sobre rosa
--amber: #FFF3C4 / #FEF3C7 — pendiente, estable, media, programada, aprobación, "ESTABLE"
--amber-text: #92400E para texto sobre ámbar
--amber-soft: #FFF8E6 — mini-card "En revisión"
--green: #E6F4EA / #DCFCE7 — oportunidad, resuelto, confianza alta, "OPORTUNIDAD", "2 oportunidades abiertas", "3 activos", "96% confianza"
--green-text: #166534 para texto sobre verde
--green-dot: #2BA84A — punto online
--blue-soft: #DBEAFE / #EFF6FF — "Falta un dato" pill azul
--blue-text: #1E40AF
--orange-bar: #F97316 / #EA580C — SOLO barra proyecto Soporte y mantenimiento 30%
--red-dot: #EF4444 — punto rojo urgencia Ana Ferrer
--yellow-dot: #FACC15 — punto amarillo Diego Salas
--violet-dot: #5B4BDB — punto violeta Lucía Prats

PROHIBIDO ABSOLUTO:
- fondo oscuro general — SOLO 2 cards oscuras: "OPORTUNIDADES" arriba derecha y "INSIGHTS DEL AGENTE" al final
- degradados morados grandes — SOLO degradado sutil violeta en botón "Exportar con IA" y barra pipeline
- partículas, dots decorativos, confetti, wallpapers
- verde WhatsApp #25D366, azul Gmail, rojo YouTube, colores Google
- logos de Google, Apple, WhatsApp, Meta, Slack, Gmail, Outlook, Shopify, Notion
- gráficos de líneas, donuts, barras complejas — SOLO barras de progreso finas y barras de pipeline
- densidad alta, texto pequeño amontonado

TIPOGRAFÍA:
- Títulos grandes / "Centro de Mando" / "Proyectos activos" / "Atención requerida" /
  "Clientes y oportunidades" / "Rendimiento de los agentes" / "Insights del agente":
  Fraunces, serif, weight 600-700. Clase font-serif-x
- TODO lo demás: Manrope, sans-serif, 400 / 500 / 600 / 700 / 800
- Labels de card: 10-11px, UPPERCASE, letter-spacing 0.12em, weight 800, color --muted
  Ejemplos: "TRABAJO ABIERTO", "PRESUPUESTOS EN REVISIÓN", "ESTADO DEL TRABAJO",
  "OPORTUNIDADES", "CLIENTE", "DOMINIO", "IMPORTE", "ESTADO", "PRÓXIMO PASO IA", "ACCIÓN",
  "PRESUPUESTO LISTO PARA REVISAR", "FALTA UN DATO PARA PUBLICAR", "LA SINCRONIZACIÓN CON SHOPIFY FALLÓ"
- Número grande card: 28-32px, bold, color --ink, Manrope bold o Fraunces
- Texto cuerpo: 13-14px, line-height relajado
- Microcopy: 11-12px, color --muted
- Botones: 12-13px, bold

RADIOS:
- Card principal: 20px
- Card interna / fila atención / card agente / insight: 16px
- Botón pill: 999px
- Chip / pill estado: 999px
- Avatar: 999px circular
- Input búsqueda: 999px
- Barra progreso: 999px, altura 6-8px, fondo #F4EEE3, relleno violeta o naranja
- Tabla: bordes solo horizontales, sin radio interno

SOMBRAS:
- Solo shadow-sm en cards blancas. Resto: borde 1px --border, SIN sombra.

ESPACIADO:
- Mucho aire. Página: px-6 / px-8, py-6, max-width 1200-1280px, centrado, gap 20-24px entre secciones
- Cards top: p-5 / p-6
- Grid top: 4 columnas en desktop, 2 en tablet, 1 en móvil
- Secciones: gap 20px vertical

2. LAYOUT GLOBAL — SCROLL VERTICAL


- Página scrollable vertical, NO 100vh fijo.
- Layout: sidebar fija izquierda + contenido principal derecha.
- Sidebar: width 260-280px, shrink-0, hidden en móvil, flex-col, bg #FDFBF7, p-3 / p-4
- Contenido: flex-1, min-width 0, bg #FDFBF7, px-6 / px-8 py-6, max-width 1280px
- En móvil: sidebar oculta, contenido a pantalla completa, header con menú.
- Botón flotante "Chat" abajo derecha: fixed, bottom 16-24px, right 16-24px, z-50,
  bg black, texto blanco, pill, px-4 py-2.5, 13px bold, icono MessageSquare 16px + "Chat"
  En la captura aparece repetido por scroll — en la recreación, SOLO UN botón flotante fijo.
  NO duplicar el botón 3 veces en la página.

ESTRUCTURA VERTICAL EXACTA, EN ESTE ORDEN:
1. Header superior 60px
2. Cabecera "Centro de Mando" + rango + Exportar con IA
3. Fila 4 cards: Trabajo abierto / Presupuestos en revisión / Estado del trabajo / Oportunidades (oscura)
4. Fila 2 columnas: Proyectos activos (3/5) + Atención requerida (2/5)
5. Tabla Clientes y oportunidades
6. Rendimiento de los agentes — 3 cards
7. Insights del agente — card oscura final
8. Botón flotante Chat

3. BARRA SUPERIOR — 60px — EXACTA


- Contenedor: sticky top-0 z-30, h-, flex items-center gap-3, px-4 sm:px-6,
  border-bottom 1px --border, bg #FDFBF7 / 95% blur
- Izquierda: pill "Interfaz · Agente activo":
  flex gap-1.5 px-3 py-1.5 rounded-full border bg white 12px medium:
  punto verde 8x8 bg #2BA84A + texto "Interfaz · Agente activo" color --ink
- Centro: flex-1
- Derecha, en orden:
    1. Botón campana: relative p-2 rounded-full hover bg --ivory, Bell 19px + badge:
     absolute -top-1 -right-1, 16x16 rounded-full bg --violet texto blanco 10px "3"
     Al hacer clic: notice "Tienes 3 sin leer: #ventas, #facturación y una mención."
    2. Botón buscador: flex gap-2 px-3 py-2 rounded-full border bg white 13px color --muted:
     Search 15px + "Buscar" + pill derecha "⌘K" 11px px-1.5 py-0.5 rounded bg --ivory
     Al hacer clic: abre búsqueda expandida.
    3. Botón "+ Nuevo chat": px-4 py-2 rounded-full bg black texto blanco 13px bold,
     Plus 15px + "Nuevo chat"
     Al hacer clic: abre chat / modal nuevo chat.

4. SIDEBAR IZQUIERDA — REFERENCIA DE CONTEXTO, NO RECONSTRUIR


- Contenedor: flex-col, p-3, gap-1, bg #FDFBF7

MENÚ DE REFERENCIA HISTÓRICA — no duplicar ni sobrescribir SidebarV2; respetar sus entradas actuales:
Cada item: w-full flex gap-2.5 px-3 py-2 rounded-xl text-left 14px medium,
icono 17-18px + label. Hover bg --ivory. Activo: bg white border 1px --border shadow-sm font semibold.

1. Conocimiento — icono Brain / Lightbulb 17px — inactivo
2. Proyectos — icono Folder / Layout 17px — inactivo
3. Centro de control — icono Activity 17px — inactivo
4. Operaciones — icono Clipboard / FileText 17px — inactivo
5. Equipo — icono Users 17px — inactivo
6. Apps (antes Workspaces) — icono LayoutGrid 17px — inactivo; cambio comercial pendiente de implementación
7. Analítica — icono BarChart3 17px — ACTIVO: bg white border 1px --border shadow-sm, font bold, color --ink
   Esta es la vista actual. Por eso está activa aunque el título central sea "Centro de Mando".
8. Usuarios — icono UserPlus / Users 17px — inactivo

SECCIÓN "RECIENTES" — debajo del menú:
- Cabecera: flex justify-between px-3 mt-5 mb-2:
  Label "RECIENTES" 10px bold letter-spacing 0.12em color --muted + icono Search 14px color --muted
- 2 items recientes, cada uno: px-3 py-2 rounded-lg hover bg --ivory, cursor pointer:
  Item 1: "Rediseño del checkout" 13px medium truncate + debajo "2h" 11px color --muted
  Item 2: "Resumen semanal de soporte" 13px medium truncate + debajo "21h" 11px color --muted
  Al hacer clic: abre proyecto / resumen correspondiente.

PIE SIDEBAR:
- mt-auto, pt-3, border-top 1px --border, flex gap-2 items-center px-2:
  Avatar Ana: 36x36 rounded-full bg black texto blanco "AF" bold 12px + punto verde online
  Centro flex-1 min-width 0:
    "Ana Ferrer" 13px bold truncate
    "● Admin" 11px color --muted: punto 6x6 bg #2BA84A + "Admin"
  Derecha: botón ajustes: 32x32 rounded-full bg --violet texto blanco flex center, icono Settings 16px
  Al hacer clic: abre ajustes.

5. CABECERA CONTENIDO — CENTRO DE MANDO — EXACTA


- Contenedor: flex justify-between items-start, gap-4, mb-5 / mb-6
- Izquierda:
  Título: "Centro de Mando" — Fraunces bold 32-36px, leading-none, color --ink
  Debajo: subtítulo 13-14px mt-2 color --muted:
    "Interfaz Studio · 8 tareas abiertas · 4 oportunidades"
- Derecha: flex gap-2 items-center:
  Segmented control tiempo: flex p-1 rounded-full border bg white:
    3 botones px-3 py-1.5 rounded-full 12-13px bold:
    "7d" inactivo: color --muted
    "30d" ACTIVO: bg black color #fff
    "90d" inactivo: color --muted
    Al hacer clic: cambia rango, actualiza números (en demo, solo visual).
  Botón "Exportar con IA": px-4 py-2 rounded-full texto blanco 13px bold,
    background: linear-gradient(135deg, #5B4BDB, #7C5CFF) — ÚNICO degradado permitido,
    shadow-sm. Al hacer clic: notice "Exportando informe con IA…"

6. FILA SUPERIOR — 4 CARDS — GRID 4 COLUMNAS — EXACTA


Grid: grid-cols-4 en desktop (xl), 2 en tablet, 1 en móvil, gap-4 / gap-5

CARD 1 — TRABAJO ABIERTO — blanca:
- Contenedor: bg white border 1px --border rounded- p-5
- Label: "TRABAJO ABIERTO" 10px bold letter-spacing 0.12em color --muted
- Fila número: flex gap-2 items-baseline mt-2:
  Número "8" 32px bold
  Pill "+7 hoy" 11px bold px-2 py- rounded-full bg --violet-soft color --violet
- Sub: "2 en curso · 2 esperando tu decisión" 12-13px mt-1 color --muted
- Lista mini agentes — 3 filas, mt-4, gap-2:
  Cada fila: flex justify-between items-center 12-13px:
    Nombre izquierda: "Nora" / "Marta" / "Bruno"
    Derecha: barra progreso + texto:
      Barra: w-16 h- rounded-full bg #F4EEE3, relleno violeta:
        Nora: width ~80% — texto "4 tareas"
        Marta: width ~50% — texto "2 tareas"
        Bruno: width ~40% — texto "2 tareas"
      Texto: "4 tareas" / "2 tareas" 11-12px color --muted
- Alerta abajo: mt-4, bg #FDE8E8 rounded-xl p-3 flex gap-2:
  Label "ALTA" 10px bold color #B91C1C + texto 12px color #7F1D1D:
  "1 tarea fallida · revisa la conexión"
  Texto exacto: "1 tarea fallida · revisa la conexión"

CARD 2 — PRESUPUESTOS EN REVISIÓN — blanca:
- Contenedor igual: bg white border rounded- p-5
- Label: "PRESUPUESTOS EN REVISIÓN"
- Fila número: "8.400 €" 28-32px bold + pill "4 acciones" 11px bold px-2 py- rounded-full bg --ivory color --ink
- Sub: "Esperando tu aprobación" 12-13px mt-1 color --muted
- Chips fila: flex flex-wrap gap-2 mt-4:
  Fila 1: Chip "Revisar" bg --amber color #92400E 11px bold px-2.5 py-1 rounded-full + texto al lado "Enviar presupue..." truncate 12px color --ink + "8.400 €" 12px bold derecha
    En la captura se ve truncado: "Enviar presupue..." — reproduce EXACTO ese truncado.
  Fila 2: Chip "Programada" bg --violet-soft color --violet 11px bold px-2.5 py-1 rounded-full + texto "Publicar nota..." truncate 12px + "Notion" 12px color --muted derecha
    En la captura: "Publicar nota..." — reproduce truncado.
  Debajo: "+ 2 más esperando tu decisión" 12px mt-2 color --muted
- Botón abajo: mt-4 w-full py-2.5 rounded-full bg --violet texto blanco 13px bold:
  "Revisar en Operaciones →"
  Al hacer clic: va a Operaciones.

CARD 3 — ESTADO DEL TRABAJO — blanca:
- Contenedor igual
- Label: "ESTADO DEL TRABAJO"
- Fila número: "2" 32px bold + pill "en curso" 11px bold px-2 py- rounded-full bg --ivory color --ink
- Sub: "2 cerradas en el periodo" 12-13px mt-1 color --muted
- Grid mini 3 columnas, gap-2, mt-4:
  3 mini-cards: p-2.5 rounded-xl, text-left:
    Mini 1: bg #FFF8E6: label "En revisión" 10px color --muted + número "2" bold 16px
    Mini 2: bg --ivory: label "Proyectos activos" 10px + número "2" bold 16px
    Mini 3: bg #FDE8E8: label "Fallidas" 10px color #B91C1C + número "1" bold 16px
- Texto abajo: mt-3, 12-13px color --muted, line-height relajado:
  "Marta es el agente con más confianza · 96%"
  "Marta" en bold color --ink.

CARD 4 — OPORTUNIDADES — OSCURA — ÚNICA CARD OSCURA TOP:
- Contenedor: bg #111 / #1A1815, border 1px #111, rounded- p-5, texto blanco
- Label: "OPORTUNIDADES" 10px bold letter-spacing 0.12em color #A8A29E / blanco 60%
- Fila número: "4" 32px bold blanco + pill "en cartera" 11px bold px-2 py- rounded-full bg white/15 color white
- Sub: "Pipeline de Interfaz Studio" 12-13px mt-1 color #D6D3D1
- Lista pipeline — 4 filas, mt-4, gap-2.5:
  Cada fila: flex justify-between items-center 12-13px:
    Label izquierda color #E7E5E4: "Lead" / "Propuesta" / "En espera" / "Ganado"
    Centro: barra flex-1 mx-2 h- rounded-full bg white/15, relleno degradado violeta:
      Lead: width ~55% — número derecha "1"
      Propuesta: width ~75% — número "2"
      En espera: width ~45% — número "1"
      Ganado: width ~15% / casi 0 — número "0"
    Número derecha: bold blanco
- Botones abajo: flex gap-2 mt-5:
  Botón "Ver pipeline": px-4 py-2 rounded-full bg white texto black 12-13px bold
  Botón "Exportar": px-4 py-2 rounded-full bg white/10 texto white 12-13px bold border white/15
  Al hacer clic Ver pipeline: abre pipeline. Exportar: notice "Exportando pipeline…".

7. SECCIÓN PROYECTOS ACTIVOS + ATENCIÓN REQUERIDA — 2 COLUMNAS


Grid: grid-cols-5 en desktop (3 + 2), gap-5. En móvil 1 columna.
Columna izquierda (span 3): PROYECTOS ACTIVOS
Columna derecha (span 2): ATENCIÓN REQUERIDA

--- CARD PROYECTOS ACTIVOS — blanca ---
- Contenedor: bg white border rounded- p-5
- Cabecera: flex justify-between items-center:
  Título "Proyectos activos" Fraunces bold 18-20px
  Derecha: flex gap-2:
    Pill "3 proyectos" 11px bold px-2.5 py-1 rounded-full bg --ivory color --ink
    Botón "Generar reporte": px-3 py-1.5 rounded-full bg black texto blanco 12px bold
- Lista proyectos — 3 items, mt-4, space-y-5:
  Cada proyecto:
    Fila 1: flex gap-3:
      Avatar: 32x32 rounded-full bg --lav texto --violet bold 11px: "LP" / "LP" / "AF"
      Centro flex-1 min-width 0:
        Título bold 14px: "Rediseño del checkout" / "Lanzamiento otoño 2026" / "Soporte y mantenimiento"
        Sub 12px color --muted truncate:
          "Lucía Prats · No se puede resolver la integración con el banco."
          "Lucía Prats · En curso"
          "Ana Ferrer · Pausado · pendiente de renovación"
      Derecha: porcentaje bold 13px: "33%" / "50%" / "30%"
    Fila 2: barra progreso mt-2: h- rounded-full bg #F4EEE3, relleno:
      Proyecto 1: width 33%, bg --violet
      Proyecto 2: width 50%, bg --violet
      Proyecto 3: width 30%, bg #F97316 naranja
- NO añadir más proyectos.

--- CARD ATENCIÓN REQUERIDA — blanca ---
- Contenedor: bg white border rounded- p-5
- Cabecera: flex justify-between items-center:
  Título: flex gap-2: "Atención requerida" Fraunces bold 18-20px + badge "3" 12px bold px-2 py- rounded-full bg #FDE8E8 color #B91C1C
  Derecha: botón "Ver cola": px-3 py-1.5 rounded-full bg black texto blanco 12px bold
- Lista atención — 3 cards, mt-4, space-y-3:
  Cada card: border 1px --border rounded- p-3
  Card 1 — Diego Salas:
    Fila: flex gap-3:
      Avatar 36x36 rounded-full bg --lav texto --violet bold 11px "DS"
      Centro flex-1:
        Nombre bold 13px "Diego Salas"
        Texto 12px color --muted: "Lumen · Aprobar presupuesto · Estudio Lumen · 8.400 €"
      Derecha: punto 8x8 bg #FACC15 amarillo + "hace 2 h" 11px color --muted
    Fila pills mt-2: flex gap-2:
      Pill "Aprobación" bg --amber color #92400E 11px bold px-2 py-1 rounded-full
      Pill "ALTA" bg black color white 11px bold px-2 py-1 rounded-full
  Card 2 — Lucía Prats:
    Avatar 36x36 bg --lav "LP"
    Nombre "Lucía Prats" bold 13px
    Texto: "Interfaz Studio · Publicar la landing de otoño"
    Derecha: punto 8x8 bg --violet + "hace 2 h"
    Pills: "Falta un dato" bg #DBEAFE color #1E40AF + "MEDIA" bg black color white
  Card 3 — Ana Ferrer:
    Avatar 36x36 bg black texto white "AF"
    Nombre "Ana Ferrer" bold 13px
    Texto: "Interfaz Studio · Sincronizar el catálogo con Shopify"
    Derecha: punto 8x8 bg #EF4444 + "hace 2 h"
    Pills: "Fallo" bg #FDE8E8 color #B91C1C + "URGENCIA" bg black color white
- Footer card: mt-3, bg --ivory rounded-xl p-3 flex justify-between items-center:
  Texto 12px color --muted: "1 acción fallida · 4 sin confirmar"
  Botón "Reintentar": px-3 py-1.5 rounded-full bg white border 1px --border 12px bold
  Al hacer clic: notice "Reintentando acción…".

8. SECCIÓN CLIENTES Y OPORTUNIDADES — TABLA — EXACTA


- Contenedor: bg white border rounded- p-0 overflow-hidden, mt-5
- Cabecera sección: p-5 flex justify-between items-center, border-bottom 1px --border:
  Título "Clientes y oportunidades" Fraunces bold 18-20px
  Derecha: flex gap-2:
    Pill "1 en riesgo" 11px bold px-2.5 py-1 rounded-full bg #FDE8E8 color #B91C1C
    Pill "2 oportunidades abiertas" 11px bold px-2.5 py-1 rounded-full bg #DCFCE7 color #166534
- Tabla: w-full, texto 13-14px, header 11px UPPERCASE letter-spacing 0.12em color --muted,
  th px-5 py-3 text-left, td px-5 py-4, border-bottom 1px #F4EEE3
  Columnas EXACTAS, en este orden:
    CLIENTE | DOMINIO | IMPORTE | ESTADO | PRÓXIMO PASO IA | ACCIÓN

Filas — EXACTAMENTE 4, en este orden:

Fila 1 — Casa Botànica:
  CLIENTE: flex gap-2.5 items-center: avatar 32x32 rounded-full bg --lav texto --violet bold 11px "CB" + nombre bold 13-14px "Casa Botànica"
  DOMINIO: "casabotanica.cat" 13px color --muted
  IMPORTE: "6.200 €" bold 13px
  ESTADO: pill "OPORTUNIDAD" bg #DCFCE7 color #166534 11px bold px-2.5 py-1 rounded-full
  PRÓXIMO PASO IA: "Propuesta en PDF de resumen de una pá..." truncate 13px color --ink
    Texto completo: "Propuesta en PDF de resumen de una página"
    Muestra truncado con ellipsis como en captura.
  ACCIÓN: botón "Preparar propuesta" px-3 py-1.5 rounded-full bg black texto blanco 12px bold

Fila 2 — Estudio Lumen:
  CLIENTE: avatar "EL" bg --lav + "Estudio Lumen" bold
  DOMINIO: "estudiolumen.cat"
  IMPORTE: "8.400 €" bold
  ESTADO: pill "ESTABLE" bg #FEF3C7 color #92400E
  PRÓXIMO PASO IA: "Recordatorio de la propuesta el día 25" 13px
  ACCIÓN: botón "Revisar propuesta" mismo estilo negro

Fila 3 — Talleres Norte:
  CLIENTE: avatar "TN" bg --lav + "Talleres Norte" bold
  DOMINIO: "talleresnorte.es"
  IMPORTE: "—" color --muted
  ESTADO: pill "OPORTUNIDAD" verde
  PRÓXIMO PASO IA: "Cualificar necesidad y presupuesto"
  ACCIÓN: botón "Cualificar" negro

Fila 4 — Verde Oficina:
  CLIENTE: avatar "VO" bg --lav + "Verde Oficina" bold
  DOMINIO: "verdeoficina.com"
  IMPORTE: "—"
  ESTADO: pill "RIESGO" bg #FDE8E8 color #B91C1C
  PRÓXIMO PASO IA: "Reactivar con un caso de referencia"
  ACCIÓN: botón "Reactivar" negro

- NO añadir filas. NO cambiar importes. NO cambiar dominios.

9. SECCIÓN RENDIMIENTO DE LOS AGENTES — 3 CARDS


- Contenedor: bg white border rounded- p-5, mt-5
- Cabecera: flex justify-between items-center:
  Título "Rendimiento de los agentes" Fraunces bold 18-20px
  Derecha: pill "3 activos" 11px bold px-2.5 py-1 rounded-full bg #DCFCE7 color #166534
- Grid: grid-cols-3 desktop, 1 móvil, gap-4, mt-4

Card agente — cada una: border 1px --border rounded- p-4, bg white

Card 1 — Marta:
  Fila: flex justify-between: nombre bold 14px "Marta" + pill "96% confianza" bg #DCFCE7 color #166534 11px bold px-2 py-1 rounded-full
  Descripción: 12-13px mt-2 color --muted, line-height relajado:
    "Atender las consultas de clientes con tono cercano, clasificarlas y preparar respuestas revisables."
  Barra + tareas: flex gap-2 items-center mt-4:
    Barra flex-1 h- rounded-full bg #F4EEE3, relleno violeta width ~85%
    Texto "2 tareas" 12px color --muted
  Botones mt-3 flex gap-2:
    "Editar agente": px-3 py-1.5 rounded-full border bg --ivory / white 12px bold color --ink
    "Ver logs": px-3 py-1.5 rounded-full bg black texto blanco 12px bold

Card 2 — Bruno:
  Nombre "Bruno" + pill "96% confianza" verde igual
  Descripción: "Cualificar oportunidades entrantes y preparar propuestas comerciales a partir del histórico."
  Barra: width ~80% violeta + "2 tareas"
  Botones: "Editar agente" + "Ver logs" igual

Card 3 — Nora:
  Nombre "Nora" + pill "83% confianza" bg #FEF3C7 color #92400E
  Descripción: "Revisar entregas de diseño y contenido contra la guía de marca y los tokens v2."
  Barra: width ~75% violeta + "4 tareas"
  Botones: "Editar agente" + "Ver logs" igual

- Al hacer clic Editar agente: abre modal editar agente (nombre, rol, confianza).
- Al hacer clic Ver logs: abre panel logs / notice "Abriendo logs de {agente}…".

10. SECCIÓN INSIGHTS DEL AGENTE — CARD OSCURA FINAL


- Contenedor: bg #111 / #1A1815, rounded- p-5 / p-6, mt-5, texto blanco, con gradiente sutil violeta en esquina derecha (radial, muy sutil, NO degradado grande)
- Cabecera: flex gap-2 items-center flex-wrap:
  Icono: 32x32 rounded-full bg white/10 flex center, Sparkles / ✦ blanco 16px
  Título: "Insights del agente" bold 15-16px blanco + pill "3 nuevos" 11px bold px-2 py-1 rounded-full bg --violet color white
  Derecha: texto "Actualizado hace 2 h · Interfaz Studio" 12px color #A8A29E
- Grid: grid-cols-3 desktop, 1 móvil, gap-4, mt-4

Insight Card 1 — blanca translúcida:
  Contenedor: bg white/5 border white/10 rounded- p-4
  Label: "PRESUPUESTO LISTO PARA REVISAR" 10px bold letter-spacing 0.12em color #A8A29E
  Texto: 13-14px mt-2 line-height relajado color #E7E5E4:
    "Estudio Lumen · 8.400 € · supera el umbral de 5.000 €."
  Botón: mt-3 px-3 py-1.5 rounded-full bg white texto black 12px bold "Revisar presupuesto"

Insight Card 2:
  Contenedor igual
  Label: "FALTA UN DATO PARA PUBLICAR"
  Texto: "La landing de otoño espera la cesión de imagen de las fotos."
  Botón: px-3 py-1.5 rounded-full bg --violet texto blanco 12px bold "Responder al equipo"

Insight Card 3:
  Contenedor igual
  Label: "LA SINCRONIZACIÓN CON SHOPIFY FALLÓ"
  Texto: "El token ha caducado. Revisa la conexión y reintenta."
  Botón: px-3 py-1.5 rounded-full bg white/10 texto white 12px bold border white/15 "Reconectar Shopify"

- Al hacer clic cada botón: notice correspondiente / abre modal.

11. ESTADO INICIAL — FIXTURE SINTÉTICO DE REFERENCIA


- activeNav = 'Analítica'
- range = '30d'
- user = Ana Ferrer, Admin, online
- projects = 3 proyectos con % 33 / 50 / 30
- attention = 3 items (Diego, Lucía, Ana)
- clients = 4 filas tabla
- agents = Marta 96% 2 tareas, Bruno 96% 2 tareas, Nora 83% 4 tareas
- insights = 3 cards
- chatOpen = false (botón flotante Chat)
- search = ''
- filter = 'Todos'

PERSISTENCIA (opcional): si hay backend, cargar proyectos / clientes / agentes desde records.
Si falla, seguir en sesión con datos ejemplo. NO romper la UI.

12. REGLAS DE FIDELIDAD — CONDICIONADAS A LA IMPLEMENTACIÓN ACTUAL


1. En la CAPTURA DEMO de referencia, conservar los textos, importes, porcentajes y dominios de este escenario; en sesión real, usar datos del tenant y no forzar fixtures.
   Importes sagrados: 8.400 € presupuestos, 6.200 € Casa Botànica, 8.400 € Estudio Lumen,
   5.000 € umbral, 4.800 € NO aparece aquí — no lo añadas.
   Porcentajes sagrados: 33%, 50%, 30% proyectos; 96%, 96%, 83% confianza agentes.
   Números sagrados: 8 tareas abiertas, 4 oportunidades, +7 hoy, 2 en curso, 2 esperando decisión,
   4 acciones, 2 cerradas, 2 en revisión, 2 proyectos activos, 1 fallida, 3 atención requerida,
   1 en riesgo, 2 oportunidades abiertas, 3 activos agentes, 3 nuevos insights.
2. NO añadas gráficos, donuts, líneas, Kanban, Grafo, timeline CapCut.
3. NO cambies el orden: header → 4 cards top → Proyectos + Atención → Clientes tabla → Agentes → Insights.
4. Mantén SIEMPRE: #FDFBF7 fondo, #FFFFFF cards, borde #E8DFD2 1px, violeta #5B4BDB primario.
   Solo 2 cards oscuras: Oportunidades y Insights. Todo lo demás blanco.
5. Fraunces SOLO para: "Centro de Mando", "Proyectos activos", "Atención requerida",
   "Clientes y oportunidades", "Rendimiento de los agentes". Todo lo demás Manrope.
6. En el escenario de Analítica, el elemento Analítica se marca activo; no reconstruir el sidebar ni forzar ese estado en otras vistas. Recientes de ejemplo: Recientes SIEMPRE: Rediseño del checkout 2h,
   Resumen semanal de soporte 21h. Pie de ejemplo: Ana Ferrer Admin + botón ajustes violeta.
7. Botón flotante Chat: UNO solo a nivel de aplicación; reutilizar el botón transversal existente, no crear otro dentro de Analítica.
8. Botón "Exportar con IA" SIEMPRE con degradado violeta sutil. Resto botones negros o violetas sólidos.
9. Barras de progreso: finas 6-8px, fondo #F4EEE3, relleno violeta, excepto Soporte 30% naranja #F97316.
10. Pills de estado: OPORTUNIDAD verde, ESTABLE ámbar, RIESGO rosa, ALTA negro, MEDIA negro,
    URGENCIA negro, Aprobación ámbar, Falta un dato azul, Fallo rosa.
11. Responsive: sidebar oculta en móvil, grid 4 → 2 → 1, tabla con scroll horizontal en móvil.
12. Si dudas entre espectacular y limpio, elige LIMPIO, con aire, pro.

ENTREGA:
- Si se autoriza implementación futura: React + TypeScript + componentes existentes; NO un App.tsx monolítico.
- Reutilizar tokens y estilos compartidos existentes; no crear una segunda fuente global de tokens.
- En sesión real, usar /api/analytics/overview y mostrar carga/error/vacío si falla; NO sustituirlo silenciosamente por fixtures. En sesión demo, usar los fixtures compartidos.
- Resultado visual debe preservar la jerarquía y el contenido del escenario demo,
  mismos textos, mismos colores, mismos números, mismos botones, mismo
  comportamiento al hacer clic en rango 7d/30d/90d, Exportar con IA, Ver pipeline,
  Revisar en Operaciones, Generar reporte, Ver cola, Reintentar, Preparar propuesta,
  Revisar propuesta, Cualificar, Reactivar, Editar agente, Ver logs,
  Revisar presupuesto, Responder al equipo, Reconectar Shopify, Chat, Nuevo chat, Buscar.

13. CONTRATOS DE INTEGRACIÓN REAL — NO REDISEÑAR EL CENTRO DE MANDO PRINCIPAL

El repositorio contiene DOS superficies diferentes:
A) `apps/web/src/components/CommandCenterView.tsx`: pantalla inicial «today»,
   construida con CommandCenterHero, BriefingCard, CommandFilters,
   CompanyPanels, OperationalStatus, SampleDashboard y TaskSections.
   Consume GET /api/company y actualiza el estado de la empresa. NO TOCAR.
B) `apps/web/src/workspaces/35-centro-mando/CentroMandoWorkspace.tsx`:
   workspace de Analítica, con WorkspaceHeader, KpiGrid/KpiCard, BarList,
   PendingActionsList, PipelineFunnel, ActiveProjectsPanel,
   CriticalTicketsPanel, TopClientsPanel, AgentsPerformancePanel,
   AiInsightsPanel, ClientDetailModal y Toast. Esta es la superficie a la
   que corresponde el detalle de la presente prompt.

El workspace B utiliza useCentroMandoData(range), useDateRange,
useClientSelection y useToast. El hook demo usa demoStore; la sesión real
usa /api/analytics/overview y no muestra números de ejemplo cuando falla.
No crear sidebar, header global, botón de chat ni estado de tenant duplicados.

14. MEJORAS UX CONSERVADORAS — SIN CAMBIAR EL LAYOUT

- Mantener la secuencia: cabecera, cuatro KPIs, proyectos/atención,
  clientes/oportunidades, agentes, insights. Preservar dos cards oscuras.
- Resolver textos truncados por CSS responsivo, no codificando «...» en datos.
- En móvil, tabla con scroll accesible o presentación alternativa aprobada;
  no perder importes, estados ni acciones.
- Estado del rango: si 7d/30d/90d actualiza datos, mostrar el rango efectivo;
  evitar que un cambio puramente cosmético se anuncie como recálculo real.
- Exportaciones, reintentos, reconexiones y ediciones: si solo muestran toast,
  decir «Acción no conectada en esta demo» en vez de «Exportado» o «Reintentado».
- Distinguir «confianza» de fiabilidad demostrada: etiquetar como métrica
  del dataset cuando exista; no venderla como validación estadística universal.
- Mantener permisos del tenant; evitar mostrar acciones que el usuario no
  puede ejecutar y no mezclar datos de empresas distintas.
- Estados loading/error/empty diferenciados, con retry donde esté soportado.
- Reutilizar foco visible, navegación teclado, etiquetas de iconos y
  prefers-reduced-motion del sistema.

15. CRITERIOS DE ACEPTACIÓN PARA FUTURA REVISIÓN

- Capturas 390, 768, 1280 y 1440 px sin solapes ni duplicación de chrome.
- Comparación visual con el workspace actual, no con un mock nuevo inventado.
- Los cuatro KPIs y las secciones derivan del mismo snapshot de datos.
- El chat transversal aparece una vez y abre el chat existente.
- El Centro de Mando principal «today» no cambia ni de apariencia ni de ruta.
- Ningún fallo de API se oculta con cifras sintéticas en una sesión real.
- Las acciones solo confirman resultados tras éxito real del backend.
- No hacer merge ni deploy sin revisión explícita del founder.

```
