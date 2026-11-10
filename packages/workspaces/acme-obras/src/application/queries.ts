// acme-obras - handlers de queries (E15).
// Leen del store con el tenant del contexto (readTenantRows), no del body y
// no de rutas de fichero. Cada handler devuelve las filas tal como estan en
// el store; el adapter es el que decide columnas y estados.
import { readTenantRows } from "../../../src/runtime/tenant-rows.ts";
import type {
  WorkspaceServices,
  WorkspaceContext,
  WorkspaceQueryEnvelope,
  WorkspaceQueryHandler,
  QueryResult,
} from "../../../src/contracts/index.ts";

const LIMITE = 200;

type Obra = {
  id: string;
  name?: string;
  status?: string;
  description?: string;
  clientId?: string;
  progressPct?: number;
  checklistDone?: number;
  checklistTotal?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type Tarea = {
  id: string;
  title?: string;
  status?: string;
  assignedTo?: string;
  clientId?: string;
  amountEur?: number;
  createdAt?: string;
  updatedAt?: string;
};

type Parte = {
  id: string;
  title?: string;
  kind?: string;
  summary?: string;
  taskId?: string;
  createdAt?: string;
};

function ordenar<T extends { updatedAt?: string; createdAt?: string }>(rows: T[]): T[] {
  return rows
    .slice()
    .sort((a, b) => String(b.updatedAt ?? b.createdAt ?? "").localeCompare(String(a.updatedAt ?? a.createdAt ?? "")));
}

function limiteDe(env: WorkspaceQueryEnvelope): number {
  return Math.min(env.limit || LIMITE, LIMITE);
}

async function leer<T>(services: WorkspaceServices, ctx: WorkspaceContext, kind: string, env: WorkspaceQueryEnvelope): Promise<T[]> {
  return readTenantRows<T>(services.db, ctx.tenantId, kind, limiteDe(env), ctx.owner);
}

function ok(rows: unknown[]): QueryResult<unknown> {
  return { status: rows.length > 0 ? "ok" : "empty", items: rows, total: rows.length };
}

async function resumen(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const obras = ordenar(await leer<Obra>(services, ctx, "projects", env));
  return ok(obras);
}

async function tablero(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const obras = ordenar(await leer<Obra>(services, ctx, "projects", env));
  return ok(
    obras.map((obra) => ({
      id: obra.id,
      title: obra.name ?? obra.id,
      status: obra.status ?? "sin-estado",
      subtitle: obra.description ?? "",
      progressPct: obra.progressPct ?? null,
      updatedAt: obra.updatedAt ?? obra.createdAt ?? null,
    })),
  );
}

async function tareas(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const rows = ordenar(await leer<Tarea>(services, ctx, "tasks", env));
  return ok(
    rows.map((tarea) => ({
      id: tarea.id,
      title: tarea.title ?? tarea.id,
      subtitle: tarea.assignedTo ?? "",
      status: tarea.status ?? "queued",
      updatedAt: tarea.updatedAt ?? tarea.createdAt ?? null,
    })),
  );
}

async function incidencias(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  // Incidencia = tarea que espera respuesta del cliente. Se filtra por el
  // campo `status` del store, no por palabras del titulo.
  const rows = ordenar(await leer<Tarea>(services, ctx, "tasks", env));
  const abiertas = rows.filter((tarea) => tarea.status === "waiting_input");
  return ok(
    abiertas.map((tarea) => ({
      id: tarea.id,
      title: tarea.title ?? tarea.id,
      subtitle: tarea.clientId ?? "",
      status: tarea.status,
      updatedAt: tarea.updatedAt ?? null,
    })),
  );
}

async function partes(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const rows = ordenar(await leer<Parte>(services, ctx, "agent-artifacts", env));
  return ok(
    rows.map((parte) => ({
      id: parte.id,
      title: parte.title ?? parte.id,
      kind: parte.kind ?? "",
      summary: parte.summary ?? "",
      taskId: parte.taskId ?? "",
      createdAt: parte.createdAt ?? null,
    })),
  );
}

async function detalle(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const entityId = typeof env.parameters.entityId === "string" ? env.parameters.entityId : undefined;
  const obras = await leer<Obra>(services, ctx, "projects", env);
  const obra = entityId ? obras.find((row) => row.id === entityId) : obras[0];
  return ok(obra ? [obra] : []);
}

async function parteNuevo(): Promise<QueryResult<unknown>> {
  // Un parte se redacta; no hay fila que precargar. La vista sale con el
  // formulario vacio en vez de con campos copiados de otra obra.
  return { status: "empty", items: [], total: 0 };
}

export const QUERIES = {
  "obras.resumen": { queryId: "obras.resumen", version: 1, handle: resumen },
  "obras.tablero": { queryId: "obras.tablero", version: 1, handle: tablero },
  "obras.tareas": { queryId: "obras.tareas", version: 1, handle: tareas },
  "obras.incidencias": { queryId: "obras.incidencias", version: 1, handle: incidencias },
  "obras.partes": { queryId: "obras.partes", version: 1, handle: partes },
  "obras.detalle": { queryId: "obras.detalle", version: 1, handle: detalle },
  "obras.parte-nuevo": { queryId: "obras.parte-nuevo", version: 1, handle: parteNuevo },
} satisfies Record<string, WorkspaceQueryHandler>;
