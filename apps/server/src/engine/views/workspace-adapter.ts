// WORKSPACE_VIEW_ADAPTER_V1 - traduce una declaracion de workspace y el
// resultado real de su query a ViewEnvelope. No inventa filas: si la query
// devuelve vacio, la vista queda vacia y la UI lo dice.
import type { QueryResult, WorkspaceViewDeclaration } from "@agente/workspaces";
import {
  parseRuntimeViewSpec,
  type RuntimeViewSpec,
} from "../../../../../packages/domain/src/views.ts";
import type { ViewEnvelope } from "../../../../../packages/domain/src/view-envelope.ts";

type Row = Record<string, unknown>;

function asRow(value: unknown): Row {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Row)
    : { value };
}

function humanize(key: string): string {
  const text = key.replace(/[_-]+/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : key;
}

function primitive(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function columnType(key: string, values: unknown[]): "text" | "number" | "date" | "chip" | "action" {
  if (/status|state|stage|priority/i.test(key)) return "chip";
  if (values.some((value) => typeof value === "number")) return "number";
  if (values.some((value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value))) {
    return "date";
  }
  return "text";
}

function tableColumns(rows: Row[]) {
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))].slice(0, 20);
  return keys.map((key) => ({
    key,
    label: humanize(key),
    type: columnType(key, rows.map((row) => row[key])),
    align: "left" as const,
  }));
}

function queueStatus(value: unknown): "pending" | "running" | "done" | "error" {
  const status = String(value ?? "").toLowerCase();
  if (/done|complete|closed|success|sent|paid/.test(status)) return "done";
  if (/error|fail|reject|blocked/.test(status)) return "error";
  if (/run|active|working|progress|open/.test(status)) return "running";
  return "pending";
}

function inboxPriority(value: unknown): "low" | "medium" | "high" {
  const priority = String(value ?? "").toLowerCase();
  if (/high|urgent|critical/.test(priority)) return "high";
  if (/low|minor/.test(priority)) return "low";
  return "medium";
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sin-estado";
}

function fieldType(key: string, value: unknown): "text" | "number" | "date" | "select" | "textarea" | "checkbox" {
  if (typeof value === "boolean") return "checkbox";
  if (typeof value === "number") return "number";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return "date";
  if (typeof value === "string" && value.length > 120) return "textarea";
  if (/status|state|stage|kind|type/i.test(key)) return "select";
  return "text";
}

function buildSpec(
  declaration: WorkspaceViewDeclaration,
  rows: Row[],
  result: QueryResult<unknown>,
): RuntimeViewSpec {
  switch (declaration.kind) {
    case "dashboard": {
      const total = result.total ?? rows.length;
      return {
        kind: "dashboard",
        title: declaration.title,
        kpis: [
          { label: "Elementos", value: total },
          { label: "Workspace", value: declaration.query },
        ],
      };
    }
    case "queue":
      return {
        kind: "queue",
        title: declaration.title,
        items: rows.slice(0, 50).map((row, index) => ({
          id: String(row.id ?? row.key ?? `item-${index}`),
          title: String(row.title ?? row.name ?? row.subject ?? `Elemento ${index + 1}`),
          ...(row.subtitle || row.description
            ? { subtitle: String(row.subtitle ?? row.description) }
            : {}),
          status: queueStatus(row.status ?? row.state),
          actions: [],
        })),
      };
    case "inbox":
      return {
        kind: "inbox",
        title: declaration.title,
        items: rows.slice(0, 50).map((row, index) => ({
          id: String(row.id ?? row.key ?? `item-${index}`),
          title: String(row.title ?? row.name ?? row.subject ?? `Elemento ${index + 1}`),
          ...(row.subtitle || row.description
            ? { subtitle: String(row.subtitle ?? row.description) }
            : {}),
          priority: inboxPriority(row.priority ?? row.urgency),
          actions: [],
        })),
      };
    case "board": {
      const statuses = [...new Set(rows.map((row) => String(row.status ?? row.state ?? "sin-estado")))].slice(0, 10);
      const columns = statuses.map((status) => ({
        id: slug(status),
        label: humanize(status),
        status,
      }));
      const cards = rows.slice(0, 200).map((row, index) => {
        const status = String(row.status ?? row.state ?? "sin-estado");
        return {
          id: String(row.id ?? row.key ?? `card-${index}`),
          columnId: slug(status),
          title: String(row.title ?? row.name ?? row.subject ?? `Elemento ${index + 1}`),
          ...(row.subtitle || row.description
            ? { subtitle: String(row.subtitle ?? row.description) }
            : {}),
          ...(row.updatedAt ? { updatedAt: String(row.updatedAt) } : {}),
        };
      });
      return { kind: "board", title: declaration.title, columns, cards };
    }
    case "detail": {
      const row = rows[0] ?? {};
      return {
        kind: "detail",
        title: declaration.title,
        properties: Object.entries(row).slice(0, 50).map(([key, value]) => ({
          key,
          label: humanize(key),
          value: primitive(value),
          provenance: "auto",
        })),
        relations: [],
      };
    }
    case "form": {
      const row = rows[0] ?? {};
      return {
        kind: "form",
        title: declaration.title,
        entityType: declaration.query,
        fields: Object.entries(row).slice(0, 50).map(([key, value]) => ({
          key,
          label: humanize(key),
          type: fieldType(key, value),
          required: false,
          ...(Array.isArray(value) && value.every((entry) => typeof entry === "string")
            ? { options: value as string[] }
            : {}),
          ...(typeof value === "object" && value !== null ? {} : { value }),
          provenance: "missing",
        })),
        submitLabel: "Guardar",
      };
    }
    case "table":
    case "timeline":
    case "graph":
    default:
      return {
        kind: "table",
        title: declaration.title,
        columns: tableColumns(rows),
        rows: rows.slice(0, 200),
      };
  }
}

export interface AdaptWorkspaceViewInput {
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly declaration: WorkspaceViewDeclaration;
  readonly result: QueryResult<unknown>;
  readonly entityId?: string;
  readonly now?: Date;
}

export function adaptWorkspaceView(input: AdaptWorkspaceViewInput): ViewEnvelope | null {
  const rows = input.result.items.map(asRow);
  const spec = parseRuntimeViewSpec(buildSpec(input.declaration, rows, input.result));
  if (!spec) return null;
  const generatedAt = (input.now ?? new Date()).toISOString();
  return {
    id: `${input.workspaceId}:${input.declaration.id}`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    spec,
    provenance: [
      {
        source: "workspace",
        ref: `${input.workspaceId}/${input.declaration.query}`,
        label: input.declaration.id,
        asOf: generatedAt,
      },
    ],
    freshness: { generatedAt, stale: false },
    permissions: { canView: true, canAct: [...input.declaration.actions] },
    source: {
      provider: "workspace",
      workspaceId: input.workspaceId,
      ...(input.entityId ? { entityId: input.entityId } : {}),
    },
    generatedAt,
  };
}
