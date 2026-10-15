import { useCentroMandoData } from './hooks/useCentroMandoData';
import { useDateRange } from './hooks/useDateRange';
import { useToast } from './hooks/useToast';
import { useClientSelection } from './hooks/useClientSelection';
import { useMobileMenu } from './hooks/useMobileMenu';
import { CentroMandoSidebar } from './components/CentroMandoSidebar';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { KpiGrid } from './components/KpiGrid';
import { KpiCard } from './components/KpiCard';
import { MiniBarList } from './components/MiniBarList';
import { BlockedInvoiceList } from './components/BlockedInvoiceList';
import { Sparkline } from './components/Sparkline';
import { PipelineFunnel } from './components/PipelineFunnel';
import { RetentionChart } from './components/RetentionChart';
import { RetentionStats } from './components/RetentionStats';
import { CriticalTicketsPanel } from './components/CriticalTicketsPanel';
import { ActiveProjectsPanel } from './components/ActiveProjectsPanel';
import { AgentsPerformancePanel } from './components/AgentsPerformancePanel';
import { TopClientsPanel } from './components/TopClientsPanel';
import { AiInsightsPanel } from './components/AiInsightsPanel';
import { ClientDetailModal } from './components/ClientDetailModal';
import { Toast } from './components/Toast';

export default function CentroMandoWorkspace() {
  const { range, setRange } = useDateRange('30d');
  const { toast, showToast } = useToast();
  const { selectedClient, setSelectedClient } = useClientSelection();
  const { mobileMenu, toggle, close } = useMobileMenu();
  const data = useCentroMandoData(range);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex overflow-hidden">
      <CentroMandoSidebar mobileOpen={mobileMenu} onClose={close} onNewChat={() => showToast('Nuevo chat creado con IA')} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-[rgba(248,247,255,0.85)] backdrop-blur-[14px] border-b border-[var(--border)] lg:hidden">
          <div className="px-4 h-[60px] flex items-center gap-3">
            <button onClick={toggle} className="w-9 h-9 rounded-full bg-white border border-[var(--border)] grid place-items-center">☰</button>
            <span className="text-[14px] font-semibold">Centro de Mando</span>
          </div>
        </header>
        <WorkspaceHeader range={range} onRange={setRange} onExport={() => showToast('Exportando informe con IA · PDF + CSV')} />
        <main className="px-4 lg:px-8 py-6 space-y-5 overflow-x-hidden">
          <KpiGrid>
            <KpiCard label="MENSAJES / DÍA">
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">247</span>
                <span className="text-[12px] px-1.5 py-0.5 rounded-full bg-[#D1FAE5] text-emerald-700 font-medium">+12%</span>
              </div>
              <div className="text-[11px] text-[var(--muted)]">vs mes anterior</div>
              <div className="mt-4"><MiniBarList rows={data.messageRows} /></div>
              <div className="mt-4 rounded-[12px] bg-[#FFE4E6] border border-red-100 px-3 py-2 flex items-center gap-2">
                <span className="text-[11px] font-bold text-red-600 tracking-widest">ALTA</span>
                <span className="text-[11px] text-red-700">Equipo desbordado · automatizar WhatsApp</span>
              </div>
            </KpiCard>
            <KpiCard label="FACTURACIÓN BLOQUEADA">
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">€4.280</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FEF3C7] text-amber-700 font-medium">4 facturas</span>
              </div>
              <div className="text-[11px] text-[var(--muted)]">No sincronizan con Holded</div>
              <BlockedInvoiceList onResolve={() => showToast('Resolviendo 4 facturas con IA')} />
            </KpiCard>
            <KpiCard label="TIEMPO MEDIO RESPUESTA">
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">2h 14m</span>
                <span className="text-[12px] px-1.5 py-0.5 rounded-full bg-[#D1FAE5] text-emerald-700 font-medium">-18%</span>
              </div>
              <div className="text-[11px] text-emerald-600">Gracias a agente · -42m vs mes anterior</div>
              <div className="mt-4">
                <Sparkline points={data.sparkPoints} />
                <div className="flex justify-between text-[10px] text-[var(--muted)]"><span>7d</span><span>15d</span><span>Hoy</span></div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-[10px] bg-[#F8F7FF] p-2"><div className="text-[var(--muted)]">Bot</div><div className="font-semibold">34s</div></div>
                <div className="rounded-[10px] bg-[#F8F7FF] p-2"><div className="text-[var(--muted)]">Humano</div><div className="font-semibold">1h 58m</div></div>
                <div className="rounded-[10px] bg-[#FFE4E6] p-2"><div className="text-red-600">Fuera hrs</div><div className="font-semibold">23% fail</div></div>
              </div>
            </KpiCard>
            <KpiCard label="LTV TOTAL PIPELINE" dark>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold tracking-tight">€84.2k</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10">24 clientes</span>
              </div>
              <div className="text-[11px] text-white/60">€3.5k ticket medio</div>
              <div className="mt-5"><PipelineFunnel stages={data.pipelineStages} /></div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => showToast('Funnel analizado')} className="h-8 px-3 rounded-full bg-white text-black text-[11px] font-medium">Ver funnel</button>
                <button onClick={() => showToast('Pipeline exportado')} className="h-8 px-3 rounded-full bg-white/10 text-white text-[11px]">Exportar</button>
              </div>
            </KpiCard>
          </KpiGrid>
          <section className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
            <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 lg:p-6">
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight">Retención / Churn</h3>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Equipo Growth retención subió 12% después del fix · referencia WhatsApp screenshot</p>
              </div>
              <RetentionChart data={data.retention} range={range} />
              <RetentionStats />
            </div>
            <CriticalTicketsPanel tickets={data.tickets} onOpen={(name) => showToast('Abriendo ticket ' + name)} onVerCola={() => showToast('Cola de pagos priorizada')} onFixBot={() => showToast('Agente Soporte re-entrenado')} />
          </section>
          <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
            <ActiveProjectsPanel projects={data.projects} onReport={() => showToast('Checklist generado para 5 obras')} />
            <AgentsPerformancePanel agents={data.agents} onEdit={(name) => showToast('Editando ' + name)} onLogs={(name, conf) => showToast('Logs ' + name + ' · ' + conf + '%')} />
          </section>
          <TopClientsPanel clients={data.clients} onOpen={(c) => setSelectedClient(c)} onAction={(c) => showToast(c.action + ' · ' + c.name)} />
          <AiInsightsPanel insights={data.insights} onAction={(i) => showToast(i.cta)} />
          <div className="h-10" />
        </main>
      </div>
      {selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} onGenerate={() => { showToast('Generando ' + selectedClient.action + ' para ' + selectedClient.name); setSelectedClient(null); }} />}
      <Toast message={toast} />
    </div>
  );
}
