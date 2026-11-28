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

/** Expand AG-UI compact text chunks while rebuilding the same public contract. */
export class PublicTextStream {
  private chunkId?: string;
  push(event: BaseEvent): BaseEvent[] {
    if (event.type === EventType.TEXT_MESSAGE_CHUNK) {
      if ("role" in event && event.role !== undefined && event.role !== "assistant") throw Error("INVALID_PUBLIC_TEXT_EVENT");
      const id = "messageId" in event && event.messageId !== undefined ? event.messageId : this.chunkId;
      const start = publicTextEvent({ type: EventType.TEXT_MESSAGE_START, messageId: id, role: "assistant" } as BaseEvent)!;
      const content = "delta" in event && event.delta !== undefined && event.delta !== ""
        ? publicTextEvent({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: id, delta: event.delta } as BaseEvent) : null;
      const out: BaseEvent[] = [];
      if (id !== this.chunkId) {
        out.push(...this.finish(), start);
        this.chunkId = id as string;
      }
      if (content) out.push(content);
      return out;
    }
    const safe = publicTextEvent(event);
    if (!safe) return [];
    if (safe.type === EventType.TEXT_MESSAGE_START) return [...this.finish(), safe];
    if (safe.type === EventType.TEXT_MESSAGE_END && this.chunkId) {
      if (!("messageId" in safe) || safe.messageId !== this.chunkId) throw Error("INVALID_PUBLIC_TEXT_EVENT");
      this.chunkId = undefined;
    }
    return [safe];
  }
  finish(): BaseEvent[] {
    if (!this.chunkId) return [];
    const end = { type: EventType.TEXT_MESSAGE_END, messageId: this.chunkId };
    this.chunkId = undefined;
    return [end];
  }
}
