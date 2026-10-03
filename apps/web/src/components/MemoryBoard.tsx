// E1_MEMORY_BOARD_V1 - board con headers colapsables por categoria/rol.
import { useMemo, useState } from "react";
import { groupMemories, type Memory } from "../lib/groupMemories";

interface Props {
  memories: Memory[];
  roleName: (id: string) => string;
  onEdit?: (m: Memory) => void;
  onForget?: (m: Memory) => void;
}

export default function MemoryBoard({ memories, roleName, onEdit, onForget }: Props) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");
  const [roleId, setRoleId] = useState<string>("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const categories = useMemo(
    () => [...new Set(memories.map((m) => m.category).filter(Boolean))].sort(),
    [memories],
  );
  const roles = useMemo(
    () => [...new Set(memories.map((m) => m.roleId).filter((r): r is string => Boolean(r)))].sort(),
    [memories],
  );

  const groups = useMemo(
    () => groupMemories(memories, roleName, { q, category, roleId }),
    [memories, roleName, q, category, roleId],
  );

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="mb">
      <div className="mb__filters">
        <input
          type="text"
          placeholder="Buscar"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mb__search"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="mb__select">
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="mb__select">
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{roleName(r)}</option>
          ))}
        </select>
      </div>

      <div className="mb__groups">
        {groups.map(([key, list]) => {
          const isCollapsed = collapsed.has(key);
          return (
            <section className="mb__group" key={key}>
              <button
                type="button"
                className="mb__group-head"
                onClick={() => toggle(key)}
                aria-expanded={!isCollapsed}
              >
                <span className="mb__group-title">{key}</span>
                <span className="mb__group-count">{list.length}</span>
                <span className="mb__group-chevron" aria-hidden>{isCollapsed ? "▸" : "▾"}</span>
              </button>
              {!isCollapsed && (
                <div className="mb__group-body">
                  {list.map((m) => (
                    <div className="mb__item" key={m.id}>
                      <div className="mb__item-text">{m.text}</div>
                      {m.tags.length > 0 && (
                        <div className="mb__item-tags">
                          {m.tags.map((t) => <span key={t} className="v2-tag">{t}</span>)}
                        </div>
                      )}
                      <div className="mb__item-actions">
                        {onEdit && (
                          <button type="button" className="btn" onClick={() => onEdit(m)}>Editar</button>
                        )}
                        {onForget && (
                          <button type="button" className="btn danger" onClick={() => onForget(m)}>Olvidar</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
        {groups.length === 0 && <div className="mb__empty">Sin memorias con esos filtros.</div>}
      </div>
    </div>
  );
}