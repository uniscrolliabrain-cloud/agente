// Equipo y agentes: mismos datos, mismos permisos y mismos enlaces de salida
// que la vista original. El alta solo aparece cuando `canManageMembers`.
import { ArrowUpRight, Bot, Users } from "lucide-react";
import type { CompanyAgent, CompanyMember } from "../../../api/company";
import { ROLE_LABEL } from "../../../components/command-center/labels";

export function EditorialPanels({
  members,
  agents,
  showTeam,
  showAgents,
  canManageMembers,
  onOpenTeam,
  onOpenAgents,
  onAddAgent,
}: {
  members: CompanyMember[];
  agents: CompanyAgent[];
  showTeam: boolean;
  showAgents: boolean;
  canManageMembers: boolean;
  onOpenTeam?: (() => void) | undefined;
  onOpenAgents?: (() => void) | undefined;
  onAddAgent: () => void;
}) {
  return (
    <div className="cce-panels">
      {showTeam && (
        <section className="cce-panel" aria-labelledby="cce-team-title">
          <div className="cce-panel-head">
            <h2 className="cce-panel-title" id="cce-team-title">
              <Users size={16} aria-hidden="true" /> Equipo
            </h2>
            {onOpenTeam && (
              <button type="button" className="cce-btn cce-btn--quiet cce-btn--small" onClick={onOpenTeam}>
                Ver <ArrowUpRight size={13} aria-hidden="true" />
              </button>
            )}
          </div>

          {members.length === 0 ? (
            <div className="cce-empty">Sin personas todavía.</div>
          ) : (
            members.map((member) => (
              <div key={member.userId} className="cce-person">
                <span className="cce-avatar" aria-hidden="true">
                  {member.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="cce-row-body">
                  <span className="cce-person-name">{member.name}</span>
                  <span className="cce-person-meta">{member.email}</span>
                </span>
                <span className={`cce-tag ${member.role === "owner" ? "cce-tag--info" : ""}`.trim()}>
                  {ROLE_LABEL[member.role]}
                </span>
              </div>
            ))
          )}
        </section>
      )}

      {showAgents && (
        <section className="cce-panel" aria-labelledby="cce-agents-title">
          <div className="cce-panel-head">
            <h2 className="cce-panel-title" id="cce-agents-title">
              <Bot size={16} aria-hidden="true" /> Agentes
            </h2>
            {onOpenAgents && (
              <button type="button" className="cce-btn cce-btn--quiet cce-btn--small" onClick={onOpenAgents}>
                Ver <ArrowUpRight size={13} aria-hidden="true" />
              </button>
            )}
          </div>

          {agents.length === 0 ? (
            <div className="cce-empty" style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <span>Sin agentes todavía.</span>
              {canManageMembers && (
                <button type="button" className="cce-btn cce-btn--small" onClick={onAddAgent}>
                  Crear el primero
                </button>
              )}
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="cce-person">
                <span className="cce-avatar cce-avatar--agent" aria-hidden="true">
                  {agent.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="cce-row-body">
                  <span className="cce-person-name">{agent.name}</span>
                  <span className="cce-person-meta">{agent.active ? "Activo" : "En pausa"}</span>
                </span>
                <span
                  className={`cce-state-dot ${agent.active ? "cce-state-dot--on" : ""}`.trim()}
                  role="img"
                  aria-label={agent.active ? "Activo" : "En pausa"}
                />
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}
