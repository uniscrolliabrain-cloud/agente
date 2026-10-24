<!-- ZENDESK_UI_SPEC_V1 -->
# Spec funcional - 14-zendesk

> Estado: vivo. Se actualiza mientras se construye.
> Referencia: backend en packages/workspaces/14-zendesk/.
> Mockup: Agntia Tickets Os (3 columnas).

---

## 1. Objetivo

Cliente de tickets de soporte en 3 columnas. Sidebar de navegacion,
lista de tickets con inteligencia IA por fila, y panel contextual
con resumen IA y co-escritura de respuestas.

Clona el mockup Agntia Tickets Os, adaptado a la paleta real del repo
y a las 7 capabilities del backend de zendesk.

---

## 2. Backend real (packages/workspaces/14-zendesk/)

### Capabilities (7)

| id | kind | risk | requiresApproval |
|---|---|---|---|
| ticket.create | action | low | false |
| ticket.assign | action | low | false |
| ticket.escalate | action | low | false |
| ticket.resolve | action | low | true |
| ticket.reopen | action | low | false |
| ticket.list | query | low | false |
| ticket.read | query | low | false |

### Commands (5)

- ticket.create
- ticket.assign
- ticket.escalate
- ticket.resolve
- ticket.reopen

### Queries (2)

- ticket.list
- ticket.read

### Entidades (5)

- SupportTicket: subject, requester, assignee, priority, status, type, tags, channel, slaId, firstResponseAt, solvedAt
- TicketComment: author, authorKind, body, isInternal, attachments
- SLA: policy, metric, dueAt, breached
- Resolution: summary, rootCause, actions, satisfactionScore
- Macro: title, actions, active

---

## 3. Capa IA (nueva, no esta en el backend)

El mockup exige una capa IA que el backend no declara como entidades.
Se anade como tipos UI. Cuando se conecte al backend real, la servira
un endpoint nuevo que aun no existe.

Tipos UI anadidos:

- TicketIntelligence: summary, intent, urgency, urgencyReason,
  nextStep, confidence, insights
- TicketInsight: id, text, tone (purple | warn | green | info)
- CoWriteDraft: templateName, recipient, body, active

En el mock se rellenan a mano. En produccion los servira un endpoint
de inteligencia que consume el LLM.

---

## 4. Las 3 columnas

### Columna 1 - Sidebar (240px)

Navegacion global del workspace. Marca, estado del agente, boton de
nuevo ticket, buscador, seccion WORKSPACE (Chat, Tareas, Documentos,
Proyectos, Lo que sabe de tu negocio, Equipo, Agentes) y seccion
EMAILS (Recibidos, Destacados).

### Columna 2 - Lista de tickets (flex)

Cabecera con buscador, pills IA (Clasificar con IA, Resumir bandeja),
filtros primarios (Principal, Prioridad IA, Promociones) y barra de
acciones (Seleccionar, Archivar IA, paginacion).

Lista scrollable. Cada fila: checkbox, estrella, avatar, nombre,
empresa, tag de tipo, badge Lead IA si aplica, hora, asunto en
negrita, preview, chips IA.

### Columna 3 - Panel contextual IA (380px)

Cabecera del cliente (avatar, nombre, LTV, email, meta). Botones
rapidos (Ver en HubSpot, Holded, En CRM). Card Resumen IA con
intencion, urgencia, proximo paso y confianza. Panel de co-escritura
con toggle, selector de plantilla, editor y botones de accion.

---

## 5. Estados

- Empty: sin tickets en la lista activa.
- Loading: skeleton mientras carga.
- Error: fallo de red o del backend.
- Selected: ticket activo con panel contextual abierto.
- Composing: modal o panel de nuevo ticket abierto.
- CoWriting: borrador IA activo en el panel derecho.

---

## 6. Paleta real del repo

Del tailwind.config.js:

- Fondos: bg, bg-card, bg-soft, bg-softer
- Bordes: border, border-soft, border-strong
- Texto: text, text-2, text-3, text-4
- Acento: purple, purple-soft
- Estado: green, orange, warn, warn-border, warn-text, info, info-border, info-text

Mapeo del codigo bruto a la paleta real:

| Inventada en el mockup | Real en el repo |
|---|---|
| bg-[#E9E7FF] | bg-purple-soft |
| text-[#6C5CD6] | text-purple |
| bg-[#FEF3C7] | bg-warn |
| text-[#92400E] | text-warn-text |
| bg-canvas | bg-bg-card |
| bg-surface | bg-bg-soft |
| border-line | border-border |
| text-ink | text-text |
| text-muted | text-text-2 |
| bg-accent | bg-purple |
| text-accent | text-purple |
| bg-online | bg-green |

Colores dinamicos (avatar de empresa): se aplican por style={{}}
con hash del nombre. Nunca bg-[#hex] en clases Tailwind.

---

## 7. Decisiones tomadas

- Montaje: Opcion B (excepcion en WorkspaceShell). Diferido. No se toca
  WorkspaceShell.tsx en esta iteracion. index.ts exporta el contenedor
  y el montaje se decide en 04-handoff-v2.md.
- Componentes: en subcarpetas dentro de components/ (sidebar/, list/,
  detail/, shared/) para no tener 26 ficheros en plano. El 02-whatsapp
  los tiene en plano, pero con 11. Aqui son 26 y en plano es
  intrackeable.
- Capa IA: tipos UI en types.ts, no entidades backend.
- Paleta: real del repo, cero invenciones. Colores dinamicos por style.
- Sin dark mode. Sin fuentes ajenas. Instrument Sans.
- Imports con extension .ts / .tsx.

---

## 8. Fuera de scope

- Conectar al backend real. El api.ts es mock.
- Servir vistas desde el backend (VIEWS esta vacio).
- Montar en el shell. Va al handoff v2.
- Traducciones. Todo en castellano como el resto del repo.

---

FIN DEL SPEC.
