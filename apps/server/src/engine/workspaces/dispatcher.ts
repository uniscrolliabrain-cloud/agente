// WORKSPACES_DISPATCHER_V1 - resuelve y ejecuta commands y queries.
import type { WorkspaceModule, WorkspaceContext, WorkspaceCommandEnvelope, WorkspaceQueryEnvelope, WorkspaceServices, CommandResult, QueryResult } from "@openmuse/workspaces";

export class WorkspaceDispatcher {
  private readonly services: WorkspaceServices;
  constructor(services: WorkspaceServices) {
    this.services = services;
  }

  async dispatchCommand(
    module: WorkspaceModule,
    context: WorkspaceContext,
    envelope: WorkspaceCommandEnvelope,
  ): Promise<CommandResult> {
    const handler = module.commands[envelope.command];
    if (!handler) return { status: "rejected", reason: `Comando no registrado: ${envelope.command}` };
    return handler.handle(this.services, context, envelope);
  }

  async dispatchQuery(
    module: WorkspaceModule,
    context: WorkspaceContext,
    envelope: WorkspaceQueryEnvelope,
  ): Promise<QueryResult<unknown>> {
    const handler = module.queries[envelope.query];
    if (!handler) return { status: "empty", items: [], total: 0 };
    return handler.handle(this.services, context, envelope);
  }
}
