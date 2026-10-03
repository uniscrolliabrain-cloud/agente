// LOAD_FIFTY_TENANTS_V1 - simula 50 tenants con el equipo digital.
// Verifica que TenantScopedStore aisla de verdad.
// SCHEDULE_SERVICE_MISSING_V1 - el modulo ScheduleService no existe
// en el repo actual. El bloque de scheduler esta comentado hasta que
// se implemente. El aislamiento por tenant si se prueba.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../apps/server/src/db-tenant.ts";

const TENANTS = 50;

test(`aislamiento con ${TENANTS} tenants`, { timeout: 120_000 }, async () => {
  const db = await createStore();
  try {
    const owners = Array.from({ length: TENANTS }, (_, i) => `owner-${i}`);
    const resolver = async (owner: string) => {
      const i = owners.indexOf(owner);
      return i >= 0 ? `tenant-${i}` : "default";
    };
    const tdb = new TenantScopedStore(db, resolver);

    for (let i = 0; i < TENANTS; i++) {
      const t = `tenant-${i}`;
      await db.put(t, "agent-roles", {
        id: "comercial",
        name: "Leo",
        tone: "concise",
        avatar: "sky",
        objetivo: `Comercial de ${t}`,
        sops: [],
        active: true,
        memories: [],
        createdAt: new Date().toISOString(),
      });
    }

    for (let i = 0; i < TENANTS; i++) {
      await tdb.put(owners[i], "weekly-schedules", {
        id: "comercial",
        tenantId: `tenant-${i}`,
        roleId: "comercial",
        timezone: "Europe/Madrid",
        slots: [],
        maxWeeklyHours: 40 + i,
        maxDailyHours: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    for (let i = 0; i < TENANTS; i++) {
      const sched = await tdb.get<{ maxWeeklyHours: number }>(owners[i], "weekly-schedules", "comercial");
      assert.ok(sched, `tenant-${i} tiene schedule`);
      assert.equal(sched!.maxWeeklyHours, 40 + i, `tenant-${i} lee su maxWeeklyHours`);
    }

    const rawRow = await db.get(`tenant-7:owner-7`, "weekly-schedules", "comercial");
    assert.ok(rawRow, "row con clave compuesta existe");

    const cross = await tdb.get(`tenant-1`, "weekly-schedules", "comercial");
    assert.equal(cross, null, "tenant-1 no ve el schedule de otro");
  } finally {
    await db.close();
  }
});
