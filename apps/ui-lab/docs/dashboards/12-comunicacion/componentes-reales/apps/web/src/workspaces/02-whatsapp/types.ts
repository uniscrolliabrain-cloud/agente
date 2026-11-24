// CHAT_UI_TYPES_V1

export type ChatRole = "owner" | "employee" | "client" | "agent" | "system"

export type ChatFilter = "all" | "unread" | "groups" | "archived"

export type ChatContextTab = "info" | "files" | "notes" | "activity"

export type ChatThreadKind = "direct" | "group" | "agent"

export type ChatThread = {
  id: string
  name: string
  initial: string
  color: string
  kind: ChatThreadKind
  subtitle: string
  tag: string
  preview: string
  lastMessageAt: string
  unread: number
  online: boolean
  archived: boolean
}

export type ChatMessage = {
  id: string
  threadId: string
  role: ChatRole
  authorName: string
  text: string
  createdAt: string
  streaming?: boolean
}

export type ChatFile = { id: string; name: string; size: string; addedAt: string }
export type ChatNote = { id: string; text: string; author: string }
export type ChatActivity = { id: string; text: string; at: string }

export type ChatContextSnapshot = {
  threadId: string
  email: string
  location: string
  hours: string
  files: ChatFile[]
  notes: ChatNote[]
  activity: ChatActivity[]
}

export type ChatStreamEvent =
  | { type: "start"; message: ChatMessage }
  | { type: "token"; messageId: string; delta: string }
  | { type: "end"; message: ChatMessage }
