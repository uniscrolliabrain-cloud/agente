import { z } from "zod";
import { createStore } from "../apps/server/src/db.ts";
import { TenantScopedStore } from "../apps/server/src/db-tenant.ts";
import { privacyRequestKind } from "../apps/server/src/privacy-routes.ts";
import type { PrivacyRequest } from "../packages/domain/src/privacy.ts";

const args = z
  .tuple([
    z
      .string()
      .min(1)
      .regex(/^[^:]+$/),
    z.enum(["list", "start", "answer"]),
  ])
  .rest(z.string())
  .parse(process.argv.slice(2));
const [tenant, action, ...details] = args;

if ((action === "list" && details.length !== 0) || (action !== "list" && details.length !== 2)) {
  throw new Error("Uso: privacy-review.ts <tenant> list | <tenant> start|answer <owner> <id>");
}

const db = await createStore({
  dataDir: process.env.DATA_DIR ?? ".agente",
  ...(process.env.DATABASE_URL ? { databaseUrl: process.env.DATABASE_URL } : {}),
});
try {
  const store = new TenantScopedStore(db, async () => tenant);
  if (action === "list") {
    const rows = await store.scanByPrefix<PrivacyRequest>(privacyRequestKind, tenant, 1000);
    // Los propietarios son identificadores internos. La salida pertenece al operador autorizado.
    process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
  } else {
    const owner = z.string().min(1).parse(details[0]);
    const id = z.uuid().parse(details[1]);
    const status = action === "start" ? "in_review" : "answered";
    const previous = action === "start" ? "received" : "in_review";
    const updated = await store.compareAndSwap<PrivacyRequest>(
      owner,
      privacyRequestKind,
      id,
      { status: previous },
      { status, updatedAt: new Date().toISOString() },
    );
    if (!updated) throw new Error("Solicitud no encontrada o transición inválida");
    process.stdout.write(`${JSON.stringify(updated)}\n`);
  }
} finally {
  await db.close();
}
