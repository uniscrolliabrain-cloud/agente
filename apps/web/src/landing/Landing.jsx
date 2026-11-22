import { useEffect, useRef, useState } from 'react'
import './landing.css'
import { BrandLockup } from '../components/BrandMark'
import { ArrowRight, ArrowUp, Check, ChevronDown, Mic, Paperclip, Pause, Play, Search, X } from 'lucide-react'

const laiaUrl = '/landing/laia.png'
const antonioUrl = '/landing/antonio.png'
const pedroUrl = '/landing/pedro.png'
const mandoUrl = '/images/AgntiaPro.png'
const chatUrl = '/landing/chat.webp'
const opsUrl = '/landing/operaciones.webp'
const wsUrl = '/landing/workspaces.webp'

const initialMessages = [
  { role: 'laia', text: 'Hola. Te aviso de que la conexión con Google se ha perdido. ¿Quieres que la revise y te diga qué ha dejado de sincronizarse?' },
]

const agents = [
  { id: 'laia', name: 'LAIA', role: 'Supervisora · Atención · Manager', img: laiaUrl, duration: '0:35', quote: '¿Y si pudieras hablar directamente con tu empresa?', detail: 'Pregunta, delega y supervisa. LAIA coordina al equipo y te trae el resultado, con tu aprobación en lo sensible.' },
  { id: 'antonio', name: 'Antonio', role: 'Finanzas · Gestoría · Banca', img: antonioUrl, duration: '0:30', quote: '¿Sabes realmente qué está pasando con tus números?', detail: 'Cobros, gastos y obligaciones en orden, explicados en claro y sin perderte en carpetas ni plazos.' },
  { id: 'pedro', name: 'Pedro', role: 'Ciberseguridad · Diseño web y gráfico', img: pedroUrl, duration: '0:40', quote: 'Tu empresa segura, tu web vendiendo, tu marca cuidada.', detail: 'Protección, presencia y diseño que trabajan cada día por tu negocio, con tu tono y tu marca.' },
]

const supportAgents = [
  { name: 'Marcos', role: 'Operaciones', initials: 'M', detail: 'Recepción, tareas y seguimiento sin que nada se quede en el aire.' },
  { name: 'Ana', role: 'RRHH', initials: 'A', detail: 'Turnos, incorporaciones y seguimiento de tu equipo humano.' },
  { name: 'Juan', role: 'Gestoría', initials: 'J', detail: 'Trámites y obligaciones con orden, aviso y control.' },
]

const chips = ['¿Qué puedes hacer por mi empresa?', 'Quiero más clientes', 'Automatizar mi atención', '¿Cómo es la implantación?']
const subtitles = ['Habla con tu empresa. Así de simple.', 'Pregunta, delega y supervisa.', 'Tu equipo digital, coordinado.', 'Tú diriges. Ellos ejecutan.']

function laiaReply(q) {
  const s = q.toLowerCase()
  if (s.includes('cliente')) return 'Claro. Empezaríamos por lo que más mueve tu negocio: captación y atención. Te ayudamos a ordenar contactos, responder a tiempo, recuperar oportunidades y hacer seguimiento sin que se te escape nada. Cuéntame: ¿de dónde te llegan hoy tus clientes?'
  if (s.includes('atención') || s.includes('atencion') || s.includes('automatizar') || s.includes('recep')) return 'La atención es un gran primer paso. Podemos organizar la recepción, responder consultas frecuentes, gestionar agenda y derivar a una persona cuando la conversación lo necesita. Tú decides qué se aprueba y qué se hace solo. ¿Qué pregunta te repiten más tus clientes?'
  if (s.includes('implant') || s.includes('cómo funciona') || s.includes('como funciona') || s.includes('empez')) return 'Así lo hacemos: primero una discovery call para conocer tu negocio y tus prioridades. Después compilamos tu entorno: procesos, herramientas, permisos y tu forma de trabajar. Activamos dos servicios de alto impacto y luego seguimos evolucionando contigo.'
  if (s.includes('precio') || s.includes('cuesta') || s.includes('cuánto') || s.includes('cuanto')) return 'Te lo digo con claridad: la implantación es de 1.500 € y el servicio gestionado desde 1.000 €/mes. En la discovery call vemos qué dos servicios de alto impacto tienen más sentido para tu empresa.'
  if (s.includes('números') || s.includes('numeros') || s.includes('finanzas') || s.includes('gestoría') || s.includes('gestoria')) return 'Ahí Antonio y Juan pueden ayudarte mucho: orden en cobros y gastos, seguimiento financiero explicado en claro y trámites de gestoría con control. Cuéntame qué te quita más tiempo ahora: ¿facturas, cobros, trámites o todo a la vez?'
  if (s.includes('segur') || s.includes('web') || s.includes('marca') || s.includes('diseño')) return 'Pedro se encarga de esa parte: seguridad, web y marca cuidada. La idea es que tu presencia venda y tu empresa esté protegida, sin que tengas que aprender herramientas nuevas. ¿Tienes ya web o partimos de cero?'
  if (s.includes('equipo') || s.includes('rrhh') || s.includes('turno')) return 'Tu equipo digital trabaja con tareas, turnos, permisos y tu estándar operacional. Ana cuida la parte humana: organización, turnos e incorporaciones. Y tú diriges todo desde una sola conversación. ¿Cuántas personas hay hoy en tu equipo?'
  if (s.includes('hola') || s.includes('buenas')) return 'Hola, encantada. Soy LAIA, tu supervisora. Cuéntame cómo funciona tu empresa y te enseño, con ejemplos concretos, qué podríamos hacer por ella. ¿Qué te quita más tiempo en tu día a día?'
  return 'Me encanta esa pregunta. Para darte una respuesta útil, cuéntame un poco de tu negocio: sector, tamaño y qué te quita más tiempo. Con eso te propongo dos servicios de alto impacto y el siguiente paso sería una discovery call, sin compromiso.'
}

export default function Landing({ loginHref = '/?acceso=1' }) {
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [composerNote, setComposerNote] = useState('')
  const [tab, setTab] = useState(0)
  const [form, setForm] = useState({ name: '', company: '', sector: '', phone: '' })
  const [formStatus, setFormStatus] = useState({ type: 'idle', msg: '' })
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => { scrollRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }) }, [messages, typing, chatOpen])

  useEffect(() => {
    if (!playing) return
    setProgress(0)
    const iv = setInterval(() => setProgress((p) => { if (p >= 100) { clearInterval(iv); setPlaying(false); return 100 } return p + 2 }), 220)
    return () => clearInterval(iv)
  }, [playing])

  const send = (raw) => {
    const text = (raw ?? input).trim()
    if (!text || typing) return
    const userMsg = { role: 'user', text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setTyping(true)
    window.setTimeout(() => {
      const reply = { role: 'laia', text: laiaReply(text) }
      setMessages((m) => [...m, reply])
      setTyping(false)
    }, 750)
  }

  const askAgent = (a) => {
    setChatOpen(true)
    window.setTimeout(() => send(`LAIA, cuéntame cómo trabajaría ${a.name} con mi empresa.`), 80)
  }

  const newChat = () => { setMessages(initialMessages); setChatOpen(true); setInput('') }

  function submitForm(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.company.trim() || !form.phone.trim()) {
      setFormStatus({ type: 'error', msg: 'Completa nombre, empresa y teléfono para que podamos llamarte.' })
      return
    }
    const subject = encodeURIComponent('Solicitud de discovery call · AgntiaPro')
    const body = encodeURIComponent(`Nombre: ${form.name.trim()}\nEmpresa: ${form.company.trim()}\nSector: ${form.sector.trim()}\nTeléfono: ${form.phone.trim()}`)
    setFormStatus({ type: 'ok', msg: 'Tu solicitud está lista para enviarla desde tu correo.' })
    window.location.href = `mailto:hola@agntiapro.com?subject=${subject}&body=${body}`
  }

  const runSearch = (e) => {
    e.preventDefault()
    const q = searchQuery.toLowerCase()
    const target = q.includes('equipo') ? 'equipo' : q.includes('trabaj') || q.includes('cómo') || q.includes('como') ? 'como-trabajan' : q.includes('implant') || q.includes('precio') ? 'implantacion' : q.includes('producto') || q.includes('centro') || q.includes('chat') || q.includes('operacion') ? 'producto' : 'reserva'
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
    setSearchResult(`Te llevamos a la sección relacionada con “${searchQuery}”.`)
  }

  const tabs = [
    { label: 'Centro de Mando', img: mandoUrl, desc: 'Estado, resultados, aprobaciones y actividad. Tu empresa, a vista de pájaro, sin perseguir datos.' },
    { label: 'Chat', img: chatUrl, desc: 'La conversación que manda en todo. Pregunta, delega y recibe el resultado, sin cambiar de app.' },
    { label: 'Operaciones', img: opsUrl, desc: 'Tareas, procesos y seguimiento que se cumplen cada día, con responsables y orden.' },
    { label: 'Workspaces', img: wsUrl, desc: 'Cada área de tu empresa con su espacio, sus documentos y sus permisos.' },
  ]

  const openAgent = (a) => { setSelectedAgent(a); setPlaying(false); setProgress(0) }

  return (
    <div style={{ boxSizing: 'border-box', paddingTop: 'var(--safe-area-inset-top)', minHeight: '100vh', background: 'var(--cream)' }} className="agntia-landing overflow-x-clip">
      {/* HEADER */}
      <header style={{ top: 'var(--safe-area-inset-top)' }} className="sticky z-50 border-b border-[var(--line)] bg-[var(--cream)]">
        <div className="landing-header-row mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#inicio" aria-label="AgntiaPro · Inicio" className="flex shrink-0 items-center gap-3">
            <BrandLockup />
          </a>
          <nav aria-label="Navegación principal" className="landing-desktop-nav hidden items-center gap-6 text-sm font-semibold lg:flex"><a href="#producto" className="hover:text-[#5B4BDB]">Producto</a><a href="#equipo" className="hover:text-[#5B4BDB]">Equipo</a><a href="#como-trabajan" className="hover:text-[#5B4BDB]">Cómo trabajan</a><a href="#implantacion" className="hover:text-[#5B4BDB]">Implantación</a></nav>
          <div className="landing-header-actions flex items-center gap-2">
            <div className="lg:hidden">
            {searchOpen ? (
              <form onSubmit={runSearch} className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-white px-2 py-1">
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar en la página…" className="w-28 bg-transparent px-2 py-1.5 text-sm outline-none sm:w-40" aria-label="Buscar en la página" />
                <button type="submit" className="rounded-full bg-[#111] px-3 py-1.5 text-sm font-bold text-white">Buscar</button>
                <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResult('') }} className="rounded-full p-1.5" aria-label="Cerrar búsqueda"><X className="h-4 w-4" /></button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white" aria-label="Buscar"><Search className="h-4 w-4" /></button>
            )}
            </div>
            <a href={loginHref} className="landing-client-link rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold">Acceso clientes</a>
            <button onClick={newChat} className="rounded-full bg-[#111] px-4 py-2.5 text-sm font-bold text-white lg:hidden">Nuevo chat</button>
            <a href="#reserva" className="landing-reserve-link hidden rounded-full bg-[#111] px-4 py-2.5 text-sm font-bold text-white md:block">Reservar</a>
          </div>
        </div>
        {searchResult && <p role="status" className="mx-auto max-w-[1240px] px-4 pb-2 text-sm font-semibold text-[#6B655E] sm:px-6 lg:hidden">{searchResult}</p>}
        <nav aria-label="Navegación móvil" className="flex gap-5 overflow-x-auto px-4 pb-2 text-sm font-semibold lg:hidden no-scrollbar"><a href="#producto">Producto</a><a href="#equipo">Equipo</a><a href="#como-trabajan">Cómo trabajan</a><a href="#implantacion">Implantación</a></nav>
      </header>

      {/* HERO */}
      <section id="inicio" className="mx-auto max-w-[1240px] px-4 pb-16 pt-10 sm:px-6 lg:pt-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-14">
          <div>
            <h1 className="serif mt-6 text-[clamp(2.8rem,6vw,4.8rem)] font-medium leading-[1.02] tracking-[-0.02em]">Tu empresa, siempre un paso por delante.</h1>
            <p className="serif mt-6 text-[clamp(1.35rem,2.6vw,1.8rem)] leading-snug">Imagina poder hablar con tu empresa.</p>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-[#6B655E]">No necesitas aprender IA ni tecnología. Tú diriges, tu equipo digital trabaja. Pregunta, delega, aprueba y recibe resultados.</p>

            <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_12px_30px_rgba(17,17,17,.06)]">
              <div className="max-h-52 space-y-3 overflow-y-auto p-4 sm:p-5">
                {messages.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] ${m.role === 'user' ? 'bg-[#111] text-white' : 'border border-[var(--line)] bg-[#FDFBF7]'}`}>{m.text}</div></div>))}
                {typing && <p className="text-sm text-[#6B655E]">LAIA está escribiendo…</p>}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send() }} className="border-t border-[var(--line)] p-3 sm:p-4">
                <div className="flex items-end gap-2">
                  <button type="button" onClick={() => setComposerNote('En esta demostración, escribe tu mensaje en el compositor. LAIA te responderá en el chat.')} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--line)]" aria-label="Adjuntar archivo"><Paperclip className="h-4 w-4" /></button>
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} rows={2} placeholder="Pregunta lo que quieras o pide que ejecute un SOP..." className="min-h-[52px] min-w-0 flex-1 resize-none rounded-2xl border-0 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-[#6B655E]" aria-label="Pregunta lo que quieras o pide que ejecute un SOP" />
                  <button type="button" onClick={() => setComposerNote('El micrófono es un concepto de la demo. Escribe tu mensaje y LAIA te responderá.')} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--line)]" aria-label="Dictar por voz"><Mic className="h-4 w-4" /></button>
                  <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#5B4BDB] text-white" aria-label="Enviar mensaje"><ArrowUp className="h-5 w-5" /></button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => send('LAIA, enséñame los SOPs de mi empresa.')} className="rounded-full border border-[var(--line)] bg-[#F5EFE6] px-3 py-1.5 text-sm font-bold">SOPs de Mi empresa</button>
                  <span className="text-sm text-[#6B655E]">Sin login en esta demostración</span>
                </div>
                {composerNote && <p role="status" className="mt-3 rounded-xl bg-[#F5EFE6] px-3 py-2 text-sm leading-relaxed">{composerNote}</p>}
              </form>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">{chips.map((c) => <button key={c} onClick={() => send(c)} className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold">{c}</button>)}</div>
          </div>

          <div className="relative">
            <img src={laiaUrl} alt="LAIA, supervisora principal de AgntiaPro" className="aspect-[4/5] w-full rounded-2xl border border-[var(--line)] object-cover object-top" />
            <div className="absolute left-4 top-4 flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-3 py-2.5 shadow-[0_10px_28px_rgba(17,17,17,.10)]">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#5B4BDB] text-sm font-bold text-white">L</span>
              <span><span className="block text-sm font-bold leading-tight">LAIA · Supervisora</span><span className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-[#6B655E]"><span className="h-2 w-2 rounded-full bg-emerald-500" />En línea</span></span>
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-[0_10px_28px_rgba(17,17,17,.10)] sm:left-6 sm:right-auto sm:max-w-xs">
              <p className="text-sm leading-relaxed"><span className="font-bold">LAIA</span> · Hola. Te aviso de que la conexión con Google se ha perdido. ¿Quieres que la revise?</p>
              <button onClick={() => send('Sí, LAIA, revisa la conexión con Google.')} className="mt-3 rounded-full bg-[#5B4BDB] px-4 py-2 text-sm font-bold text-white">Revisar conexión</button>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTO */}
      <section id="producto" className="bg-[#F4EEE3] py-14 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <p className="text-sm font-bold text-[#6B655E]">Producto real</p>
          <h2 className="serif mt-3 max-w-prose text-[clamp(2rem,4.5vw,3.4rem)] font-medium leading-[1.05]">Así se ve tu empresa por dentro.</h2>
          <p className="mt-4 max-w-prose leading-relaxed text-[#6B655E]">Detrás de la conversación hay una aplicación completa. Estas son capturas del producto y de su entorno de demostración.</p>
          <div className="mt-7 flex flex-wrap gap-2">{tabs.map((t, i) => <button key={t.label} onClick={() => setTab(i)} className={`rounded-full px-4 py-2.5 text-sm font-bold ${tab === i ? 'bg-[#111] text-white' : 'border border-[var(--line)] bg-white'}`}>{t.label}</button>)}</div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-[#F1EADF] shadow-[0_14px_34px_rgba(17,17,17,.07)]">
            <img src={tabs[tab].img} alt={`Captura real de AgntiaPro: ${tabs[tab].label}`} className="block max-h-[780px] w-full object-contain" />
            <div className="border-t border-[var(--line)] bg-white p-5 sm:p-6"><h3 className="serif text-sm font-medium">{tabs[tab].label}</h3><p className="mt-1 max-w-prose text-sm leading-relaxed text-[#6B655E]">{tabs[tab].desc}</p></div>
          </div>
        </div>
      </section>

      {/* EQUIPO */}
      <section id="equipo" className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm font-bold text-[#6B655E]">Equipo</p>
        <h2 className="serif mt-3 max-w-prose text-[clamp(2rem,4.5vw,3.4rem)] font-medium leading-[1.05]">Conoce al equipo que puede trabajar con tu empresa.</h2>
        <p className="mt-4 max-w-prose leading-relaxed text-[#6B655E]">Primero el problema. Después las capacidades. Luego, cómo se trabaja con ellos. Cada presentación termina en una conversación.</p>
        <div className="mt-10 grid gap-10 md:grid-cols-3 lg:gap-12">
          {agents.map((a) => (
            <article key={a.id}>
              <button onClick={() => openAgent(a)} className="block w-full text-left" aria-label={`Ver presentación de ${a.name}`}>
                <img src={a.img} alt={`${a.name}, ${a.role}`} className="aspect-[4/5] w-full rounded-2xl border border-[var(--line)] object-cover object-top" />
              </button>
              <h3 className="serif mt-5 text-sm font-medium leading-none">{a.name}</h3>
              <p className="mt-2 text-sm font-semibold text-[#6B655E]">{a.role}</p>
              <p className="serif mt-3 text-sm italic leading-relaxed">“{a.quote}”</p>
              <p className="mt-2 text-sm leading-relaxed text-[#6B655E]">{a.detail}</p>
              <button onClick={() => askAgent(a)} className="mt-4 rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-bold">Pregúntale a LAIA sobre esto</button>
              <button onClick={() => openAgent(a)} className="ml-2 mt-4 rounded-full px-3 py-2.5 text-sm font-bold text-[#5B4BDB]">Ver presentación →</button>
            </article>
          ))}
        </div>
        <div className="mt-12 grid gap-4 rounded-2xl border border-[var(--line)] bg-[#F5EFE6] p-5 sm:grid-cols-3 sm:p-6">
          {supportAgents.map((a) => (
            <div key={a.name} className="flex items-start gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#F1EADF] text-sm font-bold">{a.initials}</span><div><h3 className="serif text-sm font-medium leading-tight">{a.name}</h3><p className="text-sm font-semibold text-[#6B655E]">{a.role}</p><p className="mt-1 text-sm leading-relaxed text-[#6B655E]">{a.detail}</p><button onClick={() => askAgent({ ...agents[0], name: a.name })} className="mt-2 text-sm font-bold text-[#5B4BDB]">Pregúntale a LAIA →</button></div></div>
          ))}
        </div>
      </section>

      {/* CÓMO TRABAJAN */}
      <section id="como-trabajan" className="bg-[#F4EEE3] py-14 sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <p className="text-sm font-bold text-[#6B655E]">Cómo trabajan</p>
          <h2 className="serif mt-3 max-w-prose text-[clamp(2rem,4.5vw,3.4rem)] font-medium leading-[1.05]">Son empleados digitales de verdad.</h2>
          <p className="mt-4 max-w-prose leading-relaxed text-[#6B655E]">No son respuestas sueltas. Tienen tareas, rutas, SOPs, permisos y el estándar operacional de tu empresa. Trabajan en tus aplicaciones normales y usan la interfaz por ti.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '1', t: 'Tú hablas', d: 'Cuenta lo que necesitas por chat, voz, videollamada o teléfono. “Oye, LAIA” funciona como Siri.' },
              { n: '2', t: 'LAIA coordina', d: 'Tu supervisora entiende el encargo, lo reparte y mantiene el contexto de tu negocio.' },
              { n: '3', t: 'El equipo ejecuta', d: 'El equipo trabaja en Gmail, Drive, Outlook, Slack y WhatsApp, con responsables y orden.' },
              { n: '4', t: 'Tú apruebas', d: 'Nada sensible se mueve sin que lo veas. Recibes el resultado y decides.' },
            ].map((s) => <article key={s.n} className="rounded-2xl border border-[var(--line)] bg-white p-5"><span className="serif text-sm font-medium">{s.n}</span><h3 className="serif mt-4 text-sm font-medium">{s.t}</h3><p className="mt-2 text-sm leading-relaxed text-[#6B655E]">{s.d}</p></article>)}
          </div>
        </div>
      </section>

      {/* IMPLANTACIÓN */}
      <section id="implantacion" className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-sm font-bold text-[#6B655E]">Implantación</p>
        <h2 className="serif mt-3 max-w-prose text-[clamp(2rem,4.5vw,3.4rem)] font-medium leading-[1.05]">No empiezas desde cero. Empezamos con tu empresa.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: '1', t: 'Discovery call', d: 'Conocemos tu negocio, tus prioridades y qué te quita más tiempo.' },
            { n: '2', t: 'Compilación', d: 'Estudiamos tu empresa y tus SOPs. Configuramos entorno, procesos y permisos.' },
            { n: '3', t: 'Activación', d: 'Ponemos en marcha dos servicios de alto impacto, con supervisión y control.' },
            { n: '4', t: 'Evolución', d: 'Formamos a humanos y agentes con tu estándar operacional, paso a paso.' },
          ].map((s) => <article key={s.n} className="rounded-2xl border border-[var(--line)] bg-[#F5EFE6] p-5"><span className="serif text-sm font-medium">{s.n}</span><h3 className="mt-4 text-sm font-bold">{s.t}</h3><p className="mt-2 text-sm leading-relaxed text-[#6B655E]">{s.d}</p></article>)}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--line)] bg-[#F5EFE6] p-6"><p className="text-sm font-bold text-[#6B655E]">Implantación</p><p className="serif mt-2 text-sm font-medium">1.500 €</p><p className="mt-2 text-sm leading-relaxed text-[#6B655E]">Compilación de tu empresa y puesta en marcha de dos servicios de alto impacto.</p></div>
          <div className="rounded-2xl border border-[var(--line)] bg-[#F5EFE6] p-6"><p className="text-sm font-bold text-[#6B655E]">Servicio gestionado</p><p className="serif mt-2 text-sm font-medium">Desde 1.000 €/mes</p><p className="mt-2 text-sm leading-relaxed text-[#6B655E]">Equipo digital coordinado, evolución continua y soporte con tu estándar operacional.</p></div>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-[#6B655E]">Ley española · VeriFactu. Sin promesas de resultados garantizados. El valor se construye con tu operación real.</p>
      </section>

      {/* CIERRE + RESERVA */}
      <section id="reserva" className="bg-[#111111] py-14 text-[#FDFBF7] sm:py-20">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <p className="text-sm font-bold text-white/70">Discovery call</p>
            <h2 className="serif mt-3 text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-[1.02]">Tu empresa no tiene por qué quedarse atrás.</h2>
            <p className="mt-4 max-w-prose leading-relaxed text-white/70">Descubre cómo sería trabajar con un equipo digital que conoce tu negocio y evoluciona contigo. Una conversación para identificar oportunidades concretas.</p>
            <ul className="mt-6 space-y-3 text-sm font-semibold">
              <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-[#C9A86A]" />Sin compromiso · 30 minutos</li>
              <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-[#C9A86A]" />Tú controlas las acciones sensibles</li>
              <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-[#C9A86A]" />Te llamamos para agendar</li>
            </ul>
            <a href="#formulario" className="mt-7 inline-flex items-center rounded-full bg-[#5B4BDB] px-5 py-3 text-sm font-bold text-white">Reservar discovery call <ArrowRight className="ml-1 h-4 w-4" /></a>
          </div>
          <form id="formulario" onSubmit={submitForm} className="rounded-2xl bg-white p-5 text-[#111111] shadow-xl sm:p-6">
            <div className="flex items-center gap-3"><img src={laiaUrl} alt="LAIA" className="h-12 w-12 rounded-full object-cover" /><div><p className="font-bold">Reserva tu discovery call</p><p className="text-sm text-[#6B655E]">LAIA lo recibe y te llamamos para agendar.</p></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-bold">Nombre *<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2.5 font-medium" placeholder="Tu nombre" /></label>
              <label className="block text-sm font-bold">Empresa *<input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2.5 font-medium" placeholder="Nombre de tu empresa" /></label>
              <label className="block text-sm font-bold">Sector<input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2.5 font-medium" placeholder="Ej. clínica, tienda, asesoría" /></label>
              <label className="block text-sm font-bold">Teléfono *<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2.5 font-medium" placeholder="Tu teléfono" /></label>
            </div>
            {formStatus.msg && <p role="status" className={`mt-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${formStatus.type === 'ok' ? 'bg-emerald-50 text-emerald-800' : formStatus.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-[#F5EFE6]'}`}>{formStatus.msg}</p>}
            <button disabled={formStatus.type === 'saving'} className="mt-4 w-full rounded-full bg-[#5B4BDB] py-3.5 text-sm font-bold text-white disabled:opacity-60">{formStatus.type === 'saving' ? 'Guardando…' : 'Reservar discovery call →'}</button>
            <p className="mt-3 text-center text-sm text-[#6B655E]">Se abrirá tu aplicación de correo con los datos de la solicitud.</p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#FDFBF7]"><div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6"><div className="flex flex-col gap-8 md:flex-row md:justify-between"><div className="max-w-prose"><BrandLockup /><div className="mt-2 h-px w-16 bg-[#C9A86A]" /><p className="mt-3 text-sm leading-relaxed text-[#6B655E]">AgntiaPro — tu empresa compilada, operada y siempre actualizada.</p></div><div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3"><div><p className="mb-3 font-bold">Producto</p><ul className="space-y-2 text-[#6B655E]"><li><a href="#producto">Centro de Mando</a></li><li><a href="#producto">Chat</a></li><li><a href="#producto">Operaciones</a></li><li><a href="#producto">Workspaces</a></li></ul></div><div><p className="mb-3 font-bold">Soluciones</p><ul className="space-y-2 text-[#6B655E]"><li><a href="#equipo">Equipo digital</a></li><li><a href="#como-trabajan">Cómo trabajan</a></li><li><a href="#implantacion">Implantación</a></li><li><a href="#reserva">Discovery call</a></li></ul></div><div><p className="mb-3 font-bold">Legal</p><ul className="space-y-2 text-[#6B655E]"><li>Privacidad</li><li>Términos y condiciones</li><li>Cookies y preferencias</li><li>Transparencia sobre IA</li></ul></div></div></div><div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-[var(--line)] pt-5 text-sm text-[#6B655E]"><span>© AgntiaPro · Habla con tu empresa.</span><span>Hecho con calma, para empresas que quieren avanzar.</span></div></div></footer>

      {/* CHAT PERSISTENTE */}
      {!chatOpen && <button onClick={() => setChatOpen(true)} className="fixed bottom-4 right-4 z-[80] flex items-center gap-2 rounded-full bg-[#111] px-5 py-3.5 text-sm font-bold text-white shadow-2xl">Chat <span className="h-2 w-2 rounded-full bg-emerald-400" /></button>}
      {chatOpen && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/30 pt-[max(1rem,var(--safe-area-inset-top))]">
          <div className="flex min-h-full items-end justify-center sm:items-center sm:justify-end sm:pr-4">
            <div className="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
              <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#5B4BDB] text-sm font-bold text-white">L</span><div className="flex-1"><p className="font-bold">LAIA</p><p className="text-sm text-emerald-600">En línea</p></div><button onClick={() => setChatOpen(false)} className="rounded-full bg-[#F5EFE6] p-2" aria-label="Minimizar chat"><ChevronDown className="h-5 w-5" /></button><button onClick={() => setChatOpen(false)} className="rounded-full bg-[#F5EFE6] p-2" aria-label="Cerrar chat"><X className="h-5 w-5" /></button></div>
              <div ref={scrollRef} className="h-64 space-y-3 overflow-y-auto bg-[#FDFBF7] p-4">{messages.map((m, i) => (<div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[86%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] ${m.role === 'user' ? 'bg-[#111] text-white' : 'border border-[var(--line)] bg-white'}`}>{m.text}</div></div>))}{typing && <p className="text-sm text-[#6B655E]">LAIA está escribiendo…</p>}</div>
              <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex gap-2 border-t border-[var(--line)] p-3"><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pregunta a LAIA…" className="flex-1 rounded-full border border-[var(--line)] px-3 py-2.5 text-sm" aria-label="Pregunta a LAIA" /><button className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#5B4BDB] text-white" aria-label="Enviar"><ArrowUp className="h-5 w-5" /></button></form>
              <div className="flex gap-2 overflow-x-auto px-3 pb-3 no-scrollbar">{chips.map((c) => <button key={c} onClick={() => send(c)} className="shrink-0 rounded-full border border-[var(--line)] px-3 py-1.5 text-sm font-semibold">{c}</button>)}</div>
            </div>
          </div>
        </div>
      )}

      {/* PANEL AGENTE */}
      {selectedAgent && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/30 pt-[max(1rem,var(--safe-area-inset-top))]">
          <div className="flex min-h-full items-end justify-center sm:items-center sm:justify-end sm:pr-4">
            <div className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6">
              <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-[#6B655E]">Presentación · {selectedAgent.duration}</p><h3 className="serif mt-1 text-sm font-medium leading-none">{selectedAgent.name}</h3><p className="mt-1 text-sm font-semibold text-[#6B655E]">{selectedAgent.role}</p></div><button onClick={() => { setSelectedAgent(null); setPlaying(false) }} className="rounded-full bg-[#F5EFE6] p-2" aria-label="Cerrar presentación"><X className="h-5 w-5" /></button></div>
              <div className="relative mt-5 overflow-hidden rounded-2xl border border-[var(--line)]"><img src={selectedAgent.img} alt={`${selectedAgent.name}, ${selectedAgent.role}`} className="aspect-[4/5] w-full object-cover object-top" /><div className="absolute inset-x-0 bottom-0 bg-white/95 p-3"><p className="text-sm font-semibold">{playing ? subtitles[Math.floor(progress / 25) % 4] : 'Pulsa play · subtítulos activados · sin sonido'}</p><div className="mt-2 h-1 overflow-hidden rounded-full bg-[#E8DFD2]"><div className="h-full bg-[#111111]" style={{ width: `${progress}%` }} /></div></div></div>
              <p className="serif mt-5 text-sm italic leading-snug">“{selectedAgent.quote}”</p><p className="mt-2 text-sm leading-relaxed text-[#6B655E]">{selectedAgent.detail} En esta demostración, el vídeo es una simulación con la foto del agente; la conversación con LAIA sí funciona.</p>
              <div className="mt-5 flex gap-2"><button onClick={() => setPlaying(!playing)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#111] px-4 py-3 text-sm font-bold text-white">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{playing ? 'Pausar simulación' : 'Reproducir simulación'}</button><button onClick={() => { setSelectedAgent(null); askAgent(selectedAgent) }} className="flex-1 rounded-full bg-[#5B4BDB] px-4 py-3 text-sm font-bold text-white">Pregúntale a LAIA</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
