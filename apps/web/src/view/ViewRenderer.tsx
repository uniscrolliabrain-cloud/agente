// VIEW_RENDERER_V1 - recibe ViewSpec, busca template, monta
import { findTemplate } from "../templates/registry.ts";
import type { ViewSpec } from "./spec.ts";
import { FallbackView } from "./fallback.tsx";
export function ViewRenderer({spec}:{spec:ViewSpec}){
 const tmpl=findTemplate(spec);
 if(!tmpl)return <FallbackView spec={spec} />;
 return <div data-view={spec.id} data-template={tmpl.kind}>{spec.title} - {tmpl.component}</div>;
}