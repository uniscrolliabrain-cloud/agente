// Catálogo del launcher empresarial.
//
// Los 35 identificadores técnicos son los del inventario real de workspaces
// (`apps/ui-lab/docs/dashboards/11-apps/README.md`); los nombres visibles son la
// propuesta del catálogo aprobada para el launcher. Los iconos son la colección
// V3 generada para esta campaña (un archivo por app, sin cuadrículas).

const iconModules = import.meta.glob("./icons/*.webp", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

export type AppCategory =
  | "Comunicación"
  | "Trabajo"
  | "Finanzas"
  | "Operaciones"
  | "Equipo"
  | "Inteligencia";

export type LauncherApp = {
  id: string;
  name: string;
  tagline: string;
  category: AppCategory;
  icon: string;
};

const icon = (id: string): string => {
  const url = iconModules[`./icons/${id}.webp`];
  if (!url) throw new Error(`Falta el icono de ${id}`);
  return url;
};

const define = (
  id: string,
  name: string,
  tagline: string,
  category: AppCategory,
): LauncherApp => ({ id, name, tagline, category, icon: icon(id) });

export const APPS: LauncherApp[] = [
  define("01-gmail", "Correo", "Bandeja del negocio y respuestas delegadas", "Comunicación"),
  define("02-whatsapp", "Conversaciones", "WhatsApp Business, llamadas y mensajes", "Comunicación"),
  define("03-hubspot", "Clientes", "Relaciones, oportunidades y seguimiento", "Comunicación"),
  define("04-holded", "Facturación", "Presupuestos, facturas y cobros emitidos", "Finanzas"),
  define("05-google-drive", "Archivos", "Documentos compartidos del equipo", "Trabajo"),
  define("06-google-calendar", "Agenda", "Reuniones, compromisos y disponibilidad", "Trabajo"),
  define("07-linear", "Plan de trabajo", "Prioridades, ciclos y entregas", "Trabajo"),
  define("08-chatgpt", "Asistente", "LAIA ejecuta y responde con contexto", "Inteligencia"),
  define("09-airtable", "Registros", "Bases operativas y campos a medida", "Trabajo"),
  define("10-perdoo", "Objetivos", "Metas trimestrales y avance real", "Trabajo"),
  define("11-holded-tesoreria", "Tesorería", "Posición de caja y previsiones", "Finanzas"),
  define("12-odoo-purchase", "Compras", "Proveedores, pedidos y recepciones", "Finanzas"),
  define("13-productive", "Rentabilidad", "Horas, márgenes y capacidad", "Finanzas"),
  define("14-zendesk", "Atención", "Tickets, SLA y satisfacción", "Comunicación"),
  define("15-docusign", "Firmas", "Contratos y firmas pendientes", "Equipo"),
  define("16-n8n", "Automatizaciones", "Flujos entre sistemas y agentes", "Operaciones"),
  define("17-process-street", "Procedimientos", "Checklists y protocolos vivos", "Trabajo"),
  define("18-factorial", "Equipo", "Plantilla, turnos y ausencias", "Equipo"),
  define("19-personio", "Personas", "Expedientes, contratos y desarrollo", "Equipo"),
  define("20-ramp", "Gastos", "Tarjetas, recibos y políticas", "Finanzas"),
  define("21-stripe", "Cobros", "Pagos, suscripciones y conciliación", "Finanzas"),
  define("22-canva", "Diseño", "Piezas de marca y plantillas", "Inteligencia"),
  define("23-buffer", "Publicaciones", "Calendario editorial y canales", "Inteligencia"),
  define("24-shopify", "Tienda", "Catálogo, pedidos y stock", "Inteligencia"),
  define("25-intercom", "Soporte", "Conversaciones de ayuda en producto", "Comunicación"),
  define("26-odoo-inventory", "Inventario", "Existencias, almacenes y lotes", "Operaciones"),
  define("27-maintainx", "Mantenimiento", "Órdenes de trabajo y activos", "Operaciones"),
  define("28-odoo-manufacturing", "Producción", "Órdenes, materiales y calidad", "Operaciones"),
  define("29-isms-online", "Cumplimiento", "Controles, evidencias y auditoría", "Operaciones"),
  define("30-microsoft-entra", "Accesos", "Identidades, roles y permisos", "Operaciones"),
  define("31-suitedash", "Portal cliente", "Espacio privado para cada cliente", "Comunicación"),
  define("32-notion", "Conocimiento", "Wiki interna y decisiones", "Trabajo"),
  define("33-langsmith", "Observabilidad IA", "Trazas, coste y calidad de agentes", "Inteligencia"),
  define("34-trello", "Tableros", "Trabajo visual por etapas", "Trabajo"),
  define("35-centro-mando", "Centro de Mando", "Estado del negocio y decisiones", "Inteligencia"),
];

export const APP_BY_ID = new Map(APPS.map((app) => [app.id, app]));

export const CATEGORY_ORDER: AppCategory[] = [
  "Comunicación",
  "Trabajo",
  "Finanzas",
  "Operaciones",
  "Equipo",
  "Inteligencia",
];

export const FAVORITES_DEFAULT = [
  "01-gmail",
  "06-google-calendar",
  "07-linear",
  "03-hubspot",
  "04-holded",
  "35-centro-mando",
];

export const DOCK_DEFAULT = ["08-chatgpt", "01-gmail", "06-google-calendar", "35-centro-mando"];

export const RECENTS_DEFAULT = ["07-linear", "03-hubspot", "35-centro-mando"];

export type LauncherFolder = {
  id: string;
  name: string;
  appIds: string[];
};

export const FOLDERS: LauncherFolder[] = [
  { id: "finanzas", name: "Finanzas", appIds: ["04-holded", "11-holded-tesoreria", "21-stripe", "20-ramp"] },
  { id: "operaciones", name: "Operaciones", appIds: ["26-odoo-inventory", "28-odoo-manufacturing", "12-odoo-purchase", "27-maintainx"] },
  { id: "equipo", name: "Equipo", appIds: ["18-factorial", "19-personio", "15-docusign"] },
];

export type WidgetData = {
  agenda: { time: string; title: string; meta: string }[];
  pending: { label: string; value: string; meta: string }[];
  agents: { name: string; task: string; state: "trabajando" | "revisando" | "en espera" }[];
  briefing: string;
};

// Datos sintéticos declarados como demostración: no son actividad real.
export const WIDGET_DATA: WidgetData = {
  agenda: [
    { time: "09:30", title: "Comité de operaciones", meta: "Sala Marfil · 4 personas" },
    { time: "12:00", title: "Revisión con cliente Nortia", meta: "Videollamada · 30 min" },
    { time: "16:15", title: "Cierre de nómina", meta: "Equipo · pendiente de firma" },
  ],
  pending: [
    { label: "Aprobaciones", value: "3", meta: "Una vence hoy" },
    { label: "En marcha", value: "6", meta: "Agentes y personas" },
    { label: "Facturas", value: "12", meta: "Por emitir esta semana" },
  ],
  agents: [
    { name: "Marta", task: "Conciliando cobros de octubre", state: "trabajando" },
    { name: "Bruno", task: "Preparando el informe de margen", state: "revisando" },
    { name: "Nora", task: "Clasificando el correo de entrada", state: "en espera" },
  ],
  briefing:
    "Tres decisiones esperan tu criterio y el cierre de tesorería está al 80 %. La agenda de hoy deja dos horas libres por la tarde.",
};

export const COMPANY = {
  name: "Interfaz",
  workspace: "AgntiaPro",
  user: "Ana Ferrer",
};

export type DemoSurface = {
  summary: string;
  columns: { title: string; rows: { label: string; meta: string; state?: string }[] }[];
};

// Contenido de demostración por categoría: suficiente para reconocer la app sin
// fingir que el workspace real está montado dentro del launcher.
export const DEMO_SURFACES: Record<AppCategory, DemoSurface> = {
  Comunicación: {
    summary: "Bandeja unificada con respuestas preparadas por agentes y supervisión humana.",
    columns: [
      {
        title: "Requiere respuesta",
        rows: [
          { label: "Nortia · renovación de servicio", meta: "Hace 12 min", state: "Alta" },
          { label: "Proveedor Mekal · albarán", meta: "Hace 40 min", state: "Media" },
          { label: "Candidata · segunda entrevista", meta: "Hoy, 09:12", state: "Media" },
        ],
      },
      {
        title: "Delegado a agentes",
        rows: [
          { label: "Confirmar reunión del jueves", meta: "Marta · en curso" },
          { label: "Enviar propuesta actualizada", meta: "Bruno · revisando" },
          { label: "Clasificar 38 correos", meta: "Nora · completado" },
        ],
      },
    ],
  },
  Trabajo: {
    summary: "Prioridades del trimestre con responsables, fechas y evidencia de avance.",
    columns: [
      {
        title: "Esta semana",
        rows: [
          { label: "Cerrar propuesta Nortia", meta: "Ana · viernes", state: "En curso" },
          { label: "Revisar procedimiento de compras", meta: "Diego · jueves", state: "Pendiente" },
          { label: "Publicar memoria trimestral", meta: "Lucía · lunes", state: "Hecho" },
        ],
      },
      {
        title: "Bloqueado",
        rows: [
          { label: "Firma del contrato marco", meta: "Espera legal", state: "Bloqueado" },
          { label: "Acceso al almacén norte", meta: "Espera permisos", state: "Bloqueado" },
        ],
      },
    ],
  },
  Finanzas: {
    summary: "Facturación, tesorería y cobros del mes con desviaciones explicadas.",
    columns: [
      {
        title: "Movimiento del mes",
        rows: [
          { label: "Facturación emitida", meta: "84.200 € · +6 %", state: "Al día" },
          { label: "Cobros pendientes", meta: "12.400 € · 2 vencidas", state: "Atención" },
          { label: "Gastos de estructura", meta: "21.780 € · dentro de presupuesto" },
        ],
      },
      {
        title: "Previsión 30 días",
        rows: [
          { label: "Entradas confirmadas", meta: "61.300 €" },
          { label: "Salidas comprometidas", meta: "38.950 €" },
          { label: "Colchón proyectado", meta: "22.350 €" },
        ],
      },
    ],
  },
  Operaciones: {
    summary: "Inventario, producción y cumplimiento con alertas accionables.",
    columns: [
      {
        title: "Estado de operación",
        rows: [
          { label: "Órdenes de producción", meta: "7 abiertas · 2 en riesgo", state: "Atención" },
          { label: "Stock crítico", meta: "4 referencias bajo mínimo", state: "Alta" },
          { label: "Auditoría ISO", meta: "Evidencias al 92 %" },
        ],
      },
      {
        title: "Mantenimiento",
        rows: [
          { label: "Línea 2 · revisión anual", meta: "Programada el 28" },
          { label: "Carretilla eléctrica", meta: "Avería reportada" },
        ],
      },
    ],
  },
  Equipo: {
    summary: "Plantilla, expedientes y firmas pendientes del equipo.",
    columns: [
      {
        title: "Personas",
        rows: [
          { label: "Altas en curso", meta: "2 incorporaciones en enero" },
          { label: "Ausencias", meta: "1 baja médica · 2 vacaciones" },
          { label: "Evaluaciones", meta: "6 de 9 completadas" },
        ],
      },
      {
        title: "Documentos",
        rows: [
          { label: "Contrato de prácticas", meta: "Pendiente de firma", state: "Firma" },
          { label: "Política de gastos", meta: "Actualizada hace 3 días" },
        ],
      },
    ],
  },
  Inteligencia: {
    summary: "Agentes, conocimiento y rendimiento del sistema con trazas verificables.",
    columns: [
      {
        title: "Actividad de agentes",
        rows: [
          { label: "Marta · conciliación", meta: "14 tareas · 100 % éxito" },
          { label: "Bruno · informes", meta: "6 tareas · 1 revisión humana" },
          { label: "Nora · correo", meta: "38 mensajes clasificados" },
        ],
      },
      {
        title: "Calidad",
        rows: [
          { label: "Coste medio por tarea", meta: "0,42 €" },
          { label: "Latencia p95", meta: "8,4 s" },
          { label: "Incidencias abiertas", meta: "1 · reintento automático" },
        ],
      },
    ],
  },
};

export const REST_NOTIFICATIONS = [
  { app: "Aprobaciones", title: "3 decisiones esperan tu criterio", meta: "Centro de Mando · hace 8 min", appId: "35-centro-mando" },
  { app: "Tesorería", title: "El cierre de caja está al 80 %", meta: "Ana · hace 22 min", appId: "11-holded-tesoreria" },
  { app: "Agenda", title: "Comité de operaciones a las 09:30", meta: "Sala Marfil", appId: "06-google-calendar" },
];
