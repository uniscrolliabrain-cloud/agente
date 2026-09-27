import { useState } from "react";

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string | null;
}

export default function Login({ onLogin, error }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password || busy) return;
    setBusy(true);
    try {
      await onLogin(email.trim(), password);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-grad">AI</div>
          <div>
            <div className="logo-title">Agente IA Pro</div>
            <div className="logo-sub">OpenMuse Workspace</div>
          </div>
        </div>

        <h1>Bienvenido de vuelta</h1>
        <p className="muted">Entra con tu cuenta de empresa.</p>

        {error && <div className="login-error">{error}</div>}

        <label>Email</label>
        <div className="input-wrap">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@empresa.com"
            autoFocus
            disabled={busy}
            autoComplete="email"
          />
        </div>

        <label>Contrasena</label>
        <div className="input-wrap">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            disabled={busy}
            autoComplete="current-password"
            onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
          />
        </div>

        <button
          className="primary-btn"
          onClick={submit}
          disabled={busy || !email.trim() || !password}
        >
          {busy ? "Entrando..." : "Entrar"}
        </button>

        <div className="login-footer">OpenMuse - v0.2.0</div>
      </div>
    </div>
  );
}
