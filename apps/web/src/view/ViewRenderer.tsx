// VIEW_RENDERER_V2 — monta el componente React que corresponde al ViewSpec.
// El original usaba tmpl.kind y tmpl.component, pero findTemplate devuelve un
// componente React, no un objeto con metadatos. Nunca renderizaba nada.
import { findTemplate } from "../templates/registry.ts";
import type { ViewSpec } from "./spec.ts";
import { FallbackView } from "./fallback.tsx";

export function ViewRenderer({ spec }: { spec: ViewSpec }) {
  const Template = findTemplate(spec) as
    | React.ComponentType<{ spec: ViewSpec }>
    | undefined;
  if (!Template) return <FallbackView spec={spec} />;
  return <Template spec={spec} />;
}