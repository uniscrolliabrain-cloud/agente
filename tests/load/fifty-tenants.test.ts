// LOAD_FIFTY_TENANTS_V1 - simula 50 tenants con el equipo digital.
// Verifica que TenantScopedStore aisla de verdad y que el scheduler
// escala sin cargar todo el sistema.

import assert from "node:assert/strict";
import { test } from "node:test";
import { createStore } from "../../apps/server/src/db.ts";
import { TenantScopedStore } from "../../apps/server/src/db-tenant.ts";
import { ScheduleService } from "../../apps/server/src/engine/schedule/service.ts";

const TENANTS = 50;

test(`aislamiento y scheduler con ${TENANTS} tenants`, { timeout: 120_000 }, async () => {
  const db = await createStore();
  try {
    const schedule = new ScheduleService(db);

    // 1. Un TenantScopedStore que resuelve tenantId desde el owner.
    const owners = Array.from({ length: TENANTS }, (_, i) => `owner-${i}`);
    const resolver = async (owner: string) => {
      const i = owners.indexOf(owner);
      return i >= 0 ? `tenant-${i}` : "default";
    };
    const tdb = new TenantScopedStore(db, resolver);

    // 2. Cada tenant tiene un rol comercial.
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

    // 3. Escribimos un schedule por tenant usando TenantScopedStore.
    //    Todos los owners usan el MISMO id de rol. Aqui es donde se ve el aislamiento.
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

    // 4. Cada tenant lee solo su schedule.
    for (let i = 0; i < TENANTS; i++) {
      const sched = await tdb.get<{ maxWeeklyHours: number }>(owners[i], "weekly-schedules", "comercial");
      assert.ok(sched, `tenant-${i} tiene schedule`);
      assert.equal(sched!.maxWeeklyHours, 40 + i, `tenant-${i} lee su maxWeeklyHours`);
    }

    // 5. El owner plano en la DB es "tenant-i:owner-i".
    const rawRow = await db.get(`tenant-7:owner-7`, "weekly-schedules", "comercial");
    assert.ok(rawRow, "row con clave compuesta existe");

    // 6. Un tenant no ve el schedule de otro.
    const cross = await tdb.get(`tenant-1`, "weekly-schedules", "comercial");
    assert.equal(cross, null, "tenant-1 no ve el schedule de otro");

    // 7. ScheduleService funciona por tenant sin contaminacion cruzada.
    for (let i = 0; i < 5; i++) {
      const t = `tenant-${i}`;
      await schedule.setSchedule(t, "comercial", {
        timezone: "Europe/Madrid",
        maxWeeklyHours: 100,
        maxDailyHours: 20,
      });
    }
    const sched0 = await schedule.getSchedule("tenant-0", "comercial");
    const sched10 = await schedule.getSchedule("tenant-10", "comercial");
    assert.equal(sched0!.maxWeeklyHours, 100, "tenant-0 actualizado");
    assert.equal(sched10, null, "tenant-10 no existe");
  } finally {
    await db.close();
  }
});