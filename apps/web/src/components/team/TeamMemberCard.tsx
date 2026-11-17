// TEAM_MEMBER_CARD_V1 - una ficha del equipo (persona o agente IA) con su
// estado, en que esta trabajando y el interruptor de activo.
import { Gauge } from "lucide-react";
import { STATUS_LABEL, initialsOf, type TeamMember } from "./data";

interface Props {
  member: TeamMember;
  /** El interruptor solo se puede usar con datos de ejemplo: el backend aun no
   *  expone el cambio de estado de una persona ni de un agente. */
  editable: boolean;
  onOpen: (member: TeamMember) => void;
  onToggle: (member: TeamMember) => void;
}

export function TeamMemberCard({ member, editable, onOpen, onToggle }: Props) {
  const paused = !member.active;
  const load = member.load ?? 0;

  return (
    <article className={`team-card ${paused ? "paused" : ""}`}>
      <div className={`team-avatar ${member.kind === "ai" ? "ai" : ""}`}>
        {initialsOf(member.name)}
        <span className={`team-status-dot ${member.status}`} aria-hidden="true" />
      </div>

      {member.kind === "ai" && <span className="team-badge ai">Agente IA</span>}

      <h3 className="team-card-name">{member.name}</h3>
      <p className="team-card-role">{member.role}</p>
      <p className={`team-card-status ${member.status}`}>
        <span className="team-card-status-dot" aria-hidden="true" />
        {STATUS_LABEL[member.status]}
      </p>

      <div className="team-work">
        <b>En qué está trabajando</b>
        <span>{member.work}</span>
      </div>

      {member.load !== undefined && (
        <div className="team-load">
          <span className="team-load-label">
            <Gauge size={12} /> Carga de hoy
          </span>
          <b>{load}%</b>
          <span className="team-load-bar">
            <i style={{ width: `${Math.min(100, Math.max(0, load))}%` }} />
          </span>
        </div>
      )}

      <div className="team-card-actions">
        <button type="button" className="team-btn dark" onClick={() => onOpen(member)}>
          Ver perfil
        </button>
        {editable ? (
          <label className="team-switch-wrap">
            <span>Activo</span>
            <button
              type="button"
              role="switch"
              aria-checked={member.active}
              aria-label={`${member.active ? "Pausar" : "Activar"} a ${member.name}`}
              className={`team-switch ${member.active ? "" : "off"}`}
              onClick={() => onToggle(member)}
            />
          </label>
        ) : (
          <span className={`team-tag ${member.active ? "on" : ""}`}>
            {member.active ? "Activo" : "En pausa"}
          </span>
        )}
      </div>
    </article>
  );
}
