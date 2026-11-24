// CHAT_UX_V2_MESSAGE_BUBBLE - copia adaptada de MessageBubble.tsx (main
// d7260009). Conserva copiar, quick actions, herramientas y adjunto. Unica
// diferencia visual: el texto del asistente se lee como markdown seguro.

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import AttachmentPreview from "../../components/AttachmentPreview";
import ToolCallsGroup from "../../components/ToolCallsGroup";
import type { ToolCall } from "../../lib/toolsReducer";
import type { ChatMessage } from "../../types/api";
import Markdown from "./Markdown";

interface Props {
  message: ChatMessage;
  onQuickAction?: (kind: "responder" | "resumir" | "traducir", text: string) => void;
  /** Entrada animada solo para mensajes que llegan en esta sesion. */
  enter?: boolean;
}

export default function MessageBubbleUX({ message, onQuickAction, enter }: Props) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [preview] = useState<{ url: string; name: string; mimeType?: string } | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard bloqueado */
    }
  };

  if (isUser) {
    return (
      <div className="v2-user-bubble cux-user" data-message-id={message.id} data-enter={enter ? "true" : undefined}>
        <div className="v2-user-bubble-inner cux-user-inner">{message.content}</div>
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
    <div
      className="v2-assistant-row cux-assistant"
      data-message-id={message.id}
      data-enter={enter ? "true" : undefined}
    >
      <div className="v2-assistant-avatar cux-avatar" aria-hidden="true">
        IA
      </div>
      <div className="v2-assistant-body cux-assistant-body">
        {toolList.length > 0 && <ToolCallsGroup tools={toolList} />}
        <div className="v2-assistant-text cux-assistant-text">
          <Markdown text={message.content} />
        </div>

        {message.content && (
          <div className="cux-actions">
            <button
              type="button"
              onClick={copy}
              title={copied ? "Copiado" : "Copiar"}
              aria-label={copied ? "Copiado" : "Copiar mensaje"}
              className="cux-icon-action"
              data-copied={copied ? "true" : undefined}
            >
              {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
            </button>
            {onQuickAction && (
              <>
                <button
                  type="button"
                  className="v2-tag cux-tag"
                  onClick={() => onQuickAction("responder", message.content)}
                >
                  Responder
                </button>
                <button
                  type="button"
                  className="v2-tag cux-tag"
                  onClick={() => onQuickAction("resumir", message.content)}
                >
                  Resumir
                </button>
                <button
                  type="button"
                  className="v2-tag cux-tag"
                  onClick={() => onQuickAction("traducir", message.content)}
                >
                  Traducir
                </button>
              </>
            )}
          </div>
        )}
        {preview && (
          <AttachmentPreview
            url={preview.url}
            name={preview.name}
            mimeType={preview.mimeType}
            onClose={() => {
              /* noop */
            }}
          />
        )}
      </div>
    </div>
  );
}
