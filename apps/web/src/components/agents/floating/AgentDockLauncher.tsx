// AGENT_DOCK_LAUNCHER_V1 - launcher inferior izquierdo cuando la ventana
// está minimizada o cerrada. Click -> reaparece al frente.

interface Props {
  agentName: string;
  role: string;
  icon: string;
  onOpen: () => void;
}

export default function AgentDockLauncher({ agentName, role, icon, onOpen }: Props) {
  return (
    <button type="button" className="agent-dock" onClick={onOpen}>
      <div className="agent-dock__avatar">{icon}</div>
      <div>
        <strong>{agentName.toUpperCase()}.exe</strong>
        <span>{role} · activa</span>
      </div>
      <span className="agent-dock__status">●</span>
    </button>
  );
}