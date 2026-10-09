import { Check, FolderOpen } from "lucide-react";

interface Props {
  items: Array<{ id: string; text: string }>;
  contextLine: string;
}

export default function AgentKnowledgeCard({ items, contextLine }: Props) {
  return (
    <section className="agent-knowledge">
      <header className="agent-knowledge__head">
        <h3>
          <FolderOpen size={16} /> Lo que sabe de tu negocio
        </h3>
        <span>{items.length} entradas</span>
      </header>
      {items.length === 0 ? (
        <div className="agent-activity__empty">Sin memoria registrada</div>
      ) : (
        <ul className="agent-knowledge__list">
          {items.map((it, i) => (
            <li key={it.id}>
              <span className="agent-knowledge__num">{String(i + 1).padStart(2, "0")}</span>
              <span>{it.text}</span>
              <Check size={14} className="agent-knowledge__check" />
            </li>
          ))}
        </ul>
      )}
      <div className="agent-knowledge__context">{contextLine}</div>
    </section>
  );
}