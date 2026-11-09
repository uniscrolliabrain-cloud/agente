// MIGRATE_VERTICAL_SLICE_RECORDS_V1 - campaña 04.
// Ver: docs/vertical-slice-actual/04-datos/CAMPAIGN.md
//
// Uso:
//   pnpm exec tsx scripts/migrate-vertical-slice-records.ts            # inventario (no escribe)
//   pnpm exec tsx scripts/migrate-vertical-slice-records.ts --apply    # escribe tenantId + diario
//   --limit=N   limita cuántas filas se actualizan en esta pasada
//   --kinds=a,b limita el inventario a esos kinds
//
// Nunca mueve una fila entre tenants ni inventa un actor: lo que no se puede
// atribuir se queda en `review.json` y el script sale con 0 avisándolo.

import { mkdir, appendFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createStore } from "../apps/server/src/db.ts";
import {
  RECORD_KINDS,
  applyRecordMigration,
  planRecordMigration,
  type MigrationRow,
} from "../apps/server/src/engine/tenant-records.ts";

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;
const kindsArg = process.argv.find((a) => a.startsWith("--kinds="));
const kinds = kindsArg ? kindsArg.split("=")[1].split(",").filter(Boolean) : Object.keys(RECORD_KINDS);

const OUT_DIR = join("artifacts", "migrations");

async function main() {
  const db = await createStore({
    dataDir: process.env.DATA_DIR ?? ".agente",
    databaseUrl: process.env.DATABASE_URL,
  });
  try {
    const rows: MigrationRow[] = [];
    for (const kind of kinds) {
      const found = await db.scan<Record<string, unknown>>(kind, 5000).catch(() => []);
      for (const row of found) {
        const value = row.value ?? {};
        const id = typeof value.id === "string" ? value.id : "";
        if (!id) continue;
        rows.push({ owner: row.owner, kind, id, value });
      }
    }

    const plan = planRecordMigration(rows);
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(
      join(OUT_DIR, "inventory.json"),
      JSON.stringify({ at: new Date().toISOString(), kinds, plan }, null, 2),
    );
    if (plan.review.length > 0) {
      await writeFile(
        join(OUT_DIR, "review.json"),
        JSON.stringify({ at: new Date().toISOString(), review: plan.review }, null, 2),
      );
    }

    console.log(`[migrate-records] filas=${plan.total} kinds=${kinds.length}`);
    console.log(
      `[migrate-records] por scope: ${Object.entries(plan.byScope)
        .filter(([, n]) => n > 0)
        .map(([scope, n]) => `${scope}=${n}`)
        .join(" ")}`,
    );
    console.log(`[migrate-records] a actualizar=${plan.toUpdate.length} revisión=${plan.review.length}`);
    console.log(`[migrate-records] informe: ${join(OUT_DIR, "inventory.json")}`);

    if (plan.review.length > 0) {
      console.warn("[migrate-records] hay filas sin atribuir: no se tocan (review.json)");
    }
    if (!apply) {
      console.log("[migrate-records] dry-run: no se ha escrito nada (--apply para migrar)");
      return;
    }

    const journalPath = join(OUT_DIR, "journal.jsonl");
    await mkdir(dirname(journalPath), { recursive: true });
    const result = await applyRecordMigration(db, plan, {
      ...(limit ? { limit } : {}),
      journal: async (entry) => {
        await appendFile(journalPath, JSON.stringify(entry) + "\n");
      },
    });
    console.log(
      `[migrate-records] aplicado: actualizadas=${result.updated} pendientes=${result.skipped} diario=${journalPath}`,
    );
  } finally {
    await db.close();
  }
}

void main().catch((error) => {
  console.error("[migrate-records] fallo:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
