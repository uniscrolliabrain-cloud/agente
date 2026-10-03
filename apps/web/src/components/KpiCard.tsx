// C2_KPICARD_V1 - KPI con contador animado + sparkline opcional.
import { useEffect, useState } from "react";
import Sparkline from "./Sparkline";

interface Props {
  label: string;
  value: number;
  meta?: string;
  icon?: "green" | "orange" | "purple";
  series?: number[];
}

function useCountUp(target: number, durationMs = 500) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return displayed;
}

export default function KpiCard({ label, value, meta, icon = "purple", series }: Props) {
  const displayed = useCountUp(value);
  return (
    <div className="v3-kpi">
      <div className="v3-kpi-head">
        <div className={`v3-kpi-icon ${icon}`}>●</div>
        <span className="v3-kpi-label">{label}</span>
      </div>
      <div className="v3-kpi-value">{displayed.toLocaleString("es-ES")}</div>
      {series && series.length > 1 && (
        <div className="v3-kpi-spark">
          <Sparkline values={series} color="var(--v2-purple)" />
        </div>
      )}
      {meta && <div className="v3-kpi-meta">{meta}</div>}
    </div>
  );
}