import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { connectGoogle, disconnectGoogle, googleStatus, type GoogleStatus } from "../../api/google";
import ConnectionPrivacyDetails from "./ConnectionPrivacyDetails";

export default function GoogleConnections() {
  const [google, setGoogle] = useState<GoogleStatus | null>(null);
  const [googleBusy, setGoogleBusy] = useState<"read" | "write" | "disconnect" | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void googleStatus()
      .then((status) => { if (!cancelled) setGoogle(status); })
      .catch(() => { if (!cancelled) setGoogle(null); });
    return () => { cancelled = true; };
  }, []);

  const connectGoogleAccount = async (capability: "read" | "write") => {
    setGoogleBusy(capability);
    setGoogleError(null);
    try {
      const result = await connectGoogle(capability);
      if (result.url) window.location.assign(result.url);
      else setGoogle(await googleStatus());
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "No se pudo conectar con Google");
    } finally {
      setGoogleBusy(null);
    }
  };

  const disconnectGoogleAccount = async () => {
    setGoogleBusy("disconnect");
    setGoogleError(null);
    try {
      await disconnectGoogle();
      setGoogle(await googleStatus());
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "No se pudo desconectar Google");
      setGoogle(await googleStatus().catch(() => null));
    } finally {
      setGoogleBusy(null);
    }
  };

  return (
    <>
          {googleError && (<div className="modal-error"><AlertCircle size={16} /><span>{googleError}</span></div>)}
          <div className="modal-label">Google Workspace (Gmail, Calendar, Drive)</div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
            {google?.connected
              ? `Conectado como ${google.account ?? "cuenta desconocida"}.`
              : google?.sample
                ? "Sin conexion. En modo sample el correo y el calendario son datos simulados."
                : "Sin conexion. Sin ella el agente no puede leer Gmail ni preparar correos ni eventos."}
          </div>
          <ConnectionPrivacyDetails connection={google} />
          {google && !google.sample && !google.configured && (
            <div className="modal-error">
              <AlertCircle size={16} />
              <span>Conexión no configurada para esta instalación.</span>
            </div>
          )}
          <div className="control-row">
            <button className="v2-pill" disabled={!google?.configured || googleBusy !== null} onClick={() => void connectGoogleAccount("read")}>
              {googleBusy === "read" ? "Abriendo Google..." : "Conectar (lectura)"}
            </button>
            <button className="v2-pill" disabled={!google?.configured || googleBusy !== null} onClick={() => void connectGoogleAccount("write")}>
              {googleBusy === "write" ? "Abriendo Google..." : "Conectar (escritura)"}
            </button>
            {google?.connected && (
              <button className="v2-pill" disabled={!google?.configured || googleBusy !== null} onClick={() => void disconnectGoogleAccount()}>
                {googleBusy === "disconnect" ? "Desconectando..." : "Desconectar"}
              </button>
            )}
          </div>
    </>
  );
}
