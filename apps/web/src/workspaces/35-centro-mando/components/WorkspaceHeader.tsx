import type { DateRange } from '../types';
import { DateRangePicker } from './DateRangePicker';
type Props = { range: DateRange; onRange: (r: DateRange) => void; onExport: () => void };
export function WorkspaceHeader({ range, onRange, onExport }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-[rgba(248,247,255,0.85)] backdrop-blur-[14px] border-b border-[var(--border)]" style={{ top: 'var(--safe-area-inset-top)' }}>
      <div className="px-4 lg:px-8 h-[68px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-[18px] lg:text-[20px] font-semibold tracking-tight leading-none flex items-center gap-2">
              Centro de Mando <span className="hidden lg:inline text-[var(--muted)] font-normal">· Todas las empresas</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white border border-[var(--border)] ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
              </span>
            </h1>
            <div className="text-[11px] text-[var(--muted)] mt-1 lg:hidden">Todas las empresas · Workspace #9</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker range={range} onChange={onRange} />
          <button onClick={onExport} className="h-9 px-4 rounded-full bg-[#111113] text-white text-[13px] font-medium flex items-center gap-2 hover:opacity-90">
            <span>↗</span>
            <span className="hidden sm:inline">Exportar con IA</span>
            <span className="sm:hidden">Exportar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
