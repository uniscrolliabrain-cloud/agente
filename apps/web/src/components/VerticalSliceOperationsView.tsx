// VERTICAL_SLICE_OPERATIONS_VIEW_V1 (campana 20) - panel de operaciones A/B.
//
// Solo lee: automatizaciones, conexiones, fichas, aprobaciones, recibos e
// incidencias. La explicacion cita ids y horas reales del snapshot; los enlaces
// solo abren registros que vienen de la misma empresa y no aceptan ids ajenos.
import { useEffect, useState } from "react";
import { getWorkspace } from "../api/actions";
import { apiFetch } from "../api/client";
import type { ActionProposal } from "../types/api";

interface Props {
  enabled: boolean;
  onOpenTask?: (taskId: string) => void;
}

interface LeadRow {
  id: string;
  ref?: string;
  name?: string;
  domain?: string;
  status?: string;
  updatedAt?: string;
}

interface ConnectionRow {
  id?: string;
  provider?: string;
  account?: string;
  email?: string;
  status?: string;
}

const terminalFailures = new Set(["failed", "outcome_unknown", "expired"]);

function timeOf(value?: string | null): string {
  if (!value) return "sin hora";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "sin hora";
  return new Date(parsed).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}

function shortId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 10)}…` : id;
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warn" }) {
  return (
    <div className="v2-suggestion-card" style={{ cursor: "default", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: tone === "warn" && value > 0 ? "var(--v2-warn-text)" : "inherit" }}>
        {value}
      </div>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--v2-text-3)" }}>
        {label}
      </div>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h2>
        <span className="v2-tasks-meta">{count}</span>
      </div>
      <div style={{ marginTop: 8, display: "grid", gap: 8 }}>{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="v2-tasks-meta" style={{ padding: "10px 12px", border: "1px dashed var(--v2-border)", borderRadius: 12 }}>{children}</div>;
}

export default function VerticalSliceOperationsView({ enabled, onOpenTask }: Props) {
  const [actions, setActions] = useState<ActionProposal[]>([]);
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const [workspace, pipeline] = await Promise.all([
          getWorkspace(),
          apiFetch<{ leads: LeadRow[] }>("/api/leads"),
        ]);
        if (cancelled) return;
        setActions(workspace.actions);
        setConnections((workspace.connections ?? []) as ConnectionRow[]);
        setLeads(pipeline.leads ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "No se pudieron cargar las operaciones");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [enabled, reloadKey]);

  const approvals = actions.filter((action) => action.status === "awaiting_review");
  const receipts = actions.filter((action) => action.status === "succeeded");
  const incidents = actions.filter((action) => terminalFailures.has(action.status));
  const automations = actions.filter((action) => action.status === "scheduled" || Boolean(action.executeAt));
  const latestAction = [...actions].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  const latestLead = [...leads].sort((a, b) => Date.parse(b.updatedAt ?? "") - Date.parse(a.updatedAt ?? ""))[0];
  const briefing = latestAction
    ? `Ayer: ${approvals.length} revisiones, ${receipts.length} recibos y ${incidents.length} incidencias. ` +
      `Ultimo registro: accion ${shortId(latestAction.id)} (${latestAction.status}) a las ${timeOf(latestAction.createdAt)}. ` +
      (latestLead ? `Ficha mas reciente: ${shortId(latestLead.id)} (${latestLead.status ?? "sin estado"}).` : "")
    : "Sin registros de accion todavia: no hay nada que explicar.";

  const openTask = (action: ActionProposal) => {
    if (action.taskId && onOpenTask) onOpenTask(action.taskId);
  };

  return (
    <div className="v2-tasks-view">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 className="v2-tasks-title">Operaciones</h1>
          <div className="v2-tasks-meta">Panel de solo lectura: trabajo, conexiones, fichas, revisiones y recibos.</div>
        </div>
        <button className="v2-pill" disabled={loading} onClick={() => setReloadKey((key) => key + 1)}>
          {loading ? "Cargando…" : "Actualizar"}
        </button>
      </div>

      {error && <div className="chat-error" style={{ marginTop: 12 }}>{error}</div>}

      <div className="v2-suggestion-card" style={{ cursor: "default", marginTop: 16, display: "block" }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Explicación del día</div>
        <div style={{ fontSize: 12.5, color: "var(--v2-text-2)", marginTop: 6, lineHeight: 1.5 }}>{briefing}</div>
        {latestAction?.taskId && onOpenTask && (
          <button className="v2-pill" style={{ marginTop: 10 }} onClick={() => onOpenTask(latestAction.taskId!)}>
            Abrir el trabajo citado
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginTop: 16 }}>
        <Stat label="Revisiones" value={approvals.length} />
        <Stat label="Recibos" value={receipts.length} />
        <Stat label="Incidencias" value={incidents.length} tone="warn" />
        <Stat label="Automatizaciones" value={automations.length} />
        <Stat label="Fichas" value={leads.length} />
        <Stat label="Conexiones" value={connections.length} />
      </div>

      <Section title="Aprobaciones pendientes" count={approvals.length}>
        {approvals.length === 0 && <Empty>Nada espera revisión.</Empty>}
        {approvals.map((action) => (
          <div key={action.id} className="v2-suggestion-card" style={{ cursor: "default" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{action.title}</div>
              <div className="v2-tasks-meta">
                {action.kind} · #{action.hash.slice(0, 12)} · expira {timeOf(action.expiresAt)}
              </div>
            </div>
            {action.taskId && onOpenTask && (
              <button className="v2-pill" onClick={() => openTask(action)}>Abrir</button>
            )}
          </div>
        ))}
      </Section>

      <Section title="Automatizaciones" count={automations.length}>
        {automations.length === 0 && <Empty>Sin acciones programadas.</Empty>}
        {automations.map((action) => (
          <div key={action.id} className="v2-suggestion-card" style={{ cursor: "default" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{action.title}</div>
              <div className="v2-tasks-meta">{action.status} · ejecuta {timeOf(action.executeAt)} · {shortId(action.id)}</div>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Conexiones" count={connections.length}>
        {connections.length === 0 && <Empty>La empresa no tiene conexiones.</Empty>}
        {connections.map((connection, index) => (
          <div key={connection.id ?? `connection-${index}`} className="v2-suggestion-card" style={{ cursor: "default" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{connection.provider ?? "Conexión"}</div>
              <div className="v2-tasks-meta">
                {connection.account ?? connection.email ?? "cuenta sin identificar"}
                {connection.status ? ` · ${connection.status}` : ""}
                {connection.id ? ` · ${shortId(connection.id)}` : ""}
              </div>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Fichas comerciales" count={leads.length}>
        {leads.length === 0 && <Empty>El pipeline está vacío.</Empty>}
        {leads.map((lead) => (
          <div key={lead.id} className="v2-suggestion-card" style={{ cursor: "default" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{lead.name ?? "Ficha sin nombre"}</div>
              <div className="v2-tasks-meta">
                {lead.status ?? "sin estado"}
                {lead.domain ? ` · ${lead.domain}` : ""}
                {lead.updatedAt ? ` · ${timeOf(lead.updatedAt)}` : ""}
                {` · ${shortId(lead.ref ?? lead.id)}`}
              </div>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Recibos" count={receipts.length}>
        {receipts.length === 0 && <Empty>Sin recibos del proveedor.</Empty>}
        {receipts.map((action) => (
          <div key={action.id} className="v2-suggestion-card" style={{ cursor: "default" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{action.title}</div>
              <div className="v2-tasks-meta">{action.result ?? action.kind} · {shortId(action.id)}</div>
            </div>
            {action.taskId && onOpenTask && (
              <button className="v2-pill" onClick={() => openTask(action)}>Abrir</button>
            )}
          </div>
        ))}
      </Section>

      <Section title="Incidencias" count={incidents.length}>
        {incidents.length === 0 && <Empty>Ninguna incidencia abierta.</Empty>}
        {incidents.map((action) => (
          <div key={action.id} className="v2-suggestion-card" style={{ cursor: "default", borderColor: "var(--v2-warn-text)" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{action.title}</div>
              <div className="v2-tasks-meta">
                {action.status} · {action.error ?? "sin detalle"} · {shortId(action.id)}
              </div>
            </div>
            {action.taskId && onOpenTask && (
              <button className="v2-pill" onClick={() => openTask(action)}>Abrir</button>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
}
