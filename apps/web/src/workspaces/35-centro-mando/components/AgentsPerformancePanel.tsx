import type { Agent } from '../types';
import { SectionHeader } from './SectionHeader';
import { AgentPerformanceCard } from './AgentPerformanceCard';

type Props = { agents: Agent[]; onEdit: (name: string) => void; onLogs: (name: string, conf: number) => void };

export function AgentsPerformancePanel({ agents, onEdit, onLogs }: Props) {
  return (
    <div className="rounded-[20px] bg-[var(--v2-bg-card)] border border-[var(--v2-border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5">
      <SectionHeader
        title="Rendimiento de los agentes"
        actions={
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#D1FAE5] text-emerald-700">
            {agents.length} activos
          </span>
        }
      />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {agents.map((agent) => (
          <AgentPerformanceCard
            key={agent.name}
            a={agent}
            onEdit={() => onEdit(agent.name)}
            onLogs={() => onLogs(agent.name, agent.conf)}
          />
        ))}
      </div>
    </div>
  );
}
