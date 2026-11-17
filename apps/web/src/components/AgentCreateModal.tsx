// AGENT_CREATE_MODAL_V1 - alta rapida de un rol de agente.
// Se extrajo de AgentsView para poder abrir el mismo formulario desde "Hoy"
// sin duplicar el contrato con POST /api/agent/roles.
import { useState } from "react";
import { X } from "lucide-react";
import {
  createAgent,
  type AgentAvatar,
  type AgentRole,
  type AgentTone,
} from "../api/agents";

const TONES: { id: AgentTone; label: string }[] = [
  { id: "warm", label: "Cercano" },
  { id: "concise", label: "Directo" },
  { id: "thoughtful", label: "Reflexivo" },
];

export default function AgentCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (agent: AgentRole) => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [tone, setTone] = useState<AgentTone>("warm");
  const [avatar, setAvatar] = useState<AgentAvatar>("sky");
  const [objetivo, setObjetivo] = useState("");
  const [greeting, setGreeting] = useState("");
  const [roi, setRoi] = useState("");
  const [sops, setSops] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim() || !objetivo.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const created = await createAgent({
        id: `agent-${Date.now().toString(36)}`,
        name: name.trim(),
        tone,
        avatar,
        greeting: greeting.trim(),
        roi: roi.trim(),
        objetivo: objetivo.trim(),
        sops: sops
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        active,
        memories: [],
      });
      await onCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el agente");
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Nuevo agente</div>
            <div className="modal-sub">Define objetivo, tono y SOPs</div>
          </div>
          <button className="ghost-icon-button" onClick={onClose} aria-label="Cerrar">
            <X size={17} />
          </button>
        </div>
        <div className="modal-body" style={{ display: "grid", gap: 12 }}>
          {error && <div className="chat-error">{error}</div>}

          <label className="modal-label" htmlFor="agent-name">Nombre</label>
          <input
            id="agent-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej: Vera"
            autoFocus
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label className="modal-label" htmlFor="agent-tone">Tono</label>
              <select
                id="agent-tone"
                value={tone}
                onChange={(event) => setTone(event.target.value as AgentTone)}
              >
                {TONES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="modal-label" htmlFor="agent-avatar">Color</label>
              <select
                id="agent-avatar"
                value={avatar}
                onChange={(event) => setAvatar(event.target.value as AgentAvatar)}
              >
                <option value="sky">Azul</option>
                <option value="sand">Arena</option>
                <option value="lilac">Lila</option>
              </select>
            </div>
          </div>

          <label className="modal-label" htmlFor="agent-objetivo">Objetivo</label>
          <textarea
            id="agent-objetivo"
            rows={3}
            value={objetivo}
            onChange={(event) => setObjetivo(event.target.value)}
            placeholder="Qué hace este agente y para qué"
          />

          <label className="modal-label" htmlFor="agent-greeting">Saludo</label>
          <input
            id="agent-greeting"
            type="text"
            value={greeting}
            onChange={(event) => setGreeting(event.target.value)}
            placeholder="Hola, soy…"
          />

          <label className="modal-label" htmlFor="agent-roi">Impacto esperado</label>
          <input
            id="agent-roi"
            type="text"
            value={roi}
            onChange={(event) => setRoi(event.target.value)}
            placeholder="Ej: reduce el tiempo de respuesta a la mitad"
          />

          <label className="modal-label" htmlFor="agent-sops">SOPs (uno por línea)</label>
          <textarea
            id="agent-sops"
            rows={3}
            value={sops}
            onChange={(event) => setSops(event.target.value)}
            placeholder={"Clasificar la consulta\nBuscar en la documentación"}
          />

          <label
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}
            htmlFor="agent-active"
          >
            <input
              id="agent-active"
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
            />
            Activo desde el primer día
          </label>

          <div className="control-row" style={{ justifyContent: "flex-end", marginTop: 4 }}>
            <button className="ctrl-btn" onClick={onClose} disabled={busy}>Cancelar</button>
            <button
              className="primary-btn"
              onClick={() => void submit()}
              disabled={busy || !name.trim() || !objetivo.trim()}
            >
              {busy ? "Creando…" : "Crear agente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
