type Props = { onNewChat: () => void; mobileOpen: boolean; onClose: () => void };
const NAV = [
  { label: 'Chat', icon: '💬', count: null },
  { label: 'Tareas', icon: '✓', count: '8' },
  { label: 'Documentos', icon: '📄', count: null },
  { label: 'Proyectos', icon: '📁', count: null },
  { label: 'Lo que sabe de tu negocio', icon: '🧠', count: null },
  { label: 'Equipo', icon: '👥', count: null },
  { label: 'Agentes', icon: '🤖', count: '3' },
  { label: 'CRM', icon: '📇', count: '24' },
  { label: 'Finanzas', icon: '€', count: null },
] as const;
export function CentroMandoSidebar({ onNewChat, mobileOpen, onClose }: Props) {
  return (
    <>
      <aside className={'fixed lg:static inset-y-0 left-0 z-40 w-[260px] bg-white border-r border-[var(--border)] flex flex-col transition-transform lg:translate-x-0 ' + (mobileOpen ? 'translate-x-0' : '-translate-x-full') + ' shadow-[0_8px_40px_rgba(0,0,0,0.08)] lg:shadow-none'}>
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] bg-[#111113] text-white flex items-center justify-center font-black text-[16px]">A</div>
            <div className="leading-none">
              <div className="font-semibold text-[14px] tracking-tight">Agente IA Pro</div>
              <div className="text-[10px] font-medium text-white bg-[#111113] inline-flex px-1.5 py-0.5 rounded-full mt-0.5">PRO</div>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <div className="w-5 h-5 rounded-full bg-[#EDE8FF] text-[#6D5BFF] grid place-items-center font-bold">AC</div>
            Agente activo · ACME
          </div>
          <button onClick={onNewChat} className="mt-5 w-full h-9 rounded-full bg-[#111113] text-white text-[13px] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
            <span className="text-[16px] leading-none">+</span> Nuevo chat
          </button>
          <div className="mt-6">
            <div className="text-[10px] tracking-[0.14em] font-semibold text-[var(--muted)] mb-3">WORKSPACE</div>
            <nav className="space-y-1">
              {NAV.map(i => (
                <div key={i.label} className="flex items-center gap-3 px-2.5 py-2 rounded-[12px] text-[13px] text-[#4B4B4F] hover:bg-[#F8F7FF] cursor-pointer">
                  <span className="w-5 text-center opacity-70">{i.icon}</span>
                  <span className="flex-1 truncate">{i.label}</span>
                  {i.count && <span className="text-[11px] bg-[#F1F0FF] text-[#6D5BFF] px-1.5 py-0.5 rounded-full font-medium">{i.count}</span>}
                </div>
              ))}
              <div className="flex items-center gap-3 px-2.5 py-2 rounded-[12px] text-[13px] bg-[#111113] text-white shadow-sm cursor-pointer">
                <span className="w-5 text-center">📊</span>
                <span className="flex-1 font-medium">Analítica</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </nav>
          </div>
        </div>
        <div className="mt-auto p-4 border-t border-[var(--border)]">
          <div className="rounded-[16px] bg-[#F8F7FF] p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6D5BFF] text-white grid place-items-center text-[12px] font-bold">CR</div>
            <div>
              <div className="text-[12px] font-semibold">Carlos Ruiz</div>
              <div className="text-[11px] text-[var(--muted)]">Admin · Holded sync</div>
            </div>
          </div>
        </div>
      </aside>
      {mobileOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} />}
    </>
  );
}
