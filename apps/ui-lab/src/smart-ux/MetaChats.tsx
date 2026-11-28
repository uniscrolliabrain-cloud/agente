import {useEffect,useRef,useState,type PointerEvent as RP} from "react";
import {ChevronDown,MessageSquare,MoreHorizontal,Pin} from "lucide-react";
import {useOrderedList} from "./useOrderedList";
import {OrderAnnounce,OrderGhost} from "./OrderGhost";
import "./meta-chats.css";
export type MetaChat={id:string;title:string;preview?:string};
type Props={namespace:string;items:MetaChat[];active:string|null;onSelect:(id:string)=>void;onRename:(id:string,title:string)=>void;onNew?:()=>void};
function read<T,>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||"null")??fallback}catch{return fallback}}
export default function MetaChats({namespace,items,active,onSelect,onRename,onNew}:Props){
 const key=namespace+"_chats_v1";
 const [height,setHeight]=useState(()=>read(key+"_height",180));
 const [pins,setPins]=useState<string[]>(()=>read(key+"_pins",[]));
 const [assigned,setAssigned]=useState<Record<string,string>>(()=>read(key+"_assigned",{}));
 const [open,setOpen]=useState(true);
 const [menu,setMenu]=useState<{id:string;top:number;left:number}|null>(null);
 const [rename,setRename]=useState<string|null>(null);
 const [draft,setDraft]=useState("");
 const root=useRef<HTMLDivElement>(null);
 const cleanup=useRef<()=>void>(()=>{});
 // CHATS_ORDER_V1 - el mismo gesto que en la app: pulsación larga para
 // reordenar y triple clic para subir una conversación arriba.
 const order=useOrderedList({ids:items.map(i=>i.id),storageKey:key+"_order",tripleClickToTop:true});
 useEffect(()=>()=>cleanup.current(),[]);
 useEffect(()=>{try{localStorage.setItem(key+"_height",JSON.stringify(height));localStorage.setItem(key+"_pins",JSON.stringify(pins));localStorage.setItem(key+"_assigned",JSON.stringify(assigned))}catch{}},[key,height,pins,assigned]);
 useEffect(()=>{if(!menu)return;const close=(e:KeyboardEvent)=>{if(e.key==="Escape"){e.stopPropagation();setMenu(null)}};window.addEventListener("keydown",close,true);return()=>window.removeEventListener("keydown",close,true)},[menu]);
 const max=()=>Math.max(100,(root.current?.parentElement?.clientHeight??500)-180);
 const resize=(e:RP<HTMLDivElement>)=>{e.preventDefault();cleanup.current();const y=e.clientY,h=height;const move=(p:PointerEvent)=>setHeight(Math.min(max(),Math.max(100,h+y-p.clientY)));const end=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",end);window.removeEventListener("pointercancel",end);window.removeEventListener("blur",end)};cleanup.current=end;window.addEventListener("pointermove",move);window.addEventListener("pointerup",end);window.addEventListener("pointercancel",end);window.addEventListener("blur",end)};
 // Los fijados siguen arriba; dentro de cada grupo manda el orden guardado.
 const ordered=[...order.sortList(items)].sort((a,b)=>Number(pins.includes(b.id))-Number(pins.includes(a.id)));
 const item=items.find(i=>i.id===menu?.id);
 return <div className="meta-chats" ref={root} style={{height:open?height:undefined,maxHeight:"55%"}}>
 {open&&<div className="v2-chats-handle" role="separator" aria-label="Altura de Chats" aria-orientation="horizontal" aria-valuemin={100} aria-valuenow={height} tabIndex={0} onPointerDown={resize} onKeyDown={e=>{if(["ArrowUp","ArrowDown","Home","End"].includes(e.key)){e.preventDefault();setHeight(h=>Math.min(max(),Math.max(100,e.key==="Home"?100:e.key==="End"?max():h+(e.key==="ArrowUp"?24:-24))))}}}><span/></div>}
 <button className="meta-chats-head" onClick={()=>setOpen(v=>!v)} aria-expanded={open}><MessageSquare size={13}/> Chats <small>{items.length}</small><ChevronDown size={13}/></button>
 {open&&<div className="meta-chats-list">{ordered.map(i=><div className="meta-chat-row" data-active={active===i.id||undefined} key={i.id}>{rename===i.id?<form onSubmit={e=>{e.preventDefault();if(draft.trim())onRename(i.id,draft.trim());setRename(null)}}><input autoFocus aria-label="Nombre de conversación" value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Escape"){e.stopPropagation();setRename(null)}}}/></form>:<button className="meta-chat-select" {...order.bindRow(i.id,i.title)} onClick={()=>{if(order.onRowClick(i.id))return;onSelect(i.id)}}>{pins.includes(i.id)&&<Pin size={11}/>}<span><b>{i.title}</b><small>{assigned[i.id]?"Asignación demo: "+assigned[i.id]:i.preview}</small></span></button>}<button className="meta-chat-more" aria-label={"Opciones de "+i.title} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setMenu({id:i.id,left:Math.max(8,Math.min(r.left,window.innerWidth-232)),top:Math.max(8,Math.min(r.bottom,window.innerHeight-340))})}}><MoreHorizontal size={15}/></button></div>)}{onNew&&<button className="meta-chat-new" onClick={onNew}>+ Nueva conversación</button>}</div>}
 {menu&&item&&<><button className="conv-menu-backdrop" aria-label="Cerrar menú" onClick={()=>setMenu(null)}/><div className="conv-menu" role="menu" style={{top:menu.top,left:menu.left}}><button className="conv-menu-item" role="menuitem" onClick={()=>{setDraft(item.title);setRename(item.id);setMenu(null)}}>Renombrar</button><button className="conv-menu-item" role="menuitem" onClick={()=>{setPins(p=>p.includes(item.id)?p.filter(x=>x!==item.id):[item.id,...p]);setMenu(null)}}><Pin size={12}/>{pins.includes(item.id)?"Desfijar de Chats":"Fijar en Chats"}</button>{[["Enviar a una persona","Owner","Colaborador demo"],["Enviar a un agente","LAIA","Marcos","Antonio"]].map(([label,...names])=><div key={label}><div className="conv-menu-label">{label} · demo</div>{names.map(name=><button key={name} className="conv-menu-item" role="menuitem" onClick={()=>{setAssigned(a=>({...a,[item.id]:name}));setMenu(null)}}>{name}</button>)}</div>)}</div></>}
 <OrderGhost drag={order.drag}/>
 <OrderAnnounce text={order.announce}/>
 </div>
}
