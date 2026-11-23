import { AsyncLocalStorage } from "node:async_hooks";

type PersistTurn = (assistant: { id: string; content: string; timestamp: string }) => Promise<void>;

const turnPersistence = new AsyncLocalStorage<PersistTurn>();

export function withConversationTurnPersistence<T>(persist: PersistTurn, run: () => T): T {
  return turnPersistence.run(persist, run);
}

export function currentConversationTurnPersistence(): PersistTurn | undefined {
  return turnPersistence.getStore();
}
