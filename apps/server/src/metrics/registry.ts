// METRICS_REGISTRY_V1 ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â contadores y gauges acumulativos en memoria.
//
// Los servicios incrementan aquÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­. /metrics solo serializa.
// Sin esto, cada GET /metrics escanea la DB entera.
// Ver: docs/audits/02-observabilidad/miniaudit.md ("metrics-exporter
// genera las mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©tricas bajo demanda, no las acumula").

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

// HISTOGRAM_V1 - histograma con buckets acumulativos.
interface Histogram {
  name: string;
  help: string;
  buckets: number[];
  samples: Map<string, { labels: Labels; counts: number[]; sum: number; count: number }>;
}

export class MetricsRegistry {
  private readonly counters = new Map<string, Counter>();
  private readonly gauges = new Map<string, Gauge>();
  // HISTOGRAM_FIELDS_V1 - histogramas con buckets default.
  private readonly histograms = new Map<string, Histogram>();

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

  // HISTOGRAM_METHODS_V1 - registrar y observar histogramas.
  histogram(name: string, help: string, buckets?: number[]): void {
    if (!this.histograms.has(name)) {
      const defaultBuckets = buckets ?? [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
      this.histograms.set(name, {
        name,
        help,
        buckets: [...defaultBuckets].sort((a, b) => a - b),
        samples: new Map(),
      });
    }
  }

  // HISTOGRAM_QUANTILE_V1 - calcula un cuantil (0..1) sobre el histograma.
  quantile(name: string, q: number): number | undefined {
    const h = this.histograms.get(name);
    if (!h || h.samples.size === 0) return undefined;
    let total = 0;
    const rows: { le: number; cumulative: number }[] = [];
    for (const s of h.samples.values()) {
      let cumulative = 0;
      for (let i = 0; i < h.buckets.length; i += 1) {
        cumulative += s.counts[i];
        const existing = rows.find((r) => r.le === h.buckets[i]);
        if (existing) existing.cumulative += cumulative;
        else rows.push({ le: h.buckets[i], cumulative });
      }
      cumulative += s.counts[h.buckets.length];
      const infRow = rows.find((r) => r.le === Number.POSITIVE_INFINITY);
      if (infRow) infRow.cumulative += cumulative;
      else rows.push({ le: Number.POSITIVE_INFINITY, cumulative });
      total += s.count;
    }
    if (total === 0) return undefined;
    const target = q * total;
    rows.sort((a, b) => a.le - b.le);
    for (const r of rows) {
      if (r.cumulative >= target) return r.le;
    }
    return rows[rows.length - 1]?.le;
  }
  observe(name: string, value: number, labels: Labels = {}): void {
    const h = this.histograms.get(name);
    if (!h) return;
    const key = labelKey(labels);
    const sample = h.samples.get(key) ?? {
      labels,
      counts: new Array(h.buckets.length + 1).fill(0),
      sum: 0,
      count: 0,
    };
    let i = 0;
    while (i < h.buckets.length && value > h.buckets[i]) i += 1;
    sample.counts[i] += 1;
    sample.sum += value;
    sample.count += 1;
    h.samples.set(key, sample);
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
    // HISTOGRAM_RENDER_V1 - serializa histogramas en formato Prometheus.
    for (const h of this.histograms.values()) {
      lines.push(`# HELP ${h.name} ${h.help}`);
      lines.push(`# TYPE ${h.name} histogram`);
      for (const s of h.samples.values()) {
        const baseLabels = Object.entries(s.labels).map(([k, v]) => `${k}="${v}"`).join(",");
        let cumulative = 0;
        for (let i = 0; i < h.buckets.length; i += 1) {
          cumulative += s.counts[i];
          const le = h.buckets[i];
          const lbl = baseLabels ? `${baseLabels},le="${le}"` : `le="${le}"`;
          lines.push(`${h.name}_bucket{${lbl}} ${cumulative}`);
        }
        cumulative += s.counts[h.buckets.length];
        const infLbl = baseLabels ? `${baseLabels},le="+Inf"` : `le="+Inf"`;
        lines.push(`${h.name}_bucket{${infLbl}} ${cumulative}`);
        const suffix = baseLabels ? `{${baseLabels}}` : "";
        lines.push(`${h.name}_sum${suffix} ${s.sum}`);
        lines.push(`${h.name}_count${suffix} ${s.count}`);
      }
    }
    return lines.join("\n") + "\n";
  }
}

export const globalMetrics = new MetricsRegistry();

// Registro de los contadores y gauges base.
globalMetrics.counter("openmuse_http_requests_total", "Requests HTTP por mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©todo, ruta y status");
globalMetrics.counter("openmuse_tasks_created_total", "Tareas creadas por tenant y tipo");
globalMetrics.counter("openmuse_tasks_completed_total", "Tareas completadas por tenant y estado");
globalMetrics.counter("openmuse_llm_calls_total", "Llamadas al LLM por velocidad, modelo, source");
// METRIC_LLM_SPEED_V1 - incluye label speed.
globalMetrics.counter("openmuse_llm_tokens_total", "Tokens consumidos por velocidad y modelo");
globalMetrics.gauge("openmuse_worker_running", "1 si el worker estÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ corriendo");
globalMetrics.gauge("openmuse_tasks_active", "Tareas activas por tenant");
globalMetrics.gauge("openmuse_tenants_total", "Tenants activos");
// METRIC_LATENCY_SPEED_V1 - latencia por velocidad.
globalMetrics.counter("openmuse_llm_latency_ms_sum", "Suma de latencias");
globalMetrics.counter("openmuse_llm_latency_ms_count", "Numero de llamadas");
// HISTOGRAM_HTTP_LATENCY_V1 - histograma de latencia HTTP en ms.
globalMetrics.histogram(
  "openmuse_http_request_duration_ms",
  "Duracion HTTP en milisegundos",
);
