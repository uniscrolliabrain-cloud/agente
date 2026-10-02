// METRICS_COLLECTOR_V1 - métricas por tenant.

import type { Store } from "../../db.ts";

export interface Metric {
  tenantId: string;
  name: string;
  value: number;
  tags: Record<string, string>;
  at: string;
}

export class MetricsCollector {
  constructor(private readonly db: Store) {}

  async record(tenantId: string, name: string, value: number, tags: Record<string, string> = {}): Promise<void> {
    const id = `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await this.db.put(tenantId, "metrics", {
      id,
      tenantId,
      name,
      value,
      tags,
      at: new Date().toISOString(),
    });
  }

  async summary(tenantId: string, hours = 24): Promise<Record<string, { count: number; sum: number; avg: number; max: number }>> {
    const since = new Date(Date.now() - hours * 3600000).toISOString();
    const rows = await this.db.list<Metric>(tenantId, "metrics", { limit: 10000 });
    const byName = new Map<string, { count: number; sum: number; max: number }>();
    for (const row of rows) {
      if (row.at < since) continue;
      const existing = byName.get(row.name) ?? { count: 0, sum: 0, max: 0 };
      existing.count += 1;
      existing.sum += row.value;
      if (row.value > existing.max) existing.max = row.value;
      byName.set(row.name, existing);
    }
    const out: Record<string, { count: number; sum: number; avg: number; max: number }> = {};
    for (const [name, s] of byName) {
      out[name] = {
        count: s.count,
        sum: s.sum,
        avg: s.count > 0 ? s.sum / s.count : 0,
        max: s.max,
      };
    }
    return out;
  }
}