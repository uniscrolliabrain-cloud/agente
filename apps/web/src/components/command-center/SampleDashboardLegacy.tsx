// COMMAND_CENTER_SAMPLE_V1 - contenido de ejemplo del centro de mando.
//
// Es el mockup que paso el owner, traducido a componentes y tokens del producto.
// Todos los numeros son inventados: solo se pinta cuando el tenant no tiene
// actividad todavia (o en el tenant demo) y siempre bajo el aviso "Datos de
// ejemplo". Las tarjetas no disparan acciones de backend que no existan.
import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  Clock,
  Inbox,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

type SampleFilter = "todo" | "urgentes" | "aprobaciones" | "agentes";
type SampleTone = "warn" | "danger" | "ok" | "";

interface SampleItem {
  id: string;
  tag: string;
  tone: SampleTone;
  title: string;
  body: string;
  meta: string;
  sections: SampleFilter[];
}

interface SampleBlock {
  id: string;
  icon: ReactNode;
  title: string;
  desc: string;
  num: string;
  detail: string;
}

const BRIEFING =
  "Buenos días. Durante la noche se han atendido 12 conversaciones, se han preparado 3 propuestas y hay 2 decisiones que necesitan tu autorización. Tenemos una factura vencida y una oportunidad comercial importante. Te he organizado las prioridades.";

const ATTENTION: SampleItem[] = [
  {
    id: "cliente",
    tag: "Prioridad alta · Aprobación",
    tone: "warn",
    title: "Un cliente espera respuesta",
    body: "Consultoría Norte solicita confirmar una propuesta comercial. LAIA ha preparado un borrador con los cambios comentados.",
    meta: "Propuesta · 5.400 € · hace 8 min",
    sections: ["urgentes", "aprobaciones"],
  },
  {
    id: "agenda",
    tag: "Agenda",
    tone: "warn",
    title: "Conflicto de agenda",
    body: "Dos reuniones se solapan mañana a las 11:00. Hay una propuesta de cambio de horario lista para revisar.",
    meta: "Mañana · 11:00 → 12:30",
    sections: ["urgentes"],
  },
  {
    id: "factura",
    tag: "Factura vencida",
    tone: "danger",
    title: "Factura vencida",
    body: "Laura Méndez · 4.800 € · vencida hace 2 días.",
    meta: "Cobros",
    sections: ["urgentes", "aprobaciones"],
  },
];

const LOST: SampleItem[] = [
  {
    id: "teams",
    tag: "Proyecto comercial",
    tone: "ok",
    title: "Actualización del proyecto comercial",
    body: "Una decisión relevante en una conversación de Microsoft Teams. Revisa el contexto y los próximos pasos.",
    meta: "Hace 3 h",
    sections: ["todo"],
  },
  {
    id: "propuestas",
    tag: "LAIA",
    tone: "ok",
    title: "Propuesta preparada",
    body: "LAIA preparó 3 propuestas durante la noche. 2 están listas para enviar.",
    meta: "Hace 1 h",
    sections: ["todo"],
  },
];

const LATER: SampleItem[] = [
  {
    id: "informe",
    tag: "Informativo",
    tone: "",
    title: "Informe mensual disponible",
    body: "El resumen de actividad del mes ya está generado.",
    meta: "Google Workspace",
    sections: ["todo"],
  },
  {
    id: "plantilla",
    tag: "Informativo",
    tone: "",
    title: "Plantilla actualizada",
    body: "Nueva plantilla disponible para propuestas comerciales.",
    meta: "Hace 2 h",
    sections: ["todo"],
  },
  {
    id: "recordatorio",
    tag: "Informativo",
    tone: "",
    title: "Recordatorio suave",
    body: "Revisa tus preferencias de notificaciones cuando puedas.",
    meta: "Hace 5 h",
    sections: ["todo"],
  },
];

const BLOCKS: SampleBlock[] = [
  {
    id: "empresa",
    icon: <Building2 size={16} />,
    title: "Empresa",
    desc: "Ingresos, cobros, facturas y gastos",
    num: "48.200 € ingresos",
    detail:
      "Ingresos este mes 48.250 € · Gastos 31.480 € · Beneficio 16.770 € · 1 factura vencida por 4.800 €.",
  },
  {
    id: "clientes",
    icon: <Users size={16} />,
    title: "Clientes",
    desc: "Leads, oportunidades y seguimientos",
    num: "14 oportunidades",
    detail:
      "Consultoría Norte esperando respuesta · Laura Méndez, reunión mañana · 1 lead nuevo de ayer.",
  },
  {
    id: "agentes",
    icon: <Bot size={16} />,
    title: "Agentes",
    desc: "Trabajos completados, activos y bloqueados",
    num: "4 agentes activos",
    detail:
      "LAIA atendió 12 conversaciones · Antonio dejó el informe de caja listo · Ana preparó 2 fichajes · Manolo renderizó 1 clip.",
  },
  {
    id: "aprobaciones",
    icon: <CheckCircle2 size={16} />,
    title: "Aprobaciones",
    desc: "Decisiones pendientes del propietario",
    num: "3 pendientes",
    detail: "Propuesta comercial, cambio de horario y gasto de material. Todas esperan tu decisión.",
  },
  {
    id: "comunicaciones",
    icon: <MessageSquare size={16} />,
    title: "Comunicaciones",
    desc: "WhatsApp, correo, llamadas y reuniones",
    num: "27 mensajes gestionados",
    detail: "12 conversaciones atendidas · 12 correos recibidos · 3 pendientes · 4 reuniones hoy.",
  },
  {
    id: "salud",
    icon: <ShieldCheck size={16} />,
    title: "Salud operativa",
    desc: "Incidencias, riesgos y alertas",
    num: "1 alerta activa",
    detail: "1 factura vencida. Sin incidencias de ciberseguridad. Todo lo demás operativo.",
  },
];

const OS_TIMELINE = [
  { who: "L", name: "LAIA", text: "Atendió 12 conversaciones y clasificó 9 correos." },
  { who: "A", name: "Antonio", text: "Preparó el informe de caja con cobros y gastos." },
  { who: "A", name: "Ana", text: "Dejó 2 fichajes listos para tu revisión." },
  { who: "M", name: "Manolo", text: "Renderizó 1 clip de 32 segundos." },
];

const APPROVALS = [
  {
    id: "ap1",
    title: "Propuesta comercial · Consultoría Norte",
    detail: "Importe propuesto 5.400 € · LAIA preparó el borrador · Hace 38 min",
  },
  {
    id: "ap2",
    title: "Cambio de horario · Reunión comercial",
    detail: "Mover la reunión de las 11:00 a las 12:30 para evitar el solape · Hace 1 h",
  },
  {
    id: "ap3",
    title: "Gasto · Material para proyecto",
    detail: "320 € · Proveedor habitual · Justificante adjunto · Hace 2 h",
  },
];

const FILTERS: { id: SampleFilter; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "urgentes", label: "Solo urgentes" },
  { id: "aprobaciones", label: "Solo aprobaciones" },
  { id: "agentes", label: "Solo agentes" },
];

function visible(items: SampleItem[], filter: SampleFilter): boolean {
  return filter === "todo" || items.some((item) => item.sections.includes(filter));
}

function SampleCard({ item }: { item: SampleItem }) {
  return (
    <article className="cc-card">
      <span className={`cc-tag ${item.tone}`.trim()}>{item.tag}</span>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
      <span className="cc-timeline-meta">{item.meta}</span>
    </article>
  );
}

export default function SampleDashboardLegacy({ onOpenChat }: { onOpenChat?: () => void }) {
  const [filter, setFilter] = useState<SampleFilter>("todo");
  const [block, setBlock] = useState<string | null>(null);
  const currentBlock = BLOCKS.find((item) => item.id === block) ?? null;
  const seeWork = () =>
    document.getElementById("cc-timeline")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const showAttention = visible(ATTENTION, filter);
  const showLost = filter === "todo";
  const showLater = filter === "todo";
  const showBlocks = filter === "todo" || filter === "agentes";
  const showOs = filter === "todo" || filter === "agentes";
  const showApprovals = filter === "todo" || filter === "aprobaciones";

  return (
    <>
      <section className="cc-briefing" aria-label="Briefing de LAIA (ejemplo)">
        <div className="cc-briefing-head">
          <Sparkles size={14} />
          Briefing de LAIA
        </div>
        <p className="cc-briefing-text">{BRIEFING}</p>
        <div className="cc-briefing-actions">
          {onOpenChat && (
            <button type="button" className="cc-btn primary" onClick={onOpenChat}>
              <MessageSquare size={14} /> Preguntar a LAIA
            </button>
          )}
          <button type="button" className="cc-btn" onClick={seeWork}>
            Ver qué hizo
          </button>
        </div>
      </section>

      <section className="cc-kpis" aria-label="Resumen de ejemplo">
        <button
          type="button"
          className={`cc-kpi ${filter === "urgentes" ? "active" : ""}`}
          onClick={() => setFilter(filter === "urgentes" ? "todo" : "urgentes")}
        >
          <span className="cc-kpi-label">Prioridades</span>
          <span className="cc-kpi-value">3</span>
          <span className="cc-kpi-meta">Requieren tu decisión</span>
        </button>
        <button
          type="button"
          className={`cc-kpi ${filter === "aprobaciones" ? "active" : ""}`}
          onClick={() => setFilter(filter === "aprobaciones" ? "todo" : "aprobaciones")}
        >
          <span className="cc-kpi-label">Borradores</span>
          <span className="cc-kpi-value">2</span>
          <span className="cc-kpi-meta">Listos para revisar</span>
        </button>
        <button
          type="button"
          className="cc-kpi"
          onClick={() => setFilter("todo")}
        >
          <span className="cc-kpi-label">Reuniones</span>
          <span className="cc-kpi-value">4</span>
          <span className="cc-kpi-meta">Hoy en tu agenda</span>
        </button>
        <button
          type="button"
          className={`cc-kpi ${filter === "agentes" ? "active" : ""}`}
          onClick={() => setFilter(filter === "agentes" ? "todo" : "agentes")}
        >
          <span className="cc-kpi-label">Conversaciones</span>
          <span className="cc-kpi-value">12</span>
          <span className="cc-kpi-meta">Atendidas por LAIA</span>
        </button>
      </section>

      <div className="cc-filters" role="group" aria-label="Filtrar el ejemplo">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`v2-pill ${filter === item.id ? "active" : ""}`}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {showAttention && (
        <section className="cc-section">
          <div className="cc-section-head">
            <h2 className="cc-section-title">
              <AlertTriangle size={16} /> Requiere tu atención
            </h2>
            <span className="cc-section-sub">Prioridad alta · LAIA ya dejó el trabajo preparado</span>
          </div>
          <div className="cc-grid">
            {ATTENTION.filter((item) => filter === "todo" || item.sections.includes(filter)).map(
              (item) => (
                <SampleCard key={item.id} item={item} />
              ),
            )}
          </div>
        </section>
      )}

      {showLost && (
        <section className="cc-section">
          <div className="cc-section-head">
            <h2 className="cc-section-title">
              <Clock size={16} /> Lo que te has perdido
            </h2>
            <span className="cc-section-sub">Qué ocurrió mientras no estabas</span>
          </div>
          <div className="cc-grid">
            {LOST.map((item) => (
              <SampleCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {showLater && (
        <section className="cc-section">
          <div className="cc-section-head">
            <h2 className="cc-section-title">Puedes dejarlo para después</h2>
            <span className="cc-section-sub">Actualizaciones informativas sin acciones urgentes</span>
          </div>
          <div className="cc-grid">
            {LATER.map((item) => (
              <SampleCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {showBlocks && (
        <section className="cc-section">
          <div className="cc-section-head">
            <h2 className="cc-section-title">Estado operativo de la empresa</h2>
            <span className="cc-section-sub">
              Toda la empresa, no solo correo y calendario
            </span>
          </div>
          <div className="cc-blocks">
            {BLOCKS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`cc-block ${block === item.id ? "selected" : ""}`}
                aria-expanded={block === item.id}
                onClick={() => setBlock(block === item.id ? null : item.id)}
              >
                <span className="cc-block-icon">{item.icon}</span>
                <span className="cc-block-title">{item.title}</span>
                <span className="cc-block-desc">{item.desc}</span>
                <span className="cc-block-num">{item.num}</span>
              </button>
            ))}
          </div>
          {currentBlock && (
            <div className="cc-block-detail">
              <strong style={{ fontSize: 13 }}>
                {currentBlock.title} · {currentBlock.num}
              </strong>
              <p style={{ margin: "6px 0 0", fontSize: 12.5, lineHeight: 1.55, color: "var(--v2-text-2)" }}>
                {currentBlock.detail}
              </p>
            </div>
          )}
        </section>
      )}

      {showOs && (
        <section className="cc-section" id="cc-timeline">
          <div className="cc-section-head">
            <h2 className="cc-section-title">
              <CheckCircle2 size={16} /> Qué hizo tu OS agéntico
            </h2>
            <span className="cc-section-sub">Trazabilidad: quién hizo qué y con qué prueba</span>
          </div>
          <div className="cc-timeline">
            {OS_TIMELINE.map((item) => (
              <div key={item.name + item.text} className="cc-timeline-row">
                <span className="cc-timeline-avatar">{item.who}</span>
                <span className="cc-timeline-body">
                  <span className="cc-timeline-title">
                    <b>{item.name}</b> · {item.text}
                  </span>
                </span>
                <span className="cc-tag ok">Completado</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {showApprovals && (
        <section className="cc-section">
          <div className="cc-section-head">
            <h2 className="cc-section-title">
              <Inbox size={16} /> Aprobaciones
            </h2>
            <span className="cc-section-sub">
              {APPROVALS.length} pendientes · vista de ejemplo
            </span>
          </div>
          <div className="cc-timeline">
            {APPROVALS.map((item) => (
              <div key={item.id} className="cc-timeline-row">
                <span className="cc-timeline-avatar">
                  <Mail size={14} />
                </span>
                <span className="cc-timeline-body">
                  <span className="cc-timeline-title">{item.title}</span>
                  <span className="cc-timeline-meta">{item.detail}</span>
                </span>
                <span className="cc-tag warn">Pendiente</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="cc-section-sub" style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6 }}>
        <ArrowUpRight size={13} /> Los importes, clientes y conversaciones de esta vista son inventados.
      </p>
    </>
  );
}
