// CHAT_CONTEXT_PANEL_V1
import { Clock, FileText, Hash, Mail, MapPin, MoreHorizontal, Phone, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Avatar } from "./Avatar.tsx"
import { formatRelative } from "../format.ts"
import type { ChatContextSnapshot, ChatContextTab, ChatThread } from "../types.ts"

const sectionTitle = "text-xs font-semibold uppercase tracking-widest text-text-2"

const tabs: { id: ChatContextTab; label: string }[] = [
  { id: "info", label: "Info" },
  { id: "files", label: "Archivos" },
  { id: "notes", label: "Notas" },
  { id: "activity", label: "Actividad" },
]

type Props = {
  thread: ChatThread
  context: ChatContextSnapshot | null
  tab: ChatContextTab
  onTabChange: (tab: ChatContextTab) => void
  onClose: () => void
}

export function ContextPanel({ thread, context, tab, onTabChange, onClose }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between px-6 pb-2 pt-6">
        <h3 className={sectionTitle}>Detalle</h3>
        <button type="button" onClick={onClose} aria-label="Cerrar panel" className="text-text-2 hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6 pt-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <Avatar initial={thread.initial} color={thread.color} size={90} square />
          <h4 className="mt-3 text-xl font-bold">{thread.name}</h4>
          <p className="text-sm text-text-2">{thread.subtitle}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-full bg-text px-4 text-sm font-medium text-white"
            >
              <Phone className="h-3.5 w-3.5" />
              Llamar
            </button>
            <button
              type="button"
              className="h-9 rounded-full border border-border bg-bg-soft px-4 text-sm font-medium transition-colors hover:border-purple"
            >
              Email
            </button>
          </div>
        </div>

        <div role="tablist" aria-label="Detalle del chat" className="flex gap-1 rounded-xl bg-bg-soft p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`ctx-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="ctx-panel"
              onClick={() => onTabChange(t.id)}
              className={`min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                tab === t.id ? "bg-bg-card text-ink shadow-sm" : "text-text-2 hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div id="ctx-panel" role="tabpanel" aria-labelledby={`ctx-tab-${tab}`}>
          {!context ? (
            <p className="text-sm text-text-2">Cargando...</p>
          ) : tab === "info" ? (
            <InfoTab thread={thread} context={context} />
          ) : tab === "files" ? (
            <FilesTab context={context} />
          ) : tab === "notes" ? (
            <NotesTab context={context} />
          ) : (
            <ActivityTab context={context} />
          )}
        </div>
      </div>
    </div>
  )
}

type Row = { icon: LucideIcon; label: string; value: string }

function InfoTab({ thread, context }: { thread: ChatThread; context: ChatContextSnapshot }) {
  const rows: Row[] = [
    { icon: Mail, label: "Email", value: context.email },
    { icon: MapPin, label: "Ubicacion", value: context.location },
    { icon: Clock, label: "Horario", value: context.hours },
    { icon: Hash, label: "ID", value: `#${thread.id} - ${thread.tag}` },
  ]
  return (
    <dl className="flex flex-col gap-3">
      {rows.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-bg-soft text-text-2">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <dt className="text-xs uppercase text-text-2">{label}</dt>
            <dd className="truncate text-sm font-medium">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

function FilesTab({ context }: { context: ChatContextSnapshot }) {
  if (context.files.length === 0) return <p className="text-sm text-text-2">Sin archivos compartidos.</p>
  return (
    <ul className="flex flex-col gap-2">
      {context.files.map((f) => (
        <li key={f.id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-purplesoft text-purple">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{f.name}</p>
            <p className="text-xs text-text-2">
              {f.size} - {formatRelative(f.addedAt)}
            </p>
          </div>
          <button type="button" aria-label={`Opciones de ${f.name}`} className="text-text-2 hover:text-ink">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}

function NotesTab({ context }: { context: ChatContextSnapshot }) {
  if (context.notes.length === 0) return <p className="text-sm text-text-2">Sin notas.</p>
  return (
    <ul className="flex flex-col gap-2">
      {context.notes.map((n) => (
        <li key={n.id} className="rounded-2xl border border-border p-3">
          <p className="text-sm">{n.text}</p>
          <p className="mt-1 text-xs text-text-2">{n.author}</p>
        </li>
      ))}
    </ul>
  )
}

function ActivityTab({ context }: { context: ChatContextSnapshot }) {
  if (context.activity.length === 0) return <p className="text-sm text-text-2">Sin actividad reciente.</p>
  return (
    <ul className="flex flex-col gap-4">
      {context.activity.map((a) => (
        <li key={a.id} className="flex gap-3">
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-purple" />
          <div className="min-w-0">
            <p className="text-sm">{a.text}</p>
            <p className="text-xs text-text-2">{formatRelative(a.at)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
