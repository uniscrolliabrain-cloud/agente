// COMMAND_CENTER_BRIEFING_V1 - resumen de la jornada.
//
// El texto se calcula con los datos del tenant (GET /api/company); no hay
// todavia endpoint de briefing del LLM ni audio, asi que no se simula ninguna
// de las dos cosas. Cuando exista se sustituye solo este componente.
import { MessageSquare, Sparkles } from "lucide-react";
import type { CompanyOverview } from "../../api/company";

export function briefingText(overview: CompanyOverview): string {
  const { tasks, agents, members, tenant } = overview;
  if (tasks.total === 0) {
    return `Todavía no hay actividad registrada en ${tenant.name}. Cuando los agentes empiecen a trabajar, el resumen aparecerá aquí.`;
  }

  const head: string[] = [];
  if (tasks.running > 0) {
    head.push(`${tasks.running} ${tasks.running === 1 ? "tarea sigue en marcha" : "tareas siguen en marcha"}`);
  }
  if (tasks.waiting > 0) {
    head.push(`${tasks.waiting} ${tasks.waiting === 1 ? "espera" : "esperan"} tu autorización`);
  }
  if (tasks.failed > 0) {
    head.push(`${tasks.failed} ${tasks.failed === 1 ? "ha fallado" : "han fallado"}`);
  }

  const done =
    tasks.succeeded > 0
      ? `Se ${tasks.succeeded === 1 ? "ha cerrado 1 tarea" : `han cerrado ${tasks.succeeded} tareas`}.`
      : "";
  const activeAgents = agents.filter((agent) => agent.active).length;

  return [
    head.length > 0 ? `${head.join(", ")}.` : "",
    done,
    `${activeAgents} ${activeAgents === 1 ? "agente activo" : "agentes activos"} y ${members.length} ${
      members.length === 1 ? "persona" : "personas"
    } en ${tenant.name}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

interface Props {
  overview: CompanyOverview;
  hasFinishedWork: boolean;
  onSeeWork: () => void;
  onOpenChat?: () => void;
}

export function BriefingCard({ overview, hasFinishedWork, onSeeWork, onOpenChat }: Props) {
  return (
    <section className="cc-briefing" aria-label="Briefing de LAIA">
      <div className="cc-briefing-head">
        <Sparkles size={14} />
        Briefing de LAIA
      </div>
      <p className="cc-briefing-text">{briefingText(overview)}</p>
      <div className="cc-briefing-actions">
        {onOpenChat && (
          <button type="button" className="cc-btn primary" onClick={onOpenChat}>
            <MessageSquare size={14} /> Preguntar a LAIA
          </button>
        )}
        {hasFinishedWork && (
          <button type="button" className="cc-btn" onClick={onSeeWork}>
            Ver qué hizo
          </button>
        )}
      </div>
    </section>
  );
}
