// TENANT_ROWS_V1 - lectura de filas de un tenant para las vistas de workspace.
//
// El contrato WorkspaceStoreLike solo conoce `list(owner, kind)`, que devuelve
// lo que ese owner escribio. Una vista de empresa necesita ver lo del equipo
// (H25), y el Store con scope ya ofrece `scanByPrefix(kind, tenantId, limit)`
// con el mismo filtro SQL por prefijo que usan `leads.ts` y el bus de eventos.
//
// No se toca el contrato: el metodo se detecta de forma estructural (mismo
// patron que apps/server/src/engine/events/bus.ts). Si el store no lo expone
// (dobles de test, implementaciones antiguas) se cae a `list(owner, kind)`,
// que sigue estando limitado al tenant por la clave `${tenantId}:${owner}`.
//
// Aislamiento: el tenant lo pone el contexto resuelto por el middleware, nunca
// el cliente. Un tenantId vacio o con delimitador no se consulta.

export type TenantRow<T> = { owner: string; value: T };

type Scannable = {
  scanByPrefix?: <T>(
    kind: string,
    tenantId: string,
    limit?: number,
  ) => Promise<TenantRow<T>[]>;
};

type Listable = {
  list?: <T>(
    owner: string,
    kind: string,
    options?: { limit?: number },
  ) => Promise<T[]>;
};

export async function readTenantRows<T>(
  db: unknown,
  tenantId: string,
  kind: string,
  limit: number,
  owner: string,
): Promise<T[]> {
  if (!tenantId || tenantId.includes(":")) return [];
  const scannable = db as Scannable;
  if (typeof scannable.scanByPrefix === "function") {
    const rows = await scannable.scanByPrefix<T>(kind, tenantId, limit);
    return rows.map((row) => row.value);
  }
  const listable = db as Listable;
  if (typeof listable.list === "function") {
    return listable.list<T>(owner, kind, { limit });
  }
  return [];
}
