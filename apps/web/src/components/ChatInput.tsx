import { useEffect, useRef, useState } from "react";

interface Props {
  onSend: (text: string) => void;
  onCancel: () => void;
  streaming: boolean;
}

export default function ChatInput({ onSend, onCancel, streaming }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    if (!value.trim() || streaming) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="chat-input-wrap">
      <div className="input-bar">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Pregunta lo que quieras…"
          rows={1}
          disabled={streaming}
        />
        <div className="input-actions">
          {streaming ? (
            <button className="stop-btn" onClick={onCancel}>Parar</button>
          ) : (
            <button className="send-btn" disabled={!value.trim()} onClick={submit} title="Enviar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="input-meta">
        ↵ enviar · ⇧↵ nueva línea · SSE vía fetch() + ReadableStream
      </div>
    </div>
  );
}
