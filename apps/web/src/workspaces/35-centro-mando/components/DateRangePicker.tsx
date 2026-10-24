import type { DateRange } from '../types';
export function DateRangePicker({ range, onChange }: { range: DateRange; onChange: (r: DateRange) => void }) {
  return (
    <div className="flex p-1 rounded-full bg-[#F8F7FF] border border-[var(--border)]">
      {(['7d','30d','90d'] as DateRange[]).map(r => (
        <button key={r} onClick={() => onChange(r)} className={'px-3 h-7 rounded-full text-[12px] font-medium transition ' + (range === r ? 'bg-[#111113] text-white' : 'text-[var(--muted)] hover:text-[#111113]')}>{r}</button>
      ))}
    </div>
  );
}
