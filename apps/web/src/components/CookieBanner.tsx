import { useEffect, useRef, useState } from "react";
import { Cookie, X } from "lucide-react";
import {
  OPEN_COOKIE_PREFERENCES_EVENT,
  readConsent,
  saveConsent,
} from "../lib/consent";
import "./cookie-consent.css";

// COOKIE_BANNER_V1 - aparece cinco segundos después de cargar la página, sin
// desplazar el contenido y sin activar nada antes de que exista una elección.
// El enlace permanente del footer puede abrir las preferencias sin esperar.
const DEFAULT_DELAY_MS = 5000;

type Props = {
  delayMs?: number;
};

export default function CookieBanner({ delayMs = DEFAULT_DELAY_MS }: Props) {
  const [visible, setVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [measurement, setMeasurement] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (readConsent()) return;
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  useEffect(() => {
    const onOpen = () => {
      const current = readConsent();
      setMeasurement(current?.measurement ?? false);
      // Abrir preferencias desde el footer no debe hacer aparecer además el
      // banner: el diálogo es la superficie que pidió la persona.
      if (dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
      setPrefsOpen(true);
      window.requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    };
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, onOpen);
  }, []);

  const decide = (value: boolean) => {
    saveConsent(value);
    setVisible(false);
    setPrefsOpen(false);
    dialogRef.current?.close();
  };

  const openPreferences = () => {
    setMeasurement(readConsent()?.measurement ?? false);
    setPrefsOpen(true);
    if (dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  };

  const closePreferences = () => {
    setPrefsOpen(false);
    dialogRef.current?.close();
  };

  return (
    <>
      {visible && !prefsOpen && (
        <section
          className="cookie-consent"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-text"
        >
          <div className="cc-icon" aria-hidden="true">
            <Cookie size={20} />
          </div>
          <div className="cc-copy">
            <h2 id="cookie-consent-title">Cookies, con transparencia</h2>
            <p id="cookie-consent-text">
              Usamos cookies necesarias para que la sesión funcione. Las de medición son opcionales y
              están desactivadas hasta que las aceptes. Puedes cambiarlo cuando quieras.
            </p>
          </div>
          <div className="cc-actions">
            <button type="button" className="cc-btn cc-btn-primary" ref={acceptRef} onClick={() => decide(true)}>
              Aceptar
            </button>
            <button type="button" className="cc-btn" onClick={() => decide(false)}>
              Rechazar
            </button>
            <button type="button" className="cc-link" onClick={openPreferences}>
              Configurar
            </button>
          </div>
        </section>
      )}

      <dialog
        ref={dialogRef}
        className="cookie-dialog"
        aria-labelledby="cookie-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          closePreferences();
        }}
        onClose={() => setPrefsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePreferences();
        }}
      >
        <div className="cc-dialog-inner">
          <div className="cc-dialog-head">
            <h2 id="cookie-dialog-title">Preferencias de cookies</h2>
            <button
              type="button"
              className="cc-dialog-close"
              ref={closeRef}
              onClick={closePreferences}
              aria-label="Cerrar preferencias"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
          <p className="cc-dialog-lead">
            Necesarias siempre activas. La medición es opcional, se guarda en este navegador y no hay
            ningún servicio de analítica conectado todavía.
          </p>
          <ul className="cc-prefs">
            <li>
              <label className="cc-pref">
                <input type="checkbox" checked disabled readOnly />
                <span>
                  <strong>Necesarias</strong>
                  <em>Sesión, seguridad y esta misma preferencia. No se pueden desactivar.</em>
                </span>
              </label>
            </li>
            <li>
              <label className="cc-pref">
                <input
                  type="checkbox"
                  checked={measurement}
                  onChange={(event) => setMeasurement(event.target.checked)}
                />
                <span>
                  <strong>Medición</strong>
                  <em>Saber qué páginas se leen. Sin publicidad ni perfiles.</em>
                </span>
              </label>
            </li>
          </ul>
          <div className="cc-dialog-actions">
            <button type="button" className="cc-btn" onClick={() => decide(false)}>
              Solo esenciales
            </button>
            <button type="button" className="cc-btn cc-btn-primary" onClick={() => decide(measurement)}>
              Guardar elección
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
