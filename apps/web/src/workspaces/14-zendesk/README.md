<!-- ZENDESK_UI_MAP_V1 -->
# 14-zendesk - Tickets de soporte

- **Estado:** implementado
- **Referencia:** Zendesk
- **Familia:** comunicacion
- **Mockup:** Agntia Tickets Os (3 columnas)

## Objetivo

Cliente de tickets de soporte en 3 columnas. Sidebar de navegacion,
lista de tickets con inteligencia IA por fila, y panel contextual
con resumen IA y co-escritura de respuestas.

## Estructura

```
14-zendesk/
  README.md                     este fichero
  index.ts                      ZENDESK_WORKSPACE_INDEX_V2
  types.ts                      ZENDESK_TYPES_V1
  format.ts                     ZENDESK_FORMAT_V1
  ZendeskWorkspace.css          ZENDESK_UI_CSS_V1
  api.ts                        ZENDESK_API_V1
  hooks/
    useZendesk.ts               ZENDESK_HOOK_V1
  components/
    ZendeskWorkspace.tsx        ZENDESK_WORKSPACE_V1
    ZendeskSidebar.tsx          ZENDESK_SIDEBAR_V1
    WorkspaceBrand.tsx          ZENDESK_BRAND_V1
    AgentStatusPill.tsx         ZENDESK_STATUS_V1
    NewTicketButton.tsx         ZENDESK_NEW_BTN_V1
    SidebarSearch.tsx           ZENDESK_SIDEBAR_SEARCH_V1
    SidebarSection.tsx          ZENDESK_SIDEBAR_SECTION_V1
    SidebarNavItem.tsx          ZENDESK_SIDEBAR_NAV_V1
    TicketListPanel.tsx         ZENDESK_LIST_PANEL_V1
    TicketListHeader.tsx        ZENDESK_LIST_HEADER_V1
    TicketListActions.tsx       ZENDESK_LIST_ACTIONS_V1
    TicketList.tsx              ZENDESK_TICKET_LIST_V1
    TicketListItem.tsx          ZENDESK_TICKET_ITEM_V1
    TicketFilterPill.tsx        ZENDESK_FILTER_PILL_V1
    TicketAvatar.tsx            ZENDESK_AVATAR_V1
    LeadBadge.tsx               ZENDESK_LEAD_V1
    TicketChips.tsx             ZENDESK_CHIPS_V1
    TicketDetailPanel.tsx       ZENDESK_DETAIL_PANEL_V1
    CustomerHeader.tsx          ZENDESK_CUSTOMER_V1
    CustomerQuickActions.tsx    ZENDESK_QUICK_ACTIONS_V1
    TicketInsightCard.tsx       ZENDESK_INSIGHT_CARD_V1
    InsightIntent.tsx           ZENDESK_INSIGHT_INTENT_V1
    InsightUrgencyNextStep.tsx  ZENDESK_INSIGHT_URGENCY_V1
    InsightChips.tsx            ZENDESK_INSIGHT_CHIPS_V1
    CoWritePanel.tsx            ZENDESK_COWRITE_PANEL_V1
    CoWriteToggle.tsx           ZENDESK_COWRITE_TOGGLE_V1
    CoWriteEditor.tsx           ZENDESK_COWRITE_EDITOR_V1
    IconButton.tsx              ZENDESK_ICON_BTN_V1
    Avatar.tsx                  ZENDESK_SHARED_AVATAR_V1
    EmptyState.tsx              ZENDESK_EMPTY_V1
  docs/
    01-ui-map.md
    02-roadmap.md
    03-spec.md
```

## Mapa de componentes

### Sidebar (columna 1)

| Fichero | Responsabilidad |
|---|---|
| WorkspaceBrand.tsx | Marca "Agente IA Pro" + boton PRO |
| AgentStatusPill.tsx | Pill verde "Agente activo ACME" |
| NewTicketButton.tsx | Boton negro "Nuevo email" |
| SidebarSearch.tsx | Buscador de la sidebar |
| SidebarSection.tsx | Seccion con label (WORKSPACE, EMAILS) |
| SidebarNavItem.tsx | Item de navegacion con icono y badge |
| ZendeskSidebar.tsx | Contenedor de la columna 1 |

### Lista (columna 2)

| Fichero | Responsabilidad |
|---|---|
| TicketListPanel.tsx | Contenedor de la columna 2 |
| TicketListHeader.tsx | Buscador + pills IA + filtros |
| TicketListActions.tsx | Seleccionar + Archivar + paginacion |
| TicketList.tsx | Lista scrollable de tickets |
| TicketListItem.tsx | Fila de ticket completa |
| TicketFilterPill.tsx | Pill de filtro con contador |
| TicketAvatar.tsx | Avatar con iniciales + color por empresa |
| LeadBadge.tsx | Badge negro "Lead IA" |
| TicketChips.tsx | Chips IA con tono por insight |

### Panel detalle (columna 3)

| Fichero | Responsabilidad |
|---|---|
| TicketDetailPanel.tsx | Contenedor de la columna 3 |
| CustomerHeader.tsx | Avatar + nombre + LTV + meta del cliente |
| CustomerQuickActions.tsx | Botones HubSpot / Holded / CRM |
| TicketInsightCard.tsx | Card morada con resumen IA |
| InsightIntent.tsx | Seccion "Intencion" |
| InsightUrgencyNextStep.tsx | Grid Urgencia + Proximo paso |
| InsightChips.tsx | Chips finales del card |
| CoWritePanel.tsx | Panel completo de co-escritura |
| CoWriteToggle.tsx | Switch on/off co-escritura |
| CoWriteEditor.tsx | Textarea del borrador IA |

### Compartidos

| Fichero | Responsabilidad |
|---|---|
| IconButton.tsx | Boton de icono (default/ghost/primary) |
| Avatar.tsx | Avatar generico |
| EmptyState.tsx | Estado vacio reutilizable |

## Tipos (types.ts)

- ZendeskCustomer, ZendeskTicket
- TicketIntelligence, TicketInsight
- CoWriteDraft
- SidebarNavEntry
- TicketStatus, TicketPriority, TicketCategory
- CompanyType, InsightTone, UrgencyLevel, TicketFilter

## Estado compartido (hooks/useZendesk.ts)

Expone: tickets, filteredTickets, activeFilter, activeTicketId,
activeTicket, selectedIds, starredIds, query, coWrite, loading, error.

Acciones: setFilter, setQuery, selectTicket, toggleSelected,
toggleStar, clearSelection, generateReply, toggleCoWrite, setCoWriteBody.

## Datos (api.ts)

Mock en memoria con 8 tickets del mockup. Firmas de la API real:
listTickets, getTicket, getCoWriteDraft, generateCoWriteReply,
createTicket, assignTicket, escalateTicket, resolveTicket, reopenTicket.

## Capa IA (no viene del backend)

TicketIntelligence, TicketInsight y CoWriteDraft son tipos UI.
El backend de zendesk no los declara. Cuando se conecte al backend
real, los servira un endpoint nuevo.

## Montaje

Pendiente. Opcion B (excepcion en WorkspaceShell). Ver docs/04-handoff-v2.md.

## Pendientes conocidos

- Montar en WorkspaceShell (Opcion B).
- Conectar al backend real (sustituir api.ts por fetch).
- Endpoint de inteligencia para la capa IA.
