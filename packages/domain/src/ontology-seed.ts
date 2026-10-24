// ONTOLOGY_SEED_V1 - vocabulario base del kernel.

export const BASE_VOCABULARY = {
  entities: ["actor", "user", "agent", "tool", "resource", "goal", "event"],
  relations: ["uses", "accesses", "governs", "requires", "belongs_to", "triggers"],
  capabilities: ["read", "write", "execute_tool", "approve", "plan", "reason"],
} as const;

export type BaseVocabulary = typeof BASE_VOCABULARY;