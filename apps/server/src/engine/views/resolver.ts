// FIX_02_RESOLVER_V3 - usa RuntimeViewSpec para no colisionar con workspace-spec.
import { parseRuntimeViewSpec, type RuntimeViewSpec } from "@openmuse/domain/views";

export type ViewBuilder = (owner: string) => Promise<unknown>;

interface Intent {
  re: RegExp;
  build: ViewBuilder;
}

const INTENTS: Intent[] = [];

export function registerIntent(re: RegExp, build: ViewBuilder): void {
  INTENTS.push({ re, build });
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export async function resolveView(owner: string, text: string): Promise<RuntimeViewSpec | null> {
  const t = normalize(text);
  for (const { re, build } of INTENTS) {
    if (re.test(t)) {
      return parseRuntimeViewSpec(await build(owner));
    }
  }
  return null;
}

export function clearIntents(): void {
  INTENTS.length = 0;
}