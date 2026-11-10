// acme-clientes - handlers de queries (E15).
// Lecturas por tenant desde el store con scope: clientes, oportunidades,
// facturas, bandeja y ficha. Sin owner del body y sin ficheros.
import { readTenantRows } from "../../../src/runtime/tenant-rows.ts";
import type {
  WorkspaceServices,
  WorkspaceContext,
  WorkspaceQueryEnvelope,
  WorkspaceQueryHandler,
  QueryResult,
} from "../../../src/contracts/index.ts";

const LIMITE = 200;
const NEGOCIO = "business-records";

type Registro = {
  id: string;
  type?: string;
  name?: string;
  number?: string;
  domain?: string;
  status?: string;
  city?: string;
  monthlyFee?: number;
  amountEur?: number | null;
  nextStep?: string;
  detail?: string;
  clientId?: string;
  issuedAt?: string;
  dueAt?: string;
  updatedAt?: string;
  createdAt?: string;
};

type Mensaje = {
  id: string;
  from?: string;
  text?: string;
  accountId?: string;
  receivedAt?: string;
  status?: string;
};

function ordenar<T extends { updatedAt?: string; createdAt?: string; receivedAt?: string }>(rows: T[]): T[] {
  return rows
    .slice()
    .sort((a, b) =>
      String(b.updatedAt ?? b.receivedAt ?? b.createdAt ?? "").localeCompare(
        String(a.updatedAt ?? a.receivedAt ?? a.createdAt ?? ""),
      ),
    );
}

function limiteDe(env: WorkspaceQueryEnvelope): number {
  return Math.min(env.limit || LIMITE, LIMITE);
}

async function negocios(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope, type: string): Promise<Registro[]> {
  const rows = await readTenantRows<Registro>(services.db, ctx.tenantId, NEGOCIO, limiteDe(env), ctx.owner);
  return ordenar(rows.filter((row) => row.type === type));
}

function ok(rows: unknown[]): QueryResult<unknown> {
  return { status: rows.length > 0 ? "ok" : "empty", items: rows, total: rows.length };
}

async function resumen(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const [clientes, oportunidades, facturas] = await Promise.all([
    negocios(services, ctx, env, "client"),
    negocios(services, ctx, env, "lead"),
    negocios(services, ctx, env, "invoice"),
  ]);
  return ok([...clientes, ...oportunidades, ...facturas]);
}

async function oportunidades(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const leads = await negocios(services, ctx, env, "lead");
  return ok(
    leads.map((lead) => ({
      id: lead.id,
      title: lead.name ?? lead.id,
      status: lead.status ?? "sin-estado",
      subtitle: lead.domain ?? "",
      amountEur: lead.amountEur ?? null,
      nextStep: lead.nextStep ?? "",
      updatedAt: lead.updatedAt ?? null,
    })),
  );
}

async function facturas(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const rows = await negocios(services, ctx, env, "invoice");
  const pendientes = rows.filter((factura) => factura.status !== "cobrada");
  return ok(
    pendientes.map((factura) => ({
      id: factura.id,
      title: factura.number ?? factura.id,
      subtitle: `${factura.amountEur ?? 0} EUR · vence ${factura.dueAt ?? "-"}`,
      status: factura.status ?? "pendiente",
      amountEur: factura.amountEur ?? null,
      dueAt: factura.dueAt ?? null,
    })),
  );
}

async function bandeja(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const mensajes = ordenar(await readTenantRows<Mensaje>(services.db, ctx.tenantId, "whatsapp-inbox", limiteDe(env), ctx.owner));
  return ok(
    mensajes.map((mensaje) => ({
      id: mensaje.id,
      title: mensaje.text ?? mensaje.id,
      subtitle: mensaje.from ?? mensaje.accountId ?? "",
      status: mensaje.status ?? "received",
      receivedAt: mensaje.receivedAt ?? null,
    })),
  );
}

async function cartera(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  return ok(await negocios(services, ctx, env, "client"));
}

async function ficha(services: WorkspaceServices, ctx: WorkspaceContext, env: WorkspaceQueryEnvelope) {
  const entityId = typeof env.parameters.entityId === "string" ? env.parameters.entityId : undefined;
  const rows = await negocios(services, ctx, env, "client");
  const cliente = entityId ? rows.find((row) => row.id === entityId) : rows[0];
  return ok(cliente ? [cliente] : []);
}

async function alta(): Promise<QueryResult<unknown>> {
  // Alta de cliente: no hay fila previa que mostrar. Formulario vacio.
  return { status: "empty", items: [], total: 0 };
}

export const QUERIES = {
  "clientes.resumen": { queryId: "clientes.resumen", version: 1, handle: resumen },
  "clientes.oportunidades": { queryId: "clientes.oportunidades", version: 1, handle: oportunidades },
  "clientes.facturas": { queryId: "clientes.facturas", version: 1, handle: facturas },
  "clientes.bandeja": { queryId: "clientes.bandeja", version: 1, handle: bandeja },
  "clientes.cartera": { queryId: "clientes.cartera", version: 1, handle: cartera },
  "clientes.ficha": { queryId: "clientes.ficha", version: 1, handle: ficha },
  "clientes.alta": { queryId: "clientes.alta", version: 1, handle: alta },
} satisfies Record<string, WorkspaceQueryHandler>;
