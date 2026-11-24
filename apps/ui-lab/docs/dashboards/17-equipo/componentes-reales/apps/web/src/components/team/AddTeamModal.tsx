// TEAM_ADD_MODAL_V1 - alta de una persona o activacion de un agente.
// En una sesion real la persona se crea con POST /api/company/members y el
// agente con el formulario de POST /api/agent/roles; en el tenant demo ambos
// se anaden a la lista local de ejemplo.
import { useState } from "react";
import { AlertCircle, Bot, UserPlus, X } from "lucide-react";
import { initialsOf, type TeamMember } from "./data";

interface Props {
  demo: boolean;
  availableAgents: TeamMember[];
  onClose: () => void;
  onAddPerson: (person: { name: string; email: string; roleLabel: string; role: "admin" | "member" }) => Promise<void>;
  onActivateAgent: (member: TeamMember) => void;
  onCreateAgent: () => void;
}

type Step = "choose" | "invite" | "agent";

export function AddTeamModal({
  demo,
  availableAgents,
  onClose,
  onAddPerson,
  onActivateAgent,
  onCreateAgent,
}: Props) {
  const [step, setStep] = useState<Step>("choose");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitPerson = async () => {
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onAddPerson({
        name: name.trim(),
        email: email.trim(),
        roleLabel: roleLabel.trim(),
        role,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo añadir a la persona");
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="team-modal" onClick={(event) => event.stopPropagation()}>
        <div className="team-modal-head">
          <div>
            <h3>Añadir al equipo</h3>
            <p>Elige cómo quieres hacer crecer tu equipo.</p>
          </div>
          <button type="button" className="ghost-icon-button" onClick={onClose} aria-label="Cerrar">
            <X size={17} />
          </button>
        </div>

        {error && (
          <div className="chat-error" style={{ marginBottom: 10 }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {step === "choose" && (
          <>
            <button type="button" className="team-opt" onClick={() => setStep("invite")}>
              <UserPlus size={16} />
              <span>
                <b>Invitar persona</b>
                <small>Da de alta a alguien del equipo con su correo</small>
              </span>
            </button>
            <button type="button" className="team-opt" onClick={() => setStep("agent")}>
              <Bot size={16} />
              <span>
                <b>Activar agente</b>
                <small>Elige y configura un agente de AgntiaPro</small>
              </span>
            </button>
            <div className="team-modal-row">
              <button type="button" className="team-btn" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </>
        )}

        {step === "invite" && (
          <div className="team-form">
            <label htmlFor="team-name">Nombre completo</label>
            <input
              id="team-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. Marta García"
              autoFocus
            />

            <label htmlFor="team-email">Correo</label>
            <input
              id="team-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="marta@empresa.com"
            />

            {demo ? (
              <>
                <label htmlFor="team-role">Rol</label>
                <input
                  id="team-role"
                  value={roleLabel}
                  onChange={(event) => setRoleLabel(event.target.value)}
                  placeholder="Ej. Diseñadora"
                />
              </>
            ) : (
              <>
                <label htmlFor="team-role">Rol en la empresa</label>
                <select
                  id="team-role"
                  value={role}
                  onChange={(event) => setRole(event.target.value as "admin" | "member")}
                >
                  <option value="member">Miembro · trabaja, no aprueba</option>
                  <option value="admin">Admin · trabaja y aprueba</option>
                </select>
              </>
            )}

            <div className="team-modal-row">
              <button type="button" className="team-btn" onClick={() => setStep("choose")} disabled={busy}>
                Atrás
              </button>
              <button
                type="button"
                className="team-btn primary"
                onClick={() => void submitPerson()}
                disabled={busy || !email.trim()}
              >
                {busy ? "Añadiendo…" : demo ? "Añadir al equipo" : "Enviar invitación"}
              </button>
            </div>
            {!demo && (
              <p className="team-modal-hint">
                Si el correo ya tiene cuenta, solo se le añade a esta empresa. Si no, se crea la cuenta con
                estos datos.
              </p>
            )}
          </div>
        )}

        {step === "agent" && (
          <div className="team-form">
            {demo ? (
              availableAgents.length > 0 ? (
                <>
                  <p className="team-modal-hint">Agentes de AgntiaPro listos para trabajar en tu equipo.</p>
                  {availableAgents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      className="team-opt"
                      onClick={() => {
                        onActivateAgent(agent);
                        onClose();
                      }}
                    >
                      <span className="team-opt-avatar">{initialsOf(agent.name)}</span>
                      <span>
                        <b>
                          {agent.name} — {agent.role}
                        </b>
                        <small>{agent.objetivo ?? "Agente de AgntiaPro"}</small>
                      </span>
                    </button>
                  ))}
                </>
              ) : (
                <p className="team-modal-hint">
                  Todos los agentes del catálogo ya están en el equipo de ejemplo.
                </p>
              )
            ) : (
              <>
                <p className="team-modal-hint">
                  El agente se crea con la ficha completa: nombre, tono, objetivo, SOPs y memoria.
                </p>
                <button type="button" className="team-opt" onClick={onCreateAgent}>
                  <Bot size={16} />
                  <span>
                    <b>Nuevo agente</b>
                    <small>Configurar nombre, objetivo y SOPs</small>
                  </span>
                </button>
              </>
            )}

            <div className="team-modal-row">
              <button type="button" className="team-btn" onClick={() => setStep("choose")}>
                Atrás
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
