import type { Insight } from '../types';
import { InsightCard } from './InsightCard';
type Props = { insights: Insight[]; onAction: (i: Insight) => void };
export function AiInsightsPanel({ insights, onAction }: Props) {
  return (
    <section className="rounded-[20px] bg-[#111113] text-white p-5 lg:p-6 border border-black relative overflow-hidden">
      <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-[#6D5BFF] opacity-30 blur-[36px]" />
      <div className="flex items-start gap-3 relative">
        <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center text-[16px] shrink-0">✦</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-semibold">Insights IA auto-generados</h3>
            <span className="text-[10px] px-2 py-1 rounded-full bg-[#6D5BFF]">{insights.length} nuevos</span>
            <span className="text-[11px] text-white/60">Actualizado hace 12 min · Modelo AGNTia v4.2</span>
          </div>
          <div className="mt-3 grid md:grid-cols-3 gap-3">
            {insights.map(i => <InsightCard key={i.tag} i={i} onClick={() => onAction(i)} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
