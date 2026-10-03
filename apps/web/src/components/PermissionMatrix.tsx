// E3_PERMISSION_MATRIX_V1 - tabla Resource x Action con toggles.
type Action = "read" | "create" | "update" | "delete" | "execute" | "approve";

export interface PermissionRow {
  resource: string;
  actions: Action[];
  locked?: boolean;
}

interface Props {
  permissions: PermissionRow[];
  onChange?: (next: PermissionRow[]) => void;
}

const ALL: Action[] = ["read", "create", "update", "delete", "execute", "approve"];

export default function PermissionMatrix({ permissions, onChange }: Props) {
  const toggle = (resource: string, action: Action) => {
    if (!onChange) return;
    const next = permissions.map((p) => {
      if (p.resource !== resource || p.locked) return p;
      const has = p.actions.includes(action);
      return {
        ...p,
        actions: has ? p.actions.filter((a) => a !== action) : [...p.actions, action],
      };
    });
    onChange(next);
  };

  return (
    <table className="pm" aria-label="Matriz de permisos por recurso">
      <thead>
        <tr>
          <th scope="col" className="pm__resource-col">Recurso</th>
          {ALL.map((a) => (
            <th key={a} scope="col">{a}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {permissions.map((p) => (
          <tr key={p.resource} data-locked={p.locked || undefined}>
            <th scope="row" className="pm__resource">{p.resource}</th>
            {ALL.map((a) => {
              const checked = p.actions.includes(a);
              return (
                <td key={a}>
                  <label className="pm__cell">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={p.locked}
                      onChange={() => toggle(p.resource, a)}
                      aria-label={`${p.resource} ${a}`}
                    />
                  </label>
                </td>
              );
            })}
          </tr>
        ))}
        {permissions.length === 0 && (
          <tr>
            <td colSpan={ALL.length + 1} className="pm__empty">
              Sin permisos configurados.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}