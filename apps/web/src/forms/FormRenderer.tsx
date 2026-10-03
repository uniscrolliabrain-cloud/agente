// FORM_RENDERER_V2 - renderiza un FormSpec con chips de procedencia por campo.

import { useState } from "react";
import ProvenanceBadge from "../components/ProvenanceBadge";
import type { ProvenanceChipKind } from "../../../../packages/domain/src/context-chips.ts";

export interface FormField {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "checkbox";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  value?: unknown;
  provenance: ProvenanceChipKind;
}

export interface FormSpec {
  id: string;
  title: string;
  entityType: string;
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
}

interface Props {
  spec: FormSpec;
  onSubmit?: (values: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export default function FormRenderer({ spec, onSubmit, onCancel }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {};
    for (const f of spec.fields) v[f.key] = f.value;
    return v;
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // FORM_VALIDATE_ZOD_V1 - validacion minima por required.
        const errors: Record<string, string> = {};
        for (const f of spec.fields) {
          if (f.required && (values[f.key] === undefined || values[f.key] === null || values[f.key] === "")) {
            errors[f.key] = `${f.label} es obligatorio`;
          }
        }
        if (Object.keys(errors).length > 0) {
          setErrors(errors);
          return;
        }
        setErrors({});
        onSubmit?.(values);
      }}
      className="v3-cc-panel"
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div style={{ fontSize: 14, fontWeight: 600 }}>{spec.title}</div>
      {spec.fields.map((f) => (
        <div key={f.key}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <label style={{ fontSize: 12, color: "var(--v2-text-2)" }}>
              {f.label}
              {f.required && <span style={{ color: "var(--v2-warn-text)" }}> *</span>}
            </label>
            <ProvenanceBadge kind={f.provenance} />
          </div>
          <div>
            {errors[f.key] && <div style={{ fontSize: 11, color: "var(--v2-warn-text)" }}>{errors[f.key]}</div>}
            <div style={{ display: "none" }}>
          </div>
          {f.type === "textarea" ? (
            <textarea
              className="v2-pill"
              style={{ width: "100%", padding: "8px 12px", minHeight: 60 }}
              value={String(values[f.key] ?? "")}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              placeholder={f.placeholder}
            />
          ) : f.type === "select" ? (
            <select
              className="v2-pill"
              style={{ width: "100%", padding: "8px 12px" }}
              value={String(values[f.key] ?? "")}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            >
              <option value="">—</option>
              {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.type === "checkbox" ? (
            <input
              type="checkbox"
              checked={Boolean(values[f.key])}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.checked })}
            />
          ) : (
            <input
              className="v2-pill"
              style={{ width: "100%", padding: "8px 12px" }}
              type={f.type}
              value={String(values[f.key] ?? "")}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              placeholder={f.placeholder}
            />
          )}
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        {onCancel && (
          <button type="button" className="v2-pill" onClick={onCancel}>
            {spec.cancelLabel ?? "Cancelar"}
          </button>
        )}
        <button type="submit" className="v2-need-action-btn">
          {spec.submitLabel ?? "Guardar"}
        </button>
      </div>
    </form>
  );
}