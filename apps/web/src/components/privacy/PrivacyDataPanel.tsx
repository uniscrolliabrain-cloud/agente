import { useEffect, useRef } from "react";
import LegalLinksInline from "../legal/LegalLinksInline";

export default function PrivacyDataPanel({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="privacy-dialog"
      aria-labelledby="privacy-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="privacy-content">
        <header>
          <h2 id="privacy-title">Privacidad y datos</h2>
          <button type="button" autoFocus onClick={onClose}>Cerrar</button>
        </header>
        <section>
          <h3>Mis datos y solicitudes</h3>
          <p>Las solicitudes de datos estarán disponibles próximamente.</p>
        </section>
        <section>
          <h3>Conexiones externas</h3>
          <p>Los permisos dependen de cada integración.</p>
        </section>
        <section>
          <h3>Políticas</h3>
          <LegalLinksInline />
        </section>
      </div>
    </dialog>
  );
}
