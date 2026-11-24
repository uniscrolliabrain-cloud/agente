// COMMAND_CENTER_STATUS_V1 - estado operativo completo de la empresa.
//
// Seis bloques, los mismos del mockup, pero solo con lo que el tenant ya sabe:
// agentes, trabajo, aprobaciones, equipo, incidencias y actividad. Nada de
// ingresos, clientes ni comunicaciones mientras no exista su endpoint.
import { useState, type ReactNode } from "react";
import { Activity, AlertTriangle, Bot, CheckCircle2, Play, Users } from "lucide-react";
import type { CompanyOverview } from "../../api/company";

interface Block {
  id: string;
  icon: ReactNode;
  title: string;
  desc: string;
  num: string;
  detail: string;
  action?: { label: string; run: () => void };
}

interface Props {
  overview: CompanyOverview;
  onOpenTasks?: () => void;
  onOpenAgents?: () => void;
  onOpenTeam?: () => void;
}

export function OperationalStatus({ overview, onOpenTasks, onOpenAgents, onOpenTeam }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const activeAgents = overview.agents.filter((agent) => agent.active).length;
  const { waiting, failed, running, total, succeeded } = overview.tasks;

  const blocks: Block[] = [
    {
      id: "agentes",
      icon: <Bot size={16} />,
      title: "Agentes",
      desc: "Quién trabaja y quién está en pausa",
      num: `${activeAgents} activos`,
      detail: `${activeAgents} de ${overview.agents.length} agentes están activos en ${overview.tenant.name}. Los que están en pausa no reciben trabajo nuevo.`,
      ...(onOpenAgents ? { action: { label: "Abrir agentes", run: onOpenAgents } } : {}),
    },
    {
      id: "en-marcha",
      icon: <Play size={16} />,
      title: "En marcha",
      desc: "Trabajo ejecutándose ahora",
      num: `${running} tareas`,
      detail: `${running} tareas en ejecución de ${total} registradas. ${succeeded} cerradas hasta ahora.`,
      ...(onOpenTasks ? { action: { label: "Abrir tareas", run: onOpenTasks } } : {}),
    },
    {
      id: "aprobaciones",
      icon: <CheckCircle2 size={16} />,
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
      icon: <Users size={16} />,
      title: "Equipo",
      desc: "Personas con acceso a la empresa",
      num: `${overview.members.length} personas`,
      detail: `${overview.members.length} personas tienen acceso a ${overview.tenant.name}. El alta de personas la gestiona el owner.`,
      ...(onOpenTeam ? { action: { label: "Abrir equipo", run: onOpenTeam } } : {}),
    },
    {
      id: "incidencias",
      icon: <AlertTriangle size={16} />,
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
      icon: <Activity size={16} />,
      title: "Actividad",
      desc: "Tareas registradas en la empresa",
      num: `${total} en total`,
      detail: `${total} tareas registradas: ${running} en marcha, ${waiting} esperando decisión, ${succeeded} cerradas y ${failed} con error.`,
      ...(onOpenTasks ? { action: { label: "Abrir tareas", run: onOpenTasks } } : {}),
    },
  ];

  const current = blocks.find((block) => block.id === selected) ?? null;

  return (
    <section className="cc-section">
      <div className="cc-section-head">
        <h2 className="cc-section-title">Estado operativo de la empresa</h2>
        <span className="cc-section-sub">Toda la empresa, no solo correo y calendario</span>
      </div>

      <div className="cc-blocks">
        {blocks.map((block) => (
          <button
            key={block.id}
            type="button"
            className={`cc-block ${selected === block.id ? "selected" : ""}`}
            aria-expanded={selected === block.id}
            onClick={() => setSelected(selected === block.id ? null : block.id)}
          >
            <span className="cc-block-icon">{block.icon}</span>
            <span className="cc-block-title">{block.title}</span>
            <span className="cc-block-desc">{block.desc}</span>
            <span className="cc-block-num">{block.num}</span>
          </button>
        ))}
      </div>

      {current && (
        <div className="cc-block-detail">
          <strong style={{ fontSize: 13 }}>
            {current.title} · {current.num}
          </strong>
          <p style={{ margin: "6px 0 0", fontSize: 12.5, lineHeight: 1.55, color: "var(--v2-text-2)" }}>
            {current.detail}
          </p>
          {current.action && (
            <div style={{ marginTop: 10 }}>
              <button type="button" className="cc-btn primary" onClick={current.action.run}>
                {current.action.label}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
