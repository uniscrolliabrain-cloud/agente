// D3_APPSHELL_PANEL_V1 - panel prop puede recibir ContextualPanel con ViewSpec.
// B1_APPSHELL_V1 - shell 3 columnas con grid-template-columns.
import type { ReactNode } from "react";
import { usePanel } from "../hooks/usePanel";

interface Props {
  sidebar: ReactNode;
  children: ReactNode;
  panel?: ReactNode;
}

export default function AppShell({ sidebar, children, panel }: Props) {
  const [left, setLeft] = usePanel("ui.left", true);
  const [right, setRight] = usePanel("ui.right", false);
  const rightVisible = right && Boolean(panel);

  return (
    <div className="shell" data-left={left} data-right={rightVisible}>
      <aside className="shell__left" inert={!left}>
        {sidebar}
      </aside>
      <main className="shell__main">
        <div className="shell__toggles">
          <button
            type="button"
            className="shell__toggle"
            aria-label={left ? "Ocultar panel izquierdo" : "Mostrar panel izquierdo"}
            aria-expanded={left}
            onClick={() => setLeft((v) => !v)}
          >
            ☰
          </button>
          {panel && (
            <button
              type="button"
              className="shell__toggle"
              aria-label={rightVisible ? "Ocultar panel derecho" : "Mostrar panel derecho"}
              aria-expanded={rightVisible}
              onClick={() => setRight((v) => !v)}
            >
              ▤
            </button>
          )}
        </div>
        {children}
      </main>
      {panel && (
        <aside className="shell__right" inert={!rightVisible}>
          {panel}
        </aside>
      )}
    </div>
  );
}