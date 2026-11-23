# Catálogo de 40 superficies UI/UX — AgntiaPro UI Lab

Inventario documental creado a partir del árbol de `main` el 23-11-2026: **35 workspaces numerados** en `apps/web/src/workspaces/` y **5 superficies adicionales** del laboratorio. No implica que existan 40 dashboards completos ni que todos sean aplicaciones separadas.

## Autoridad visual

Landing premium y Estudio de Operaciones / Studio Demo: identidad visual; la guía de diseño existente regula el branding, **no** las funcionalidades. Respetar los textos originales del founder, la documentación de `apps/ui-lab/docs/agntia-demo/` y los datos sintéticos coherentes. Verificar rutas y componentes reales antes de redactar prompts definitivas.

## Método en cuatro pasadas

1. Prompt maestra y auditoría UX/UI.
2. Movimiento, interacciones, escenarios y runtime falso.
3. Contratos de componentes modulares.
4. Código, pruebas y validación visual.

Cada pasada requiere revisión y aprobación; no completar casillas sin evidencia. Las carpetas se crean como inventario y **plantillas**, no como especificaciones finales inventadas.

## Inventario y fuentes

- [01-gmail](./01-gmail/README.md) — `apps/web/src/workspaces/01-gmail`
- [02-whatsapp](./02-whatsapp/README.md) — `apps/web/src/workspaces/02-whatsapp`
- [03-hubspot](./03-hubspot/README.md) — `apps/web/src/workspaces/03-hubspot`
- [04-holded](./04-holded/README.md) — `apps/web/src/workspaces/04-holded`
- [05-google-drive](./05-google-drive/README.md) — `apps/web/src/workspaces/05-google-drive`
- [06-google-calendar](./06-google-calendar/README.md) — `apps/web/src/workspaces/06-google-calendar`
- [07-linear](./07-linear/README.md) — `apps/web/src/workspaces/07-linear`
- [08-chatgpt](./08-chatgpt/README.md) — `apps/web/src/workspaces/08-chatgpt`
- [09-airtable](./09-airtable/README.md) — `apps/web/src/workspaces/09-airtable`
- [10-perdoo](./10-perdoo/README.md) — `apps/web/src/workspaces/10-perdoo`
- [11-holded-tesoreria](./11-holded-tesoreria/README.md) — `apps/web/src/workspaces/11-holded-tesoreria`
- [12-odoo-purchase](./12-odoo-purchase/README.md) — `apps/web/src/workspaces/12-odoo-purchase`
- [13-productive](./13-productive/README.md) — `apps/web/src/workspaces/13-productive`
- [14-zendesk](./14-zendesk/README.md) — `apps/web/src/workspaces/14-zendesk`
- [15-docusign](./15-docusign/README.md) — `apps/web/src/workspaces/15-docusign`
- [16-n8n](./16-n8n/README.md) — `apps/web/src/workspaces/16-n8n`
- [17-process-street](./17-process-street/README.md) — `apps/web/src/workspaces/17-process-street`
- [18-factorial](./18-factorial/README.md) — `apps/web/src/workspaces/18-factorial`
- [19-personio](./19-personio/README.md) — `apps/web/src/workspaces/19-personio`
- [20-ramp](./20-ramp/README.md) — `apps/web/src/workspaces/20-ramp`
- [21-stripe](./21-stripe/README.md) — `apps/web/src/workspaces/21-stripe`
- [22-canva](./22-canva/README.md) — `apps/web/src/workspaces/22-canva`
- [23-buffer](./23-buffer/README.md) — `apps/web/src/workspaces/23-buffer`
- [24-shopify](./24-shopify/README.md) — `apps/web/src/workspaces/24-shopify`
- [25-intercom](./25-intercom/README.md) — `apps/web/src/workspaces/25-intercom`
- [26-odoo-inventory](./26-odoo-inventory/README.md) — `apps/web/src/workspaces/26-odoo-inventory`
- [27-maintainx](./27-maintainx/README.md) — `apps/web/src/workspaces/27-maintainx`
- [28-odoo-manufacturing](./28-odoo-manufacturing/README.md) — `apps/web/src/workspaces/28-odoo-manufacturing`
- [29-isms-online](./29-isms-online/README.md) — `apps/web/src/workspaces/29-isms-online`
- [30-microsoft-entra](./30-microsoft-entra/README.md) — `apps/web/src/workspaces/30-microsoft-entra`
- [31-suitedash](./31-suitedash/README.md) — `apps/web/src/workspaces/31-suitedash`
- [32-notion](./32-notion/README.md) — `apps/web/src/workspaces/32-notion`
- [33-langsmith](./33-langsmith/README.md) — `apps/web/src/workspaces/33-langsmith`
- [34-trello](./34-trello/README.md) — `apps/web/src/workspaces/34-trello`
- [35-centro-mando](./35-centro-mando/README.md) — `apps/web/src/workspaces/35-centro-mando`
- [36-landing](./36-landing/README.md) — `apps/ui-lab/src/vendor/landing`
- [37-estudio-operaciones](./37-estudio-operaciones/README.md) — `apps/ui-lab/src/vendor/studio`
- [38-comunicaciones](./38-comunicaciones/README.md) — `apps/ui-lab/src/comunicaciones`
- [39-telefono](./39-telefono/README.md) — `apps/ui-lab/src/comunicaciones/telefono`
- [40-galeria-branding](./40-galeria-branding/README.md) — `apps/ui-lab/src/BrandGallery.tsx`

## Convención futura por carpeta

`00-founder-verbatim.md`, `01-master-prompt.md`, `02-motion-and-demo.md`, `03-component-contracts.md`, `04-acceptance-and-audit.md`, `evidence/`. Crear estos archivos cuando exista contenido validado; no rellenarlos con suposiciones.

## Límites

No modificar código funcional, secretos, kernel, tenants, APIs ni despliegues durante esta campaña documental. Las referencias de marca no obligan a copiar layouts entre workspaces. No confundir scaffolds con pantallas listas.
