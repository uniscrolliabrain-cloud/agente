import type { ReactNode } from "react";
import "./command-center-editorial.css";

/**
 * Marco aislado del Centro de Mando editorial. Solo aporta tokens, tipografía y
 * el namespace `cce-legacy-*`; los hijos conservan su estado, permisos y callbacks.
 */
export function EditorialFrame({ children }: { children: ReactNode }) {
  return <div className="cce-legacy-root">{children}</div>;
}
