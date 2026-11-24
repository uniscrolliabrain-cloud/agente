// CHAT_THREAD_LIST_V1
import { ThreadListItem } from "./ThreadListItem.tsx"
import type { ChatThread } from "../types.ts"

type Props = {
  threads: ChatThread[]
  activeId: string
  onSelect: (id: string) => void
  className?: string
}

export function ThreadList({ threads, activeId, onSelect, className = "" }: Props) {
  if (threads.length === 0) {
    return (
      <div className={`grid place-items-center p-8 text-center text-sm text-text-2 ${className}`}>
        No hay chats que coincidan.
      </div>
    )
  }

  return (
    <ul className={`flex flex-col gap-1 px-2 pb-4 ${className}`}>
      {threads.map((t) => (
        <li key={t.id}>
          <ThreadListItem chat={t} active={t.id === activeId} onSelect={() => onSelect(t.id)} />
        </li>
      ))}
    </ul>
  )
}
