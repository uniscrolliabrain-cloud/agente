// ZENDESK_TYPES_V1

export type TicketId = string;
export type CustomerId = string;

export type TicketStatus = "new" | "open" | "pending" | "hold" | "solved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketCategory = "Presupuesto" | "Reclamacion" | "Formacion" | "Soporte" | "Otro";
export type CompanyType = "PYME" | "AUTONOMO" | "EMPRESA";
export type InsightTone = "purple" | "warn" | "green" | "info";
export type UrgencyLevel = "Baja" | "Media" | "ALTA";
export type TicketFilter = "principal" | "prioridad" | "promos";

export interface ZendeskCustomer {
  id: CustomerId;
  name: string;
  email: string;
  company: string;
  companyType: CompanyType;
  ltv: number;
  interactions: number;
  customerSince: string;
  avatarInitials: string;
}

export interface TicketInsight {
  id: string;
  text: string;
  tone: InsightTone;
}

export interface TicketIntelligence {
  summary: string;
  intent: string;
  urgency: UrgencyLevel;
  urgencyReason: string;
  nextStep: string;
  confidence: number;
  insights: TicketInsight[];
}

export interface ZendeskTicket {
  id: TicketId;
  subject: string;
  preview: string;
  customer: ZendeskCustomer;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  unread: boolean;
  starred: boolean;
  isLead: boolean;
  intelligence?: TicketIntelligence;
}

export interface CoWriteDraft {
  templateName: string;
  recipient: string;
  body: string;
  active: boolean;
}

export interface SidebarNavEntry {
  id: string;
  label: string;
  icon: "chat" | "tasks" | "documents" | "projects" | "knowledge" | "team" | "agents" | "inbox" | "starred";
  badge?: number;
  active?: boolean;
}
