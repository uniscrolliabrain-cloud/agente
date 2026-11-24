import type { Project } from '../types';
import { ProgressBar } from './ProgressBar';

export function ProjectProgressRow({ o }: { o: Project }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[var(--v2-purple-soft)] text-[color:var(--v2-purple)] grid place-items-center text-[10px] font-bold shrink-0">
            {o.avatar}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium leading-none text-[var(--v2-text)] truncate">{o.name}</div>
            <div className="text-[11px] text-[var(--v2-text-2)] mt-0.5 truncate">{o.owner} · {o.alert}</div>
          </div>
        </div>
        <div className="text-[12px] font-semibold text-[var(--v2-text)]">{o.pct}%</div>
      </div>
      <div className="mt-2"><ProgressBar pct={o.pct} color={o.color} /></div>
    </div>
  );
}
