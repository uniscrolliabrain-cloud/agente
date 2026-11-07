import type { BusinessGraph } from "../business/graph.ts";

type EntityReference = {
  reference: string;
  type: string;
  publicUrl: string;
};

export type EntityReferenceResolution =
  | { kind: "resolved"; entityId: string }
  | { kind: "clarify"; question: string }
  | { kind: "missing" };

const normalizeName = (name: string) =>
  name.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();

/** Resolve against the caller's authorized graph. The URL is an identifier, never fetched. */
export async function resolveEntityReference(
  graph: Pick<BusinessGraph, "getEntity" | "listEntities">,
  owner: string,
  input: EntityReference,
): Promise<EntityReferenceResolution> {
  const reference = input.reference.trim();
  if (!reference) return { kind: "missing" };

  if (reference.startsWith("/") || /^[a-z][a-z\d+.-]*:/i.test(reference)) {
    let entityId: string;
    try {
      const base = new URL(input.publicUrl);
      const url = new URL(reference, base);
      const path = /^\/api\/business\/entities\/([^/]+)$/.exec(url.pathname);
      if (!path || url.origin !== base.origin || url.username || url.password) {
        return { kind: "missing" };
      }
      entityId = decodeURIComponent(path[1]!);
      if (!entityId || entityId.length > 200) return { kind: "missing" };
    } catch {
      return { kind: "missing" };
    }

    const entity = await graph.getEntity(owner, entityId);
    return entity?.type === input.type
      ? { kind: "resolved", entityId: entity.id }
      : { kind: "missing" };
  }

  const name = normalizeName(reference);
  const matches = (await graph.listEntities(owner, input.type))
    .filter((entity) => normalizeName(entity.name) === name);
  if (matches.length > 1) {
    return { kind: "clarify", question: "Hay varias entidades con ese nombre. ¿Puedes compartir el enlace de la que quieres consultar?" };
  }
  return matches[0]
    ? { kind: "resolved", entityId: matches[0].id }
    : { kind: "missing" };
}
