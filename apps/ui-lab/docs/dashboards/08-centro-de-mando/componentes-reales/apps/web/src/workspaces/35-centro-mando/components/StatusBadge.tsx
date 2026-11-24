import type { ClientStatus } from '../types';
export function StatusBadge({ status }: { status: ClientStatus }) {
  const cls = status === 'riesgo' ? 'bg-[#FFE4E6] text-red-700' : status === 'oportunidad' ? 'bg-[#D1FAE5] text-emerald-700' : 'bg-[#FEF3C7] text-amber-700';
  return <span className={'text-[10px] px-2 py-1 rounded-full font-medium ' + cls}>{status.toUpperCase()}</span>;
}
