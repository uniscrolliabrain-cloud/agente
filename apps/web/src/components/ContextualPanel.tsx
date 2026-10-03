// CONTEXTUAL_DETAIL_RELATIONS_V1 - DetailSpec con relaciones tipadas.
// STUB_112_V1 - A2.5 FormSpec auto-construido desde Business Schema en el siguiente bloque.
// A2.6 tabs Vista/Formulario/Contexto en el siguiente bloque.
// A2.7 cascada y slide-in ya estan aplicados via panel-slide-in.
// A2.8 persistencia del panel via localStorage en el siguiente bloque.// CONTEXTUAL_PANEL_V1 - panel derecho con tabs: Tareas, Contexto, Negocio.
import { useEffect, useState } from "react";

type Tab = "tasks" | "context" | "business";

interface Props {
  activeTab?: Tab;
  onClose?: () => void;
}

export default function ContextualPanel({ activeTab = "tasks", onClose }: Props) {
  const [tab, setTab] = useState<Tab>(activeTab);
  const [tasks, setTasks] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [memories, setMemories] = useState<Array<{ id: string; text: string }>>([]);
  const [entities, setEntities] = useState<Array<{ id: string; name: string; type: string }>>([]);

  const token = (() => {
    try {
      const raw = localStorage.getItem("openmuse_auth");
      return raw ? JSON.parse(raw).token : "";
    } catch {
      return "";
    }
  })();

  useEffect(() => {
    if (tab !== "tasks") return;
    void fetch("/api/agent", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { tasks: [] }))
      .then((w) => setTasks((w.tasks ?? []).slice(0, 20)))
      .catch(() => {});
  }, [tab, token]);

  useEffect(() => {
    if (tab !== "context") return;
    void fetch("/api/agent", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { memories: [] }))
      .then((w) => setMemories((w.memories ?? []).slice(0, 20)))
      .catch(() => {});
  }, [tab, token]);

  useEffect(() => {
    if (tab !== "business") return;
    void fetch("/api/business/entities", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : { entities: [] }))
      .then((w) => setEntities((w.entities ?? []).slice(0, 20)))
      .catch(() => {});
  }, [tab, token]);

  return (
    <div className="panel-slide-in" style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {(["tasks", "context", "business"] as Tab[]).map((t) => (
          <button
            key={t}
            className={`v2-pill ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "tasks" ? "Tareas" : t === "context" ? "Contexto" : "Negocio"}
          </button>
        ))}
        {onClose && (
          <button className="v2-pill" style={{ marginLeft: "auto" }} onClick={onClose}>
            Cerrar
          </button>
        )}
      </div>

      {tab === "tasks" && (
        <div>
          {tasks.length === 0 && <div style={{ fontSize: 11, color: "var(--v2-text-3)" }}>Sin tareas.</div>}
          {tasks.map((t) => (
            <div key={t.id} className="v2-task-row" style={{ padding: "6px 0" }}>
              <div className="v3-task-body">
                <div className="v3-task-title">{t.title}</div>
                <div className="v3-task-sub">{t.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "context" && (
        <div>
          {memories.length === 0 && <div style={{ fontSize: 11, color: "var(--v2-text-3)" }}>Sin contexto.</div>}
          {memories.map((m) => (
            <div key={m.id} className="v3-task-row" style={{ padding: "6px 0" }}>
              <div className="v3-task-body">
                <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{m.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "business" && (
        <div>
          {entities.length === 0 && <div style={{ fontSize: 11, color: "var(--v2-text-3)" }}>Sin entidades.</div>}
          {entities.map((e) => (
            <div key={e.id} className="v3-task-row" style={{ padding: "6px 0" }}>
              <div className="v3-task-body">
                <div className="v3-task-title">{e.name}</div>
                <div className="v3-task-sub">{e.type}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}