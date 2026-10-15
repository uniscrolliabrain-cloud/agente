import type { Client } from '../types';
import { TopClientRow } from './TopClientRow';
type Props = { clients: Client[]; onOpen: (c: Client) => void; onAction: (c: Client) => void };
export function TopClientsTable({ clients, onOpen, onAction }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="text-[10px] tracking-[0.12em] text-[var(--muted)] border-y border-[var(--border)] bg-[#FBFAFF]">
            <th className="text-left font-semibold px-5 py-3">CLIENTE</th>
            <th className="text-left font-semibold px-3 py-3">EMPRESA</th>
            <th className="text-left font-semibold px-3 py-3">LTV</th>
            <th className="text-left font-semibold px-3 py-3">ESTADO</th>
            <th className="text-left font-semibold px-3 py-3">PRÓXIMO PASO IA</th>
            <th className="text-left font-semibold px-5 py-3">ACCIÓN</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => <TopClientRow key={c.id} c={c} onOpen={() => onOpen(c)} onAction={() => onAction(c)} />)}
        </tbody>
      </table>
    </div>
  );
}
