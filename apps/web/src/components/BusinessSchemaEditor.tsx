// BUSINESS_SCHEMA_EDITOR_V1 - editor de BusinessSchema por tenant.

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { apiFetch } from "../api/client";

interface FieldDef {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "date" | "money" | "enum";
  required: boolean;
  enumValues?: string[];
}

interface EntityDef {
  type: string;
  label: string;
  fields: FieldDef[];
}

interface RelationDef {
  type: string;
  label: string;
  fromType: string;
  toType: string;
  cardinality: "one-to-one" | "one-to-many" | "many-to-many";
}

interface Props {
  tenantId: string;
  onClose?: () => void;
}

export default function BusinessSchemaEditor({ tenantId, onClose }: Props) {
  const [entities, setEntities] = useState<EntityDef[]>([]);
  const [relations, setRelations] = useState<RelationDef[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiFetch<{ schema: { entities?: EntityDef[]; relations?: RelationDef[] } | null }>(
          `/api/admin/tenants/${tenantId}/business-schema`,
        );
        setEntities(res.schema?.entities ?? []);
        setRelations(res.schema?.relations ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando schema");
      }
    })();
  }, [tenantId]);

  const save = async () => {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/tenants/${tenantId}/business-schema`, {
        method: "PUT",
        body: { entities, relations },
      });
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando");
    } finally {
      setBusy(false);
    }
  };

  const addEntity = () => {
    setEntities([...entities, { type: "new_entity", label: "Nueva entidad", fields: [] }]);
  };

  const removeEntity = (i: number) => {
    setEntities(entities.filter((_, idx) => idx !== i));
  };

  const addField = (i: number) => {
    const next = [...entities];
    next[i].fields.push({ name: "field", label: "Campo", type: "string", required: false });
    setEntities(next);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">Business Schema</div>
            <div className="modal-sub">Tenant {tenantId}</div>
          </div>
          <button className="ghost-icon-button" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="chat-error">{error}</div>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Entidades</strong>
            <button className="v2-pill" onClick={addEntity}><Plus size={12} /> Añadir</button>
          </div>
          {entities.map((e, i) => (
            <div key={i} className="v3-cc-panel" style={{ marginTop: 8 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  className="v2-pill"
                  style={{ flex: 1, padding: "4px 10px" }}
                  value={e.type}
                  onChange={(ev) => {
                    const next = [...entities];
                    next[i].type = ev.target.value;
                    setEntities(next);
                  }}
                />
                <input
                  className="v2-pill"
                  style={{ flex: 1, padding: "4px 10px" }}
                  value={e.label}
                  onChange={(ev) => {
                    const next = [...entities];
                    next[i].label = ev.target.value;
                    setEntities(next);
                  }}
                />
                <button className="v2-pill" onClick={() => addField(i)}><Plus size={12} /></button>
                <button className="v2-pill" onClick={() => removeEntity(i)}><Trash2 size={12} /></button>
              </div>
              {e.fields.map((f, fi) => (
                <div key={fi} style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <input
                    className="v2-pill"
                    style={{ flex: 1, padding: "4px 10px" }}
                    value={f.name}
                    onChange={(ev) => {
                      const next = [...entities];
                      next[i].fields[fi].name = ev.target.value;
                      setEntities(next);
                    }}
                  />
                  <input
                    className="v2-pill"
                    style={{ flex: 1, padding: "4px 10px" }}
                    value={f.label}
                    onChange={(ev) => {
                      const next = [...entities];
                      next[i].fields[fi].label = ev.target.value;
                      setEntities(next);
                    }}
                  />
                  <select
                    className="v2-pill"
                    value={f.type}
                    onChange={(ev) => {
                      const next = [...entities];
                      next[i].fields[fi].type = ev.target.value as FieldDef["type"];
                      setEntities(next);
                    }}
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                    <option value="date">date</option>
                    <option value="money">money</option>
                    <option value="enum">enum</option>
                  </select>
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            <button className="v2-pill" onClick={onClose} disabled={busy}>Cerrar</button>
            <button className="v2-need-action-btn" onClick={save} disabled={busy}>
              {busy ? "Guardando…" : "Guardar schema"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}