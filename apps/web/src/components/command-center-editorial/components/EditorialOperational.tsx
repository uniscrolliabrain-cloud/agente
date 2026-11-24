// Estado operativo: seis bloques con el mismo contenido que producción
// (agentes, en marcha, aprobaciones, equipo, incidencias, actividad). El detalle
// es inline en escritorio y hoja inferior en móvil; la acción solo existe si hay
// callback real.
import { useEffect, useState, type ReactNode } from "react";
import { Activity, AlertTriangle, Bot, CheckCircle2, Play, Users } from "lucide-react";
import type { CompanyOverview } from "../../../api/company";
import { EditorialSheet } from "./EditorialSheet";
import { SectionHeader } from "./EditorialStates";

interface Block {
  id: string;
  icon: ReactNode;
  title: string;
  desc: string;
  num: string;
  detail: string;
  action?: { label: string; run: () => void };
}

function useNarrow(breakpoint = 620): boolean {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia(`(max-width: ${breakpoint}px)`).matches,
  );
  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [breakpoint]);
  return narrow;
}

export function EditorialOperational({
  overview,
  onOpenTasks,
  onOpenAgents,
  onOpenTeam,
}: {
  overview: CompanyOverview;
  onOpenTasks?: (() => void) | undefined;
  onOpenAgents?: (() => void) | undefined;
  onOpenTeam?: (() => void) | undefined;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const narrow = useNarrow();
  const activeAgents = overview.agents.filter((agent) => agent.active).length;
  const { waiting, failed, running, total, succeeded } = overview.tasks;

  const blocks: Block[] = [
    {
      id: "agentes",
      icon: <Bot size={16} aria-hidden="true" />,
      title: "Agentes",
      desc: "Quién trabaja y quién está en pausa",
      num: `${activeAgents} activos`,
      detail: `${activeAgents} de ${overview.agents.length} agentes están activos en ${overview.tenant.name}. Los que están en pausa no reciben trabajo nuevo.`,
      ...(onOpenAgents ? { action: { label: "Abrir agentes", run: onOpenAgents } } : {}),
    },
    {
      id: "en-marcha",
      icon: <Play size={16} aria-hidden="true" />,
      title: "En marcha",
      desc: "Trabajo ejecutándose ahora",
      num: `${running} tareas`,
      detail: `${running} tareas en ejecución de ${total} registradas. ${succeeded} cerradas hasta ahora.`,
      ...(onOpenTasks ? { action: { label: "Abrir tareas", run: onOpenTasks } } : {}),
    },
    {
      id: "aprobaciones",
      icon: <CheckCircle2 size={16} aria-hidden="true" />,
      title: "Aprobaciones",
      desc: "Decisiones pendientes del owner",
      num: waiting === 0 ? "Sin pendientes" : `${waiting} pendientes`,
      detail:
        waiting === 0
          ? "No hay tareas esperando tu autorización."
          : `${waiting} tareas necesitan tu decisión. Se revisan desde «Requiere tu atención» o desde Tareas.`,
      ...(onOpenTasks ? { action: { label: "Ver pendientes", run: onOpenTasks } } : {}),
    },
    {
      id: "equipo",
      icon: <Users size={16} aria-hidden="true" />,
      title: "Equipo",
      desc: "Personas con acceso a la empresa",
      num: `${overview.members.length} personas`,
      detail: `${overview.members.length} personas tienen acceso a ${overview.tenant.name}. El alta de personas la gestiona el owner.`,
      ...(onOpenTeam ? { action: { label: "Abrir equipo", run: onOpenTeam } } : {}),
    },
    {
      id: "incidencias",
      icon: <AlertTriangle size={16} aria-hidden="true" />,
      title: "Incidencias",
      desc: "Tareas fallidas o bloqueadas",
      num: failed === 0 ? "Sin incidencias" : `${failed} con error`,
      detail:
        failed === 0
          ? "Ninguna tarea ha fallado."
          : `${failed} tareas han fallado. Ábrelas para ver el error y volver a lanzarlas.`,
      ...(onOpenTasks ? { action: { label: "Revisar fallos", run: onOpenTasks } } : {}),
    },
    {
      id: "actividad",
      icon: <Activity size={16} aria-hidden="true" />,
      title: "Actividad",
      desc: "Tareas registradas en la empresa",
      num: `${total} en total`,
      detail: `${total} tareas registradas: ${running} en marcha, ${waiting} esperando decisión, ${succeeded} cerradas y ${failed} con error.`,
      ...(onOpenTasks ? { action: { label: "Abrir tareas", run: onOpenTasks } } : {}),
    },
  ];

  const current = blocks.find((block) => block.id === selected) ?? null;

  const detail = current ? (
    <>
      <h3 className="cce-block-detail-title">
        {current.title} · {current.num}
      </h3>
      <p>{current.detail}</p>
      {current.action && (
        <button type="button" className="cce-btn cce-btn--primary cce-btn--small" onClick={current.action.run}>
          {current.action.label}
        </button>
      )}
    </>
  ) : null;

  return (
    <section className="cce-section" aria-labelledby="cce-operational-title">
      <SectionHeader
        id="cce-operational-title"
        title="Estado operativo de la empresa"
        sub="Toda la empresa, no solo correo y calendario"
      />

      <div className="cce-blocks">
        {blocks.map((block) => {
          const expanded = selected === block.id;
          return (
            <button
              key={block.id}
              type="button"
              className="cce-block"
              aria-expanded={expanded}
              aria-controls={expanded ? "cce-block-detail" : undefined}
              onClick={() => setSelected(expanded ? null : block.id)}
            >
              <span className="cce-block-icon">{block.icon}</span>
              <span className="cce-block-title">{block.title}</span>
              <span className="cce-block-desc">{block.desc}</span>
              <span className="cce-block-num">{block.num}</span>
            </button>
          );
        })}
      </div>

      {current && !narrow && (
        <div className="cce-block-detail" id="cce-block-detail" role="region" aria-live="polite">
          {detail}
        </div>
      )}

      {current && narrow && (
        <EditorialSheet title={`${current.title} · ${current.num}`} onClose={() => setSelected(null)}>
          <div className="cce-block-detail" id="cce-block-detail" style={{ border: 0, padding: 0, background: "transparent" }}>
            <p>{current.detail}</p>
            {current.action && (
              <button
                type="button"
                className="cce-btn cce-btn--primary"
                onClick={() => {
                  current.action?.run();
                  setSelected(null);
                }}
              >
                {current.action.label}
              </button>
            )}
          </div>
        </EditorialSheet>
      )}
    </section>
  );
}
