import { z } from "zod";
import { AppError } from "./errors.ts";

const conversationMessageSchema = z.object({
  id: z.string().min(1).max(200),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const submittedMessageSchema = conversationMessageSchema.extend({ role: z.literal("user") });
type ConversationMessage = z.infer<typeof conversationMessageSchema>;

export function buildConversationInput(
  storedMessages: readonly unknown[],
  submittedMessages: readonly unknown[],
): ConversationMessage[] {
  // Older clients still send their full history. Only their last message is
  // the new turn. Every preceding message comes from the authorized thread.
  const current = submittedMessageSchema.parse(submittedMessages.at(-1));
  const history: ConversationMessage[] = [];
  const seen = new Set<string>([current.id]);
  let bytes = Buffer.byteLength(JSON.stringify(current), "utf8") + 2;

  for (const stored of storedMessages) {
    if (typeof stored === "object" && stored !== null && "id" in stored && stored.id === current.id) {
      throw new AppError("This message is already in the thread", 409);
    }
  }

  // Match the existing Cognition V2 input limits. Keep a contiguous recent
  // window of valid messages instead of skipping a large recent turn.
  for (let i = storedMessages.length - 1; i >= 0 && history.length < 99; i--) {
    const result = conversationMessageSchema.safeParse(storedMessages[i]);
    if (!result.success || seen.has(result.data.id)) continue;
    const size = Buffer.byteLength(JSON.stringify(result.data), "utf8") + 1;
    if (bytes + size > 24_000) break;
    history.push(result.data);
    seen.add(result.data.id);
    bytes += size;
  }

  return [...history.reverse(), current];
}
