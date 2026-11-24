// CHAT_THREAD_ITEM_V1
import { Hash, Sparkles } from "lucide-react"
import { Avatar } from "./Avatar.tsx"
import { formatThreadTime } from "../format.ts"
import type { ChatThread } from "../types.ts"

type Props = { chat: ChatThread; active: boolean; onSelect: () => void }

export function ThreadListItem({ chat, active, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${
        active ? "border-border bg-bg-soft" : "border-transparent hover:bg-surface"
      }`}
    >
      <Avatar initial={chat.initial} color={chat.color} size={44} online={chat.online} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{chat.name}</span>
            {chat.kind === "agent" && (
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-purple" aria-label="Agente" />
            )}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-text-2">
            {formatThreadTime(chat.lastMessageAt)}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-sm text-text-2">{chat.preview}</span>
        <span className="mt-1.5 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-xs text-text-2">
            <Hash className="h-3 w-3" />
            {chat.tag}
          </span>
          {chat.unread > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-purple px-1.5 text-[11px] font-semibold text-white">
              {chat.unread}
            </span>
          )}
        </span>
      </span>
    </button>
  )
}
