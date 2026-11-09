// NODE_REF_V1 - identidad canonica de los nodos que comparten atencion,
// contexto, grafo de negocio y grafo cognitivo.
//
// Antes cada capa hablaba de "nodos" con su propio vocabulario: el LLM
// escribia texto libre en attention.matched[].node, el grafo de negocio usaba
// ids de entidad y el contexto comparaba con substring. Eso hacia que dos
// autores que hablaban de la misma entidad no se reconocieran.
//
// Un NodeRef es `kind:id` (por ejemplo `entity:acme`). Los textos sin prefijo
// se aceptan como `unknown` para no romper datos antiguos, pero la comparacion
// usa el id normalizado.

import { z } from "zod";

export const nodeKindSchema = z.enum([
  "entity",
  "task",
  "sop",
  "action",
  "event",
  "thought",
  "turn",
  "persona",
  "role",
  "document",
  "memory",
  "unknown",
]);

export type NodeKind = z.infer<typeof nodeKindSchema>;

export const nodeRefSchema = z.object({
  kind: nodeKindSchema,
  id: z.string().min(1).max(300),
});

export interface NodeRef {
  kind: NodeKind;
  id: string;
  raw: string;
}

const KNOWN_KINDS = new Set<string>(nodeKindSchema.options);

/** Normaliza mayusculas, acentos y espacios sin perder el prefijo `kind:`. */
export function canonicalNode(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** Separa `entity:acme` en `{ kind: "entity", id: "acme" }`. */
export function parseNodeRef(input: string): NodeRef {
  const raw = canonicalNode(input);
  const separator = raw.indexOf(":");
  if (separator > 0) {
    const prefix = raw.slice(0, separator);
    const id = raw.slice(separator + 1).trim();
    if (id.length > 0 && KNOWN_KINDS.has(prefix)) {
      return { kind: prefix as NodeKind, id, raw };
    }
  }
  return { kind: "unknown", id: raw, raw };
}

/**
 * Dos nodos son el mismo si comparten kind e id. Si alguno no trae prefijo,
 * se comparan por id para que `ACME` y `entity:acme` se reconozcan.
 */
export function sameNode(a: string, b: string): boolean {
  const left = parseNodeRef(a);
  const right = parseNodeRef(b);
  if (left.kind !== "unknown" && right.kind !== "unknown") {
    return left.kind === right.kind && left.id === right.id;
  }
  return left.id === right.id;
}

/**
 * Comprueba si un texto libre menciona un nodo. Se usa en el boost de
 * contexto: el nodo puede aparecer como `entity:acme` o como su id `acme`.
 * Los ids de menos de 3 caracteres se ignoran para no generar falsos positivos.
 */
export function nodeMentions(text: string, node: string): boolean {
  const haystack = canonicalNode(text);
  const ref = parseNodeRef(node);
  if (ref.id.length < 3) return false;
  if (haystack.includes(ref.raw)) return true;
  return haystack.includes(ref.id);
}
