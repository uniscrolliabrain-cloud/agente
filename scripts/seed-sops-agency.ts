// Development script: POSTs the agency SOPs to a running API.
// Idempotent: SOPs that already exist are skipped without changes.
//
// Usage:
//   $env:OPENMUSE_URL     = "http://localhost:8787"   (default)
//   $env:OPENMUSE_ACCESS_KEY = "..."                  (required, live mode)
//   pnpm exec tsx scripts/seed-sops-agency.ts

const base = process.env.OPENMUSE_URL ?? "http://localhost:8787";
const accessKey = process.env.OPENMUSE_ACCESS_KEY ?? "";
if (!accessKey) {
  console.error("Set OPENMUSE_ACCESS_KEY before running this script.");
  process.exit(1);
}

interface SOPStep {
  id: string;
  title: string;
  tool: string;
  required?: boolean;
  prompt?: string;
  params?: Record<string, unknown>;
}

interface SOPInput {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: { type: "manual" | "api" | "cron" | "email_subject"; value: string };
  allowedTools: string[];
  skillId?: string;
  steps: SOPStep[];
  active: boolean;
}

const sops: SOPInput[] = [
  {
    id: "resumen-negocio",
    name: "Resumen del negocio",
    description: "Informe periÃ³dico de leads, clientes y facturaciÃ³n",
    category: "Operaciones",
    trigger: { type: "cron", value: "weekly:fri:18:00" },
    allowedTools: ["query_business", "save_artifact", "prepare_email"],
    steps: [
      { id: "leads", title: "Leer leads", tool: "query_business", capabilityId: "query_business", required: true,
        params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'lead'" } },
      { id: "clients", title: "Leer clientes", tool: "query_business", capabilityId: "query_business", required: true,
        params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'client'" } },
      { id: "invoices", title: "Leer facturas", tool: "query_business", capabilityId: "query_business", required: true,
        params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'invoice'" } },
      { id: "report", title: "Guardar informe", tool: "save_artifact", capabilityId: "save_artifact", required: true,
        params: { kind: "report", title: "Resumen del negocio",
          summary: "Leads, clientes y facturas consolidados",
          data: { leads: "{{leads}}", clients: "{{clients}}", invoices: "{{invoices}}" } } },
      { id: "send", title: "Preparar email", tool: "prepare_email", capabilityId: "prepare_email", required: false,
        params: { to: ["tu-email@ejemplo.com"], subject: "Resumen del negocio",
          body: "Adjunto el resumen con leads, clientes activos y estado de facturaciÃ³n." } },
    ],
    active: true,
  },
  {
    id: "follow-up-3-dias",
    name: "Follow-up a leads contactados",
    description: "Recordatorio a leads sin respuesta tras 3 dÃ­as",
    category: "Ventas",
    trigger: { type: "cron", value: "daily:09:00" },
    allowedTools: ["query_business", "prepare_email"],
    steps: [
      { id: "contactados", title: "Leads contactados", tool: "query_business", capabilityId: "query_business", required: true,
        params: { source: "postgres", query: "SELECT * FROM records WHERE status = 'contactado'" } },
      { id: "reminder", title: "Preparar recordatorio", tool: "prepare_email", capabilityId: "prepare_email", required: true,
        params: { to: ["tu-email@ejemplo.com"], subject: "Follow-up leads",
          body: "Revisa los leads contactados y envÃ­a recordatorio personalizado." } },
    ],
    active: true,
  },
  {
    id: "primer-contacto",
    name: "Primer contacto personalizado",
    description: "Prepara email Ãºnico por lead con Ã¡ngulo elegido",
    category: "Ventas",
    trigger: { type: "manual", value: "" },
    allowedTools: ["read_workspace", "ask_user", "prepare_email"],
    steps: [
      { id: "contexto", title: "Leer lead", tool: "read_workspace", capabilityId: "read_workspace", required: true,
        params: { section: "files" } },
      { id: "angulo", title: "Elegir Ã¡ngulo", tool: "ask_user", capabilityId: "ask_user", required: true,
        prompt: "Â¿QuÃ© Ã¡ngulo usar? (precio / rapidez / resultados / trato personal)" },
      { id: "email", title: "Preparar email", tool: "prepare_email", capabilityId: "prepare_email", required: true,
        params: { to: ["{{input.email}}"], subject: "Sobre tu presencia digital",
          body: "Hola,\n\nHe visto tu negocio y creo que hay margen de mejora.\n\nÂ¿Te interesa que hablemos?" } },
    ],
    active: true,
  },
  {
    id: "recordar-pago-vencido",
    name: "Recordar pago vencido",
    description: "Aviso amable de facturas pendientes",
    category: "Cobros",
    trigger: { type: "cron", value: "daily:10:00" },
    allowedTools: ["query_business", "prepare_email"],
    steps: [
      { id: "pendientes", title: "Facturas pendientes", tool: "query_business", capabilityId: "query_business", required: true,
        params: { source: "postgres", query: "SELECT * FROM records WHERE status = 'pendiente'" } },
      { id: "recordatorio", title: "Preparar recordatorio", tool: "prepare_email", capabilityId: "prepare_email", required: true,
        params: { to: ["tu-email@ejemplo.com"], subject: "Facturas pendientes",
          body: "Revisa las facturas pendientes y envÃ­a recordatorio." } },
    ],
    active: true,
  },
  {
    id: "emitir-factura-mensual",
    name: "Emitir facturas del mes",
    description: "Genera y envÃ­a facturas a clientes activos",
    category: "Cobros",
    trigger: { type: "cron", value: "weekly:mon:09:00" },
    allowedTools: ["query_business", "computer_command", "save_artifact", "prepare_email"],
    skillId: "factura",
    steps: [
      { id: "clientes", title: "Clientes activos", tool: "query_business", capabilityId: "query_business", required: true,
        params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'client'" } },
      { id: "factura", title: "Generar factura", tool: "computer_command", capabilityId: "computer_command", required: true,
        params: { command: "python3 /workspace/skills/factura/main.py --client '{{input.client}}' --amount '{{input.amount}}'",
          operationId: "factura-{{input.client}}-{{input.month}}", cwd: "/workspace" } },
      { id: "report", title: "Guardar factura", tool: "save_artifact", capabilityId: "save_artifact", required: true,
        params: { kind: "report", title: "Factura {{input.client}}", summary: "Factura mensual",
          data: { factura: "{{factura}}" } } },
      { id: "send", title: "Enviar por email", tool: "prepare_email", capabilityId: "prepare_email", required: true,
        params: { to: ["{{input.email}}"], subject: "Factura del mes",
          body: "Adjunto la factura del mes." } },
    ],
    active: true,
  },
  {
    id: "auditar-lead-web",
    name: "Auditar web de un lead",
    description: "Analiza la web de un negocio y produce informe",
    category: "Ventas",
    trigger: { type: "api", value: "" },
    allowedTools: ["read_web", "computer_command", "save_artifact"],
    skillId: "audit-web",
    steps: [
      { id: "home", title: "Leer home", tool: "read_web", capabilityId: "read_web", required: true,
        params: { url: "https://{{input.domain}}" } },
      { id: "audit", title: "AuditorÃ­a tÃ©cnica", tool: "computer_command", capabilityId: "computer_command", required: true,
        params: { command: "python3 /workspace/skills/audit-web/main.py '{{input.domain}}'",
          operationId: "audit-{{input.domain}}", cwd: "/workspace" } },
      { id: "report", title: "Guardar informe", tool: "save_artifact", capabilityId: "save_artifact", required: true,
        params: { kind: "report", title: "AuditorÃ­a {{input.domain}}", summary: "AuditorÃ­a web",
          data: { home: "{{home}}", tech: "{{audit}}" } } },
    ],
    active: true,
  },
  {
    id: "revisar-pipeline",
    name: "Revisar pipeline de ventas",
    description: "Estado actual de todos los leads clasificado por estado",
    category: "Ventas",
    trigger: { type: "manual", value: "" },
    allowedTools: ["query_business", "save_artifact"],
    steps: [
      { id: "leads", title: "Todos los leads", tool: "query_business", capabilityId: "query_business", required: true,
        params: { source: "postgres", query: "SELECT * FROM records WHERE type = 'lead'" } },
      { id: "report", title: "Guardar pipeline", tool: "save_artifact", capabilityId: "save_artifact", required: true,
        params: { kind: "report", title: "Pipeline actual", summary: "Leads por estado",
          data: { leads: "{{leads}}" } } },
    ],
    active: true,
  },
  {
    id: "conciliacion-mensual",
    name: "ConciliaciÃ³n mensual",
    description: "Cuadra facturas emitidas y cobradas",
    category: "Operaciones",
    trigger: { type: "cron", value: "daily:08:00" },
    allowedTools: ["query_business", "save_artifact", "prepare_email"],
    steps: [
      { id: "cobradas", title: "Facturas cobradas", tool: "query_business", capabilityId: "query_business", required: true,
        params: { source: "postgres", query: "SELECT * FROM records WHERE status = 'cobrada'" } },
      { id: "pendientes", title: "Facturas pendientes", tool: "query_business", capabilityId: "query_business", required: true,
        params: { source: "postgres", query: "SELECT * FROM records WHERE status = 'pendiente'" } },
      { id: "report", title: "Guardar conciliaciÃ³n", tool: "save_artifact", capabilityId: "save_artifact", required: true,
        params: { kind: "report", title: "ConciliaciÃ³n", summary: "Estado de cobros",
          data: { cobradas: "{{cobradas}}", pendientes: "{{pendientes}}" } } },
    ],
    active: true,
  },
  {
    id: "publicar-gmb",
    name: "Preparar publicaciÃ³n GMB",
    description: "Prepara post para Google My Business (requiere GMB API key)",
    category: "Entregables",
    trigger: { type: "manual", value: "" },
    allowedTools: ["ask_user", "computer_command", "save_artifact", "prepare_email"],
    skillId: "gmb-post-prepare",
    steps: [
      { id: "contenido", title: "Contenido", tool: "ask_user", capabilityId: "ask_user", required: true,
        prompt: "Pega el texto y describe la foto para la publicaciÃ³n" },
      { id: "paquete", title: "Preparar paquete", tool: "computer_command", capabilityId: "computer_command", required: true,
        params: { command: "python3 /workspace/skills/gmb-post-prepare/main.py --text '{{contenido}}'",
          operationId: "gmb-prep-{{input.client}}", cwd: "/workspace" } },
      { id: "report", title: "Guardar paquete", tool: "save_artifact", capabilityId: "save_artifact", required: true,
        params: { kind: "report", title: "PublicaciÃ³n GMB lista",
          summary: "Paquete listo para publicar (revisar GMB_API_KEY)",
          data: { paquete: "{{paquete}}" } } },
      { id: "notif", title: "Notificar", tool: "prepare_email", capabilityId: "prepare_email", required: false,
        params: { to: ["tu-email@ejemplo.com"], subject: "GMB listo",
          body: "Paquete de publicaciÃ³n preparado." } },
    ],
    active: true,
  },
  {
    id: "publicar-social",
    name: "Preparar post para redes",
    description: "Genera 3 variantes (LinkedIn, IG, Facebook) del mismo mensaje",
    category: "Entregables",
    trigger: { type: "manual", value: "" },
    allowedTools: ["ask_user", "computer_command", "save_artifact"],
    skillId: "social-post-prepare",
    steps: [
      { id: "brief", title: "Brief", tool: "ask_user", capabilityId: "ask_user", required: true,
        prompt: "CuÃ©ntame la idea del post (producto, evento, novedad)" },
      { id: "variantes", title: "Generar variantes", tool: "computer_command", capabilityId: "computer_command", required: true,
        params: { command: "python3 /workspace/skills/social-post-prepare/main.py --brief '{{brief}}'",
          operationId: "social-prep-{{input.client}}", cwd: "/workspace" } },
      { id: "report", title: "Guardar variantes", tool: "save_artifact", capabilityId: "save_artifact", required: true,
        params: { kind: "report", title: "Variantes de post",
          summary: "3 versiones listas para pegar", data: { variantes: "{{variantes}}" } } },
    ],
    active: true,
  },
  {
    id: "responder-whatsapp",
    name: "Preparar respuesta WhatsApp",
    description: "Clasifica el mensaje y prepara respuesta (requiere Evolution API key)",
    category: "AtenciÃ³n cliente",
    trigger: { type: "api", value: "" },
    allowedTools: ["ask_user", "computer_command", "save_artifact"],
    skillId: "whatsapp-reply-prepare",
    steps: [
      { id: "mensaje", title: "Mensaje recibido", tool: "ask_user", capabilityId: "ask_user", required: true,
        prompt: "Pega el mensaje del cliente" },
      { id: "respuesta", title: "Preparar respuesta", tool: "computer_command", capabilityId: "computer_command", required: true,
        params: { command: "python3 /workspace/skills/whatsapp-reply-prepare/main.py --message '{{mensaje}}'",
          operationId: "wa-reply-{{input.conversationId}}", cwd: "/workspace" } },
      { id: "report", title: "Guardar borrador", tool: "save_artifact", capabilityId: "save_artifact", required: true,
        params: { kind: "report", title: "Borrador WhatsApp", summary: "Respuesta lista",
          data: { respuesta: "{{respuesta}}" } } },
    ],
    active: true,
  },
  {
    id: "propuesta-comercial",
    name: "Generar propuesta comercial",
    description: "Propuesta PDF de 3 paquetes para un lead cualificado",
    category: "Ventas",
    trigger: { type: "manual", value: "" },
    allowedTools: ["ask_user", "computer_command", "save_artifact", "prepare_email"],
    skillId: "propuesta",
    steps: [
      { id: "alcance", title: "Alcance y precios", tool: "ask_user", capabilityId: "ask_user", required: true,
        prompt: "Describe los 3 paquetes y sus precios" },
      { id: "propuesta", title: "Generar PDF", tool: "computer_command", capabilityId: "computer_command", required: true,
        params: { command: "python3 /workspace/skills/propuesta/main.py --client '{{input.client}}' --scope '{{alcance}}'",
          operationId: "prop-{{input.client}}", cwd: "/workspace" } },
      { id: "report", title: "Guardar propuesta", tool: "save_artifact", capabilityId: "save_artifact", required: true,
        params: { kind: "report", title: "Propuesta {{input.client}}", summary: "Propuesta comercial",
          data: { pdf: "{{propuesta}}" } } },
      { id: "send", title: "Enviar propuesta", tool: "prepare_email", capabilityId: "prepare_email", required: true,
        params: { to: ["{{input.email}}"], subject: "Propuesta para {{input.client}}",
          body: "Adjunto la propuesta." } },
    ],
    active: true,
  },
];

// 1) Session
const sessionRes = await fetch(`${base}/api/session`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ accessKey }),
});
if (!sessionRes.ok) {
  console.error(`Login failed: ${sessionRes.status} ${await sessionRes.text()}`);
  process.exit(1);
}
const { token } = (await sessionRes.json()) as { token: string };
const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };

// 2) Existing SOPs
const existingRes = await fetch(`${base}/api/sops`, { headers });
if (!existingRes.ok) {
  console.error(`GET /api/sops failed: ${existingRes.status}`);
  process.exit(1);
}
const existing = (await existingRes.json()) as Array<{ id: string }>;
const existingIds = new Set(existing.map((s) => s.id));

// 3) POST missing
let created = 0;
let skipped = 0;
for (const sop of sops) {
  if (existingIds.has(sop.id)) {
    console.log(`skip   ${sop.id} (already exists)`);
    skipped++;
    continue;
  }
  const res = await fetch(`${base}/api/sops`, {
    method: "POST",
    headers,
    body: JSON.stringify(sop),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`FAIL   ${sop.id}: ${res.status} ${body}`);
    continue;
  }
  console.log(`create ${sop.id}`);
  created++;
}

console.log(`\n${created} created, ${skipped} skipped, ${sops.length} total`);