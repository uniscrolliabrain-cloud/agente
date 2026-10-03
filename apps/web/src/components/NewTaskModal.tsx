// NEW_TASK_MODAL_V1 - modal para crear tareas con selector de rol.

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../api/client";

interface AgentRole {
  id: string;
  name: string;
}

interface Props {
  onClose: () => void;
  onCreated?: () => void;
}

export default function NewTaskModal({ onClose, onCreated }: Props) {
  const [roles, setRoles] = useState<AgentRole[]>([]);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [roleId, setRoleId] = useState<string | undefined>(undefined);
  const [kind, setKind] = useState<"agent" | "document" | "monitor" | "finance" | "plan" | "sop">("agent");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const list = await apiFetch<AgentRole[]>("/api/agent/roles");
        setRoles(list);
      } catch { /* silencio */ }
    })();
  }, []);

  const submit = async () => {
    if (!prompt.trim()) {
      setError("El prompt es obligatorio");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/agent/tasks", {
        method: "POST",
        body: {
          ...(title.trim() ? { title: title.trim() } : {}),
          prompt: prompt.trim(),
          kind,
          ...(roleId ? { roleId } : {}),
        },
      });
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creando tarea");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">Nueva tarea</div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          <label className="modal-label">Titulo (opcional)</label>
          <input
            className="v2-pill"
            style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="modal-label">Prompt</label>
          <textarea
            className="v2-pill"
            style={{ width: "100%", padding: "8px 12px", marginBottom: 8, minHeight: 80 }}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <label className="modal-label">Tipo</label>
          <select
            className="v2-pill"
            style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
            value={kind}
            onChange={(e) => setKind(e.target.value as typeof kind)}
          >
            <option value="agent">Agente</option>
            <option value="document">Documento</option>
            <option value="monitor">Vigilancia</option>
            <option value="finance">Finanzas</option>
            <option value="plan">Plan</option>
            <option value="sop">SOP</option>
          </select>
          <label className="modal-label">Rol asignado</label>
          <select
            className="v2-pill"
            style={{ width: "100%", padding: "8px 12px", marginBottom: 8 }}
            value={roleId ?? ""}
            onChange={(e) => setRoleId(e.target.value || undefined)}
          >
            <option value="">Sin rol</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
            ))}
          </select>
          {error && <div className="chat-error" style={{ marginTop: 8 }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button className="v2-pill" onClick={onClose}>Cancelar</button>
            <button className="v2-need-action-btn" onClick={submit} disabled={busy}>
              {busy ? "Creando…" : "Crear tarea"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}