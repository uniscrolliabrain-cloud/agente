import { ArrowRight, CalendarDays, ListChecks, Sparkles } from "lucide-react";
import { WIDGET_DATA } from "./launcher-catalog";

type WidgetsProps = {
  onOpenApp: (appId: string) => void;
};

const stateLabel: Record<string, string> = {
  trabajando: "Trabajando",
  revisando: "Revisando",
  "en espera": "En espera",
};

export function LauncherWidgets({ onOpenApp }: WidgetsProps) {
  return (
    <div className="alp-widgets" aria-label="Widgets del escritorio">
      <article className="alp-widget alp-widget--briefing">
        <header>
          <span className="alp-widget-kicker">Briefing</span>
          <Sparkles size={14} aria-hidden="true" />
        </header>
        <p className="alp-widget-brief">{WIDGET_DATA.briefing}</p>
        <button type="button" className="alp-widget-link" onClick={() => onOpenApp("35-centro-mando")}>
          Abrir Centro de Mando
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </article>

      <article className="alp-widget alp-widget--agenda">
        <header>
          <span className="alp-widget-kicker">
            <CalendarDays size={13} aria-hidden="true" /> Agenda
          </span>
          <button type="button" className="alp-widget-more" onClick={() => onOpenApp("06-google-calendar")}>
            Ver
          </button>
        </header>
        <ul>
          {WIDGET_DATA.agenda.map((entry) => (
            <li key={entry.title}>
              <time>{entry.time}</time>
              <div>
                <span className="alp-widget-row-title">{entry.title}</span>
                <span className="alp-widget-row-meta">{entry.meta}</span>
              </div>
            </li>
          ))}
        </ul>
      </article>

      <article className="alp-widget alp-widget--pending">
        <header>
          <span className="alp-widget-kicker">
            <ListChecks size={13} aria-hidden="true" /> Trabajo pendiente
          </span>
        </header>
        <dl>
          {WIDGET_DATA.pending.map((entry) => (
            <div key={entry.label}>
              <dt>{entry.label}</dt>
              <dd>{entry.value}</dd>
              <span className="alp-widget-row-meta">{entry.meta}</span>
            </div>
          ))}
        </dl>
      </article>

      <article className="alp-widget alp-widget--agents">
        <header>
          <span className="alp-widget-kicker">Empleados sintéticos</span>
          <span className="alp-widget-live" aria-hidden="true" />
        </header>
        <ul>
          {WIDGET_DATA.agents.map((agent) => (
            <li key={agent.name}>
              <span className="alp-agent-avatar" aria-hidden="true">{agent.name.slice(0, 1)}</span>
              <div>
                <span className="alp-widget-row-title">{agent.name}</span>
                <span className="alp-widget-row-meta">{agent.task}</span>
              </div>
              <span className={`alp-agent-state alp-agent-state--${agent.state.replace(" ", "")}`}>
                {stateLabel[agent.state]}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
