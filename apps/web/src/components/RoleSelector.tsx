// ROLE_SELECTOR_V1 - dropdown de rol activo del chat.

import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

interface AgentRole {
  id: string;
  name: string;
  active: boolean;
}

interface Props {
  value?: string;
  onChange?: (id: string | undefined) => void;
}

export default function RoleSelector({ value, onChange }: Props) {
  const [roles, setRoles] = useState<AgentRole[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await apiFetch<AgentRole[]>("/api/agent/roles");
        if (!cancelled) setRoles(list.filter((r) => r.active));
      } catch {
        /* silencio */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (roles.length === 0) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: "var(--v2-text-3)" }}>Rol:</span>
      <select
        className="v2-pill"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value || undefined)}
        style={{ padding: "4px 10px", fontSize: 12 }}
      >
        <option value="">Sin rol</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
        ))}
      </select>
    </div>
  );
}