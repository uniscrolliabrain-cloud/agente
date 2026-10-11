// CHAT_API_V1
// Mock en memoria (Lucia / Alfonso / Marta / AGNTia).
// Cada funcion conserva la firma que tendra la API real.

import type {
  ChatContextSnapshot,
  ChatMessage,
  ChatRole,
  ChatStreamEvent,
  ChatThread,
} from "./types.ts"

const OWNER_NAME = "Alfonso"

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()
const wait = <T>(value: T, ms = 120) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))

const threadStore = new Map<string, ChatThread>()
const messageStore = new Map<string, ChatMessage[]>()

function addThread(t: Omit<ChatThread, "preview" | "lastMessageAt">) {
  threadStore.set(t.id, { ...t, preview: "", lastMessageAt: new Date(0).toISOString() })
  messageStore.set(t.id, [])
}

function seed(threadId: string, role: ChatRole, authorName: string, text: string, ago: number) {
  const list = messageStore.get(threadId)!
  list.push({
    id: `${threadId}-${list.length + 1}`,
    threadId,
    role,
    authorName,
    text,
    createdAt: minutesAgo(ago),
  })
}

function previewOf(m: ChatMessage, kind: ChatThread["kind"]): string {
  if (m.role === "owner") return `Tu: ${m.text}`
  if (kind === "group" && m.role !== "system") return `${m.authorName}: ${m.text}`
  return m.text
}

function refreshThread(id: string) {
  const t = threadStore.get(id)
  const list = messageStore.get(id)
  if (!t || !list || list.length === 0) return
  const last = list[list.length - 1]
  threadStore.set(id, { ...t, preview: previewOf(last, t.kind), lastMessageAt: last.createdAt })
}

addThread({ id: "0001", name: "Lucia", initial: "L", color: "#6C5CD6", kind: "direct", subtitle: "Producto - Equipo", tag: "Linear", unread: 2, online: true, archived: false })
addThread({ id: "0002", name: "Marta", initial: "M", color: "#FF7A59", kind: "direct", subtitle: "Cliente - Pyme", tag: "Propuesta", unread: 1, online: false, archived: false })
addThread({ id: "0003", name: "AGNTia", initial: "A", color: "#0EA5A4", kind: "agent", subtitle: "Agente - Asistente", tag: "Agente", unread: 0, online: true, archived: false })
addThread({ id: "0004", name: "Operaciones", initial: "O", color: "#6B7280", kind: "group", subtitle: "Grupo - Equipo", tag: "AGNTia", unread: 1, online: true, archived: false })
addThread({ id: "0005", name: "Cierre Q3", initial: "C", color: "#F59E0B", kind: "group", subtitle: "Grupo - Archivado", tag: "Q3", unread: 0, online: false, archived: true })

seed("0001", "employee", "Lucia", "Te paso manana el flujo de onboarding con los 3 pasos.", 1560)
seed("0001", "owner", OWNER_NAME, "Perfecto, lo reviso a primera hora.", 1550)
seed("0001", "employee", "Lucia", "Ya subi el flujo de onboarding, echale un ojo cuando puedas.", 135)
seed("0001", "owner", OWNER_NAME, "Lo veo ahora. Quitaste el modal de bienvenida?", 134)
seed("0001", "employee", "Lucia", "Si, directo al grano. Todo visible con scroll, sin cortes.", 133)
seed("0001", "system", "Sistema", "Lucia adjunto onboarding-flow-v2.fig", 131)
seed("0001", "owner", OWNER_NAME, "Perfecto. Reviso los estados vacios y te escribo.", 128)
seed("0001", "employee", "Lucia", "Va. Los deje en el mismo archivo de Figma.", 120)

seed("0002", "client", "Marta", "Hola Alfonso, podeis enviarme la propuesta actualizada?", 1500)
seed("0002", "owner", OWNER_NAME, "Claro, te la mando hoy antes de las 12.", 1488)
seed("0002", "client", "Marta", "Gracias. Incluye tambien la integracion con el correo?", 60)

seed("0003", "agent", "AGNTia", "Resumen diario: 18 tareas, 4 bloqueadas, 2 vencen hoy.", 400)
seed("0003", "owner", OWNER_NAME, "Cuales son las bloqueadas?", 395)
seed("0003", "agent", "AGNTia", "Tres esperan revision de diseno y una depende de la API de pagos.", 394)

seed("0004", "system", "Sistema", "Alfonso creo el grupo", 2900)
seed("0004", "employee", "Lucia", "Recordatorio: cierre de mes el viernes.", 300)
seed("0004", "agent", "AGNTia", "He preparado la lista de pendientes para el cierre.", 299)
seed("0004", "owner", OWNER_NAME, "Gracias, la reviso esta tarde.", 240)

seed("0005", "owner", OWNER_NAME, "Cerramos Q3 con todos los entregables.", 8000)

for (const id of threadStore.keys()) refreshThread(id)

const contexts: Record<string, ChatContextSnapshot> = {
  "0001": {
    threadId: "0001",
    email: "lucia@agntia.os",
    location: "Madrid - GMT+2",
    hours: "09:00 - 18:00",
    files: [
      { id: "f1", name: "onboarding-flow-v2.fig", size: "2.4 MB", addedAt: minutesAgo(131) },
      { id: "f2", name: "onboarding-copy.md", size: "12 KB", addedAt: minutesAgo(180) },
    ],
    notes: [
      { id: "n1", text: "Revisar los estados vacios antes del viernes.", author: OWNER_NAME },
      { id: "n2", text: "Pendiente pasar el flujo a revision de codigo.", author: "Lucia" },
    ],
    activity: [
      { id: "a1", text: "Subio onboarding-flow-v2.fig", at: minutesAgo(131) },
      { id: "a2", text: "Cambio el flujo a 3 pasos", at: minutesAgo(135) },
    ],
  },
  "0002": {
    threadId: "0002",
    email: "marta@pyme-demo.es",
    location: "Valencia - GMT+2",
    hours: "10:00 - 19:00",
    files: [{ id: "f1", name: "propuesta-v2.pdf", size: "380 KB", addedAt: minutesAgo(4000) }],
    notes: [{ id: "n1", text: "Pidio modulo de documentos.", author: OWNER_NAME }],
    activity: [{ id: "a1", text: "Pregunto por la integracion con el correo", at: minutesAgo(60) }],
  },
  "0003": {
    threadId: "0003",
    email: "agente@agntia.os",
    location: "Nube - siempre activo",
    hours: "24/7",
    files: [{ id: "f1", name: "resumen-diario.md", size: "3 KB", addedAt: minutesAgo(400) }],
    notes: [],
    activity: [{ id: "a1", text: "Genero el resumen diario", at: minutesAgo(400) }],
  },
  "0004": {
    threadId: "0004",
    email: "operaciones@agntia.os",
    location: "Equipo - remoto",
    hours: "09:00 - 18:00",
    files: [],
    notes: [{ id: "n1", text: "Cierre de mes el viernes.", author: "Lucia" }],
    activity: [{ id: "a1", text: "AGNTia preparo la lista de pendientes", at: minutesAgo(299) }],
  },
  "0005": {
    threadId: "0005",
    email: "q3@agntia.os",
    location: "Equipo - remoto",
    hours: "09:00 - 18:00",
    files: [],
    notes: [],
    activity: [],
  },
}

type StreamHandler = (event: ChatStreamEvent) => void
const listeners = new Map<string, Set<StreamHandler>>()

function emit(threadId: string, event: ChatStreamEvent) {
  listeners.get(threadId)?.forEach((handler) => handler(event))
}

function bumpUnread(threadId: string) {
  const t = threadStore.get(threadId)
  if (t) threadStore.set(threadId, { ...t, unread: t.unread + 1 })
}

function streamAgentReply(threadId: string, userText: string) {
  const thread = threadStore.get(threadId)
  const short = userText.length > 40 ? `${userText.slice(0, 40)}...` : userText
  const reply =
    thread?.kind === "agent"
      ? `Entendido. Reviso "${short}" y te dejo un resumen con lo que afecta a las tareas abiertas.`
      : "Sugerencia de AGNTia: confirma el plazo, adjunta el documento y deja claro quien valida el siguiente paso."
  const id = `${threadId}-a-${Date.now().toString(36)}`

  setTimeout(() => {
    const draft: ChatMessage = {
      id,
      threadId,
      role: "agent",
      authorName: "AGNTia",
      text: "",
      createdAt: new Date().toISOString(),
      streaming: true,
    }
    emit(threadId, { type: "start", message: draft })

    const chunks = reply.split(/(?<=\s)/)
    let i = 0
    const timer = setInterval(() => {
      if (i < chunks.length) {
        emit(threadId, { type: "token", messageId: id, delta: chunks[i++] })
        return
      }
      clearInterval(timer)
      const done: ChatMessage = { ...draft, text: reply, streaming: false }
      messageStore.get(threadId)?.push(done)
      if ((listeners.get(threadId)?.size ?? 0) === 0) bumpUnread(threadId)
      refreshThread(threadId)
      emit(threadId, { type: "end", message: done })
    }, 45)
  }, 500)
}

export async function listThreads(): Promise<ChatThread[]> {
  const all = [...threadStore.values()]
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt))
    .map((t) => ({ ...t }))
  return wait(all)
}

export async function getThread(id: string): Promise<ChatThread | null> {
  const t = threadStore.get(id)
  return wait(t ? { ...t } : null)
}

export async function listMessages(threadId: string): Promise<ChatMessage[]> {
  const t = threadStore.get(threadId)
  if (t && t.unread > 0) threadStore.set(threadId, { ...t, unread: 0 })
  return wait((messageStore.get(threadId) ?? []).map((m) => ({ ...m })))
}

export async function sendMessage(
  threadId: string,
  text: string,
  opts: { coauthor?: boolean } = {},
): Promise<ChatMessage> {
  const thread = threadStore.get(threadId)
  const list = messageStore.get(threadId)
  if (!thread || !list) throw new Error(`Hilo ${threadId} no encontrado`)

  const message: ChatMessage = {
    id: `${threadId}-${list.length + 1}`,
    threadId,
    role: "owner",
    authorName: OWNER_NAME,
    text,
    createdAt: new Date().toISOString(),
  }
  list.push(message)
  refreshThread(threadId)

  if (thread.kind === "agent" || opts.coauthor) streamAgentReply(threadId, text)
  return wait({ ...message }, 80)
}

export async function getContext(threadId: string): Promise<ChatContextSnapshot> {
  const ctx = contexts[threadId]
  if (!ctx) throw new Error(`Sin contexto para el hilo ${threadId}`)
  return wait({ ...ctx })
}

export function subscribeStream(threadId: string, handler: StreamHandler): () => void {
  const set = listeners.get(threadId) ?? new Set<StreamHandler>()
  listeners.set(threadId, set)
  set.add(handler)
  return () => {
    set.delete(handler)
  }
}
