import { useEffect, useRef, useState } from "react";
import "./landing.css";
import { BrandLockup } from "../components/BrandMark";
import {
  ArrowUp,
  Check,
  CheckCheck,
  Clock3,
  Folder,
  Menu,
  MessageCircle,
  Mic,
  Paperclip,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import ProductScene, { productViews } from "./ProductScene";

const laiaUrl = "/landing/laia.png";
const antonioUrl = "/landing/antonio.png";
const pedroUrl = "/landing/pedro.png";

const initialMessages = [{ role: "laia", text: "Hola, soy LAIA. ¿Qué te gustaría quitarte de encima en tu empresa?" }];

const agents = [
  {
    id: "laia",
    name: "LAIA",
    role: "Supervisora · Atención · Manager",
    img: laiaUrl,
    duration: "0:35",
    quote: "¿Y si pudieras hablar directamente con tu empresa?",
    detail:
      "Pregunta, delega y supervisa. LAIA coordina al equipo y te trae el resultado, con tu aprobación en lo sensible.",
  },
  {
    id: "antonio",
    name: "Antonio",
    role: "Finanzas · Gestoría · Banca",
    img: antonioUrl,
    duration: "0:30",
    quote: "¿Sabes realmente qué está pasando con tus números?",
    detail: "Cobros, gastos y obligaciones en orden, explicados en claro y sin perderte en carpetas ni plazos.",
  },
  {
    id: "pedro",
    name: "Pedro",
    role: "Ciberseguridad · Diseño web y gráfico",
    img: pedroUrl,
    duration: "0:40",
    quote: "Tu empresa segura, tu web vendiendo, tu marca cuidada.",
    detail: "Protección, presencia y diseño que trabajan cada día por tu negocio, con tu tono y tu marca.",
  },
];

const supportAgents = [
  {
    name: "Marcos",
    role: "Operaciones",
    initials: "M",
    detail: "Recepción, tareas y seguimiento sin que nada se quede en el aire.",
  },
  { name: "Ana", role: "RRHH", initials: "A", detail: "Turnos, incorporaciones y seguimiento de tu equipo humano." },
  { name: "Juan", role: "Gestoría", initials: "J", detail: "Trámites y obligaciones con orden, aviso y control." },
];

const chips = ["Quiero más clientes", "Organizar mi equipo", "Automatizar mi atención"];
const subtitles = [
  "Habla con tu empresa. Así de simple.",
  "Pregunta, delega y supervisa.",
  "Tu equipo digital, coordinado.",
  "Tú diriges. Ellos ejecutan.",
];

function laiaReply(q) {
  const s = q.toLowerCase();
  if (s.includes("cliente"))
    return "Claro. Empezaríamos por lo que más mueve tu negocio: captación y atención. Te ayudamos a ordenar contactos, responder a tiempo, recuperar oportunidades y hacer seguimiento sin que se te escape nada. Cuéntame: ¿de dónde te llegan hoy tus clientes?";
  if (s.includes("atención") || s.includes("atencion") || s.includes("automatizar") || s.includes("recep"))
    return "La atención es un gran primer paso. Podemos organizar la recepción, responder consultas frecuentes, gestionar agenda y derivar a una persona cuando la conversación lo necesita. Tú decides qué se aprueba y qué se hace solo. ¿Qué pregunta te repiten más tus clientes?";
  if (s.includes("implant") || s.includes("cómo funciona") || s.includes("como funciona") || s.includes("empez"))
    return "Así lo hacemos: primero una discovery call para conocer tu negocio y tus prioridades. Después compilamos tu entorno: procesos, herramientas, permisos y tu forma de trabajar. Activamos dos servicios de alto impacto y luego seguimos evolucionando contigo.";
  if (s.includes("precio") || s.includes("cuesta") || s.includes("cuánto") || s.includes("cuanto"))
    return "Te lo digo con claridad: la implantación es de 1.500 € y el servicio gestionado desde 1.000 €/mes. En la discovery call vemos qué dos servicios de alto impacto tienen más sentido para tu empresa.";
  if (
    s.includes("números") ||
    s.includes("numeros") ||
    s.includes("finanzas") ||
    s.includes("gestoría") ||
    s.includes("gestoria")
  )
    return "Ahí Antonio y Juan pueden ayudarte mucho: orden en cobros y gastos, seguimiento financiero explicado en claro y trámites de gestoría con control. Cuéntame qué te quita más tiempo ahora: ¿facturas, cobros, trámites o todo a la vez?";
  if (s.includes("segur") || s.includes("web") || s.includes("marca") || s.includes("diseño"))
    return "Pedro se encarga de esa parte: seguridad, web y marca cuidada. La idea es que tu presencia venda y tu empresa esté protegida, sin que tengas que aprender herramientas nuevas. ¿Tienes ya web o partimos de cero?";
  if (s.includes("equipo") || s.includes("rrhh") || s.includes("turno"))
    return "Tu equipo digital trabaja con tareas, turnos, permisos y tu estándar operacional. Ana cuida la parte humana: organización, turnos e incorporaciones. Y tú diriges todo desde una sola conversación. ¿Cuántas personas hay hoy en tu equipo?";
  if (s.includes("hola") || s.includes("buenas"))
    return "Hola, encantada. Soy LAIA, tu supervisora. Cuéntame cómo funciona tu empresa y te enseño, con ejemplos concretos, qué podríamos hacer por ella. ¿Qué te quita más tiempo en tu día a día?";
  return "Me encanta esa pregunta. Para darte una respuesta útil, cuéntame un poco de tu negocio: sector, tamaño y qué te quita más tiempo. Con eso te propongo dos servicios de alto impacto y el siguiente paso sería una discovery call, sin compromiso.";
}

const navigation = [
  { href: "#producto", label: "Producto" },
  { href: "#equipo", label: "Equipo" },
  { href: "#como-trabajan", label: "Cómo funciona" },
  { href: "#implantacion", label: "Implantación" },
];
const workflow = [
  {
    icon: MessageCircle,
    title: "Tú hablas.",
    text: "Un encargo, una pregunta, una prioridad. Lo cuentas con tus palabras.",
  },
  {
    icon: Sparkles,
    title: "LAIA coordina.",
    text: "Entiende el contexto y organiza el trabajo con el agente adecuado.",
  },
  {
    icon: CheckCheck,
    title: "El equipo ejecuta.",
    text: "Cada tarea tiene un responsable, un proceso y un resultado que revisar.",
  },
  {
    icon: ShieldCheck,
    title: "Tú decides.",
    text: "Las acciones sensibles esperan tu aprobación. El control sigue contigo.",
  },
];
const implementation = [
  ["Nos cuentas tu negocio", "Entendemos tus prioridades y elegimos dos procesos donde empezar."],
  ["Preparamos tu entorno", "Organizamos contexto, herramientas y permisos con tu forma de trabajar."],
  ["Activamos tu equipo", "Ponemos en marcha los dos primeros servicios, con supervisión."],
  ["Evolucionamos contigo", "Afinamos los procesos y ampliamos el alcance cuando tenga sentido."],
];

function Dialog({ title, onClose, children, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const previous = document.activeElement;
    el.showModal();
    return () => {
      el.close();
      previous?.focus?.();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`lp-dialog ${className}`}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="lp-dialog-inner">{children}</div>
    </dialog>
  );
}

export default function Landing({ loginHref = "/?acceso=1" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [composerNote, setComposerNote] = useState("");
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ name: "", company: "", sector: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const inlineScrollRef = useRef(null);
  const responseTimer = useRef(null);
  const sending = useRef(false);
  const tabRefs = useRef([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("lp-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    rootRef.current.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      clearTimeout(responseTimer.current);
    };
  }, []);
  useEffect(() => {
    for (const el of [scrollRef.current, inlineScrollRef.current])
      el?.scrollTo({ top: el.scrollHeight, behavior: "auto" });
  }, [messages, typing, chatOpen]);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setProgress((p) => Math.min(100, p + 2)), 350);
    return () => clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    if (progress === 100) setPlaying(false);
  }, [progress]);
  useEffect(() => {
    if (!menuOpen) return;
    const closeMenu = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        rootRef.current.querySelector(".lp-menu-toggle")?.focus();
      }
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, [menuOpen]);

  function send(raw) {
    const text = (raw ?? input).trim();
    if (!text || sending.current) return;
    sending.current = true;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    responseTimer.current = window.setTimeout(() => {
      setMessages((m) => [...m, { role: "laia", text: laiaReply(text) }]);
      setTyping(false);
      sending.current = false;
    }, 850);
  }
  function askAgent(agent) {
    setPlaying(false);
    setSelectedAgent(null);
    setChatOpen(true);
    send(`Cuéntame cómo trabajaría ${agent.name} en ${agent.role} con mi empresa.`);
  }
  function openAgent(agent) {
    setSelectedAgent(agent);
    setProgress(0);
    setPlaying(false);
  }
  function reserveFromChat() {
    setChatOpen(false);
    window.setTimeout(
      () =>
        document
          .getElementById("reserva")
          ?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }),
      0,
    );
  }
  function submitForm(event) {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Indica tu nombre.";
    if (!form.company.trim()) nextErrors.company = "Indica el nombre de tu empresa.";
    if (
      !/^[+\d\s().-]+$/.test(form.phone) ||
      form.phone.replace(/\D/g, "").length < 7 ||
      form.phone.replace(/\D/g, "").length > 15
    )
      nextErrors.phone = "Introduce un teléfono válido, con prefijo si es necesario.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(`lp-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }
    setSubmitted(true);
  }
  function changeTab(index) {
    setTab(index);
    tabRefs.current[index]?.focus();
  }
  const messageList = (
    <>
      {messages.map((m, i) => (
        <div key={i} className={`lp-message lp-message-${m.role}`}>
          {m.text}
        </div>
      ))}
      {typing && (
        <div className="lp-typing" role="status" aria-label="LAIA está escribiendo">
          <i />
          <i />
          <i />
        </div>
      )}
    </>
  );

  return (
    <div ref={rootRef} className="agntia-landing lp-premium">
      <a className="lp-skip" href="#inicio">
        Ir al contenido
      </a>
      <header className={`lp-header ${scrolled ? "lp-header-scrolled" : ""}`}>
        <div className="lp-container lp-header-row">
          <a href="#inicio" aria-label="AgntiaPro · Inicio" onClick={() => setMenuOpen(false)}>
            <BrandLockup markSize={32} />
          </a>
          <nav className="lp-desktop-nav" aria-label="Navegación principal">
            {navigation.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="lp-header-actions">
            <a className="lp-client-access" href={loginHref}>
              Acceso clientes
            </a>
            <a className="lp-button lp-button-small lp-button-dark" href="#reserva" onClick={() => setMenuOpen(false)}>
              Reservar
            </a>
            <button
              className="lp-menu-toggle lp-icon-button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              aria-controls="lp-mobile-nav"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="lp-mobile-nav" className="lp-mobile-nav" aria-label="Navegación móvil">
            {navigation.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>
                {n.label}
              </a>
            ))}
            <a href={loginHref}>Acceso clientes</a>
            <button
              onClick={() => {
                setMenuOpen(false);
                setChatOpen(true);
              }}
            >
              Hablar con LAIA
            </button>
          </nav>
        )}
      </header>
      <main>
        <section id="inicio" className="lp-container lp-hero">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow">
              <span className="lp-gold-line" />
              TU EMPRESA. UN EQUIPO DIGITAL.
            </p>
            <h1>
              Tu empresa,
              <br />
              siempre un paso
              <br />
              <em>por delante.</em>
            </h1>
            <p className="lp-hero-lead">Imagina poder hablar con tu empresa.</p>
            <p className="lp-hero-description">
              LAIA coordina un equipo de agentes que trabaja contigo. Tú marcas el rumbo. Ellos se ocupan de que las
              cosas avancen.
            </p>
            <div className="lp-hero-actions">
              <a className="lp-button lp-button-purple" href="#reserva">
                Descubrir mi equipo
              </a>
              <a className="lp-text-action" href="#producto">
                <span className="lp-play-small">
                  <Play size={13} fill="currentColor" />
                </span>
                Ver cómo funciona
              </a>
            </div>
            <p className="lp-reassurance">Una primera conversación. 30 minutos. Sin compromiso.</p>
            <div className="lp-inline-chat">
              <div className="lp-chat-caption">
                <span>
                  <Sparkles size={15} />
                  Pruébalo con LAIA
                </span>
                <span className="lp-demo-label">Demo interactiva</span>
              </div>
              <div
                className="lp-inline-messages"
                ref={inlineScrollRef}
                role="log"
                aria-label="Conversación de demostración"
              >
                {messageList}
              </div>
              <form
                className="lp-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <button
                  type="button"
                  className="lp-icon-button"
                  aria-label="Adjuntar archivo"
                  onClick={() =>
                    setComposerNote(
                      "Los archivos estarán disponibles al activar tu equipo. En esta demo puedes conversar por texto.",
                    )
                  }
                >
                  <Paperclip size={17} />
                </button>
                <input
                  aria-label="Mensaje para LAIA"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="¿Qué te quita tiempo hoy?"
                  maxLength={2000}
                />
                <button
                  type="button"
                  className="lp-icon-button"
                  aria-label="Dictar por voz"
                  onClick={() =>
                    setComposerNote(
                      "La voz forma parte de la experiencia que estamos preparando. Prueba ahora con un mensaje.",
                    )
                  }
                >
                  <Mic size={17} />
                </button>
                <button className="lp-send" aria-label="Enviar mensaje" disabled={!input.trim() || typing}>
                  <ArrowUp size={18} />
                </button>
              </form>
              {composerNote && (
                <div role="status" className="lp-composer-note">
                  {composerNote}
                  <button className="lp-icon-button" aria-label="Cerrar aviso" onClick={() => setComposerNote("")}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="lp-suggestions">
              {chips.map((c) => (
                <button key={c} onClick={() => send(c)} disabled={typing}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="lp-hero-visual">
            <div className="lp-portrait-frame">
              <img
                className="lp-hero-portrait"
                src={laiaUrl}
                alt="LAIA, tu supervisora digital"
                width="1254"
                height="1254"
                fetchPriority="high"
              />
              <div className="lp-portrait-shade" />
              <div className="lp-portrait-heading">
                <span className="lp-portrait-role">TU PUNTO DE ENCUENTRO</span>
                <span className="lp-laia-name">Hola, soy LAIA.</span>
                <p>Tu empresa, en una conversación.</p>
              </div>
              <button className="lp-portrait-play" onClick={() => openAgent(agents[0])} aria-label="Conocer a LAIA">
                <Play size={19} />
              </button>
            </div>
            <div className="lp-hero-float">
              <span className="lp-spark">
                <Sparkles size={21} />
              </span>
              <div>
                <span className="lp-micro">ASÍ TRABAJA TU EQUIPO</span>
                <strong>
                  Todo conectado.
                  <br />
                  Contigo al mando.
                </strong>
              </div>
              <div className="lp-avatar-stack">
                <img src={antonioUrl} alt="Antonio" />
                <img src={pedroUrl} alt="Pedro" />
                <span>+3</span>
              </div>
            </div>
            <div className="lp-visual-footnote">
              <span className="lp-gold-line" />
              Personas al mando. Agentes trabajando.
            </div>
          </div>
          <div className="lp-principles">
            <span>
              <MessageCircle />
              Tan natural como conversar
            </span>
            <span>
              <Folder />
              Con el contexto de tu negocio
            </span>
            <span>
              <ShieldCheck />
              Las decisiones importantes, contigo
            </span>
          </div>
        </section>

        <section id="producto" className="lp-product-section lp-section">
          <div className="lp-container">
            <div className="lp-section-heading lp-centered" data-reveal>
              <p className="lp-eyebrow">DE LA CONVERSACIÓN A LA ACCIÓN</p>
              <h2>
                Una conversación.
                <br />
                <em>Toda tu empresa en movimiento.</em>
              </h2>
              <p>
                Detrás de LAIA hay un espacio para organizar el trabajo,
                <br className="lp-desktop-break" /> conectar al equipo y decidir con contexto.
              </p>
            </div>
            <div
              className="lp-tabs"
              role="tablist"
              aria-label="Explorar el producto"
              onKeyDown={(e) => {
                let next;
                if (e.key === "ArrowRight") next = (tab + 1) % 4;
                if (e.key === "ArrowLeft") next = (tab + 3) % 4;
                if (e.key === "Home") next = 0;
                if (e.key === "End") next = 3;
                if (next !== undefined) {
                  e.preventDefault();
                  changeTab(next);
                }
              }}
            >
              {productViews.map(({ label, icon: Icon }, i) => (
                <button
                  key={label}
                  ref={(el) => (tabRefs.current[i] = el)}
                  role="tab"
                  id={`lp-tab-${i}`}
                  aria-selected={tab === i}
                  aria-controls="lp-product-panel"
                  tabIndex={tab === i ? 0 : -1}
                  onClick={() => setTab(i)}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>
            <div
              className="lp-product-panel"
              id="lp-product-panel"
              role="tabpanel"
              aria-labelledby={`lp-tab-${tab}`}
              tabIndex={0}
            >
              <ProductScene view={tab} />
              <div className="lp-product-caption">
                <div>
                  <h3>{productViews[tab].title}</h3>
                  <p>{productViews[tab].text}</p>
                </div>
                <span className="lp-demo-label">Visualización de producto · Demo</span>
              </div>
            </div>
            <div className="lp-product-bottom">
              <span>
                <Sparkles size={18} />
                {productViews[tab].detail}
              </span>
              <a href="#reserva" className="lp-underlined">
                Ver cómo encaja en mi empresa
              </a>
            </div>
          </div>
        </section>

        <section id="equipo" className="lp-container lp-section">
          <div className="lp-section-heading lp-heading-split" data-reveal>
            <div>
              <p className="lp-eyebrow">TECNOLOGÍA CON QUIEN HABLAR</p>
              <h2>
                Conoce a tu
                <br />
                <em>próximo equipo.</em>
              </h2>
            </div>
            <p>
              Especialidades distintas. Un mismo contexto.
              <br />
              LAIA coordina, cada agente aporta lo suyo
              <br className="lp-desktop-break" /> y tú mantienes la visión completa.
            </p>
          </div>
          <div className="lp-team-grid">
            {agents.map((agent) => (
              <article className="lp-agent" key={agent.id} data-reveal>
                <button
                  className="lp-agent-photo"
                  onClick={() => openAgent(agent)}
                  aria-label={`Ver presentación de ${agent.name}`}
                >
                  <img src={agent.img} alt={`${agent.name}, ${agent.role}`} width="1254" height="1254" loading="lazy" />
                  <span className="lp-agent-photo-label">
                    {agent.id === "laia"
                      ? "Tu supervisora"
                      : agent.id === "antonio"
                        ? "Tus números, claros"
                        : "Tu negocio, cuidado"}
                  </span>
                  <span className="lp-agent-play">
                    <Play size={17} />
                  </span>
                </button>
                <div className="lp-agent-heading">
                  <h3>{agent.name}</h3>
                  <span>
                    {agent.id === "laia" ? "Coordinación" : agent.id === "antonio" ? "Finanzas" : "Seguridad y diseño"}
                  </span>
                </div>
                <p className="lp-agent-quote">{agent.quote}</p>
                <p className="lp-agent-description">{agent.detail}</p>
                <button className="lp-underlined" onClick={() => askAgent(agent)}>
                  Hablar con LAIA sobre {agent.id === "laia" ? "mi empresa" : agent.name}
                </button>
              </article>
            ))}
          </div>
          <div className="lp-support-team">
            <div className="lp-support-intro">
              <span className="lp-micro">Y EL EQUIPO SIGUE</span>
              <p>Un especialista para cada área.</p>
            </div>
            {supportAgents.map((a) => (
              <button key={a.name} onClick={() => askAgent(a)}>
                <span className="lp-initial">{a.initials}</span>
                <span>
                  <strong>{a.name}</strong>
                  <small>{a.role}</small>
                </span>
                <MessageCircle size={17} />
              </button>
            ))}
          </div>
        </section>

        <section id="como-trabajan" className="lp-workflow-section lp-section">
          <div className="lp-container">
            <div className="lp-section-heading lp-centered" data-reveal>
              <p className="lp-eyebrow">ASÍ SE MUEVE EL TRABAJO</p>
              <h2>
                De «hay que hacerlo»
                <br />
                <em>a «listo para revisar».</em>
              </h2>
              <p>
                Un equipo que sigue tus procesos.
                <br />Y un sistema que te mantiene al mando.
              </p>
            </div>
            <div className="lp-workflow">
              {workflow.map(({ icon: Icon, title, text }) => (
                <article key={title} data-reveal>
                  <span className="lp-workflow-icon">
                    <Icon size={24} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <div className="lp-control-note">
              <ShieldCheck size={22} />
              <p>
                <strong>Delegar trabajo. Conservar el control.</strong>
                <span>Permisos, contexto y aprobación forman parte de la forma de trabajar.</span>
              </p>
            </div>
          </div>
        </section>

        <section id="implantacion" className="lp-container lp-section lp-implementation">
          <div>
            <div className="lp-section-heading" data-reveal>
              <p className="lp-eyebrow">HECHO PARA TU EMPRESA</p>
              <h2>
                No empiezas de cero.
                <br />
                <em>Empezamos contigo.</em>
              </h2>
              <p>
                Primero entendemos tu negocio. Después ponemos la tecnología a trabajar en lo que de verdad necesitas.
              </p>
            </div>
            <ol className="lp-timeline">
              {implementation.map(([title, text], i) => (
                <li key={title}>
                  <span>{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="lp-pricing" data-reveal>
            <div className="lp-pricing-top">
              <Sparkles size={22} />
              <span>Un equipo. Un acompañamiento.</span>
            </div>
            <div className="lp-price-block">
              <span className="lp-micro">PUESTA EN MARCHA</span>
              <p className="lp-price">
                1.500 <span>€</span>
              </p>
              <p>Tu entorno preparado y dos servicios de alto impacto para empezar.</p>
              <ul>
                <li>
                  <Check />
                  Contexto, procesos y permisos
                </li>
                <li>
                  <Check />
                  Activación y supervisión inicial
                </li>
              </ul>
            </div>
            <div className="lp-price-block">
              <span className="lp-micro">SERVICIO GESTIONADO</span>
              <p className="lp-price">
                <small>desde </small>1.000 <span>€/mes</span>
              </p>
              <p>Tu equipo digital coordinado, con soporte y evolución continua.</p>
            </div>
            <a className="lp-button lp-button-purple" href="#reserva">
              Hablemos de tu empresa
            </a>
            <p className="lp-price-note">Definimos juntos el alcance en la primera conversación.</p>
          </div>
        </section>

        <section id="reserva" className="lp-reserve-section lp-section">
          <div className="lp-container lp-reserve-grid">
            <div className="lp-reserve-copy" data-reveal>
              <p className="lp-eyebrow">TU SIGUIENTE PASO</p>
              <h2>
                Tu equipo digital
                <br />
                empieza con
                <br />
                <em>una conversación.</em>
              </h2>
              <p>
                Cuéntanos qué te está quitando tiempo.
                <br />
                Veamos dónde puede empezar a ayudarte tu equipo.
              </p>
              <ul>
                <li>
                  <Clock3 />
                  30 minutos, sin compromiso
                </li>
                <li>
                  <Check />
                  Dos procesos concretos por los que empezar
                </li>
                <li>
                  <ShieldCheck />
                  Un plan adaptado a tu forma de trabajar
                </li>
              </ul>
              <div className="lp-reserve-signature">
                <img src={laiaUrl} alt="LAIA" width="48" height="48" loading="lazy" />
                <span>
                  Tu empresa tiene mucho por delante.
                  <br />
                  <strong>Vamos a darle espacio para avanzar.</strong>
                </span>
              </div>
            </div>
            <div className="lp-form-card" id="formulario">
              {submitted ? (
                <div className="lp-form-success" role="status">
                  <span className="lp-success-icon">
                    <Check size={28} />
                  </span>
                  <p className="lp-eyebrow">TODO EMPIEZA POR AQUÍ</p>
                  <h3>
                    Así empieza
                    <br />
                    tu próximo paso, {form.name.split(" ")[0]}.
                  </h3>
                  <p>
                    Una conversación sobre <strong>{form.company}</strong> y lo que te gustaría mejorar.
                  </p>
                  <dl>
                    <div>
                      <dt>Contacto</dt>
                      <dd>{form.phone}</dd>
                    </div>
                    {form.sector && (
                      <div>
                        <dt>Sector</dt>
                        <dd>{form.sector}</dd>
                      </div>
                    )}
                  </dl>
                  <p className="lp-demo-disclosure">
                    Estás explorando una demo. Tus datos no se han enviado y no se ha reservado una llamada.
                  </p>
                  <button className="lp-button lp-button-dark" onClick={() => setSubmitted(false)}>
                    Volver a mis datos
                  </button>
                </div>
              ) : (
                <form onSubmit={submitForm} noValidate>
                  <div className="lp-form-title">
                    <span className="lp-spark">
                      <MessageCircle size={23} />
                    </span>
                    <span className="lp-demo-label">Demo</span>
                  </div>
                  <h3>Hablemos de tu empresa.</h3>
                  <p>Déjanos un poco de contexto para preparar la conversación.</p>
                  <div className="lp-form-fields">
                    {[
                      { key: "name", label: "Tu nombre", placeholder: "¿Cómo te llamas?", auto: "given-name" },
                      { key: "company", label: "Empresa", placeholder: "Nombre de tu empresa", auto: "organization" },
                      { key: "phone", label: "Teléfono", placeholder: "+34 600 000 000", type: "tel", auto: "tel" },
                      {
                        key: "sector",
                        label: "Sector",
                        placeholder: "Clínica, comercio, asesoría…",
                        optional: true,
                        auto: "off",
                      },
                    ].map((field) => (
                      <label key={field.key} htmlFor={`lp-${field.key}`}>
                        {field.label}
                        {field.optional && <span> · opcional</span>}
                        <input
                          id={`lp-${field.key}`}
                          name={field.key}
                          type={field.type || "text"}
                          autoComplete={field.auto}
                          required={!field.optional}
                          maxLength={field.key === "phone" ? 30 : 100}
                          value={form[field.key]}
                          onChange={(e) => {
                            setForm({ ...form, [field.key]: e.target.value });
                            setErrors({ ...errors, [field.key]: undefined });
                          }}
                          placeholder={field.placeholder}
                          aria-invalid={!!errors[field.key]}
                          aria-describedby={errors[field.key] ? `lp-error-${field.key}` : undefined}
                        />
                        {errors[field.key] && (
                          <small className="lp-error" id={`lp-error-${field.key}`}>
                            {errors[field.key]}
                          </small>
                        )}
                      </label>
                    ))}
                  </div>
                  <button className="lp-button lp-button-purple lp-submit">Solicitar una conversación</button>
                  <p className="lp-form-note">30 minutos para explorar lo que tu empresa necesita.</p>
                  <p className="lp-demo-disclosure">
                    Modo demo: puedes probar el formulario. No se envían datos ni se agenda una llamada.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-main">
            <div>
              <a href="#inicio" aria-label="AgntiaPro · Volver al inicio">
                <BrandLockup />
              </a>
              <p>
                Tu empresa, siempre
                <br />
                un paso por delante.
              </p>
            </div>
            <nav aria-label="Producto">
              <strong>Explora</strong>
              <a href="#producto">Producto</a>
              <a href="#equipo">Equipo digital</a>
              <a href="#como-trabajan">Cómo funciona</a>
            </nav>
            <nav aria-label="Empieza">
              <strong>Hablemos</strong>
              <a href="#implantacion">Implantación</a>
              <a href="#reserva">Primera conversación</a>
              <a href={loginHref}>Acceso clientes</a>
            </nav>
            <div className="lp-footer-note">
              <span className="lp-micro">AGNTIAPRO + TU EMPRESA</span>
              <p>
                Más foco en lo que importa.
                <br />
                Más espacio para avanzar.
              </p>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© {new Date().getFullYear()} AgntiaPro</span>
            <span>Demostración de producto · Agentes digitales, criterio humano.</span>
          </div>
        </div>
      </footer>
      {!chatOpen && !selectedAgent && (
        <button className="lp-chat-launcher" onClick={() => setChatOpen(true)}>
          <MessageCircle size={19} />
          <span>Hablar con LAIA</span>
        </button>
      )}
      {chatOpen && (
        <Dialog title="Chat de demostración con LAIA" onClose={() => setChatOpen(false)} className="lp-chat-dialog">
          <div className="lp-dialog-header">
            <img src={laiaUrl} alt="" />
            <div>
              <strong>LAIA</strong>
              <span>Tu supervisora · Demo</span>
            </div>
            <button className="lp-icon-button" onClick={() => setChatOpen(false)} aria-label="Cerrar chat">
              <X />
            </button>
          </div>
          <div ref={scrollRef} className="lp-chat-messages" role="log" aria-label="Mensajes con LAIA">
            {messageList}
          </div>
          <div className="lp-chat-suggestions">
            {chips.map((c) => (
              <button key={c} disabled={typing} onClick={() => send(c)}>
                {c}
              </button>
            ))}
          </div>
          <form
            className="lp-composer"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              aria-label="Pregunta a LAIA"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cuéntame sobre tu empresa…"
              maxLength={2000}
            />
            <button className="lp-send" aria-label="Enviar" disabled={!input.trim() || typing}>
              <ArrowUp size={18} />
            </button>
          </form>
          <button className="lp-chat-reserve" onClick={reserveFromChat}>
            Llevémoslo a tu empresa · Reservar conversación
          </button>
        </Dialog>
      )}
      {selectedAgent && (
        <Dialog
          title={`Presentación de ${selectedAgent.name}`}
          onClose={() => {
            setSelectedAgent(null);
            setPlaying(false);
          }}
          className="lp-agent-dialog"
        >
          <div className="lp-dialog-header">
            <div>
              <strong>{selectedAgent.name}</strong>
              <span>{selectedAgent.role}</span>
            </div>
            <button
              className="lp-icon-button"
              aria-label="Cerrar presentación"
              onClick={() => {
                setSelectedAgent(null);
                setPlaying(false);
              }}
            >
              <X />
            </button>
          </div>
          <div className="lp-presentation">
            <img src={selectedAgent.img} alt={selectedAgent.name} />
            <div>
              <p>{playing ? subtitles[Math.min(3, Math.floor(progress / 25))] : selectedAgent.quote}</p>
              <div
                className="lp-progress"
                role="progressbar"
                aria-label="Progreso de la presentación"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
          <div className="lp-presentation-content">
            <p>{selectedAgent.detail}</p>
            <p className="lp-demo-disclosure">Presentación de demostración con imagen y subtítulos, sin audio.</p>
            <div className="lp-presentation-actions">
              <button
                className="lp-button lp-button-dark"
                onClick={() => {
                  if (progress === 100) setProgress(0);
                  setPlaying(!playing);
                }}
              >
                {playing ? <Pause size={17} /> : <Play size={17} />} {playing ? "Pausar" : "Ver demo"}
              </button>
              <button className="lp-button lp-button-purple" onClick={() => askAgent(selectedAgent)}>
                Preguntarle a LAIA
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
