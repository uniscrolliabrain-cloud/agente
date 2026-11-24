import {useMemo,useState} from "react";
import {folders as seed,initialDocs,normalize,pathOf,type Doc,type Folder} from "./model";
export function useExplorer(){
const [folders,setFolders]=useState(seed),[docs,setDocs]=useState(initialDocs),[location,setLocation]=useState<string|null>(null),[scope,setScope]=useState("home"),[query,setQuery]=useState(""),[view,setView]=useState<"grid"|"list">("grid"),[sort,setSort]=useState("recent"),[author,setAuthor]=useState(""),[kind,setKind]=useState(""),[preview,setPreview]=useState<string|null>(null),[trash,setTrash]=useState<Doc[]>([]);
const [history,setHistory]=useState<{id:string|null;scope:string}[]>([]),[future,setFuture]=useState<{id:string|null;scope:string}[]>([]);
const go=(id:string|null,next="home")=>{setLocation(id);setScope(next);setQuery("");setAuthor("");setKind("");setPreview(null);};
const navigate=(id:string|null,next="home")=>{if(id===location&&next===scope)return;setHistory(h=>[...h,{id:location,scope}]);setFuture([]);go(id,next);};
const back=()=>{const p=history.at(-1);if(p){setHistory(h=>h.slice(0,-1));setFuture(f=>[{id:location,scope},...f]);go(p.id,p.scope);}};
const forward=()=>{const p=future[0];if(p){setFuture(f=>f.slice(1));setHistory(h=>[...h,{id:location,scope}]);go(p.id,p.scope);}};
const visible=useMemo(()=>{const q=normalize(query.trim());return (scope==="trash"?trash:docs).filter(d=>(!location||d.folder===location||(!!q&&pathOf(d.folder,folders).some(f=>f.id===location)))&& (scope!=="favorites"||d.favorite)&&(scope!=="shared"||d.shared)&&(!author||d.author===author)&&(!kind||d.kind===kind)&&(!q||normalize(d.name+" "+d.body+" "+pathOf(d.folder,folders).map(f=>f.name).join(" ")).includes(q))).sort((a,b)=>sort==="name"?a.name.localeCompare(b.name,"es"):sort==="size"?b.bytes-a.bytes:b.modified.localeCompare(a.modified));},[docs,trash,scope,location,query,author,kind,sort,folders]);
const children=folders.filter(f=>(query.trim()?(!location||pathOf(f.id,folders).some(p=>p.id===location))&&normalize(f.name).includes(normalize(query.trim())):f.parent===location)&&scope==="home");
const patch=(id:string,change:Partial<Doc>)=>setDocs(ds=>ds.map(d=>d.id===id?{...d,...change}:d));
const remove=(id:string)=>{const d=docs.find(x=>x.id===id);if(d){setTrash(t=>[...t,d]);setDocs(ds=>ds.filter(x=>x.id!==id));setPreview(null);}};
const restore=(id:string)=>{const d=trash.find(x=>x.id===id);if(d){setDocs(ds=>[...ds,d]);setTrash(t=>t.filter(x=>x.id!==id));}};
const addFolder=(name:string)=>{if(name.trim())setFolders(fs=>[...fs,{id:crypto.randomUUID(),name:name.trim(),parent:location,icon:"empresa"} satisfies Folder]);};
const addFiles=(files:FileList)=>{const destination=location??"f0";setDocs(ds=>[...ds,...Array.from(files).map(f=>({id:crypto.randomUUID(),name:f.name,folder:destination,author:"Empleado humano",kind:f.name.split(".").pop()?.toLowerCase()||"txt",bytes:f.size,modified:new Date().toISOString(),favorite:false,shared:false,body:"Archivo local: solo metadatos en esta demo."}))]);};
return {back,forward,canBack:history.length>0,canForward:future.length>0,folders,docs,location,scope,query,setQuery,view,setView,sort,setSort,author,setAuthor,kind,setKind,preview,setPreview,visible,children,navigate,patch,remove,restore,addFolder,addFiles};}
export type Explorer=ReturnType<typeof useExplorer>;
