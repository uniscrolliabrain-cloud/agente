type CardScope = {
  id: string;
  status: "draft" | "approved" | "retired";
  locale: string;
  channels: readonly string[];
  roleIds: readonly string[];
  intents: readonly string[];
  sopIds: readonly string[];
  states: readonly string[];
  priority: number;
};

/** Selection only requires the routing fields of the published revision. */
type CardRevision = { tenantId: string; card: CardScope };

export type CardMatch = {
  tenantId: string;
  locale: string;
  channel: string;
  roleId: string;
  intent: string;
  sopId?: string;
  state?: string;
};

export class CardPriorityConflict extends Error {
  constructor(firstId: string, secondId: string) {
    super(`Las tarjetas ${firstId} y ${secondId} tienen la misma prioridad para un caso común.`);
    this.name = "CardPriorityConflict";
  }
}

function matchesOptional(values: readonly string[], value: string | undefined): boolean {
  return values.length === 0 || (value !== undefined && values.includes(value));
}

export function selectCard<T extends CardRevision>(active: readonly T[], match: CardMatch): T | undefined {
  const matches = active.filter(({ tenantId, card }) =>
    tenantId === match.tenantId &&
    card.status === "approved" &&
    card.locale === match.locale &&
    card.channels.includes(match.channel) &&
    card.roleIds.includes(match.roleId) &&
    card.intents.includes(match.intent) &&
    matchesOptional(card.sopIds, match.sopId) &&
    matchesOptional(card.states, match.state)
  ).sort((left, right) => right.card.priority - left.card.priority);

  const [first, second] = matches;
  if (first && second && first.card.priority === second.card.priority) {
    throw new CardPriorityConflict(first.card.id, second.card.id);
  }
  return first;
}

function intersects(left: readonly string[], right: readonly string[]): boolean {
  return left.some((value) => right.includes(value));
}

function overlapsOptional(left: readonly string[], right: readonly string[]): boolean {
  return left.length === 0 || right.length === 0 || intersects(left, right);
}

/** Call before writing an approved revision against the tenant's current active set. */
export function assertCardPublicationUnambiguous(
  active: readonly CardRevision[],
  candidate: CardRevision,
): void {
  const card = candidate.card;
  const conflict = active.find(({ tenantId, card: other }) =>
    tenantId === candidate.tenantId &&
    other.id !== card.id &&
    other.status === "approved" &&
    other.locale === card.locale &&
    other.priority === card.priority &&
    intersects(other.channels, card.channels) &&
    intersects(other.roleIds, card.roleIds) &&
    intersects(other.intents, card.intents) &&
    overlapsOptional(other.sopIds, card.sopIds) &&
    overlapsOptional(other.states, card.states)
  );
  if (conflict) throw new CardPriorityConflict(card.id, conflict.card.id);
}
