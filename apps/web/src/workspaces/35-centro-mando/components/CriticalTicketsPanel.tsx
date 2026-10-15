import type { Ticket } from '../types';
import { SectionHeader } from './SectionHeader';
import { TicketCard } from './TicketCard';
type Props = { tickets: Ticket[]; onOpen: (name: string) => void; onFixBot: () => void; onVerCola: () => void };
export function CriticalTicketsPanel({ tickets, onOpen, onFixBot, onVerCola }: Props) {
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 flex flex-col">
      <SectionHeader title={<>Tickets críticos <span className="w-5 h-5 rounded-full bg-[#FFE4E6] text-red-600 inline-grid place-items-center text-[11px] font-bold">{tickets.length}</span></>} actions={<button onClick={onVerCola} className="text-[11px] px-2.5 py-1 rounded-full bg-[#111113] text-white">Ver cola</button>} />
      <div className="mt-4 space-y-3">
        {tickets.map(t => <TicketCard key={t.name} t={t} onClick={() => onOpen(t.name)} />)}
      </div>
      <div className="mt-auto pt-4">
        <div className="rounded-[12px] bg-[#F8F7FF] p-3 flex items-center justify-between">
          <div className="text-[11px]"><span className="font-semibold">23%</span> respuestas fuera horario fallando</div>
          <button onClick={onFixBot} className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[var(--border)]">Fix bot</button>
        </div>
      </div>
    </div>
  );
}
