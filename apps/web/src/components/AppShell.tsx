// SHELL_CONTROLLED_V1 - el shell ya no guarda su propio estado: App decide si
// la barra esta plegada, si el chat ocupa la columna izquierda y si el drawer
// movil esta abierto. Asi el rail y el chat comparten una sola columna.
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  sidebar: ReactNode;
  children: ReactNode;
  panel?: ReactNode;
  /** Barra plegada: solo iconos. */
  collapsed?: boolean;
  /** La columna izquierda es el chat del agente. */
  chatDock?: boolean;
  /** Drawer movil abierto. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
  /** Panel contextual derecho. */
  rightOpen?: boolean;
}

export default function AppShell({
  sidebar,
  children,
  panel,
  collapsed = false,
  chatDock = false,
  mobileOpen,
  onCloseMobile,
  rightOpen = false,
}: Props) {
  const rightVisible = rightOpen && Boolean(panel);

  return (
    <div
      className="shell"
      data-left="true"
      data-right={rightVisible}
      data-collapsed={collapsed}
      data-chat={chatDock}
      data-mobile-open={mobileOpen}
    >
      <button
        type="button"
        className="shell__backdrop"
        aria-label="Cerrar menú"
        onClick={onCloseMobile}
      />
      <aside className="shell__left">
        <button
          type="button"
          className="shell__mobile-close"
          aria-label="Cerrar menú"
          onClick={onCloseMobile}
        >
          <X size={16} aria-hidden="true" />
        </button>
        {sidebar}
      </aside>
      <main className="shell__main">
        {children}
      </main>
      {panel && (
        <aside className="shell__right" aria-hidden={!rightVisible}>
          {panel}
        </aside>
      )}
    </div>
  );
}
