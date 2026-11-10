// DEMO_FIXTURES_V1 - datos sinteticos del tenant "Interfaz".
//
// Todo es inventado y todo se puede mutar en memoria: la UI se prueba igual
// que contra la API real, pero sin backend. Las fechas se calculan al cargar
// para que los "hace X min" se vean vivos.
import type { AgentRole } from "../api/agents";
import type { AuthUser } from "../api/auth";
import type { Project, ProjectArtifact, ProjectMemory } from "../api/projects";
import type { RagHit, RagSource } from "../api/rag";
import type { ThreadWithMessages } from "../api/threads";
import type { WhatsAppConnection, WhatsAppDraft, WhatsAppInboxMessage } from "../api/whatsapp";
import type { WorkspaceDetail, WorkspaceListEntry } from "../api/workspaces";
import type { FileEntry, MemoryEntry } from "../hooks/useWorkspaceData";
import type { ActionProposal, AgentTask, ChatMessage } from "../types/api";

const NOW = Date.now();
const iso = (minutesAgo: number) => new Date(NOW - minutesAgo * 60_000).toISOString();
const later = (minutes: number) => new Date(NOW + minutes * 60_000).toISOString();
const day = (daysAgo: number) => new Date(NOW - daysAgo * 86_400_000).toISOString();

export interface DemoMemory extends MemoryEntry {
  category: string;
  tags: string[];
}

export interface DemoNotification {
  id: string;
  taskId?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface LeadRow {
  id: string;
  ref?: string;
  name?: string;
  domain?: string;
  status?: string;
  updatedAt?: string;
}

export interface ConnectionRow {
  id?: string;
  provider?: string;
  account?: string;
  status?: string;
}

interface DemoRagChunk {
  id: string;
  sourceId: string;
  sourceName: string;
  chunkIndex: number;
  text: string;
}

export interface DemoStore {
  user: AuthUser;
  users: AuthUser[];
  threads: ThreadWithMessages[];
  tasks: AgentTask[];
  memories: DemoMemory[];
  files: FileEntry[];
  notifications: DemoNotification[];
  agents: AgentRole[];
  projects: Project[];
  projectMemories: Record<string, ProjectMemory[]>;
  projectArtifacts: Record<string, ProjectArtifact[]>;
  drafts: WhatsAppDraft[];
  inbox: WhatsAppInboxMessage[];
  leads: LeadRow[];
  actions: ActionProposal[];
  connections: ConnectionRow[];
  ragSources: RagSource[];
  ragChunks: DemoRagChunk[];
  workspaces: WorkspaceListEntry[];
}

/* ------------------------------------------------------------------ equipo */

export const demoUser: AuthUser = {
  id: "u-ana",
  email: "ana@interfaz.studio",
  name: "Ana Ferrer",
  role: "admin",
  active: true,
  setup: { sopIds: ["sop-presupuestos", "sop-onboarding"], allowedTools: ["mail", "drive"], greeting: "Hola Ana" },
  createdAt: "2025-02-11T09:00:00.000Z",
};

const users: AuthUser[] = [
  demoUser,
  {
    id: "u-diego",
    email: "diego@interfaz.studio",
    name: "Diego Salas",
    role: "user",
    active: true,
    setup: { sopIds: ["sop-presupuestos"], allowedTools: ["mail"], greeting: "" },
    createdAt: "2025-04-02T09:00:00.000Z",
  },
  {
    id: "u-lucia",
    email: "lucia@interfaz.studio",
    name: "Lucía Prats",
    role: "user",
    active: true,
    setup: { sopIds: ["sop-diseno"], allowedTools: ["drive", "figma"], greeting: "Hola Lucía" },
    createdAt: "2025-06-19T09:00:00.000Z",
  },
  {
    id: "u-marc",
    email: "marc@interfaz.studio",
    name: "Marc Oller",
    role: "user",
    active: false,
    setup: { sopIds: [], allowedTools: [], greeting: "" },
    createdAt: "2024-11-05T09:00:00.000Z",
  },
];

/* ------------------------------------------------------------------ agentes */

const agents: AgentRole[] = [
  {
    id: "agent-marta",
    name: "Marta",
    tone: "warm",
    avatar: "sand",
    greeting: "Hola, soy Marta. Reviso las consultas y dejo preparada la respuesta.",
    roi: "Resuelve el 78% de consultas de primer nivel sin intervención.",
    objetivo:
      "Atender las consultas de clientes con tono cercano, clasificarlas y preparar respuestas revisables.",
    sops: [
      "Clasificar la consulta por cliente, urgencia y tipo.",
      "Buscar en la documentación del proyecto antes de responder.",
      "Dejar el borrador en revisión: nunca enviar sin aprobación.",
    ],
    active: true,
    memories: [
      { kind: "identidad", text: "Se llama Marta y representa a Interfaz Studio." },
      { kind: "preferencias", text: "Tutea, frases cortas y sin emojis." },
      { kind: "dominio", text: "Los presupuestos por debajo de 5.000 € no requieren doble firma." },
    ],
    createdAt: "2026-03-04T10:12:00.000Z",
  },
  {
    id: "agent-bruno",
    name: "Bruno",
    tone: "concise",
    avatar: "sky",
    greeting: "Soy Bruno. Preparo propuestas y seguimiento comercial.",
    roi: "Reduce a la mitad el tiempo de preparación de propuestas.",
    objetivo: "Cualificar oportunidades entrantes y preparar propuestas comerciales a partir del histórico.",
    sops: [
      "Revisar la ficha del cliente antes de escribir.",
      "Usar la plantilla de propuesta vigente.",
      "Marcar el importe y la fecha de validez en cada borrador.",
    ],
    active: true,
    memories: [
      { kind: "dominio", text: "La propuesta tipo tiene tres bloques: alcance, equipo y calendario." },
      { kind: "historial", text: "Estudio Lumen pidió descuento por pago trimestral en la última propuesta." },
    ],
    createdAt: "2026-03-21T08:30:00.000Z",
  },
  {
    id: "agent-nora",
    name: "Nora",
    tone: "thoughtful",
    avatar: "lilac",
    greeting: "Soy Nora. Cuido la coherencia de la marca en cada entrega.",
    roi: "Revisa el 100% de las entregas contra la guía de marca v2.",
    objetivo: "Revisar entregas de diseño y contenido contra la guía de marca y los tokens v2.",
    sops: [
      "Comprobar tipografía, radios y espaciados contra la guía.",
      "Señalar desviaciones con la referencia exacta.",
      "No reescribir contenido sin pedir aprobación.",
    ],
    active: true,
    memories: [
      { kind: "dominio", text: "Los radios de la marca son 10, 16 y 24 px." },
      { kind: "identidad", text: "Nunca usa la palabra 'moderno' en las revisiones." },
    ],
    createdAt: "2026-04-08T12:00:00.000Z",
  },
  {
    id: "agent-iker",
    name: "Iker",
    tone: "concise",
    avatar: "sky",
    greeting: "Soy Iker. Ordeno la operación del día.",
    roi: "Mantiene la cola de trabajo sin huecos ni duplicados.",
    objetivo: "Asignar trabajo entrante, vigilar vencimientos y avisar de bloqueos.",
    sops: ["Cada tarea entra con responsable y fecha.", "Avisar 24 h antes de un vencimiento."],
    active: false,
    memories: [{ kind: "dominio", text: "El equipo de diseño no trabaja los viernes por la tarde." }],
    createdAt: "2026-05-02T09:45:00.000Z",
  },
];

/* ------------------------------------------------------------------- tareas */

const task = (input: Omit<AgentTask, "prompt" | "evidence" | "input" | "attempts" | "artifactIds"> & {
  prompt?: string;
  evidence?: AgentTask["evidence"];
  input?: Record<string, unknown>;
  attempts?: number;
  artifactIds?: string[];
}): AgentTask => ({
  ...input,
  prompt: input.prompt ?? input.title,
  evidence: input.evidence ?? [],
  input: input.input ?? {},
  attempts: input.attempts ?? 1,
  artifactIds: input.artifactIds ?? [],
});

const tasks: AgentTask[] = [
  task({
    id: "task-presupuesto",
    title: "Aprobar presupuesto · Estudio Lumen · 8.400 €",
    kind: "finance",
    status: "waiting_approval",
    assignedTo: "agent-bruno",
    plan: [
      { id: "p1", title: "Leer el brief y el histórico del cliente", status: "succeeded" },
      { id: "p2", title: "Calcular alcance y horas por perfil", status: "succeeded" },
      { id: "p3", title: "Preparar el borrador de propuesta", status: "succeeded" },
      { id: "p4", title: "Enviar tras tu aprobación", status: "waiting" },
    ],
    evidence: [
      { id: "e1", kind: "mail", title: "Brief de Estudio Lumen", excerpt: "Necesitamos rediseñar la web y el checkout antes de noviembre." },
      { id: "e2", kind: "file", title: "propuesta-lumen-v1.pdf", excerpt: "Propuesta anterior por 6.200 €, aceptada en marzo." },
    ],
    state: { ownerId: "u-diego", escalatedTo: "u-ana" },
    createdAt: iso(95),
    updatedAt: iso(12),
  }),
  task({
    id: "task-landing",
    title: "Publicar la landing de otoño",
    kind: "agent",
    status: "waiting_input",
    assignedTo: "agent-nora",
    question: "¿Confirmas que las fotos de Casa Botànica ya tienen cesión de imagen?",
    plan: [
      { id: "p1", title: "Montar la página con los tokens v2", status: "succeeded" },
      { id: "p2", title: "Revisar textos y enlaces", status: "succeeded" },
      { id: "p3", title: "Publicar en producción", status: "waiting" },
    ],
    state: { ownerId: "u-lucia" },
    createdAt: iso(180),
    updatedAt: iso(25),
  }),
  task({
    id: "task-accesibilidad",
    title: "Auditar la accesibilidad de la app de reservas",
    kind: "monitor",
    status: "running",
    assignedTo: "agent-nora",
    plan: [
      { id: "p1", title: "Recorrer las 12 pantallas principales", status: "succeeded" },
      { id: "p2", title: "Medir contraste y foco", status: "running" },
      { id: "p3", title: "Redactar el informe", status: "pending" },
    ],
    state: { ownerId: "u-lucia" },
    createdAt: iso(60),
    updatedAt: iso(3),
  }),
  task({
    id: "task-tokens",
    title: "Migrar los componentes al sistema de tokens v2",
    kind: "agent",
    status: "running",
    assignedTo: "agent-nora",
    plan: [
      { id: "p1", title: "Inventariar componentes heredados", status: "succeeded" },
      { id: "p2", title: "Sustituir colores y espaciados", status: "running" },
      { id: "p3", title: "Validar en claro y oscuro", status: "pending" },
    ],
    state: { ownerId: "u-lucia" },
    createdAt: iso(210),
    updatedAt: iso(8),
  }),
  task({
    id: "task-casa-botanica",
    title: "Preparar la propuesta para Casa Botànica",
    kind: "agent",
    status: "queued",
    assignedTo: "agent-bruno",
    plan: [
      { id: "p1", title: "Leer la ficha del lead", status: "pending" },
      { id: "p2", title: "Elegir casos de referencia", status: "pending" },
      { id: "p3", title: "Redactar la propuesta", status: "pending" },
    ],
    state: { ownerId: "u-diego" },
    createdAt: iso(40),
    updatedAt: iso(40),
  }),
  task({
    id: "task-contrato",
    title: "Revisar el contrato de mantenimiento de Lumen",
    kind: "document",
    status: "queued",
    assignedTo: "agent-marta",
    plan: [
      { id: "p1", title: "Comparar con el contrato vigente", status: "pending" },
      { id: "p2", title: "Señalar cláusulas de renovación", status: "pending" },
    ],
    state: { ownerId: "u-ana" },
    createdAt: iso(300),
    updatedAt: iso(120),
  }),
  task({
    id: "task-informe-soporte",
    title: "Enviar el informe semanal de soporte",
    kind: "agent",
    status: "scheduled",
    assignedTo: "agent-marta",
    nextRunAt: later(720),
    plan: [
      { id: "p1", title: "Recoger los tickets de la semana", status: "pending" },
      { id: "p2", title: "Resumir incidencias y tiempos", status: "pending" },
      { id: "p3", title: "Enviar al equipo", status: "pending" },
    ],
    state: { ownerId: "u-ana" },
    createdAt: iso(1440),
    updatedAt: iso(600),
  }),
  task({
    id: "task-checkout",
    title: "Rediseñar el checkout de la tienda",
    kind: "plan",
    status: "paused",
    assignedTo: "agent-nora",
    plan: [
      { id: "p1", title: "Mapear el flujo actual", status: "succeeded" },
      { id: "p2", title: "Prototipo de tres pasos", status: "waiting" },
    ],
    state: { ownerId: "u-lucia" },
    createdAt: iso(2880),
    updatedAt: iso(300),
  }),
  task({
    id: "task-guia",
    title: "Publicar la guía de estilo v2",
    kind: "document",
    status: "succeeded",
    assignedTo: "agent-nora",
    result: "Guía publicada en Notion y enlazada desde el portal interno.",
    plan: [
      { id: "p1", title: "Consolidar tokens", status: "succeeded" },
      { id: "p2", title: "Escribir ejemplos de uso", status: "succeeded" },
      { id: "p3", title: "Publicar y avisar al equipo", status: "succeeded" },
    ],
    state: { ownerId: "u-lucia" },
    createdAt: iso(4320),
    updatedAt: iso(1500),
  }),
  task({
    id: "task-nps",
    title: "Analizar la encuesta NPS del tercer trimestre",
    kind: "agent",
    status: "succeeded",
    assignedTo: "agent-marta",
    result: "NPS 62 · 14 comentarios agrupados en tres temas.",
    plan: [
      { id: "p1", title: "Limpiar respuestas", status: "succeeded" },
      { id: "p2", title: "Agrupar comentarios", status: "succeeded" },
    ],
    state: { ownerId: "u-ana" },
    createdAt: iso(7200),
    updatedAt: iso(5800),
  }),
  task({
    id: "task-shopify",
    title: "Sincronizar el catálogo con Shopify",
    kind: "monitor",
    status: "failed",
    assignedTo: "agent-iker",
    error: "El token de Shopify ha caducado (401). Vuelve a conectar la tienda y reintenta la tarea.",
    plan: [
      { id: "p1", title: "Leer productos del ERP", status: "succeeded" },
      { id: "p2", title: "Empujar cambios a Shopify", status: "failed" },
    ],
    state: { ownerId: "u-ana" },
    createdAt: iso(600),
    updatedAt: iso(35),
  }),
];

/* ---------------------------------------------------------------- memorias */

const memories: DemoMemory[] = [
  {
    id: "mem-1",
    text: "Interfaz Studio trabaja con tres clientes activos: Estudio Lumen, Casa Botànica y Talleres Norte.",
    source: "You",
    category: "empresa",
    tags: ["clientes", "cartera"],
    createdAt: day(40),
  },
  {
    id: "mem-2",
    text: "Estudio Lumen paga a 30 días y siempre pide la factura antes del día 25.",
    source: "Chat",
    category: "cliente",
    tags: ["lumen", "facturación"],
    createdAt: day(21),
  },
  {
    id: "mem-3",
    text: "Los presupuestos por encima de 5.000 € necesitan la aprobación de Ana antes de salir.",
    source: "You",
    category: "proceso",
    tags: ["presupuestos", "aprobación"],
    createdAt: day(60),
  },
  {
    id: "mem-4",
    text: "En las propuestas nunca se usa la palabra 'moderno'; se describe el resultado concreto.",
    source: "Chat",
    category: "preferencia",
    tags: ["tono", "propuestas"],
    createdAt: day(14),
  },
  {
    id: "mem-5",
    text: "La guía de marca v2 vive en Notion y es la única fuente válida de tokens.",
    source: "Notion",
    category: "producto",
    tags: ["marca", "tokens"],
    createdAt: day(32),
  },
  {
    id: "mem-6",
    text: "El equipo de diseño no trabaja los viernes por la tarde.",
    source: "You",
    category: "rrhh",
    tags: ["equipo", "calendario"],
    createdAt: day(75),
  },
  {
    id: "mem-7",
    text: "Casa Botànica prefiere recibir las propuestas en PDF y con un resumen de una página.",
    source: "Chat",
    category: "cliente",
    tags: ["botànica", "propuestas"],
    createdAt: day(9),
  },
  {
    id: "mem-8",
    text: "Las reuniones de seguimiento son los martes a las 10:00 y duran 30 minutos.",
    source: "Calendar",
    category: "proceso",
    tags: ["reuniones"],
    createdAt: day(5),
  },
];

/* ---------------------------------------------------------------- documentos */

const briefCheckout = [
  "# Brief · Checkout de Casa Botànica",
  "",
  "## Objetivo",
  "Reducir el abandono en el paso de pago por debajo del 35%.",
  "",
  "## Restricciones",
  "- Mantener la pasarela actual.",
  "- Tres pasos como máximo.",
  "- Validar en móvil a 390 px.",
].join("\n");

const files: FileEntry[] = [
  {
    id: "file-guia",
    name: "guia-de-marca-v2.pdf",
    mimeType: "application/pdf",
    size: 2_412_000,
    pageCount: 24,
    createdAt: day(31),
    source: "Notion",
  },
  {
    id: "file-brief-checkout",
    name: "brief-checkout.md",
    mimeType: "text/markdown",
    size: 18_420,
    createdAt: day(6),
    source: "Chat",
    url: `data:text/markdown;charset=utf-8,${encodeURIComponent(briefCheckout)}`,
  },
  {
    id: "file-contrato",
    name: "contrato-mantenimiento-lumen.pdf",
    mimeType: "application/pdf",
    size: 184_300,
    pageCount: 9,
    createdAt: day(12),
    source: "Drive",
  },
  {
    id: "file-nps",
    name: "informe-nps-q3.pdf",
    mimeType: "application/pdf",
    size: 640_100,
    pageCount: 12,
    createdAt: day(18),
    source: "Chat",
  },
  {
    id: "file-checklist",
    name: "checklist-lanzamiento.md",
    mimeType: "text/markdown",
    size: 9_600,
    createdAt: day(3),
    source: "You",
  },
];

/* ------------------------------------------------------------ notificaciones */

const notifications: DemoNotification[] = [
  {
    id: "notif-1",
    taskId: "task-presupuesto",
    title: "Presupuesto listo para revisar",
    body: "Estudio Lumen · 8.400 € · supera el umbral de 5.000 €.",
    createdAt: iso(12),
    read: false,
  },
  {
    id: "notif-2",
    taskId: "task-landing",
    title: "Falta un dato para publicar",
    body: "La landing de otoño espera la cesión de imagen de las fotos.",
    createdAt: iso(25),
    read: false,
  },
  {
    id: "notif-3",
    taskId: "task-shopify",
    title: "La sincronización con Shopify falló",
    body: "El token ha caducado. Revisa la conexión y reintenta.",
    createdAt: iso(35),
    read: false,
  },
  {
    id: "notif-4",
    taskId: "task-guia",
    title: "Guía de estilo v2 publicada",
    body: "Ya está disponible en Notion para todo el equipo.",
    createdAt: iso(1500),
    read: true,
  },
];

/* ---------------------------------------------------------------- proyectos */

const projects: Project[] = [
  {
    id: "proj-checkout",
    name: "Rediseño del checkout",
    description: "Simplificar el pago de la tienda de Casa Botànica sin cambiar de pasarela.",
    status: "active",
    tags: ["ecommerce", "ux"],
    blocks: [
      { id: "b1", type: "heading", text: "Objetivo" },
      { id: "b2", type: "text", text: "Bajar el abandono en el pago del 52% al 35% en tres meses." },
      { id: "b3", type: "heading", text: "Plan" },
      { id: "b4", type: "checklist", text: "Mapear el flujo actual", checked: true },
      { id: "b5", type: "checklist", text: "Prototipo de tres pasos", checked: false },
      { id: "b6", type: "checklist", text: "Test con diez personas", checked: false },
      { id: "b7", type: "timeline", text: "15 oct — Entrega del prototipo" },
      { id: "b8", type: "timeline", text: "5 nov — Test de usabilidad" },
      { id: "b9", type: "note", text: "No se puede tocar la integración con el banco." },
    ],
    linkedMemoryIds: ["mem-7", "mem-2"],
    linkedArtifactIds: ["art-1"],
    createdAt: day(45),
    updatedAt: iso(240),
  },
  {
    id: "proj-otono",
    name: "Lanzamiento otoño 2026",
    description: "Campaña de captación y landing de temporada para Casa Botànica.",
    status: "active",
    tags: ["marketing", "landing"],
    blocks: [
      { id: "b1", type: "heading", text: "Piezas" },
      { id: "b2", type: "checklist", text: "Landing de otoño", checked: true },
      { id: "b3", type: "checklist", text: "Newsletter de lanzamiento", checked: false },
      { id: "b4", type: "text", text: "La cesión de imagen de las fotos sigue pendiente." },
    ],
    linkedMemoryIds: ["mem-5"],
    linkedArtifactIds: [],
    createdAt: day(28),
    updatedAt: iso(60),
  },
  {
    id: "proj-soporte",
    name: "Soporte y mantenimiento",
    description: "Acuerdos de mantenimiento y soporte de primer nivel.",
    status: "paused",
    tags: ["soporte", "sla"],
    blocks: [
      { id: "b1", type: "heading", text: "SLA" },
      { id: "b2", type: "text", text: "Respuesta inicial en 4 horas laborables." },
      { id: "b3", type: "note", text: "Pausado hasta renovar el contrato de Lumen." },
    ],
    linkedMemoryIds: ["mem-1"],
    linkedArtifactIds: [],
    createdAt: day(90),
    updatedAt: day(4),
  },
];

const projectMemories: Record<string, ProjectMemory[]> = {
  "proj-checkout": [
    {
      id: "mem-7",
      text: "Casa Botànica prefiere recibir las propuestas en PDF y con un resumen de una página.",
      source: "Chat",
      category: "cliente",
      tags: ["botànica", "propuestas"],
      createdAt: day(9),
    },
    {
      id: "mem-2",
      text: "Estudio Lumen paga a 30 días y siempre pide la factura antes del día 25.",
      source: "Chat",
      category: "cliente",
      tags: ["lumen", "facturación"],
      createdAt: day(21),
    },
  ],
};

const projectArtifacts: Record<string, ProjectArtifact[]> = {
  "proj-checkout": [
    {
      id: "art-1",
      taskId: "task-checkout",
      kind: "plan",
      title: "Plan de tres pasos para el checkout",
      summary: "Carrito, entrega y pago en una sola columna con resumen siempre visible.",
      data: { steps: 3, validatedAt: "390px" },
      createdAt: iso(260),
    },
  ],
};

/* ----------------------------------------------------------------- whatsapp */

export const whatsappConnection: WhatsAppConnection = {
  provider: "meta",
  instance: "interfaz-demo",
  generation: "gen-3",
  enabled: true,
  outboundEnabled: true,
  allowedRecipients: ["34611222333", "34644555666"],
};

const drafts: WhatsAppDraft[] = [
  {
    id: "wa-1",
    to: "34611222333",
    text: "Hola Marta, te paso el presupuesto del rediseño: 8.400 € con entrega el 15 de noviembre. ¿Lo revisamos el jueves?",
    status: "awaiting_review",
    revision: "rev-1",
    createdAt: iso(14),
    expiresAt: later(26),
    needsReprepare: false,
    requiresReconciliation: false,
    channel: { provider: "meta", accountId: "interfaz-main" },
  },
  {
    id: "wa-2",
    to: "34644555666",
    text: "Hola Jordi, confirmamos la reunión del martes a las 10:00. Te envío el enlace un día antes.",
    status: "outcome_unknown",
    revision: "rev-2",
    createdAt: iso(150),
    expiresAt: iso(120),
    needsReprepare: false,
    requiresReconciliation: true,
    channel: { provider: "meta", accountId: "interfaz-main" },
  },
  {
    id: "wa-3",
    to: "34611222333",
    text: "Gracias por la reunión de hoy. Te dejo el resumen con los tres siguientes pasos.",
    status: "accepted",
    revision: null,
    createdAt: iso(280),
    needsReprepare: false,
    requiresReconciliation: false,
    providerId: "wamid.HBgM4WFi",
    channel: { provider: "meta", accountId: "interfaz-main" },
  },
];

const inbox: WhatsAppInboxMessage[] = [
  {
    id: "in-1",
    from: "34611222333",
    text: "Hola, ¿podemos mover la reunión del jueves al viernes por la mañana?",
    receivedAt: iso(38),
    provider: "meta",
    status: "received",
    canReply: true,
  },
  {
    id: "in-2",
    from: "34644555666",
    text: "Gracias por el presupuesto, lo revisamos esta semana y os decimos algo.",
    receivedAt: iso(190),
    provider: "meta",
    status: "received",
    canReply: true,
  },
];

/* ------------------------------------------------------- operaciones y leads */

const actions: ActionProposal[] = [
  {
    id: "act-1",
    taskId: "task-presupuesto",
    title: "Enviar presupuesto a Estudio Lumen",
    kind: "email.send",
    account: "ana@interfaz.studio",
    data: {
      to: "marta@estudiolumen.cat",
      subject: "Propuesta de rediseño · Estudio Lumen",
      importe: "8.400 €",
      validez: "30 días",
    },
    status: "awaiting_review",
    hash: "9f3c1a77b2e4",
    createdAt: iso(12),
    expiresAt: later(48),
  },
  {
    id: "act-2",
    taskId: "task-guia",
    title: "Publicar nota de versión 2.4",
    kind: "content.publish",
    data: { canal: "Notion", seccion: "Novedades" },
    status: "scheduled",
    executeAt: later(4),
    hash: "4ab77e10c9f2",
    createdAt: iso(30),
    expiresAt: later(60),
  },
  {
    id: "act-3",
    taskId: "task-casa-botanica",
    title: "Crear la carpeta del proyecto Casa Botànica",
    kind: "drive.createFolder",
    data: { carpeta: "Clientes/Casa Botànica" },
    status: "succeeded",
    result: "Carpeta creada en Drive",
    hash: "1c9d55aa03b7",
    createdAt: iso(220),
    expiresAt: iso(180),
  },
  {
    id: "act-4",
    taskId: "task-shopify",
    title: "Sincronizar catálogo con Shopify",
    kind: "shopify.sync",
    data: { productos: 148 },
    status: "failed",
    error: "Token caducado (401)",
    hash: "77be0f4d1c88",
    createdAt: iso(35),
    expiresAt: iso(5),
  },
  {
    id: "act-5",
    taskId: "task-contrato",
    title: "Enviar recordatorio de la factura 2026-184",
    kind: "email.send",
    data: { to: "admin@estudiolumen.cat", recordatorio: 2 },
    status: "outcome_unknown",
    error: "Sin confirmación del proveedor",
    hash: "b3d9182ffa41",
    createdAt: iso(95),
    expiresAt: iso(60),
  },
];

const connections: ConnectionRow[] = [
  { id: "conn-google", provider: "Google Workspace", account: "ana@interfaz.studio", status: "conectado" },
  { id: "conn-notion", provider: "Notion", account: "Interfaz Studio", status: "conectado" },
  { id: "conn-shopify", provider: "Shopify", account: "Casa Botànica", status: "revisar" },
];

const leads: LeadRow[] = [
  {
    id: "lead-1",
    ref: "casa-botanica",
    name: "Casa Botànica",
    domain: "casabotanica.cat",
    status: "Propuesta en preparación",
    updatedAt: iso(40),
  },
  {
    id: "lead-2",
    ref: "estudio-lumen",
    name: "Estudio Lumen",
    domain: "estudiolumen.cat",
    status: "Presupuesto enviado",
    updatedAt: iso(12),
  },
  {
    id: "lead-3",
    ref: "talleres-norte",
    name: "Talleres Norte",
    domain: "talleresnorte.es",
    status: "Contacto inicial",
    updatedAt: day(2),
  },
  {
    id: "lead-4",
    ref: "verde-oficina",
    name: "Verde Oficina",
    domain: "verdeoficina.com",
    status: "En espera",
    updatedAt: day(6),
  },
];

/* --------------------------------------------------------------------- RAG */

const ragSources: RagSource[] = [
  { sourceId: "file-guia", sourceName: "guia-de-marca-v2.pdf", chunks: 64, firstAt: day(31) },
  { sourceId: "file-brief-checkout", sourceName: "brief-checkout.md", chunks: 12, firstAt: day(6) },
  { sourceId: "file-contrato", sourceName: "contrato-mantenimiento-lumen.pdf", chunks: 28, firstAt: day(12) },
  { sourceId: "file-nps", sourceName: "informe-nps-q3.pdf", chunks: 44, firstAt: day(18) },
  { sourceId: "file-checklist", sourceName: "checklist-lanzamiento.md", chunks: 8, firstAt: day(3) },
];

const ragChunks: DemoRagChunk[] = [
  {
    id: "chunk-1",
    sourceId: "file-guia",
    sourceName: "guia-de-marca-v2.pdf",
    chunkIndex: 4,
    text: "Los radios de la marca son 10, 16 y 24 px. El botón principal usa 10 px y las tarjetas 16 px.",
  },
  {
    id: "chunk-2",
    sourceId: "file-guia",
    sourceName: "guia-de-marca-v2.pdf",
    chunkIndex: 9,
    text: "La tipografía es una serif editorial para títulos y una sans neutra para interfaz. Nunca se mezclan en la misma línea.",
  },
  {
    id: "chunk-3",
    sourceId: "file-brief-checkout",
    sourceName: "brief-checkout.md",
    chunkIndex: 1,
    text: "Objetivo del checkout: reducir el abandono en el paso de pago por debajo del 35%, manteniendo la pasarela actual.",
  },
  {
    id: "chunk-4",
    sourceId: "file-brief-checkout",
    sourceName: "brief-checkout.md",
    chunkIndex: 3,
    text: "El flujo debe tener tres pasos como máximo y validarse en móvil a 390 px.",
  },
  {
    id: "chunk-5",
    sourceId: "file-contrato",
    sourceName: "contrato-mantenimiento-lumen.pdf",
    chunkIndex: 6,
    text: "El contrato se renueva automáticamente por periodos de doce meses salvo aviso con 30 días de antelación.",
  },
  {
    id: "chunk-6",
    sourceId: "file-nps",
    sourceName: "informe-nps-q3.pdf",
    chunkIndex: 2,
    text: "El NPS del tercer trimestre es 62. Los comentarios se agrupan en rapidez, claridad de la propuesta y soporte.",
  },
  {
    id: "chunk-7",
    sourceId: "file-checklist",
    sourceName: "checklist-lanzamiento.md",
    chunkIndex: 0,
    text: "Antes de publicar la landing: revisar enlaces, textos legales, cesión de imagen y medición de conversión.",
  },
  {
    id: "chunk-8",
    sourceId: "file-guia",
    sourceName: "guia-de-marca-v2.pdf",
    chunkIndex: 12,
    text: "El color principal es violeta 5E4FF1. Se usa solo en acciones y estados activos, nunca en superficies grandes.",
  },
];

/* -------------------------------------------------------------- workspaces */

const workspaces: WorkspaceListEntry[] = [
  { id: "interfaz-clientes", slug: "interfaz-clientes", family: "Clientes", title: "Clientes", reference: "cartera-01" },
  { id: "interfaz-proyectos", slug: "interfaz-proyectos", family: "Proyectos", title: "Proyectos", reference: "entrega-02" },
  { id: "interfaz-soporte", slug: "interfaz-soporte", family: "Soporte", title: "Soporte", reference: "bandeja-03" },
];

/** Specs validas para runtimeViewSpecSchema; las usan workspaces y el panel. */
export const viewSpecs: Record<string, Record<string, unknown>> = {
  dashboard: {
    kind: "dashboard",
    title: "Resumen de Interfaz Studio",
    kpis: [
      { label: "Clientes activos", value: 3, delta: "+1 este trimestre" },
      { label: "Tareas abiertas", value: 8, delta: "2 esperan tu OK" },
      { label: "Facturación del mes", value: "24.800 €", delta: "+12,4%" },
      { label: "NPS", value: 62, delta: "+4 puntos" },
    ],
  },
  queue: {
    kind: "queue",
    title: "Cola de entregas",
    items: [
      { id: "q1", title: "Prototipo del checkout", subtitle: "Casa Botànica · tres pasos", status: "running", actions: [] },
      { id: "q2", title: "Landing de otoño", subtitle: "Falta cesión de imagen", status: "pending", actions: [] },
      { id: "q3", title: "Guía de estilo v2", subtitle: "Publicada en Notion", status: "done", actions: [] },
      { id: "q4", title: "Informe de accesibilidad", subtitle: "Revisión de contraste", status: "error", actions: [] },
    ],
  },
  inbox: {
    kind: "inbox",
    title: "Bandeja de revisión",
    items: [
      { id: "i1", title: "Presupuesto Estudio Lumen", subtitle: "8.400 € · supera el umbral", priority: "high", actions: [] },
      { id: "i2", title: "Contrato de mantenimiento", subtitle: "Renovación automática", priority: "medium", actions: [] },
      { id: "i3", title: "Nota de versión 2.4", subtitle: "Programada para hoy", priority: "low", actions: [] },
    ],
  },
  board: {
    kind: "board",
    title: "Tablero de proyectos",
    entityType: "project",
    columns: [
      { id: "todo", label: "Por hacer", status: "todo" },
      { id: "doing", label: "En curso", status: "doing" },
      { id: "done", label: "Entregado", status: "done" },
    ],
    cards: [
      { id: "c1", columnId: "todo", title: "Casa Botànica", subtitle: "Propuesta", updatedAt: "Hoy" },
      { id: "c2", columnId: "todo", title: "Verde Oficina", subtitle: "Contacto inicial", updatedAt: "Ayer" },
      { id: "c3", columnId: "doing", title: "Checkout", subtitle: "Prototipo", updatedAt: "Hoy" },
      { id: "c4", columnId: "done", title: "Guía v2", subtitle: "Publicada", updatedAt: "Lunes" },
    ],
  },
  table: {
    kind: "table",
    title: "Cartera de clientes",
    columns: [
      { key: "cliente", label: "Cliente", type: "text", align: "left" },
      { key: "contacto", label: "Contacto", type: "text", align: "left" },
      { key: "estado", label: "Estado", type: "chip", align: "center" },
      { key: "facturacion", label: "Facturación", type: "number", align: "right" },
      { key: "alta", label: "Alta", type: "date", align: "left" },
    ],
    rows: [
      { cliente: "Estudio Lumen", contacto: "Marta Puig", estado: "Activo", facturacion: "12.400 €", alta: "12/03/2024" },
      { cliente: "Casa Botànica", contacto: "Jordi Vidal", estado: "Activo", facturacion: "8.900 €", alta: "04/11/2025" },
      { cliente: "Talleres Norte", contacto: "Nuria Gil", estado: "Revisión", facturacion: "3.500 €", alta: "21/06/2026" },
      { cliente: "Verde Oficina", contacto: "Pau Serra", estado: "En espera", facturacion: "0 €", alta: "17/09/2026" },
    ],
  },
  detail: {
    kind: "detail",
    title: "Estudio Lumen",
    entityId: "client-lumen",
    entityType: "client",
    properties: [
      { key: "nombre", label: "Cliente", value: "Estudio Lumen", provenance: "auto" },
      { key: "contacto", label: "Contacto", value: "Marta Puig · marta@estudiolumen.cat", provenance: "auto" },
      { key: "tarifa", label: "Tarifa", value: "85 €/h", provenance: "tu" },
      { key: "pago", label: "Pago", value: "30 días", provenance: "alta" },
      { key: "estado", label: "Estado", value: "Activo", provenance: "auto" },
      { key: "renovacion", label: "Renovación", value: "Marzo 2027", provenance: "sugerido" },
    ],
    relations: [
      { id: "rel-1", type: "proyectos", targetName: "2 proyectos activos" },
      { id: "rel-2", type: "facturas", targetName: "6 facturas emitidas" },
    ],
  },
  form: {
    kind: "form",
    title: "Nueva ficha de cliente",
    entityType: "client",
    fields: [
      { key: "nombre", label: "Cliente", type: "text", required: true, value: "Casa Botànica", provenance: "auto" },
      { key: "contacto", label: "Persona de contacto", type: "text", required: true, value: "Jordi Vidal", provenance: "auto" },
      { key: "tarifa", label: "Tarifa", type: "select", required: true, options: ["70 €/h", "85 €/h", "Precio cerrado"], value: "85 €/h", provenance: "tu" },
      { key: "alta", label: "Fecha de alta", type: "date", required: true, value: "2025-11-04", provenance: "auto" },
      { key: "notas", label: "Notas internas", type: "textarea", value: "Prefiere propuestas en PDF de una página.", provenance: "tu" },
      { key: "rgpd", label: "Consentimiento RGPD", type: "checkbox", value: true, provenance: "auto" },
    ],
    submitLabel: "Guardar ficha",
  },
};

const viewTitles: Record<string, string> = {
  dashboard: "Resumen",
  queue: "Cola",
  inbox: "Bandeja",
  board: "Tablero",
  table: "Tabla",
  detail: "Detalle",
  form: "Formulario",
};

export const viewOrder = ["dashboard", "queue", "inbox", "board", "table", "detail", "form"];

export function workspaceDetail(workspace: WorkspaceListEntry): WorkspaceDetail {
  return {
    manifest: {
      id: workspace.id,
      slug: workspace.slug,
      family: workspace.family,
      title: workspace.title,
      reference: workspace.reference,
      status: "ready",
      version: 2,
    },
    capabilities: ["views"],
    views: [...viewOrder],
    viewDefinitions: viewOrder.map((kind) => ({
      id: kind,
      intent: kind,
      kind,
      title: viewTitles[kind] ?? kind,
      query: `${workspace.slug}.${kind}`,
      actions: [],
    })),
    commands: [],
    queries: [],
  };
}

/** Envelope completo para el panel contextual y para las vistas de workspace. */
export function makeEnvelope(workspaceId: string, kind: string) {
  const spec = viewSpecs[kind] ?? viewSpecs.dashboard;
  const generatedAt = new Date().toISOString();
  return {
    id: `view-${workspaceId}-${kind}`,
    tenantId: "interfaz",
    workspaceId,
    spec,
    provenance: [{ source: "demo", label: "Datos de ejemplo del tenant Interfaz", asOf: generatedAt }],
    freshness: { generatedAt, sourceAsOf: generatedAt, stale: false },
    permissions: { canView: true, canAct: [] },
    source: { provider: "interfaz", workspaceId },
    generatedAt,
  };
}

/* ------------------------------------------------------------------- store */

const threadMessages: Record<string, ChatMessage[]> = {
  "thread-1": [
    {
      id: "m1",
      role: "user",
      content: "¿Cómo va el rediseño del checkout de Casa Botànica?",
      timestamp: "09:12",
    },
    {
      id: "m2",
      role: "assistant",
      content:
        "Va bien: el flujo de tres pasos está montado y validado a 390 px. Falta el test con diez personas, previsto para el 5 de noviembre. La tarea está en pausa hasta que confirmes la cesión de imagen de las fotos.",
      timestamp: "09:12",
    },
    {
      id: "m3",
      role: "user",
      content: "Pásame el brief en una frase.",
      timestamp: "09:14",
    },
    {
      id: "m4",
      role: "assistant",
      content:
        "Bajar el abandono del pago del 52% al 35% manteniendo la pasarela actual, con tres pasos como máximo.",
      timestamp: "09:14",
    },
  ],
  "thread-2": [
    {
      id: "m1",
      role: "user",
      content: "Prepara el resumen semanal de soporte.",
      timestamp: "Ayer",
    },
    {
      id: "m2",
      role: "assistant",
      content:
        "Listo. La semana cierra con 18 tickets, 3 incidencias abiertas y un tiempo medio de primera respuesta de 42 minutos. Te dejo el envío programado para el lunes a las 09:00.",
      timestamp: "Ayer",
    },
  ],
};

const threads: ThreadWithMessages[] = [
  {
    id: "thread-1",
    title: "Rediseño del checkout",
    createdAt: iso(140),
    updatedAt: iso(14),
    messageCount: threadMessages["thread-1"].length,
    messages: threadMessages["thread-1"],
  },
  {
    id: "thread-2",
    title: "Resumen semanal de soporte",
    createdAt: iso(1500),
    updatedAt: iso(1200),
    messageCount: threadMessages["thread-2"].length,
    messages: threadMessages["thread-2"],
  },
];

export const demoStore: DemoStore = {
  user: demoUser,
  users,
  threads,
  tasks,
  memories,
  files,
  notifications,
  agents,
  projects,
  projectMemories,
  projectArtifacts,
  drafts,
  inbox,
  leads,
  actions,
  connections,
  ragSources,
  ragChunks,
  workspaces,
};

/** Busqueda semantica fingida: coincidencia por palabras del texto indexado. */
export function searchRag(query: string, limit: number): RagHit[] {
  const tokens = query
    .toLowerCase()
    .split(/[^a-záéíóúàèìòùñü0-9]+/i)
    .filter((token) => token.length > 2);
  if (tokens.length === 0) return [];
  return demoStore.ragChunks
    .map((chunk) => {
      const haystack = chunk.text.toLowerCase();
      const matches = tokens.filter((token) => haystack.includes(token)).length;
      return { chunk, matches };
    })
    .filter((entry) => entry.matches > 0)
    .sort((a, b) => b.matches - a.matches)
    .slice(0, limit)
    .map(({ chunk, matches }) => ({
      id: chunk.id,
      sourceId: chunk.sourceId,
      sourceName: chunk.sourceName,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      score: Math.min(0.98, 0.55 + matches * 0.12),
    }));
}

export function demoRagStatus() {
  return {
    configured: true,
    chunks: demoStore.ragSources.reduce((total, source) => total + source.chunks, 0),
    sources: demoStore.ragSources.length,
  };
}

export function nextDemoId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

/** Un archivo subido en el demo aparece en Documentos sin backend. */
export function addDemoFile(input: { name: string; size: number }): FileEntry {
  const entry: FileEntry = {
    id: nextDemoId("file"),
    name: input.name,
    mimeType: input.name.endsWith(".md") ? "text/markdown" : "application/pdf",
    size: input.size,
    pageCount: 1,
    createdAt: new Date().toISOString(),
    source: "Upload",
  };
  demoStore.files.unshift(entry);
  demoStore.ragSources.unshift({
    sourceId: entry.id,
    sourceName: entry.name,
    chunks: 1,
    firstAt: entry.createdAt ?? new Date().toISOString(),
  });
  return entry;
}
