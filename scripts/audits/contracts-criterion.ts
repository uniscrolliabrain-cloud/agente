// CONTRACTS_CRITERION_V2 - las funciones puras que deciden si un contrato se usa.
//
// CONTRACTS_CRITERION_SEPARATION_V1 - viven aparte de `contracts.ts` para que el
// test las pueda importar sin ejecutar la auditoria (el script llama a `main()`
// al cargarse) y para que el criterio se pueda leer en 60 lineas sin el ruido
// de recorrer el arbol de ficheros.
//
// El criterio viejo era "el nombre aparece literalmente en otro fichero", y eso
// producia dos falsos positivos medidos en docs/INFORME-CONTRATOS.md:
//   - 74 contratos usados dentro de SU PROPIO modulo (p. ej. `actorKindSchema`
//     dentro de `agentActorSchema`) contaban como huerfanos, porque el fichero
//     declarante se excluia entero.
//   - 1 contrato usado solo en `tests/` contaba como huerfano, porque los tests
//     no se recorrian.
// Lo que se mide ahora es USO, no mencion: una linea que contiene el nombre,
// no es la linea de declaracion y no es un comentario.

export type ContractKind = "schema" | "interface" | "type" | "enum";

export interface DeclaredContract {
  name: string;
  kind: ContractKind;
}

/** Escapa un identificador para meterlo en un RegExp. */
export function escapeName(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Extrae los contratos exportados de un fichero del dominio.
 * Detecta:
 *   export const fooSchema = z.object({...})      -> schema
 *   export const FOO = z.enum([...])               -> enum
 *   export interface Foo {...}                      -> interface
 *   export type Foo = ...                           -> type
 */
export function extractDeclarations(source: string): DeclaredContract[] {
  const out: DeclaredContract[] = [];
  const seen = new Set<string>();
  const push = (name: string, kind: ContractKind): void => {
    if (seen.has(name)) return;
    seen.add(name);
    out.push({ name, kind });
  };

  for (const match of source.matchAll(/export\s+const\s+(\w+Schema)\s*=\s*z\./g)) {
    push(match[1], "schema");
  }
  for (const match of source.matchAll(/export\s+const\s+(\w+(?:Types|Enum|_TYPES)?)\s*=\s*z\.enum\(/g)) {
    push(match[1], "enum");
  }
  for (const match of source.matchAll(/export\s+interface\s+(\w+)/g)) {
    push(match[1], "interface");
  }
  for (const match of source.matchAll(/export\s+type\s+(\w+)\s*=/g)) {
    push(match[1], "type");
  }
  return out;
}

/**
 * CONTRACTS_ALIAS_INFER_V1 - un schema Zod se consume a traves de su tipo
 * inferido (`export type X = z.infer<typeof xSchema>`). Sin resolver el alias,
 * un schema usado solo por su tipo contaba como huerfano.
 *
 * Devuelve `schemaName -> aliasName`.
 */
export function inferredAliases(source: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /export\s+type\s+(\w+)\s*=\s*z\.infer<typeof\s+(\w+)>/g;
  for (const match of source.matchAll(re)) {
    out.set(match[2], match[1]);
  }
  return out;
}

const isCommentLine = (line: string): boolean => /^\s*(\/\/|\*|\/\*)/.test(line);

/** true si la linea es la declaracion `export type X = ...`, `const X = ...`, etc. */
export function isDeclarationLine(line: string, name: string): boolean {
  const re = new RegExp(
    `^\\s*(?:export\\s+)?(?:declare\\s+)?(?:default\\s+)?(?:const|let|var|type|interface|enum|class|function|abstract\\s+class)\\s+${escapeName(name)}\\b`,
  );
  return re.test(line);
}

export interface UsageCount {
  /** Apariciones en la linea de declaracion (normalmente 1). */
  declarations: number;
  /** Apariciones en lineas de codigo que NO son la declaracion. */
  uses: number;
}

/**
 * Cuenta apariciones reales de `name` en `source`:
 *   - ignora lineas de comentario (`//`, `*`, `/*`)
 *   - separa las apariciones de la linea de declaracion del resto
 *
 * `uses > 0` significa "este contrato se usa aqui", no solo "esta escrito".
 */
export function countUsage(name: string, source: string): UsageCount {
  const wordRe = new RegExp(`\\b${escapeName(name)}\\b`, "g");
  let declarations = 0;
  let uses = 0;
  for (const line of source.split("\n")) {
    if (isCommentLine(line)) continue;
    const matches = line.match(wordRe);
    if (!matches) continue;
    if (isDeclarationLine(line, name)) declarations += matches.length;
    else uses += matches.length;
  }
  return { declarations, uses };
}

/** Bucket de un contrato. Solo `orphan` bloquea el gate. */
export type UsageBucket =
  /** Se usa en otro modulo de apps/ o packages/ (lo que el audit siempre quiso medir). */
  | "code"
  /** Se usa solo dentro de su propio modulo: es parte del contrato exportado. */
  | "self"
  /** Se usa solo en tests o scripts. */
  | "harness"
  /** No se usa en ninguna parte: superficie declarada y sin consumidor. */
  | "orphan";

export interface ContractUsage {
  name: string;
  alias?: string;
  bucket: UsageBucket;
  codeHits: string[];
  selfUsed: boolean;
  harnessHits: string[];
}

export interface UsageSources {
  /** ficheros de apps/ y packages/, por ruta absoluta. */
  code: Map<string, string>;
  /** ficheros de tests/ y scripts/, por ruta absoluta. */
  harness: Map<string, string>;
}

/**
 * Decide el bucket de un contrato. `ownFile` es la ruta absoluta del fichero
 * que lo declara y se evalua aparte: dentro de el, se cuentan usos (no la
 * declaracion), y fuera, cualquier aparicion vale.
 */
export function classifyContract(
  name: string,
  ownFile: string,
  sources: UsageSources,
  alias?: string,
): ContractUsage {
  const names = alias ? [name, alias] : [name];

  let selfUsed = false;
  const ownSource = sources.code.get(ownFile) ?? sources.harness.get(ownFile);
  if (ownSource) {
    for (const n of names) {
      const own = countUsage(n, ownSource);
      // Un alias declarado en el propio modulo no cuenta como uso por si mismo;
      // `countUsage` ya lo separa, pero si el alias se declara aqui y se usa
      // fuera, el uso externo se mide en el otro fichero.
      if (own.uses > 0) selfUsed = true;
    }
  }

  const codeHits: string[] = [];
  for (const [file, source] of sources.code) {
    if (file === ownFile) continue;
    if (names.some((n) => countUsage(n, source).uses > 0)) codeHits.push(file);
  }

  const harnessHits: string[] = [];
  for (const [file, source] of sources.harness) {
    if (file === ownFile) continue;
    if (names.some((n) => countUsage(n, source).uses > 0)) harnessHits.push(file);
  }

  const bucket: UsageBucket =
    codeHits.length > 0
      ? "code"
      : selfUsed
        ? "self"
        : harnessHits.length > 0
          ? "harness"
          : "orphan";

  return { name, ...(alias ? { alias } : {}), bucket, codeHits, selfUsed, harnessHits };
}
