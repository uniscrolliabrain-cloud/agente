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
