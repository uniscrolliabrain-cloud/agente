import { createStore } from "../apps/server/src/db.ts";
import { readConfig } from "../apps/server/src/config.ts";

// Development script: writes business records directly to the durable store.
// Run with the API stopped — PGlite is single-process.

const config = readConfig();
const db = await createStore({
  dataDir: `${config.dataDir}/postgres`,
  databaseUrl: config.databaseUrl,
});

const records: Record<string, unknown>[] = [
  { id: "lead-1", type: "lead", business: "Peluquería Aurora", city: "Valencia", status: "contactado", value: 800, created_at: "2026-09-22", email: "hola@aurora.es" },
  { id: "lead-2", type: "lead", business: "Bar La Esquina", city: "Valencia", status: "nuevo", value: 1200, created_at: "2026-09-23", email: "info@laesquina.es" },
  { id: "lead-3", type: "lead", business: "Gimnasio FitZone", city: "Paterna", status: "cerrado", value: 2400, created_at: "2026-09-20", email: "contacto@fitzone.es" },
  { id: "lead-4", type: "lead", business: "Clínica Dental Sonrisa", city: "Valencia", status: "contactado", value: 1800, created_at: "2026-09-22", email: "citas@sonrisa.es" },
  { id: "lead-5", type: "lead", business: "Restaurante El Puerto", city: "Valencia", status: "perdido", value: 900, created_at: "2026-09-19", email: "reservas@elpuerto.es" },
  { id: "client-1", type: "client", name: "Peluquería Aurora", status: "activo", monthly_fee: 350, since: "2026-06-01", email: "hola@aurora.es" },
  { id: "client-2", type: "client", name: "Gimnasio FitZone", status: "activo", monthly_fee: 500, since: "2026-05-15", email: "contacto@fitzone.es" },
  { id: "inv-1", type: "invoice", client_id: "client-1", amount: 350, status: "cobrada", month: "2026-09", issued_at: "2026-09-01" },
  { id: "inv-2", type: "invoice", client_id: "client-1", amount: 350, status: "cobrada", month: "2026-08", issued_at: "2026-08-01" },
  { id: "inv-3", type: "invoice", client_id: "client-2", amount: 500, status: "pendiente", month: "2026-09", issued_at: "2026-09-01", due_date: "2026-09-15" },
  { id: "inv-4", type: "invoice", client_id: "client-2", amount: 500, status: "cobrada", month: "2026-08", issued_at: "2026-08-01" },
];

let written = 0;
for (const record of records) {
  await db.put("local-user", "business-records", record as { id: string });
  written++;
}
await db.close();
console.log(`Escritos ${written} business-records`);