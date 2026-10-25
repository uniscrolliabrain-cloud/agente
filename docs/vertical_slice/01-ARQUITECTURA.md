# 01 — Arquitectura del vertical slice

## Qué es

Una agencia de IA (tú) que vende a sus clientes un asistente multi-canal que:

- Responde con la data de la empresa del cliente (chat + RAG).
- Captura y cualifica leads.
- Atiende por WhatsApp (texto + voz a texto).
- Atiende por teléfono (Twilio + Whisper + TTS).
- Agenda citas en Google Calendar.
- Ve email (Gmail) y responde.
- Consulta Drive (archivos + Sheets como CRM).

Cada cliente es un tenant. Tú compilas el tenant manualmente desde un template. El cliente entra con su Google OAuth. Supabase emite JWT con `tenant_id`. Tu backend aísla.

## Diagrama de flujo

```
Cliente (Google OAuth)
  → Supabase Auth (JWT con tenant_id)
  → Tu backend (verifyJwtMiddleware)
  → TenantService (resuelve tenant del JWT)
  → ConversationAgent / TaskWorker
  → SOP "responder_lead"
      → lead.search / lead.create (Workspace Leads)
      → appointment.create + prepare_event (Google Calendar)
      → prepare_whatsapp / prepare_email / TTS (canal)
      → create_briefing (resumen interno)
  → Outcome + evidence
  → UI (Leads, Citas, Conversaciones, Procesos)
```

## Componentes que usa (y ya existen)

| Componente | Fichero |
|---|---|
| Supabase Auth | `apps/server/src/engine/auth/jwt.ts` (verifyJwtMiddleware) |
| ActorService | `apps/server/src/engine/actors/service.ts` |
| TenantService | `apps/server/src/engine/tenant.ts` |
| TenantScopedStore | `apps/server/src/db-tenant.ts` |
| ConversationAgent | `apps/server/src/engine/conversation.ts` |
| TaskWorker | `apps/server/src/engine/worker.ts` |
| CapabilityRunner | `apps/server/src/engine/execution/capability-runner.ts` |
| Executor | `apps/server/src/engine/execution/executor.ts` |
| Orchestrator | `apps/server/src/engine/orchestrator/orchestrator.ts` |
| SOPExecutor | `apps/server/src/engine/sop-executor.ts` |
| SOPTriggerEvaluator | `apps/server/src/engine/sop-triggers.ts` |
| MemoryService | `apps/server/src/engine/memory.ts` |
| RagService | `apps/server/src/engine/rag.ts` |
| ContextEngine | `apps/server/src/engine/context/engine.ts` |
| LearningObserver | `apps/server/src/engine/learning/observer.ts` |
| AgentGovernance | `apps/server/src/engine/agents/governance.ts` |
| PolicyEngine + PDP + PEP | `apps/server/src/engine/authz/`, `engine/policy/` |
| Event bus | `apps/server/src/engine/events/` |
| WorkspaceModuleRegistry | `apps/server/src/engine/workspaces/registry.ts` |
| WorkspaceDispatcher | `apps/server/src/engine/workspaces/dispatcher.ts` |
| Bridge workspaces→capabilities | `apps/server/src/engine/workspaces/bridge.ts` |

## Componentes que hay que construir

| Componente | Qué hace | Fichero nuevo |
|---|---|---|
| `TenantBundle` | Schema Zod del bundle | `packages/domain/src/tenant-bundle.ts` |
| `validateBundle` | Valida el bundle + referencias | `apps/server/src/engine/compiler/validate-bundle.ts` |
| `compileBundle` | Parsea y compila el bundle | `apps/server/src/engine/compiler/compile-bundle.ts` |
| `bootstrapTenant` | Registra capabilities, agentes, SOPs, canales | `apps/server/src/engine/compiler/bootstrap-tenant.ts` |
| Workspace "Leads" | CRM mínimo (lead, contact, company, opportunity, appointment) | `packages/workspaces/src/leads/` |
| WhatsApp Cloud API | `sendMessage`, `markAsRead`, `downloadMedia`, `transcribeAudio` | `packages/integrations/src/whatsapp/cloud.ts` |
| Telephony (Twilio + Whisper + TTS) | Recibir llamada, transcribir, responder por voz | `packages/integrations/src/telephony/` |
| `query_business` con `source: "sheets"` | Leer Google Sheets como CRM | `apps/server/src/engine/business.ts` |
| SOP `responder_lead` | 8 pasos: recibir, buscar, crear, cualificar, agendar, responder, briefing, actualizar | `clientes/_template/sops/responder-lead.json` |
| UI Leads | Tabla + detalle de leads | `apps/web/src/workspaces/leads/LeadsWorkspace.tsx` |
| UI Citas | Calendario de citas | `apps/web/src/workspaces/leads/AppointmentsWorkspace.tsx` |
| UI Conversaciones | Chat + WhatsApp + teléfono unificados | `apps/web/src/components/ConversationsView.tsx` |
| UI Procesos | Lista SOPs + ejecutar + resultado | `apps/web/src/components/ProcessesView.tsx` |
| Stripe real | Suscripciones, cuotas | `packages/integrations/src/stripe/` |
| Supabase migrations | `user_tenants`, hook, RLS | `supabase/migrations/` |

## Lo que NO se construye (en este vertical slice)

- Compilador genérico de empresas (se hace después, con 2 clientes).
- Workforce completo (`Assignment`, `WorkSchedule`, `Flow`). `assignedTo` suficiente.
- Editor visual de pipelines. SOP declarativo suficiente.
- Los 8 E2E restantes. Solo 4 P0 + E2E del proceso del piloto.
- UI de 35 workspaces. Solo Leads, Citas, Conversaciones, Procesos.
- RLS activo. Capa de aplicación aísla por tenant. RLS para Fase B.