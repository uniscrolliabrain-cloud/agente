This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
components/
  ActiveProjectsPanel.tsx
  AgentPerformanceCard.tsx
  AgentsPerformancePanel.tsx
  AiActionButton.tsx
  AiInsightsPanel.tsx
  Avatar.tsx
  BlockedInvoiceList.tsx
  CentroMandoSidebar.tsx
  ChartAnnotation.tsx
  ClientDetailModal.tsx
  CriticalTicketsPanel.tsx
  DateRangePicker.tsx
  InsightCard.tsx
  KpiCard.tsx
  KpiGrid.tsx
  MiniBarList.tsx
  PipelineFunnel.tsx
  ProgressBar.tsx
  ProjectProgressRow.tsx
  RetentionChart.tsx
  RetentionStats.tsx
  SectionHeader.tsx
  Sparkline.tsx
  StatusBadge.tsx
  TicketCard.tsx
  Toast.tsx
  TopClientRow.tsx
  TopClientsPanel.tsx
  TopClientsTable.tsx
  UrgencyBadge.tsx
  WorkspaceHeader.tsx
docs/
  01-ui-map.md
  02-roadmap.md
  03-spec.md
hooks/
  useCentroMandoData.ts
  useClientSelection.ts
  useDateRange.ts
  useMobileMenu.ts
  useToast.ts
centro-mando.css
CentroMandoWorkspace.tsx
index.ts
README.md
types.ts
```

# Files

## File: components/ActiveProjectsPanel.tsx
```typescript
import type { Project } from '../types';
import { SectionHeader } from './SectionHeader';
import { ProjectProgressRow } from './ProjectProgressRow';
export function ActiveProjectsPanel({ projects, onReport }: { projects: Project[]; onReport: () => void }) {
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5">
      <SectionHeader title="Obras activas · health" actions={<><span className="text-[11px] px-2 py-1 rounded-full bg-[#F1F0FF]">{projects.length} obras</span><button onClick={onReport} className="text-[11px] h-7 px-3 rounded-full bg-[#111113] text-white">Generar reporte</button></>} />
      <div className="mt-5 space-y-4">
        {projects.map(o => <ProjectProgressRow key={o.name} o={o} />)}
      </div>
    </div>
  );
}
```

## File: components/AgentPerformanceCard.tsx
```typescript
import type { Agent } from '../types';
import { ProgressBar } from './ProgressBar';
type Props = { a: Agent; onEdit: () => void; onLogs: () => void };
export function AgentPerformanceCard({ a, onEdit, onLogs }: Props) {
  const confCls = a.status === 'ok' ? 'bg-[#D1FAE5] text-emerald-700' : 'bg-[#FEF3C7] text-amber-700';
  return (
    <div className="rounded-[14px] border border-[var(--border)] p-3">
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-medium">{a.name}</div>
        <div className={'text-[11px] px-2 py-0.5 rounded-full font-medium ' + confCls}>{a.conf}% confianza</div>
      </div>
      <div className="text-[11px] text-[var(--muted)] mt-1">{a.desc}</div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1"><ProgressBar pct={a.conf} /></div>
        <span className="text-[11px] text-[var(--muted)]">{a.tasks} tareas</span>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={onEdit} className="h-7 px-3 rounded-full bg-[#F8F7FF] border border-[var(--border)] text-[11px] font-medium">Editar agente</button>
        <button onClick={onLogs} className="h-7 px-3 rounded-full bg-[#111113] text-white text-[11px]">Ver logs</button>
      </div>
    </div>
  );
}
```

## File: components/AgentsPerformancePanel.tsx
```typescript
import type { Agent } from '../types';
import { SectionHeader } from './SectionHeader';
import { AgentPerformanceCard } from './AgentPerformanceCard';
type Props = { agents: Agent[]; onEdit: (name: string) => void; onLogs: (name: string, conf: number) => void };
export function AgentsPerformancePanel({ agents, onEdit, onLogs }: Props) {
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5">
      <SectionHeader title="Agentes performance" actions={<span className="text-[10px] px-2 py-1 rounded-full bg-[#D1FAE5] text-emerald-700">{agents.length} activos</span>} />
      <div className="mt-5 space-y-4">
        {agents.map(a => (
          <AgentPerformanceCard key={a.name} a={a} onEdit={() => onEdit(a.name)} onLogs={() => onLogs(a.name, a.conf)} />
        ))}
      </div>
    </div>
  );
}
```

## File: components/AiActionButton.tsx
```typescript
type Props = { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'dark' };
export function AiActionButton({ children, onClick, variant = 'dark' }: Props) {
  const cls = variant === 'primary' ? 'bg-[#6D5BFF] text-white hover:brightness-105' : variant === 'ghost' ? 'bg-white/10 text-white border border-white/10' : 'bg-[#111113] text-white hover:opacity-90';
  return <button onClick={onClick} className={'h-8 px-3 rounded-full text-[11px] font-medium ' + cls}>{children}</button>;
}
```

## File: components/AiInsightsPanel.tsx
```typescript
import type { Insight } from '../types';
import { InsightCard } from './InsightCard';
type Props = { insights: Insight[]; onAction: (i: Insight) => void };
export function AiInsightsPanel({ insights, onAction }: Props) {
  return (
    <section className="rounded-[20px] bg-[#111113] text-white p-5 lg:p-6 border border-black relative overflow-hidden">
      <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-[#6D5BFF] opacity-30 blur-[36px]" />
      <div className="flex items-start gap-3 relative">
        <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center text-[16px] shrink-0">✦</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-semibold">Insights IA auto-generados</h3>
            <span className="text-[10px] px-2 py-1 rounded-full bg-[#6D5BFF]">{insights.length} nuevos</span>
            <span className="text-[11px] text-white/60">Actualizado hace 12 min · Modelo AGNTia v4.2</span>
          </div>
          <div className="mt-3 grid md:grid-cols-3 gap-3">
            {insights.map(i => <InsightCard key={i.tag} i={i} onClick={() => onAction(i)} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
```

## File: components/Avatar.tsx
```typescript
type Props = { label: string; size?: number; tone?: 'lav' | 'dark' };
export function Avatar({ label, size = 32, tone = 'lav' }: Props) {
  const bg = tone === 'dark' ? 'bg-[#111113] text-white' : 'bg-[#F1F0FF] text-[#6D5BFF]';
  return (
    <div className={'rounded-full grid place-items-center text-[11px] font-bold shrink-0 ' + bg} style={{ width: size, height: size }}>
      {label}
    </div>
  );
}
```

## File: components/BlockedInvoiceList.tsx
```typescript
export function BlockedInvoiceList({ onResolve }: { onResolve: () => void }) {
  return (
    <>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-[12px]">
          <div className="w-6 h-6 rounded-full bg-[#111113] text-white grid place-items-center text-[10px] font-bold">CR</div>
          <span className="flex-1 truncate">Carlos Ruiz · Factura 234</span>
          <span className="text-[11px] text-[var(--muted)]">€1.240</span>
        </div>
        <div className="text-[11px] text-[var(--muted)] pl-8">+ 3 más: Gil Proyectos, Torres, Navarro</div>
        <div className="flex gap-1.5 pl-8 pt-1">
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#DBEAFE] text-blue-700">Holded API error</span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-[#FFE4E6] text-red-700">Autónomos 20/mes</span>
        </div>
      </div>
      <button onClick={onResolve} className="mt-4 w-full h-9 rounded-full bg-[#6D5BFF] text-white text-[12px] font-medium hover:brightness-105">Resolver con IA →</button>
    </>
  );
}
```

## File: components/CentroMandoSidebar.tsx
```typescript
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
```

## File: components/ChartAnnotation.tsx
```typescript
export function ChartAnnotation({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <>
      <line x1={x} y1="30" x2={x} y2="95" stroke="#6D5BFF" strokeDasharray="4 4" opacity="0.6" />
      <g transform={'translate(' + (x + 12) + ',22)'}>
        <rect width="112" height="22" rx="11" fill="#111113" />
        <text x="10" y="14" fontSize="10" fill="white" fontWeight="600">{label}</text>
      </g>
      <circle cx={x} cy={y} r="6" fill="#6D5BFF" stroke="white" strokeWidth="2" />
    </>
  );
}
```

## File: components/ClientDetailModal.tsx
```typescript
import type { Client } from '../types';
import { StatusBadge } from './StatusBadge';
type Props = { client: Client; onClose: () => void; onGenerate: () => void };
export function ClientDetailModal({ client, onClose, onGenerate }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-[520px] bg-white rounded-t-[24px] md:rounded-[24px] border border-[var(--border)] shadow-[0_24px_64px_rgba(0,0,0,0.2)] p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-[#EDE8FF] text-[#6D5BFF] grid place-items-center font-bold">{client.avatar}</div>
            <div>
              <div className="text-[16px] font-semibold">{client.name}</div>
              <div className="text-[12px] text-[var(--muted)]">{client.company} · {client.ltv}</div>
              <div className="mt-2 flex gap-2">
                <StatusBadge status={client.status} />
                <span className="text-[10px] px-2 py-1 rounded-full bg-[#F1F0FF] text-[#6D5BFF]">{client.amount}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F8F7FF] border border-[var(--border)] grid place-items-center">✕</button>
        </div>
        <div className="mt-5 rounded-[16px] bg-[#F8F7FF] p-4">
          <div className="text-[11px] tracking-widest font-semibold text-[var(--muted)]">DETALLE IA</div>
          <p className="text-[13px] leading-[1.6] mt-2">{client.detail}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[14px] border border-[var(--border)] p-3">
            <div className="text-[10px] text-[var(--muted)]">PRÓXIMO PASO</div>
            <div className="text-[12px] font-medium mt-1">{client.next}</div>
          </div>
          <div className="rounded-[14px] border border-[var(--border)] p-3">
            <div className="text-[10px] text-[var(--muted)]">ACCIÓN IA</div>
            <div className="text-[12px] font-medium mt-1">{client.action}</div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onGenerate} className="flex-1 h-10 rounded-full bg-[#111113] text-white text-[13px] font-medium">Generar con IA →</button>
          <button onClick={onClose} className="h-10 px-5 rounded-full bg-[#F8F7FF] border border-[var(--border)] text-[13px] font-medium">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
```

## File: components/CriticalTicketsPanel.tsx
```typescript
import type { Ticket } from '../types';
import { SectionHeader } from './SectionHeader';
import { TicketCard } from './TicketCard';
type Props = { tickets: Ticket[]; onOpen: (name: string) => void; onFixBot: () => void; onVerCola: () => void };
export function CriticalTicketsPanel({ tickets, onOpen, onFixBot, onVerCola }: Props) {
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 flex flex-col">
      <SectionHeader title={<>Tickets críticos <span className="w-5 h-5 rounded-full bg-[#FFE4E6] text-red-600 inline-grid place-items-center text-[11px] font-bold">{tickets.length}</span></>} actions={<button onClick={onVerCola} className="text-[11px] px-2.5 py-1 rounded-full bg-[#111113] text-white">Ver cola</button>} />
      <div className="mt-4 space-y-3">
        {tickets.map(t => <TicketCard key={t.name} t={t} onClick={() => onOpen(t.name)} />)}
      </div>
      <div className="mt-auto pt-4">
        <div className="rounded-[12px] bg-[#F8F7FF] p-3 flex items-center justify-between">
          <div className="text-[11px]"><span className="font-semibold">23%</span> respuestas fuera horario fallando</div>
          <button onClick={onFixBot} className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-[var(--border)]">Fix bot</button>
        </div>
      </div>
    </div>
  );
}
```

## File: components/DateRangePicker.tsx
```typescript
import type { DateRange } from '../types';
export function DateRangePicker({ range, onChange }: { range: DateRange; onChange: (r: DateRange) => void }) {
  return (
    <div className="flex p-1 rounded-full bg-[#F8F7FF] border border-[var(--border)]">
      {(['7d','30d','90d'] as DateRange[]).map(r => (
        <button key={r} onClick={() => onChange(r)} className={'px-3 h-7 rounded-full text-[12px] font-medium transition ' + (range === r ? 'bg-[#111113] text-white' : 'text-[var(--muted)] hover:text-[#111113]')}>{r}</button>
      ))}
    </div>
  );
}
```

## File: components/InsightCard.tsx
```typescript
import type { Insight } from '../types';
type Props = { i: Insight; onClick: () => void };
export function InsightCard({ i, onClick }: Props) {
  const btnCls = i.variant === 'light' ? 'bg-white text-black' : i.variant === 'primary' ? 'bg-[#6D5BFF] text-white' : 'bg-white/10 text-white border border-white/10';
  return (
    <div className="rounded-[14px] bg-white/5 border border-white/10 p-3">
      <div className="text-[11px] text-white/60 uppercase tracking-widest">{i.tag}</div>
      <p className="text-[12px] leading-[1.5] mt-2 text-white/90">{i.body}</p>
      <button onClick={onClick} className={'mt-3 h-7 px-3 rounded-full text-[11px] font-medium ' + btnCls}>{i.cta}</button>
    </div>
  );
}
```

## File: components/KpiCard.tsx
```typescript
import type { ReactNode } from 'react';
type Props = { label: string; children: ReactNode; dark?: boolean };
export function KpiCard({ label, children, dark }: Props) {
  if (dark) {
    return (
      <div className="rounded-[20px] bg-[#111113] text-white border border-black shadow-[0_12px_32px_rgba(17,17,19,0.18)] p-5 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#6D5BFF] opacity-20 blur-[24px]" />
        <div className="relative">
          <div className="text-[11px] tracking-[0.12em] font-semibold text-white/60">{label}</div>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5 flex flex-col">
      <div className="text-[11px] tracking-[0.12em] font-semibold text-[var(--muted)]">{label}</div>
      {children}
    </div>
  );
}
```

## File: components/KpiGrid.tsx
```typescript
import type { ReactNode } from 'react';
export function KpiGrid({ children }: { children: ReactNode }) {
  return <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{children}</section>;
}
```

## File: components/MiniBarList.tsx
```typescript
import type { MessageRow } from '../types';
export function MiniBarList({ rows }: { rows: MessageRow[] }) {
  return (
    <div className="space-y-2">
      {rows.map(r => (
        <div key={r.name} className="flex items-center gap-2">
          <div className="text-[11px] w-[110px] truncate text-[#3A3A3D]">{r.name}</div>
          <div className="flex-1 h-1.5 rounded-full bg-[#F1F0FF] overflow-hidden">
            <div className="h-full bg-[#6D5BFF] rounded-full" style={{ width: r.pct + '%' }} />
          </div>
          <div className="text-[11px] font-medium">{r.msgs}/d</div>
        </div>
      ))}
    </div>
  );
}
```

## File: components/PipelineFunnel.tsx
```typescript
import type { PipelineStage } from '../types';
export function PipelineFunnel({ stages }: { stages: PipelineStage[] }) {
  return (
    <div className="space-y-2">
      {stages.map(s => (
        <div key={s.label} className="flex items-center gap-2">
          <div className="text-[11px] w-[72px] text-white/70">{s.label}</div>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#6D5BFF]" style={{ width: s.w }} />
          </div>
          <div className="text-[11px] font-medium w-4">{s.val}</div>
        </div>
      ))}
    </div>
  );
}
```

## File: components/ProgressBar.tsx
```typescript
type Props = { pct: number; color?: string };
export function ProgressBar({ pct, color = '#6D5BFF' }: Props) {
  return (
    <div className="h-2 rounded-full bg-[#F1F0FF] overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: color }} />
    </div>
  );
}
```

## File: components/ProjectProgressRow.tsx
```typescript
import type { Project } from '../types';
import { ProgressBar } from './ProgressBar';
export function ProjectProgressRow({ o }: { o: Project }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EDE8FF] text-[#6D5BFF] grid place-items-center text-[10px] font-bold">{o.avatar}</div>
          <div>
            <div className="text-[13px] font-medium leading-none">{o.name}</div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">{o.owner} · {o.alert}</div>
          </div>
        </div>
        <div className="text-[12px] font-semibold">{o.pct}%</div>
      </div>
      <div className="mt-2"><ProgressBar pct={o.pct} color={o.color} /></div>
    </div>
  );
}
```

## File: components/RetentionChart.tsx
```typescript
import type { DateRange } from '../types';
import { ChartAnnotation } from './ChartAnnotation';
type Props = { data: number[]; range: DateRange };
export function RetentionChart({ data, range }: Props) {
  const annotationX = range === '7d' ? 260 : 300;
  const annotationY = range === '7d' ? 84 : 72;
  return (
    <div className="mt-6 relative">
      <svg viewBox="0 0 520 180" className="w-full h-[180px] overflow-visible">
        <defs>
          <linearGradient id="lav" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#EDE8FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EDE8FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0,1,2,3].map(i => <line key={i} x1="0" x2="520" y1={20 + i * 40} y2={20 + i * 40} stroke="#F1F0FF" strokeDasharray="4 6" />)}
        <path d={'M0,' + (180 - data[0] * 1.2) + ' ' + data.map((v, i) => 'L ' + (i / (data.length - 1)) * 520 + ',' + (180 - v * 1.2)).join(' ') + ' L 520,160 L 0,160 Z'} fill="url(#lav)" />
        <path d={'M0,' + (180 - data[0] * 1.2) + ' ' + data.map((v, i) => 'L ' + (i / (data.length - 1)) * 520 + ',' + (180 - v * 1.2)).join(' ')} fill="none" stroke="#6D5BFF" strokeWidth="2.5" strokeLinecap="round" />
        <ChartAnnotation x={annotationX} y={annotationY} label="Fix deploy · +12% ↑" />
        {data.map((v, i) => {
          if (i % 3 !== 0 && data.length > 7) return null;
          return <circle key={i} cx={(i / (data.length - 1)) * 520} cy={180 - v * 1.2} r="3.5" fill="#6D5BFF" />;
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1">
        <span>Hace {range}</span><span>Hoy</span>
      </div>
    </div>
  );
}
```

## File: components/RetentionStats.tsx
```typescript
export function RetentionStats() {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <div className="rounded-[12px] bg-[#F8F7FF] p-3">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Retención</div>
        <div className="text-[16px] font-semibold mt-1">82%</div>
        <div className="text-[11px] text-emerald-600">+12% tras fix</div>
      </div>
      <div className="rounded-[12px] bg-[#F8F7FF] p-3">
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Churn mensual</div>
        <div className="text-[16px] font-semibold mt-1">4.2%</div>
        <div className="text-[11px] text-[var(--muted)]">-1.1% vs ant</div>
      </div>
      <div className="rounded-[12px] bg-[#EDE8FF] p-3">
        <div className="text-[10px] text-[#6D5BFF] uppercase tracking-widest">Equipo Growth</div>
        <div className="text-[13px] font-medium mt-1">WhatsApp + Fix</div>
        <div className="text-[11px] text-[#6D5BFF]">Ver thread</div>
      </div>
    </div>
  );
}
```

## File: components/SectionHeader.tsx
```typescript
import type { ReactNode } from 'react';
type Props = { title: ReactNode; actions?: ReactNode };
export function SectionHeader({ title, actions }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

## File: components/Sparkline.tsx
```typescript
export function Sparkline({ points }: { points: string }) {
  return (
    <svg width="100%" height="44" viewBox="0 0 120 44" className="overflow-visible">
      <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" points={points} />
      <polyline fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" opacity="0.15" points={'0,38 ' + points + ' 120,38'} />
    </svg>
  );
}
```

## File: components/StatusBadge.tsx
```typescript
import type { ClientStatus } from '../types';
export function StatusBadge({ status }: { status: ClientStatus }) {
  const cls = status === 'riesgo' ? 'bg-[#FFE4E6] text-red-700' : status === 'oportunidad' ? 'bg-[#D1FAE5] text-emerald-700' : 'bg-[#FEF3C7] text-amber-700';
  return <span className={'text-[10px] px-2 py-1 rounded-full font-medium ' + cls}>{status.toUpperCase()}</span>;
}
```

## File: components/TicketCard.tsx
```typescript
import type { Ticket } from '../types';
import { Avatar } from './Avatar';
import { UrgencyBadge } from './UrgencyBadge';
export function TicketCard({ t, onClick }: { t: Ticket; onClick: () => void }) {
  const initials = t.name.split(' ').map(n => n[0]).join('');
  return (
    <div onClick={onClick} className="group rounded-[14px] border border-[var(--border)] p-3 hover:border-[#6D5BFF]/30 hover:bg-[#FBFAFF] transition cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2.5 min-w-0">
          <Avatar label={initials} />
          <div className="min-w-0">
            <div className="text-[12px] font-semibold truncate">{t.name}</div>
            <div className="text-[11px] text-[var(--muted)] truncate">{t.company} · {t.issue}</div>
          </div>
        </div>
        <div className={'w-2 h-2 rounded-full ' + t.dot + ' mt-1.5'} />
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className={'text-[10px] px-2 py-1 rounded-full font-medium ' + t.badgeColor}>{t.badge}</span>
        <UrgencyBadge label={t.urgency} />
        <span className="text-[10px] text-[var(--muted)] ml-auto">{t.time} abierto</span>
      </div>
    </div>
  );
}
```

## File: components/Toast.tsx
```typescript
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
      <div className="pointer-events-auto rounded-full bg-[#111113] text-white px-4 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.24)] flex items-center gap-2 text-[12px] font-medium">
        <span className="w-5 h-5 rounded-full bg-[#6D5BFF] grid place-items-center text-[12px]">✦</span>
        {message}
      </div>
    </div>
  );
}
```

## File: components/TopClientRow.tsx
```typescript
import type { Client } from '../types';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
type Props = { c: Client; onOpen: () => void; onAction: () => void };
export function TopClientRow({ c, onOpen, onAction }: Props) {
  return (
    <tr className="border-b border-[var(--border)] last:border-0 hover:bg-[#FBFAFF] transition">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpen}>
          <Avatar label={c.avatar} />
          <div className="text-[13px] font-medium">{c.name}</div>
        </div>
      </td>
      <td className="px-3 py-3.5 text-[12px] text-[#3A3A3D]">{c.company}</td>
      <td className="px-3 py-3.5 text-[12px] font-semibold">{c.ltv}</td>
      <td className="px-3 py-3.5"><StatusBadge status={c.status} /></td>
      <td className="px-3 py-3.5 text-[11px] text-[var(--muted)] max-w-[200px] truncate">{c.next}</td>
      <td className="px-5 py-3.5">
        <button onClick={onAction} className="h-7 px-3 rounded-full bg-[#111113] text-white text-[11px] font-medium hover:opacity-90">{c.action}</button>
      </td>
    </tr>
  );
}
```

## File: components/TopClientsPanel.tsx
```typescript
import type { Client } from '../types';
import { TopClientsTable } from './TopClientsTable';
type Props = { clients: Client[]; onOpen: (c: Client) => void; onAction: (c: Client) => void };
export function TopClientsPanel({ clients, onOpen, onAction }: Props) {
  return (
    <section className="rounded-[20px] bg-white border border-[var(--border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] overflow-hidden">
      <div className="p-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Top clientes riesgo / oportunidad</h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-1 rounded-full bg-[#FFE4E6] text-red-700">Roberto León €15.4k silencio 12d riesgo churn</span>
          <span className="hidden md:inline text-[11px] px-2 py-1 rounded-full bg-[#D1FAE5] text-emerald-700">Marta Soler oportunidad €8.4k</span>
        </div>
      </div>
      <TopClientsTable clients={clients} onOpen={onOpen} onAction={onAction} />
    </section>
  );
}
```

## File: components/TopClientsTable.tsx
```typescript
import type { Client } from '../types';
import { TopClientRow } from './TopClientRow';
type Props = { clients: Client[]; onOpen: (c: Client) => void; onAction: (c: Client) => void };
export function TopClientsTable({ clients, onOpen, onAction }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="text-[10px] tracking-[0.12em] text-[var(--muted)] border-y border-[var(--border)] bg-[#FBFAFF]">
            <th className="text-left font-semibold px-5 py-3">CLIENTE</th>
            <th className="text-left font-semibold px-3 py-3">EMPRESA</th>
            <th className="text-left font-semibold px-3 py-3">LTV</th>
            <th className="text-left font-semibold px-3 py-3">ESTADO</th>
            <th className="text-left font-semibold px-3 py-3">PRÓXIMO PASO IA</th>
            <th className="text-left font-semibold px-5 py-3">ACCIÓN</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => <TopClientRow key={c.id} c={c} onOpen={() => onOpen(c)} onAction={() => onAction(c)} />)}
        </tbody>
      </table>
    </div>
  );
}
```

## File: components/UrgencyBadge.tsx
```typescript
export function UrgencyBadge({ label }: { label: string }) {
  return <span className="text-[10px] px-2 py-1 rounded-full bg-[#111113] text-white font-medium">{label}</span>;
}
```

## File: components/WorkspaceHeader.tsx
```typescript
import type { DateRange } from '../types';
import { DateRangePicker } from './DateRangePicker';
type Props = { range: DateRange; onRange: (r: DateRange) => void; onExport: () => void };
export function WorkspaceHeader({ range, onRange, onExport }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-[rgba(248,247,255,0.85)] backdrop-blur-[14px] border-b border-[var(--border)]" style={{ top: 'var(--safe-area-inset-top)' }}>
      <div className="px-4 lg:px-8 h-[68px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="text-[18px] lg:text-[20px] font-semibold tracking-tight leading-none flex items-center gap-2">
              Centro de Mando <span className="hidden lg:inline text-[var(--muted)] font-normal">· Todas las empresas</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white border border-[var(--border)] ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
              </span>
            </h1>
            <div className="text-[11px] text-[var(--muted)] mt-1 lg:hidden">Todas las empresas · Workspace #9</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker range={range} onChange={onRange} />
          <button onClick={onExport} className="h-9 px-4 rounded-full bg-[#111113] text-white text-[13px] font-medium flex items-center gap-2 hover:opacity-90">
            <span>↗</span>
            <span className="hidden sm:inline">Exportar con IA</span>
            <span className="sm:hidden">Exportar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
```

## File: docs/01-ui-map.md
```markdown
# 01 — UI Map · Centro de Mando

## Bloques (top -> bottom)

1. Sidebar — nav WORKSPACE + user footer
2. Header — titulo + Live + DateRange + Export
3. KPI Grid (4 tarjetas)
   - Mensajes / día (+ MiniBarList)
   - Facturación bloqueada (+ BlockedInvoiceList)
   - Tiempo medio respuesta (+ Sparkline)
   - LTV total pipeline (dark, + PipelineFunnel)
4. Retención / Churn — RetentionChart + ChartAnnotation + RetentionStats
5. Tickets críticos — CriticalTicketsPanel + TicketCard
6. Obras activas · health — ActiveProjectsPanel + ProjectProgressRow
7. Agentes performance — AgentsPerformancePanel + AgentPerformanceCard
8. Top clientes — TopClientsPanel + TopClientsTable + TopClientRow
9. Insights IA — AiInsightsPanel + InsightCard
10. Modal cliente — ClientDetailModal
11. Toast — Toast

## Transversales del workspace

StatusBadge · UrgencyBadge · ProgressBar · SectionHeader · AiActionButton · Avatar · DateRangePicker
```

## File: docs/02-roadmap.md
```markdown
# 02 — Roadmap · Centro de Mando

## Fase 1 — Estructura
- [x] Carpetas components/, hooks/, docs/
- [x] README, index.ts, ui-map, roadmap, spec

## Fase 2 — Datos y hooks
- [x] useCentroMandoData
- [x] useDateRange
- [x] useToast
- [x] useClientSelection
- [x] useMobileMenu
- [x] types.ts

## Fase 3 — Componentes base
- [x] Avatar, StatusBadge, UrgencyBadge, ProgressBar, SectionHeader, AiActionButton, DateRangePicker, Toast

## Fase 4 — Bloques
- [x] KpiGrid + KpiCard + sub-bloques
- [x] RetentionChart + ChartAnnotation + RetentionStats
- [x] CriticalTicketsPanel + TicketCard
- [x] ActiveProjectsPanel + ProjectProgressRow
- [x] AgentsPerformancePanel + AgentPerformanceCard
- [x] TopClientsPanel + TopClientsTable + TopClientRow
- [x] AiInsightsPanel + InsightCard
- [x] ClientDetailModal

## Fase 5 — Ensamblaje
- [x] CentroMandoWorkspace.tsx
- [ ] Registro en workspaces/registry.ts
- [ ] Registro en workspaces/index.ts
```

## File: docs/03-spec.md
```markdown
# 03 — Spec · Centro de Mando

## Objetivo
Vista única de control operativo: KPIs, retención, tickets, obras, agentes,
clientes e insights IA. Sustituye la navegación entre vistas dispersas.

## Alcance
- Solo lectura + acciones IA sobre datos ya existentes.
- No introduce nuevos endpoints en esta fase (los datos llegan por hooks locales).

## Convenciones
- Tokens CSS: --bg, --ink, --border, --muted
- Paleta: #6D5BFF (primario), #111113 (ink), #F8F7FF (surface), #EDE8FF (lavanda),
  #10B981 (ok), #FFE4E6 (riesgo), #FEF3C7 (ámbar)
- Nomenclatura: PascalCase para componentes, useXxx para hooks, tipos en types.ts

## Acciones emitidas (CentroMandoAction)
export-ai, resolve-billing, view-funnel, export-pipeline, view-thread,
view-queue, fix-bot, generate-report, edit-agent, view-logs,
client-action, insight-cta, range-change

## Accesibilidad
- aria-label en secciones
- :focus-visible outline 2px
- prefers-reduced-motion respetado
```

## File: hooks/useCentroMandoData.ts
```typescript
import { useMemo } from 'react';
import type { Client, Project, Ticket, Agent, Insight, MessageRow, PipelineStage, DateRange } from '../types';
const clients: Client[] = [
  { id:'1', name:'Roberto León', company:'León Constructora', ltv:'€15.4k', status:'riesgo', next:'Llamada rescate · guión IA', action:'Llamar', avatar:'RL', detail:'Silencio 12 días, 3 presupuestos sin respuesta.', amount:'€15.4k en juego' },
  { id:'2', name:'Marta Soler', company:'Soluciones Limpieza', ltv:'€4.2k', status:'oportunidad', next:'Enviar propuesta 3 planes + demo', action:'Enviar propuesta', avatar:'MS', detail:'60 msgs/día en WhatsApp. Upsell €8.4k.', amount:'€8.4k potencial' },
  { id:'3', name:'Javier Gil', company:'Gil Proyectos', ltv:'€12.4k', status:'estable', next:'Centralizar info · checklist obra', action:'Generar checklist', avatar:'JG', detail:'15 obras simultáneas. Tiempo respuesta 4h.', amount:'€12.4k pipeline' },
  { id:'4', name:'Ana Torres', company:'Clínica Torres', ltv:'€6.8k', status:'riesgo', next:'Fix bot fuera horario + disculpa', action:'Resolver con IA', avatar:'AT', detail:'Bot no responde fuera de horario 23%.', amount:'Ticket #8821' },
  { id:'5', name:'Sofia Navarro', company:'Navarro Retail', ltv:'€9.1k', status:'riesgo', next:'Revisar cobro duplicado Holded', action:'Revisar factura', avatar:'SN', detail:'Cobro duplicado. 2 facturas bloqueadas.', amount:'€1.240 duplicado' },
];
const projects: Project[] = [
  { name:'Tenerife Sur', pct:78, owner:'Marta', avatar:'MS', alert:'Retraso 1 día por secado', color:'#6D5BFF' },
  { name:'Residencial Las Palmas', pct:64, owner:'Javier Gil', avatar:'JG', alert:'Falta lechada · 15 obras', color:'#FF8A5B' },
  { name:'Tienda Centro Comercial', pct:91, owner:'Carlos', avatar:'CR', alert:'En tiempo', color:'#10B981' },
  { name:'Villa Tagoror', pct:42, owner:'Roberto', avatar:'RL', alert:'Esperando material', color:'#6D5BFF' },
  { name:'Oficinas ACME', pct:85, owner:'Sofia', avatar:'SN', alert:'Finalizando', color:'#6D5BFF' },
];
const tickets: Ticket[] = [
  { name:'Ana Torres', company:'Clínica Torres', issue:'Bot no responde', time:'18h', badge:'Soporte', badgeColor:'bg-[#DBEAFE] text-blue-700', urgency:'URGENCIA', dot:'bg-red-500' },
  { name:'Sofia Navarro', company:'Navarro Retail', issue:'Cobro duplicado riesgo churn', time:'5h', badge:'Reclamación', badgeColor:'bg-[#FFE4E6] text-red-700', urgency:'ALTA', dot:'bg-amber-400' },
  { name:'Roberto Díaz', company:'Díaz Instalaciones', issue:'Factura Holded no sync', time:'2d', badge:'Pagos', badgeColor:'bg-[#FEF3C7] text-amber-800', urgency:'MEDIA', dot:'bg-[#6D5BFF]' },
];
const agents: Agent[] = [
  { name:'Agente Obra', conf:94, tasks:3, status:'ok', desc:'Checklists, progreso, alertas' },
  { name:'Agente Presupuestos', conf:89, tasks:5, status:'ok', desc:'3 planes + demo, Holded' },
  { name:'Agente Soporte', conf:76, tasks:8, status:'warn', desc:'Fuera horario fallando · Ana Torres caso' },
];
const insights: Insight[] = [
  { tag:'Oportunidad automatización', body:'Detectamos: 60 msgs/día en Soluciones Limpieza = oportunidad automatización WhatsApp + Holded.', cta:'Crear flujo IA', variant:'light' },
  { tag:'Bloqueo facturación', body:'20 facturas/mes autónomos bloqueadas por sync. Holded API error 422.', cta:'Resolver sync', variant:'primary' },
  { tag:'Bot fuera horario', body:'Bot responde fuera de horario 23% fallando. Agente Soporte necesita re-entrenamiento.', cta:'Re-entrenar', variant:'ghost' },
];
const messageRows: MessageRow[] = [
  { name:'Soluciones Limpieza', msgs:60, pct:78 },
  { name:'ACME Obras', msgs:42, pct:55 },
  { name:'Clínica Torres', msgs:31, pct:40 },
];
const pipelineStages: PipelineStage[] = [
  { label:'Lead', val:6, w:'25%' },
  { label:'Presupuesto', val:8, w:'48%' },
  { label:'Obra', val:5, w:'62%' },
  { label:'Facturado', val:5, w:'92%' },
];
const retentionData: Record<DateRange, number[]> = {
  '7d': [68,70,69,71,74,80,82],
  '30d': [62,64,63,66,68,71,70,72,74,75,78,80,82],
  '90d': [58,60,61,60,62,64,63,66,68,70,69,71,73,75,78,80,82],
};
export function useCentroMandoData(range: DateRange) {
  const data = retentionData[range];
  const sparkPoints = useMemo(() => {
    const w = 120, h = 36;
    const max = Math.max(...data);
    const min = Math.min(...data);
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h - 2;
      return x + ',' + y;
    }).join(' ');
  }, [data]);
  return { clients, projects, tickets, agents, insights, messageRows, pipelineStages, retention: data, sparkPoints };
}
```

## File: hooks/useClientSelection.ts
```typescript
import { useState } from 'react';
import type { Client } from '../types';
export function useClientSelection() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  return { selectedClient, setSelectedClient };
}
```

## File: hooks/useDateRange.ts
```typescript
import { useState } from 'react';
import type { DateRange } from '../types';
const LABELS: Record<DateRange, string> = { '7d': 'Últimos 7 días', '30d': 'Últimos 30 días', '90d': 'Últimos 90 días' };
export function useDateRange(initial: DateRange = '30d') {
  const [range, setRange] = useState<DateRange>(initial);
  const label = LABELS[range];
  return { range, setRange, label };
}
```

## File: hooks/useMobileMenu.ts
```typescript
import { useState } from 'react';
export function useMobileMenu() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const toggle = () => setMobileMenu(v => !v);
  const close = () => setMobileMenu(false);
  return { mobileMenu, toggle, close };
}
```

## File: hooks/useToast.ts
```typescript
import { useState, useCallback, useRef } from 'react';
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(msg);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  return { toast, showToast };
}
```

## File: centro-mando.css
```css
:root {
  --bg: #f6f6f9;
  --ink: #14141f;
  --muted: #8a8a9c;
  --border: #ececf3;
}
```

## File: CentroMandoWorkspace.tsx
```typescript
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
```

## File: index.ts
```typescript
export { default } from './CentroMandoWorkspace';
export * from './types';
```

## File: types.ts
```typescript
export type DateRange = '7d' | '30d' | '90d';

export type ClientStatus = 'riesgo' | 'oportunidad' | 'estable';

export type Client = {
  id: string;
  name: string;
  company: string;
  ltv: string;
  status: ClientStatus;
  next: string;
  action: string;
  avatar: string;
  detail: string;
  amount: string;
};

export type Project = {
  name: string;
  pct: number;
  owner: string;
  avatar: string;
  alert: string;
  color: string;
};

export type Ticket = {
  name: string;
  company: string;
  issue: string;
  time: string;
  badge: string;
  badgeColor: string;
  urgency: string;
  dot: string;
};

export type Agent = {
  name: string;
  conf: number;
  tasks: number;
  status: 'ok' | 'warn';
  desc: string;
};

export type Insight = {
  tag: string;
  body: string;
  cta: string;
  variant: 'light' | 'primary' | 'ghost';
};

export type MessageRow = { name: string; msgs: number; pct: number };
export type PipelineStage = { label: string; val: number; w: string };
```

## File: README.md
```markdown
# 35 — Centro de Mando

Workspace de control operativo unificado. Vista unica de KPIs, retencion,
tickets criticos, obras activas, performance de agentes, top clientes e
insights IA para todas las empresas del tenant.

## Estructura

- CentroMandoWorkspace.tsx — componente raiz. Acepta data, onAction, initialRange.
- data.ts — CENTRO_MANDO_MOCK, RANGE_LABEL, RANGE_START.
- types.ts — CentroMandoData, CentroMandoAction, y tipos de dominio.
- centro-mando.css — estilos scoped bajo .cm-root.
- docs/ — ui-map, roadmap, spec.
- index.ts — export default from './CentroMandoWorkspace'.

## Uso

  import CentroMandoWorkspace from '@/workspaces/35-centro-mando';

  <CentroMandoWorkspace />

## Acciones emitidas (CentroMandoAction)

export-ai, resolve-billing, view-funnel, export-pipeline, view-thread,
view-queue, fix-bot, generate-report, edit-agent, view-logs,
client-action, insight-cta, range-change.

## Estado

- UI: completa con datos mock.
- Backend: pendiente. CentroMandoData se servira desde un hook de datos real.
```
