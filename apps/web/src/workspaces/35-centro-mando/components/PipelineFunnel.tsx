import type { PipelineStage } from '../types';
export function PipelineFunnel({ stages }: { stages: PipelineStage[] }) {
  return (
    <div className="space-y-2">
      {stages.map(s => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="text-[11px] w-[72px] text-white/70">{s.label}</div>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#6D5BFF]" style={{ width: s.w }} />
          </div>
          <div className="text-[11px] font-medium w-4">{s.val}</div>
        </div>
      ))}
    </div>
  );
}
