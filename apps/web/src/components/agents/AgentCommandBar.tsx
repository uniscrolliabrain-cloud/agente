// AGENT_COMMAND_BAR_V1 - barra de comandos directos /invoke.
import { useState } from "react";
import { Bot, MessageSquare } from "lucide-react";

interface Props {
  onOpenLaia: () => void;
}

export default function AgentCommandBar({ onOpenLaia }: Props) {
  const [value, setValue] = useState("");

  const submit = () => {
    const lower = value.toLowerCase();
    if (lower.includes("laia")) onOpenLaia();
    setValue("");
  };

  return (
    <section className="agent-command">
      <div className="agent-command__header">
        <span>
          <MessageSquare size={14} />
          COMANDOS DIRECTOS
        </span>
        <code>/invoke</code>
      </div>

      <div className="agent-command__system">
        <span className="agent-command__system-icon">
          <Bot size={14} />
        </span>
        <div>
          <strong>sistema</strong>
          <p>Squad operativo. Escribe "llama a Laia" para traerla al frente.</p>
        </div>
      </div>

      <div className="agent-command__input">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder='llama al agente de ventas para...'
        />
        <button type="button" onClick={submit}>
          →
        </button>
      </div>
    </section>
  );
}