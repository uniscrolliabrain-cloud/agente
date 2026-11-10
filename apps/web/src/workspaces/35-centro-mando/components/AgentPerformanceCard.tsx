import type { Agent } from '../types';
import { ProgressBar } from './ProgressBar';

type Props = { a: Agent; onEdit: () => void; onLogs: () => void };

export function AgentPerformanceCard({ a, onEdit, onLogs }: Props) {
  const confCls = a.status === 'ok' ? 'bg-[#D1FAE5] text-emerald-700' : 'bg-[#FEF3C7] text-amber-700';
  return (
    <div className="rounded-[14px] border border-[var(--v2-border)] p-3 flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[13px] font-medium text-[var(--v2-text)]">{a.name}</div>
        <div className={'text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ' + confCls}>
          {a.conf}% confianza
        </div>
      </div>
      <div className="text-[11px] text-[var(--v2-text-2)] mt-1">{a.desc}</div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1"><ProgressBar pct={a.conf} /></div>
        <span className="text-[11px] text-[var(--v2-text-3)]">{a.tasks} tareas</span>
      </div>
      <div className="mt-3 flex gap-2 mt-auto pt-3">
        <button
          onClick={onEdit}
          className="h-7 px-3 rounded-full bg-[var(--v2-bg-soft)] border border-[var(--v2-border)] text-[11px] font-medium text-[var(--v2-text)]"
        >
          Editar agente
        </button>
        <button onClick={onLogs} className="h-7 px-3 rounded-full bg-[#1A1A1A] text-white text-[11px]">
          Ver logs
        </button>
      </div>
    </div>
  );
}
