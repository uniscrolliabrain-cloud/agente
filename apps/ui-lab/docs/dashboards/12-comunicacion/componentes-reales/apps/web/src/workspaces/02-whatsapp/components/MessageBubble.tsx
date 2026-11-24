// CHAT_MESSAGE_BUBBLE_V1
import { Sparkles } from "lucide-react"
import { formatClock } from "../format.ts"
import type { ChatMessage } from "../types.ts"

type Props = { message: ChatMessage; showAuthor: boolean }

export function MessageBubble({ message, showAuthor }: Props) {
  if (message.role === "system") {
    return (
      <p className="mx-auto shrink-0 rounded-full bg-bg-soft px-3 py-1 text-center text-xs text-text-2">
        {message.text} - <span className="tabular-nums">{formatClock(message.createdAt)}</span>
      </p>
    )
  }

  const mine = message.role === "owner"
  const agent = message.role === "agent"

  const tone = mine
    ? "rounded-br-md bg-purple text-white"
    : agent
      ? "rounded-bl-md border border-border bg-purplesoft"
      : "rounded-bl-md border border-border bg-bg-card"

  return (
    <div className={`flex shrink-0 flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
      {!mine && (showAuthor || agent) && (
        <span className="flex items-center gap-1.5 px-1 text-xs font-medium text-text-2">
          {agent && <Sparkles className="h-3 w-3 text-accent" aria-hidden="true" />}
          {message.authorName}
          {agent && <span className="rounded bg-purplesoft px-1 text-[10px] text-accent">agente</span>}
        </span>
      )}
      <p
        className={`max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${tone}`}
      >
        {message.text}
        {message.streaming && (
          <span
            className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-purple motion-safe:animate-pulse"
            aria-hidden="true"
          />
        )}
      </p>
      <span className="px-1 text-xs tabular-nums text-text-2">
        {message.streaming ? "escribiendo..." : formatClock(message.createdAt)}
      </span>
    </div>
  )
}
