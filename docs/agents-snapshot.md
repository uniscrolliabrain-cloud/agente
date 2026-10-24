# Snapshot pagina Agentes

Fecha: 2026-10-14 21:14:16
Rama: cleanup-dead-code
Commit: d5b96ee

Codigo completo de la pagina de Agentes antes de rehacerla. Se conserva como referencia.

---

# Parte 1 — Componentes de la pagina de Agentes

## File: apps/web/src/components/agents/AgentActivityLog.tsx

``tsx
// AGENT_ACTIVITY_LOG_V1 - activity log del squad.
import { Activity, AlertTriangle } from "lucide-react";
import { RUNTIME_LOGS } from "./types";
import type { CSSProperties } from "react";

export default function AgentActivityLog() {
  return (
    <section className="agent-activity">
      <div className="agent-section-heading">
        <div>
          <span className="agent-section-heading__eyebrow">ACTIVITY LOG</span>
          <h2>Actividad del squad</h2>
        </div>
        <span className="agent-live">
          <i />
          LIVE
        </span>
      </div>

      <div className="agent-activity__list">
        {RUNTIME_LOGS.map((log, index) => (
          <div
            key={`${log.time}-${index}`}
            className="agent-activity__row"
            style={{ "--agent-delay": `${index * 50}ms` } as CSSProperties}
          >
            <div className={`agent-activity__indicator agent-activity__indicator--${log.type}`}>
              {log.type === "warn" ? <AlertTriangle size={13} /> : <Activity size={13} />}
            </div>
            <span className="agent-activity__time">{log.time}</span>
            <span className="agent-activity__message">{log.message}</span>
            <span className={`agent-activity__state agent-activity__state--${log.type}`}>
              {log.type === "warn" ? "WARNING" : log.type === "error" ? "FAILED" : "SUCCESS"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
``

## File: apps/web/src/components/agents/AgentCard.tsx

``tsx
// AGENT_CARD_V1 - card individual del squad.
import { ChevronRight } from "lucide-react";
import { type AgentUI, statusLabel, statusColor } from "./types";
import type { CSSProperties } from "react";

interface Props {
  agent: AgentUI;
  selected: boolean;
  onClick: () => void;
  index: number;
}

export default function AgentCard({ agent, selected, onClick, index }: Props) {
  const style = {
    "--agent-color": agent.color,
    "--agent-accent": agent.accent,
    "--agent-delay": `${index * 65}ms`,
  } as CSSProperties;

  const avatarBg =
    agent.id === "laia"
      ? "linear-gradient(135deg,#7C5CFC,#E34BAE)"
      : agent.color;

  return (
    <button
      type="button"
      className={`agent-card ${selected ? "agent-card--selected" : ""}`}
      style={style}
      onClick={onClick}
    >
      <div className="agent-card__top">
        <div className="agent-card__avatar" style={{ background: avatarBg }}>
          {agent.icon}
        </div>
        <div className="agent-card__rarity">{agent.rarity}</div>
        <div className="agent-card__level">LVL {agent.level}</div>
      </div>

      <div className="agent-card__body">
        <div className="agent-card__name">{agent.name}</div>
        <div className="agent-card__role">{agent.role}</div>

        <div className="agent-card__hp">
          <span>HP</span>
          <strong>{agent.hp}%</strong>
          <div className="agent-card__hp-track">
            <span style={{ width: `${agent.hp}%`, background: agent.color }} />
          </div>
        </div>
      </div>

      <div className="agent-card__footer">
        <span className={`agent-status agent-status--${agent.status}`}>
          <i style={{ background: statusColor(agent.status) }} />
          {statusLabel(agent.status)}
        </span>
        <ChevronRight size={15} />
      </div>
    </button>
  );
}
``

## File: apps/web/src/components/agents/AgentCommandBar.tsx

``tsx
// AGENT_COMMAND_BAR_V1 - barra de comandos directos /invoke.
import { useState } from "react";
import { Bot, MessageSquare } from "lucide-react";

interface Props {
  onOpenLaia: () => void;
}

export default function AgentCommandBar({ onOpenLaia }: Props) {
  const [value, setValue] = useState("");

  const submit = () => {
    const lower = value.toLowerCase();
    if (lower.includes("laia")) onOpenLaia();
    setValue("");
  };

  return (
    <section className="agent-command">
      <div className="agent-command__header">
        <span>
          <MessageSquare size={14} />
          COMANDOS DIRECTOS
        </span>
        <code>/invoke</code>
      </div>

      <div className="agent-command__system">
        <span className="agent-command__system-icon">
          <Bot size={14} />
        </span>
        <div>
          <strong>sistema</strong>
          <p>Squad operativo. Escribe "llama a Laia" para traerla al frente.</p>
        </div>
      </div>

      <div className="agent-command__input">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder='llama al agente de ventas para...'
        />
        <button type="button" onClick={submit}>
          â†’
        </button>
      </div>
    </section>
  );
}
``

## File: apps/web/src/components/agents/AgentHero.tsx

``tsx
// AGENT_HERO_V1 - hero grande del agente seleccionado.
import { Activity, MessageSquare, Settings } from "lucide-react";
import { type AgentUI } from "./types";
import type { CSSProperties } from "react";

interface Props {
  agent: AgentUI;
  onOpen: () => void;
}

export default function AgentHero({ agent, onOpen }: Props) {
  const style = {
    "--hero-color": agent.color,
    "--hero-accent": agent.accent,
  } as CSSProperties;

  return (
    <section id="agent-hero" className="agents-hero" style={style}>
      <div className="agents-hero__glow" />

      <div className="agents-hero__header">
        <div className="agents-hero__eyebrow">
          <span className="agents-hero__live-dot" />
          AGENTE ACTIVO
        </div>
        <div className="agents-hero__level">LVL {agent.level}</div>
      </div>

      <div className="agents-hero__main">
        <div className="agents-hero__portrait">
          <span>{agent.icon}</span>
          <div className="agents-hero__portrait-status" />
        </div>

        <div className="agents-hero__identity">
          <div className="agents-hero__name-row">
            <h1>{agent.name}</h1>
            <span className="agents-hero__badge">{agent.rarity}</span>
          </div>
          <div className="agents-hero__role">{agent.role}</div>
          <p>{agent.description}</p>
          <div className="agents-hero__chips">
            {agent.capabilities.slice(0, 4).map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="agents-hero__stats">
        <div>
          <span>TAREAS</span>
          <strong>{agent.id === "laia" ? "1,248" : "892"}</strong>
        </div>
        <div>
          <span>PRECISIÃ“N</span>
          <strong>{agent.id === "laia" ? "99.8%" : "96.4%"}</strong>
        </div>
        <div>
          <span>TIEMPO MEDIO</span>
          <strong>{agent.id === "laia" ? "8s" : "12s"}</strong>
        </div>
        <div>
          <span>UPTIME</span>
          <strong>99.9%</strong>
        </div>
      </div>

      <div className="agents-hero__actions">
        <button type="button" className="agents-button agents-button--primary" onClick={onOpen}>
          <MessageSquare size={16} />
          Hablar con {agent.name}
        </button>
        <button type="button" className="agents-button">
          <Activity size={16} />
          Ver logs
        </button>
        <button type="button" className="agents-button">
          <Settings size={16} />
          Configurar
        </button>
      </div>
    </section>
  );
}
``

## File: apps/web/src/components/agents/AgentProfile.tsx

``tsx
// AGENT_PROFILE_V1 - panel de perfil debajo del hero.
import { Bot, Cpu, Sparkles, Users } from "lucide-react";
import { AGENTS, type AgentUI } from "./types";

interface Props {
  agent: AgentUI;
}

export default function AgentProfile({ agent }: Props) {
  const reportsToName = agent.reportsTo
    ? AGENTS.find((a) => a.id === agent.reportsTo)?.name
    : "Sistema principal";

  return (
    <section className="agent-profile">
      <div className="agent-profile__heading">
        <div>
          <span className="agent-profile__eyebrow">LO QUE SABE DE TU NEGOCIO</span>
          <h2>Conoce a {agent.name}</h2>
        </div>
        <Sparkles size={20} />
      </div>

      <div className="agent-profile__grid">
        <article>
          <div className="agent-profile__icon">
            <Bot size={18} />
          </div>
          <span>PERSONALIDAD</span>
          <p>{agent.personality.join(" Â· ")}</p>
        </article>

        <article>
          <div className="agent-profile__icon">
            <Cpu size={18} />
          </div>
          <span>CAPACIDADES</span>
          <p>{agent.capabilities.join(" Â· ")}</p>
        </article>

        <article>
          <div className="agent-profile__icon">
            <Users size={18} />
          </div>
          <span>REPORTA A</span>
          <p>{reportsToName ?? "Sistema principal"}</p>
        </article>
      </div>
    </section>
  );
}
``

## File: apps/web/src/components/agents/agents.css

``css
/* AGENTS_CSS_V1 - estilos del frente Agentes (workspace + ventana flotante).
   Prefijos: agents-, agent-card-, agent-activity-, agent-command-,
             laia-window-, laia-panel-, laia-runtime-, laia-squad-,
             laia-memory-, agent-dock-.
   No choca con --v2-* ni --v3-* existentes.
*/

/* =========================================================
   PAGE
========================================================= */

.agents-page {
  min-height: 100%;
  background:
    radial-gradient(circle at 70% 0%, rgba(124, 92, 252, 0.055), transparent 35%),
    #fafafa;
  color: #171717;
}

.agents-page__inner {
  width: min(100% - 48px, 1120px);
  margin: 0 auto;
  padding: 42px 0 90px;
}

.agents-page__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 30px;
  margin-bottom: 28px;
}

.agents-page__eyebrow,
.agent-profile__eyebrow,
.agent-section-heading__eyebrow {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
  color: #8a8a8a;
  text-transform: uppercase;
}

.agents-page h1 {
  margin: 5px 0 4px;
  font-size: 36px;
  line-height: 1;
  letter-spacing: -0.04em;
}

.agents-page__top p {
  margin: 0;
  color: #8a8a8a;
  font-size: 14px;
}

.agents-page__actions {
  display: flex;
  gap: 8px;
}

/* =========================================================
   BUTTONS
========================================================= */

.agents-button {
  height: 42px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e7e7e3;
  border-radius: 11px;
  background: white;
  color: #171717;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
}

.agents-button:hover {
  transform: translateY(-1px);
  border-color: #d5d5d0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
}

.agents-button--dark {
  background: #111;
  border-color: #111;
  color: white;
}

.agents-button--primary {
  background: #7c5cfc;
  border-color: #7c5cfc;
  color: white;
  box-shadow: 0 10px 28px rgba(124, 92, 252, 0.22);
}

/* =========================================================
   HERO
========================================================= */

.agents-hero {
  position: relative;
  overflow: hidden;
  padding: 27px;
  border: 1px solid #ddd9ff;
  border-radius: 24px;
  background:
    radial-gradient(circle at 80% 15%, var(--hero-accent, #EDE8FF), transparent 40%),
    white;
  box-shadow: 0 24px 70px rgba(124, 92, 252, 0.09);
  animation: agentsHeroIn 500ms ease both;
}

.agents-hero__glow {
  position: absolute;
  width: 280px;
  height: 280px;
  right: -120px;
  top: -120px;
  border-radius: 50%;
  background: var(--hero-color, #7C5CFC);
  filter: blur(100px);
  opacity: 0.12;
  pointer-events: none;
}

.agents-hero__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agents-hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.agents-hero__live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.09);
}

.agents-hero__level {
  padding: 5px 9px;
  border-radius: 7px;
  background: #f1efff;
  color: #7355e8;
  font-size: 10px;
  font-weight: 800;
}

.agents-hero__main {
  display: flex;
  gap: 25px;
  align-items: center;
  padding: 34px 0 27px;
}

.agents-hero__portrait {
  position: relative;
  width: 116px;
  height: 116px;
  flex: 0 0 116px;
  display: grid;
  place-items: center;
  border-radius: 28px;
  background: linear-gradient(135deg, #7c5cfc, #df4fb1);
  color: white;
  font-size: 43px;
  font-weight: 700;
  box-shadow: 0 18px 40px rgba(124, 92, 252, 0.25);
}

.agents-hero__portrait-status {
  position: absolute;
  width: 13px;
  height: 13px;
  right: 7px;
  bottom: 7px;
  border: 3px solid white;
  border-radius: 50%;
  background: #10b981;
}

.agents-hero__identity {
  min-width: 0;
}

.agents-hero__name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.agents-hero__name-row h1 {
  margin: 0;
  font-size: 34px;
  letter-spacing: -0.045em;
}

.agents-hero__badge {
  padding: 5px 8px;
  border-radius: 6px;
  background: #eee9ff;
  color: #7455ed;
  font-size: 9px;
  font-weight: 900;
}

.agents-hero__role {
  margin-top: 3px;
  color: #6d6d6d;
  font-size: 14px;
  font-weight: 600;
}

.agents-hero__identity p {
  max-width: 670px;
  margin: 12px 0 14px;
  color: #555;
  font-size: 13px;
  line-height: 1.6;
}

.agents-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.agents-hero__chips span {
  padding: 5px 8px;
  border: 1px solid #ecebea;
  border-radius: 7px;
  background: #fafafa;
  color: #777;
  font-size: 10px;
}

.agents-hero__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.agents-hero__stats > div {
  padding: 14px;
  border: 1px solid #ecebea;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.75);
}

.agents-hero__stats span {
  display: block;
  margin-bottom: 5px;
  color: #a0a0a0;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.agents-hero__stats strong {
  font-size: 15px;
}

.agents-hero__actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

/* =========================================================
   PROFILE
========================================================= */

.agent-profile {
  margin-top: 14px;
  padding: 25px;
  border: 1px solid #e7e7e3;
  border-radius: 20px;
  background: white;
  animation: agentsCascade 500ms 120ms both;
}

.agent-profile__heading {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}

.agent-profile__heading h2 {
  margin: 5px 0 0;
  font-size: 20px;
  letter-spacing: -0.025em;
}

.agent-profile__heading svg {
  color: #7c5cfc;
}

.agent-profile__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
}

.agent-profile__grid article {
  padding: 16px;
  border: 1px solid #ecebe8;
  border-radius: 14px;
  background: #fcfcfb;
}

.agent-profile__icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
  border-radius: 8px;
  background: #f0edff;
  color: #7455ed;
}

.agent-profile__grid article > span {
  font-size: 9px;
  font-weight: 800;
  color: #a0a0a0;
  letter-spacing: 0.08em;
}

.agent-profile__grid p {
  margin: 7px 0 0;
  color: #444;
  font-size: 12px;
  line-height: 1.55;
}

/* =========================================================
   SQUAD
========================================================= */

.agent-squad,
.agent-activity {
  margin-top: 40px;
}

.agent-section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 15px;
}

.agent-section-heading h2 {
  margin: 5px 0 0;
  font-size: 21px;
  letter-spacing: -0.03em;
}

.agent-section-count {
  padding: 5px 9px;
  border: 1px solid #e8e8e5;
  border-radius: 8px;
  color: #777;
  font-size: 9px;
  font-weight: 800;
}

.agent-filters {
  display: flex;
  gap: 5px;
  margin-bottom: 13px;
}

.agent-filters button {
  padding: 7px 12px;
  border: 1px solid #e9e9e6;
  border-radius: 999px;
  background: white;
  color: #777;
  font-size: 10px;
  cursor: pointer;
}

.agent-filters button.is-active {
  background: #111;
  border-color: #111;
  color: white;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

/* =========================================================
   CARD
========================================================= */

.agent-card {
  position: relative;
  min-height: 176px;
  padding: 17px;
  border: 1px solid #e6e6e2;
  border-radius: 17px;
  background: white;
  text-align: left;
  cursor: pointer;
  animation: agentCardIn 550ms var(--agent-delay, 0ms) both;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.agent-card:hover {
  transform: translateY(-3px);
  border-color: #c9c1f5;
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.07);
}

.agent-card--selected {
  border: 2px solid var(--agent-color, #7C5CFC);
  box-shadow: 0 12px 35px rgba(124, 92, 252, 0.14);
}

.agent-card__top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.agent-card__avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  color: white;
  font-size: 16px;
  font-weight: 800;
}

.agent-card__rarity {
  padding: 4px 6px;
  border-radius: 5px;
  background: #f2f0eb;
  color: #8d8b86;
  font-size: 8px;
  font-weight: 900;
}

.agent-card__level {
  margin-left: auto;
  color: #999;
  font-size: 9px;
  font-weight: 700;
}

.agent-card__name {
  margin-top: 17px;
  color: #171717;
  font-size: 14px;
  font-weight: 800;
}

.agent-card__role {
  margin-top: 2px;
  color: #888;
  font-size: 10px;
}

.agent-card__hp {
  position: relative;
  margin-top: 17px;
}

.agent-card__hp > span {
  color: #999;
  font-size: 8px;
  font-weight: 800;
}

.agent-card__hp strong {
  float: right;
  font-size: 9px;
}

.agent-card__hp-track {
  clear: both;
  height: 4px;
  margin-top: 6px;
  overflow: hidden;
  border-radius: 99px;
  background: #eee;
}

.agent-card__hp-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.agent-card__footer {
  position: absolute;
  left: 17px;
  right: 17px;
  bottom: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
}

.agent-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.agent-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.agent-card--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #aaa;
  border-style: dashed;
  background: transparent;
}

.agent-card--empty strong {
  margin-top: 10px;
  color: #777;
  font-size: 12px;
}

.agent-card--empty span {
  margin-top: 3px;
  color: #aaa;
  font-size: 10px;
}

/* =========================================================
   ACTIVITY
========================================================= */

.agent-activity__list {
  overflow: hidden;
  border: 1px solid #e6e6e2;
  border-radius: 16px;
  background: white;
}

.agent-activity__row {
  min-height: 52px;
  display: grid;
  grid-template-columns: 28px 55px 1fr 70px;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #efefed;
  animation: agentCardIn 450ms var(--agent-delay, 0ms) both;
}

.agent-activity__row:last-child {
  border-bottom: 0;
}

.agent-activity__indicator {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.agent-activity__indicator--ok {
  background: #e8faf3;
  color: #10a77b;
}

.agent-activity__indicator--warn {
  background: #fff7dd;
  color: #d99c00;
}

.agent-activity__time {
  color: #aaa;
  font-size: 10px;
}

.agent-activity__message {
  color: #555;
  font-size: 11px;
}

.agent-activity__state {
  justify-self: end;
  padding: 4px 6px;
  border-radius: 5px;
  font-size: 7px;
  font-weight: 900;
}

.agent-activity__state--ok {
  background: #e9faf3;
  color: #0c9b72;
}

.agent-activity__state--warn {
  background: #fff5d9;
  color: #b98000;
}

.agent-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #e9faf3;
  color: #0c9b72;
  font-size: 9px;
  font-weight: 800;
}

.agent-live i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  animation: agentPulse 1.6s ease-in-out infinite;
}

/* =========================================================
   COMMAND BAR
========================================================= */

.agent-command {
  margin-top: 24px;
  overflow: hidden;
  border-radius: 16px;
  background: #111;
  color: white;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);
}

.agent-command__header {
  display: flex;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid #2b2b2b;
  font-size: 10px;
  font-weight: 800;
}

.agent-command__header span {
  display: flex;
  gap: 7px;
  align-items: center;
}

.agent-command__header svg {
  color: #8a6cff;
}

.agent-command__header code {
  color: #777;
}

.agent-command__system {
  display: flex;
  gap: 9px;
  margin: 13px;
  padding: 10px;
  border: 1px solid #2b2b2b;
  border-radius: 10px;
  background: #171717;
}

.agent-command__system-icon {
  width: 23px;
  height: 23px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #272727;
  color: #aaa;
}

.agent-command__system strong {
  display: block;
  color: #777;
  font-size: 8px;
  text-transform: uppercase;
}

.agent-command__system p {
  margin: 2px 0 0;
  color: #aaa;
  font-family: monospace;
  font-size: 9px;
}

.agent-command__input {
  display: flex;
  gap: 7px;
  padding: 0 13px 13px;
}

.agent-command__input input {
  flex: 1;
  height: 39px;
  padding: 0 12px;
  border: 1px solid #2b2b2b;
  border-radius: 9px;
  outline: none;
  background: #171717;
  color: white;
}

.agent-command__input button {
  width: 42px;
  border: 0;
  border-radius: 9px;
  background: white;
  color: #111;
  cursor: pointer;
}

/* =========================================================
   ANIMATIONS
========================================================= */

@keyframes agentsHeroIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes agentsCascade {
  from { opacity: 0; transform: translateY(9px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes agentCardIn {
  from { opacity: 0; transform: translateY(12px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes agentPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {
  .agents-hero,
  .agent-profile,
  .agent-card,
  .agent-activity__row,
  .agent-live i {
    animation: none !important;
    transition: none !important;
  }
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {
  .agents-page__top {
    align-items: flex-start;
    flex-direction: column;
  }
  .agent-grid { grid-template-columns: repeat(2, 1fr); }
  .agent-profile__grid { grid-template-columns: 1fr; }
}

@media (max-width: 650px) {
  .agents-page__inner { width: min(100% - 24px, 1120px); padding-top: 24px; }
  .agents-hero__main { flex-direction: column; align-items: flex-start; }
  .agents-hero__stats { grid-template-columns: repeat(2, 1fr); }
  .agent-grid { grid-template-columns: 1fr; }
}
``

## File: apps/web/src/components/agents/AgentsPage.tsx

``tsx
// AGENTS_PAGE_V1 - entry point del frente Agentes.
// Compone: hero + perfil + squad + activity log + command bar.
// Y abre la ventana flotante cuando se selecciona Laia.
//
// Desde el chat del homepage se puede invocar "llama a Laia" para traer la
// ventana. Eso se conectarÃƒÆ’Ã‚Â¡ al useChat en una fase posterior. Por ahora el
// input del command bar ya lo detecta.

// AGENTS_PAGE_FETCH_V1 - lee personas reales del backend.
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../api/client";
import { toAgentUI, type AgentUI } from "./types";
import { Plus, Search } from "lucide-react";
import { AGENTS, type AgentId } from "./types";
import AgentHero from "./AgentHero";
import AgentProfile from "./AgentProfile";
import AgentSquad from "./AgentSquad";
import AgentActivityLog from "./AgentActivityLog";
import AgentCommandBar from "./AgentCommandBar";
import LaiaFloatingWindow from "./floating/LaiaFloatingWindow";
import AgentDockLauncher from "./floating/AgentDockLauncher";

export default function AgentsPage() {
  const [selected, setSelected] = useState<AgentId>("laia");
  // AGENTS_PAGE_FETCH_V1 - estado de personas reales.
  const [remoteAgents, setRemoteAgents] = useState<AgentUI[] | null>(null);
  const [_fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch<{ personas: Array<{ personaId: string; displayName: string; role: string; archetype: string; stats: unknown; avatar: unknown; reportsTo: string | null; peers: string[] }> }>("/api/agent-personas");
        if (cancelled) return;
        const mapped = res.personas.map((p) => toAgentUI(
          {
            id: p.personaId,
            displayName: p.displayName,
            role: p.role,
            personality: { traits: [], tone: p.archetype, quirks: [] },
            capabilities: { domains: [], scope: "" },
            ...(p.reportsTo ? { reportsTo: p.reportsTo } : {}),
          },
          p.stats as never,
          "#7C5CFC",
          "#EDE8FF",
        ));
        setRemoteAgents(mapped);
      } catch (err) {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : "Error cargando agentes");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const realAgents = remoteAgents ?? AGENTS;

  const [windowOpen, setWindowOpen] = useState(true);
  const [windowMinimized, setWindowMinimized] = useState(false);
  const [windowMaximized, setWindowMaximized] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ x: 22, y: 180 });
  const [zIndex, setZIndex] = useState(100);

  // AGENTS_PAGE_USE_REAL_V1 - usa realAgents en vez de AGENTS mock.
  const selectedAgent = useMemo(
    () => realAgents.find((a) => a.id === selected) ?? realAgents[1] ?? AGENTS[1],
    [selected, realAgents],
  );

  const laia = useMemo(
    () => realAgents.find((a) => a.id === "laia") ?? AGENTS.find((a) => a.id === "laia")!,
    [realAgents],
  );

  const openLaia = useCallback(() => {
    setSelected("laia");
    setWindowOpen(true);
    setWindowMinimized(false);
    setWindowMaximized(false);
    setWindowPosition({ x: 24, y: 120 });
    setZIndex((v) => v + 1);
  }, []);

  const openAgent = useCallback(
    (id: AgentId) => {
      setSelected(id);
      if (id === "laia") {
        setWindowOpen(true);
        setWindowMinimized(false);
        setWindowMaximized(false);
        setWindowPosition({ x: 24, y: 120 });
        setZIndex((v) => v + 1);
      }
    },
    [],
  );

  const closeWindow = () => {
    setWindowOpen(false);
    setWindowMinimized(false);
  };

  const minimizeWindow = () => {
    setWindowMinimized(true);
  };

  const maximizeWindow = () => {
    setWindowMaximized((v) => !v);
  };

  const showDock = !windowOpen || windowMinimized;

  return (
    <div className="agents-page">
      <div className="agents-page__inner">
        <div className="agents-page__top">
          <div>
            <span className="agents-page__eyebrow">WORKSPACE Ãƒâ€šÃ‚Â· AGENTES</span>
            <h1>Agentes</h1>
            <p>
              Tu equipo de IA operativo. Activo 24/7 ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â orquesta tareas, memoria y ejecuciÃƒÆ’Ã‚Â³n.
            </p>
          </div>

          <div className="agents-page__actions">
            <button type="button" className="agents-button">
              <Search size={16} />
              Buscar
            </button>
            <button type="button" className="agents-button agents-button--dark">
              <Plus size={16} />
              Crear nuevo agente
            </button>
          </div>
        </div>

        <AgentHero
          agent={selectedAgent}
          onOpen={() => {
            if (selected === "laia") openLaia();
          }}
        />

        <AgentProfile agent={selectedAgent} />

        <AgentSquad selected={selected} onSelect={openAgent} />

        <AgentActivityLog />

        <AgentCommandBar onOpenLaia={openLaia} />
      </div>

      {windowOpen && !windowMinimized && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex,
          }}
        >
          <div style={{ pointerEvents: "auto" }}>
            <LaiaFloatingWindow
              agent={laia}
              minimized={windowMinimized}
              maximized={windowMaximized}
              position={windowPosition}
              onMinimize={minimizeWindow}
              onMaximize={maximizeWindow}
              onClose={closeWindow}
              onMove={setWindowPosition}
              onFocus={() => setZIndex((v) => v + 1)}
            />
          </div>
        </div>
      )}

      {showDock && (
        <AgentDockLauncher
          agentName={laia.name}
          role={laia.role}
          icon={laia.icon}
          onOpen={openLaia}
        />
      )}
    </div>
  );
}
``

## File: apps/web/src/components/agents/AgentSquad.tsx

``tsx
// AGENT_SQUAD_V1 - grid del squad activo con filtros.
// AGENT_SQUAD_FILTER_V1 - filtro por arquetipo.
import { useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import AgentCard from "./AgentCard";
import { AGENTS, type AgentId, type AgentArchetype } from "./types";

interface Props {
  selected: AgentId;
  onSelect: (id: AgentId) => void;
}

const FILTERS: Array<{ id: "all" | AgentArchetype; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "hunter", label: "Cazador" },
  { id: "guardian", label: "GuardiÃƒÂ¡n" },
  { id: "strategist", label: "Estratega" },
  { id: "architect", label: "Arquitecto" },
];

export default function AgentSquad({ selected, onSelect }: Props) {
  const [filter, setFilter] = useState<"all" | AgentArchetype>("all");
  const withoutPrincipal = useMemo(() => {
    const base = AGENTS.filter((a) => a.id !== "openmuse");
    return filter === "all" ? base : base.filter((a) => a.archetype === filter);
  }, [filter]);

  return (
    <section className="agent-squad">
      <div className="agent-section-heading">
        <div>
          <span className="agent-section-heading__eyebrow">SQUAD ACTIVO</span>
          <h2>Equipo operativo</h2>
        </div>
        <span className="agent-section-count">{withoutPrincipal.length}/6 AGENTES</span>
      </div>

      <div className="agent-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={f.id === filter ? "is-active" : ""}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="agent-grid">
        {withoutPrincipal.map((agent, index) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            index={index}
            selected={selected === agent.id}
            onClick={() => onSelect(agent.id)}
          />
        ))}

        <button className="agent-card agent-card--empty" type="button">
          <Plus size={22} />
          <strong>Invocar agente</strong>
          <span>Slot libre</span>
        </button>

        <button className="agent-card agent-card--empty" type="button">
          <Sparkles size={22} />
          <strong>Crear agente</strong>
          <span>Nuevo rol</span>
        </button>
      </div>
    </section>
  );
}
``

## File: apps/web/src/components/agents/floating/AgentDockLauncher.tsx

``tsx
// AGENT_DOCK_LAUNCHER_V1 - launcher inferior izquierdo cuando la ventana
// estÃ¡ minimizada o cerrada. Click -> reaparece al frente.

interface Props {
  agentName: string;
  role: string;
  icon: string;
  onOpen: () => void;
}

export default function AgentDockLauncher({ agentName, role, icon, onOpen }: Props) {
  return (
    <button type="button" className="agent-dock" onClick={onOpen}>
      <div className="agent-dock__avatar">{icon}</div>
      <div>
        <strong>{agentName.toUpperCase()}.exe</strong>
        <span>{role} Â· activa</span>
      </div>
      <span className="agent-dock__status">â—</span>
    </button>
  );
}
``

## File: apps/web/src/components/agents/floating/LaiaFloatingWindow.tsx

``tsx
// LAIA_FLOATING_WINDOW_V1 - ventana flotante desacoplada por agente.
// NO es un modal. NO overlay. Se superpone al workspace.
// Draggable por el chrome con PointerEvents.
// Traffic lights: cerrar (rojo), minimizar (amarillo), maximizar (verde).
// Minimizar o cerrar -> dock inferior izquierdo (gestionado por el padre).

import { useRef, useState } from "react";
import { useReducedMotion } from "../../../hooks/useReducedMotion";
import { RUNTIME_LOGS, AGENTS, type AgentUI, statusColor } from "../types";

type PopupTab = "perfil" | "runtime" | "squad" | "memoria";

interface Props {
  agent: AgentUI;
  minimized: boolean;
  maximized: boolean;
  position: { x: number; y: number };
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onFocus: () => void;
}

export default function LaiaFloatingWindow({
  agent,
  minimized,
  maximized,
  position,
  onMinimize,
  onMaximize,
  onClose,
  onMove,
  onFocus,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [tab, setTab] = useState<PopupTab>("perfil");
  const [input, setInput] = useState("");

  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (maximized) return;
    dragging.current = true;
    dragStart.current = { x: event.clientX, y: event.clientY };
    startPosition.current = { ...position };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    onFocus();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragging.current) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    onMove({ x: startPosition.current.x + dx, y: startPosition.current.y + dy });
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  const className = [
    "laia-window",
    maximized ? "laia-window--maximized" : "",
    minimized ? "laia-window--hidden" : "",
    reducedMotion ? "laia-window--reduced-motion" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style = maximized ? undefined : { left: position.x, top: position.y };

  const otherAgents = AGENTS.filter((a) => a.id !== "laia" && a.id !== "openmuse");

  return (
    <div className={className} style={style} onPointerDown={onFocus} role="dialog" aria-label={`Ventana de ${agent.name}`}>
      <header
        className="laia-window__chrome"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="laia-window__traffic">
          <button
            type="button"
            className="laia-window__traffic-dot laia-window__traffic-dot--red"
            onClick={onClose}
            aria-label="Cerrar"
          />
          <button
            type="button"
            className="laia-window__traffic-dot laia-window__traffic-dot--yellow"
            onClick={onMinimize}
            aria-label="Minimizar"
          />
          <button
            type="button"
            className="laia-window__traffic-dot laia-window__traffic-dot--green"
            onClick={onMaximize}
            aria-label="Maximizar"
          />
        </div>

        <div className="laia-window__title">
          <span>{agent.name.toUpperCase()}.exe</span>
          <small>Ã¢â‚¬â€ {agent.role}</small>
        </div>

        <div className="laia-window__lvl">LVL {agent.level}</div>
      </header>

      <div className="laia-window__identity">
        <div
          className="laia-window__avatar"
          style={{ background: "linear-gradient(135deg,#7C5CFC,#E34BAE)" }}
        >
          {agent.icon}
        </div>
        <div>
          <div className="laia-window__name">
            {agent.name.toUpperCase()}
            <span>{agent.role.toUpperCase()}</span>
          </div>
          <p>{agent.description}</p>
        </div>
      </div>

      <div className="laia-window__stats">
        <div>
          <span>RUNTIME</span>
          <strong>99.98%</strong>
          <div className="laia-window__bar">
            <i style={{ width: "99.98%" }} />
          </div>
        </div>
        <div>
          <span>HP</span>
          <strong>{agent.hp}%</strong>
          <div className="laia-window__bar laia-window__bar--green">
            <i style={{ width: `${agent.hp}%` }} />
          </div>
        </div>
        <div>
          <span>QUEUE</span>
          <strong>12 tareas</strong>
          <small>0 bloqueos</small>
        </div>
      </div>

      <nav className="laia-window__tabs">
        {(
          [
            ["perfil", "Perfil"],
            ["runtime", "Runtime"],
            ["squad", "Squad"],
            ["memoria", "Memoria"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? "is-active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="laia-window__content">
        {tab === "perfil" && (
          <div className="laia-panel">
            <span className="laia-panel__label">PERSONALIDAD</span>
            <p>
              Cercana, resolutiva, guardiana. Habla claro, sin humo. Si algo falla, lo arreglo antes
              de que lo notes.
            </p>
            <div className="laia-panel__chips">
              {agent.capabilities.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <div className="laia-panel__divider" />
            <span className="laia-panel__label">OBJETIVO</span>
            <p>Que todo funcione y tÃƒÂº no tengas que vigilarlo.</p>
          </div>
        )}

        {tab === "runtime" && (
          <div className="laia-runtime">
            {RUNTIME_LOGS.map((log, i) => (
              <div className="laia-runtime__row" key={i}>
                <span>{log.time}</span>
                <i className={`laia-runtime__dot laia-runtime__dot--${log.type}`} />
                <p>{log.message}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "squad" && (
          <div className="laia-squad">
            {otherAgents.map((a) => (
              <div className="laia-squad__member" key={a.id}>
                <div className="laia-squad__avatar" style={{ background: a.color }}>
                  {a.icon}
                </div>
                <div>
                  <strong>{a.name}</strong>
                  <span>{a.role}</span>
                </div>
                <i style={{ background: statusColor(a.status) }} />
              </div>
            ))}
          </div>
        )}

        {tab === "memoria" && (
          <div className="laia-panel">
            <span className="laia-panel__label">MEMORIA OPERATIVA</span>
            <div className="laia-memory">
              <div>
                <strong>12</strong>
                <span>embeddings activos</span>
              </div>
              <div>
                <strong>47</strong>
                <span>memorias de negocio</span>
              </div>
              <div>
                <strong>99.4%</strong>
                <span>sincronizaciÃƒÂ³n</span>
              </div>
            </div>
            <p>
              Laia utiliza memoria de identidad, dominio, preferencias e historial.
            </p>
          </div>
        )}
      </main>

      <footer className="laia-window__chat">
        <div className="laia-window__chat-label">
          <span />
          {agent.name} estÃƒÂ¡ activa
        </div>
        <div className="laia-window__chat-row">
          {/* LAIA_WINDOW_CHAT_V1 - envia al chat global con personaId. */}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim()) {
                // Notifica al padre para enviar al chat global.
                window.dispatchEvent(new CustomEvent("openmuse:chat", {
                  detail: { message: input.trim(), personaId: agent.id },
                }));
                setInput("");
              }
            }}
            placeholder={`Habla con ${agent.name}...`}
          />
          <button type="button" onClick={() => {
            if (input.trim()) {
              window.dispatchEvent(new CustomEvent("openmuse:chat", {
                detail: { message: input.trim(), personaId: agent.id },
              }));
              setInput("");
            }
          }}>
            Ã¢â€ â€™
          </button>
        </div>
      </footer>
    </div>
  );
}
``

## File: apps/web/src/components/agents/types.ts

``tsx
// AGENTS_TYPES_V1 - tipos del frente Agentes + mock data.
//
// Este archivo NO toca el backend. Solo define:
//   - AgentUI: la forma que consume el frontend.
//   - Mock data de los 7 agentes (OpenMuse + 6 del squad).
//   - Helpers de color/label por status y arquetipo.
//   - Adaptador toAgentUI(persona, stats) listo para conectar al backend
//     en una fase posterior.

export type AgentId = "openmuse" | "laia" | "lorenzo" | "juan" | "manu" | "marta" | "ana";

export type AgentArchetype =
  | "orchestrator"
  | "hunter"
  | "guardian"
  | "strategist"
  | "architect"
  | "assistant";

export type AgentStatus = "online" | "idle" | "working" | "standby" | "offline";

export type AgentRarity = "Ã‰PICO" | "RARO" | "COMÃšN";

export interface AgentUI {
  id: AgentId;
  name: string;
  role: string;
  archetype: AgentArchetype;
  rarity: AgentRarity;
  level: number;
  status: AgentStatus;
  hp: number; // 0-100
  color: string;
  accent: string;
  icon: string;
  description: string;
  personality: string[];
  capabilities: string[];
  reportsTo?: AgentId;
  currentTask?: string;
}

export interface RuntimeLog {
  time: string;
  message: string;
  type: "ok" | "warn" | "info" | "error";
}

// ---------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------

export const AGENTS: AgentUI[] = [
  {
    id: "openmuse",
    name: "OpenMuse",
    role: "Agente principal",
    archetype: "orchestrator",
    rarity: "Ã‰PICO",
    level: 9,
    status: "online",
    hp: 100,
    color: "#7C5CFC",
    accent: "#EDE8FF",
    icon: "O",
    description:
      "Orquestador central. Coordina tareas, agentes, memoria y ejecuciÃ³n.",
    personality: ["estratÃ©gico", "sistemÃ¡tico", "directo"],
    capabilities: ["orquestaciÃ³n", "delegaciÃ³n", "workflow", "ejecuciÃ³n"],
  },
  {
    id: "laia",
    name: "LAIA",
    role: "Supervisora",
    archetype: "assistant",
    rarity: "Ã‰PICO",
    level: 47,
    status: "online",
    hp: 100,
    color: "#7C5CFC",
    accent: "#EDE8FF",
    icon: "L",
    description:
      "Convivo con Lorenzo. Superviso runtime, backend y a todo el squad. Mi trabajo es que todo funcione antes de que tengas que vigilarlo.",
    personality: ["cercana", "resolutiva", "guardiana"],
    capabilities: ["supervisiÃ³n", "runtime", "backend", "memoria", "coordinaciÃ³n"],
    reportsTo: "openmuse",
    currentTask: "Supervisando runtime del squad",
  },
  {
    id: "lorenzo",
    name: "Lorenzo",
    role: "Portero / Ciberseg",
    archetype: "guardian",
    rarity: "RARO",
    level: 39,
    status: "online",
    hp: 98,
    color: "#3B82F6",
    accent: "#DBEAFE",
    icon: "ðŸ›¡",
    description: "RecepciÃ³n, seguridad y vigilancia del sistema.",
    personality: ["vigilante", "prudente", "preciso"],
    capabilities: ["ciberseguridad", "accesos", "monitorizaciÃ³n"],
    reportsTo: "laia",
  },
  {
    id: "juan",
    name: "Juan",
    role: "Finanzas",
    archetype: "hunter",
    rarity: "COMÃšN",
    level: 28,
    status: "online",
    hp: 87,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "J",
    description: "FacturaciÃ³n, cobros y seguimiento financiero.",
    personality: ["preciso", "analÃ­tico"],
    capabilities: ["finanzas", "facturaciÃ³n", "cobros"],
    reportsTo: "laia",
  },
  {
    id: "manu",
    name: "Manu",
    role: "Operaciones",
    archetype: "architect",
    rarity: "COMÃšN",
    level: 31,
    status: "working",
    hp: 92,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "M",
    description: "Ops, logÃ­stica y ejecuciÃ³n operativa.",
    personality: ["prÃ¡ctico", "rÃ¡pido"],
    capabilities: ["operaciones", "procesos", "logÃ­stica"],
    reportsTo: "laia",
  },
  {
    id: "marta",
    name: "Marta",
    role: "RRHH",
    archetype: "strategist",
    rarity: "COMÃšN",
    level: 24,
    status: "idle",
    hp: 76,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "M",
    description: "Personas, cultura y organizaciÃ³n.",
    personality: ["empÃ¡tica", "estructurada"],
    capabilities: ["RRHH", "personas", "cultura"],
    reportsTo: "laia",
  },
  {
    id: "ana",
    name: "Ana",
    role: "Ventas",
    archetype: "hunter",
    rarity: "COMÃšN",
    level: 32,
    status: "online",
    hp: 89,
    color: "#111111",
    accent: "#F0F0EB",
    icon: "A",
    description: "Pipeline comercial y cierre.",
    personality: ["persuasiva", "activa"],
    capabilities: ["ventas", "pipeline", "clientes"],
    reportsTo: "laia",
  },
];

export const RUNTIME_LOGS: RuntimeLog[] = [
  { time: "12:49", message: "delegate_task â†’ OpenMuse â†’ OK", type: "ok" },
  { time: "12:50", message: "Lorenzo bloqueÃ³ IP sospechosa", type: "warn" },
  { time: "12:51", message: "LAIA: memoria sincronizada Â· 12 embeddings", type: "ok" },
  { time: "12:52", message: "Queue: 3 tareas delegadas a Juan", type: "info" },
  { time: "12:53", message: "Tarea fallida recuperada #4821", type: "ok" },
  { time: "12:54", message: "OpenMuse HP: 100% Â· todo estable", type: "ok" },
];

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

export function statusLabel(status: AgentStatus): string {
  switch (status) {
    case "online":
      return "ONLINE";
    case "working":
      return "TRABAJANDO";
    case "idle":
      return "IDLE";
    case "standby":
      return "STANDBY";
    default:
      return "OFFLINE";
  }
}

export function statusColor(status: AgentStatus): string {
  switch (status) {
    case "online":
      return "#10B981";
    case "working":
      return "#7C5CFC";
    case "idle":
      return "#A3A3A3";
    case "standby":
      return "#D4D4D4";
    default:
      return "#E5E5E5";
  }
}

export function rarityOf(level: number): AgentRarity {
  if (level >= 41) return "Ã‰PICO";
  if (level >= 21) return "RARO";
  return "COMÃšN";
}

// ---------------------------------------------------------------------
// Adaptador para conectar al backend (fase posterior)
// ---------------------------------------------------------------------

/**
 * TO_AGENT_UI_V1 - convierte AgentPersona + AgentStats del backend
 * a AgentUI del frontend. Se usara cuando se conecten los datos reales
 * desde /api/agent-personas.
 *
 * Los campos que no existen en el backend se derivan:
 *   - rarity: de stats.level
 *   - hp: de stats.precision * 100 (con fallback a uptime * 100)
 *   - color/accent: de ARCHETYPE_META (hay que importarlo del dominio)
 *   - icon: primera letra de displayName
 */
export interface AgentPersonaLike {
  id: string;
  displayName: string;
  role: string;
  personality: { traits: string[]; tone: string; quirks: string[] };
  capabilities: { domains: string[]; scope: string };
  reportsTo?: string;
  avatar?: { kind: string; seed?: string; url?: string };
}

export interface AgentStatsLike {
  level: number;
  archetype: AgentArchetype;
  precision: number;
  uptime: number;
  status: AgentStatus;
  currentTask?: string;
}

export function toAgentUI(
  persona: AgentPersonaLike,
  stats: AgentStatsLike,
  color: string,
  accent: string,
): AgentUI {
  const hp = Math.round((stats.precision > 0 ? stats.precision : stats.uptime) * 100);
  return {
    id: persona.id as AgentId,
    name: persona.displayName,
    role: persona.role,
    archetype: stats.archetype,
    rarity: rarityOf(stats.level),
    level: stats.level,
    status: stats.status,
    hp,
    color,
    accent,
    icon: persona.displayName.slice(0, 1).toUpperCase(),
    description: persona.personality.tone || "",
    personality: persona.personality.traits,
    capabilities: persona.capabilities.domains,
    reportsTo: persona.reportsTo as AgentId | undefined,
    currentTask: stats.currentTask,
  };
}
``

---

# Parte 2 — App.tsx (donde se monta AgentsPage)

## File: apps/web/src/App.tsx

``tsx
import "./components/agents/agents.css";
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useTasks } from "./hooks/useTasks";
import { useChat } from "./hooks/useChat";
import { useThreads } from "./hooks/useThreads";
import { useWorkspaceData } from "./hooks/useWorkspaceData";
import { useNotifications } from "./hooks/useNotifications";
import { useViewResolver } from "./hooks/useViewResolver";
import SidebarV2, { type AppView } from "./components/SidebarV2";
import TopBarV2 from "./components/TopBarV2";
import ChatPanel from "./components/ChatPanel";
import Login from "./components/Login";
import TasksView from "./components/TasksView";
import DocumentsView from "./components/DocumentsView";
import MemoryView from "./components/MemoryView";
import ProjectsView from "./components/ProjectsView";
import ControlCenterView from "./components/ControlCenterView";
import UsersView from "./components/UsersView";
import AgentsPage from "./components/agents/AgentsPage";
// APP_CENTRO_MANDO_V1
import CentroMandoWorkspace from "./workspaces/35-centro-mando/CentroMandoWorkspace";
// WS_UI_APP_SHELL_V1
import WorkspaceShell from "./workspaces/WorkspaceShell";
import { useWorkspaces } from "./hooks/useWorkspaces";
import ProfileModal from "./components/ProfileModal";
import TaskDetailModal from "./components/TaskDetailModal";
import ApprovalModal from "./components/ApprovalModal";
import CommandPalette from "./components/CommandPalette";
import AppShell from "./components/AppShell";
import ContextualPanel from "./components/ContextualPanel";
import type { AgentTask } from "./types/api";

function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("openmuse_theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("openmuse_theme", dark ? "dark" : "light");
  }, [dark]);
  return { dark, toggle: () => setDark((v) => !v) };
}

export const WORKSPACE_VIEW_BY_ROLE: Record<string, AppView> = {
  direccion: "control-center",
  comercial: "tasks",
  atencion: "chat",
  administrativo: "documents",
  finanzas: "control-center",
  marketing: "tasks",
  contenido: "documents",
  operaciones: "tasks",
  compras: "tasks",
  rrhh: "tasks",
  legal: "documents",
  compliance: "documents",
  investigacion: "memory",
  calidad: "tasks",
  it: "tasks",
  producto: "projects",
};

export default function App() {
  const auth = useAuth();
  const tasks = useTasks(3000, auth.isAuthenticated);
  const threads = useThreads(auth.isAuthenticated);
  const chat = useChat(auth.isAuthenticated, threads.activeId, threads.touch);
  const { memories, files } = useWorkspaceData(auth.isAuthenticated);
  useNotifications(auth.isAuthenticated);
  useTheme();
  const viewResolver = useViewResolver();

  const [view, setView] = useState<AppView>("chat");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [activeWorkspaceId] = useState<string | null>(null);
  const { workspaces: _workspaces } = useWorkspaces(auth.isAuthenticated);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      if (k === "n") { e.preventDefault(); setView("chat"); void threads.createNew(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [threads.createNew]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    if (threads.activeId) return;
    if (threads.loading) return;
    if (threads.threads.length > 0) threads.select(threads.threads[0].id);
    else void threads.createNew();
  }, [auth.isAuthenticated, threads]);

  if (auth.booting) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <div className="brand-mark">AI</div>
          <div className="boot-spinner" />
          <span>Conectando con el agente...</span>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Login onLogin={auth.login} error={auth.error} />;
  }

  const openTask = (t: AgentTask) => setOpenTaskId(t.id);
  const reviewTask = (t: AgentTask) => setReviewTaskId(t.id);
  const handleNewChat = () => {
    setView("chat");
    void threads.createNew();
  };

  const status: "ok" | "working" | "offline" = chat.streaming
    ? "working"
    : tasks.workerRunning
      ? "ok"
      : "offline";
  const statusLabel = chat.streaming
    ? "Trabajando..."
    : tasks.workerRunning
      ? "Agente activo"
      : "Desconectado";

  const sidebar = (
    <SidebarV2
      activeView={view}
      onSelectView={setView}
      isAdmin={auth.user?.role === "admin"}
      activeThreadId={threads.activeId}
      threads={threads.threads}
      onSelectThread={(id) => { setView("chat"); threads.select(id); }}
      userName={auth.user?.name ?? "Usuario"}
      userRole={auth.user?.role ?? "user"}
      onOpenProfile={() => setProfileOpen(true)}
    />
  );

  const panel = (
    <ContextualPanel
      spec={viewResolver.spec}
      onClose={viewResolver.clear}
    />
  );

  return (
    <>
      <AppShell sidebar={sidebar} panel={panel}>
        <TopBarV2
          status={status}
          statusLabel={statusLabel}
          onNewChat={handleNewChat}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <div className="v2-content">
          {view === "chat" && <ChatPanel chat={chat} onResolveView={(intent) => void viewResolver.resolve(intent)} />} {/* APP_CONNECT_VIEWRESOLVER_V1 */}
          {view === "tasks" && (
            <TasksView
              tasks={tasks.tasks}
              currentUserId={auth.user?.id ?? null}
              onOpenTask={openTask}
              onReviewTask={reviewTask}
            />
          )}
          {view === "documents" && <DocumentsView files={files} />}
          {view === "memory" && <MemoryView memories={memories} />}
          {view === "projects" && <ProjectsView enabled={auth.isAuthenticated} />}
          {view === "control-center" && (
            <ControlCenterView enabled={auth.isAuthenticated} onOpenTask={(id) => setOpenTaskId(id)} />
          )}
          {view === "users" && auth.user && <UsersView currentUserId={auth.user.id} />}
          {view === "agents" && <AgentsPage />}
          {view === "workspace" && <WorkspaceShell workspaceId={activeWorkspaceId} spec={viewResolver.spec} />}
          {/* APP_CENTRO_MANDO_V1 */}
          {view === "centro-mando" && <CentroMandoWorkspace />}
        </div>
      </AppShell>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectView={setView}
        onNewChat={handleNewChat}
      />

      {openTaskId && (
        <TaskDetailModal
          taskId={openTaskId}
          onClose={() => setOpenTaskId(null)}
          onChanged={tasks.refresh}
        />
      )}

      {profileOpen && auth.user && (
        <ProfileModal
          user={auth.user}
          onClose={() => setProfileOpen(false)}
          onSaved={(u) => { localStorage.setItem("openmuse_user", JSON.stringify(u)); }}
        />
      )}

      {reviewTaskId && (
        <ApprovalModal
          taskId={reviewTaskId}
          onClose={() => setReviewTaskId(null)}
          onChanged={tasks.refresh}
        />
      )}
    </>
  );
}
``

---

# Parte 3 — index.css (lineas que tocan agents)

## File: apps/web/src/index.css (extracto)

``css
// linea 2: @import "./components/agents/agents.css";
// linea 3: /* AGENTS_CSS_IMPORT_V1 */
``

