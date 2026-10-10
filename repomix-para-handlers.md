This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: apps/server/src/db.ts, apps/server/src/engine/events/index.ts, apps/server/src/engine/events/bus.ts, apps/server/src/engine/events/types.ts, apps/server/src/engine/events/sinks/store.ts, apps/server/src/engine/capabilities/registry.ts, apps/server/src/engine/workspaces/**, apps/server/src/routes/workspaces.ts, apps/server/src/app.ts, packages/workspaces/src/contracts/index.ts, packages/workspaces/src/contracts/workspace-module.ts, packages/workspaces/src/contracts/workspace-command.ts, packages/workspaces/src/contracts/workspace-query.ts, packages/workspaces/src/contracts/workspace-event.ts, packages/workspaces/src/contracts/workspace-context.ts, packages/workspaces/21-stripe/src/**, packages/workspaces/01-gmail/src/**, packages/workspaces/07-linear/src/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
apps/
  server/
    src/
      engine/
        capabilities/
          registry.ts
        events/
          sinks/
            store.ts
          bus.ts
          index.ts
          types.ts
        workspaces/
          index.ts
          registry.ts
      app.ts
      db.ts
packages/
  workspaces/
    01-gmail/
      src/
        application/
          capabilities.ts
          views.ts
        domain/
          entities.ts
        events/
          consumed.ts
          published.ts
        .gitkeep
        contract.ts
        index.ts
    07-linear/
      src/
        application/
          capabilities.ts
          views.ts
        domain/
          entities.ts
        events/
          consumed.ts
          published.ts
        .gitkeep
        contract.ts
        index.ts
    21-stripe/
      src/
        application/
          capabilities.ts
          views.ts
        domain/
          entities.ts
        events/
          consumed.ts
          published.ts
        .gitkeep
        contract.ts
        index.ts
    src/
      contracts/
        index.ts
        workspace-command.ts
        workspace-context.ts
        workspace-event.ts
        workspace-module.ts
        workspace-query.ts
```

# Files

## File: apps/server/src/engine/workspaces/index.ts
```typescript
// WORKSPACES_ENGINE_INDEX_V1 — contrato publico del modulo de workspaces del engine.
export { WorkspaceModuleRegistry } from "./registry.ts";
```

## File: apps/server/src/engine/workspaces/registry.ts
```typescript
// WORKSPACE_MODULE_REGISTRY_V1 — descubre los 34 WorkspaceModule del paquete.
// Importa por barrel, no carga YAML en runtime.

import type { WorkspaceModule, WorkspaceFamily } from "@openmuse/workspaces";

export class WorkspaceModuleRegistry {
  private readonly modules = new Map<string, WorkspaceModule>();

  register(module: WorkspaceModule): void {
    this.modules.set(module.manifest.id, module);
  }

  registerAll(modules: readonly WorkspaceModule[]): void {
    for (const m of modules) this.register(m);
  }

  get(id: string): WorkspaceModule | undefined {
    return this.modules.get(id);
  }

  list(): readonly WorkspaceModule[] {
    return [...this.modules.values()];
  }

  byFamily(family: WorkspaceFamily): readonly WorkspaceModule[] {
    return this.list().filter((m) => m.manifest.family === family);
  }

  all(): readonly WorkspaceModule[] {
    return this.list();
  }

  count(): number {
    return this.modules.size;
  }
}
```

## File: packages/workspaces/01-gmail/src/application/capabilities.ts
```typescript
// 01-gmail - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "email.read", title: "email.read", kind: "action" as const, risk: "low" as const },
  { id: "email.search", title: "email.search", kind: "action" as const, risk: "low" as const },
  { id: "email.send", title: "email.send", kind: "action" as const, risk: "low" as const },
  { id: "email.compose", title: "email.compose", kind: "action" as const, risk: "low" as const },
  { id: "email.label", title: "email.label", kind: "action" as const, risk: "low" as const },
  { id: "email.archive", title: "email.archive", kind: "action" as const, risk: "low" as const },
  { id: "email.attach", title: "email.attach", kind: "action" as const, risk: "low" as const },
  { id: "email.link_thread", title: "email.link_thread", kind: "action" as const, risk: "low" as const }
] as const;
```

## File: packages/workspaces/01-gmail/src/application/views.ts
```typescript
// 01-gmail - declaracion de vistas.
export const VIEWS = [] as const;
```

## File: packages/workspaces/01-gmail/src/events/consumed.ts
```typescript
// 01-gmail - eventos consumidos.
export const CONSUMED = [
  "document.uploaded",
  "contact.created",
  "task.created"
] as const;
```

## File: packages/workspaces/01-gmail/src/events/published.ts
```typescript
// 01-gmail - eventos publicados.
export const PUBLISHED = [
  "email.received",
  "email.sent",
  "email.thread.linked",
  "email.label.applied"
] as const;
```

## File: packages/workspaces/01-gmail/src/contract.ts
```typescript
// 01-gmail - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "gmail",
    slug: "01-gmail",
    order: 1,
    family: "comunicacion" as never,
    reference: "Gmail",
    title: "Correo electronico",
    status: "scaffold",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
    "email.read",
    "email.search",
    "email.send",
    "email.compose",
    "email.label",
    "email.archive",
    "email.attach",
    "email.link_thread",
    ],
    dependencies: [],
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
};
```

## File: packages/workspaces/07-linear/src/application/capabilities.ts
```typescript
// 07-linear - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "work.create", title: "work.create", kind: "action" as const, risk: "low" as const },
  { id: "work.assign", title: "work.assign", kind: "action" as const, risk: "low" as const },
  { id: "work.change_status", title: "work.change_status", kind: "action" as const, risk: "low" as const },
  { id: "work.add_dependency", title: "work.add_dependency", kind: "action" as const, risk: "low" as const },
  { id: "work.close", title: "work.close", kind: "action" as const, risk: "low" as const },
  { id: "work.list", title: "work.list", kind: "action" as const, risk: "low" as const },
  { id: "work.read", title: "work.read", kind: "action" as const, risk: "low" as const }
] as const;
```

## File: packages/workspaces/07-linear/src/application/views.ts
```typescript
// 07-linear - declaracion de vistas.
export const VIEWS = [] as const;
```

## File: packages/workspaces/07-linear/src/events/consumed.ts
```typescript
// 07-linear - eventos consumidos.
export const CONSUMED = [
  "task.created",
  "ticket.created",
  "sop.completed"
] as const;
```

## File: packages/workspaces/07-linear/src/events/published.ts
```typescript
// 07-linear - eventos publicados.
export const PUBLISHED = [
  "workitem.created",
  "workitem.assigned",
  "workitem.completed",
  "workitem.blocked"
] as const;
```

## File: packages/workspaces/07-linear/src/contract.ts
```typescript
// 07-linear - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "linear",
    slug: "07-linear",
    order: 7,
    family: "trabajo" as never,
    reference: "Linear",
    title: "Tareas y proyectos",
    status: "scaffold",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
    "work.create",
    "work.assign",
    "work.change_status",
    "work.add_dependency",
    "work.close",
    "work.list",
    "work.read",
    ],
    dependencies: [],
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
};
```

## File: packages/workspaces/21-stripe/src/application/capabilities.ts
```typescript
// 21-stripe - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "payment.record", title: "payment.record", kind: "action" as const, risk: "low" as const },
  { id: "refund.issue", title: "refund.issue", kind: "action" as const, risk: "low" as const },
  { id: "dispute.open", title: "dispute.open", kind: "action" as const, risk: "low" as const },
  { id: "dispute.resolve", title: "dispute.resolve", kind: "action" as const, risk: "low" as const },
  { id: "revenue.read", title: "revenue.read", kind: "action" as const, risk: "low" as const },
  { id: "payment.list", title: "payment.list", kind: "action" as const, risk: "low" as const },
  { id: "subscription.manage", title: "subscription.manage", kind: "action" as const, risk: "low" as const }
] as const;
```

## File: packages/workspaces/21-stripe/src/application/views.ts
```typescript
// 21-stripe - declaracion de vistas.
export const VIEWS = [] as const;
```

## File: packages/workspaces/21-stripe/src/events/consumed.ts
```typescript
// 21-stripe - eventos consumidos.
export const CONSUMED = [
  "invoice.issued",
  "subscription.renewed"
] as const;
```

## File: packages/workspaces/21-stripe/src/events/published.ts
```typescript
// 21-stripe - eventos publicados.
export const PUBLISHED = [
  "payment.succeeded",
  "payment.failed",
  "refund.issued",
  "dispute.opened"
] as const;
```

## File: packages/workspaces/21-stripe/src/contract.ts
```typescript
// 21-stripe - contrato publico del workspace.
import type { WorkspaceModule } from "../../../src/contracts/index.ts";
import { CAPABILITIES } from "./application/capabilities.ts";
import { VIEWS } from "./application/views.ts";
import { PUBLISHED } from "./events/published.ts";
import { CONSUMED } from "./events/consumed.ts";

export const workspace: WorkspaceModule = {
  manifest: {
    id: "stripe",
    slug: "21-stripe",
    order: 21,
    family: "finanzas" as never,
    reference: "Stripe",
    title: "Pagos y analitica",
    status: "scaffold",
    version: 1,
    entrypoint: "./src/index.ts",
    capabilities: [
    "payment.record",
    "refund.issue",
    "dispute.open",
    "dispute.resolve",
    "revenue.read",
    "payment.list",
    "subscription.manage",
    ],
    dependencies: [],
    events: { publishes: [], consumes: [] },
  },
  capabilities: CAPABILITIES,
  views: VIEWS,
  publishes: PUBLISHED.map((t) => ({ type: t, version: 1, description: t })),
  consumes: CONSUMED.map((t) => ({ type: t, version: 1, description: t, source: "external" })),
};
```

## File: apps/server/src/engine/events/index.ts
```typescript
export type {
  EventAggregate,
  EventFilter,
  EventQuery,
  EventSink,
  SystemEvent,
  SystemEventSource,
  SystemEventType,
} from "./types.ts";
export { SYSTEM_EVENT_TYPES } from "./types.ts";
export { ulid } from "./ulid.ts";
export { SchemaRegistry, type EventSchema } from "./schema-registry.ts";
export { payloadSchemas } from "./schemas.ts";
export { StoreSink, StoreQuery } from "./sinks/store.ts";
export { EventBus, type EmitOptions } from "./bus.ts";
```

## File: packages/workspaces/01-gmail/src/domain/entities.ts
```typescript
// 01-gmail — entidades canonicas del workspace de correo electronico.
// Derivado del analisis de Gmail API (users.messages, users.threads,
// users.labels, users.drafts, users.attachments).

import { z } from "zod";

export const emailAttachmentSchema = z.object({
  id: z.string().min(1).max(200),
  messageId: z.string().min(1).max(200),
  name: z.string().min(1).max(400),
  mimeType: z.string().max(200),
  size: z.number().int().nonnegative(),
  url: z.string().max(2000).optional(),
  inline: z.boolean().default(false),
});

export const emailMessageSchema = z.object({
  id: z.string().min(1).max(200),
  threadId: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  from: z.string().max(500),
  to: z.array(z.string().max(500)).default([]),
  cc: z.array(z.string().max(500)).default([]),
  bcc: z.array(z.string().max(500)).default([]),
  replyTo: z.string().max(500).optional(),
  subject: z.string().max(998),
  snippet: z.string().max(2000).optional(),
  body: z.string().max(200000),
  bodyHtml: z.string().max(500000).optional(),
  receivedAt: z.string(),
  sentAt: z.string().optional(),
  labels: z.array(z.string().max(100)).default([]),
  attachments: z.array(emailAttachmentSchema).default([]),
  read: z.boolean().default(false),
  starred: z.boolean().default(false),
  important: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export const emailThreadSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  subject: z.string().max(998),
  messageIds: z.array(z.string().min(1).max(200)).default([]),
  participants: z.array(z.string().max(500)).default([]),
  lastMessageAt: z.string(),
  unreadCount: z.number().int().nonnegative().default(0),
  linkedEntityId: z.string().max(200).optional(),
  linkedEntityType: z.string().max(100).optional(),
});

export const emailLabelSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  color: z.string().max(50).optional(),
  visible: z.boolean().default(true),
  systemLabel: z.boolean().default(false),
});

export const emailDraftSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  to: z.array(z.string().max(500)).default([]),
  cc: z.array(z.string().max(500)).default([]),
  bcc: z.array(z.string().max(500)).default([]),
  subject: z.string().max(998),
  body: z.string().max(200000),
  threadId: z.string().max(200).optional(),
  attachmentIds: z.array(z.string().min(1).max(200)).default([]),
  updatedAt: z.string(),
});

export type EmailAttachment = z.infer<typeof emailAttachmentSchema>;
export type EmailMessage = z.infer<typeof emailMessageSchema>;
export type EmailThread = z.infer<typeof emailThreadSchema>;
export type EmailLabel = z.infer<typeof emailLabelSchema>;
export type EmailDraft = z.infer<typeof emailDraftSchema>;
```

## File: packages/workspaces/01-gmail/src/.gitkeep
```

```

## File: packages/workspaces/01-gmail/src/index.ts
```typescript
// 01-gmail - punto de entrada del workspace.
export { workspace } from "./contract.ts";
```

## File: packages/workspaces/07-linear/src/domain/entities.ts
```typescript
// 07-linear — entidades canonicas del workspace de tareas y proyectos.
// Derivado del analisis de Linear GraphQL API (issues, projects,
// cycles, milestones, teams, workflowStates, labels).

import { z } from "zod";

export const workItemSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  identifier: z.string().max(50).optional(),
  title: z.string().max(500),
  description: z.string().max(50000).optional(),
  status: z.enum(["backlog","todo","in_progress","blocked","in_review","done","cancelled"]).default("todo"),
  priority: z.enum(["no_priority","low","medium","high","urgent"]).default("medium"),
  assigneeId: z.string().max(200).optional(),
  creatorId: z.string().max(200).optional(),
  projectId: z.string().max(200).optional(),
  cycleId: z.string().max(200).optional(),
  parentId: z.string().max(200).optional(),
  teamId: z.string().max(200).optional(),
  labels: z.array(z.string().max(100)).default([]),
  estimate: z.number().nonnegative().optional(),
  dueDate: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const projectSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  name: z.string().max(400),
  description: z.string().max(10000).optional(),
  status: z.enum(["planned","active","paused","completed","cancelled","archived"]).default("active"),
  ownerId: z.string().max(200).optional(),
  leadId: z.string().max(200).optional(),
  teamIds: z.array(z.string().min(1).max(200)).default([]),
  targetDate: z.string().optional(),
  startDate: z.string().optional(),
  progress: z.number().min(0).max(1).default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const milestoneSchema = z.object({
  id: z.string().min(1).max(200),
  projectId: z.string().min(1).max(200),
  name: z.string().max(400),
  description: z.string().max(5000).optional(),
  dueDate: z.string().optional(),
  reached: z.boolean().default(false),
  reachedAt: z.string().optional(),
});

export const cycleSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().max(400),
  number: z.number().int().nonnegative().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  completed: z.boolean().default(false),
});

export const dependencySchema = z.object({
  id: z.string().min(1).max(200),
  fromItemId: z.string().min(1).max(200),
  toItemId: z.string().min(1).max(200),
  kind: z.enum(["blocks","blocked_by","relates_to","duplicate_of"]).default("relates_to"),
  createdAt: z.string(),
});

export const teamSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  name: z.string().max(200),
  key: z.string().max(20).optional(),
  memberIds: z.array(z.string().min(1).max(200)).default([]),
});

export type WorkItem = z.infer<typeof workItemSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type Cycle = z.infer<typeof cycleSchema>;
export type Dependency = z.infer<typeof dependencySchema>;
export type Team = z.infer<typeof teamSchema>;
```

## File: packages/workspaces/07-linear/src/.gitkeep
```

```

## File: packages/workspaces/07-linear/src/index.ts
```typescript
// 07-linear - punto de entrada del workspace.
export { workspace } from "./contract.ts";
```

## File: packages/workspaces/21-stripe/src/domain/entities.ts
```typescript
// 21-stripe — entidades canonicas del workspace de pagos y analitica.
// Derivado del analisis de Stripe API (payments, refunds, disputes,
// customers, subscriptions, revenue snapshots).

import { z } from "zod";

export const paymentSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  customerId: z.string().max(200).optional(),
  invoiceId: z.string().max(200).optional(),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  status: z.enum(["pending","succeeded","failed","refunded","partially_refunded","disputed"]).default("pending"),
  method: z.enum(["card","transfer","direct_debit","wallet","other"]).default("card"),
  provider: z.string().max(100).default("stripe"),
  feeAmount: z.number().nonnegative().default(0),
  netAmount: z.number().nonnegative().default(0),
  failureReason: z.string().max(500).optional(),
  paidAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const refundSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  paymentId: z.string().min(1).max(200),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  reason: z.string().max(500).optional(),
  status: z.enum(["pending","succeeded","failed"]).default("pending"),
  issuedBy: z.string().max(200).optional(),
  issuedAt: z.string(),
});

export const disputeSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  paymentId: z.string().min(1).max(200),
  reason: z.enum(["fraudulent","product_not_received","duplicate","subscription_canceled","other"]).default("other"),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  status: z.enum(["needs_response","under_review","won","lost","closed"]).default("needs_response"),
  evidence: z.array(z.string().max(2000)).default([]),
  openedAt: z.string(),
  resolvedAt: z.string().optional(),
});

export const paymentCustomerSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  externalId: z.string().max(200).optional(),
  email: z.string().max(500).optional(),
  name: z.string().max(400).optional(),
  contactId: z.string().max(200).optional(),
  lifetimeValue: z.number().nonnegative().default(0),
  currency: z.string().max(10).default("EUR"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const subscriptionSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  customerId: z.string().min(1).max(200),
  planId: z.string().min(1).max(200),
  status: z.enum(["active","past_due","canceled","trialing","paused"]).default("active"),
  amount: z.number().nonnegative(),
  currency: z.string().max(10).default("EUR"),
  interval: z.enum(["day","week","month","year"]).default("month"),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  canceledAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const revenueSnapshotSchema = z.object({
  id: z.string().min(1).max(200),
  tenantId: z.string().min(1).max(100),
  period: z.string().max(50),
  currency: z.string().max(10).default("EUR"),
  grossRevenue: z.number().nonnegative().default(0),
  netRevenue: z.number().nonnegative().default(0),
  refunds: z.number().nonnegative().default(0),
  fees: z.number().nonnegative().default(0),
  paymentCount: z.number().int().nonnegative().default(0),
  computedAt: z.string(),
});

export type Payment = z.infer<typeof paymentSchema>;
export type Refund = z.infer<typeof refundSchema>;
export type Dispute = z.infer<typeof disputeSchema>;
export type PaymentCustomer = z.infer<typeof paymentCustomerSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;
export type RevenueSnapshot = z.infer<typeof revenueSnapshotSchema>;
```

## File: packages/workspaces/21-stripe/src/.gitkeep
```

```

## File: packages/workspaces/21-stripe/src/index.ts
```typescript
// 21-stripe - punto de entrada del workspace.
export { workspace } from "./contract.ts";
```

## File: packages/workspaces/src/contracts/index.ts
```typescript
// Contratos compartidos del paquete @openmuse/workspaces.
export * from "./workspace-context.ts";
export * from "./workspace-command.ts";
export * from "./workspace-query.ts";
export * from "./workspace-event.ts";
export * from "./workspace-view.ts";
export * from "./capability-declaration.ts";
export * from "./workspace-module.ts";
```

## File: packages/workspaces/src/contracts/workspace-command.ts
```typescript
// WORKSPACE_COMMAND_V1 — sobre comun de cualquier comando de workspace.
// El payload generico solo es envoltorio. Cada comando concreto define su
// propio schema Zod en src/application/commands.ts del workspace.

import { z } from "zod";

export const workspaceCommandEnvelopeSchema = z.object({
  id: z.string().min(1).max(200),
  workspaceId: z.string().min(1).max(100),
  command: z.string().min(1).max(100),
  version: z.number().int().positive().default(1),
  entityId: z.string().min(1).max(200).optional(),
  idempotencyKey: z.string().min(1).max(200).optional(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export type WorkspaceCommandEnvelope = z.infer<
  typeof workspaceCommandEnvelopeSchema
>;

export interface CommandResult {
  status: "ok" | "rejected" | "deferred";
  entityId?: string;
  reason?: string;
}

export interface CommandHandler<TPayload = Record<string, unknown>> {
  readonly commandId: string;
  readonly version: number;
  handle(
    payload: TPayload,
    context: import("./workspace-context.ts").WorkspaceContext,
    envelope: WorkspaceCommandEnvelope,
  ): Promise<CommandResult>;
}
```

## File: packages/workspaces/src/contracts/workspace-context.ts
```typescript
// WORKSPACE_CONTEXT_V1 — identidad del actor que ejecuta una operacion
// sobre un workspace. No autoriza por si solo. La autorizacion efectiva
// la decide PolicyEngine en el runtime.

import { z } from "zod";

export const workspaceContextSchema = z.object({
  workspaceId: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  owner: z.string().min(1).max(200),
  actorId: z.string().min(1).max(200),
  actorKind: z.enum(["user", "agent", "system"]),
  roleId: z.string().min(1).max(100).optional(),
  personaId: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string().min(1).max(200)).default([]),
  correlationId: z.string().min(1).max(200),
  causationId: z.string().min(1).max(200).optional(),
});

export type WorkspaceContext = z.infer<typeof workspaceContextSchema>;
```

## File: packages/workspaces/src/contracts/workspace-event.ts
```typescript
// WORKSPACE_EVENT_V1 — sobre comun de eventos publicados por un workspace.
// El bus real es SystemEvent (apps/server/src/engine/events/types.ts).
// Este sobre es la declaracion tipada que vive dentro del modulo; el
// adapter de registro lo traduce a SystemEvent al publicar.

import { z } from "zod";

export const workspaceEventEnvelopeSchema = z.object({
  id: z.string().min(1).max(200),
  type: z.string().min(1).max(150),
  version: z.number().int().positive().default(1),
  workspaceId: z.string().min(1).max(100),
  tenantId: z.string().min(1).max(100),
  entityId: z.string().min(1).max(200).optional(),
  correlationId: z.string().min(1).max(200).optional(),
  causationId: z.string().min(1).max(200).optional(),
  occurredAt: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export type WorkspaceEventEnvelope = z.infer<
  typeof workspaceEventEnvelopeSchema
>;

export interface PublishedEvent {
  readonly type: string;
  readonly version: number;
  readonly description: string;
}

export interface ConsumedEvent {
  readonly type: string;
  readonly version: number;
  readonly description: string;
  readonly source: string;
}
```

## File: packages/workspaces/src/contracts/workspace-module.ts
```typescript
// WORKSPACE_MODULE_V1 — contrato de modulo de workspace.
// Cada uno de los 34 workspaces exporta un WorkspaceModule como entrada
// publica. El runtime lo descubre y lo registra.

import type { CapabilityDeclaration } from "./capability-declaration.ts";
import type { WorkspaceViewDeclaration } from "./workspace-view.ts";
import type {
  PublishedEvent,
  ConsumedEvent,
} from "./workspace-event.ts";

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

export type WorkspaceStatus =
  | "scaffold"
  | "contract-ready"
  | "implemented"
  | "integrated"
  | "verified"
  | "blocked";

export interface WorkspaceManifest {
  readonly id: string;
  readonly slug: string;
  readonly order: number;
  readonly family: WorkspaceFamily;
  readonly reference: string;
  readonly title: string;
  readonly status: WorkspaceStatus;
  readonly version: number;
  readonly entrypoint: string;
  readonly capabilities: string[];
  readonly dependencies: string[];
  readonly events: {
    readonly publishes: string[];
    readonly consumes: string[];
  };
}

export interface WorkspaceModule {
  readonly manifest: WorkspaceManifest;
  readonly capabilities: readonly CapabilityDeclaration[];
  readonly views: readonly WorkspaceViewDeclaration[];
  readonly publishes: readonly PublishedEvent[];
  readonly consumes: readonly ConsumedEvent[];
}
```

## File: packages/workspaces/src/contracts/workspace-query.ts
```typescript
// WORKSPACE_QUERY_V1 — sobre comun de cualquier consulta de workspace.

import { z } from "zod";

export const workspaceQueryEnvelopeSchema = z.object({
  id: z.string().min(1).max(200),
  workspaceId: z.string().min(1).max(100),
  query: z.string().min(1).max(100),
  version: z.number().int().positive().default(1),
  parameters: z.record(z.string(), z.unknown()).default({}),
  limit: z.number().int().positive().max(500).default(50),
  cursor: z.string().max(200).optional(),
});

export type WorkspaceQueryEnvelope = z.infer<
  typeof workspaceQueryEnvelopeSchema
>;

export interface QueryResult<T = unknown> {
  status: "ok" | "empty" | "forbidden";
  items: T[];
  nextCursor?: string;
  total?: number;
}

export interface QueryHandler<TParams = Record<string, unknown>, TItem = unknown> {
  readonly queryId: string;
  readonly version: number;
  handle(
    params: TParams,
    context: import("./workspace-context.ts").WorkspaceContext,
    envelope: WorkspaceQueryEnvelope,
  ): Promise<QueryResult<TItem>>;
}
```

## File: apps/server/src/engine/capabilities/registry.ts
```typescript
// CAPABILITY_REGISTRY_V1 - registro de capacidades del sistema.

import type { CapabilityContract } from "../../../../../packages/domain/src/capability.ts";

export interface CapabilityProvider {
  list(tenantId: string): Promise<CapabilityContract[]>;
  get(tenantId: string, id: string): Promise<CapabilityContract | undefined>;
}

export class CapabilityRegistry {
  private readonly capabilities = new Map<string, CapabilityContract>();

  register(capability: CapabilityContract): void {
    this.capabilities.set(capability.id, capability);
  }

  async get(id: string): Promise<CapabilityContract | undefined> {
    return this.capabilities.get(id);
  }

  async list(filter?: { kind?: string; tag?: string; risk?: string }): Promise<CapabilityContract[]> {
    let all = [...this.capabilities.values()];
    if (filter?.kind) all = all.filter((c) => c.kind === filter.kind);
    if (filter?.tag) all = all.filter((c) => c.tags.includes(filter.tag!));
    if (filter?.risk) all = all.filter((c) => c.risk === filter.risk);
    return all;
  }
}
// TENANT_SCOPED_CAPABILITY_REGISTRY_V1 - registry por tenant con cache TTL.
// Ver: docs/audits/09-kernel-cognitivo/09z-fundamentos.md
export interface CapabilityBundleResolver {
  resolve(tenantId: string): Promise<{
    capabilities: CapabilityContract[];
    version: number;
  }>;
}

export class TenantScopedCapabilityRegistry {
  private readonly cache = new Map<string, { at: number; value: CapabilityContract[] }>();
  private readonly ttlMs: number;

  constructor(
    private readonly resolver: CapabilityBundleResolver,
    ttlMs = 5 * 60 * 1000,
  ) {
    this.ttlMs = ttlMs;
  }

  async list(tenantId: string): Promise<CapabilityContract[]> {
    const cached = this.cache.get(tenantId);
    if (cached && Date.now() - cached.at < this.ttlMs) return cached.value;
    const resolved = await this.resolver.resolve(tenantId);
    this.cache.set(tenantId, { at: Date.now(), value: resolved.capabilities });
    return resolved.capabilities;
  }

  async get(tenantId: string, id: string): Promise<CapabilityContract | undefined> {
    const all = await this.list(tenantId);
    return all.find((c) => c.id === id);
  }

  invalidate(tenantId: string): void {
    this.cache.delete(tenantId);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

## File: apps/server/src/engine/events/types.ts
```typescript
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
  // EVENTS_V2 Ã¢â‚¬â€ business graph, policy, state machine, agent runtime, context.
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
  "board.created", "card.created", "card.moved", "card.archived",  "verification.executed",
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
```

## File: apps/server/src/engine/events/sinks/store.ts
```typescript
import type { Store } from "../../../db.ts";
import type { TenantScopedStore } from "../../../db-tenant.ts";
import type {
  EventAggregate,
  EventFilter,
  EventQuery,
  EventSink,
  SystemEvent,
  SystemEventType,
} from "../types.ts";

const KIND = "system-events";
const HARD_LIMIT = 200;

/**
 * StoreSink: unico sink de escritura hoy. Append-only estricto:
 * usa insertIfAbsent, nunca put ni remove. La purga es un job aparte
 * (EventBus.purge, llamado desde maintain).
 */
export class StoreSink implements EventSink {
  constructor(private readonly db: Store | TenantScopedStore) {}

  async write(event: SystemEvent): Promise<void> {
    // El aislamiento por tenant lo compone el db que se inyecta (TenantScopedStore).
    // Aqui solo se escribe bajo owner plano; si el db es un Store crudo, el bus
    // sigue funcionando igual que antes del multitenant.
    await this.db.insertIfAbsent(
      event.owner,
      KIND,
      event as unknown as { id: string },
    );
  }
}

/**
 * StoreQuery: lectura. Separada del sink porque manana KafkaSink no
 * puede implementar "list con filtro" sin un consumer group efimero.
 * Hoy resuelve con SQL nativo sobre records.
 */
export class StoreQuery implements EventQuery {
  constructor(private readonly db: Store | TenantScopedStore) {}

  // EVENTS_RECENT_SQL_V1 - filtros en SQL cuando el backend los soporta.
  async recent(owner: string, filter: EventFilter): Promise<SystemEvent[]> {
    const limit = Math.min(filter.limit ?? 100, HARD_LIMIT);
    const types = filter.type
      ? Array.isArray(filter.type)
        ? filter.type
        : [filter.type]
      : undefined;
    const selectFn = (this.db as unknown as {
      select?: <T>(sql: string, params: unknown[]) => Promise<T[]>;
    }).select;
    if (typeof selectFn === "function") {
      try {
        const params: unknown[] = [owner, KIND];
        let sql = "SELECT data FROM records WHERE owner = $1 AND kind = $2";
        if (filter.since) { params.push(filter.since); sql += ` AND (data->>'emittedAt') >= $${params.length}`; }
        if (filter.until) { params.push(filter.until); sql += ` AND (data->>'emittedAt') <= $${params.length}`; }
        if (filter.sourceId) { params.push(filter.sourceId); sql += ` AND (data->'source'->>'id') = $${params.length}`; }
        if (filter.projectId) { params.push(filter.projectId); sql += ` AND (data->'payload'->>'projectId') = $${params.length}`; }
        if (types && types.length > 0) {
          params.push(types);
          sql += ` AND (data->>'type') = ANY($${params.length}::text[])`;
        }
        params.push(limit);
        sql += ` ORDER BY (data->>'emittedAt') DESC, id DESC LIMIT $${params.length}`;
        const rows = await selectFn<{ data: SystemEvent }>(sql, params);
        return rows.map((r) => r.data);
      } catch {
        // Fallback al filtrado en memoria si el SQL no esta soportado.
      }
    }
    const rows = await this.db.list<SystemEvent>(owner, KIND);
    return rows
      .filter((event) => {
        if (types && !types.includes(event.type)) return false;
        if (filter.since && event.emittedAt < filter.since) return false;
        if (filter.until && event.emittedAt > filter.until) return false;
        if (filter.sourceId && event.source.id !== filter.sourceId) return false;
        if (filter.projectId && event.payload?.projectId !== filter.projectId) return false;
        if (filter.sinceId && event.id <= filter.sinceId) return false;
        return true;
      })
      .sort((a, b) => b.emittedAt.localeCompare(a.emittedAt) || b.id.localeCompare(a.id))
      .slice(0, limit);
  }

  async aggregate(owner: string, hours: number): Promise<EventAggregate[]> {
    const since = new Date(Date.now() - hours * 3600000).toISOString();
    // BUS_AGGREGATE_SQL_V1 - antes traia 5000 eventos a memoria y contaba en
    // JS. Con miles de eventos por hora, el agregado mentia (se truncaba) y
    // la query era pesada. Ahora agrupamos en SQL con GROUP BY. El Store
    // expone `select` para queries arbitrarias de lectura.
    try {
      const rows = await this.db.select<{ type: string; count: number }>(
        `SELECT data->>'type' AS type, count(*)::int AS count
           FROM records
          WHERE owner = $1 AND kind = $2 AND (data->>'emittedAt') >= $3
          GROUP BY data->>'type'
          ORDER BY count DESC`,
        [owner, KIND, since],
      );
      return rows.map((row) => ({ type: row.type as SystemEventType, count: row.count }));
    } catch {
      // Fallback al comportamiento previo si select falla (p. ej. PGlite sin
      // soporte para GROUP BY sobre jsonb). Mantiene la funcionalidad.
      const rows = await this.db.list<SystemEvent>(owner, KIND, { limit: 5000 });
      const counts = new Map<SystemEventType, number>();
      for (const event of rows) {
        if (event.emittedAt < since) continue;
        counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
      }
      return [...counts]
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);
    }
  }
}
```

## File: apps/server/src/engine/events/bus.ts
```typescript
import { createHash } from "node:crypto";
import type { Store } from "../../db.ts";
import type { TenantScopedStore } from "../../db-tenant.ts";
import { backgroundFailure } from "../../log.ts";
import { payloadSchemas } from "./schemas.ts";
// EVENTBUS_SCHEMA_REGISTRY_V1 - registry consultable.
import { SchemaRegistry } from "./schema-registry.ts";
export const globalSchemaRegistry = new SchemaRegistry();
for (const [t, s] of Object.entries(payloadSchemas)) {
  try { globalSchemaRegistry.register({ type: t as SystemEventType, version: "1.0", schema: s }); } catch { /* ya registrado */ }
}
import { StoreQuery, StoreSink } from "./sinks/store.ts";
import type {
  EventAggregate,
  EventFilter,
  EventQuery,
  EventSink,
  SystemEvent,
  SystemEventSource,
  SystemEventType,
} from "./types.ts";
import { ulid } from "./ulid.ts";
import { globalSubscribers } from "./subscriber.ts";

const KIND = "system-events";
const DEDUPE_KIND = "dedupe-state";
// EVENTBUS_DEDUPE_TTL_V1 - TTL configurable.
const DEDUPE_TTL_MS = Number(process.env.EVENTBUS_DEDUPE_TTL_MS ?? "60000") || 60_000;
// EVENTBUS_DEDUPE_LRU_V1 - LRU configurable.
const DEDUPE_MAX_ENTRIES = Number(process.env.EVENTBUS_DEDUPE_LRU ?? "64") || 64;

export interface EmitOptions {
  correlationId?: string;
  causationId?: string;
  /**
   * EVENTBUS_DEDUPE_KEY_V1 - clave de deduplicacion explicita.
   *
   * Si se pasa, el bus deduplica: dos emisiones con la misma clave en la
   * ventana de 60s solo escriben la primera. Los emisores de RUIDO
   * (reintentos, estados que cambian repetidamente) la pasan.
   *
   * Si NO se pasa, el bus NO deduplica. Los emisores FACTUALES
   * (entity.updated, entity.created, relation.created) no la pasan,
   * porque cada emision es un hecho nuevo y no debe descartarse.
   *
   * Antes de esto, el bus deduplicaba siempre con
   * `${owner}:${type}:${source.kind}:${source.id}`. Eso descartaba el
   * segundo entity.updated del mismo cliente en 60s, corrompiendo el
   * event log factual.
   */
  dedupeKey?: string;
  /** MULTI_TENANT_V1 - tenantId. Si no se pasa, se usa owner. */
  tenantId?: string;
  notify?: { title: string; body: string; key: string };
}

interface DedupeState {
  id: string;
  seen: { key: string; at: number }[];
}

export class EventBus {
  private readonly inMemory = new Map<string, number>();
  constructor(
    private readonly db: Store | TenantScopedStore,
    private readonly sink: EventSink = new StoreSink(db),
    private readonly query: EventQuery = new StoreQuery(db),
  ) {}

  async emit<T extends Record<string, unknown>>(
    owner: string,
    type: SystemEventType,
    source: SystemEventSource,
    payload: T,
    options: EmitOptions = {},
  ): Promise<void> {
    try {
      const schema = payloadSchemas[type];
      const parsed = schema.parse(payload) as T;
      // EVENTBUS_DEDUPE_KEY_V1 - solo deduplicamos si el emisor lo pide.
      // Sin dedupeKey explicita, cada emision es un hecho nuevo.
      // EVENTBUS_DEDUPE_OWNER_FIX_V1 - antes pasabamos `${owner}:${dedupeKey}`
      // como owner a isDuplicate, lo cual creaba una fila por cada dedupeKey
      // distinta y rompia el LRU compartido entre procesos. Ahora pasamos
      // el owner real y la key por separado.
      if (options.dedupeKey !== undefined) {
        if (await this.isDuplicate(owner, options.dedupeKey)) return;
      }
      // EVENTBUS_CTX_FALLBACK_V1 - hereda correlationId/causationId si no vienen.
      const logCtx = (await import("../../log.ts")).logContext.getStore();
      const finalCorrelationId = options.correlationId ?? logCtx?.correlationId;
      const finalCausationId = options.causationId;
      const event: SystemEvent<T> = {
        id: ulid(),
        schemaVersion: "1.0",
        tenantId: options.tenantId ?? owner,
        owner,
        type,
        emittedAt: new Date().toISOString(),
        source,
        ...(finalCorrelationId ? { correlationId: finalCorrelationId } : {}),
        ...(finalCausationId ? { causationId: finalCausationId } : {}),
        payload: parsed,
      };
      await this.sink.write(event);
      // EVENTS_BUS_PUBLISH_V1 â€” publicar a subscribers en vivo (SSE, mÃ©tricas).
      // Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Sin SSE").
      globalSubscribers.publish(event);
      // EVENTBUS_DEDUPE_KEY_V1 - solo registramos la clave si se paso explicitamente.
      if (options.dedupeKey !== undefined) {
        // EVENTBUS_DEDUPE_OWNER_FIX_V1 - mismo fix: owner real, key separada.
        await this.recordDedupe(owner, options.dedupeKey);
      }
      if (options.notify) {
        // BUS_NOTIFY_PREFS_V1 - antes el bus escribia siempre en
        // notifications, ignorando las preferencias del usuario en
        // notification-prefs. Ahora consultamos prefs y, si el tipo esta
        // deshabilitado, no escribimos la notificacion. El evento sigue
        // emitiendose al bus por si otros consumidores lo quieren.
        const prefs = await this.db
          .get<{ disabled: string[] }>(owner, "notification-prefs", "default")
          .catch(() => null);
        const disabled = prefs?.disabled ?? [];
        if (!disabled.includes(type)) {
          await this.db.insertIfAbsent(owner, "notifications", {
            id: createHash("sha256").update(options.notify.key).digest("hex"),
            taskId: source.kind === "task" ? source.id : undefined,
            title: options.notify.title.slice(0, 200),
            body: options.notify.body.slice(0, 2000),
            createdAt: event.emittedAt,
            read: false,
          });
        }
      }
    } catch (error) {
      // EVENTBUS_ERROR_METRIC_V1 - contador de errores.
      import("../../metrics/registry.ts")
        .then(({ globalMetrics }) => { globalMetrics.inc("event_bus_errors_total", { type }); })
        .catch(() => {});
      backgroundFailure(`event emit ${type}`, error);
    }
  }

  async list(owner: string, filter: EventFilter = {}): Promise<SystemEvent[]> {
    return this.query.recent(owner, filter);
  }

  async aggregate(owner: string, hours = 24): Promise<EventAggregate[]> {
    return this.query.aggregate(owner, hours);
  }

  async purge(days = 90): Promise<number> {
    return this.db.purgeOlderThan(KIND, days);
  }

  private async isDuplicate(owner: string, key: string): Promise<boolean> {
    const now = Date.now();
    // DEDUPE_DB_FIRST â€” consultamos la DB ANTES que el Map en memoria para que
    // multiples procesos compartan el dedupe. El Map es solo cache de lectura.
    const state = await this.db.get<DedupeState>(owner, DEDUPE_KIND, "lru");
    if (state) {
      const hit = state.seen.find((entry) => entry.key === key && now - entry.at < DEDUPE_TTL_MS);
      if (hit) {
        this.inMemory.set(key, now);
        return true;
      }
    }
    const cached = this.inMemory.get(key);
    return Boolean(cached && now - cached < DEDUPE_TTL_MS);
  }

  private async recordDedupe(owner: string, key: string): Promise<void> {
    const now = Date.now();
    this.inMemory.set(key, now);
    if (this.inMemory.size > DEDUPE_MAX_ENTRIES) {
      const oldest = [...this.inMemory.entries()].sort((a, b) => a[1] - b[1])[0];
      if (oldest) this.inMemory.delete(oldest[0]);
    }
    // EVENTBUS_DEDUPE_CAS_FIX_V1 - antes leiamos + modificabamos + escribiamos
    // sin CAS. Dos emisiones concurrentes con la misma key se pisaban. Ahora
    // reintentamos con CAS sobre el `seen` actual hasta 3 veces.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const state = await this.db.get<DedupeState>(owner, DEDUPE_KIND, "lru");
      const seen = state?.seen ?? [];
      const filtered = seen.filter((entry) => now - entry.at < DEDUPE_TTL_MS);
      if (filtered.some((entry) => entry.key === key)) return;
      filtered.push({ key, at: now });
      const trimmed = filtered.slice(-DEDUPE_MAX_ENTRIES);
      if (!state) {
        const inserted = await this.db.insertIfAbsent(owner, DEDUPE_KIND, {
          id: "lru",
          seen: trimmed,
        } as { id: string } & Record<string, unknown>);
        if (inserted) return;
        continue;
      }
      const updated = await this.db.compareAndSwap<DedupeState>(
        owner,
        DEDUPE_KIND,
        "lru",
        { id: "lru", seen: state.seen },
        { seen: trimmed },
      );
      if (updated) return;
    }
    backgroundFailure(
      `eventbus dedupe ${owner}/${key}`,
      new Error("No se pudo registrar la clave de deduplicacion tras 3 intentos"),
    );
  }
}
```

## File: apps/server/src/db.ts
```typescript
// PGVECTOR_MERGED_V1 - extension vector + columna embedding + ivfflat.
// R4a-db_APPLIED
import { mkdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import { backgroundFailure } from "./log.ts";

type Row = { data: Record<string, unknown>; updated_at?: unknown };
interface Database {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Row[] }>;
  close: () => Promise<void>;
}

export interface ListOptions {
  limit?: number;
  cursorUpdatedAt?: string;
  cursorId?: string;
}

export class Store {
  /** Que motor hay debajo: PGlite embebido o Postgres real via pg. Decide rutas de codigo. */
  readonly backend: "pglite" | "postgres";
  constructor(private readonly db: Database, backend: "pglite" | "postgres" = "pglite") {
    this.backend = backend;
  }

  /** true cuando el motor soporta pgvector (Postgres real, no PGlite). */
  get pgvectorReady(): boolean {
    return this.backend === "postgres" && Boolean((this.db as { pgvectorReady?: boolean }).pgvectorReady);
  }

  /**
   * SELECT arbitrario de solo lectura. Existe para lo que no cabe en get/list: detectar
   * extensiones de Postgres (pgvector) y ejecutar la busqueda vectorial en SQL. No usar
   * para escribir: el motor durable (leases, CAS, claim) sigue pasando por
   * put/compareAndSwap/take/claim para no saltarse sus invariantes.
   */
  async select<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.db.query(sql, params);
    return result.rows as unknown as T[];
  }

  /** Query cruda para casos donde el RAG necesita columnas fuera de data (embedding). */
  async rawQuery<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.db.query(sql, params);
    return result.rows as unknown as T[];
  }

  async get<T = Record<string, unknown>>(
    owner: string,
    kind: string,
    id: string,
  ): Promise<T | null> {
    const result = await this.db.query(
      "SELECT data FROM records WHERE owner=$1 AND kind=$2 AND id=$3",
      [owner, kind, id],
    );
    return (result.rows[0]?.data as T | undefined) ?? null;
  }
  /**
   * Backward compatible: without options, returns every record for the owner/kind.
   * With options.limit, caps results. With cursorUpdatedAt + cursorId, pages by
   * keyset (updated_at, id) descending. Callers can request a next page by passing
   * the last record updated_at / id pair. `updated_at` is not returned to the
   * caller here to keep the existing shape; page callers must read it themselves
   * if they need a cursor.
   */
  async list<T = Record<string, unknown>>(
    owner: string,
    kind: string,
    options: ListOptions = {},
  ): Promise<T[]> {
    const params: unknown[] = [owner, kind];
    let sql = "SELECT data FROM records WHERE owner=$1 AND kind=$2";
    if (options.cursorUpdatedAt !== undefined && options.cursorId !== undefined) {
      params.push(options.cursorUpdatedAt, options.cursorId);
      sql += ` AND (updated_at, id) < ($3::timestamptz, $4)`;
    }
    sql += " ORDER BY updated_at DESC, id";
    // LIST_HARD_LIMIT â€” sin options.limit, aplicamos 1000 filas como techo de seguridad.
    // Los callers que necesiten mas deben usar listPaged con cursor.
    const effectiveLimit = options.limit ?? 1000;
    params.push(effectiveLimit);
    sql += ` LIMIT $${params.length}`;
    const result = await this.db.query(sql, params);
    return result.rows.map((row) => row.data as T);
  }
  /**
   * Paged list that returns data plus its `updated_at`. Callers that need to build
   * a cursor for the next page should use this: pass the last row `updatedAt` as
   * `cursorUpdatedAt` and its data id as `cursorId` on the next call.
   */
  async listPaged<T = Record<string, unknown>>(
    owner: string,
    kind: string,
    options: ListOptions = {},
  ): Promise<{ data: T; updatedAt: string }[]> {
    const params: unknown[] = [owner, kind];
    let sql = "SELECT data, updated_at FROM records WHERE owner=$1 AND kind=$2";
    if (options.cursorUpdatedAt !== undefined && options.cursorId !== undefined) {
      params.push(options.cursorUpdatedAt, options.cursorId);
      sql += ` AND (updated_at, id) < ($3::timestamptz, $4)`;
    }
    sql += " ORDER BY updated_at DESC, id";
    if (options.limit !== undefined) {
      params.push(options.limit);
      sql += ` LIMIT $${params.length}`;
    }
    const result = await this.db.query(sql, params);
    return result.rows.map((row) => ({
      data: row.data as T,
      updatedAt:
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : typeof row.updated_at === "string"
            ? row.updated_at
            : "",
    }));
  }
  /** Cuenta las filas de un owner/kind sin traerlas a memoria. */
  async count(owner: string, kind: string): Promise<number> {
    const result = await this.db.query(
      "SELECT count(*)::int AS total FROM records WHERE owner=$1 AND kind=$2",
      [owner, kind],
    );
    const total = (result.rows[0] as unknown as { total?: unknown } | undefined)?.total;
    if (typeof total === "number") return total;
    const parsed = Number(total);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  async put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T> {
    await this.db.query(
      "INSERT INTO records(owner,kind,id,data) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT(owner,kind,id) DO UPDATE SET data=excluded.data,updated_at=now()",
      [owner, kind, value.id, JSON.stringify(value)],
    );
    return value;
  }
  async remove(owner: string, kind: string, id: string): Promise<void> {
    await this.db.query("DELETE FROM records WHERE owner=$1 AND kind=$2 AND id=$3", [
      owner,
      kind,
      id,
    ]);
  }
  async compareAndSwap<T>(
    owner: string,
    kind: string,
    id: string,
    expected: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Promise<T | null> {
    const result = await this.db.query(
      "UPDATE records SET data=data || $5::jsonb,updated_at=now() WHERE owner=$1 AND kind=$2 AND id=$3 AND data @> $4::jsonb RETURNING data",
      [owner, kind, id, JSON.stringify(expected), JSON.stringify(patch)],
    );
    return (result.rows[0]?.data as T | undefined) ?? null;
  }
  async insertIfAbsent<T extends { id: string }>(
    owner: string,
    kind: string,
    value: T,
  ): Promise<T | null> {
    const result = await this.db.query(
      "INSERT INTO records(owner,kind,id,data) VALUES($1,$2,$3,$4::jsonb) ON CONFLICT DO NOTHING RETURNING data",
      [owner, kind, value.id, JSON.stringify(value)],
    );
    return (result.rows[0]?.data as T | undefined) ?? null;
  }
  /**
   * Scan de records por kind. `limit` opcional (default 1000, hard cap 50000):
   * antes no habia tope y un scan en maintain cargaba toda la tabla en memoria.
   */
  async scan<T>(kind: string, limit = 1000): Promise<{ owner: string; value: T }[]> {
    const effective = Math.min(Math.max(1, Math.floor(limit)), 50000);
    const result = await this.db.query(
      "SELECT jsonb_build_object('owner',owner,'value',data) AS data FROM records WHERE kind=$1 ORDER BY updated_at ASC LIMIT $2",
      [kind, effective],
    );
    return result.rows.map((row) => row.data as { owner: string; value: T });
  }
  /**
   * Filter scan by one or more statuses. Backed by an index-friendly query.
   * Intended for maintenance loops that must not scan the whole table.
   */
  async scanByStatus<T>(
    kind: string,
    statuses: string[],
    limit = 1000,
  ): Promise<{ owner: string; value: T }[]> {
    if (!statuses.length) return [];
    // SCAN_STATUS_IN â€” IN con lista literal usa el indice de expresion mejor que ANY.
    const placeholders = statuses.map((_, i) => `$${i + 2}`).join(",");
    const result = await this.db.query(
      `SELECT jsonb_build_object('owner',owner,'value',data) AS data FROM records WHERE kind=$1 AND data->>'status' IN (${placeholders}) ORDER BY updated_at ASC LIMIT $${statuses.length + 2}`,
      [kind, ...statuses, limit],
    );
    return result.rows.map((row) => row.data as { owner: string; value: T });
  }

  /**
   * STORE_SCAN_BY_OWNER_PREFIX_V1 - variante de scan que filtra por prefijo
   * de owner en SQL. Lo usa TenantScopedStore para no traer filas de otros
   * tenants. El prefijo se pasa ya compuesto (por ejemplo "tenant-1:").
   * Defensa: solo acepta prefijos sin caracteres de escape LIKE salvo el
   * propio ":". Si el prefijo contiene "%" o "_" los escapamos.
   */
  async scanByOwnerPrefix<T>(
    kind: string,
    ownerPrefix: string,
    limit = 1000,
  ): Promise<{ owner: string; value: T }[]> {
    const effective = Math.min(Math.max(1, Math.floor(limit)), 50000);
    const escaped = ownerPrefix.replace(/[%_]/g, (m) => "\\" + m);
    const result = await this.db.query(
      "SELECT jsonb_build_object('owner',owner,'value',data) AS data FROM records WHERE kind=$1 AND owner LIKE $2 ESCAPE '\\\\' ORDER BY updated_at ASC LIMIT $3",
      [kind, escaped + "%", effective],
    );
    return result.rows.map((row) => row.data as { owner: string; value: T });
  }

  /**
   * SCAN_BY_STATUS_CURSOR_V1 - variante con cursor keyset (updated_at, id).
   * Devuelve hasta `limit` filas cuya updated_at es > cursorUpdatedAt.
   */
  async scanByStatusWithCursor<T>(
    kind: string,
    statuses: string[],
    limit: number,
    cursorUpdatedAt?: string,
    cursorId?: string,
  ): Promise<{ owner: string; value: T; updatedAt: string; id: string }[]> {
    if (!statuses.length) return [];
    const params: unknown[] = [kind, ...statuses];
    const placeholders = statuses.map((_, i) => `$${i + 2}`).join(",");
    let sql = `SELECT jsonb_build_object('owner',owner,'value',data) AS data, updated_at, id FROM records WHERE kind=$1 AND data->>'status' IN (${placeholders})`;
    if (cursorUpdatedAt && cursorId) {
      params.push(cursorUpdatedAt, cursorId);
      sql += ` AND (updated_at, id) > ($${params.length - 1}::timestamptz, $${params.length})`;
    }
    sql += ` ORDER BY updated_at ASC, id ASC LIMIT $${params.length + 1}`;
    params.push(limit);
    const result = await this.db.query(sql, params);
    return result.rows.map((row) => {
      const value = row.data as { owner: string; value: T };
      const updatedAtRaw = (row as unknown as { updated_at: unknown }).updated_at;
      const idRaw = (row as unknown as { id: unknown }).id;
      return {
        owner: value.owner,
        value: value.value,
        updatedAt:
          updatedAtRaw instanceof Date
            ? updatedAtRaw.toISOString()
            : typeof updatedAtRaw === "string"
              ? updatedAtRaw
              : "",
        id: typeof idRaw === "string" ? idRaw : "",
      };
    });
  }
  /**
   * Delete records of the given kind whose updated_at is older than `days`.
   * Returns the number of deleted rows.
   */
  async purgeOlderThan(kind: string, days: number): Promise<number> {
    const result = await this.db.query(
      "DELETE FROM records WHERE kind=$1 AND updated_at < now() - ($2 || ' days')::interval RETURNING id",
      [kind, String(days)],
    );
    return result.rows.length;
  }
  /**
   * TRANSACTION_V1 - ejecuta varias operaciones dentro de una transaccion.
   *
   * PGlite y pg soportan BEGIN/COMMIT/ROLLBACK. El callback recibe this para
   * que pueda usar put/get/cas sin cambiar de API. No se anida: si necesitas
   * dos transacciones, secuencialas.
   *
   * Uso:
   *   await db.transaction(async (tx) => {
   *     await tx.put(owner, "goals", goal);
   *     await tx.put(owner, "tasks", task);
   *   });
   *
   * Si el callback lanza, se hace ROLLBACK y el error se propaga.
   */
  // FIX_TX_GUARD_V1 - guard contra transaccion anidada. Antes dos BEGIN
  // seguidos reventaban Postgres con "there is already a transaction in
  // progress". Si ya estamos en transaccion, el callback corre sin BEGIN.
  private inTransaction = false;
  async transaction<T>(fn: (tx: Store) => Promise<T>): Promise<T> {
    if (this.inTransaction) return fn(this);
    const raw = this.db as { query: (sql: string, params?: unknown[]) => Promise<unknown> };
    await raw.query("BEGIN");
    this.inTransaction = true;
    try {
      const result = await fn(this);
      await raw.query("COMMIT");
      return result;
    } catch (error) {
      try { await raw.query("ROLLBACK"); } catch { /* rollback best-effort */ }
      throw error;
    } finally {
      this.inTransaction = false;
    }
  }

  async claim<T>(owner: string, id: string, status: string, now: string): Promise<T | null> {
    const result = await this.db.query(
      `UPDATE records AS action SET data=jsonb_set(data,'\{status\}',$4::jsonb),updated_at=now()
       WHERE owner=$1 AND kind='actions' AND id=$2 AND data->>'status'='awaiting_review'
       AND (data->>'expiresAt')::timestamptz>$3::timestamptz
       AND ($4::jsonb <> '"executing"'::jsonb OR data->>'taskId' IS NULL OR EXISTS (
         SELECT 1 FROM records task WHERE task.owner=action.owner AND task.kind='tasks'
         AND task.id=action.data->>'taskId' AND task.data->>'status' IN ('running','waiting_approval')
       )) RETURNING data`,
      [owner, id, now, JSON.stringify(status)],
    );
    return (result.rows[0]?.data as T | undefined) ?? null;
  }
  async recoverInterruptedActions(): Promise<void> {
    await this.db.query(
      `UPDATE records SET data=data || '{"status":"outcome_unknown","error":"Server restarted during execution. Check the provider before creating another action."}'::jsonb WHERE kind='actions' AND data->>'status'='executing'`,
    );
  }
  async take<T>(owner: string, kind: string, id: string): Promise<T | null> {
    const result = await this.db.query(
      "DELETE FROM records WHERE owner=$1 AND kind=$2 AND id=$3 RETURNING data",
      [owner, kind, id],
    );
    return (result.rows[0]?.data as T | undefined) ?? null;
  }
  close(): Promise<void> {
    return this.db.close();
  }
  async updateCredential(owner: string, connectionId: string, secret: string): Promise<boolean> {
    const result = await this.db.query(
      "UPDATE records SET data=jsonb_set(data,'\{secret\}',$3::jsonb),updated_at=now() WHERE owner=$1 AND kind='credentials' AND id='google' AND data->>'connectionId'=$2 RETURNING data",
      [owner, connectionId, JSON.stringify(secret)],
    );
    return result.rows.length === 1;
  }
}

/** Idle clients can be disconnected by a database restart; without a listener pg `error` event crashes the process. */
export function createPool(connectionString: string) {
  const pool = new pg.Pool({ connectionString, max: 5 });
  pool.on("error", (error) => backgroundFailure("postgres pool", error));
  return pool;
}

export async function createStore(
  options: { dataDir?: string; databaseUrl?: string } = {},
): Promise<Store> {
  let database: Database;
  if (options.databaseUrl) {
    const pool = createPool(options.databaseUrl);
    database = { query: async (sql, params) => pool.query(sql, params), close: () => pool.end() };
  } else {
    // El directorio que guarda los datos es options.dataDir, no su padre: con
    // dataDir=".openmuse/postgres" un dirname() creaba ".openmuse" y dejaba el
    // PGDATA sin restringir. Ahi viven los hashes de contrasena.
    if (options.dataDir) await mkdir(options.dataDir, { recursive: true, mode: 0o700 });
    const embedded = new PGlite(options.dataDir);
    await embedded.waitReady;
    database = {
      query: (sql, params) => embedded.query<Row>(sql, params),
      close: () => embedded.close(),
    };
  }
  await database.query(
    "CREATE TABLE IF NOT EXISTS records(owner text NOT NULL,kind text NOT NULL,id text NOT NULL,data jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(owner,kind,id))",
  );
  // STORE_TENANT_CLEANUP_V1 - el aislamiento por tenant se hace en
  // TenantScopedStore con clave compuesta `tenantId:owner`. La columna
  // tenant_id en records queda sin uso.

  await database.query(
    "CREATE INDEX IF NOT EXISTS records_owner_kind_updated_idx ON records(owner, kind, updated_at DESC, id DESC)"
  );
  await database.query(
    "CREATE INDEX IF NOT EXISTS records_kind_status_idx ON records(kind, (data->>'status'))"
  );
  // INDEX_CONCURRENTLY â€” Postgres real: fuera de transaccion para no bloquear escrituras.
  // PGlite ignora CONCURRENTLY pero no se queja porque no hay transaccion envolvente.
  if (options.databaseUrl) {
    try {
      await database.query(
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS records_kind_updated_idx ON records(kind, updated_at)"
      );
      await database.query("ANALYZE records");
    } catch { /* el indice puede existir ya, o el rol no tiene permiso */ }
  } else {
    await database.query(
      "CREATE INDEX IF NOT EXISTS records_kind_updated_idx ON records(kind, updated_at)"
    );
  }
  await database.query(
    "CREATE INDEX IF NOT EXISTS records_system_events_idx ON records(owner, kind, ((data->>'type')), updated_at DESC)"
  );
  // EVENTS_INDEX_AGG_V1 â€” Ã­ndice para agregados GROUP BY type.
  // Ver: docs/audits/08-bus-de-eventos/miniaudit.md ("Faltan Ã­ndices para agregados").
  await database.query(
    "CREATE INDEX IF NOT EXISTS records_system_events_type_ts_idx ON records(kind, ((data->>'type')), updated_at DESC) WHERE kind = 'system-events'"
  );
  // EVENTS_INDEX_AGG_V1 â€” Ã­ndice por source.kind para snapshots.
  await database.query(
    "CREATE INDEX IF NOT EXISTS records_system_events_source_idx ON records(kind, ((data->'source'->>'kind')), updated_at DESC) WHERE kind = 'system-events'"
  );
  // STORE_INDICES_V2 - indices para el equipo digital y builds.
  await database.query(
    "CREATE INDEX IF NOT EXISTS records_agent_roles_active_idx ON records(owner, kind, ((data->>'active'))) WHERE kind = 'agent-roles'"
  );
  await database.query(
    "CREATE INDEX IF NOT EXISTS records_day_plans_date_idx ON records(owner, kind, ((data->>'date'))) WHERE kind = 'day-plans'"
  );
  await database.query(
    "CREATE INDEX IF NOT EXISTS records_build_status_idx ON records(owner, kind, ((data->>'status'))) WHERE kind = 'build-specs'"
  );
  await database.query(
    "CREATE INDEX IF NOT EXISTS records_tasks_role_idx ON records(owner, kind, ((data->'state'->>'roleId'))) WHERE kind = 'tasks'"
  );

  let pgvectorReady = false;
  if (options.databaseUrl) {
    try {
      await database.query("CREATE EXTENSION IF NOT EXISTS vector");
      await database.query("ALTER TABLE records ADD COLUMN IF NOT EXISTS embedding vector(768)");
      await database.query(
        "CREATE INDEX IF NOT EXISTS records_embedding_idx ON records USING hnsw (embedding vector_cosine_ops)"
      );
      pgvectorReady = true;
    } catch {
      pgvectorReady = false;
    }
  }
  (database as { pgvectorReady?: boolean }).pgvectorReady = pgvectorReady;
  return new Store(database, options.databaseUrl ? "postgres" : "pglite");
}
```

## File: apps/server/src/app.ts
```typescript
// EVENTBUS_APP_WIRE_V1
import { randomUUID, timingSafeEqual } from "node:crypto";
import { getConnInfo } from "@hono/node-server/conninfo";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MessageSchema } from "@ag-ui/core";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono, type Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { z } from "zod";
import { emailDraftSchema, proposalSchema } from "../../../packages/domain/src/index.ts";
import { ActionService } from "./actions.ts";
import { agentConfigured, makeRuntime } from "./agent.ts";
import { createAuth } from "./auth.ts";
// APP_TENANT_DB_V1 - envuelve el store con aislamiento por tenant.
import { TenantScopedStore } from "./db-tenant.ts";
import { BrowserService } from "./browser.ts";
import { ComputerService, type DockerRunner } from "./computer.ts";
import { computerRoutes } from "./computer-routes.ts";
import type { Config } from "./config.ts";
import type { Store } from "./db.ts";
import { agentRoutes } from "./engine/routes.ts";
import { skillsRoutes } from "./skills/routes.ts";
import { sopRoutes } from "./skills/sop-routes.ts";
import { AgentService } from "./engine/service.ts";
import { EventBus } from "./engine/events/index.ts";
import { eventsRoutes } from "./events-routes.ts";
import { AppError } from "./errors.ts";
import { RateLimiter } from "./rate-limit.ts";
import { requestLogger } from "./middleware/request-logger.ts";
import { logContext } from "./log.ts";
import { Files } from "./files.ts";
import { GoogleAuth } from "./google-auth.ts";
import { WorkspaceService } from "./workspace.ts";
import { UserService } from "./users.ts";
import { authRoutes } from "./auth-routes.ts";
import { RagService } from "./engine/rag.ts";
import { ragRoutes } from "./rag-routes.ts";
import { threadRoutes } from "./threads-routes.ts";
import { projectRoutes } from "./projects-routes.ts";
import { PersonaRegistry, bootstrapPersonas } from "./engine/agents/personas/index.ts";
import { personasRoutes } from "./engine/agents/personas/routes.ts";
import {
  Kernel,
  EnvTenantConfigResolver,
  StoreTurnStore,
  StoreAuditStore,
  // SERVICE_TENANT_RESOLVER_WIRE_V1 - adapter que delega en TenantService.
  ServiceTenantResolver,
} from "./kernel/index.ts";
// REFACTOR_REMOVE_DEFAULT_RESOLVER_V1 - DefaultTenantResolver ya no se usa aqui.
// ENGINE_TENANT_V1 - punto unico de resolucion de tenant.
import { TenantService } from "./engine/tenant.ts";

export async function createApp(
  db: Store,
  config: Config,
  options: { docker?: DockerRunner } = {},
) {
  // SERVICE_TENANT_DB_V2 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â creamos primero TenantService y tdb, luego el
// resto de servicios con tdb. Antes se construÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­an con `db` crudo, asÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­ que
// Files/Rag/Workspace escribÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­an con clave plana mientras el resto leÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a
// con clave `tenantId:owner`. Los artifacts no aparecÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­an en agent.detail().
  // Ver: docs/KNOWN_ISSUES.md FASE0_DEBT_FILES_TDB_V1 y
  // docs/audits/07-aislamiento-multi-tenant/miniaudit.md.
  const tenantServiceEarly = new TenantService(db, config);
  const tdbEarly = new TenantScopedStore(db, (owner) => tenantServiceEarly.tenantIdFor(owner));
  const auth = await createAuth(db, config),
    files = new Files(tdbEarly, config, auth),
    google = new GoogleAuth(db, config),
    users = new UserService(db),
    rag = new RagService(tdbEarly),
    workspace = new WorkspaceService(tdbEarly, config, files, google, rag);
  // APP_TENANT_DB_V1 - store con aislamiento por tenant. Se crea antes que el bus
  // porque el bus tambien escribe bajo este store y debe componer la clave de tenant.
  // SERVICE_TENANT_DB_V2 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â reutilizamos los creados arriba.
  const tenantService = tenantServiceEarly;
  const tdb = tdbEarly;
  // PERSONAS_WIRE_V1 - registry de personas del tenant. Se carga al arrancar
  // desde clientes/<tenant>/personas/*.json. Fail-soft: si un JSON no valida,
  // ese se salta.
  const personaRegistry = new PersonaRegistry();
  {
    const clientsDir = process.env.OPENMUSE_CLIENTS_DIR ?? "clientes";
    // LAIA_BOOTSTRAP_EXAMPLE_V1 - carga tambien el tenant _example para que
    // Laia (que vive ahi) entre en el registry bajo "default".
    void Promise.all([
      bootstrapPersonas(personaRegistry, "default", clientsDir),
      bootstrapPersonas(personaRegistry, "default", "clientes/_example"),
    ]).then(([r1, r2]) => {
      const loaded = r1.loaded + r2.loaded;
      const failed = r1.failed + r2.failed;
      if (loaded > 0 || failed > 0) {
        console.log(`[personas] tenant default: ${loaded} cargadas, ${failed} fallidas`);
      }
    }).catch(() => {});
  }
  // BUSINESS_OS_FIXED_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â bus declarado antes de los servicios que lo usan.
  const bus = new EventBus(tdb);
  // POLICY_EARLY_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â policy se necesita antes del ActionService, asi que se instancia aqui.
  const { PolicyEngine: PolicyEngineEarly } = await import("./engine/policy/engine.ts");
  const policy = new PolicyEngineEarly(bus);
  const actions = new ActionService(db, {
    execute: (owner, input, connectionId, targetVersion) =>
      workspace.execute(owner, input, connectionId, targetVersion),
    prepare: (owner, input, connectionId) => workspace.prepare(owner, input, connectionId),
    connected: (owner) => workspace.connected(owner),
    connection: (owner) => workspace.connection(owner),
  }, bus, policy);
  const browser = new BrowserService(db, config, auth, files);
  const { BusinessGraph } = await import("./engine/business/graph.ts");
  const { BusinessTruth } = await import("./engine/business/truth.ts");
  const { PolicyEngine } = await import("./engine/policy/engine.ts");
  const { StateMachineEngine } = await import("./engine/policy/state-machine.ts");
  const { ContextEngine } = await import("./engine/context/engine.ts");
  const { AgentRuntimeManager } = await import("./engine/agents/runtime.ts");
  const { AgentGovernance } = await import("./engine/agents/governance.ts");
  const { WorkspaceRegistry } = await import("./engine/workspace/registry.ts");
  const { SkillMarketplace } = await import("./engine/skills/marketplace.ts");
  const { MemoryService } = await import("./engine/memory.ts");
  const { StateMachineRegistry } = await import("./engine/state-machines.ts");
  const graph = new BusinessGraph(db, bus);
  const truth = new BusinessTruth(graph);
  // policy ya se creo arriba (POLICY_EARLY_V1).
  const stateMachine = new StateMachineEngine(bus, {
    getStatus: async (owner, entityId) => (await graph.getEntity(owner, entityId))?.status,
  });
  const agentRuntime = new AgentRuntimeManager(bus);
  // RUNTIME_SWEEP_WIRE_V1 - cablea AgentRuntimeManager.sweep (RUNTIME_SWEEP_V1):
  // cada 60s cierra runtimes activos con mas de 5 min sin completarse.
  const runtimeSweepTimer = setInterval(() => {
    void agentRuntime.sweep().catch(() => {});
  }, 60_000);
  runtimeSweepTimer.unref?.();
  const governance = new AgentGovernance(policy, bus);
  const workspaceRegistry = new WorkspaceRegistry();
  const marketplace = new SkillMarketplace(db);
  const memory = new MemoryService(db, rag);
  const context = new ContextEngine(db, graph, memory, bus);
  const stateMachines = new StateMachineRegistry(db, stateMachine, bus);
  const computer = new ComputerService(db, config, options.docker);
  // KERNEL_WIRE_B_V1 - kernel cognitivo.
  //
  // Stores:
  //   - Sin DATABASE_URL: in-memory (dev, tests, single-process).
  //   - Con DATABASE_URL: StoreTurnStore + StoreAuditStore persistentes.
  //     Esto es lo que necesita SOC-2 en produccion.
  //
  // El adapter StorePort mapea Store a la interfaz que esperan los stores
  // del kernel. Asi el kernel no depende de la firma exacta de Store.
  const usePersistentKernel = Boolean(config.databaseUrl);
  const storePort = usePersistentKernel
    ? {
        put: async (tenantId: string, kind: string, _id: string, data: unknown) => {
          await db.put(tenantId, kind, data as { id: string });
        },
        get: async (tenantId: string, kind: string, id: string) => {
          return db.get(tenantId, kind, id);
        },
        list: async (tenantId: string, kind: string, limit: number) => {
          const rows = await db.listPaged<unknown>(tenantId, kind, { limit });
          return rows.map((row) => ({ id: (row.data as { id: string }).id, data: row.data }));
        },
        transaction: async <T>(fn: (tx: never) => Promise<T>): Promise<T> =>
          db.transaction(() => fn(storePort as never)),
      }
    : null;
  // KERNEL_STORE_ALWAYS_V1 - antes el kernel usaba InMemoryTurnStore cuando
  // no habia DATABASE_URL. Eso hacia que en dev/test/sample todo el trabajo
  // del kernel (turnos, thoughts, audit) se perdiera al reiniciar, y que la
  // vision de "kernel persistente" fuera falsa. Ahora SIEMPRE StoreTurnStore
  // apoyado en el mismo Store que el resto del sistema. InMemoryTurnStore
  // queda solo para tests que lo instancian a mano.
  const persistentStorePort = storePort ?? {
    put: async (tenantId: string, kind: string, _id: string, data: unknown) => {
      await db.put(tenantId, kind, data as { id: string });
    },
    get: async (tenantId: string, kind: string, id: string) => db.get(tenantId, kind, id),
    list: async (tenantId: string, kind: string, limit: number) => {
      const rows = await db.listPaged<unknown>(tenantId, kind, { limit });
      return rows.map((row) => ({ id: (row.data as { id: string }).id, data: row.data }));
    },
    transaction: async <T>(fn: (tx: never) => Promise<T>): Promise<T> =>
      db.transaction(() => fn(persistentStorePort as never)),
  };
  const kernel = new Kernel({
    store: new StoreTurnStore(persistentStorePort),
    // SERVICE_TENANT_RESOLVER_WIRE_V1 - en vez de DefaultTenantResolver, usamos
    // ServiceTenantResolver que delega en TenantService. Sin esto, el kernel
    // ignoraba el tenantId del contexto y escribia todo en "default".
    tenants: new ServiceTenantResolver(tenantService),
    // AUDIT_STORE_ALWAYS_V1 - mismo razonamiento que KERNEL_STORE_ALWAYS_V1:
    // StoreAuditStore siempre. La cadena de hash se persiste.
    audit: new StoreAuditStore(db),
    config: new EnvTenantConfigResolver(),
  });
  const agent = new AgentService(
    tdb,
    config,
    workspace,
    files,
    actions,
    browser,
    computer,
    rag,
    undefined,
    bus,
    { graph, truth, policy, stateMachine, stateMachineRegistry: stateMachines, context, runtime: agentRuntime, governance, workspaceRegistry, marketplace, kernel, tenantService }, // APP_RUNTIME_WIRE_V1
  );
  // ONTOLOGY_VALIDATE_WIRE_V1 - valida el vocabulario del tenant contra el
  // metamodelo. Fail-soft: si falla, se loguea y se sigue.
  try {
    const { validateAgainstMetamodel } = await import("../../../packages/domain/src/ontology.ts");
    const { BASE_VOCABULARY } = await import("../../../packages/domain/src/ontology-seed.ts");
    const caps = await agent.capabilities.list();
    validateAgainstMetamodel({
      entityKinds: [],
      relationKinds: [],
      capabilityKinds: caps.map((c) => c.id),
      tenantScope: "default",
      baseVocabulary: BASE_VOCABULARY,
    });
    console.log(`[ontology] validado: ${caps.length} capabilities`);
  } catch (error) {
    console.warn("[ontology] validacion fallida:", error instanceof Error ? error.message : error);
  }

  // ONTOLOGY_BUNDLE_LOAD_V1 - bundle del tenant cargado al arrancar.
  try {
    const { readFile: readOntologyFile } = await import("node:fs/promises");
    const { join: joinOntology } = await import("node:path");
    // ONTOLOGY_BUNDLE_CLIENTSDIR_FIX_V1 - clientsDir vive en otro bloque; se recalcula aqui.
    const ontologyPath = joinOntology(process.env.OPENMUSE_CLIENTS_DIR ?? "clientes", "default", "ontology.json");
    const raw = await readOntologyFile(ontologyPath, "utf8").catch(() => null);
    if (raw) {
      const parsed = JSON.parse(raw);
      const { ontologyBundleSchema } = await import("../../../packages/domain/src/ontology.ts");
      ontologyBundleSchema.parse(parsed);
      console.log(`[ontology] bundle cargado: ${parsed.entities?.length ?? 0} entidades`);
    }
  } catch (error) {
    console.warn("[ontology] bundle no cargado:", error instanceof Error ? error.message : error);
  }

  const runtime = makeRuntime(config, agent, auth);
  const app = new Hono<{ Variables: { owner: string } }>();
  const origins = new Set([...config.allowedOrigins, new URL(config.publicUrl).origin]);
  /**
   * Prepara el workspace de un usuario ya autenticado. El sembrado de ejemplo vivia solo en
   * POST /api/session con el owner "local-user", asi que quien entraba por /api/auth/login
   * (owner = user.id) veia correo, calendario y acciones vacios. Es idempotente y memoizado
   * por owner dentro de WorkspaceService, asi que se puede llamar en cada login y en cada
   * carga del workspace sin coste repetido.
   */
  const ensureOwnerWorkspace = async (owner: string) => {
    await workspace.ensureSample(owner, actions);
    await agent.ensure(owner);
    if (config.mode === "sample") await agent.refreshIdeas(owner);
  };
  // REQUEST_LOGGER_WIRE_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â correlationId por request, logging estructurado.
  // Ver docs/audits/02-observabilidad/miniaudit.md ("Sin traceId").
  app.use("*", requestLogger());
  app.use("*", async (c, next) => {
    const origin = c.req.header("origin");
    if (origin && !origins.has(origin)) return c.json({ error: "Origin is not allowed" }, 403);
    c.header("X-Content-Type-Options", "nosniff");
    c.header("Referrer-Policy", "no-referrer");
    c.header("Cache-Control", "no-store");
    await next();
  });
  app.use(
    "*",
    cors({
      origin: (origin) => (origins.has(origin) ? origin : undefined),
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    }),
  );
  app.use(
    "*",
    bodyLimit({
      maxSize: 12 * 1024 * 1024,
      onError: (c) => c.json({ error: "Request is too large; PDFs must be 10 MB or smaller" }, 413),
    }),
  );
  app.onError((error, c) => {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string> = {};
      for (const issue of error.issues) {
        const path = issue.path.map((p) => String(p)).join(".");
        if (path) {
          if (!fields[path]) fields[path] = issue.message;
        } else if (!fields._error) {
          fields._error = issue.message;
        }
      }
      return c.json({ error: "Revisa los campos marcados", fields }, 422);
    }
    if (error instanceof AppError)
      return c.json(
        { error: error.message, ...(error.fields ? { fields: error.fields } : {}) },
        error.status,
      );
    if (error.name === "PdfError" || error.name === "RecurringEventError")
      return c.json({ error: error.message }, 422);
    if (error instanceof SyntaxError) return c.json({ error: "Invalid request data" }, 400);
    console.error(`[OpenMuse] ${error.name}`);
    return c.json(
      {
        error:
          error.name === "GoogleApiError"
            ? error.message
            : "Request failed. Check the server setup and try again.",
      },
      502,
    );
  });
  app.post("/api/whatsapp/incoming", async (c) => {
    const expected = process.env.WHATSAPP_WEBHOOK_TOKEN;
    if (!expected) throw new AppError("WhatsApp webhook no esta configurado", 503);
    const provided = c.req.header("apikey") ?? c.req.header("authorization")?.replace(/^Bearer /, "");
    // WHATSAPP_RATE_LIMIT ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â timingSafeEqual + rate limit por IP.
    const expectedBuf = Buffer.from(expected);
    const providedBuf = Buffer.from(provided ?? "");
    if (providedBuf.length !== expectedBuf.length || !timingSafeEqual(providedBuf, expectedBuf))
      throw new AppError("Unauthorized", 401);
    const waLimiter = (globalThis as { __waLimiter?: RateLimiter }).__waLimiter ??= new RateLimiter(30, 60000);
    const waAddress = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    if (!waLimiter.take(waAddress).allowed)
      throw new AppError("Too many webhook calls", 429);
    const body = await c.req.json().catch(() => ({}));
    const data = (body as { data?: { key?: { id?: string; remoteJid?: string }; message?: { conversation?: string } } }).data;
    const id = data?.key?.id;
    const from = data?.key?.remoteJid;
    const text = data?.message?.conversation;
    if (!id || !from || !text) return c.json({ ok: true, ignored: true });
    const { retryWithBackoff } = await import("./engine/retry.ts");
    await retryWithBackoff(() => db.put("system", "whatsapp-incoming", {
      id,
      from,
      text: text.slice(0, 4000),
      receivedAt: new Date().toISOString(),
    }), { maxAttempts: 3, baseMs: 200, maxMs: 2000 });
    return c.json({ ok: true });
  });
  // R16 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â healthcheck profundo: comprueba DB (lectura + escritura idempotente),
  // que el bus pueda emitir, y el estado del worker. Devuelve 503 si algo falla,
  // para que Fly/Render sepan cuando reiniciar de verdad.
  app.get("/api/health-deep", async (c) => {
    // HEALTH_DEEP_V2
    const checks: Record<string, unknown> = { ok: true, backend: db.backend, time: new Date().toISOString() };
    // KERNEL_LIFECYCLE_WIRE_V1 - consulta el ciclo de vida del kernel.
    try {
      const { checkKernelHealth } = await import("./kernel/lifecycle.ts");
      const report = await checkKernelHealth(kernel);
      checks.kernelHealth = report;
      if (report.health === "unavailable") checks.ok = false;
    } catch (error) {
      checks.kernelHealth = { health: "unknown", error: error instanceof Error ? error.message : "unknown" };
    }
    try { checks.kernel = (kernel.deps.store as { constructor?: { name?: string } }).constructor?.name ?? "unknown"; } catch { checks.kernel = "error"; }
    try { checks.db = (await db.list("system","sessions",{limit:1})) ? "ok" : "empty"; } catch (e: unknown){ checks.db = e instanceof Error ? e.message : "error"; checks.ok = false; }
    // HEALTH_DEEP_V2 - checks adicionales.
    try {
      checks.worker = agent.worker.running;
      checks.tenantService = Boolean(agent.tenantService);
      checks.kernel = Boolean(agent.kernel);
      checks.capabilities = (await agent.capabilities.list()).length;
      checks.guardrails = Boolean(agent.guardrails);
      checks.metrics = Boolean(agent.metrics);
      // HEALTH_METRICS_V1 - conteo por tenant del worker.
      checks.tenants = typeof (agent as unknown as { tenantService?: unknown }).tenantService === "object" ? "wired" : "absent";
    } catch (e: unknown) {
      checks.internal = e instanceof Error ? e.message : "error";
      checks.ok = false;
    }
    return c.json(checks, checks.ok ? 200 : 500);
  });
app.get("/api/health", async (c) => {
    const checks: Record<string, boolean> = {};
    try {
      await db.put("system", "health", { id: "ping", at: new Date().toISOString() });
      const ping = await db.get<{ at: string }>("system", "health", "ping");
      checks.database = Boolean(ping);
    } catch {
      checks.database = false;
    }
    try {
      await bus.emit("system", "system.startup", { kind: "system", id: "health" }, { mode: config.mode });
      checks.bus = true;
    } catch {
      checks.bus = false;
    }
    checks.worker = true;
    checks.agentConfigured = agentConfigured(config);
    checks.browserConfigured = Boolean(config.workerUrl && config.workerToken);
    const ok = checks.database && checks.bus;
    return c.json(
      {
        ok,
        mode: config.mode,
        checks,
      },
      ok ? 200 : 503,
    );
  });
  // SESSION_RATE_LIMIT ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â rate limit por IP, no global. El RateLimiter ya existe en rate-limit.ts.
  const sessionLimiter = new RateLimiter(30, 60000);
  const sessionAddress = (c: Context) => {
    const fwd = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    if (fwd) return fwd;
    try { return getConnInfo(c as unknown as Context).remote.address ?? "local"; }
    catch { return "local"; }
  };
  app.post("/api/session", async (c) => {
    const verdict = sessionLimiter.take(sessionAddress(c));
    if (!verdict.allowed) {
      c.header("Retry-After", String(Math.max(1, Math.ceil(verdict.retryAfterMs / 1000))));
      throw new AppError("Too many sign-in attempts. Try again in a minute.", 429);
    }
    const body = z.object({ accessKey: z.string().optional() }).parse(await c.req.json());
    const session = await auth.session(body.accessKey);
    await ensureOwnerWorkspace("local-user");
    return c.json(session);
  });
  app.get("/api/google/callback", async (c) => {
    if (c.req.query("error"))
      return c.html("<h1>Google connection cancelled</h1><p>You can return to OpenMuse.</p>", 400);
    const state = c.req.query("state"),
      code = c.req.query("code");
    if (!state || !code) throw new AppError("Google callback is incomplete");
    await google.callback(state, code);
    return c.html(
      "<h1>Google is connected</h1><p>Return to OpenMuse and refresh your workspace.</p>",
    );
  });
  app.use("/api/*", async (c, next) => {
    if (c.req.path === "/api/auth/login" || c.req.path === "/api/auth/logout") {
      await next();
      return;
    }
    const signedRoute =
      /^\/api\/files\/[^/]+\/content$|^\/api\/browsers\/[^/]+\/(?:preview|console)$/.test(
        c.req.path,
      );
    const owner =
      signedRoute && c.req.query("signature")
        ? auth.verify(new URL(c.req.url))
        : await auth.owner(c.req.header("authorization"));
    c.set("owner", owner);
    // OWNER_LOG_CONTEXT_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â propaga owner al contexto de log del request.
    const current = logContext.getStore();
    if (current) {
      logContext.enterWith({ ...current, owner });
    }
    await next();
  });
  app.get("/api/workspace", async (c) => {
    const owner = c.get("owner");
    const snapshot = await workspace.snapshot(owner, c.req.query("q"));
    snapshot.browsers = snapshot.browsers.map((s) => browser.decorate(owner, s));
    return c.json(snapshot);
  });
  // BILLING_AFTER_AUTH ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â billing vive debajo del middleware de auth para que Stripe no quede abierto al mundo.
app.post("/api/billing/customer", async (c) => {
    const body = z.object({ email: z.email(), name: z.string().min(1).max(200) }).parse(await c.req.json());
    const { StripeClient } = await import("../../../packages/integrations/src/stubs/stripe.ts");
    const client = new StripeClient({ apiKey: config.stripeApiKey });
    return c.json(await client.createCustomer(body.email, body.name));
  });
  app.post("/api/billing/payment-link", async (c) => {
    const body = z
      .object({
        amountCents: z.number().int().positive().max(100_000_000),
        currency: z.string().regex(/^[a-z]{3}$/),
        description: z.string().min(1).max(200),
      })
      .parse(await c.req.json());
    const { StripeClient } = await import("../../../packages/integrations/src/stubs/stripe.ts");
    const client = new StripeClient({ apiKey: config.stripeApiKey });
    return c.json(await client.createPaymentLink(body.amountCents, body.currency, body.description));
  });
  app.get("/api/billing/invoices", async (c) => {
    const customerId = z.string().regex(/^cus_[A-Za-z0-9]+$/).parse(c.req.query("customerId"));
    const { StripeClient } = await import("../../../packages/integrations/src/stubs/stripe.ts");
    const client = new StripeClient({ apiKey: config.stripeApiKey });
    return c.json(await client.listInvoices(customerId));
  });

  app.route("/api/agent", agentRoutes(agent));
  app.route("/api/events", eventsRoutes(bus));
  app.route("/api/skills", skillsRoutes(db));
  app.route("/api/sops", sopRoutes(db, agent));
  app.route("/api/auth", authRoutes(db, users, { config, afterLogin: ensureOwnerWorkspace }, bus));
  // APP_SIGNUP_ROUTES_V1 - endpoints publicos de signup y verify.
  {
    const { signupRoutes } = await import("./auth-signup.ts");
    app.route("/api/auth", signupRoutes({ db, config, users, tenantService }));
  }
  app.route("/api/rag", ragRoutes(rag, db, files));
  app.route("/api/threads", threadRoutes(db));
  app.route("/api/projects", projectRoutes(db));
  // PERSONAS_WIRE_V1 - endpoints de personas del tenant.
  // APP_PERSONAS_KERNEL_V1 - pasa el kernel a personasRoutes.
  app.route("/api/agent-personas", personasRoutes({
    registry: personaRegistry,
    db,
    kernel,
    ...(tenantService ? { tenantService } : {}),
  }));
  app.route("/api/computer", computerRoutes(computer, files));
  // ADMIN_ROUTES_WIRE_V1 - endpoints de admin.
  {
    const { adminRoutes } = await import("./admin-routes.ts");
    app.route("/api/admin", adminRoutes(agent, users));
  }
  // APP_ADMIN_CLIENTS_V1 - panel maestro de clientes.
  {
    const { adminClientsRoutes } = await import("./admin-clients.ts");
    app.route("/api/admin/clients", adminClientsRoutes(agent, users));
  }
  // APP_METRICS_V1 - endpoint Prometheus.
  {
    const { metricsRoutes } = await import("./metrics-exporter.ts");
    app.route("/metrics", metricsRoutes(agent, users));
  }
  // APP_ADMIN_TENANTS_V1 - panel admin de tenants.
  {
    const { adminTenantsRoutes } = await import("./admin-tenants.ts");
    app.route("/api/admin/tenants", adminTenantsRoutes(agent, users));
  }
  // APP_NOTIF_STREAM_V1 - SSE de notificaciones.
  {
    const { notificationsStreamRoutes } = await import("./notifications-stream.ts");
    app.route("/api/notifications", notificationsStreamRoutes(agent));
  }
  // APP_NOTIF_PREFS_V1 - preferencias de notificaciones.
  {
    const { notificationPrefsRoutes } = await import("./notification-prefs.ts");
    app.route("/api/notifications", notificationPrefsRoutes(db));
  }
  // APP_FORM_ROUTES_V1 - formularios asistidos.
  {
    const { formRoutes } = await import("./form-routes.ts");
    app.route("/api/forms", formRoutes(agent));
  }
  // APP_INTEGRATIONS_V1 - WhatsApp, Stripe, GMB, Social.
  {
    const { whatsappRoutes } = await import("./whatsapp-routes.ts");
    app.route("/api/whatsapp", whatsappRoutes(agent));
    const { billingRoutes } = await import("./billing-routes.ts");
    app.route("/api/billing", billingRoutes(db));
    const { gmbRoutes } = await import("./gmb-routes.ts");
    app.route("/api/gmb", gmbRoutes(agent));
    const { socialRoutes } = await import("./social-routes.ts");
    app.route("/api/social", socialRoutes(agent));
  }
  // KERNEL_ROUTES_WIRE_V1 - endpoints de debug del kernel.
  {
    const { kernelRoutes } = await import("./kernel-routes.ts");
    // KERNEL_ROUTES_ADMIN_WIRE_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â pasa UserService para validaciÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n admin.
    // Ver: docs/audits/09-kernel-cognitivo/miniaudit.md.
    app.route("/api/kernel", kernelRoutes(kernel, users));
  }
  // APP_VIEWS_WIRE_V1 - endpoint publico de resolucion de vistas. Antes solo
  // estaba bajo /api/admin/views/resolve (requireAdmin) y el frontend llamaba
  // a /api/views/resolve, que no existia. Ahora el endpoint publico esta
  // cableado y usa la instancia del resolver del proceso.
  {
    const { viewsRoutes } = await import("./routes/views.ts");
    app.route("/api/views", viewsRoutes());
  }
  // BUSINESS_ROUTES_WIRE_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â rutas HTTP del Business Graph.
  const { businessRoutes } = await import("./business-routes.ts");
  app.route("/api/business", businessRoutes(graph, truth, workspaceRegistry, stateMachines));
  app.get("/api/calendars", async (c) => c.json(await workspace.calendars(c.get("owner"))));
  app.get("/api/calendar/events", async (c) => {
    const query = z
      .object({
        calendarId: z.string().min(1).max(1024).optional(),
        timeMin: z.iso.datetime({ offset: true }).optional(),
        timeMax: z.iso.datetime({ offset: true }).optional(),
      })
      .parse(c.req.query());
    if (
      query.timeMin &&
      query.timeMax &&
      (Date.parse(query.timeMax) <= Date.parse(query.timeMin) ||
        Date.parse(query.timeMax) - Date.parse(query.timeMin) > 366 * 86400000)
    )
      throw new AppError("Choose a calendar range between one moment and 366 days", 422);
    return c.json(await workspace.events(c.get("owner"), query));
  });
  app.get("/api/drive/files", async (c) => {
    const query = z.object({ q: z.string().trim().max(500).optional() }).parse(c.req.query());
    return c.json(await workspace.driveFiles(c.get("owner"), query.q));
  });
  app.get("/api/drive/files/:id/content", async (c) =>
    c.json(await workspace.readDriveFile(c.get("owner"), c.req.param("id"))),
  );
  app.get("/api/mail/threads/:id", async (c) =>
    c.json(await workspace.thread(c.get("owner"), c.req.param("id"))),
  );
  app.post("/api/actions", async (c) => {
    const input = proposalSchema.parse(await c.req.json());
    if (input.kind === "email.send")
      for (const id of input.data.attachmentIds) await files.get(c.get("owner"), id);
    return c.json(await actions.propose(c.get("owner"), input), 201);
  });
  app.post("/api/actions/:id/decide", async (c) => {
    const body = z
      .object({ hash: z.string(), decision: z.enum(["approve", "deny"]) })
      .parse(await c.req.json());
    return c.json(
      await actions.decide(c.get("owner"), c.req.param("id"), body.hash, body.decision),
    );
  });
  app.get("/api/drafts", async (c) => c.json(await db.list(c.get("owner"), "drafts")));
  app.post("/api/drafts", async (c) => {
    const body = emailDraftSchema.extend({ id: z.string().optional() }).parse(await c.req.json());
    const existing = body.id
      ? await db.get<{ createdAt: string }>(c.get("owner"), "drafts", body.id)
      : null;
    if (body.id && !existing) throw new AppError("Draft not found", 404);
    return c.json(
      await db.put(c.get("owner"), "drafts", {
        ...body,
        id: body.id ?? randomUUID(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      }),
      201,
    );
  });
  const ensureMainThreadId = async (owner: string) => {
    await db.insertIfAbsent(owner, "conversation-settings", { id: "main", threadId: randomUUID(), existing: false });
    const main = await db.get<{ threadId: string }>(owner, "conversation-settings", "main");
    if (!main) throw new AppError("Main conversation could not be loaded", 503);
    return main.threadId;
  };
  app.get("/api/main-thread", async (c) => {
    const owner = c.get("owner");
    const threadId = await ensureMainThreadId(owner);
    const created = await db.insertIfAbsent(owner, "conversations", {
      id: threadId,
      messages: [],
      createdAt: new Date().toISOString(),
    } as any);
    return c.json({ threadId, existing: !created });
  });
  app.get("/api/conversation", async (c) => {
    const owner = c.get("owner");
    const threadId = await ensureMainThreadId(owner);
    return c.json((await db.get(owner, "conversations", threadId)) ?? { id: threadId, messages: [] });
  });
  app.put("/api/conversation", async (c) => {
    const owner = c.get("owner");
    const threadId = await ensureMainThreadId(owner);
    const body = await c.req.json();
    const messages = z.array(z.unknown()).max(1000).parse(body.messages);
    for (const message of messages) MessageSchema.parse(message);
    await db.put(owner, "conversations", { id: threadId, messages });
    return c.json({ ok: true });
  });
  app.post("/api/files", async (c) => {
    const data = await c.req.parseBody();
    const file = data.file;
    if (!(file instanceof File)) throw new AppError("Choose a PDF file");
    return c.json(
      await files.import(
        c.get("owner"),
        file.name,
        new Uint8Array(await file.arrayBuffer()),
        "Uploaded by you",
        "default", // FALLBACK_TENANT_V1
      ),
      201,
    );
  });
  app.get("/api/files/:id/content", async (c) => {
    const file = await files.get(c.get("owner"), c.req.param("id"));
    c.header("Content-Type", file.mimeType);
    const disposition = file.mimeType.startsWith("image/") || file.mimeType === "application/pdf"
      ? "inline"
      : "attachment";
    c.header("Content-Disposition", `${disposition}; filename*=UTF-8'${encodeURIComponent(file.name)}`);
    return c.body(await files.bytes(c.get("owner"), file.id));
  });
  app.post("/api/files/:id/fill", async (c) => {
    const body = z
      .object({ fields: z.record(z.string(), z.union([z.string(), z.boolean()])) })
      .parse(await c.req.json());
    return c.json(await files.fill(c.get("owner"), c.req.param("id"), body.fields), 201);
  });
  app.post("/api/mail/import-attachment", async (c) => {
    const body = z.object({ reference: z.string() }).parse(await c.req.json());
    return c.json(await workspace.importAttachment(c.get("owner"), body.reference), 201);
  });
  app.post("/api/google/connect", async (c) => {
    const body = z.object({ capability: z.enum(["read", "write"]) }).parse(await c.req.json());
    if (config.mode === "sample") {
      await db.put(c.get("owner"), "settings", {
        id: "google",
        enabled: true,
        connectionId: randomUUID(),
      });
      return c.json({ url: null, connected: true });
    }
    return c.json(await google.connect(c.get("owner"), body.capability === "write"));
  });
  app.post("/api/google/disconnect", async (c) => {
    if (config.mode === "sample")
      await db.put(c.get("owner"), "settings", { id: "google", enabled: false });
    else await google.disconnect(c.get("owner"));
    return c.json({ ok: true });
  });
  app.get("/api/google/status", async (c) => {
    const owner = c.get("owner");
    const connection = await workspace.connection(owner);
    return c.json({
      connected: Boolean(connection),
      account: connection?.account ?? null,
      sample: config.mode === "sample",
      configured: config.mode === "sample" ? true : google.configured(),
    });
  });
  app.post("/api/browsers", async (c) => {
    const body = z.object({ url: z.url().max(4096) }).parse(await c.req.json());
    return c.json(await browser.create(c.get("owner"), body.url), 201);
  });
  app.get("/api/browsers/:id", async (c) => {
    const owner = c.get("owner");
    return c.json(browser.decorate(owner, await browser.get(owner, c.req.param("id"))));
  });
  app.post("/api/browsers/:id/navigate", async (c) => {
    const body = z.object({ url: z.url().max(4096) }).parse(await c.req.json());
    return c.json(await browser.navigate(c.get("owner"), c.req.param("id"), body.url));
  });
  app.post("/api/browsers/:id/close", async (c) =>
    c.json(await browser.close(c.get("owner"), c.req.param("id"))),
  );
  app.get("/api/browsers/:id/read", async (c) =>
    c.json(await browser.read(c.get("owner"), c.req.param("id"))),
  );
  app.post("/api/browsers/:id/reopen", async (c) => {
    const raw = await c.req.text();
    const body = z.object({ url: z.url().max(4096).optional() }).parse(raw ? JSON.parse(raw) : {});
    return c.json(await browser.reopen(c.get("owner"), c.req.param("id"), body.url));
  });
  app.post("/api/browsers/:id/import-downloads", async (c) =>
    c.json(await browser.imports(c.get("owner"), c.req.param("id"))),
  );
  app.get("/api/browsers/:id/preview", async (c) => {
    const response = await browser.preview(c.get("owner"), c.req.param("id"));
    c.header("Content-Type", "image/png");
    return c.body(await response.arrayBuffer());
  });
  app.get("/api/browsers/:id/console", async (c) => {
    await browser.get(c.get("owner"), c.req.param("id"));
    c.header(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' blob:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'",
    );
    return c.html(browser.console(c.get("owner"), c.req.param("id")));
  });
  app.post("/api/browsers/:id/console", async (c) => {
    await browser.input(c.get("owner"), c.req.param("id"), await c.req.json());
    return c.json({ ok: true });
  });
  app.all("/api/copilotkit/*", async (c) => {
    if (!agentConfigured(config))
      throw new AppError(
        "Configure a model and provider API key, or a valid AG-UI endpoint, to start chat",
        503,
      );
    const target = new URL(c.req.url);
    if (target.pathname.replace(/\/$/, "") === "/api/copilotkit/run")
      target.pathname = "/api/copilotkit/agent/default/run";
    const request = target.href === c.req.url ? c.req.raw : new Request(target, c.req.raw);
    const response = await runtime.fetch(request);
    const encoder = new TextEncoder();
    const body = response.body?.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(typeof chunk === "string" ? encoder.encode(chunk) : chunk);
        },
      }),
    );
    return new Response(body, { status: response.status, headers: response.headers });
  });
  const here = dirname(fileURLToPath(import.meta.url));
  const webDist = [
    join(here, "../../../apps/web/dist"),
    join(here, "../../../../apps/web/dist"),
  ].find((dir) => existsSync(dir));
  if (webDist) app.use("/*", serveStatic({ root: webDist }));
  app.get("/", (c) =>
    c.json({ name: "OpenMuse", app: "http://localhost:8081", health: "/api/health" }),
  );
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminName = process.env.ADMIN_NAME?.trim() || "Admin";
  if (adminEmail && adminPassword) {
    await users.ensureAdmin(adminEmail, adminPassword, adminName);
  } else if ((await users.list()).length === 0) {
    console.warn(
      "[OpenMuse] No hay usuarios en la DB y faltan ADMIN_EMAIL/ADMIN_PASSWORD: POST /api/auth/login devolvera 401. Rellena ADMIN_EMAIL, ADMIN_PASSWORD y ADMIN_NAME en .env, o ejecuta `pnpm admin:create -- --email tu@empresa.com --password \"...\"`.",
    );
  }
  if (config.databaseUrl && !process.env.BUSINESS_DATABASE_URL?.trim())
    console.warn(
      "[OpenMuse] BUSINESS_DATABASE_URL no esta definido: los SOPs con la tool query_business ejecutan su SQL contra DATABASE_URL, que es la misma base de datos donde viven los datos de todos los owners. Apunta BUSINESS_DATABASE_URL a un rol de solo lectura (GRANT SELECT) en otra base de datos.",
    );

  return { app, auth, files, actions, workspace, agent, computer, users, bus };
}
// IMPORTS_BACKEND_FIXED ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â anadidos los imports que los bloques 2 y 46 no supieron inyectar.
```
