// ONBOARDING_V1 - primeros pasos del usuario nuevo.
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface Step {
  id: string;
  title: string;
  hint: string;
}

const STEPS: Step[] = [
  { id: "profile",  title: "Cambia tu contrasena",      hint: "Mi perfil -> Cambiar contrasena" },
  { id: "google",   title: "Conecta Google",            hint: "Mi perfil -> Google Workspace" },
  { id: "chat",     title: "Habla con el asistente",    hint: "Escribe algo en el chat" },
  { id: "task",     title: "Crea tu primera tarea",     hint: "Pidele al asistente algo concreto" },
];

const STORAGE_KEY = "openmuse_onboarding_done";

export default function Onboarding() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setDone(new Set(parsed));
      setVisible(parsed.length < STEPS.length);
    } catch {
      setVisible(true);
    }
  }, []);

  const mark = (id: string) => {
    const next = new Set(done);
    next.add(id);
    setDone(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    if (next.size >= STEPS.length) setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STEPS.map((s) => s.id)));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="v2-composer" style={{ padding: 16, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <strong style={{ fontSize: 14 }}>Primeros pasos</strong>
        <button className="v2-pill" onClick={dismiss} title="Ocultar">
          <X size={12} />
        </button>
      </div>
      {STEPS.map((s) => (
        <div
          key={s.id}
          style={{ display: "flex", gap: 8, padding: "6px 0", alignItems: "center", cursor: "pointer" }}
          onClick={() => mark(s.id)}
        >
          {done.has(s.id) ? <Check size={14} style={{ color: "var(--v2-green)" }} /> : <span style={{ width: 14, height: 14, border: "1px solid var(--v2-border)", borderRadius: 3 }} />}
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.title}</div>
            <div style={{ fontSize: 11, color: "var(--v2-text-3)" }}>{s.hint}</div>
          </div>
        </div>
      ))}
    </div>
  );
}