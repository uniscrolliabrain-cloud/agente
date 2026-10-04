// METRICS_REGISTRY_V1 — contadores y gauges acumulativos en memoria.
//
// Los servicios incrementan aquí. /metrics solo serializa.
// Sin esto, cada GET /metrics escanea la DB entera.
// Ver: docs/audits/02-observabilidad/miniaudit.md ("metrics-exporter
// genera las métricas bajo demanda, no las acumula").

type Labels = Record<string, string>;

function labelKey(labels: Labels): string {
  const entries = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}="${v}"`).join(",");
}

interface Counter {
  name: string;
  help: string;
  samples: Map<string, { labels: Labels; value: number }>;
}

interface Gauge {
  name: string;
  help: string;
  samples: Map<string, { labels: Labels; value: number }>;
}

export class MetricsRegistry {
  private readonly counters = new Map<string, Counter>();
  private readonly gauges = new Map<string, Gauge>();

  counter(name: string, help: string): void {
    if (!this.counters.has(name)) {
      this.counters.set(name, { name, help, samples: new Map() });
    }
  }

  gauge(name: string, help: string): void {
    if (!this.gauges.has(name)) {
      this.gauges.set(name, { name, help, samples: new Map() });
    }
  }

  inc(name: string, labels: Labels = {}, value = 1): void {
    const c = this.counters.get(name);
    if (!c) return;
    const key = labelKey(labels);
    const sample = c.samples.get(key) ?? { labels, value: 0 };
    sample.value += value;
    c.samples.set(key, sample);
  }

  set(name: string, value: number, labels: Labels = {}): void {
    const g = this.gauges.get(name);
    if (!g) return;
    g.samples.set(labelKey(labels), { labels, value });
  }

  render(): string {
    const lines: string[] = [];
    for (const c of this.counters.values()) {
      lines.push(`# HELP ${c.name} ${c.help}`);
      lines.push(`# TYPE ${c.name} counter`);
      for (const s of c.samples.values()) {
        const lbl = Object.entries(s.labels).map(([k, v]) => `${k}="${v}"`).join(",");
        lines.push(`${c.name}${lbl ? `{${lbl}}` : ""} ${s.value}`);
      }
    }
    for (const g of this.gauges.values()) {
      lines.push(`# HELP ${g.name} ${g.help}`);
      lines.push(`# TYPE ${g.name} gauge`);
      for (const s of g.samples.values()) {
        const lbl = Object.entries(s.labels).map(([k, v]) => `${k}="${v}"`).join(",");
        lines.push(`${g.name}${lbl ? `{${lbl}}` : ""} ${s.value}`);
      }
    }
    return lines.join("\n") + "\n";
  }
}

export const globalMetrics = new MetricsRegistry();

// Registro de los contadores y gauges base.
globalMetrics.counter("openmuse_http_requests_total", "Requests HTTP por método, ruta y status");
globalMetrics.counter("openmuse_tasks_created_total", "Tareas creadas por tenant y tipo");
globalMetrics.counter("openmuse_tasks_completed_total", "Tareas completadas por tenant y estado");
globalMetrics.counter("openmuse_llm_calls_total", "Llamadas al LLM por velocidad, modelo, source");
// METRIC_LLM_SPEED_V1 - incluye label speed.
globalMetrics.counter("openmuse_llm_tokens_total", "Tokens consumidos por velocidad y modelo");
globalMetrics.gauge("openmuse_worker_running", "1 si el worker está corriendo");
globalMetrics.gauge("openmuse_tasks_active", "Tareas activas por tenant");
globalMetrics.gauge("openmuse_tenants_total", "Tenants activos");
// METRIC_LATENCY_SPEED_V1 - latencia por velocidad.
globalMetrics.counter("openmuse_llm_latency_ms_sum", "Suma de latencias");
globalMetrics.counter("openmuse_llm_latency_ms_count", "Numero de llamadas");
