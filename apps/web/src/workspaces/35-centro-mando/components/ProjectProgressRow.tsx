import type { Project } from '../types';
import { ProgressBar } from './ProgressBar';
export function ProjectProgressRow({ o }: { o: Project }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EDE8FF] text-[#6D5BFF] grid place-items-center text-[10px] font-bold">{o.avatar}</div>
          <div>
            <div className="text-[13px] font-medium leading-none">{o.name}</div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">{o.owner} · {o.alert}</div>
          </div>
        </div>
        <div className="text-[12px] font-semibold">{o.pct}%</div>
      </div>
      <div className="mt-2"><ProgressBar pct={o.pct} color={o.color} /></div>
    </div>
  );
}
