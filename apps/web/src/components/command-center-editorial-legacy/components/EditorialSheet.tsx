// Hoja inferior para móvil: mismo contenido que el detalle de escritorio, con
// foco inicial, Escape, cierre por fondo y devolución del foco al disparador.
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function EditorialSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [onClose]);

  // Portal a <body>: el marco editorial usa container queries (contención de
  // layout), así que el overlay no debe vivir dentro del contenedor.
  return createPortal(
    <div className="cce-root cce-sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="cce-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cce-sheet-title"
        ref={panelRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cce-sheet-grab" aria-hidden="true" />
        <div className="cce-sheet-head">
          <h2 className="cce-sheet-title" id="cce-sheet-title">
            {title}
          </h2>
          <button
            type="button"
            className="cce-icon-btn"
            onClick={onClose}
            aria-label="Cerrar detalle"
            ref={closeRef}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
