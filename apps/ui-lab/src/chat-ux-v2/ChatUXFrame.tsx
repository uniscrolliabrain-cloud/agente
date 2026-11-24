import type { ReactNode } from "react";
import "./chat-ux-v2.css";

/**
 * CHAT_UX_V2_FRAME - scope unico de la propuesta. Todo el CSS vive bajo
 * .chat-ux-v2 y responde al ancho real del contenedor (no al viewport), para
 * convivir con el panel transversal abierto.
 */
export function ChatUXFrame({ children }: { children: ReactNode }) {
  return <div className="chat-ux-v2">{children}</div>;
}
