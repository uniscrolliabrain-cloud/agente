import type { Agent } from '../types';
import { ProgressBar } from './ProgressBar';
type Props = { a: Agent; onEdit: () => void; onLogs: () => void };
export function AgentPerformanceCard({ a, onEdit, onLogs }: Props) {
  const confCls = a.status === 'ok' ? 'bg-[#D1FAE5] text-emerald-700' : 'bg-[#FEF3C7] text-amber-700';
  return (
    <div className="rounded-[14px] border border-[var(--border)] p-3">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium">{a.name}</div>
        <div className={'text-[11px] px-2 py-0.5 rounded-full font-medium ' + confCls}>{a.conf}% confianza</div>
      </div>
      <div className="text-[11px] text-[var(--muted)] mt-1">{a.desc}</div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1"><ProgressBar pct={a.conf} /></div>
        <span className="text-[11px] text-[var(--muted)]">{a.tasks} tareas</span>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={onEdit} className="h-7 px-3 rounded-full bg-[#F8F7FF] border border-[var(--border)] text-[11px] font-medium">Editar agente</button>
        <button onClick={onLogs} className="h-7 px-3 rounded-full bg-[#111113] text-white text-[11px]">Ver logs</button>
      </div>
    </div>
  );
}
