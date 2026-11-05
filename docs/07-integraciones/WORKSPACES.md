# Catálogo de Workspaces

> v1 · 2026-10-27 · Estado: current

OpenMuse incluye un catálogo de **34 workspaces** definidos en `packages/workspaces/src/index.ts`. Cada workspace es un módulo de integración con una aplicación externa.

## Lista de workspaces

| # | Workspace | Descripción |
|---|-----------|-------------|
| 01 | Gmail | Correo electrónico |
| 02 | WhatsApp | Mensajería vía Evolution API |
| 03 | HubSpot | CRM |
| 04 | Holded | Facturación y contabilidad |
| 05 | Google Drive | Almacenamiento de archivos |
| 06 | Google Calendar | Calendario y eventos |
| 07 | Linear | Gestión de proyectos y tareas |
| 08 | ChatGPT | IA conversacional |
| 09 | Airtable | Base de datos no relacional |
| 10 | Perdoo | OKR y gestión de objetivos |
| 11 | Holded Tesorería | Tesorería de Holded |
| 12 | Odoo Purchase | Compras de Odoo |
| 13 | Productive | Gestión de agencias |
| 14 | Zendesk | Soporte al cliente |
| 15 | DocuSign | Firmas electrónicas |
| 16 | n8n | Automatización de flujos |
| 17 | Process Street | Procedimientos y checklists |
| 18 | Factorial | RRHH |
| 19 | Personio | RRHH |
| 20 | Ramp | Gastos y tarjetas corporativas |
| 21 | Stripe | Pagos |
| 22 | Canva | Diseño gráfico |
| 23 | Buffer | Redes sociales |
| 24 | Shopify | E-commerce |
| 25 | Intercom | Chat y soporte al cliente |
| 26 | Odoo Inventory | Inventario de Odoo |
| 27 | MaintainX | Mantenimiento y operaciones |
| 28 | Odoo Manufacturing | Fabricación de Odoo |
| 29 | ISMS Online | Seguridad de la información |
| 30 | Microsoft Entra | Identidad y acceso |
| 31 | SuiteDash | Gestión de negocio |
| 32 | Notion | Documentos y bases de datos |
| 33 | LangSmith | Observabilidad de LLM |
| 34 | Trello | Gestión de tareas (kanban) |

## Estado de cada workspace

Todos los 34 manifests tienen estado `scaffold`. Esto significa que están definidos y registrados, pero **no todos tienen handlers implementados y probados individualmente**.

## Arquitectura

- `packages/workspaces/src/index.ts`: barrel que importa y exporta todos los workspaces como `ALL_WORKSPACES`.
- `apps/server/src/engine/workspaces/`: registry, bridge y dispatcher de capacidades de workspace.
- `TenantScopedCapabilityRegistry`: registry scoped por tenant (aún no conecta tenantId efectivamente en el resolver).

## Uso

El dispatcher de workspaces permite ejecutar commands y queries contra cada aplicación integrada, con bridge entre las capacidades del workspace y el runtime de OpenMuse.
