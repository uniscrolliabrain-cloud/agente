// ZENDESK_API_V1

import type { CoWriteDraft, TicketFilter, TicketId, ZendeskTicket } from "./types.ts";
import { initialsOf } from "./format.ts";

const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

interface CustomerInput {
  id: string;
  name: string;
  email: string;
  company: string;
  companyType: "PYME" | "AUTONOMO" | "EMPRESA";
  ltv: number;
  interactions: number;
  customerSince: string;
}

function buildCustomer(input: CustomerInput) {
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    company: input.company,
    companyType: input.companyType,
    ltv: input.ltv,
    interactions: input.interactions,
    customerSince: input.customerSince,
    avatarInitials: initialsOf(input.name),
  };
}

const TICKETS: ZendeskTicket[] = [
  {
    id: "1",
    subject: "Solicitud presupuesto automatizacion ate...",
    preview: "Hola, somos una PYME de 8 empleados saturada por WhatsApp...",
    customer: buildCustomer({ id: "c1", name: "Marta Soler", email: "marta@soluclimpieza.es", company: "Soluciones Limpieza SL", companyType: "PYME", ltv: 4200, interactions: 2, customerSince: "Mar 2023" }),
    status: "new",
    priority: "high",
    category: "Presupuesto",
    tags: ["PYME", "Presupuesto", "Lead IA"],
    createdAt: minutesAgo(30),
    updatedAt: minutesAgo(3),
    unread: true,
    starred: true,
    isLead: true,
    intelligence: {
      summary: "Solicitar presupuesto y demo de agente WhatsApp + Holded",
      intent: "Solicitar presupuesto y demo de agente WhatsApp + Holded",
      urgency: "ALTA",
      urgencyReason: "equipo desbordado 60 msgs/dia",
      nextStep: "Enviar propuesta con 3 planes + agendar demo 30min",
      confidence: 0.94,
      insights: [
        { id: "i1", text: "PYME de 8 empleados saturada por WhatsApp...", tone: "purple" },
        { id: "i2", text: "LTV 4.200 EUR, 2 interacciones previas", tone: "info" },
      ],
    },
  },
  {
    id: "2",
    subject: "Factura 234 no sincroniza con Holded",
    preview: "Buenos dias, tengo 20 facturas al mes y la ultima no aparece...",
    customer: buildCustomer({ id: "c2", name: "Carlos Ruiz", email: "carlos@ruizfontaneria.es", company: "Ruiz Fontaneria", companyType: "AUTONOMO", ltv: 890, interactions: 5, customerSince: "Ene 2023" }),
    status: "open",
    priority: "high",
    category: "Reclamacion",
    tags: ["AUTONOMO", "Reclamacion"],
    createdAt: minutesAgo(50),
    updatedAt: minutesAgo(20),
    unread: true,
    starred: false,
    isLead: false,
    intelligence: {
      summary: "Resolver incidencia sincronizacion Holded",
      intent: "Resolver incidencia sincronizacion Holded",
      urgency: "ALTA",
      urgencyReason: "no puede facturar, cliente final esperando",
      nextStep: "Escalar a soporte tecnico + plantilla incidencia",
      confidence: 0.88,
      insights: [{ id: "i1", text: "Autonomo 20 facturas/mes, bloqueo facturacion", tone: "warn" }],
    },
  },
  {
    id: "3",
    subject: "Duda formacion agentes IA para equipo",
    preview: "Quisiera formar a mi equipo de 4 en el uso de AGNTia para presu...",
    customer: buildCustomer({ id: "c3", name: "Laura Mendez", email: "laura@mendez-arquitectura.es", company: "Mendez Arquitectura", companyType: "PYME", ltv: 2100, interactions: 3, customerSince: "Jun 2023" }),
    status: "open",
    priority: "normal",
    category: "Formacion",
    tags: ["PYME", "Formacion", "Lead IA"],
    createdAt: minutesAgo(120),
    updatedAt: minutesAgo(75),
    unread: true,
    starred: true,
    isLead: true,
    intelligence: {
      summary: "Formacion de equipo interno en AGNTia",
      intent: "Formacion de equipo interno en AGNTia",
      urgency: "Media",
      urgencyReason: "planificacion anual, sin urgencia inmediata",
      nextStep: "Proponer pack de formacion 4 empleados",
      confidence: 0.82,
      insights: [{ id: "i1", text: "PYME 4 empleados, objecion precio formacion", tone: "purple" }],
    },
  },
  {
    id: "4",
    subject: "Automatizar seguimiento obras por WhatsApp",
    preview: "Llevamos 15 obras simultaneas y perdemos info por WhatsApp...",
    customer: buildCustomer({ id: "c4", name: "Javier Gil", email: "javier@gilreformas.es", company: "Gil Reformas", companyType: "PYME", ltv: 3200, interactions: 1, customerSince: "Sep 2023" }),
    status: "new",
    priority: "normal",
    category: "Presupuesto",
    tags: ["PYME", "Presupuesto", "Lead IA"],
    createdAt: minutesAgo(180),
    updatedAt: minutesAgo(150),
    unread: false,
    starred: false,
    isLead: true,
    intelligence: {
      summary: "Automatizar seguimiento de obras via WhatsApp",
      intent: "Automatizar seguimiento de obras via WhatsApp",
      urgency: "Media",
      urgencyReason: "perdida de informacion operativa",
      nextStep: "Demo del modulo WhatsApp + integracion con Holded",
      confidence: 0.79,
      insights: [{ id: "i1", text: "15 obras, perdida info WhatsApp", tone: "purple" }],
    },
  },
  {
    id: "5",
    subject: "El bot no responde fuera de horario",
    preview: "Hemos configurado horario pero el bot sigue respondiendo...",
    customer: buildCustomer({ id: "c5", name: "Ana Torres", email: "ana@clinicatorres.es", company: "Clinica Torres", companyType: "EMPRESA", ltv: 1800, interactions: 4, customerSince: "Nov 2022" }),
    status: "pending",
    priority: "normal",
    category: "Soporte",
    tags: ["EMPRESA", "Soporte"],
    createdAt: minutesAgo(60 * 26),
    updatedAt: minutesAgo(60 * 24),
    unread: false,
    starred: false,
    isLead: false,
    intelligence: {
      summary: "Configuracion horaria del bot",
      intent: "Configuracion horaria del bot",
      urgency: "Media",
      urgencyReason: "afecta a atencion al paciente",
      nextStep: "Revisar regla horaria en panel de configuracion",
      confidence: 0.86,
      insights: [{ id: "i1", text: "Configuracion horaria bot fallando", tone: "green" }],
    },
  },
  {
    id: "6",
    subject: "Precio para autonomo con Holded",
    preview: "Soy autonomo, teneis plan especial? Uso Holded y WhatsApp...",
    customer: buildCustomer({ id: "c6", name: "Roberto Diaz", email: "roberto@diazelectricidad.es", company: "Diaz Electricidad", companyType: "AUTONOMO", ltv: 640, interactions: 2, customerSince: "Feb 2024" }),
    status: "new",
    priority: "low",
    category: "Presupuesto",
    tags: ["AUTONOMO", "Presupuesto", "Lead IA"],
    createdAt: minutesAgo(60 * 30),
    updatedAt: minutesAgo(60 * 28),
    unread: false,
    starred: false,
    isLead: true,
    intelligence: {
      summary: "Precio especial para autonomo con Holded",
      intent: "Precio especial para autonomo con Holded",
      urgency: "Baja",
      urgencyReason: "consulta inicial, sin urgencia",
      nextStep: "Enviar tarifa autonomo + comparar con Holded",
      confidence: 0.72,
      insights: [{ id: "i1", text: "Autonomo, objecion precio, compara", tone: "warn" }],
    },
  },
  {
    id: "7",
    subject: "Reclamacion cobro duplicado",
    preview: "Me habeis cobrado dos veces este mes, adjunto justificantes...",
    customer: buildCustomer({ id: "c7", name: "Sofia Navarro", email: "sofia@navarrol-legal.es", company: "Navarro Legal", companyType: "PYME", ltv: 2400, interactions: 6, customerSince: "Ago 2023" }),
    status: "open",
    priority: "high",
    category: "Reclamacion",
    tags: ["PYME", "Reclamacion"],
    createdAt: minutesAgo(60 * 32),
    updatedAt: minutesAgo(60 * 30),
    unread: false,
    starred: false,
    isLead: false,
    intelligence: {
      summary: "Reclamacion por cobro duplicado",
      intent: "Reclamacion por cobro duplicado",
      urgency: "ALTA",
      urgencyReason: "riesgo de churn, cliente activo con historial",
      nextStep: "Verificar cargo + emitir reembolso + email disculpa",
      confidence: 0.91,
      insights: [{ id: "i1", text: "Cobro duplicado, riesgo churn", tone: "warn" }],
    },
  },
  {
    id: "8",
    subject: "Demo para 25 usuarios",
    preview: "Necesitamos demo para direccion y equipo comercial (25 person...",
    customer: buildCustomer({ id: "c8", name: "Miguel Pons", email: "miguel@ponsconstrucciones.es", company: "Pons Construcciones", companyType: "EMPRESA", ltv: 12000, interactions: 3, customerSince: "Abr 2022" }),
    status: "new",
    priority: "urgent",
    category: "Presupuesto",
    tags: ["EMPRESA", "Presupuesto", "Lead IA"],
    createdAt: minutesAgo(60 * 50),
    updatedAt: minutesAgo(60 * 48),
    unread: false,
    starred: false,
    isLead: true,
    intelligence: {
      summary: "Demo comercial para 25 usuarios",
      intent: "Demo comercial para 25 usuarios",
      urgency: "ALTA",
      urgencyReason: "deal grande, decision inminente",
      nextStep: "Agendar demo direccion + enviar propuesta enterprise",
      confidence: 0.88,
      insights: [{ id: "i1", text: "Empresa 25 usuarios, deal grande", tone: "purple" }],
    },
  },
];

const CONTEXTS: Record<string, CoWriteDraft> = {
  "1": {
    templateName: "plantilla ACME v2",
    recipient: "Marta",
    body: "Hola Marta!\n\nGracias por escribirnos! He revisado vuestra situacion y creo que el agente de WhatsApp + Holded encaja perfectamente.\n\nTe propongo una demo de 30 minutos y una propuesta con 3 planes (basico, medio y premium). Cuando te viene bien esta semana?\n\nUn saludo.",
    active: true,
  },
};

const wait = <T>(value: T, ms = 120) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

export async function listTickets(filter: TicketFilter = "principal"): Promise<ZendeskTicket[]> {
  let out = [...TICKETS];
  if (filter === "prioridad") out = out.filter((t) => t.priority === "high" || t.priority === "urgent");
  if (filter === "promos") out = out.filter((t) => t.category === "Presupuesto");
  return wait(out);
}

export async function getTicket(id: TicketId): Promise<ZendeskTicket | null> {
  return wait(TICKETS.find((t) => t.id === id) ?? null);
}

export async function getCoWriteDraft(id: TicketId): Promise<CoWriteDraft | null> {
  return wait(CONTEXTS[id] ?? null);
}

export async function generateCoWriteReply(id: TicketId): Promise<CoWriteDraft> {
  const t = TICKETS.find((x) => x.id === id);
  const firstName = t ? t.customer.name.split(" ")[0] : "cliente";
  return wait({
    templateName: "plantilla ACME v2",
    recipient: firstName,
    body: "Hola " + firstName + "!\n\nGracias por escribirnos. He revisado tu caso y te propongo una demo de 30 minutos.\n\nCuando te viene bien?",
    active: true,
  }, 400);
}

export async function createTicket(input: { subject: string; body: string }): Promise<void> {
  void input;
  return wait(undefined, 200);
}

export async function assignTicket(id: TicketId, userId: string): Promise<void> {
  void id;
  void userId;
  return wait(undefined, 150);
}

export async function escalateTicket(id: TicketId): Promise<void> {
  void id;
  return wait(undefined, 150);
}

export async function resolveTicket(id: TicketId): Promise<void> {
  void id;
  return wait(undefined, 150);
}

export async function reopenTicket(id: TicketId): Promise<void> {
  void id;
  return wait(undefined, 150);
}