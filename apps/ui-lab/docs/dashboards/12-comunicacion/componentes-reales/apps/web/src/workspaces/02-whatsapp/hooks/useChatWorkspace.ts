// CHAT_HOOK_V1
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getContext, listMessages, listThreads, sendMessage, subscribeStream } from "../api.ts"
import type {
  ChatContextSnapshot,
  ChatContextTab,
  ChatMessage,
  ChatThread,
} from "../types.ts"

export type ChatWorkspaceState = {
  threads: ChatThread[]
  activeThreadId: string | null
  activeThread: ChatThread | null
  messages: ChatMessage[]
  context: ChatContextSnapshot | null
  contextPanelOpen: boolean
  contextTab: ChatContextTab
  coauthorMode: boolean
  isStreaming: boolean
  selectThread: (id: string) => void
  toggleContextPanel: () => void
  setContextTab: (tab: ChatContextTab) => void
  setCoauthorMode: (on: boolean) => void
  send: (text: string) => Promise<void>
}

const isWideScreen = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 1120px)").matches

export function useChatWorkspace(): ChatWorkspaceState {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [context, setContext] = useState<ChatContextSnapshot | null>(null)
  const [contextPanelOpen, setContextPanelOpen] = useState(isWideScreen)
  const [contextTab, setContextTab] = useState<ChatContextTab>("info")
  const [coauthorMode, setCoauthorMode] = useState(false)

  const activeRef = useRef<string | null>(null)
  activeRef.current = activeThreadId

  const refreshThreads = useCallback(async () => {
    setThreads(await listThreads())
  }, [])

  useEffect(() => {
    let cancelled = false
    listThreads().then((ts) => {
      if (cancelled) return
      setThreads(ts)
      setActiveThreadId((prev) => prev ?? ts.find((t) => !t.archived)?.id ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!activeThreadId) return
    let cancelled = false
    setMessages([])
    setContext(null)

    Promise.all([listMessages(activeThreadId), getContext(activeThreadId)]).then(([msgs, ctx]) => {
      if (cancelled) return
      setMessages(msgs)
      setContext(ctx)
      void refreshThreads()
    })

    const unsubscribe = subscribeStream(activeThreadId, (event) => {
      if (event.type === "start") {
        setMessages((prev) =>
          prev.some((m) => m.id === event.message.id) ? prev : [...prev, event.message],
        )
      } else if (event.type === "token") {
        setMessages((prev) =>
          prev.map((m) => (m.id === event.messageId ? { ...m, text: m.text + event.delta } : m)),
        )
      } else {
        setMessages((prev) =>
          prev.some((m) => m.id === event.message.id)
            ? prev.map((m) => (m.id === event.message.id ? event.message : m))
            : [...prev, event.message],
        )
        void refreshThreads()
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [activeThreadId, refreshThreads])

  const selectThread = useCallback((id: string) => setActiveThreadId(id), [])
  const toggleContextPanel = useCallback(() => setContextPanelOpen((open) => !open), [])

  const send = useCallback(
    async (text: string) => {
      const threadId = activeRef.current
      if (!threadId) return
      const message = await sendMessage(threadId, text, { coauthor: coauthorMode })
      if (activeRef.current === message.threadId) setMessages((prev) => [...prev, message])
      void refreshThreads()
    },
    [coauthorMode, refreshThreads],
  )

  return useMemo<ChatWorkspaceState>(
    () => ({
      threads,
      activeThreadId,
      activeThread: threads.find((t) => t.id === activeThreadId) ?? null,
      messages,
      context,
      contextPanelOpen,
      contextTab,
      coauthorMode,
      isStreaming: messages.some((m) => m.streaming),
      selectThread,
      toggleContextPanel,
      setContextTab,
      setCoauthorMode,
      send,
    }),
    [
      threads,
      activeThreadId,
      messages,
      context,
      contextPanelOpen,
      contextTab,
      coauthorMode,
      selectThread,
      toggleContextPanel,
      send,
    ],
  )
}
