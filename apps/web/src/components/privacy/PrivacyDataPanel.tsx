import { useEffect, useRef } from "react";
import GoogleConnections from "../integrations/GoogleConnections";
import LegalLinksInline from "../legal/LegalLinksInline";
import PrivacyRequests from "./PrivacyRequests";
import TenantGovernancePanel from "./TenantGovernancePanel";

export default function PrivacyDataPanel({ onClose, demo }: { onClose: () => void; demo: boolean }) {
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
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="privacy-content">
        <header>
          <h2 id="privacy-title">Privacidad y datos</h2>
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </header>
        <PrivacyRequests demo={demo} />
        <section>
          <h3>Conexiones externas</h3>
          {demo ? <p>Las conexiones de la demostración son simuladas.</p> : <GoogleConnections />}
        </section>
        {!demo && <TenantGovernancePanel />}
        <section>
          <h3>Políticas</h3>
          <LegalLinksInline />
        </section>
      </div>
    </dialog>
  );
}
