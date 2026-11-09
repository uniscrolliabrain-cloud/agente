// WORKSPACE_GENERATOR_V1 - deriva WorkspaceSpec del BusinessSchema.
// WORKSPACE_SCHEMA_V1_WIRE_V1 - consume el metamodelo v1 (BusinessSchema,
// BusinessEntityDecl, BusinessRelationDecl) y los tipos de vista del
// workspace-spec en vez de formas inline.

import type { Store } from "../../db.ts";
import type {
  BusinessEntityDecl,
  BusinessRelationDecl,
  BusinessSchema,
} from "../../../../../packages/domain/src/business.ts";
import type {
  ViewKind,
  ViewSpec,
  WorkspaceSection,
  WorkspaceSpec,
} from "../../../../../packages/domain/src/workspace-spec.ts";

export class WorkspaceGenerator {
  constructor(private readonly db: Store) {}

  async generateForTenant(tenantId: string): Promise<WorkspaceSpec | null> {
    const schema = await this.db.get<BusinessSchema>(tenantId, "business-schemas", "default");
    if (!schema) return null;

    const sections: WorkspaceSection[] = [];
    let order = 0;
    for (const entity of schema.entities as BusinessEntityDecl[]) {
      const boardKind: ViewKind = "board";
      const tableKind: ViewKind = "table";
      sections.push({
        id: `board-${entity.type}`,
        label: entity.label,
        ...(entity.icon ? { icon: entity.icon } : {}),
        viewKind: boardKind,
        entityType: entity.type,
        order: order++,
      });
      sections.push({
        id: `table-${entity.type}`,
        label: `${entity.label} (tabla)`,
        viewKind: tableKind,
        entityType: entity.type,
        order: order++,
      });
    }

    // WORKSPACE_RELATIONS_VIEW_V1 - si el schema declara relaciones, el
    // workspace ofrece una vista de grafo; antes se ignoraban.
    const relations: BusinessRelationDecl[] = schema.relations ?? [];
    if (relations.length > 0) {
      const graphKind: ViewKind = "graph";
      sections.push({
        id: "graph-business",
        label: "Relaciones",
        viewKind: graphKind,
        order: order++,
      });
    }

    const views: ViewSpec[] = sections.map((section) => ({
      id: `view-${section.id}`,
      kind: section.viewKind,
      title: section.label,
      ...(section.icon ? { subtitle: section.icon } : {}),
      ...(section.entityType
        ? {
            dataSource: [
              {
                kind: "business-graph" as const,
                query: section.entityType,
                tenantId,
                bindings: {},
              },
            ],
          }
        : {}),
      provenance: { sectionId: section.id },
    }));

    return {
      id: `workspace-${tenantId}`,
      tenantId,
      title: "Workspace",
      sections,
      views,
      defaultView: "dashboard",
      createdAt: new Date().toISOString(),
    };
  }
}
