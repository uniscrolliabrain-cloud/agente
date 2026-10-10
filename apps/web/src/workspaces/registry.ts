// WORKSPACE_FRONTEND_REGISTRY_V1 — registry de workspaces en el frontend.

export type WorkspaceFamily =
  | "comunicacion"
  | "documentos"
  | "trabajo"
  | "finanzas"
  | "personas"
  | "operaciones"
  | "gobierno"
  | "datos"
  | "global";

export interface WorkspaceFrontendEntry {
  readonly id: string;
  readonly slug: string;
  readonly family: WorkspaceFamily;
  readonly title: string;
  readonly reference: string;
}

export const WORKSPACE_ENTRIES: readonly WorkspaceFrontendEntry[] = [
  { id: "gmail", slug: "01-gmail", family: "comunicacion", title: "Correo electronico", reference: "Gmail" },
  { id: "whatsapp", slug: "02-whatsapp", family: "comunicacion", title: "Mensajeria instantanea", reference: "WhatsApp Web" },
  { id: "hubspot", slug: "03-hubspot", family: "comunicacion", title: "CRM y ventas", reference: "HubSpot" },
  { id: "holded", slug: "04-holded", family: "finanzas", title: "ERP, facturacion y administracion", reference: "Holded" },
  { id: "google-drive", slug: "05-google-drive", family: "documentos", title: "Archivos y documentos", reference: "Google Drive" },
  { id: "google-calendar", slug: "06-google-calendar", family: "trabajo", title: "Calendario y agenda", reference: "Google Calendar" },
  { id: "linear", slug: "07-linear", family: "trabajo", title: "Tareas y proyectos", reference: "Linear" },
  { id: "chatgpt", slug: "08-chatgpt", family: "global", title: "Chat con IA", reference: "ChatGPT" },
  { id: "airtable", slug: "09-airtable", family: "datos", title: "Tablas y bases de datos", reference: "Airtable" },
  { id: "perdoo", slug: "10-perdoo", family: "personas", title: "Direccion, objetivos y planificacion", reference: "Perdoo" },
  { id: "holded-tesoreria", slug: "11-holded-tesoreria", family: "finanzas", title: "Tesoreria y conciliacion bancaria", reference: "Holded" },
  { id: "odoo-purchase", slug: "12-odoo-purchase", family: "finanzas", title: "Compras y proveedores", reference: "Odoo Purchase" },
  { id: "productive", slug: "13-productive", family: "trabajo", title: "Proyectos y rentabilidad", reference: "Productive" },
  { id: "zendesk", slug: "14-zendesk", family: "comunicacion", title: "Atencion al cliente", reference: "Zendesk" },
  { id: "docusign", slug: "15-docusign", family: "documentos", title: "Contratos y firma", reference: "DocuSign" },
  { id: "n8n", slug: "16-n8n", family: "trabajo", title: "Automatizaciones", reference: "n8n" },
  { id: "process-street", slug: "17-process-street", family: "trabajo", title: "Procedimientos", reference: "Process Street" },
  { id: "factorial", slug: "18-factorial", family: "personas", title: "Recursos humanos", reference: "Factorial" },
  { id: "personio", slug: "19-personio", family: "personas", title: "Seleccion y candidatos", reference: "Personio" },
  { id: "ramp", slug: "20-ramp", family: "finanzas", title: "Gastos", reference: "Ramp" },
  { id: "stripe", slug: "21-stripe", family: "finanzas", title: "Pagos y analitica", reference: "Stripe" },
  { id: "canva", slug: "22-canva", family: "documentos", title: "Diseno", reference: "Canva" },
  { id: "buffer", slug: "23-buffer", family: "comunicacion", title: "Redes sociales", reference: "Buffer" },
  { id: "shopify", slug: "24-shopify", family: "finanzas", title: "Ecommerce", reference: "Shopify" },
  { id: "intercom", slug: "25-intercom", family: "comunicacion", title: "Posventa", reference: "Intercom" },
  { id: "odoo-inventory", slug: "26-odoo-inventory", family: "operaciones", title: "Inventario", reference: "Odoo Inventory" },
  { id: "maintainx", slug: "27-maintainx", family: "operaciones", title: "Mantenimiento", reference: "MaintainX" },
  { id: "odoo-manufacturing", slug: "28-odoo-manufacturing", family: "operaciones", title: "Produccion", reference: "Odoo Manufacturing" },
  { id: "isms-online", slug: "29-isms-online", family: "gobierno", title: "Cumplimiento", reference: "ISMS.online" },
  { id: "microsoft-entra", slug: "30-microsoft-entra", family: "gobierno", title: "Identidad", reference: "Microsoft Entra" },
  { id: "suitedash", slug: "31-suitedash", family: "comunicacion", title: "Portal clientes", reference: "SuiteDash" },
  { id: "notion", slug: "32-notion", family: "documentos", title: "Wiki", reference: "Notion" },
  { id: "langsmith", slug: "33-langsmith", family: "gobierno", title: "Observabilidad", reference: "LangSmith" },
  { id: "trello", slug: "34-trello", family: "trabajo", title: "Kanban", reference: "Trello" },
] as const;

export function getWorkspace(id: string): WorkspaceFrontendEntry | undefined {
  return WORKSPACE_ENTRIES.find((w) => w.id === id);
}

export function listByFamily(family: WorkspaceFamily): readonly WorkspaceFrontendEntry[] {
  return WORKSPACE_ENTRIES.filter((w) => w.family === family);
}
