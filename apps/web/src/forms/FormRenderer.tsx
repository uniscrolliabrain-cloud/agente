// FORM_RENDERER_V1 - monta form pre-relleno
import type { FormSpec } from "./spec.ts";
import { ProvenanceChip } from "./provenance.tsx";
export function FormRenderer({spec}:{spec:FormSpec}){
 return <form data-form={spec.id}><h3>{spec.title}</h3>{spec.fields.map(f=><div key={f.key}><label>{f.label} <ProvenanceChip kind={f.provenance}/></label><input defaultValue={String(f.value??"")} /></div>)}<button>{spec.submitIntent||"Guardar"}</button></form>;
}