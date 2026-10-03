// D2_VIEWRESOLVER_V2 - intenciones cerradas + validacion Zod.
import { parseViewSpec, type ViewSpec } from "@openmuse/domain/views";

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

export async function resolveView(owner: string, text: string): Promise<ViewSpec | null> {
  const t = normalize(text);
  for (const { re, build } of INTENTS) {
    if (re.test(t)) {
      return parseViewSpec(await build(owner));
    }
  }
  return null;
}

// D2_VIEWRESOLVER_CLEAR_V1 - reset para tests.
export function clearIntents(): void {
  INTENTS.length = 0;
}