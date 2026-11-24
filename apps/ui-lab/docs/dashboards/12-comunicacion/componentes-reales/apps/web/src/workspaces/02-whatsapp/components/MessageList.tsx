// CHAT_MESSAGE_LIST_V1
import { Fragment, useEffect, useRef } from "react"
import { dayKey, formatDayLabel } from "../format.ts"
import { MessageBubble } from "./MessageBubble.tsx"
import type { ChatMessage } from "../types.ts"

type Props = { messages: ChatMessage[]; showAuthors: boolean; className?: string }

export function MessageList({ messages, showAuthors, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const prevCount = useRef(0)
  const lastText = messages[messages.length - 1]?.text

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const countChanged = prevCount.current !== messages.length
    prevCount.current = messages.length
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160
    if (countChanged || nearBottom) el.scrollTop = el.scrollHeight
  }, [messages.length, lastText])

  return (
    <div ref={ref} className={`flex flex-col gap-3 px-5 py-4 ${className}`}>
      {messages.length === 0 && <p className="m-auto text-sm text-text-2">Sin mensajes todavia.</p>}
      {messages.map((m, i) => {
        const newDay = i === 0 || dayKey(m.createdAt) !== dayKey(messages[i - 1].createdAt)
        return (
          <Fragment key={m.id}>
            {newDay && (
              <div className="mx-auto shrink-0 rounded-full border border-border px-3 py-1 text-xs text-text-2">
                {formatDayLabel(m.createdAt)}
              </div>
            )}
            <MessageBubble message={m} showAuthor={showAuthors} />
          </Fragment>
        )
      })}
    </div>
  )
}
