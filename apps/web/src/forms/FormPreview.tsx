// FORM_PREVIEW_V1 - preview del JSON que se va a crear.

interface Props {
  values: Record<string, unknown>;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export default function FormPreview({ values, onCancel, onConfirm }: Props) {
  return (
    <div className="v3-cc-panel">
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Vista previa</div>
      <pre
        style={{
          margin: 0,
          padding: 10,
          background: "var(--v2-bg-soft)",
          border: "1px solid var(--v2-border)",
          borderRadius: 10,
          fontSize: 11,
          lineHeight: 1.5,
          maxHeight: 280,
          overflow: "auto",
          fontFamily: "SFMono-Regular, Consolas, monospace",
        }}
      >
        {JSON.stringify(values, null, 2)}
      </pre>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
        <button className="v2-pill" onClick={onCancel}>Volver</button>
        <button className="v2-need-action-btn" onClick={onConfirm}>Confirmar creación</button>
      </div>
    </div>
  );
}