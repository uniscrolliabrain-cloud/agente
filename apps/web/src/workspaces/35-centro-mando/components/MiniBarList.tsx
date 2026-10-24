import type { MessageRow } from '../types';
export function MiniBarList({ rows }: { rows: MessageRow[] }) {
  return (
    <div className="space-y-2">
      {rows.map(r => (
        <div key={r.name} className="flex items-center gap-2">
          <div className="text-[11px] w-[110px] truncate text-[#3A3A3D]">{r.name}</div>
          <div className="flex-1 h-1.5 rounded-full bg-[#F1F0FF] overflow-hidden">
            <div className="h-full bg-[#6D5BFF] rounded-full" style={{ width: r.pct + '%' }} />
          </div>
          <div className="text-[11px] font-medium">{r.msgs}/d</div>
        </div>
      ))}
    </div>
  );
}
