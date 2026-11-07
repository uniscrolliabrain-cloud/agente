export interface PublishedCard<Card> {
  readonly tenantId: string;
  readonly card: Card;
  readonly approvedBy: string;
  readonly approvedAt: string;
  readonly contentHash: string;
}
