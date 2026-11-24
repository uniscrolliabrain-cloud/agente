// CHAT_UX_V2_ROLE_SELECTOR - misma funcion que RoleSelector.tsx (main
// d7260009) con roles locales: la preview no consulta /api/agent/roles.
import { fixtureRoles } from "./fixture";

interface Props {
  value?: string;
  onChange?: (id: string | undefined) => void;
}

export default function RoleSelectorUX({ value, onChange }: Props) {
  const roles = fixtureRoles.filter((role) => role.active);
  if (roles.length === 0) return null;

  return (
    <div className="cux-role">
      <label className="cux-role-label" htmlFor="cux-role-select">
        Rol:
      </label>
      <select
        id="cux-role-select"
        className="v2-pill cux-role-select"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value || undefined)}
      >
        <option value="">Sin rol</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name} ({role.id})
          </option>
        ))}
      </select>
    </div>
  );
}
