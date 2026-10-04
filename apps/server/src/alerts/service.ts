// ALERTS_SERVICE_V1 — motor de alertas declarativas.
//
// Cada alerta tiene: id, descripción, condición, cooldown y severidad.
// El motor evalúa todas las alertas cada N segundos y dispara los handlers
// cuando la condición pasa (respetando cooldown).
//
// Ver: docs/audits/02-observabilidad/miniaudit.md ("Sin alertas"),
// docs/audits/02-observabilidad/roadmap.md §8 ("5 alertas definidas y probadas").

import { logWarn } from "../log.ts";

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

  constructor(
    private readonly handlers: AlertHandler[],
    private readonly intervalMs = 30_000,
  ) {}

  register(def: AlertDefinition): void {
    this.definitions.set(def.id, def);
  }

  size(): number {
    return this.definitions.size;
  }

  async evaluate(): Promise<AlertFired[]> {
    const fired: AlertFired[] = [];
    const now = Date.now();
    for (const def of this.definitions.values()) {
      const last = this.lastFired.get(def.id) ?? 0;
      if (now - last < def.cooldownSec * 1000) continue;
      let triggered = false;
      try {
        triggered = await def.condition();
      } catch (error) {
        logWarn("alert.condition_failed", {
          alertId: def.id,
          error: error instanceof Error ? error.message : String(error),
        });
        continue;
      }
      if (!triggered) continue;
      const alert: AlertFired = {
        id: def.id,
        description: def.description,
        severity: def.severity,
        firedAt: new Date().toISOString(),
      };
      this.lastFired.set(def.id, now);
      for (const handler of this.handlers) {
        await handler.fire(alert).catch((error) => {
          logWarn("alert.handler_failed", {
            alertId: def.id,
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }
      fired.push(alert);
    }
    return fired;
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.evaluate();
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
