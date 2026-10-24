import type { Client } from '../types';
import { StatusBadge } from './StatusBadge';
type Props = { client: Client; onClose: () => void; onGenerate: () => void };
export function ClientDetailModal({ client, onClose, onGenerate }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-[520px] bg-white rounded-t-[24px] md:rounded-[24px] border border-[var(--border)] shadow-[0_24px_64px_rgba(0,0,0,0.2)] p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EDE8FF] text-[#6D5BFF] grid place-items-center font-bold">{client.avatar}</div>
            <div>
              <div className="text-[16px] font-semibold">{client.name}</div>
              <div className="text-[12px] text-[var(--muted)]">{client.company} · {client.ltv}</div>
              <div className="mt-2 flex gap-2">
                <StatusBadge status={client.status} />
                <span className="text-[10px] px-2 py-1 rounded-full bg-[#F1F0FF] text-[#6D5BFF]">{client.amount}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F8F7FF] border border-[var(--border)] grid place-items-center">✕</button>
        </div>
        <div className="mt-5 rounded-[16px] bg-[#F8F7FF] p-4">
          <div className="text-[11px] tracking-widest font-semibold text-[var(--muted)]">DETALLE IA</div>
          <p className="text-[13px] leading-[1.6] mt-2">{client.detail}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[14px] border border-[var(--border)] p-3">
            <div className="text-[10px] text-[var(--muted)]">PRÓXIMO PASO</div>
            <div className="text-[12px] font-medium mt-1">{client.next}</div>
          </div>
          <div className="rounded-[14px] border border-[var(--border)] p-3">
            <div className="text-[10px] text-[var(--muted)]">ACCIÓN IA</div>
            <div className="text-[12px] font-medium mt-1">{client.action}</div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onGenerate} className="flex-1 h-10 rounded-full bg-[#111113] text-white text-[13px] font-medium">Generar con IA →</button>
          <button onClick={onClose} className="h-10 px-5 rounded-full bg-[#F8F7FF] border border-[var(--border)] text-[13px] font-medium">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
