 import type { FormSpec } from "./spec.ts";
 export default function FormRenderer({ spec }: { spec: FormSpec }) {
   return <form className="space-y-3">{spec.fields.map(f=><div key={f.key}><label className="text-xs text-zinc-600">{f.label}</label><input className="mt-1 w-full rounded-lg border p-2 text-sm" placeholder={f.label} /></div>)}<button type="button" className="rounded-lg bg-black text-white px-4 py-2 text-sm">Guardar</button></form>;
 }