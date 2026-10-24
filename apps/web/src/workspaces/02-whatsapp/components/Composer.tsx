// CHAT_COMPOSER_V1
import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { Paperclip, Send, Sparkles } from "lucide-react"

type Props = {
  name: string
  coauthorMode: boolean
  onCoauthorChange: (on: boolean) => void
  streaming: boolean
  onSend: (text: string) => void
  className?: string
}

export function Composer({ name, coauthorMode, onCoauthorChange, streaming, onSend, className = "" }: Props) {
  const [text, setText] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)
  const canSend = text.trim().length > 0 && !streaming

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }, [text])

  const submit = () => {
    const value = text.trim()
    if (!value || streaming) return
    onSend(value)
    setText("")
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className={`border-t border-border p-4 ${className}`}>
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-bg-card p-2 focus-within:border-purple">
        <button
          type="button"
          aria-label="Adjuntar archivo"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-text-2 transition-colors hover:text-text"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <textarea
          id="composer-input"
          ref={ref}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={streaming ? "AGNTia esta respondiendo..." : `Mensaje a ${name}...`}
          className="max-h-32 min-h-9 min-w-0 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-text-2"
        />
        <button
          type="button"
          aria-label="Enviar mensaje"
          disabled={!canSend}
          onClick={submit}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple text-white transition-opacity disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 px-1 text-xs text-text-2">
        <button
          type="button"
          role="switch"
          aria-checked={coauthorMode}
          onClick={() => onCoauthorChange(!coauthorMode)}
          className={`flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-medium transition-colors ${
            coauthorMode ? "border-purple bg-purplesoft text-accent" : "border-border hover:text-text"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Coautor AGNTia
        </button>
        <span className="hidden items-center gap-3 sm:flex">
          <span>Enter para enviar - Shift+Enter salto</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            Encriptado
          </span>
        </span>
      </div>
    </div>
  )
}
