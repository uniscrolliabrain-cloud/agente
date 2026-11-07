// AUDIT_REGISTRY_V1 - la unica lista de auditorias del repo.
//
// AUDIT_REGISTRY_ONE_LIST_V1 - antes habia tres listas distintas: la de
// `ci.yml` (seis audits a mano), la de `deploy.yml` (via `audit:coherence`) y la
// que un dev corria por su cuenta. Este fichero es la unica; `coherence.ts` y
// `gate-report.ts` la importan, asi que no pueden divergir.
//
// `blocking` no es decorativo: dice si el exit code de la auditoria debe tumbar
// el gate.
//   - `blocking: true`  -> el script llama a `process.exit(1)` cuando encuentra
//                          algo. Si no lo hace, el check es decorativo y se
//                          arregla el script (ver AUDIT_LAYERS_EXIT_V1).
//   - `blocking: false` -> el script cuenta algo y lo publica, pero no falla
//                          (hoy solo `console`, con 24 ocurrencias preexistentes
//                          de `console.*` en el server). Aparece en el resumen y
//                          en el JSON como advisory; no se esconde.
//
// `proves` es la evidencia de por que ese valor de `blocking` es el real, no el
// que nos gustaria: la linea del script que decide.
//
// `captures` / `pairs` extraen los contadores que el propio audit imprime en su
// ultima linea. No se inventan numeros: si la linea no aparece, no hay contador.

export interface AuditCheck {
  /** Nombre corto, el que sale en el resumen y en el JSON. */
  name: string;
  /** Fichero dentro de scripts/audits/. */
  file: string;
  /** Si su exit code debe tumbar el gate. */
  blocking: boolean;
  /** Por que ese `blocking` es el real (fichero:linea de la decision). */
  proves: string;
  /** Contadores: N grupos de captura de un unico match. */
  captures?: { keys: string[]; re: RegExp };
  /** Contadores: clave=grupo1, valor=grupo2, repetido (global). */
  pairs?: RegExp;
}

export const AUDIT_CHECKS: readonly AuditCheck[] = [
  {
    name: "layers",
    file: "layers.ts",
    blocking: true,
    proves: "layers.ts — marca AUDIT_LAYERS_EXIT_V1: `if (hits.length > 0) process.exit(1)`",
    captures: { keys: ["violaciones"], re: /(\d+) violaciones/ },
  },
  {
    name: "bridges",
    file: "bridges.ts",
    blocking: true,
    proves: "bridges.ts — `if (wired < BRIDGES.length) process.exit(1)`",
    captures: { keys: ["wired", "total"], re: /(\d+)\/(\d+) wired/ },
  },
  {
    name: "console",
    file: "no-console.ts",
    blocking: false,
    proves: "no-console.ts — marca AUDIT_CONSOLE_ADVISORY_V1: imprime el recuento y termina sin exit 1",
    captures: { keys: ["ocurrencias", "ficheros"], re: /(\d+) ocurrencias en (\d+) ficheros/ },
  },
  {
    name: "anchors",
    file: "anchors.ts",
    blocking: true,
    proves: "anchors.ts — `if (missing.length > 0) process.exit(1)`",
    captures: { keys: ["ok", "rotos"], re: /OK: (\d+)\s+ROTOS: (\d+)/ },
  },
  {
    name: "contracts",
    file: "contracts.ts",
    blocking: true,
    proves: "contracts.ts — `if (missing.length > 0) process.exit(1)`",
    captures: { keys: ["implementados", "pending", "huerfanos"], re: /OK: (\d+)\s+PENDING: (\d+)\s+HUERFANOS: (\d+)/ },
  },
  {
    name: "idempotency",
    file: "idempotency.ts",
    blocking: true,
    // IDEMPOTENCY_MARKS_V2 - duplicadas/repetidas son indice (una campana se
    // aplica en N call sites). Bloquean solo los defectos sin revisar: marca sin
    // codigo detras y mismo bloque pegado dos veces.
    proves: "idempotency.ts — `if (blocking > 0) process.exit(1)`",
    captures: {
      keys: ["duplicadas", "huerfanas", "repetidas"],
      re: /DUPLICADAS: (\d+)\s+HUERFANAS: (\d+)\s+REPETIDAS: (\d+)/,
    },
  },
  {
    name: "tenant-default",
    file: "tenant-default.ts",
    blocking: true,
    proves: "tenant-default.ts — `if (forbidden.length > 0) process.exit(1)`",
    captures: { keys: ["permitidas", "prohibidas"], re: /PERMITIDAS: (\d+)\s+PROHIBIDAS: (\d+)/ },
  },
] as const;

/** Directorio donde los audits escriben su informe (fuera de `docs/`). */
export const AUDIT_REPORT_DIR_ENV = "AUDIT_REPORT_DIR";
