import type { Ticket } from '../types';
import { SectionHeader } from './SectionHeader';
import { TicketCard } from './TicketCard';

type Props = {
  tickets: Ticket[];
  note: string;
  noteCta: string;
  onOpen: (name: string) => void;
  onFixBot: () => void;
  onVerCola: () => void;
};

export function CriticalTicketsPanel({ tickets, note, noteCta, onOpen, onVerCola, onFixBot }: Props) {
  return (
    <div className="rounded-[20px] bg-[var(--v2-bg-card)] border border-[var(--v2-border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 flex flex-col">
      <SectionHeader
        title={
          <>
            Atención requerida{' '}
            <span className="w-5 h-5 rounded-full bg-[#FFE4E6] text-red-600 inline-grid place-items-center text-[11px] font-bold">
              {tickets.length}
            </span>
          </>
        }
        actions={
          <button onClick={onVerCola} className="text-[11px] px-2.5 py-1 rounded-full bg-[#1A1A1A] text-white">
            Ver cola
          </button>
        }
      />
      <div className="mt-4 space-y-3">
        {tickets.map((ticket, index) => (
          <TicketCard key={ticket.issue + index} t={ticket} onClick={() => onOpen(ticket.name)} />
        ))}
      </div>
      <div className="mt-auto pt-4">
        <div className="rounded-[12px] bg-[var(--v2-bg-soft)] p-3 flex items-center justify-between gap-3">
          <div className="text-[11px] text-[var(--v2-text-2)]">{note}</div>
          <button
            onClick={onFixBot}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--v2-bg-card)] border border-[var(--v2-border)] text-[var(--v2-text)] shrink-0"
          >
            {noteCta}
          </button>
        </div>
      </div>
    </div>
  );
}
