// AGENT_WINDOW_CONTEXT_V1 - estado global de la ventana flotante de agente.
// Persiste entre cambios de vista. La consume AgentsPage, AppShell, ChatPanel.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface AgentWindowState {
  windowOpen: boolean;
  minimized: boolean;
  maximized: boolean;
  position: { x: number; y: number };
  zIndex: number;
  agentId: string | null;
}

interface AgentWindowContextValue extends AgentWindowState {
  open: (agentId: string) => void;
  close: () => void;
  minimize: () => void;
  maximize: () => void;
  focus: () => void;
  move: (p: { x: number; y: number }) => void;
}

const AgentWindowContext = createContext<AgentWindowContextValue | null>(null);

export function AgentWindowProvider({ children }: { children: ReactNode }) {
  const [windowOpen, setWindowOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 120 });
  const [zIndex, setZIndex] = useState(100);
  const [agentId, setAgentId] = useState<string | null>(null);

  const open = useCallback((id: string) => {
    setAgentId(id);
    setWindowOpen(true);
    setMinimized(false);
    setMaximized(false);
    setPosition({ x: 24, y: 120 });
    setZIndex((v) => v + 1);
  }, []);

  const close = useCallback(() => {
    setWindowOpen(false);
    setMinimized(false);
  }, []);

  const minimize = useCallback(() => setMinimized(true), []);
  const maximize = useCallback(() => setMaximized((v) => !v), []);
  const focus = useCallback(() => setZIndex((v) => v + 1), []);
  const move = useCallback((p: { x: number; y: number }) => setPosition(p), []);

  const value = useMemo<AgentWindowContextValue>(() => ({
    windowOpen, minimized, maximized, position, zIndex, agentId,
    open, close, minimize, maximize, focus, move,
  }), [windowOpen, minimized, maximized, position, zIndex, agentId, open, close, minimize, maximize, focus, move]);

  return <AgentWindowContext.Provider value={value}>{children}</AgentWindowContext.Provider>;
}

export function useAgentWindow(): AgentWindowContextValue {
  const ctx = useContext(AgentWindowContext);
  if (!ctx) throw new Error("useAgentWindow debe usarse dentro de AgentWindowProvider");
  return ctx;
}
