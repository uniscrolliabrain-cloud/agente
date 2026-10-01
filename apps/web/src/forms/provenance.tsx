// PROVENANCE_V1 - chips procedencia
export function ProvenanceChip({kind}:{kind?:string}){
 const map:any={ "auto.alta":"auto·alta","auto.media":"auto·media", sugerido:"sugerido", tu:"tú" };
 if(!kind)return null;
 return <span data-provenance={kind} style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:"#eee"}}>{map[kind]||kind}</span>;
}