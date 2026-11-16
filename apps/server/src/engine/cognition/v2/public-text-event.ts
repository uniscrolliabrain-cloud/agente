import { EventType, type BaseEvent } from "@ag-ui/core";

/** Provider events are untrusted. Only minimal assistant text may cross to clients. */
export function publicTextEvent(event: BaseEvent): BaseEvent | null {
  if (event.type !== EventType.TEXT_MESSAGE_START && event.type !== EventType.TEXT_MESSAGE_CONTENT && event.type !== EventType.TEXT_MESSAGE_END) return null;
  if (!("messageId" in event) || typeof event.messageId !== "string" || !event.messageId || event.messageId.length > 1024) throw Error("INVALID_PUBLIC_TEXT_EVENT");
  // Rebuild rather than forward: rawEvent, metadata and arbitrary fields can contain private reasoning.
  if (event.type === EventType.TEXT_MESSAGE_START) {
    if (!("role" in event) || event.role !== "assistant") throw Error("INVALID_PUBLIC_TEXT_EVENT");
    return { type: EventType.TEXT_MESSAGE_START, messageId: event.messageId, role: "assistant" };
  }
  if (event.type === EventType.TEXT_MESSAGE_END) return { type: EventType.TEXT_MESSAGE_END, messageId: event.messageId };
  if (!("delta" in event) || typeof event.delta !== "string" || !event.delta || event.delta.length > 16000) throw Error("INVALID_PUBLIC_TEXT_EVENT");
  return { type: EventType.TEXT_MESSAGE_CONTENT, messageId: event.messageId, delta: event.delta };
}
