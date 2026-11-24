import type { BarRow } from '../types';

export function BarList({ rows, unit = '' }: { rows: BarRow[]; unit?: string }) {
  if (rows.length === 0) {
    return <div className="text-[11px] text-[var(--v2-text-3)]">Sin datos en el periodo.</div>;
  }
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.name} className="flex items-center gap-2">
          <div className="text-[11px] w-[92px] truncate text-[var(--v2-text-2)]">{row.name}</div>
          <div className="flex-1 h-1.5 rounded-full bg-[var(--v2-bg-soft)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--v2-purple)]" style={{ width: row.pct + '%' }} />
          </div>
          <div className="text-[11px] font-medium text-[var(--v2-text)]">{row.value}{unit}</div>
        </div>
      ))}
    </div>
  );
}
