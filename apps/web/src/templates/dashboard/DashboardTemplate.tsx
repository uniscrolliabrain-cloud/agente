// D3_DASHBOARD_V2 - template dashboard real.
import type { RuntimeViewSpec } from "@openmuse/domain/views"; // FIX_02_D

interface Props {
  spec: Extract<RuntimeViewSpec, { kind: "dashboard" }>;
}

export default function DashboardTemplate({ spec }: Props) {
  return (
    <section className="tpl tpl--dashboard">
      <h3 className="tpl__title">{spec.title}</h3>
      <div className="tpl-dashboard__kpis">
        {spec.kpis.map((k, i) => (
          <div className="tpl-kpi" key={`${k.label}-${i}`}>
            <small className="tpl-kpi__label">{k.label}</small>
            <div className="tpl-kpi__value">{k.value}</div>
            {k.delta && <span className="tpl-kpi__delta">{k.delta}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}