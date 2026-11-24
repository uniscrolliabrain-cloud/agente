import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  Folder,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { BrandLockup } from "../../../web/src/components/BrandMark";
import { legalUrl } from "../vendor/config/publicSite";
import "../design-system/agntia-tokens.css";
import "./login-v3.css";

// LOGIN_V3_LAB_V1 - prototipo visual aislado. No ejecuta OAuth, autenticación,
// conversación ni invitaciones reales: los estados declaran la ausencia de
// servicio. Contratos de producción (onLogin/onEnterDemo y las rutas
// /api/auth/oauth/{google,github}/start de Login.tsx) quedan intactos.

export interface LoginV3Props {
  onLogin?: (email: string, password: string) => Promise<void>;
  onEnterDemo?: () => Promise<void>;
}

const benefits = [
  {
    icon: MessageCircle,
    title: "Tan natural como conversar",
    text: "Cuéntale a LAIA qué necesitas. Ella organiza el trabajo con tu equipo.",
  },
  {
    icon: Folder,
    title: "Con el contexto de tu negocio",
    text: "Tus clientes, tu equipo y tus prioridades, en el mismo lugar de trabajo.",
  },
  {
    icon: ShieldCheck,
    title: "Las decisiones importantes, contigo",
    text: "LAIA prepara y propone. Tú apruebas las decisiones sensibles.",
  },
] as const;

const chips = ["Quiero más clientes", "Organizar mi equipo", "Automatizar mi atención"] as const;

const OAUTH_NOTICE = {
  google: "Entorno de prueba: el acceso con Google no está conectado en esta maqueta.",
  github: "Entorno de prueba: el acceso con GitHub no está conectado en esta maqueta.",
} as const;

const CHAT_NOTICE = "El chat público no está conectado en esta maqueta. Tu mensaje no se ha enviado.";
const PASSWORD_NOTICE = "Entorno de prueba: la autenticación no está conectada. No se ha enviado nada.";
const INVITE_NOTICE = "El servicio de invitaciones no está conectado en esta maqueta. No se ha guardado ningún dato.";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Presencia animada: monta antes de expandir y desmonta al terminar el cierre,
// de modo que la altura se anima con continuidad de layout (grid 0fr → 1fr).
function useCollapse(open: boolean, duration = 260) {
  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      if (prefersReducedMotion()) {
        setExpanded(true);
        return;
      }
      let inner = 0;
      const outer = window.requestAnimationFrame(() => {
        inner = window.requestAnimationFrame(() => setExpanded(true));
      });
      return () => {
        window.cancelAnimationFrame(outer);
        window.cancelAnimationFrame(inner);
      };
    }
    setExpanded(false);
    if (prefersReducedMotion()) {
      setMounted(false);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), duration);
    return () => window.clearTimeout(timer);
  }, [open, duration]);

  return { mounted, expanded };
}

export default function LoginV3({ onLogin }: LoginV3Props) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatNotice, setChatNotice] = useState<string | null>(null);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteClosing, setInviteClosing] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", company: "", time: "" });
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  const chatSectionRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const inviteDialogRef = useRef<HTMLDialogElement>(null);
  const inviteTriggerRef = useRef<HTMLButtonElement>(null);
  const inviteNameRef = useRef<HTMLInputElement>(null);
  const inviteEmailRef = useRef<HTMLInputElement>(null);
  const inviteCompanyRef = useRef<HTMLInputElement>(null);

  const chatPanel = useCollapse(chatOpen);
  const passwordPanel = useCollapse(showPassword);

  // Al colapsar el acceso con contraseña no se conserva ningún dato sensible.
  useEffect(() => {
    if (showPassword) return;
    setPassword("");
    setPasswordVisible(false);
    setPasswordError(null);
    setPasswordNotice(null);
  }, [showPassword]);

  function openChat() {
    setChatOpen(true);
    setChatNotice(null);
  }

  function toggleChat() {
    setChatOpen((open) => {
      if (!open) setChatNotice(null);
      return !open;
    });
  }

  function prefillChat(text: string) {
    setChatOpen(true);
    setChatInput(text);
    setChatNotice(null);
    window.requestAnimationFrame(() => {
      chatInputRef.current?.focus();
      chatSectionRef.current?.scrollIntoView({
        block: "nearest",
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    });
  }

  function submitChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChatNotice(CHAT_NOTICE);
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim();
    let error: string | null = null;
    let invalidField: "email" | "password" | null = null;
    if (!cleanEmail) {
      error = "Escribe el email de tu empresa.";
      invalidField = "email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      error = "Escribe un email válido.";
      invalidField = "email";
    } else if (!password) {
      error = "Escribe tu contraseña.";
      invalidField = "password";
    }
    setPasswordError(error);
    setPasswordNotice(null);
    if (invalidField) {
      (invalidField === "email" ? emailRef : passwordRef).current?.focus();
      return;
    }
    if (!onLogin) {
      setPasswordNotice(PASSWORD_NOTICE);
      return;
    }
    setPasswordBusy(true);
    try {
      await onLogin(cleanEmail, password);
    } catch {
      setPasswordError("No se pudo iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setPasswordBusy(false);
    }
  }

  function openInvite() {
    setInviteNotice(null);
    setInviteError(null);
    setInviteClosing(false);
    setInviteOpen(true);
    inviteDialogRef.current?.showModal();
  }

  function closeInvite() {
    const dialog = inviteDialogRef.current;
    if (!dialog?.open || inviteClosing) return;
    if (prefersReducedMotion()) {
      dialog.close();
      return;
    }
    setInviteClosing(true);
    window.setTimeout(() => {
      setInviteClosing(false);
      dialog.close();
    }, 180);
  }

  function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = invite.email.trim();
    let missing: string | null = null;
    let invalidField: "name" | "email" | "company" | null = null;
    if (!invite.name.trim()) {
      missing = "Indica tu nombre.";
      invalidField = "name";
    } else if (!cleanEmail) {
      missing = "Indica el email de tu empresa.";
      invalidField = "email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      missing = "Escribe un email válido.";
      invalidField = "email";
    } else if (!invite.company.trim()) {
      missing = "Indica el nombre de tu empresa.";
      invalidField = "company";
    }
    setInviteError(missing);
    setInviteNotice(null);
    if (invalidField) {
      const target =
        invalidField === "name" ? inviteNameRef : invalidField === "email" ? inviteEmailRef : inviteCompanyRef;
      target.current?.focus();
      return;
    }
    setInviteNotice(INVITE_NOTICE);
  }

  const chatId = "login-v3-chat";

  return (
    <div className="agntia-workspace login-v3">
      <a className="lv3-skip" href="#login-v3-acceso">
        Ir al acceso
      </a>

      <header className="login-v3-header">
        <div className="lv3-wrap lv3-header-row">
          <BrandLockup markSize={32} />
          <span className="lv3-pill">
            <ShieldCheck size={14} aria-hidden="true" />
            Acceso protegido
          </span>
        </div>
      </header>

      <main className="lv3-wrap lv3-main">
        <section className="lv3-hero" aria-labelledby="login-v3-title">
          <p className="lv3-eyebrow lv3-anim lv3-d1">
            <span className="lv3-gold-line" aria-hidden="true" />
            TU EMPRESA, UN EQUIPO DIGITAL.
          </p>
          <h1 id="login-v3-title" className="lv3-anim lv3-d1">
            Tu empresa, siempre
            <br className="lv3-h1-break" /> un paso <em>por delante.</em>
          </h1>
          <div className="lv3-lead lv3-anim lv3-d2">
            <p className="lv3-lead-strong">Imagina poder hablar con tu empresa.</p>
            <p>
              <b>LAIA</b> coordina un equipo de agentes que trabaja contigo.
            </p>
          </div>

          <ul className="lv3-benefits lv3-anim lv3-d2">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon size={18} aria-hidden="true" />
                <div>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="lv3-preview lv3-anim lv3-d3">
            <div className="lv3-preview-row">
              <span className="lv3-spark" aria-hidden="true">
                <Sparkles size={19} />
              </span>
              <div>
                <span className="lv3-micro">LAIA</span>
                <p>Hola, soy LAIA. ¿Qué te gustaría quitarte de encima?</p>
              </div>
            </div>
            <div className="lv3-chips">
              {chips.map((chip) => (
                <button key={chip} type="button" onClick={() => prefillChat(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="lv3-access" id="login-v3-acceso" tabIndex={-1}>
          <section className="lv3-card lv3-anim lv3-d2" aria-labelledby="login-v3-access-title">
            <h2 id="login-v3-access-title" className="lv3-card-title">
              Entra en tu cuenta
            </h2>
            <p className="lv3-card-sub">Usa la cuenta de Google o GitHub de tu empresa.</p>

            <div className="lv3-oauth">
              <button
                type="button"
                className="lv3-oauth-btn"
                onClick={() => setOauthNotice(OAUTH_NOTICE.google)}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.5 2.9-2.1 5.3-4.5 6.9l7.2 5.6c4.2-3.9 6.9-9.6 6.9-16.8z" />
                  <path fill="#FBBC05" d="M10.3 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.8-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.5 10.7l7.8-6.1z" />
                  <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.2-5.6l-7.2-5.6c-2 1.4-4.6 2.2-8 2.2-6.4 0-11.8-3.7-13.7-8.9l-7.8 6.1C6.4 42.6 14.6 48 24 48z" />
                </svg>
                Continuar con Google
              </button>
              <button
                type="button"
                className="lv3-oauth-btn"
                onClick={() => setOauthNotice(OAUTH_NOTICE.github)}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Continuar con GitHub
              </button>
            </div>
            {oauthNotice && (
              <p className="lv3-inline-notice" role="status">
                {oauthNotice}
              </p>
            )}

            <div className="lv3-divider" role="presentation">
              <span>O CONTINÚA CON</span>
            </div>

            <div className="lv3-laia">
              <div className="lv3-laia-head">
                <span className="lv3-laia-icon" aria-hidden="true">
                  <Sparkles size={17} />
                </span>
                <div>
                  <h3>Habla con LAIA sin cuenta</h3>
                  <p>Una primera conversación de 30 minutos, sin registro ni compromiso.</p>
                </div>
              </div>
              <button
                type="button"
                className="lv3-cta lv3-cta-violet"
                onClick={toggleChat}
                aria-expanded={chatOpen}
                aria-controls={chatId}
              >
                {chatOpen ? "Cerrar chat" : "Hablar con LAIA ahora"}
                {!chatOpen && <ArrowRight size={16} aria-hidden="true" />}
              </button>
            </div>

            <div
              className={`lv3-chat-space lv3-collapse${chatPanel.expanded ? " is-open" : ""}`}
              id={chatId}
              ref={chatSectionRef}
              aria-label="Conversación con LAIA"
            >
              {chatPanel.mounted && (
                <div className="lv3-chat">
                  <div className="lv3-chat-head">
                <span className="lv3-chat-name">LAIA</span>
                <span className="lv3-chat-status">Servicio no conectado</span>
              </div>
                  <div className="lv3-chat-log" role="log" aria-live="polite" aria-label="Mensajes">
                    <p className="lv3-msg lv3-msg-laia">
                      Hola, soy LAIA. ¿Qué te gustaría quitarte de encima?
                    </p>
                  </div>
                  {chatNotice && (
                    <p className="lv3-inline-notice" role="status">
                      {chatNotice}
                    </p>
                  )}
                  <form className="lv3-composer" onSubmit={submitChat}>
                    <input
                      ref={chatInputRef}
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      placeholder="Cuéntale a LAIA qué necesitas…"
                      aria-label="Mensaje para LAIA"
                      autoComplete="off"
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                          event.preventDefault();
                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                    />
                    <button type="submit" className="lv3-send" aria-label="Enviar mensaje">
                      <ArrowUp size={16} aria-hidden="true" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="lv3-password">
              <button
                type="button"
                className="lv3-underlined"
                onClick={() => setShowPassword((open) => !open)}
                aria-expanded={showPassword}
                aria-controls="login-v3-password-form"
              >
                Entrar con contraseña
                <ChevronDown
                  size={12}
                  aria-hidden="true"
                  className={showPassword ? "lv3-chevron lv3-chevron-open" : "lv3-chevron"}
                />
              </button>

              <div className={`lv3-collapse${passwordPanel.expanded ? " is-open" : ""}`}>
                {passwordPanel.mounted && (
                <form id="login-v3-password-form" className="lv3-form" onSubmit={submitPassword} noValidate>
                  <label htmlFor="login-v3-email">Email de tu empresa</label>
                  <input
                    id="login-v3-email"
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="tu@empresa.com"
                    disabled={passwordBusy}
                  />

                  <label htmlFor="login-v3-password">Contraseña</label>
                  <div className="lv3-input-wrap">
                    <input
                      id="login-v3-password"
                      ref={passwordRef}
                      type={passwordVisible ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      disabled={passwordBusy}
                    />
                    <button
                      type="button"
                      className="lv3-reveal"
                      onClick={() => setPasswordVisible((visible) => !visible)}
                      aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                      aria-pressed={passwordVisible}
                    >
                      {passwordVisible ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                    </button>
                  </div>

                  {passwordError && (
                    <p className="lv3-error" role="alert">
                      {passwordError}
                    </p>
                  )}
                  {passwordNotice && (
                    <p className="lv3-inline-notice" role="status">
                      {passwordNotice}
                    </p>
                  )}

                                      <button type="submit" className="lv3-cta lv3-cta-dark" disabled={passwordBusy}>
                      {passwordBusy ? "Entrando…" : "Entrar"}
                    </button>
                </form>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Invitación y legal: en escritorio van bajo la tarjeta; en móvil, al final. */}
        <div className="lv3-access-foot">
          <section className="lv3-invite lv3-anim lv3-d3" aria-labelledby="login-v3-invite-title">
            <h2 id="login-v3-invite-title">¿No tienes acceso todavía?</h2>
            <p>
              AgntiaPro funciona por invitación. Si tu equipo ya está dentro, pide que te inviten.
            </p>
            <button
              type="button"
              className="lv3-cta lv3-cta-dark"
              onClick={openInvite}
              ref={inviteTriggerRef}
              aria-expanded={inviteOpen}
              aria-haspopup="dialog"
            >
              Conseguir una invitación
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <p className="lv3-invite-note">Te avisamos cuando haya sitio para tu empresa.</p>
          </section>

          <footer className="lv3-footer">
            <span>© 2026 AgntiaPro</span>
            <span aria-hidden="true">·</span>
            <a href={legalUrl("notice")}>Aviso legal</a>
            <span aria-hidden="true">·</span>
            <a href={legalUrl("privacy")}>Privacidad</a>
            <span aria-hidden="true">·</span>
            <a href={legalUrl("ai")}>Transparencia IA</a>
          </footer>
        </div>
      </main>

      <dialog
        ref={inviteDialogRef}
        className={inviteClosing ? "lv3-dialog is-closing" : "lv3-dialog"}
        aria-labelledby="login-v3-invite-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          closeInvite();
        }}
        onClose={() => {
          setInviteOpen(false);
          // En el siguiente frame: el navegador aún devuelve el foco por su cuenta
          // al cerrar el diálogo y puede dejarlo en <body>.
          requestAnimationFrame(() => inviteTriggerRef.current?.focus());
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeInvite();
        }}
      >
        <div className="lv3-dialog-inner">
          <div className="lv3-dialog-head">
            <h2 id="login-v3-invite-dialog-title">Conseguir una invitación</h2>
            <button type="button" className="lv3-icon-btn" onClick={closeInvite} aria-label="Cerrar">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <p className="lv3-dialog-lead">Déjanos un poco de contexto sobre tu empresa.</p>

          <form className="lv3-form" onSubmit={submitInvite} noValidate>
            <label htmlFor="lv3-invite-name">Nombre</label>
            <input
              id="lv3-invite-name"
              ref={inviteNameRef}
              value={invite.name}
              onChange={(event) => setInvite({ ...invite, name: event.target.value })}
              autoComplete="name"
            />

            <label htmlFor="lv3-invite-email">Email de empresa</label>
            <input
              id="lv3-invite-email"
              ref={inviteEmailRef}
              type="email"
              value={invite.email}
              onChange={(event) => setInvite({ ...invite, email: event.target.value })}
              autoComplete="email"
            />

            <label htmlFor="lv3-invite-company">Empresa</label>
            <input
              id="lv3-invite-company"
              ref={inviteCompanyRef}
              value={invite.company}
              onChange={(event) => setInvite({ ...invite, company: event.target.value })}
              autoComplete="organization"
            />

            <label htmlFor="lv3-invite-time">¿Qué te quita más tiempo? (opcional)</label>
            <input
              id="lv3-invite-time"
              value={invite.time}
              onChange={(event) => setInvite({ ...invite, time: event.target.value })}
            />

            {inviteError && (
              <p className="lv3-error" role="alert">
                {inviteError}
              </p>
            )}
            {inviteNotice && (
              <p className="lv3-inline-notice" role="status">
                {inviteNotice}
              </p>
            )}

            <button type="submit" className="lv3-cta lv3-cta-violet">
              Pedir invitación
            </button>
            <button
              type="button"
              className="lv3-underlined lv3-dialog-alt"
              onClick={() => {
                closeInvite();
                openChat();
              }}
            >
              Hablar con LAIA sin cuenta
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}
