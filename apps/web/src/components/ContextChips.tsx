// CONTEXT_CHIPS_V1 - chips contextuales cuando el sistema no sabe que quiere el usuario
export function ContextChips({options,onPick}:{options:string[],onPick:(o:string)=>void}){
 return <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{options.map(o=><button key={o} onClick={()=>onPick(o)} style={{padding:"6px 10px",borderRadius:20,border:"1px solid #ccc"}}>{o}</button>)}</div>;
}