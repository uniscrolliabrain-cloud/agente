import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Check, Menu, MessageSquareText, X } from "lucide-react";
import { BrandLockup } from "../components/BrandMark";
import "./landing.css";

const directory = "/landing";
const intro = "Hola. Soy LAIA. Cuéntame cómo funciona tu empresa y vemos qué tareas puede asumir tu equipo digital.";
const prompts = ["¿Qué puedes hacer por mi empresa?", "Quiero más clientes", "Automatizar mi atención", "¿Cómo es la implantación?"];
const navigation = [
  ["producto", "Producto"],
  ["equipo", "Equipo"],
  ["como-trabajan", "Cómo trabajan"],
  ["implantacion", "Implantación"],
] as const;
const products = [
  ["Centro de Mando", "mando", "Estado, resultados, aprobaciones y actividad en una sola pantalla."],
  ["Chat", "chat", "Pregunta, delega y recibe el resultado sin salir de la conversación."],
  ["Operaciones", "operaciones", "Tareas, procesos y seguimiento con responsables y prioridades."],
  ["Workspaces", "workspaces", "Un espacio para cada área, con sus documentos y permisos."],
] as const;
const people = [
  { name: "LAIA", photo: "laia", role: "Supervisora · Atención · Manager", quote: "¿Y si pudieras hablar directamente con tu empresa?", detail: "Coordina al equipo, delega y te trae el resultado. Tú apruebas las acciones sensibles." },
  { name: "Antonio", photo: "antonio", role: "Finanzas · Gestoría · Banca", quote: "¿Sabes realmente qué está pasando con tus números?", detail: "Organiza cobros, gastos y obligaciones y te explica qué requiere tu atención." },
  { name: "Pedro", photo: "pedro", role: "Ciberseguridad · Diseño web y gráfico", quote: "Tu empresa segura, tu web vendiendo, tu marca cuidada.", detail: "Cuida la seguridad, la presencia digital y el diseño con el tono de tu negocio." },
] as const;
const support = [
  ["Marcos", "Operaciones", "Recepción, tareas y seguimiento para que nada quede en el aire."],
  ["Ana", "RR. HH.", "Turnos, incorporaciones y seguimiento de tu equipo."],
  ["Juan", "Gestoría", "Trámites y obligaciones con avisos y control."],
] as const;
const workflow = [
  ["Tú hablas", "Cuéntale a LAIA lo que necesitas y qué resultado esperas."],
  ["LAIA coordina", "Reparte el trabajo y mantiene el contexto de tu negocio."],
  ["El equipo ejecuta", "Trabaja con las aplicaciones y permisos de tu empresa."],
  ["Tú apruebas", "Revisas lo sensible y recibes resultados y próximos pasos."],
] as const;
const rollout = [
  ["Discovery call", "Conocemos tu negocio, tus prioridades y qué te quita más tiempo."],
  ["Compilación", "Revisamos tu empresa, tus procesos y los permisos de cada herramienta."],
  ["Activación", "Ponemos en marcha dos servicios de alto impacto con supervisión."],
  ["Evolución", "Ajustamos el trabajo del equipo a medida que cambia tu operación."],
] as const;

function replyTo(text: string) {
  const question = text.toLowerCase();
  if (/antonio|finanza|cobro|juan|gestor/.test(question)) return "Antonio y Juan pueden ayudarte a ordenar cobros, gastos y trámites. ¿Por cuál te gustaría empezar?";
  if (/pedro|seguridad|diseño|marca/.test(question)) return "Pedro puede ayudarte a priorizar mejoras en seguridad, presencia web y diseño. ¿Qué parte de tu negocio necesita más atención?";
  if (/marcos|operaci/.test(question)) return "Marcos organiza la recepción, las tareas y su seguimiento. ¿Qué trabajo se te queda pendiente más a menudo?";
  if (/\bana\b|turnos|equipo humano/.test(question)) return "Ana ayuda a coordinar turnos e incorporaciones. Podemos empezar por el proceso que más tiempo le quite a tu equipo.";
  if (/precio|cuest|implant|empez/.test(question)) return "Primero conocemos tu negocio. La implantación cuesta 1.500 € y el servicio gestionado parte de 1.000 €/mes.";
  if (/cliente/.test(question)) return "Podemos empezar por captación y seguimiento: ordenar contactos, responder antes y recuperar oportunidades. ¿De dónde te llegan hoy tus clientes?";
  if (/atenci|automatiz/.test(question)) return "Podemos organizar la recepción, responder consultas frecuentes y derivar a tu equipo las que necesiten revisión.";
  return "Puedo enseñarte cómo coordinar atención, finanzas y operaciones. Cuéntame qué tarea te quita más tiempo o reserva una discovery call para revisar tu caso.";
}

function Steps({ items }: { items: ReadonlyArray<readonly [string, string]> }) {
  return <ol className="landing-steps">{items.map(([title, detail], index) => (
    <li key={title}><span aria-hidden="true">{index + 1}</span><h3>{title}</h3><p>{detail}</p></li>
  ))}</ol>;
}

export default function Landing() {
  const [mobileNav, setMobileNav] = useState(false);
  const [product, setProduct] = useState(0);
  const [chat, setChat] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ question: string; answer: string }[]>([]);
  const [selected, setSelected] = useState<(typeof people)[number] | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const chatLog = useRef<HTMLDivElement>(null);
  const chatInput = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [productLabel, productImage, productDescription] = products[product];

  useEffect(() => {
    if (chatLog.current) chatLog.current.scrollTop = chatLog.current.scrollHeight;
  }, [chat, messages]);

  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);

  function send(question: string) {
    const cleaned = question.trim();
    if (!cleaned) {
      chatInput.current?.focus();
      return;
    }
    setMessages((current) => [...current, { question: cleaned, answer: replyTo(cleaned) }]);
    setInput("");
    setChat(true);
  }

  function prepareBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const details = new FormData(event.currentTarget);
    const name = String(details.get("name") ?? "").trim();
    const company = String(details.get("company") ?? "").trim();
    const phone = String(details.get("phone") ?? "").trim();
    const sector = String(details.get("sector") ?? "").trim();
    if (!name || !company || !phone) return;
    const body = `Hola, me gustaría solicitar una discovery call.\n\nNombre: ${name}\nEmpresa: ${company}\nTeléfono: ${phone}${sector ? `\nSector: ${sector}` : ""}`;
    setEmailDraft(`mailto:hola@agntiapro.com?subject=${encodeURIComponent("Discovery call · AgntiaPro")}&body=${encodeURIComponent(body)}`);
  }

  return (
    <div className="landing" id="inicio">
      <a className="landing-skip" href="#contenido">Saltar al contenido</a>
      <header className="landing-header">
        <div className="landing-wrap">
          <a className="landing-name" href="#inicio" aria-label="AgntiaPro, inicio"><BrandLockup /></a>
          <button className="landing-menu" type="button" aria-expanded={mobileNav} aria-controls="landing-navigation" onClick={() => setMobileNav(!mobileNav)} aria-label={mobileNav ? "Cerrar menú" : "Abrir menú"}>{mobileNav ? <X /> : <Menu />}</button>
          <nav id="landing-navigation" aria-label="Navegación principal" data-open={mobileNav}>
            {navigation.map(([id, label]) => <a key={id} href={`#${id}`} onClick={() => setMobileNav(false)}>{label}</a>)}
          </nav>
          <div className="landing-header-actions">
            <a className="landing-button landing-outline" href="/?acceso=1">Acceso clientes</a>
            <a className="landing-button landing-black" href="#reserva">Reservar discovery call</a>
          </div>
        </div>
      </header>

      <main id="contenido">
        <section className="landing-wrap landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-pill"><span className="landing-dot" /> Demo de LAIA</span>
            <h1>Tu empresa,<br /> siempre un paso<br className="landing-desktop-break" /> por delante.</h1>
            <h2>Imagina poder hablar con tu empresa.</h2>
            <p>No necesitas aprender IA ni tecnología. Tú diriges, tu equipo digital trabaja. Pregunta, delega, aprueba y recibe resultados.</p>
            <div className="landing-composer">
              <p>{intro}</p>
              <form onSubmit={(event) => { event.preventDefault(); send(input); }}>
                <MessageSquareText size={19} aria-hidden="true" />
                <input ref={chatInput} aria-label="Mensaje para LAIA" placeholder="Pregunta lo que quieras a LAIA…" value={input} maxLength={500} onChange={(event) => setInput(event.target.value)} />
                <button className="landing-send" type="submit" aria-label="Enviar mensaje a LAIA"><ArrowUp size={19} /></button>
              </form>
            </div>
            <div className="landing-prompts">{prompts.map((prompt) => <button key={prompt} type="button" onClick={() => send(prompt)}>{prompt}</button>)}</div>
          </div>
          <figure className="landing-portrait">
            <img src={`${directory}/laia.webp`} alt="LAIA, supervisora digital de AgntiaPro" width={724} height={724} fetchPriority="high" />
            <figcaption><span className="landing-avatar">L</span><span><strong>LAIA · Supervisora</strong><small><span className="landing-dot" /> Demo interactiva</small></span></figcaption>
            <div className="landing-portrait-note"><p><strong>LAIA</strong> ¿Qué te gustaría delegar hoy?</p><button className="landing-button landing-purple" type="button" onClick={() => setChat(true)}>Iniciar conversación</button></div>
          </figure>
        </section>

        <section className="landing-band" id="producto">
          <div className="landing-wrap">
            <span className="landing-eyebrow">Producto</span>
            <h2>Así se ve tu empresa por dentro.</h2>
            <p className="landing-section-copy">Detrás de la conversación hay una aplicación completa. Explora capturas del producto con datos de demostración.</p>
            <div className="landing-product-tabs" aria-label="Vistas del producto">
              {products.map(([label], index) => <button type="button" key={label} aria-pressed={product === index} onClick={() => setProduct(index)}>{label}</button>)}
            </div>
            <figure className="landing-product">
              <img src={`${directory}/${productImage}.webp`} alt={`Captura del entorno demo de AgntiaPro: ${productLabel}`} loading="lazy" width={1320} height={889} />
              <figcaption><h3>{productLabel}</h3><p>{productDescription}</p><a href="/?acceso=1">Entrar a la demo del producto</a></figcaption>
            </figure>
          </div>
        </section>

        <section className="landing-wrap landing-section" id="equipo">
          <span className="landing-eyebrow">Equipo</span>
          <h2>Conoce al equipo que puede<br className="landing-desktop-break" /> trabajar con tu empresa.</h2>
          <p className="landing-section-copy">Primero el problema. Después las capacidades. Luego, cómo se trabaja con ellos.</p>
          <div className="landing-team">{people.map((person) => (
            <article key={person.name}>
              <img src={`${directory}/${person.photo}.webp`} alt={person.name} width={724} height={724} loading="lazy" />
              <h3>{person.name}</h3><small>{person.role}</small>
              <p className="landing-quote">«{person.quote}»</p><p>{person.detail}</p>
              <button className="landing-button landing-outline" type="button" onClick={() => send(`Cuéntame cómo trabaja ${person.name}.`)}>Preguntar a LAIA</button>
              <button className="landing-text-button" type="button" onClick={() => setSelected(person)}>Ver presentación de {person.name}</button>
            </article>
          ))}</div>
          <div className="landing-support">{support.map(([name, role, detail]) => (
            <article key={name}><span aria-hidden="true">{name[0]}</span><div><h3>{name}</h3><small>{role}</small><p>{detail}</p><button className="landing-text-button" type="button" onClick={() => send(`Cuéntame cómo trabaja ${name}.`)}>Preguntar a LAIA</button></div></article>
          ))}</div>
        </section>

        <section className="landing-band" id="como-trabajan"><div className="landing-wrap">
          <span className="landing-eyebrow">Cómo trabajan</span>
          <h2>Son empleados digitales<br className="landing-desktop-break" /> de verdad.</h2>
          <p className="landing-section-copy">Trabajan con tareas, procesos, permisos y herramientas de tu empresa. Tú defines cómo se toman las decisiones.</p>
          <Steps items={workflow} />
        </div></section>

        <section className="landing-wrap landing-section" id="implantacion">
          <span className="landing-eyebrow">Implantación</span>
          <h2>No empiezas desde cero.<br /> Empezamos con tu empresa.</h2>
          <Steps items={rollout} />
          <div className="landing-prices">
            <article><span>Implantación</span><h3>1.500 €</h3><p>Compilación de tu empresa y puesta en marcha de dos servicios de alto impacto.</p></article>
            <article><span>Servicio gestionado</span><h3>Desde 1.000 €/mes</h3><p>Equipo digital coordinado, evolución continua y soporte con tu estándar operacional.</p></article>
          </div>
        </section>

        <section className="landing-booking" id="reserva"><div className="landing-wrap">
          <div><span className="landing-eyebrow">Discovery call</span><h2>Tu empresa no tiene por qué quedarse atrás.</h2><p>Conoce qué puede asumir un equipo digital en tu negocio y qué tendría sentido activar primero.</p>
            <ul>{["Sin compromiso · 30 minutos", "Tú controlas las acciones sensibles", "Te contactamos para agendar"].map((label) => <li key={label}><Check size={16} aria-hidden="true" />{label}</li>)}</ul>
          </div>
          <form onSubmit={prepareBooking} onChange={() => setEmailDraft("")}>
            <div className="landing-form-title"><img src={`${directory}/laia.webp`} alt="" loading="lazy" /><div><h3>Reserva tu discovery call</h3><p>Prepara una solicitud para que podamos contactarte.</p></div></div>
            <div className="landing-fields">
              <label>Nombre <input name="name" autoComplete="name" required placeholder="Tu nombre" maxLength={100} /></label>
              <label>Empresa <input name="company" autoComplete="organization" required placeholder="Tu empresa" maxLength={120} /></label>
              <label>Sector <input name="sector" placeholder="Ej. clínica, tienda, asesoría" maxLength={120} /></label>
              <label>Teléfono <input name="phone" type="tel" autoComplete="tel" required placeholder="Tu teléfono" maxLength={35} /></label>
            </div>
            {emailDraft
              ? <a className="landing-button landing-purple" href={emailDraft}>Abrir correo para enviar</a>
              : <button className="landing-button landing-purple" type="submit">Preparar solicitud</button>}
            <p className="landing-form-note" aria-live="polite">{emailDraft ? "Tu solicitud está lista. Envíala desde tu aplicación de correo para solicitar la llamada." : "La solicitud se envía desde tu aplicación de correo."}</p>
          </form>
        </div></section>
      </main>

      <footer className="landing-wrap landing-footer">
        <a className="landing-name" href="#inicio"><BrandLockup /></a>
        <nav aria-label="Enlaces del pie">{navigation.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}<a href="/?acceso=1">Acceso clientes</a></nav>
        <small>© AgntiaPro · Habla con tu empresa.</small>
      </footer>

      <button className="landing-chat-toggle landing-button landing-black" type="button" aria-expanded={chat} aria-controls="landing-chat" onClick={() => setChat(!chat)}>{chat ? <X size={17} /> : <MessageSquareText size={17} />} {chat ? "Cerrar chat" : "Chat"}</button>
      {chat && <aside className="landing-chat" id="landing-chat" aria-label="Chat de demostración con LAIA" onKeyDown={(event) => { if (event.key === "Escape") setChat(false); }}>
        <header><div><strong>LAIA</strong><small>Demo con respuestas de ejemplo</small></div><button type="button" aria-label="Cerrar conversación" onClick={() => setChat(false)}><X size={19} /></button></header>
        <div className="landing-chat-log" ref={chatLog} role="log"><p>{intro}</p>{messages.map(({ question, answer }, index) => <div key={index}><p className="landing-chat-question">{question}</p><p>{answer}</p></div>)}</div>
        <form onSubmit={(event) => { event.preventDefault(); send(input); }}><input aria-label="Escribir en la demo de LAIA" value={input} maxLength={500} onChange={(event) => setInput(event.target.value)} placeholder="Escribe a LAIA…" /><button className="landing-send" type="submit" aria-label="Enviar en el chat"><ArrowUp size={18} /></button></form>
      </aside>}

      {selected && <dialog ref={dialog} className="landing-agent-dialog" aria-label={`Presentación de ${selected.name}`} onClose={() => setSelected(null)}>
        <button className="landing-dialog-close" type="button" aria-label="Cerrar presentación" onClick={() => dialog.current?.close()}><X size={20} /></button>
        <img src={`${directory}/${selected.photo}.webp`} alt={selected.name} />
        <div><small>{selected.role}</small><h2>{selected.name}</h2><p>{selected.detail}</p><button className="landing-button landing-purple" type="button" onClick={() => { send(`Cuéntame cómo trabaja ${selected.name}.`); dialog.current?.close(); }}>Preguntar a LAIA</button></div>
      </dialog>}
    </div>
  );
}
