// WORKSPACE_GENERATOR_V1 - deriva WorkspaceSpec del BusinessSchema.

import type { Store } from "../../db.ts";
import type {
  WorkspaceSpec,
  WorkspaceSection,
} from "../../../../../packages/domain/src/workspace-spec.ts";

export class WorkspaceGenerator {
  constructor(private readonly db: Store) {}

  async generateForTenant(tenantId: string): Promise<WorkspaceSpec | null> {
    const schema = await this.db.get<{
      entities: Array<{ type: string; label: string; icon?: string }>;
    }>(tenantId, "business-schemas", "default");
    if (!schema) return null;

    const sections: WorkspaceSection[] = [];
    let order = 0;
    for (const entity of schema.entities) {
      sections.push({
        id: `board-${entity.type}`,
        label: entity.label,
        ...(entity.icon ? { icon: entity.icon } : {}),
        viewKind: "board",
        entityType: entity.type,
        order: order++,
      });
      sections.push({
        id: `table-${entity.type}`,
        label: `${entity.label} (tabla)`,
        viewKind: "table",
        entityType: entity.type,
        order: order++,
      });
    }

    return {
      id: `workspace-${tenantId}`,
      tenantId,
      title: "Workspace",
      sections,
      defaultView: "dashboard",
      createdAt: new Date().toISOString(),
    };
  }
}