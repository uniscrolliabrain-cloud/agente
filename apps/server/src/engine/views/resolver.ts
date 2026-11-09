// FIX_02_RESOLVER_V3 - usa RuntimeViewSpec para no colisionar con workspace-spec.
// VIEW_RESOLVER_CLASS_V1 - antes INTENTS era un array global mutable. Dos
// requests concurrentes que llamaran a clearIntents() rompian el resolver
// para todos. Ahora es una clase instanciable; el array vive por instancia.
// La funcion `resolveView` de modulo sigue existiendo por compatibilidad
// con los sitios que ya la importaban, y delega en una instancia singleton.
// VIEW_RESOLVER_BUILDABLE_IMPORT_V1 - antes importaba "@agente/domain/views",
// que solo existe como alias de tsconfig (packages/domain no es un paquete npm).
// tsc emite el especificador tal cual y `node dist/...` moria con
// ERR_MODULE_NOT_FOUND al arrancar: el artefacto de produccion (Docker/Fly) no
// levantaba. El resto del repo ya importa el dominio por ruta relativa.
import { parseRuntimeViewSpec, type RuntimeViewSpec } from "../../../../../packages/domain/src/views.ts";

export type ViewBuilder = (owner: string) => Promise<unknown>;

interface Intent {
  re: RegExp;
  build: ViewBuilder;
}

export class ViewResolver {
  private readonly intents: Intent[] = [];

  register(re: RegExp, build: ViewBuilder): void {
    this.intents.push({ re, build });
  }

  clear(): void {
    this.intents.length = 0;
  }

  async resolve(owner: string, text: string): Promise<RuntimeViewSpec | null> {
    const t = normalize(text);
    for (const { re, build } of this.intents) {
      if (re.test(t)) {
        return parseRuntimeViewSpec(await build(owner));
      }
    }
    return null;
  }
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Compatibilidad: instancia unica por proceso para el resolver global legacy.
const legacy = new ViewResolver();

export function registerIntent(re: RegExp, build: ViewBuilder): void {
  legacy.register(re, build);
}

export async function resolveView(owner: string, text: string): Promise<RuntimeViewSpec | null> {
  return legacy.resolve(owner, text);
}

export function clearIntents(): void {
  legacy.clear();
}