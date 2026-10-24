// CHAT_WORKSPACE_V1
import "./ChatWorkspace.css"
import { useMemo, useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { useChatWorkspace } from "../hooks/useChatWorkspace.ts"
import { Composer } from "./Composer.tsx"
import { ContextPanel } from "./ContextPanel.tsx"
import { MessageList } from "./MessageList.tsx"
import { ThreadFilters, filterThreads } from "./ThreadFilters.tsx"
import { ThreadHeader } from "./ThreadHeader.tsx"
import { ThreadList } from "./ThreadList.tsx"
import { ThreadSearch } from "./ThreadSearch.tsx"
import type { ChatFilter } from "../types.ts"

export function ChatWorkspace() {
  const {
    threads,
    activeThread,
    activeThreadId,
    messages,
    context,
    contextPanelOpen,
    contextTab,
    coauthorMode,
    isStreaming,
    selectThread,
    toggleContextPanel,
    setContextTab,
    setCoauthorMode,
    send,
  } = useChatWorkspace()

  const [filter, setFilter] = useState<ChatFilter>("all")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"list" | "thread">("list")

  const visible = useMemo(() => filterThreads(threads, filter, query), [threads, filter, query])

  const onSelect = (id: string) => {
    selectThread(id)
    setView("thread")
  }

  return (
    <div className="chat-workspace flex h-full overflow-hidden bg-bg-card text-text">
      <aside
        className={`${view === "thread" ? "hidden" : "flex w-full"} min-h-0 shrink-0 flex-col border-r border-border md:flex md:w-[340px]`}
      >
        <div className="flex shrink-0 flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">AGNTia OS</h1>
              <span className="rounded-md bg-purple-soft px-2 py-0.5 text-xs font-medium text-purple">Simple</span>
            </div>
            <button type="button" aria-label="Mas opciones" className="text-text-2 hover:text-text">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <ThreadSearch value={query} onChange={setQuery} />
          <ThreadFilters value={filter} onChange={setFilter} />
        </div>
        <ThreadList
          className="min-h-0 flex-1 overflow-y-auto"
          threads={visible}
          activeId={activeThreadId ?? ""}
          onSelect={onSelect}
        />
      </aside>

      <main className={`${view === "list" ? "hidden" : "flex"} min-h-0 min-w-0 flex-1 flex-col md:flex`}>
        {activeThread ? (
          <>
            <ThreadHeader
              thread={activeThread}
              contextOpen={contextPanelOpen}
              onToggleContext={toggleContextPanel}
              onBack={() => setView("list")}
              className="shrink-0"
            />
            <MessageList
              messages={messages}
              showAuthors={activeThread.kind === "group"}
              className="min-h-0 flex-1 overflow-y-auto"
            />
            <Composer
              key={activeThread.id}
              name={activeThread.name}
              coauthorMode={coauthorMode}
              onCoauthorChange={setCoauthorMode}
              streaming={isStreaming}
              onSend={(text) => void send(text)}
              className="shrink-0"
            />
          </>
        ) : (
          <p className="m-auto text-sm text-text-2">Cargando conversaciones...</p>
        )}
      </main>

      <aside
        aria-label="Detalle del chat"
        className={`${contextPanelOpen ? "flex" : "hidden"} fixed inset-y-0 right-0 z-20 w-80 max-w-full shrink-0 flex-col border-l border-border bg-bg-card min-[1120px]:static min-[1120px]:z-auto`}
      >
        {activeThread && (
          <ContextPanel
            thread={activeThread}
            context={context}
            tab={contextTab}
            onTabChange={setContextTab}
            onClose={toggleContextPanel}
          />
        )}
      </aside>
    </div>
  )
}
