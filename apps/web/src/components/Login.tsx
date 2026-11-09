import { useState } from "react";

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  error: string | null;
}

export default function Login({ onLogin, error }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  // OAUTH_FIRST_UI_V1 - el acceso normal es la cuenta de Google o GitHub. El
  // formulario de contrasena sigue existiendo, pero detras de un enlace: sirve
  // para el admin local y para entrar si el proveedor no esta configurado.
  const [showPassword, setShowPassword] = useState(false);

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
            <div className="logo-title">Agntia Pro</div>
            <div className="logo-sub">Automatizaciones con IA</div>
          </div>
        </div>

        <h1>Entra en tu cuenta</h1>
        <p className="muted">Usa la cuenta de Google o GitHub de la agencia.</p>

        {error && <div className="login-error">{error}</div>}

        {/* OAUTH_LOGIN_UI_V1 - el acceso normal del producto es con la cuenta que
            la persona ya usa. Los botones son enlaces completos: el servidor hace
            el redirect al proveedor y vuelve escribiendo la sesion. */}
        <div className="oauth-row">
          <a className="oauth-btn" href="/api/auth/oauth/google/start">
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.5 2.9-2.1 5.3-4.5 6.9l7.2 5.6c4.2-3.9 6.9-9.6 6.9-16.8z" />
              <path fill="#FBBC05" d="M10.3 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.8-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.5 10.7l7.8-6.1z" />
              <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.2-5.6l-7.2-5.6c-2 1.4-4.6 2.2-8 2.2-6.4 0-11.8-3.7-13.7-8.9l-7.8 6.1C6.4 42.6 14.6 48 24 48z" />
            </svg>
            Continuar con Google
          </a>
          <a className="oauth-btn" href="/api/auth/oauth/github/start">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Continuar con GitHub
          </a>
        </div>

        {showPassword ? (
          <>
            <div className="login-divider"><span>o con contrasena</span></div>

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
          </>
        ) : (
          <button type="button" className="login-alt" onClick={() => setShowPassword(true)}>
            Entrar con contrasena
          </button>
        )}

        <div className="login-footer">Agntia Pro · Laia</div>
      </div>
    </div>
  );
}
