// AGENTS_VIEW_V1 - lista de agentes del tenant con su ficha y alta rapida.
// Las memorias y SOPs viven en el rol (AgentRole) y se muestran al abrir la
// ficha; aqui solo se leen y se crea un rol nuevo.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bot, Plus, X } from "lucide-react";
import {
  createAgent,
  listAgents,
  type AgentAvatar,
  type AgentRole,
  type AgentTone,
} from "../api/agents";

const TONES: { id: AgentTone; label: string }[] = [
  { id: "warm", label: "Cercano" },
  { id: "concise", label: "Directo" },
  { id: "thoughtful", label: "Reflexivo" },
];

const AVATAR_COLOR: Record<AgentAvatar, string> = {
  sky: "#4F7BF1",
  sand: "#C08A4B",
  lilac: "#8B7CF6",
};

const toneLabel = (tone: AgentTone) => TONES.find((item) => item.id === tone)?.label ?? tone;

export default function AgentsView() {
  const [agents, setAgents] = useState<AgentRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AgentRole | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAgents(await listAgents());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los agentes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeCount = useMemo(() => agents.filter((agent) => agent.active).length, [agents]);

  return (
    <div className="v2-tasks-view" style={{ maxWidth: 1000 }}>
      <div className="v2-tasks-header">
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <h1 className="v2-tasks-title">Agentes</h1>
          <div className="v2-tasks-meta">
            {agents.length} agentes · {activeCount} activos
          </div>
        </div>
        <button
          className="v2-need-action-btn"
          style={{ marginLeft: "auto", whiteSpace: "nowrap" }}
          onClick={() => setCreating(true)}
        >
          <Plus size={14} /> Nuevo agente
        </button>
      </div>

      {error && <div className="chat-error" style={{ marginBottom: 16 }}>{error}</div>}

      {agents.length === 0 && !loading ? (
        <div className="v2-tasks-empty" style={{ padding: "40px 20px" }}>
          <Bot size={22} style={{ marginBottom: 8, color: "var(--v2-purple)" }} />
          <p style={{ margin: 0, fontSize: 13, color: "var(--v2-text)" }}>Todavía no hay agentes.</p>
          <small style={{ color: "var(--v2-text-3)" }}>Crea el primero con el botón de arriba.</small>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 12,
          }}
        >
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="v2-suggestion-card"
              style={{
                cursor: "pointer",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 12,
                opacity: agent.active ? 1 : 0.72,
              }}
              onClick={() => setDetail(agent)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  className="v2-suggestion-icon"
                  style={{
                    background: AVATAR_COLOR[agent.avatar],
                    borderColor: AVATAR_COLOR[agent.avatar],
                    color: "#FFF",
                    fontWeight: 700,
                  }}
                >
                  {agent.name.slice(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: "var(--v2-text-3)", marginTop: 2 }}>
                    {toneLabel(agent.tone)} · {agent.active ? "Activo" : "En pausa"}
                  </div>
                </div>
                <span className={`v2-tag ${agent.active ? "agent" : ""}`}>
                  {agent.memories.length} mem
                </span>
              </div>

              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: "var(--v2-text-2)",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {agent.objetivo}
              </div>

              {agent.roi && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--v2-text-3)",
                    borderTop: "1px solid var(--v2-border)",
                    paddingTop: 8,
                  }}
                >
                  {agent.roi}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  fontSize: 11,
                  color: "var(--v2-text-3)",
                  marginTop: "auto",
                }}
              >
                <span>{agent.sops.length} SOPs</span>
                <span>{agent.memories.length} memorias</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal small" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  className="v2-suggestion-icon"
                  style={{
                    background: AVATAR_COLOR[detail.avatar],
                    borderColor: AVATAR_COLOR[detail.avatar],
                    color: "#FFF",
                    fontWeight: 700,
                  }}
                >
                  {detail.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="modal-title">{detail.name}</div>
                  <div className="modal-sub">
                    {toneLabel(detail.tone)} · {detail.active ? "Activo" : "En pausa"}
                  </div>
                </div>
              </div>
              <button className="ghost-icon-button" onClick={() => setDetail(null)} aria-label="Cerrar">
                <X size={17} />
              </button>
            </div>
            <div className="modal-body" style={{ display: "grid", gap: 14 }}>
              {detail.greeting && (
                <div style={{ fontSize: 12.5, fontStyle: "italic", color: "var(--v2-text-2)" }}>
                  “{detail.greeting}”
                </div>
              )}
              <div>
                <div className="modal-label">Objetivo</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>{detail.objetivo}</div>
              </div>
              {detail.roi && (
                <div>
                  <div className="modal-label">Impacto esperado</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--v2-text-2)" }}>
                    {detail.roi}
                  </div>
                </div>
              )}
              <div>
                <div className="modal-label">SOPs ({detail.sops.length})</div>
                {detail.sops.length === 0 ? (
                  <div className="muted">Sin SOPs asignados.</div>
                ) : (
                  <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
                    {detail.sops.map((sop) => (
                      <li key={sop}>{sop}</li>
                    ))}
                  </ol>
                )}
              </div>
              <div>
                <div className="modal-label">Memoria ({detail.memories.length})</div>
                {detail.memories.length === 0 ? (
                  <div className="muted">Sin memoria todavía.</div>
                ) : (
                  <div style={{ display: "grid", gap: 6 }}>
                    {detail.memories.map((memory, index) => (
                      <div
                        key={`${memory.kind}-${index}`}
                        style={{
                          padding: "8px 10px",
                          background: "var(--v2-bg-soft)",
                          border: "1px solid var(--v2-border)",
                          borderRadius: 8,
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        <span className="v2-tag" style={{ marginRight: 6 }}>
                          {memory.kind}
                        </span>
                        {memory.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {creating && (
        <AgentCreateModal
          onClose={() => setCreating(false)}
          onCreated={async () => {
            setCreating(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function AgentCreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => Promise<void>;
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
      await createAgent({
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
      await onCreated();
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
            placeholder="Clasificar la consulta&#10;Buscar en la documentación"
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
