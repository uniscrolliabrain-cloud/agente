import { Lock, Sparkles } from "lucide-react";
import { APP_BY_ID, COMPANY, FOLDERS, type LauncherApp } from "./launcher-catalog";
import { AppIcon } from "./AppIcon";
import { LauncherDock } from "./LauncherDock";
import { LauncherWidgets } from "./LauncherWidgets";

type HomeProps = {
  now: Date;
  favorites: string[];
  recents: string[];
  dock: string[];
  selectedId: string | null;
  onActivate: (app: LauncherApp, element: HTMLButtonElement) => void;
  onOpenApp: (id: string, element?: HTMLElement | null) => void;
  onHover: (id: string | null) => void;
  onOpenFolder: (id: string) => void;
  onOpenDrawer: () => void;
  onOpenRecents: () => void;
  onOpenLaia: () => void;
  onLock: () => void;
};

const hour = (date: Date) => date.getHours();
const greeting = (date: Date) => (hour(date) < 13 ? "Buenos días" : hour(date) < 20 ? "Buenas tardes" : "Buenas noches");
const shortDate = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });

export function LauncherHome({
  now,
  favorites,
  recents,
  dock,
  selectedId,
  onActivate,
  onOpenApp,
  onHover,
  onOpenFolder,
  onOpenDrawer,
  onOpenRecents,
  onOpenLaia,
  onLock,
}: HomeProps) {
  const favoriteApps = favorites.map((id) => APP_BY_ID.get(id)).filter((app): app is LauncherApp => Boolean(app));
  const recentApps = recents.map((id) => APP_BY_ID.get(id)).filter((app): app is LauncherApp => Boolean(app)).slice(0, 3);

  return (
    <section className="alp-home" aria-label="Escritorio de AgntiaPro">
      <header className="alp-home-top">
        <div className="alp-brand">
          <span className="alp-brand-mark" aria-hidden="true" />
          <span className="alp-brand-name">AgntiaPro</span>
          <span className="alp-brand-divider" aria-hidden="true" />
          <span className="alp-brand-company">{COMPANY.name}</span>
        </div>
        <div className="alp-home-tools">
          <button type="button" className="alp-tool alp-tool--laia" onClick={onOpenLaia}>
            <Sparkles size={15} aria-hidden="true" />
            <span>LAIA</span>
          </button>
          <button type="button" className="alp-tool" onClick={onOpenRecents} aria-label="Aplicaciones recientes">
            Recientes
          </button>
          <button type="button" className="alp-tool alp-tool--icon" onClick={onLock} aria-label="Bloquear y volver al reposo">
            <Lock size={15} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="alp-home-body">
        <div className="alp-home-main">
          <div className="alp-home-intro">
            <p className="alp-home-kicker">Escritorio · {shortDate.format(now)}</p>
            <h1 className="alp-home-greeting">{greeting(now)}, {COMPANY.user.split(" ")[0]}</h1>
            <p className="alp-home-meta">
              {favorites.length} aplicaciones fijas · {COMPANY.workspace} mantiene tus agentes en marcha
            </p>
          </div>

          <section className="alp-favorites" aria-label="Aplicaciones favoritas">
            <div className="alp-fav-grid">
              {favoriteApps.map((app) => (
                <AppIcon key={app.id} app={app} selected={selectedId === app.id} onActivate={onActivate} onHoverChange={onHover} />
              ))}
            </div>
          </section>

          <section className="alp-folder-row" aria-label="Carpetas">
            {FOLDERS.map((folder) => {
              const apps = folder.appIds.map((id) => APP_BY_ID.get(id)).filter((app): app is LauncherApp => Boolean(app));
              return (
                <button key={folder.id} type="button" className="alp-folder" onClick={() => onOpenFolder(folder.id)}>
                  <span className="alp-folder-preview" aria-hidden="true">
                    {apps.slice(0, 4).map((app) => (
                      <img key={app.id} src={app.icon} alt="" width={64} height={64} loading="lazy" decoding="async" />
                    ))}
                  </span>
                  <span className="alp-folder-name">{folder.name}</span>
                  <span className="alp-folder-count">{apps.length} apps</span>
                </button>
              );
            })}
          </section>

          {recentApps.length > 0 ? (
            <section className="alp-recents-row" aria-label="Aplicaciones recientes">
              <h2 className="alp-recents-title">Recientes</h2>
              <ul>
                {recentApps.map((app) => (
                  <li key={app.id}>
                    <button type="button" className="alp-recent-chip" onClick={(event) => onOpenApp(app.id, event.currentTarget)}>
                      <img src={app.icon} alt="" width={48} height={48} loading="lazy" decoding="async" />
                      <span>{app.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="alp-home-side" aria-label="Actividad de la empresa">
          <LauncherWidgets onOpenApp={(id) => onOpenApp(id)} />
        </aside>
      </div>

      <LauncherDock
        appIds={dock}
        selectedId={selectedId}
        onActivate={(id, element) => {
          const app = APP_BY_ID.get(id);
          if (app) onActivate(app, element as HTMLButtonElement);
        }}
        onHover={onHover}
        onOpenDrawer={onOpenDrawer}
        onOpenRecents={onOpenRecents}
        onOpenLaia={onOpenLaia}
        recentsCount={recents.length}
      />
    </section>
  );
}
