// Launcher empresarial V3 · simulación de UX aislada en UI Lab.
//
// Android como referencia de interacción (reposo, escritorio, cajón, recientes,
// apertura de apps) traducido al lenguaje de AgntiaPro. Sin backend, sin
// autenticación real, sin APIs ni servicios externos: todo el contenido es
// sintético y está identificado como demostración.
import { useCallback, useEffect, useRef, useState } from "react";
import { APP_BY_ID, type LauncherApp } from "./launcher-catalog";
import { useClock, useInputModality, useLauncher, usePrefersReducedMotion } from "./launcher-state";
import { RestScreen } from "./RestScreen";
import { LauncherHome } from "./LauncherHome";
import { AppDrawer } from "./AppDrawer";
import { RecentApps } from "./RecentApps";
import { AppTransition } from "./AppTransition";
import { LauncherFolder } from "./LauncherFolder";
import "./launcher.css";

export default function AppsLauncher() {
  const api = useLauncher();
  const modality = useInputModality();
  const reduced = usePrefersReducedMotion();
  const now = useClock();
  const [, setHovered] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const restTouchStart = useRef<number | null>(null);

  // Ratón: el clic abre. Táctil: el primer toque selecciona y revela el nombre;
  // el segundo, sobre el mismo icono, abre. Teclado: Enter/Espacio abren.
  const activate = useCallback(
    (app: LauncherApp, element: HTMLButtonElement) => {
      const rect = element.getBoundingClientRect();
      if (modality === "touch" && api.selectedId !== app.id) {
        api.select(app.id);
        return;
      }
      api.openApp(app.id, rect);
    },
    [api, modality],
  );

  const requestClose = useCallback(() => {
    if (reduced) {
      api.closeApp();
      return;
    }
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setClosing(false);
      api.closeApp();
    }, 240);
  }, [api, reduced]);

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (api.folderId) api.closeFolder();
        else if (api.screen === "drawer" || api.screen === "recents") api.goHome();
        else if (api.selectedId) api.clearSelection();
      }
      if (event.key === "Enter" && api.screen === "rest") api.unlock();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [api, requestClose]);

  const activeApp = api.activeAppId ? APP_BY_ID.get(api.activeAppId) ?? null : null;

  return (
    <div className={`alp-root alp-mod-${modality}${reduced ? " alp-reduced" : ""}`} data-screen={api.screen}>
      {api.screen === "rest" ? (
        <div
          className="alp-rest-layer"
          onClick={() => api.unlock()}
          onTouchStart={(event) => {
            restTouchStart.current = event.touches[0]?.clientY ?? null;
          }}
          onTouchEnd={(event) => {
            const start = restTouchStart.current;
            const end = event.changedTouches[0]?.clientY ?? null;
            if (start !== null && end !== null && start - end > 40) api.unlock();
            restTouchStart.current = null;
          }}
        >
          <RestScreen
            now={now}
            onUnlock={api.unlock}
            onOpenNotification={(appId) => api.openApp(appId, null)}
            onOpenLaia={() => api.openApp("08-chatgpt", null)}
          />
        </div>
      ) : null}

      {api.screen === "home" ? (
        <div
          className="alp-screen"
          onClick={(event) => {
            // Tocar espacio vacío cancela la selección; los controles del
            // escritorio gestionan su propia interacción.
            const target = event.target as HTMLElement;
            if (target.closest(".alp-app, .alp-folder, .alp-widget, .alp-dock, .alp-recent-chip, .alp-tool, .alp-recents-row")) return;
            if (api.selectedId) api.clearSelection();
          }}
        >
          <LauncherHome
            now={now}
            favorites={api.favorites}
            recents={api.recents}
            dock={api.dock}
            selectedId={api.selectedId}
            onActivate={activate}
            onOpenApp={(id, element) => api.openApp(id, element?.getBoundingClientRect() ?? null)}
            onHover={setHovered}
            onOpenFolder={api.openFolder}
            onOpenDrawer={api.openDrawer}
            onOpenRecents={api.openRecents}
            onOpenLaia={() => api.openApp("08-chatgpt", null)}
            onLock={api.lock}
          />
        </div>
      ) : null}

      {api.screen === "drawer" ? (
        <div className="alp-screen alp-screen--drawer">
          <AppDrawer
            query={api.query}
            onQuery={api.setQuery}
            selectedId={api.selectedId}
            onActivate={activate}
            onClose={api.goHome}
            onHover={setHovered}
            recents={api.recents}
          />
        </div>
      ) : null}

      {api.screen === "recents" ? (
        <div className="alp-screen">
          <RecentApps
            recents={api.recents}
            onOpen={(app) => api.openApp(app.id, null)}
            onClear={api.clearRecents}
            onHome={api.goHome}
          />
        </div>
      ) : null}

      {api.screen === "app" && activeApp ? (
        <AppTransition
          app={activeApp}
          origin={api.origin}
          closing={closing}
          isFavorite={api.isFavorite(activeApp.id)}
          onClose={requestClose}
          onHome={api.goHome}
          onRecents={api.openRecents}
          onToggleFavorite={() => api.toggleFavorite(activeApp.id)}
        />
      ) : null}

      {api.folderId ? (
        <LauncherFolder
          folderId={api.folderId}
          selectedId={api.selectedId}
          onActivate={activate}
          onClose={api.closeFolder}
          onHover={setHovered}
        />
      ) : null}
    </div>
  );
}
