// APP_RAIL_V1
import { Bookmark, CalendarDays, FileText, Inbox, Layers, MessageSquare, Users, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Item = { icon: LucideIcon; label: string; active?: boolean; badge?: string }

const items: Item[] = [
  { icon: MessageSquare, label: "Chats", active: true },
  { icon: Inbox, label: "Bandeja", badge: "9+" },
  { icon: Users, label: "Personas" },
  { icon: CalendarDays, label: "Agenda" },
  { icon: FileText, label: "Documentos" },
  { icon: Bookmark, label: "Guardados" },
  { icon: Layers, label: "Espacios" },
]

export function AppRail({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Navegacion principal" className={`flex-col items-center gap-2 border-r border-border py-4 ${className}`}>
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-text text-sm font-bold text-white">A</div>

      {items.map(({ icon: Icon, label, active, badge }) => (
        <button
          key={label}
          type="button"
          aria-label={label}
          aria-current={active ? "page" : undefined}
          className={`relative grid h-11 w-11 place-items-center rounded-xl transition-colors ${
            active ? "bg-text text-white" : "text-text-2 hover:bg-bg-soft hover:text-ink"
          }`}
        >
          <Icon className="h-5 w-5" />
          {badge && (
            <span className="absolute -right-1 -top-1 rounded-full bg-purple px-1.5 text-[10px] font-semibold leading-4 text-white">
              {badge}
            </span>
          )}
        </button>
      ))}

      <div className="mt-auto flex flex-col items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-purplesoft text-purple">
          <Zap className="h-4 w-4" />
        </span>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-text text-xs font-semibold text-white">JD</span>
      </div>
    </nav>
  )
}
