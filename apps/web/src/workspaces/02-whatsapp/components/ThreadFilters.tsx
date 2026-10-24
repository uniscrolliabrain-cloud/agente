// CHAT_THREAD_FILTERS_V1
import type { ChatFilter, ChatThread } from "../types.ts"

const options: { value: ChatFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "unread", label: "Sin leer" },
  { value: "groups", label: "Grupos" },
  { value: "archived", label: "Archivados" },
]

export function filterThreads(threads: ChatThread[], filter: ChatFilter, query: string): ChatThread[] {
  const q = query.trim().toLowerCase()
  return threads.filter((t) => {
    const byFilter =
      filter === "archived"
        ? t.archived
        : !t.archived &&
          (filter === "all" ||
            (filter === "unread" && t.unread > 0) ||
            (filter === "groups" && t.kind === "group"))
    const byQuery = !q || [t.name, t.preview, t.tag].some((v) => v.toLowerCase().includes(q))
    return byFilter && byQuery
  })
}

type Props = { value: ChatFilter; onChange: (value: ChatFilter) => void }

export function ThreadFilters({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto" role="group" aria-label="Filtrar chats">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`h-8 shrink-0 rounded-full border px-3.5 text-xs font-medium transition-colors ${
            value === o.value
              ? "border-text bg-text text-white"
              : "border-border bg-bg-soft text-text-2 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
