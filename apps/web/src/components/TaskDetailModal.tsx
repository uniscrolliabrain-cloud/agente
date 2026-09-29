import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { controlTask, getTaskDetail, answerTask } from "../api/tasks";
import type { AgentTask, TaskDetail } from "../types/api";

interface Props {
  taskId: string;
  onClose: () => void;
  onChanged: () => void;
}

type Tab = "plan" | "events" | "artifacts";

export default function TaskDetailModal({ taskId, onClose, onChanged }: Props) {
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [tab, setTab] = useState<Tab>("plan");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setDetail(await getTaskDetail(taskId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando detalle");
      }
    })();
  }, [taskId]);

  const control = async (action: "pause" | "resume" | "cancel" | "retry") => {
    try {
      await controlTask(taskId, action);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en control");
    }
  };

  const submitAnswer = async () => {
    try {
      await answerTask(taskId, answer);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al responder");
    }
  };

  const task: AgentTask | null = detail?.task ?? null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{task?.title ?? "Cargando…"}</div>
            <div className="modal-sub">{task?.id.slice(0, 12)} · {task?.status}</div>
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>

        <div className="tabs">
          <button className={tab === "plan" ? "active" : ""} onClick={() => setTab("plan")}>Plan</button>
          <button className={tab === "events" ? "active" : ""} onClick={() => setTab("events")}>Eventos</button>
          <button className={tab === "artifacts" ? "active" : ""} onClick={() => setTab("artifacts")}>Artifacts</button>
        </div>

        <div className="modal-body">
          {error && <div className="chat-error">{error}</div>}
          {!detail && !error && <div className="muted">Cargando…</div>}

          {detail && tab === "plan" && (
            <div className="plan-list">
              {task!.plan.map((p, i) => (
                <div key={p.id} className="plan-item">
                  <span className="plan-num">{i + 1}</span>
                  <span>{p.title}</span>
                  <span className="plan-check">{p.status === "succeeded" ? "●" : "○"}</span>
                </div>
              ))}
              <div className="control-row">
                <button className="ctrl-btn" onClick={() => control("pause")}>⏸ Pausar</button>
                <button className="ctrl-btn" onClick={() => control("resume")}>▶ Reanudar</button>
                <button className="ctrl-btn danger" onClick={() => control("cancel")}>✕ Cancelar</button>
                <button className="ctrl-btn" onClick={() => control("retry")}>↻ Reintentar</button>
              </div>
              {task!.status === "waiting_input" && (
                <div className="answer-box">
                  <label>Respuesta</label>
                  <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={3} />
                  <button className="primary-btn" style={{ marginTop: 8 }} onClick={submitAnswer}>
                    Enviar respuesta
                  </button>
                </div>
              )}
            </div>
          )}

          {detail && tab === "events" && (
            <div className="plan-list">
              {detail.events.map((ev) => (
                <div key={ev.id} className="plan-item">
                  <span className="plan-num" style={{ fontSize: 8 }}>{new Date(ev.date).toLocaleTimeString().slice(0, 5)}</span>
                  <span><b>{ev.title}</b>{ev.detail ? ` — ${ev.detail}` : ""}</span>
                </div>
              ))}
              {detail.events.length === 0 && <div className="muted">Sin eventos</div>}
            </div>
          )}

          {detail && tab === "artifacts" && (
            <div className="plan-list">
              {detail.artifacts.map((a) => (
                <div key={a.id} className="plan-item">
                  <span className="plan-num" style={{ fontSize: 10 }}>📄</span>
                  <span>{a.title}</span>
                  <span className="plan-check">{a.kind}</span>
                </div>
              ))}
              {detail.artifacts.length === 0 && <div className="muted">Sin artifacts</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ESCALATE_UI_REVERTED
