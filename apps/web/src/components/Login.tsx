import { useState } from "react";

interface LoginProps {
  onLogin: (accessKey: string) => Promise<void>;
  pending: boolean;
  error: string | null;
}

export default function Login({ onLogin, pending, error }: LoginProps) {
  const [accessKey, setAccessKey] = useState("");
  const submit = () => {
    if (!accessKey.trim() || pending) return;
    void onLogin(accessKey);
  };
  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-grad">IA</div>
          <div>
            <div className="logo-title">Agente IA Pro</div>
            <div className="logo-sub">Frontend OpenMuse</div>
          </div>
        </div>
        <h1>Bienvenido de vuelta</h1>
        <p className="muted">Ingresa tu access key para continuar.</p>
        {error && <div className="login-error">{error}</div>}
        <label>Access Key</label>
        <div className="input-wrap">
          <input
            type="password"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            placeholder="sk_openmuse_..."
            autoFocus
            disabled={pending}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
        </div>
        <button className="primary-btn" onClick={submit} disabled={pending || !accessKey.trim()}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
        <div className="login-footer">Vite + React + CSS plano · Sin dependencias UI</div>
      </div>
    </div>
  );
}
