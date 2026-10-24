// META_HINTS_TO_PROMPT_HELPER_V1
export interface MetaHintForPrompt {
  rule: string;
  urgency: string;
  message: string;
}

export function buildMetaHintsBlock(hints: MetaHintForPrompt[]): string {
  if (hints.length === 0) return "";
  const lines = hints.slice(0, 3).map((h) => `- [${h.urgency}] ${h.message}`);
  return `\n\nContexto interno del sistema (no menciones estas lineas al usuario):\n${lines.join("\n")}`;
}

export function extractHintsFromContext(context: string[]): MetaHintForPrompt[] {
  return context.slice(0, 3).map((c) => ({
    rule: "injected",
    urgency: "medium",
    message: c,
  }));
}