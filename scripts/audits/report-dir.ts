// AUDIT_REPORT_DIR_V1 - donde escribe su informe cada auditoria.
//
// Antes cada audit hacia `writeFile("docs/AUDIT_X.md")` a pelo, asi que correr
// los siete ensuciaba el worktree con ~2.000 lineas de informes generados y la
// copia versionada siempre estaba desfasada (docs/kernel/ guarda otra del
// 2026-10-03). Regla 6 de la campana: lo generado no se versiona.
//
// El destino por defecto es `artifacts/gate/audits/`, que ya esta en
// `.gitignore:7`, tanto si lo invoca `pnpm gate` como si alguien corre
// `pnpm audit:layers` a mano: un informe generado no vuelve a `docs/`.
// `AUDIT_REPORT_DIR` existe como override (el `--only` del gate y los tests
// apuntan ahi).
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { AUDIT_REPORT_DIR_ENV } from "./registry.ts";

/** Ruta completa del informe de un audit, creando el directorio si hace falta. */
export function auditReportPath(fileName: string): string {
  const base = process.env[AUDIT_REPORT_DIR_ENV]?.trim() || join("artifacts", "gate", "audits");
  const target = join(base, fileName);
  mkdirSync(dirname(target), { recursive: true });
  return target;
}
