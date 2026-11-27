// Perspectivas del día. Mismos cinco filtros que la vista original, con el
// mismo estado y las mismas etiquetas: solo cambia la lectura visual.
import type { CommandFilter } from "../../../components/command-center/labels";

const FILTERS: { id: CommandFilter; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "aprobaciones", label: "Solo aprobaciones" },
  { id: "en-marcha", label: "En marcha" },
  { id: "agentes", label: "Agentes" },
  { id: "equipo", label: "Equipo" },
];

export function EditorialFilters({
  filter,
  onFilter,
}: {
  filter: CommandFilter;
  onFilter: (filter: CommandFilter) => void;
}) {
  return (
    <div className="cce-filters-wrap">
      <div className="cce-filters" role="group" aria-label="Filtrar el centro de mando">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="cce-filter"
            aria-pressed={filter === item.id}
            onClick={() => onFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
