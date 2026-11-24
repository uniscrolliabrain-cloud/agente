import { Grid2X2, Layers, Sparkles } from "lucide-react";
import { APP_BY_ID } from "./launcher-catalog";
import { AppIcon } from "./AppIcon";

type DockProps = {
  appIds: string[];
  selectedId: string | null;
  onActivate: (id: string, element: HTMLElement) => void;
  onHover: (id: string | null) => void;
  onOpenDrawer: () => void;
  onOpenRecents: () => void;
  onOpenLaia: () => void;
  recentsCount: number;
};

export function LauncherDock({
  appIds,
  selectedId,
  onActivate,
  onHover,
  onOpenDrawer,
  onOpenRecents,
  onOpenLaia,
  recentsCount,
}: DockProps) {
  return (
    <nav className="alp-dock" aria-label="Dock del escritorio">
      <button type="button" className="alp-dock-tool" onClick={onOpenRecents} aria-label="Aplicaciones recientes">
        <Layers size={19} aria-hidden="true" />
        {recentsCount > 0 ? <span className="alp-dock-count">{recentsCount}</span> : null}
      </button>

      <div className="alp-dock-apps">
        {appIds.map((id) => {
          const app = APP_BY_ID.get(id);
          if (!app) return null;
          return (
            <AppIcon
              key={id}
              app={app}
              variant="dock"
              selected={selectedId === id}
              onActivate={(entry, element) => onActivate(entry.id, element)}
              onHoverChange={onHover}
            />
          );
        })}
      </div>

      <button type="button" className="alp-dock-tool alp-dock-tool--laia" onClick={onOpenLaia} aria-label="Abrir LAIA">
        <Sparkles size={18} aria-hidden="true" />
      </button>
      <button type="button" className="alp-dock-tool" onClick={onOpenDrawer} aria-label="Cajón de aplicaciones">
        <Grid2X2 size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}
