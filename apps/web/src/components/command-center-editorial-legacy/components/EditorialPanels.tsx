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
    <div className="cce-legacy-panels">
      {showTeam && (
        <section className="cce-legacy-panel" aria-labelledby="cce-legacy-team-title">
          <div className="cce-legacy-panel-head">
            <h2 className="cce-legacy-panel-title" id="cce-legacy-team-title">
              <Users size={16} aria-hidden="true" /> Equipo
            </h2>
            {onOpenTeam && (
              <button type="button" className="cce-legacy-btn cce-legacy-btn--quiet cce-legacy-btn--small" onClick={onOpenTeam}>
                Ver <ArrowUpRight size={13} aria-hidden="true" />
              </button>
            )}
          </div>

          {members.length === 0 ? (
            <div className="cce-legacy-empty">Sin personas todavía.</div>
          ) : (
            members.map((member) => (
              <div key={member.userId} className="cce-legacy-person">
                <span className="cce-legacy-avatar" aria-hidden="true">
                  {member.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="cce-legacy-row-body">
                  <span className="cce-legacy-person-name">{member.name}</span>
                  <span className="cce-legacy-person-meta">{member.email}</span>
                </span>
                <span className={`cce-legacy-tag ${member.role === "owner" ? "cce-legacy-tag--info" : ""}`.trim()}>
                  {ROLE_LABEL[member.role]}
                </span>
              </div>
            ))
          )}
        </section>
      )}

      {showAgents && (
        <section className="cce-legacy-panel" aria-labelledby="cce-legacy-agents-title">
          <div className="cce-legacy-panel-head">
            <h2 className="cce-legacy-panel-title" id="cce-legacy-agents-title">
              <Bot size={16} aria-hidden="true" /> Agentes
            </h2>
            {onOpenAgents && (
              <button type="button" className="cce-legacy-btn cce-legacy-btn--quiet cce-legacy-btn--small" onClick={onOpenAgents}>
                Ver <ArrowUpRight size={13} aria-hidden="true" />
              </button>
            )}
          </div>

          {agents.length === 0 ? (
            <div className="cce-legacy-empty" style={{ flexDirection: "column", alignItems: "flex-start" }}>
              <span>Sin agentes todavía.</span>
              {canManageMembers && (
                <button type="button" className="cce-legacy-btn cce-legacy-btn--small" onClick={onAddAgent}>
                  Crear el primero
                </button>
              )}
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="cce-legacy-person">
                <span className="cce-legacy-avatar cce-legacy-avatar--agent" aria-hidden="true">
                  {agent.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="cce-legacy-row-body">
                  <span className="cce-legacy-person-name">{agent.name}</span>
                  <span className="cce-legacy-person-meta">{agent.active ? "Activo" : "En pausa"}</span>
                </span>
                <span
                  className={`cce-legacy-state-dot ${agent.active ? "cce-legacy-state-dot--on" : ""}`.trim()}
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
