import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, MessageCircle, RefreshCw, Send } from "lucide-react";
import { decideWhatsApp, getWhatsAppConnection, listWhatsAppDrafts, prepareWhatsApp, reconcileWhatsApp,
  type WhatsAppConnection, type WhatsAppDraft } from "../api/whatsapp";
import "./WhatsAppView.css";

const labels: Record<string, string> = { awaiting_review: "Pendiente de tu revisión", dispatching: "En proceso",
  accepted: "Aceptado por el proveedor", rejected: "Rechazado", failed: "No aceptado", outcome_unknown: "Resultado por revisar", sent: "Envío anterior" };
const message = (error: unknown) => error instanceof Error ? error.message : "No se pudo completar la operación";

export default function WhatsAppView() {
  const [drafts, setDrafts] = useState<WhatsAppDraft[]>([]);
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [busy, setBusy] = useState<string | null>(null), [notice, setNotice] = useState("");
  const [to, setTo] = useState(""), [text, setText] = useState("");
  const intentKey = useRef(crypto.randomUUID());
  const [reconcileId, setReconcileId] = useState<string | null>(null);
  const [resolution, setResolution] = useState<"provider_accepted" | "confirmed_not_sent">("provider_accepted");
  const [evidenceRef, setEvidenceRef] = useState(""), [providerId, setProviderId] = useState("");
  const [checkedProvider, setCheckedProvider] = useState(false);
  const load = useCallback(async (signal?: AbortSignal) => {
    const results = await Promise.allSettled([listWhatsAppDrafts(signal), getWhatsAppConnection(signal)]);
    if (signal?.aborted) return;
    if (results[0].status === "fulfilled") { setDrafts(results[0].value.drafts); setError(""); }
    else setError(message(results[0].reason));
    if (results[1].status === "fulfilled") { setConnection(results[1].value); setConnectionError(""); }
    else { setConnection(null); setConnectionError(message(results[1].reason)); }
    setLoading(false);
  }, []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  useEffect(() => {
    if (!drafts.some((d) => d.status === "dispatching")) return;
    const controller = new AbortController();
    const interval = setInterval(() => { void load(controller.signal); }, 10_000);
    return () => { clearInterval(interval); controller.abort(); };
  }, [drafts, load]);
  const prepare = async (event: FormEvent) => {
    event.preventDefault(); if (busy) return;
    setBusy("prepare"); setError(""); setNotice("");
    try {
      await prepareWhatsApp(to, text, intentKey.current);
      setText(""); intentKey.current = crypto.randomUUID();
      await load(); setNotice("Borrador preparado. Revisa el número y el mensaje antes de aprobar.");
    } catch (e) { setError(message(e)); } finally { setBusy(null); }
  };
  const decide = async (draft: WhatsAppDraft, decision: "send" | "reject") => {
    if (busy || !draft.revision) return;
    setBusy(draft.id); setError(""); setNotice("");
    try {
      const result = await decideWhatsApp(draft, decision);
      await load();
      setNotice(result.status === "accepted" ? "El proveedor ha aceptado el mensaje. Aún no confirma su entrega."
        : result.requiresReconciliation ? "Consulta el proveedor antes de dar el mensaje por enviado o intentar otro."
        : decision === "reject" ? "Borrador rechazado." : "Estado actualizado.");
    } catch (e) { await load(); setError(message(e)); } finally { setBusy(null); }
  };
  const reconcile = async (event: FormEvent, draft: WhatsAppDraft) => {
    event.preventDefault(); if (busy || !checkedProvider) return;
    setBusy(draft.id); setError("");
    try {
      await reconcileWhatsApp(draft, resolution, evidenceRef.trim(), resolution === "provider_accepted" ? providerId.trim() : undefined);
      setReconcileId(null); setEvidenceRef(""); setProviderId(""); setCheckedProvider(false);
      await load(); setNotice("Comprobación registrada. No se ha enviado ningún mensaje adicional.");
    } catch (e) { setError(message(e)); } finally { setBusy(null); }
  };
  const pending = drafts.filter((d) => d.status === "awaiting_review" && !d.needsReprepare).length;
  const unresolved = drafts.filter((d) => d.requiresReconciliation).length;
  return <section className="wa-view" aria-labelledby="wa-title">
    <header className="wa-header">
      <div><div className="wa-eyebrow"><MessageCircle size={15} /> COMUNICACIÓN</div><h1 id="wa-title">WhatsApp</h1><p>Prepara, revisa y aprueba cada mensaje.</p></div>
      <button className="wa-button" disabled={loading || Boolean(busy)} onClick={() => { setLoading(true); void load(); }}><RefreshCw size={15} /> Actualizar</button>
    </header>
    <div className="wa-summary">
      <div><strong>{pending}</strong><span>Pendientes de revisión</span></div>
      <div><strong>{unresolved}</strong><span>Por comprobar con el proveedor</span></div>
      <div><span className={`wa-connection-dot ${connection?.enabled && connection?.outboundEnabled ? "enabled" : ""}`} /><span>{connection?.enabled ? connection.outboundEnabled ? "Salida habilitada" : "Salida pausada" : "Conexión pendiente"}</span></div>
    </div>
    {(connectionError || (connection && (!connection.enabled || !connection.outboundEnabled))) && <div className="wa-banner"><AlertCircle size={18} /><div><strong>{connectionError ? "La conexión necesita revisión" : "Los envíos están pausados"}</strong><p>{connectionError || "Puedes revisar tus mensajes. La salida debe estar habilitada antes de aprobar un envío."}</p></div></div>}
    {error && <div className="wa-banner wa-error" role="alert"><AlertCircle size={18} /><span>{error}</span></div>}
    {notice && <div className="wa-banner wa-notice" role="status"><CheckCircle2 size={18} /><span>{notice}</span></div>}
    <div className="wa-layout">
      <form className="wa-card wa-compose" onSubmit={(event) => { void prepare(event); }}>
        <h2>Preparar un mensaje</h2><p className="wa-muted">Crear un borrador no envía nada.</p>
        <label htmlFor="wa-recipient">Destinatario del piloto</label>
        <select id="wa-recipient" value={to} required disabled={!connection?.enabled || Boolean(busy)} onChange={(event) => { setTo(event.target.value); intentKey.current = crypto.randomUUID(); }}>
          <option value="">Selecciona un número</option>{connection?.allowedRecipients.map((number) => <option key={number} value={number}>+{number}</option>)}
        </select>
        <label htmlFor="wa-message">Mensaje</label>
        <textarea id="wa-message" rows={8} value={text} maxLength={4000} required disabled={!connection?.enabled || Boolean(busy)} placeholder="Escribe el mensaje que quieres revisar…" onChange={(event) => { setText(event.target.value); intentKey.current = crypto.randomUUID(); }} />
        <div className="wa-compose-footer"><span className="wa-muted">{text.length} / 4000</span><button className="wa-button wa-primary" disabled={!connection?.enabled || !to || !text.trim() || Boolean(busy)} type="submit">{busy === "prepare" ? "Preparando…" : "Crear borrador"}</button></div>
      </form>
      <section className="wa-drafts" aria-labelledby="wa-drafts-title"><h2 id="wa-drafts-title">Revisión y seguimiento</h2>
        {loading && !drafts.length ? <p className="wa-muted" role="status">Cargando mensajes…</p> : !drafts.length ? <div className="wa-card wa-empty"><MessageCircle size={28} /><h3>Aún no hay borradores</h3><p>Prepara el primero. Lo verás aquí antes de aprobarlo.</p></div> : drafts.map((draft) => {
          const expired = Boolean(draft.expiresAt && Date.parse(draft.expiresAt) <= Date.now());
          const canReview = draft.status === "awaiting_review" && !draft.needsReprepare && !expired && Boolean(draft.revision);
          return <article className="wa-card" key={draft.id}>
            <div className="wa-draft-heading"><strong>+{draft.to.replace(/^\+/, "")}</strong><span className={`wa-status wa-${draft.status}`}>{labels[draft.status] ?? draft.status}</span></div>
            <p className="wa-message-preview">{draft.text}</p>
            {draft.providerId && <p className="wa-muted">Referencia del proveedor: <code>{draft.providerId}</code></p>}
            {draft.needsReprepare && <p className="wa-muted">Este borrador es anterior al circuito de revisión. Prepara uno nuevo.</p>}
            {expired && draft.status === "awaiting_review" && <p className="wa-muted">La revisión ha caducado. Prepara un borrador nuevo.</p>}
            {canReview && <div className="wa-actions"><button className="wa-button" disabled={Boolean(busy)} onClick={() => { void decide(draft, "reject"); }}>Rechazar</button><button className="wa-button wa-primary" disabled={Boolean(busy) || !connection?.enabled || !connection.outboundEnabled} onClick={() => { void decide(draft, "send"); }}><Send size={14} />{busy === draft.id ? "Procesando…" : "Aprobar y enviar"}</button></div>}
            {draft.requiresReconciliation && <div className="wa-reconciliation"><p><strong>Comprueba el estado antes de continuar.</strong> Este mensaje no se reenviará automáticamente.</p>
              {reconcileId !== draft.id ? <button className="wa-button" disabled={Boolean(busy)} onClick={() => { setReconcileId(draft.id); setCheckedProvider(false); setEvidenceRef(""); setProviderId(""); }}>Registrar comprobación</button> : <form onSubmit={(event) => { void reconcile(event, draft); }}>
                <label>Resultado en el proveedor<select value={resolution} onChange={(event) => setResolution(event.target.value as typeof resolution)}><option value="provider_accepted">El proveedor lo ha aceptado</option><option value="confirmed_not_sent">He confirmado que no se envió</option></select></label>
                {resolution === "provider_accepted" && <label>ID del mensaje en el proveedor<input required maxLength={300} value={providerId} onChange={(event) => setProviderId(event.target.value)} /></label>}
                <label>Referencia de la comprobación<input required minLength={3} maxLength={200} pattern="[A-Za-z0-9._:-]+" placeholder="Ej. revision-001" value={evidenceRef} onChange={(event) => setEvidenceRef(event.target.value)} /></label>
                <label className="wa-checkbox"><input type="checkbox" checked={checkedProvider} required onChange={(event) => setCheckedProvider(event.target.checked)} />He consultado el proveedor y confirmado este resultado.</label>
                <button className="wa-button" disabled={Boolean(busy) || !checkedProvider} type="submit">Guardar comprobación</button>
              </form>}
            </div>}
            {draft.reconciliation && <p className="wa-muted">Comprobación registrada: {draft.reconciliation.evidenceRef}. No se reintentó el envío.</p>}
          </article>;
        })}
      </section>
    </div>
  </section>;
}
