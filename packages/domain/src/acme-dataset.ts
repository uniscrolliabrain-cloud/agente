// PENDING(2026-11-30) modelo explicito de ACME: los schemas se usan en tests y en el seed, pero las vistas aun no anotan sus filas con los alias de tipo: AcmeLeadStatus, AcmeLead, AcmeProjectStatus, AcmeProject, AcmeTicketUrgency, AcmeTicket, AcmeAgentMetric.
// ACME_DATASET_V1 - modelo explicito del tenant ACME.
//
// Regla de la campaña (R4): toda entidad que una vista necesite pintar trae
// el campo ya resuelto. No se deriva nada de texto libre: si un valor no esta
// en el dato, la vista lo muestra como ausente.
//
// Este fichero es aditivo: no importa ni modifica `views.ts` ni
// `view-envelope.ts`, y sus enums son cerrados.

import { z } from "zod";

// ACME_LEAD_STATUS_V1 - estado comercial explicito, nunca inferido.
export const acmeLeadStatusSchema = z.enum(["riesgo", "oportunidad", "estable", "ganado"]);
export type AcmeLeadStatus = z.infer<typeof acmeLeadStatusSchema>;

export const acmeLeadSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  domain: z.string().min(1).max(200),
  status: acmeLeadStatusSchema,
  // Importe siempre numerico o ausente declarado; nunca string.
  amountEur: z.number().finite().nonnegative().nullable(),
  nextStep: z.string().min(1).max(300),
  action: z.string().min(1).max(300),
  detail: z.string().max(1000),
  updatedAt: z.iso.datetime({ offset: true }),
});
export type AcmeLead = z.infer<typeof acmeLeadSchema>;

// ACME_PROJECT_STATUS_V1
export const acmeProjectStatusSchema = z.enum(["active", "paused", "closed"]);
export type AcmeProjectStatus = z.infer<typeof acmeProjectStatusSchema>;

export const acmeProjectSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  status: acmeProjectStatusSchema,
  ownerId: z.string().min(1).max(100),
  // null = sin alerta; el string ya viene redactado en el dato.
  alert: z.string().max(300).nullable(),
  blocks: z.array(z.string().min(1).max(300)).max(200).default([]),
  linkedMemoryIds: z.array(z.string().min(1).max(200)).max(200).default([]),
});
export type AcmeProject = z.infer<typeof acmeProjectSchema>;

// ACME_TICKET_URGENCY_V1 - tres niveles cerrados, tal como los pinta la vista.
export const acmeTicketUrgencySchema = z.enum(["alta", "media", "urgente"]);
export type AcmeTicketUrgency = z.infer<typeof acmeTicketUrgencySchema>;

export const acmeTicketSchema = z.object({
  id: z.string().min(1).max(200),
  taskId: z.string().min(1).max(200),
  ownerId: z.string().min(1).max(100),
  clientId: z.string().min(1).max(200),
  label: z.string().min(1).max(200),
  urgency: acmeTicketUrgencySchema,
});
export type AcmeTicket = z.infer<typeof acmeTicketSchema>;

// ACME_AGENT_METRIC_V1 - dato, no formula: no se recalcula en la vista.
export const acmeAgentMetricSchema = z.object({
  agentId: z.string().min(1).max(100),
  confidence: z.number().min(0).max(1),
  openTasks: z.number().int().nonnegative().max(10000),
});
export type AcmeAgentMetric = z.infer<typeof acmeAgentMetricSchema>;
