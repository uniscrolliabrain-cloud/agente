// CHAT_THREAD_HEADER_V1
import { ChevronLeft, MoreHorizontal, PanelRight, Phone, Star, Video } from "lucide-react"
import { Avatar } from "./Avatar.tsx"
import type { ChatThread } from "../types.ts"

const iconBtn =
  "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border text-text-2 transition-colors hover:bg-bg-soft hover:text-text"

type Props = {
  thread: ChatThread
  contextOpen: boolean
  onToggleContext: () => void
  onBack: () => void
  className?: string
}

export function ThreadHeader({ thread, contextOpen, onToggleContext, onBack, className = "" }: Props) {
  return (
    <header className={`flex items-center gap-3 border-b border-border px-4 py-3 ${className}`}>
      <button type="button" onClick={onBack} aria-label="Volver a la lista" className={`${iconBtn} md:hidden`}>
        <ChevronLeft className="h-4 w-4" />
      </button>

      <Avatar initial={thread.initial} color={thread.color} size={44} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-sm font-semibold">{thread.name}</h2>
          {thread.online && <span className="h-2 w-2 shrink-0 rounded-full bg-green" aria-label="En linea" />}
          <Star className="h-3.5 w-3.5 shrink-0 text-text-2" aria-hidden="true" />
        </div>
        <p className="truncate text-xs text-text-2">
          {thread.subtitle} - {thread.online ? "activo" : "desconectado"}
        </p>
      </div>

      <button type="button" aria-label="Llamar" className={`${iconBtn} hidden sm:grid`}>
        <Phone className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Videollamada" className={`${iconBtn} hidden sm:grid`}>
        <Video className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Panel de detalle"
        aria-pressed={contextOpen}
        onClick={onToggleContext}
        className={`${iconBtn} ${contextOpen ? "border-purple text-purple" : ""}`}
      >
        <PanelRight className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Mas opciones" className={iconBtn}>
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </header>
  )
}
