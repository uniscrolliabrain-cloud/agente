// COMMAND_CENTER_PANELS_V1 - equipo y agentes del tenant en dos paneles.
import { ArrowUpRight, Bot, Users } from "lucide-react";
import type { CompanyAgent, CompanyMember } from "../../api/company";
import { ROLE_LABEL } from "./labels";

interface Props {
  members: CompanyMember[];
  agents: CompanyAgent[];
  showTeam: boolean;
  showAgents: boolean;
  onOpenTeam?: () => void;
  onOpenAgents?: () => void;
  canManageMembers: boolean;
  onAddAgent: () => void;
}

export function CompanyPanels({
  members,
  agents,
  showTeam,
  showAgents,
  onOpenTeam,
  onOpenAgents,
  canManageMembers,
  onAddAgent,
}: Props) {
  return (
    <div className="cc-split">
      {showTeam && (
        <section className="cc-panel">
          <div className="cc-panel-head">
            <h2 className="cc-section-title">
              <Users size={15} /> Equipo
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {onOpenTeam && (
                <button type="button" className="cc-link" onClick={onOpenTeam}>
                  Ver <ArrowUpRight size={13} />
                </button>
              )}
            </div>
          </div>

          {members.length === 0 ? (
            <div className="cc-empty">Sin personas todavía.</div>
          ) : (
            members.map((member) => (
              <div key={member.userId} className="cc-person">
                <span className="cc-person-avatar">{member.name.slice(0, 1).toUpperCase()}</span>
                <span className="cc-person-body">
                  <span className="cc-person-name">{member.name}</span>
                  <span className="cc-person-meta">{member.email}</span>
                </span>
                <span className={`v2-tag ${member.role === "owner" ? "agent" : ""}`}>
                  {ROLE_LABEL[member.role]}
                </span>
              </div>
            ))
          )}
        </section>
      )}

      {showAgents && (
        <section className="cc-panel">
          <div className="cc-panel-head">
            <h2 className="cc-section-title">
              <Bot size={15} /> Agentes
            </h2>
            {onOpenAgents && (
              <button type="button" className="cc-link" onClick={onOpenAgents}>
                Ver <ArrowUpRight size={13} />
              </button>
            )}
          </div>

          {agents.length === 0 ? (
            <div className="cc-empty">
              Sin agentes todavía.
              {canManageMembers && (
                <div style={{ marginTop: 8 }}>
                  <button type="button" className="cc-btn" onClick={onAddAgent}>
                    Crear el primero
                  </button>
                </div>
              )}
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="cc-person">
                <span className="cc-person-avatar agent">{agent.name.slice(0, 1).toUpperCase()}</span>
                <span className="cc-person-body">
                  <span className="cc-person-name">{agent.name}</span>
                  <span className="cc-person-meta">{agent.active ? "Activo" : "En pausa"}</span>
                </span>
                <span className={`cc-state ${agent.active ? "on" : "off"}`} />
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}
