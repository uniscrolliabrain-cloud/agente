// SEED_BUSINESS_SCHEMA_V1
import { createStore } from "../apps/server/src/db.ts";

const schema = {
  id: "default",
  tenantId: "default",
  entities: [
    { type: "customer", label: "Cliente", fields: [
      { name: "name", label: "Nombre", type: "string", required: true },
      { name: "cif", label: "CIF", type: "string", required: false },
      { name: "email", label: "Email", type: "string", required: false },
    ]},
    { type: "lead", label: "Lead", fields: [
      { name: "name", label: "Nombre", type: "string", required: true },
      { name: "source", label: "Origen", type: "string", required: false },
      { name: "value", label: "Valor", type: "number", required: false },
    ]},
    { type: "invoice", label: "Factura", fields: [
      { name: "number", label: "Número", type: "string", required: true },
      { name: "amount", label: "Importe", type: "number", required: true },
      { name: "currency", label: "Moneda", type: "string", required: false },
    ]},
  ],
  relations: [
    { type: "has_invoice", label: "Tiene factura", fromType: "customer", toType: "invoice", cardinality: "one-to-many" },
    { type: "converted_to", label: "Convertido en", fromType: "lead", toType: "customer", cardinality: "one-to-one" },
  ],
  updatedAt: new Date().toISOString(),
};

async function main() {
  const db = await createStore({
    dataDir: process.env.DATA_DIR ?? ".openmuse",
    databaseUrl: process.env.DATABASE_URL,
  });
  try {
    await db.put("default", "business-schemas", schema);
    console.log("OK: business schema seed");
  } finally {
    await db.close();
  }
}

void main();