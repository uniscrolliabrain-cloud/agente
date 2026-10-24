// ZENDESK_COWRITE_EDITOR_V1

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

export default function CoWriteEditor({ value, onChange, disabled = false }: Props) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={6}
      className="w-full resize-y rounded-xl border border-border bg-bg-card px-3 py-2 text-xs leading-relaxed text-text outline-none placeholder:text-text-3 focus-visible:border-purple disabled:opacity-60"
      placeholder="Escribe aqui tu respuesta o pulsa Reescribir con IA."
    />
  );
}