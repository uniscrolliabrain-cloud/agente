// Application budgets in UTF-16 code units, checked on the emitted text.
const channelLimits = {
  panel: 1200,
  email: 4000,
  whatsapp: 1024,
  voice: 600,
} as const;

type FixedCardChannel = keyof typeof channelLimits;

interface RenderableCard {
  mode: "fixed" | "guided";
  status: "draft" | "approved" | "retired";
  channels: readonly FixedCardChannel[];
  requiredFacts: readonly string[];
  template: string;
  missingFactScript: string;
  fallback: "explain_missing" | "ask" | "escalate";
}

const slotPattern = /\{\{([a-zA-Z][a-zA-Z0-9_-]*)\}\}/g;

const htmlEscapes: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const plainEscapes: Record<string, string> = {
  "*": "＊",
  "_": "＿",
  "~": "～",
  "`": "｀",
  "<": "＜",
  ">": "＞",
};

export function renderFixedCard(
  card: RenderableCard,
  channel: FixedCardChannel,
  facts: Readonly<Record<string, unknown>>,
) {
  if (card.mode !== "fixed" || card.status !== "approved" ||
      !Object.hasOwn(channelLimits, channel) || !card.channels.includes(channel)) {
    throw new Error("Expected an approved fixed card for the requested channel");
  }

  if (!card.template.trim()) throw new Error("An approved fixed card requires a template");

  const limit = channelLimits[channel];
  const html = channel === "panel" || channel === "email";
  const required = new Set(card.requiredFacts);
  const templateWithoutSlots = card.template.replace(slotPattern, (_match, name: string) => {
    if (!required.has(name)) throw new Error(`Undeclared fixed card slot: ${name}`);
    return "";
  });
  if (/\{\{|\}\}/.test(templateWithoutSlots)) throw new Error("Invalid fixed card slot syntax");

  const values = new Map<string, string>();
  const missing: string[] = [];
  for (const name of required) {
    const value = Object.hasOwn(facts, name) ? facts[name] : undefined;
    if (value == null || (typeof value === "string" && value.trim() === "")) {
      missing.push(name);
      continue;
    }
    if (typeof value !== "string" && typeof value !== "boolean" &&
        !(typeof value === "number" && Number.isFinite(value))) {
      throw new TypeError(`Invalid fixed card fact: ${name}`);
    }
    const text = String(value);
    if (text.length > limit || /[\p{Cc}\u2028\u2029\u202a-\u202e\u2066-\u2069]/u.test(text)) {
      throw new RangeError(`Invalid fixed card slot text: ${name}`);
    }
    values.set(name, channel === "whatsapp"
      ? text.replace(/[*_~`<>]/g, (char) => plainEscapes[char])
      : text);
  }

  const substituted = missing.length > 0
    ? card.missingFactScript
    : card.template.replace(slotPattern, (_match, name: string) => values.get(name)!);
  const text = html
    ? substituted.replace(/[&<>"']/g, (char) => htmlEscapes[char])
    : channel === "voice"
      ? substituted.replace(/[<>]/g, (char) => plainEscapes[char])
      : substituted;
  if (text.length > limit) throw new RangeError(`Fixed card exceeds the ${channel} limit of ${limit}`);

  const format = html ? "html-text" as const : "plain-text" as const;
  return missing.length > 0
    ? { status: "missing-facts" as const, format, text, missing, fallback: card.fallback }
    : { status: "rendered" as const, format, text };
}
