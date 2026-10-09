// AGENT_PROFILE_CLEANUP_V1 - stub. El perfil individual ahora lo pinta
// AgentDetailPage.tsx. Este fichero se conserva por compatibilidad pero
// no se importa desde ningun sitio.
import type { AgentUI } from "./types";

export default function AgentProfile({ agent }: { agent: AgentUI }) {
  return (
    <section className="agent-profile">
      <h2>Conoce a {agent.name}</h2>
      <p>{agent.role}</p>
    </section>
  );
}
