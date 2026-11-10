import type { Client } from '../types';
import { TopClientRow } from './TopClientRow';

type Props = { clients: Client[]; onOpen: (c: Client) => void; onAction: (c: Client) => void };

export function TopClientsTable({ clients, onOpen, onAction }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="text-[10px] tracking-[0.12em] text-[var(--v2-text-3)] border-y border-[var(--v2-border)] bg-[var(--v2-bg-softer)]">
            <th className="text-left font-semibold px-5 py-3">CLIENTE</th>
            <th className="text-left font-semibold px-3 py-3">DOMINIO</th>
            <th className="text-left font-semibold px-3 py-3">IMPORTE</th>
            <th className="text-left font-semibold px-3 py-3">ESTADO</th>
            <th className="text-left font-semibold px-3 py-3">PRÓXIMO PASO IA</th>
            <th className="text-left font-semibold px-5 py-3">ACCIÓN</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <TopClientRow
              key={client.id}
              c={client}
              onOpen={() => onOpen(client)}
              onAction={() => onAction(client)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
