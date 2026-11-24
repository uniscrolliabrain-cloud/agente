// COMMAND_CENTER_FILTERS_V1 - KPIs y filtros del centro de mando.
// Cada KPI y cada filtro escribe el mismo estado: no hay dos verdades sobre que
// se esta mirando. Los numeros vienen del total del tenant, no de la lista de
// tareas recientes (que esta limitada a 20).
import type { CommandFilter } from "./labels";

interface Props {
  waiting: number;
  failed: number;
  running: number;
  total: number;
  agentsActive: number;
  agentsTotal: number;
  members: number;
  filter: CommandFilter;
  onFilter: (filter: CommandFilter) => void;
}

const FILTERS: { id: CommandFilter; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "aprobaciones", label: "Solo aprobaciones" },
  { id: "en-marcha", label: "En marcha" },
  { id: "agentes", label: "Agentes" },
  { id: "equipo", label: "Equipo" },
];

export function CommandFilters({
  waiting,
  failed,
  running,
  total,
  agentsActive,
  agentsTotal,
  members,
  filter,
  onFilter,
}: Props) {
  const priorities = waiting + failed;

  return (
    <>
      <section className="cc-kpis" aria-label="Resumen de la empresa">
        <button
          type="button"
          className={`cc-kpi ${filter === "aprobaciones" ? "active" : ""}`}
          onClick={() => onFilter(filter === "aprobaciones" ? "todo" : "aprobaciones")}
        >
          <span className="cc-kpi-label">Prioridades</span>
          <span className="cc-kpi-value">{priorities}</span>
          <span className="cc-kpi-meta">
            {waiting} esperando tu OK · {failed} con error
          </span>
        </button>
        <button
          type="button"
          className={`cc-kpi ${filter === "en-marcha" ? "active" : ""}`}
          onClick={() => onFilter(filter === "en-marcha" ? "todo" : "en-marcha")}
        >
          <span className="cc-kpi-label">En marcha</span>
          <span className="cc-kpi-value">{running}</span>
          <span className="cc-kpi-meta">{total} tareas en la empresa</span>
        </button>
        <button
          type="button"
          className={`cc-kpi ${filter === "agentes" ? "active" : ""}`}
          onClick={() => onFilter(filter === "agentes" ? "todo" : "agentes")}
        >
          <span className="cc-kpi-label">Agentes</span>
          <span className="cc-kpi-value">{agentsActive}</span>
          <span className="cc-kpi-meta">{agentsTotal} en la empresa</span>
        </button>
        <button
          type="button"
          className={`cc-kpi ${filter === "equipo" ? "active" : ""}`}
          onClick={() => onFilter(filter === "equipo" ? "todo" : "equipo")}
        >
          <span className="cc-kpi-label">Equipo</span>
          <span className="cc-kpi-value">{members}</span>
          <span className="cc-kpi-meta">personas con acceso</span>
        </button>
      </section>

      <div className="cc-filters" role="group" aria-label="Filtrar el centro de mando">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`v2-pill ${filter === item.id ? "active" : ""}`}
            onClick={() => onFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
