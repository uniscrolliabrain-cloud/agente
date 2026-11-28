// Cifras abiertas con separadores. Cada KPI escribe el mismo estado de filtro
// que la vista original: no hay dos verdades sobre qué se está mirando.
import { ChangeMark } from "../PresentationChanges";
import type { CommandFilter } from "../../../../web/src/components/command-center/labels";

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

export function EditorialKpis({
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
  const items: {
    id: CommandFilter;
    label: string;
    value: number;
    meta: string;
    tone?: "waiting" | "failed";
  }[] = [
    {
      id: "aprobaciones",
      label: "Prioridades",
      value: priorities,
      meta: `${waiting} pendientes de decisión o dato · ${failed} con error`,
      ...(failed > 0 ? { tone: "failed" as const } : waiting > 0 ? { tone: "waiting" as const } : {}),
    },
    { id: "en-marcha", label: "En marcha", value: running, meta: `${total} tareas en la empresa` },
    { id: "agentes", label: "Agentes", value: agentsActive, meta: `${agentsTotal} en la empresa` },
    { id: "equipo", label: "Equipo", value: members, meta: "personas con acceso" },
  ];

  return (
    <section className="cce-kpis" aria-label="Resumen de la empresa">
      {items.map((item) => {
        const active = filter === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className="cce-kpi"
            data-tone={item.tone}
            aria-pressed={active}
            onClick={() => onFilter(active ? "todo" : item.id)}
          >
            <span className="cce-kpi-label">{item.label}<ChangeMark observation={`kpi:${item.id}`} /></span>
            <span className="cce-kpi-value">{item.value}</span>
            <span className="cce-kpi-meta">{item.meta}</span>
          </button>
        );
      })}
    </section>
  );
}
