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
