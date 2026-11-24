// BUG03_MESSAGEBUBBLE_V2 - itera message.tools[] + preview.
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ChatMessage } from "../types/api";
import ToolCallsGroup from "./ToolCallsGroup";
import AttachmentPreview from "./AttachmentPreview";
import type { ToolCall } from "../lib/toolsReducer";

interface Props {
  message: ChatMessage;
  onQuickAction?: (kind: "responder" | "resumir" | "traducir", text: string) => void;
}

export default function MessageBubble({ message, onQuickAction }: Props) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [preview] = useState<{ url: string; name: string; mimeType?: string } | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard bloqueado */ }
  };

  if (isUser) {
    return (
      <div className="v2-user-bubble">
        <div className="v2-user-bubble-inner">{message.content}</div>
      </div>
    );
  }

  const toolList: ToolCall[] = (message.tools ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    startedAt: t.startedAt,
    endedAt: t.endedAt,
  }));

  return (
    <div className="v2-assistant-row">
      <div className="v2-assistant-avatar">IA</div>
      <div className="v2-assistant-body">
        {toolList.length > 0 && <ToolCallsGroup tools={toolList} />}
        <div className="v2-assistant-text" style={{ marginTop: 12 }}>{message.content}</div>

        {message.content && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <button
              onClick={copy}
              title={copied ? "Copiado" : "Copiar"}
              aria-label="Copiar mensaje"
              style={{
                width: 26, height: 26,
                border: "1px solid var(--v2-border)",
                borderRadius: 6,
                background: "transparent",
                color: copied ? "var(--v2-green)" : "var(--v2-text-3)",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            {onQuickAction && (
              <>
                <button className="v2-tag" onClick={() => onQuickAction("responder", message.content)}>Responder</button>
                <button className="v2-tag" onClick={() => onQuickAction("resumir", message.content)}>Resumir</button>
                <button className="v2-tag" onClick={() => onQuickAction("traducir", message.content)}>Traducir</button>
              </>
            )}
          </div>
        )}
        {preview && (
          <AttachmentPreview
            url={preview.url}
            name={preview.name}
            mimeType={preview.mimeType}
            onClose={() => { /* noop */ }}
          />
        )}
      </div>
    </div>
  );
}