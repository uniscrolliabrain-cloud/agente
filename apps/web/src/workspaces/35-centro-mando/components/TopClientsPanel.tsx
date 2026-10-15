import type { Client } from '../types';
import { TopClientsTable } from './TopClientsTable';
type Props = { clients: Client[]; onOpen: (c: Client) => void; onAction: (c: Client) => void };
export function TopClientsPanel({ clients, onOpen, onAction }: Props) {
  return (
    <section className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] overflow-hidden">
      <div className="p-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Top clientes riesgo / oportunidad</h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-1 rounded-full bg-[#FFE4E6] text-red-700">Roberto León €15.4k silencio 12d riesgo churn</span>
          <span className="hidden md:inline text-[11px] px-2 py-1 rounded-full bg-[#D1FAE5] text-emerald-700">Marta Soler oportunidad €8.4k</span>
        </div>
      </div>
      <TopClientsTable clients={clients} onOpen={onOpen} onAction={onAction} />
    </section>
  );
}
