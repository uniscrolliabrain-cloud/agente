# Encaje real en agente (lectura dirigida main, 2026-11-17)

## Evidencia observada
- apps/server/src/threads-routes.ts: endpoints thread, UUID, records threads y conversations, lectura, reemplazo PUT, CAS y locks/presence.
- apps/web/src/hooks/useThreads.ts: activeId se inicializa/persiste en localStorage con agente_active_thread.
- apps/web/src/hooks/useChat.ts: history se compone en React, se pasa al streamChat y luego saveThreadMessages escribe lista completa.
- apps/server/src/engine/conversation.ts: ConversationAgent, AG-UI/CopilotKit y AgentService.
- apps/server/src/google-auth.ts: GoogleConnection, tenantId, scopes, authorizer, cifrado vault, state OAuth, tenant scope.
- apps/web/src/api/conversation.ts: getOrCreateMainThread y /api/conversation coexistentes con API threads; reconciliar semánticas.
- apps/server/src/engine/events/bus.ts y types.ts: bus y tipos de eventos; aprovechar contratos.
- packages/workspaces/src/contracts/workspace-module.ts: 34 módulos; interfaces embebidas no requieren duplicarlos.
- apps/web/src/components/ChatPanel.tsx y App.tsx: superficies UI existentes.

## Riesgos de migración
Dos modelos de conversación (main-thread/conversation y threads), posibles estados divergentes; revisar callsites y ownership antes de modificar. Reemplazo de mensajes desde frontend no apto para concurrencia cross-surface. tenantId fallback 'default' en threads-routes; revisar fail-closed. Locks locales y header x-user-id deben endurecerse. GoogleAuth actualmente reúne scopes amplios de escritura; diseñar consent incremental granular. No se ha auditado exhaustivamente rama de trabajo ni ejecutado tests en esta revisión.

## Patchsets orientativos (sin aplicar)
A: packages/domain/src/conversation-sync.ts schemas Zod + fixtures.
B: apps/server/src/engine/conversation-sync/{active-thread,store,message-append,subscriptions,permissions,reconciliation}.ts.
C: migraciones DB: threads/messages/active_pointers/runs/context_refs, índices únicos y RLS.
D: apps/server/src/chat-universal-routes.ts y wiring de authz/tenant/policy.
E: apps/server/src/engine/conversation.ts integración de runId/threadId/context y persistencia servidor.
F: apps/web/src/hooks/useThreads.ts y useChat.ts consumir puntero remoto, eventos y append.
G: packages/embedded-chat/src cliente tipado independiente del host.
H: apps/integrations/google-workspace-addon y apps/integrations/microsoft365-addin (ubicaciones provisionales, evaluar repo hijo).
I: suites de contrato, E2E, multi-tenant, race conditions, reconexión y revisión de seguridad.

## Secuencia
Antes de escribir código: inventario real de rutas y almacenamiento; mapa de dependencias y migración compatible; tests baseline; ADR sobre semántica de active thread. No modificar core a ciegas ni añadir servicio de chat paralelo. Proponer PRs pequeños, sin merge/deploy automático.
