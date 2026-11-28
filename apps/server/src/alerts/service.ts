// ALERTS_SERVICE_V1 — motor de alertas declarativas.
//
// Cada alerta tiene: id, descripción, condición, cooldown y severidad.
// El motor evalúa todas las alertas cada N segundos y dispara los handlers
// cuando la condición pasa (respetando cooldown).
//
// Ver: docs/audits/02-observabilidad/miniaudit.md ("Sin alertas"),
// docs/audits/02-observabilidad/roadmap.md §8 ("5 alertas definidas y probadas").

import { logWarn } from "../log.ts";
import type { Store } from "../db.ts";

export interface AlertDefinition {
  id: string;
  description: string;
  condition: () => boolean | Promise<boolean>;
  cooldownSec: number;
  severity: "info" | "warning" | "critical";
}

export interface AlertFired {
  id: string;
  description: string;
  severity: "info" | "warning" | "critical";
  firedAt: string;
}

export interface AlertHandler {
  fire(alert: AlertFired): Promise<void>;
}

export class AlertService {
  private readonly definitions = new Map<string, AlertDefinition>();
  private readonly lastFired = new Map<string, number>();
  private timer?: ReturnType<typeof setInterval>;
  private readonly evaluating = new Set<string>();

  constructor(
    private readonly handlers: AlertHandler[],
    private readonly intervalMs = 30_000,
    private readonly stateStore?: Pick<Store, "rawQuery">,
  ) {}

  register(def: AlertDefinition): void {
    this.definitions.set(def.id, def);
  }

  size(): number {
    return this.definitions.size;
  }

  async evaluate(): Promise<AlertFired[]> {
    const fired: AlertFired[] = [];
    for (const def of this.definitions.values()) {
      const last = this.lastFired.get(def.id);
      if (this.evaluating.has(def.id) || (last !== undefined && Date.now() - last < def.cooldownSec * 1000)) continue;
      this.evaluating.add(def.id);
      try {
        let triggered: boolean;
        try {
          triggered = await def.condition();
        } catch {
          logWarn("alert.condition_failed", { alertId: def.id });
          continue;
        }
        if (!triggered) continue;
        if (this.stateStore) {
          try {
            const claimed = await this.stateStore.rawQuery(
              `INSERT INTO records AS state(owner,kind,id,data)
               VALUES('system','alert-fire-state',$1,jsonb_build_object('lastFiredAt',now()))
               ON CONFLICT(owner,kind,id) DO UPDATE SET data=EXCLUDED.data,updated_at=now()
               WHERE (state.data->>'lastFiredAt')::timestamptz <= now()-$2::double precision*interval '1 second'
               RETURNING id`, [def.id, def.cooldownSec]);
            if (!claimed.length) continue;
          } catch {
            logWarn("alert.claim_failed", { alertId: def.id });
            continue;
          }
        }
        const now = Date.now();
        const alert: AlertFired = {
          id: def.id,
          description: def.description,
          severity: def.severity,
          firedAt: new Date(now).toISOString(),
        };
        this.lastFired.set(def.id, now);
        for (const handler of this.handlers) {
          try { await handler.fire(alert); }
          catch { logWarn("alert.handler_failed", { alertId: def.id }); }
        }
        fired.push(alert);
      } finally {
        this.evaluating.delete(def.id);
      }
    }
    return fired;
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.evaluate().catch(() => logWarn("alert.evaluation_failed", {}));
    }, this.intervalMs);
    this.timer.unref?.();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
}

/** Handler que solo loguea. Sirve para desarrollo y para CI. */
export class LogAlertHandler implements AlertHandler {
  async fire(alert: AlertFired): Promise<void> {
    logWarn("alert.fired", {
      alertId: alert.id,
      severity: alert.severity,
      description: alert.description,
    });
  }
}
