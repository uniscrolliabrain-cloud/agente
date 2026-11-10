import type { Project } from '../types';
import { SectionHeader } from './SectionHeader';
import { ProjectProgressRow } from './ProjectProgressRow';

export function ActiveProjectsPanel({ projects, onReport }: { projects: Project[]; onReport: () => void }) {
  return (
    <div className="rounded-[20px] bg-[var(--v2-bg-card)] border border-[var(--v2-border)] shadow-[0_8px_24px_rgba(17,17,19,0.06)] p-5">
      <SectionHeader
        title="Proyectos activos"
        actions={
          <>
            <span className="text-[11px] px-2 py-1 rounded-full bg-[var(--v2-bg-soft)] text-[var(--v2-text-2)]">
              {projects.length} proyectos
            </span>
            <button onClick={onReport} className="text-[11px] h-7 px-3 rounded-full bg-[#1A1A1A] text-white">
              Generar reporte
            </button>
          </>
        }
      />
      <div className="mt-5 space-y-4">
        {projects.map((project) => (
          <ProjectProgressRow key={project.name} o={project} />
        ))}
      </div>
    </div>
  );
}
