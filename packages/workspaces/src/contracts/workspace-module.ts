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