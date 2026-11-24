// TEAM_PROFILE_PANEL_V1 - ficha lateral de un miembro del equipo.
// Muestra lo que ya existe (trabajo, actividad, ficha del agente) y no inventa
// acciones que el backend no tenga.
import { MessageSquare, Pause, Play, X } from "lucide-react";
import { STATUS_LABEL, initialsOf, type TeamMember } from "./data";

interface Props {
  member: TeamMember;
  editable: boolean;
  onClose: () => void;
  onToggle: (member: TeamMember) => void;
  onOpenChat?: () => void;
}

export function TeamProfilePanel({ member, editable, onClose, onToggle, onOpenChat }: Props) {
  return (
    <>
      <div className="team-overlay" onClick={onClose} />
      <aside className="team-detail" aria-label={`Ficha de ${member.name}`}>
        <button type="button" className="team-detail-close" onClick={onClose} aria-label="Cerrar ficha">
          <X size={17} />
        </button>

        <div className={`team-avatar large ${member.kind === "ai" ? "ai" : ""}`}>
          {initialsOf(member.name)}
        </div>
        <h2>{member.name}</h2>
        <p className="team-detail-role">{member.role}</p>
        <div className="team-detail-badges">
          <span className={`team-badge ${member.kind === "ai" ? "ai" : "human"}`}>
            {member.kind === "ai" ? "Agente IA" : "Persona"}
          </span>
          <span className={`team-card-status ${member.status}`}>
            <span className="team-card-status-dot" aria-hidden="true" />
            {STATUS_LABEL[member.status]}
          </span>
        </div>

        <div className="team-box">
          <b>En qué está trabajando</b>
          <p>{member.work}</p>
        </div>

        {member.email && (
          <div className="team-box">
            <b>Contacto</b>
            <p>{member.email}</p>
          </div>
        )}

        {member.objetivo && (
          <div className="team-box">
            <b>Objetivo</b>
            <p>{member.objetivo}</p>
          </div>
        )}

        {member.activity.length > 0 && (
          <div className="team-box">
            <b>Actividad reciente</b>
            <ul className="team-activity">
              {member.activity.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {member.sops && member.sops.length > 0 && (
          <div className="team-box">
            <b>SOPs ({member.sops.length})</b>
            <ol className="team-sops">
              {member.sops.map((sop) => (
                <li key={sop}>{sop}</li>
              ))}
            </ol>
          </div>
        )}

        {member.memories && member.memories.length > 0 && (
          <div className="team-box">
            <b>Memoria ({member.memories.length})</b>
            <ul className="team-memories">
              {member.memories.map((memory, index) => (
                <li key={`${memory.kind}-${index}`}>
                  <span className="team-tag">{memory.kind}</span>
                  {memory.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="team-detail-actions">
          {onOpenChat && member.kind === "ai" && (
            <button type="button" className="team-btn dark" onClick={onOpenChat}>
              <MessageSquare size={13} /> Abrir chat
            </button>
          )}
          {editable && (
            <button type="button" className="team-btn" onClick={() => onToggle(member)}>
              {member.active ? <Pause size={13} /> : <Play size={13} />}
              {member.active ? "Pausar" : "Activar"}
            </button>
          )}
          <button type="button" className="team-btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </aside>
    </>
  );
}
