import { useEffect, useMemo, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { APPS, CATEGORY_ORDER, type LauncherApp } from "./launcher-catalog";
import { AppIcon } from "./AppIcon";

type AppDrawerProps = {
  query: string;
  onQuery: (value: string) => void;
  selectedId: string | null;
  onActivate: (app: LauncherApp, element: HTMLButtonElement) => void;
  onClose: () => void;
  onHover: (id: string | null) => void;
  recents: string[];
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function AppDrawer({ query, onQuery, selectedId, onActivate, onClose, onHover, recents }: AppDrawerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 260);
    return () => window.clearTimeout(id);
  }, []);

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return APPS;
    return APPS.filter((app) => normalize(`${app.name} ${app.tagline} ${app.category}`).includes(term));
  }, [query]);

  const groups = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        apps: filtered.filter((app) => app.category === category),
      })).filter((group) => group.apps.length > 0),
    [filtered],
  );

  return (
    <section
      className="alp-drawer"
      aria-label="Cajón de aplicaciones"
      onKeyDown={(event) => {
        // El input de búsqueda consume Escape para limpiarse: el cajón lo captura
        // antes para cerrarse, que es la expectativa del usuario.
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <header className="alp-drawer-head">
        <div className="alp-drawer-title">
          <h2>Aplicaciones</h2>
          <p>
            {filtered.length} de {APPS.length}
            {query ? ` · «${query}»` : " · todo lo que hace tu empresa"}
          </p>
        </div>
        <div className="alp-search">
          <Search size={16} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Buscar una aplicación"
            aria-label="Buscar una aplicación"
            autoComplete="off"
          />
          {query ? (
            <button type="button" className="alp-search-clear" onClick={() => onQuery("")} aria-label="Borrar búsqueda">
              <X size={14} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <button type="button" className="alp-drawer-close" onClick={onClose} aria-label="Cerrar cajón">
          <ChevronDown size={20} aria-hidden="true" />
        </button>
      </header>

      <div className="alp-drawer-scroll">
        {groups.length === 0 ? (
          <div className="alp-drawer-empty">
            <p>No hay aplicaciones con «{query}».</p>
            <button type="button" onClick={() => onQuery("")}>Ver las 35 aplicaciones</button>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.category} className="alp-drawer-group" aria-label={group.category}>
              <h3>{group.category}</h3>
              <div className="alp-drawer-grid">
                {group.apps.map((app) => (
                  <AppIcon
                    key={app.id}
                    app={app}
                    variant="drawer"
                    selected={selectedId === app.id}
                    badge={recents.includes(app.id) ? "Reciente" : undefined}
                    onActivate={onActivate}
                    onHoverChange={onHover}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </section>
  );
}
