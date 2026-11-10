// acme-suministros - handlers de queries (E15).
// Acciones, documentos y avisos del tenant, leidos del store con scope.
import { readTenantRows } from "../../../src/runtime/tenant-rows.ts";
import type {
  WorkspaceServices,
  WorkspaceContext,
  WorkspaceQueryEnvelope,
  WorkspaceQueryHandler,
  QueryResult,
} from "../../../src/contracts/index.ts";

const LIMITE = 200;

type Accion = {
  id: string;
  title?: string;
  kind?: string;
  status?: string;
  amountEur?: number;
  executeAt?: string | null;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Documento = {
  id: string;
  name?: string;
  mimeType?: string;
  size?: number;
  pageCount?: number;
  source?: string;
  createdAt?: string;
};

type Aviso = {
  id: string;
  title?: string;
  body?: string;
  cta?: string;
  read?: boolean;
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
  return ok(ordenar(await leer<Accion>(services, ctx, "actions", env)));
}

async function pedidos(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const acciones = ordenar(await leer<Accion>(services, ctx, "actions", env));
  return ok(
    acciones.map((accion) => ({
      id: accion.id,
      title: accion.title ?? accion.id,
      status: accion.status ?? "sin-estado",
      subtitle: accion.kind ?? "",
      amountEur: accion.amountEur ?? null,
      updatedAt: accion.createdAt ?? null,
    })),
  );
}

async function aprobaciones(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  // Lo que espera decision humana o tiene fecha de ejecucion.
  const acciones = ordenar(await leer<Accion>(services, ctx, "actions", env));
  const pendientes = acciones.filter(
    (accion) => accion.status === "awaiting_review" || accion.status === "scheduled",
  );
  return ok(
    pendientes.map((accion) => ({
      id: accion.id,
      title: accion.title ?? accion.id,
      subtitle: accion.executeAt ? `Programada ${accion.executeAt}` : "Espera aprobacion",
      status: accion.status ?? "awaiting_review",
      amountEur: accion.amountEur ?? null,
    })),
  );
}

async function avisos(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const notificaciones = ordenar(await leer<Aviso>(services, ctx, "notifications", env));
  return ok(
    notificaciones.map((aviso) => ({
      id: aviso.id,
      title: aviso.title ?? aviso.id,
      subtitle: aviso.body ?? "",
      cta: aviso.cta ?? "",
      read: aviso.read === true,
      createdAt: aviso.createdAt ?? null,
    })),
  );
}

async function documentos(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const files = ordenar(await leer<Documento>(services, ctx, "files", env));
  return ok(
    files.map((documento) => ({
      id: documento.id,
      name: documento.name ?? documento.id,
      mimeType: documento.mimeType ?? "",
      size: documento.size ?? null,
      pageCount: documento.pageCount ?? null,
      source: documento.source ?? "",
      createdAt: documento.createdAt ?? null,
    })),
  );
}

async function ficha(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const entityId = typeof env.parameters.entityId === "string" ? env.parameters.entityId : undefined;
  const acciones = await leer<Accion>(services, ctx, "actions", env);
  const accion = entityId ? acciones.find((row) => row.id === entityId) : acciones[0];
  return ok(accion ? [accion] : []);
}

async function pedidoNuevo(): Promise<QueryResult<unknown>> {
  // Un pedido se redacta; no se precarga de otra accion.
  return { status: "empty", items: [], total: 0 };
}

export const QUERIES = {
  "suministros.resumen": { queryId: "suministros.resumen", version: 1, handle: resumen },
  "suministros.pedidos": { queryId: "suministros.pedidos", version: 1, handle: pedidos },
  "suministros.aprobaciones": { queryId: "suministros.aprobaciones", version: 1, handle: aprobaciones },
  "suministros.avisos": { queryId: "suministros.avisos", version: 1, handle: avisos },
  "suministros.documentos": { queryId: "suministros.documentos", version: 1, handle: documentos },
  "suministros.ficha": { queryId: "suministros.ficha", version: 1, handle: ficha },
  "suministros.pedido-nuevo": { queryId: "suministros.pedido-nuevo", version: 1, handle: pedidoNuevo },
} satisfies Record<string, WorkspaceQueryHandler>;
