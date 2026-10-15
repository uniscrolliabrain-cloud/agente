import type { DateRange } from '../types';
import { ChartAnnotation } from './ChartAnnotation';
type Props = { data: number[]; range: DateRange };
export function RetentionChart({ data, range }: Props) {
  const annotationX = range === '7d' ? 260 : 300;
  const annotationY = range === '7d' ? 84 : 72;
  return (
    <div className="mt-6 relative">
      <svg viewBox="0 0 520 180" className="w-full h-[180px] overflow-visible">
        <defs>
          <linearGradient id="lav" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#EDE8FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EDE8FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0,1,2,3].map(i => <line key={i} x1="0" x2="520" y1={20 + i * 40} y2={20 + i * 40} stroke="#F1F0FF" strokeDasharray="4 6" />)}
        <path d={'M0,' + (180 - data[0] * 1.2) + ' ' + data.map((v, i) => 'L ' + (i / (data.length - 1)) * 520 + ',' + (180 - v * 1.2)).join(' ') + ' L 520,160 L 0,160 Z'} fill="url(#lav)" />
        <path d={'M0,' + (180 - data[0] * 1.2) + ' ' + data.map((v, i) => 'L ' + (i / (data.length - 1)) * 520 + ',' + (180 - v * 1.2)).join(' ')} fill="none" stroke="#6D5BFF" strokeWidth="2.5" strokeLinecap="round" />
        <ChartAnnotation x={annotationX} y={annotationY} label="Fix deploy · +12% ↑" />
        {data.map((v, i) => {
          if (i % 3 !== 0 && data.length > 7) return null;
          return <circle key={i} cx={(i / (data.length - 1)) * 520} cy={180 - v * 1.2} r="3.5" fill="#6D5BFF" />;
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
        <span>Hace {range}</span><span>Hoy</span>
      </div>
    </div>
  );
}
