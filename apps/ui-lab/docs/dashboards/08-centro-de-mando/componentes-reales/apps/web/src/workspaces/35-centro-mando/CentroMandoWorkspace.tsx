import { useCentroMandoData } from './hooks/useCentroMandoData';
import { useDateRange } from './hooks/useDateRange';
import { useToast } from './hooks/useToast';
import { useClientSelection } from './hooks/useClientSelection';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { KpiGrid } from './components/KpiGrid';
import { KpiCard } from './components/KpiCard';
import { BarList } from './components/BarList';
import { PendingActionsList } from './components/PendingActionsList';
import { PipelineFunnel } from './components/PipelineFunnel';
import { ActiveProjectsPanel } from './components/ActiveProjectsPanel';
import { CriticalTicketsPanel } from './components/CriticalTicketsPanel';
import { AgentsPerformancePanel } from './components/AgentsPerformancePanel';
import { TopClientsPanel } from './components/TopClientsPanel';
import { AiInsightsPanel } from './components/AiInsightsPanel';
import { ClientDetailModal } from './components/ClientDetailModal';
import { Toast } from './components/Toast';

// CENTRO_MANDO_V2 - mismo chrome que el resto del menu (sin sidebar propio ni
// marca de ejemplo) y todos los numeros salen del tenant activo.
export default function CentroMandoWorkspace() {
  const { range, setRange } = useDateRange('30d');
  const { toast, showToast } = useToast();
  const { selectedClient, setSelectedClient } = useClientSelection();
  const data = useCentroMandoData(range);

  const { kpis } = data;

  // CENTRO_MANDO_NO_FIXTURES_V1 - en sesion real los numeros vienen de
  // /api/analytics/overview (tenant del contexto). Sin datos no se pinta nada
  // de ejemplo: se dice que esta cargando o que fallo.
  if (data.loading) {
    return (
      <div className="v2-tasks-view" style={{ maxWidth: 1100 }}>
        <WorkspaceHeader meta="Cargando el tenant" range={range} onRange={setRange} onExport={() => showToast('Cargando datos')} />
        <div className="v2-tasks-empty" style={{ padding: '48px 24px' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--v2-text)' }}>Cargando la analítica del tenant...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="v2-tasks-view" style={{ maxWidth: 1100 }}>
        <WorkspaceHeader meta="Sin datos del tenant" range={range} onRange={setRange} onExport={() => showToast(data.error ?? '')} />
        <div className="v2-tasks-empty" style={{ padding: '48px 24px' }} role="alert">
          <p style={{ margin: 0, fontSize: 13, color: 'var(--v2-text)' }}>{data.error}</p>
          <small style={{ color: 'var(--v2-text-3)' }}>No se muestran datos de ejemplo mientras la fuente falle.</small>
        </div>
      </div>
    );
  }

  return (
    <div className="v2-tasks-view" style={{ maxWidth: 1100 }}>
      <WorkspaceHeader
        meta={`${data.tenant} · ${kpis.openTasks} tareas abiertas · ${kpis.leads} oportunidades`}
        range={range}
        onRange={setRange}
        onExport={() => showToast('Preparando el informe del tenant con IA · PDF + CSV')}
      />

      <KpiGrid>
        <KpiCard label="TRABAJO ABIERTO">
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold tracking-tight text-[var(--v2-text)]">{kpis.openTasks}</span>
            <span className="text-[12px] px-1.5 py-0.5 rounded-full bg-[var(--v2-purple-soft)] text-[color:var(--v2-purple)] font-medium">
              +{kpis.newToday} hoy
            </span>
          </div>
          <div className="text-[11px] text-[var(--v2-text-2)]">
            {kpis.running} en curso · {kpis.awaitingDecision} esperando tu decisión
          </div>
          <div className="mt-4">
            <BarList rows={data.load} unit=" tareas" />
          </div>
          {kpis.failed > 0 && (
            <div className="mt-4 rounded-[12px] bg-[#FFE4E6] border border-red-100 px-3 py-2 flex items-center gap-2">
              <span className="text-[11px] font-bold text-red-600 tracking-widest">ALTA</span>
              <span className="text-[11px] text-red-700">
                {kpis.failed} tarea fallida · revisa la conexión
              </span>
            </div>
          )}
        </KpiCard>

        <KpiCard label="PRESUPUESTOS EN REVISIÓN">
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold tracking-tight text-[var(--v2-text)]">{kpis.pendingAmount}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--v2-bg-soft)] text-[var(--v2-text-2)] font-medium">
              {kpis.pending} acciones
            </span>
          </div>
          <div className="text-[11px] text-[var(--v2-text-2)]">Esperando tu aprobación</div>
          <PendingActionsList
            actions={data.pending}
            onResolve={() => showToast('Abriendo Operaciones · acciones pendientes')}
          />
        </KpiCard>

        <KpiCard label="ESTADO DEL TRABAJO">
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold tracking-tight text-[var(--v2-text)]">{kpis.running}</span>
            <span className="text-[12px] px-1.5 py-0.5 rounded-full bg-[var(--v2-bg-soft)] text-[var(--v2-text-2)] font-medium">
              en curso
            </span>
          </div>
          <div className="text-[11px] text-[var(--v2-text-2)]">{kpis.done} cerradas en el periodo</div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-[10px] bg-[var(--v2-bg-soft)] p-2">
              <div className="text-[var(--v2-text-3)]">En revisión</div>
              <div className="font-semibold text-[var(--v2-text)]">{kpis.awaitingDecision}</div>
            </div>
            <div className="rounded-[10px] bg-[var(--v2-bg-soft)] p-2">
              <div className="text-[var(--v2-text-3)]">Proyectos activos</div>
              <div className="font-semibold text-[var(--v2-text)]">{kpis.activeProjects}</div>
            </div>
            <div className="rounded-[10px] bg-[#FFE4E6] p-2">
              <div className="text-red-600">Fallidas</div>
              <div className="font-semibold text-[var(--v2-text)]">{kpis.failed}</div>
            </div>
          </div>
          {data.topAgent && (
            <div className="mt-4 text-[11px] text-[var(--v2-text-2)]">
              <span className="font-semibold text-[var(--v2-text)]">{data.topAgent.name}</span> es el agente con más
              confianza · {data.topAgent.conf}%
            </div>
          )}
        </KpiCard>

        <KpiCard label="OPORTUNIDADES" dark>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[28px] font-semibold tracking-tight">{kpis.leads}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10">en cartera</span>
          </div>
          <div className="text-[11px] text-white/60">Pipeline de {data.tenant}</div>
          <div className="mt-5">
            <PipelineFunnel stages={data.pipeline} />
          </div>
          <div className="mt-auto pt-4 flex gap-2">
            <button
              onClick={() => showToast('Pipeline comercial abierto')}
              className="h-8 px-3 rounded-full bg-white text-black text-[11px] font-medium"
            >
              Ver pipeline
            </button>
            <button
              onClick={() => showToast('Oportunidades exportadas')}
              className="h-8 px-3 rounded-full bg-white/10 text-white text-[11px]"
            >
              Exportar
            </button>
          </div>
        </KpiCard>
      </KpiGrid>

      <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4 mt-4">
        <ActiveProjectsPanel
          projects={data.projects}
          onReport={() => showToast('Generando el reporte de proyectos')}
        />
        <CriticalTicketsPanel
          tickets={data.tickets}
          note={`${kpis.failed} acción fallida · ${kpis.pending} sin confirmar`}
          noteCta="Reintentar"
          onOpen={(name) => showToast('Abriendo la tarea de ' + name)}
          onVerCola={() => showToast('Cola de trabajo priorizada')}
          onFixBot={() => showToast('Conexión de Shopify marcada para reconectar')}
        />
      </section>

      <div className="mt-4">
        <TopClientsPanel
          clients={data.clients}
          onOpen={(client) => setSelectedClient(client)}
          onAction={(client) => showToast(client.action + ' · ' + client.name)}
        />
      </div>

      <div className="mt-4">
        <AgentsPerformancePanel
          agents={data.agents}
          onEdit={(name) => showToast('Editando ' + name)}
          onLogs={(name, conf) => showToast('Logs ' + name + ' · ' + conf + '%')}
        />
      </div>

      <div className="mt-4">
        <AiInsightsPanel
          insights={data.insights}
          updatedLabel={`Actualizado hace ${data.lastSync} · ${data.tenant}`}
          onAction={(insight) => showToast(insight.cta)}
        />
      </div>

      <div className="h-10" />

      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onGenerate={() => {
            showToast('Generando ' + selectedClient.action + ' para ' + selectedClient.name);
            setSelectedClient(null);
          }}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
