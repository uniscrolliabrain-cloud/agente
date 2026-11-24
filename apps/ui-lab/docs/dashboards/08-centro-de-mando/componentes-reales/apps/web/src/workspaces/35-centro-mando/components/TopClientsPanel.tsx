import type { Client } from '../types';
import { TopClientsTable } from './TopClientsTable';

type Props = { clients: Client[]; onOpen: (c: Client) => void; onAction: (c: Client) => void };

export function TopClientsPanel({ clients, onOpen, onAction }: Props) {
  const risk = clients.filter((client) => client.status === 'riesgo').length;
  const opportunities = clients.filter((client) => client.status === 'oportunidad').length;

  return (
    <section className="rounded-[20px] bg-[var(--v2-bg-card)] border border-[var(--v2-border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] overflow-hidden">
      <div className="p-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-[var(--v2-text)]">Clientes y oportunidades</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] px-2 py-1 rounded-full bg-[#FFE4E6] text-red-700">
            {risk} en riesgo
          </span>
          <span className="text-[11px] px-2 py-1 rounded-full bg-[#D1FAE5] text-emerald-700">
            {opportunities} oportunidades abiertas
          </span>
        </div>
      </div>
      <TopClientsTable clients={clients} onOpen={onOpen} onAction={onAction} />
    </section>
  );
}
