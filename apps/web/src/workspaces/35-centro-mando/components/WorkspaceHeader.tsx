import type { DateRange } from '../types';
import { DateRangePicker } from './DateRangePicker';

type Props = { meta: string; range: DateRange; onRange: (r: DateRange) => void; onExport: () => void };

export function WorkspaceHeader({ meta, range, onRange, onExport }: Props) {
  return (
    <div className="v2-tasks-header v2-cm-header">
      <div className="v2-cm-header-title">
        <h1 className="v2-tasks-title">Centro de Mando</h1>
        <div className="v2-tasks-meta">{meta}</div>
      </div>
      <div className="v2-cm-header-actions">
        <DateRangePicker range={range} onChange={onRange} />
        <button className="v2-need-action-btn" style={{ whiteSpace: 'nowrap' }} onClick={onExport}>
          Exportar con IA
        </button>
      </div>
    </div>
  );
}
