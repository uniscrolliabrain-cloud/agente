 export interface FormField { key: string; label: string; type: "text"|"number"|"date"|"select"|"textarea"; required?: boolean; options?: string[]; }
 export interface FormSpec { id: string; title: string; fields: FormField[]; provenance: string; }
 export type ProvenanceKind = "auto" | "alta" | "media" | "sugerido" | "tu";