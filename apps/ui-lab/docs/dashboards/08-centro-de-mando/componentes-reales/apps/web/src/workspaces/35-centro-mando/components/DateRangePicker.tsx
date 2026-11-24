import type { DateRange } from '../types';

export function DateRangePicker({ range, onChange }: { range: DateRange; onChange: (r: DateRange) => void }) {
  return (
    <div className="flex p-1 rounded-full bg-[var(--v2-bg-soft)] border border-[var(--v2-border)]">
      {(['7d', '30d', '90d'] as DateRange[]).map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={
            'px-3 h-7 rounded-full text-[12px] font-medium transition ' +
            (range === option
              ? 'bg-[#1A1A1A] text-white'
              : 'text-[var(--v2-text-2)] hover:text-[var(--v2-text)]')
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}
