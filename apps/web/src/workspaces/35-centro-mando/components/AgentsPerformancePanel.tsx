import type { Agent } from '../types';
import { SectionHeader } from './SectionHeader';
import { AgentPerformanceCard } from './AgentPerformanceCard';
type Props = { agents: Agent[]; onEdit: (name: string) => void; onLogs: (name: string, conf: number) => void };
export function AgentsPerformancePanel({ agents, onEdit, onLogs }: Props) {
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5">
      <SectionHeader title="Agentes performance" actions={<span className="text-[10px] px-2 py-1 rounded-full bg-[#D1FAE5] text-emerald-700">{agents.length} activos</span>} />
      <div className="mt-5 space-y-4">
        {agents.map(a => (
          <AgentPerformanceCard key={a.name} a={a} onEdit={() => onEdit(a.name)} onLogs={() => onLogs(a.name, a.conf)} />
        ))}
      </div>
    </div>
  );
}
