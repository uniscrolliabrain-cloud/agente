// CHAT_THREAD_SEARCH_V1
import { Search } from "lucide-react"

type Props = { value: string; onChange: (value: string) => void }

export function ThreadSearch({ value, onChange }: Props) {
  return (
    <label className="relative block" htmlFor="thread-search">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-2" />
      <input
        id="thread-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar chats, personas..."
        className="h-11 w-full rounded-xl border border-border bg-bg-soft pl-10 pr-3 text-sm outline-none placeholder:text-text-2 focus-visible:border-purple"
      />
    </label>
  )
}
