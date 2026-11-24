import {FileText,Image,Film,Music,Archive,Link as LinkIcon,ChevronLeft,ChevronRight} from "lucide-react";
import {pathOf,size,type Doc,type Folder} from "./model";
export function DocumentPreview({doc,folders,previous,next}:{doc:Doc;folders:Folder[];previous?:()=>void;next?:()=>void}){
 const title=doc.name.replace(/\.[^.]+$/,""),kind=doc.kind.toLowerCase();
 const media=["png","jpg","jpeg","webp","gif","svg"].includes(kind)?Image:["mp4","mov","webm"].includes(kind)?Film:["mp3","wav","ogg"].includes(kind)?Music:["zip","rar","7z"].includes(kind)?Archive:kind==="url"?LinkIcon:null;
 const local=doc.body.startsWith("Archivo local:");
 const lines=doc.body.split("\n");
 return <><div className="dx-reader-heading"><small>{kind.toUpperCase()} · Vista de demostración</small><h2>{doc.name}</h2><div className="dx-reader-nav"><button disabled={!previous} onClick={previous} aria-label="Documento anterior"><ChevronLeft size={18}/></button><button disabled={!next} onClick={next} aria-label="Documento siguiente"><ChevronRight size={18}/></button></div></div>
 <div className={"dx-preview-paper dx-preview-"+kind}>
 {local?<div className="dx-media-placeholder"><FileText size={42}/><p>Solo metadatos del archivo local en esta demo.</p></div>:kind==="xlsx"||kind==="csv"?<><h3>{title}</h3><table className="dx-sheet-table"><thead><tr><th>Concepto</th><th>Previsto</th><th>Real</th></tr></thead><tbody>{["Operaciones","Servicios","Administración"].map((s,i)=><tr key={s}><td>{s}</td><td>{1200+i*450} €</td><td>{1100+i*420} €</td></tr>)}</tbody></table><small>Valores ficticios</small></>:kind==="pptx"?<div className="dx-slide-preview"><small>Diapositiva de ejemplo</small><h3>{title}</h3><p>{doc.body}</p></div>:media?<div className="dx-media-placeholder">{(()=>{const Icon=media;return <Icon size={48}/>})()}<h3>{title}</h3><p>Vista de formato · contenido multimedia no disponible en esta demo.</p></div>:kind==="txt"?<pre>{doc.body}</pre>:<><h3>{title}</h3>{lines.map((line,i)=><p key={i}>{line}</p>)}{kind==="pdf"&&<small className="dx-page-number">Página 1 · muestra sintética</small>}</>}
 </div><div className="dx-reader-meta"><span>Autor: {doc.author}</span><span>{pathOf(doc.folder,folders).map(f=>f.name).join(" / ")}</span><span>{size(doc.bytes)}</span></div><small>Lectura simulada · UI Lab</small></>;
}
