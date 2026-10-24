// WORKSPACE_MODULE_V1 — contrato de modulo de workspace.
// Cada uno de los 34 workspaces exporta un WorkspaceModule como entrada
// publica. El runtime lo descubre y lo registra.

import type { CapabilityDeclaration } from "./capability-declaration.ts";
import type { WorkspaceViewDeclaration } from "./workspace-view.ts";
import type {
  PublishedEvent,
  ConsumedEvent,
} from "./workspace-event.ts";
import type { WorkspaceContext } from "./workspace-context.ts";
import type {
  WorkspaceCommandEnvelope,
  CommandResult,
} from "./workspace-command.ts";
import type {
  WorkspaceQueryEnvelope,
  QueryResult,
} from "./workspace-query.ts";

// WORKSPACE_MODULE_COMMANDS_V1 - handlers reales por workspace.
// Interfaces estructurales: el paquete no depende de apps/server.
export interface WorkspaceStoreLike {
  get<T>(owner: string, kind: string, id: string): Promise<T | null>;
  put<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T>;
  list<T>(owner: string, kind: string, options?: { limit?: number }): Promise<T[]>;
  insertIfAbsent<T extends { id: string }>(owner: string, kind: string, value: T): Promise<T | null>;
  remove(owner: string, kind: string, id: string): Promise<void>;
}

export interface WorkspaceBusLike {
  emit(
    owner: string,
    type: string,
    source: { kind: string; id: string },
    payload: Record<string, unknown>,
    options?: {
      correlationId?: string;
      causationId?: string;
      dedupeKey?: string;
      tenantId?: string;
    },
  ): Promise<void>;
}

export interface WorkspaceServices {
  readonly db: WorkspaceStoreLike;
  readonly bus?: WorkspaceBusLike;
}

export interface WorkspaceCommandHandler {
  readonly commandId: string;
  readonly version: number;
  handle(
    services: WorkspaceServices,
    context: WorkspaceContext,
    envelope: WorkspaceCommandEnvelope,
  ): Promise<CommandResult>;
}

export interface WorkspaceQueryHandler {
  readonly queryId: string;
  readonly version: number;
  handle(
    services: WorkspaceServices,
    context: WorkspaceContext,
    envelope: WorkspaceQueryEnvelope,
  ): Promise<QueryResult<unknown>>;
}

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
  readonly commands: Readonly<Record<string, WorkspaceCommandHandler>>;
  readonly queries: Readonly<Record<string, WorkspaceQueryHandler>>;
}