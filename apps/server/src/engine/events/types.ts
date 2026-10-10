export const SYSTEM_EVENT_TYPES = [
  "task.created",
  "task.status_changed",
  "task.completed",
  "task.failed",
  "task.waiting_input",
  "task.waiting_approval",
  "task.controlled",
  "sop.step_started",
  "sop.step_completed",
  "sop.step_skipped",
  "sop.failed",
  "action.proposed",
  "action.approved",
  "action.denied",
  "action.executed",
  "action.failed",
  "action.outcome_unknown",
  "monitor.check",
  "monitor.changed",
  "monitor.failed",
  "system.startup",
  "system.error",
  "system.maintenance",
  "system.google_disconnected",
  "auth.login",
  "auth.login_failed",
  // A2_EVENTS_V1 - undo diferido y cancelacion de acciones.
  "action.deferred",
  "action.cancelled",
  // D2_VIEW_RESOLVED_V1 - el agente sirve una vista.
  "view.resolved",
  // EVENTS_V2 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â business graph, policy, state machine, agent runtime, context.
  "entity.created",
  "entity.updated",
  "entity.deleted",
  "relation.created",
  "relation.deleted",
  "policy.evaluated",
  "policy.denied",
  "state.changed",
  "state.transition_denied",
  "agent.runtime_spawned",
  "agent.runtime_completed",
  "agent.runtime_failed",
  "context.assembled",
  // VERIFICATION_EVENT_V1
  // WORKSPACE_EVENTS_V1 - eventos declarados por los 34 workspaces.
  // Email
  "email.received", "email.sent", "email.thread.linked", "email.label.applied",
  // Messaging
  "whatsapp.message.received", "whatsapp.message.sent", "whatsapp.identity.linked",
  // CRM
  "lead.created", "opportunity.created", "opportunity.stage.changed", "sales.activity.logged",
  // Invoicing
  "invoice.drafted", "invoice.issued", "invoice.paid", "invoice.voided", "expense.recorded",
  // Documents
  "document.uploaded", "document.classified", "document.linked", "document.archived",
  // Calendar
  "calendar.event.created", "calendar.event.rescheduled", "calendar.event.cancelled",
  // Work
  "workitem.created", "workitem.assigned", "workitem.completed", "workitem.blocked",
  // Assistant
  "assistant.run.started", "assistant.run.completed", "assistant.tool.invoked",
  // Data
  "dataset.record.created", "dataset.record.updated",
  // Objectives
  "objective.created", "keyresult.updated", "objective.closed",
  // Treasury
  "bank.transaction.imported", "bank.transaction.reconciled", "bank.discrepancy.detected",
  // Purchases
  "purchase.requested", "purchase.order.approved", "purchase.order.received",
  // Projects
  "resource.allocated", "time.logged", "budget.adjusted",
  // Tickets
  "ticket.created", "ticket.assigned", "ticket.resolved", "ticket.escalated",
  // Signature
  "envelope.prepared", "envelope.sent", "envelope.signed", "envelope.completed",
  // Workflows
  "workflow.executed", "workflow.failed", "workflow.completed",
  // SOPs
  "sop.started", "sop.step.completed", "sop.completed", "sop.aborted",
  // Employees
  "employee.created", "leave.approved", "leave.rejected", "attendance.recorded",
  // Onboarding
  "position.opened", "onboarding.started", "onboarding.completed", "employment.closed",
  // Expenses
  "expense.submitted", "expense.approved", "expense.rejected", "expense.receipt.attached",
  // Payments
  "payment.succeeded", "payment.failed", "refund.issued", "dispute.opened",
  // Design
  "brief.created", "design.generated", "asset.exported", "asset.published",
  // Social
  "post.composed", "post.scheduled", "post.published", "post.metrics.collected",
  // Commerce
  "order.created", "order.fulfilled", "order.returned", "inventory.synced",
  // Posventa
  "conversation.opened", "conversation.routed", "conversation.closed",
  // Inventory
  "stock.received", "stock.issued", "stock.transferred", "stock.adjusted", "stock.low",
  // Maintenance
  "asset.registered", "maintenance.opened", "maintenance.completed", "inspection.recorded",
  // Manufacturing
  "production.planned", "production.started", "production.output.recorded", "production.closed",
  // Compliance
  "risk.registered", "control.assigned", "evidence.attached", "review.scheduled",
  // Identity
  "principal.created", "role.assigned", "access.revoked", "policy.updated",
  // Portal
  "portal.invited", "request.submitted", "case.updated", "document.shared",
  // Wiki
  "page.created", "page.updated", "page.archived",
  // Observability
  "run.recorded", "span.recorded", "evaluation.submitted",
  // Kanban
  "board.created", "card.created", "card.moved", "card.archived",
  // WS_EVENTS_TYPES_FIX_V1
  "verification.executed",
  "verification.disagreement",
] as const;

export type SystemEventType = (typeof SYSTEM_EVENT_TYPES)[number];

export interface SystemEventSource {
  kind: "task" | "sop" | "action" | "monitor" | "system" | "auth" | "entity" | "relation" | "policy" | "state" | "agent" | "context";
  id: string;
}

export interface SystemEvent<T = Record<string, unknown>> {
  id: string;
  schemaVersion: "1.0";
  tenantId: string;
  owner: string;
  type: SystemEventType;
  emittedAt: string;
  source: SystemEventSource;
  correlationId?: string;
  causationId?: string;
  payload: T;
}

export interface EventFilter {
  type?: SystemEventType | SystemEventType[];
  since?: string;
  until?: string;
  limit?: number;
  sourceId?: string;
  projectId?: string;
  // EVENTS_SINCE_ID_V1 - polling incremental.
  sinceId?: string;
}

export interface EventAggregate {
  type: SystemEventType;
  count: number;
}

export interface EventSink {
  write(event: SystemEvent): Promise<void>;
}

export interface EventQuery {
  recent(owner: string, filter: EventFilter): Promise<SystemEvent[]>;
  aggregate(owner: string, hours: number): Promise<EventAggregate[]>;
}