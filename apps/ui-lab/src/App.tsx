import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, ChevronDown, Code2, ExternalLink, Maximize2, Monitor, RotateCcw, Search, Smartphone, Tablet, X } from "lucide-react";
import { previews } from "./registry";
type Device="mobile"|"tablet"|"desktop"|"fluid";
const widths:Record<Device,number|undefined>={mobile:390,tablet:768,desktop:1440,fluid:undefined};
class PreviewBoundary extends Component<{children:ReactNode},{error:string|null}> {
  state={error:null as string|null};
  static getDerivedStateFromError(error:Error){return {error:error.message};}
  render(){return this.state.error?<div className="lab-failure"><h2>No se pudo renderizar esta vista</h2><p>{this.state.error}</p><p>Puede depender de un proveedor de datos o del shell de producción. No se ha sustituido por un mock inventado.</p></div>:this.props.children;}
}
export default function App(){
 const [active,setActive]=useState(()=>new URLSearchParams(location.search).get("view")||"knowledge");
 const [device,setDevice]=useState<Device>("mobile");
 const [query,setQuery]=useState("");
 const [zoom,setZoom]=useState(100);
 const [key,setKey]=useState(0);
 const [full,setFull]=useState(false);
 const item=previews.find(p=>p.id===active)??previews[0];
 const filtered=useMemo(()=>previews.filter(p=>(p.name+" "+p.category).toLowerCase().includes(query.toLowerCase())),[query]);
 const select=(id:string)=>{setActive(id);setKey(k=>k+1);history.replaceState(null,"","?view="+encodeURIComponent(id));};
 useEffect(()=>{document.title="AgntiaPro UI Lab · "+item.name;},[item.name]);
 const Preview=item.Component;
 if(new URLSearchParams(location.search).has("embed")) return <div className="lab-embed"><div className="lab-preview-badge">UI LAB · {item.status==="api"?"API NO CONECTADA":item.status==="fixture"?"DATOS FICTICIOS":"DEMO"}</div><PreviewBoundary><Suspense fallback={<div className="lab-loading">Cargando componente real…</div>}><Preview/></Suspense></PreviewBoundary></div>;
 return <div className={"lab-root "+(full?"lab-full":"")}>
  <aside className="lab-sidebar" aria-label="Catálogo de pantallas">
    <div className="lab-brand"><span className="lab-brand-mark">A<span>.</span></span><div><strong>AgntiaPro</strong><small>UI LAB · PREVIEW</small></div></div>
    <label className="lab-search"><Search size={16}/><input placeholder="Buscar pantallas…" value={query} onChange={e=>setQuery(e.target.value)} aria-label="Buscar pantallas"/></label>
    <nav>{["Público","Trabajo","Canales","Componentes"].map(group=><div key={group} className="lab-group"><p>{group}</p>{filtered.filter(p=>p.category===group).map(p=><button key={p.id} className={p.id===item.id?"lab-nav-item active":"lab-nav-item"} onClick={()=>select(p.id)}><span>{p.name}</span><span className={"lab-status "+p.status} title={p.status==="api"?"Requiere API":p.status==="fixture"?"Datos ficticios":"Demo interna"}/></button>)}</div>)}</nav>
    <div className="lab-sidebar-footer"><Code2 size={15}/> Componentes reales del monorepo <br/> Datos de demostración · sin producción</div>
  </aside>
  <section className="lab-stage">
    <header className="lab-topbar">
      <div className="lab-title"><span className="lab-kicker">VISTA PREVIA</span><h1>{item.name}</h1><small>{item.description}</small></div>
      <div className="lab-actions">
        <div className="lab-devices" role="group" aria-label="Tamaño de pantalla">
          {([{id:"mobile",Icon:Smartphone,label:"Móvil"},{id:"tablet",Icon:Tablet,label:"Tablet"},{id:"desktop",Icon:Monitor,label:"PC"},{id:"fluid",Icon:ChevronDown,label:"Fluido"}] as const).map(({id,Icon,label})=><button key={id} title={label} aria-label={label} aria-pressed={device===id} className={device===id?"active":""} onClick={()=>setDevice(id)}><Icon size={17}/></button>)}
        </div>
        <select aria-label="Zoom" value={zoom} onChange={e=>setZoom(Number(e.target.value))}>{[50,75,90,100].map(z=><option value={z} key={z}>{z}%</option>)}</select>
        <button title="Recargar componente" aria-label="Recargar componente" onClick={()=>setKey(k=>k+1)}><RotateCcw size={17}/></button>
        <button title={full?"Salir de pantalla completa":"Pantalla completa"} aria-label={full?"Salir de pantalla completa":"Pantalla completa"} onClick={()=>setFull(f=>!f)}>{full?<X size={17}/>:<Maximize2 size={17}/>}</button>
      </div>
    </header>
    <div className="lab-canvas">
      <div className="lab-viewport-wrap" style={{width:widths[device]?Math.min(widths[device]!,Math.max(320,window.innerWidth-32))*zoom/100:"100%",maxWidth:"100%"}}>
        <iframe key={item.id+"-"+key+"-"+device} title={"Vista "+item.name} className="lab-frame"
          style={{width:widths[device]??"100%",height:device==="desktop"?900:850,transform:widths[device]?`scale(${zoom/100})`:undefined,transformOrigin:"top left"}}
          src={"/?embed=1&view="+encodeURIComponent(item.id)} sandbox="allow-scripts allow-same-origin allow-forms" referrerPolicy="no-referrer"/>
      </div>
    </div>
    <footer className="lab-footer"><span>{device==="fluid"?"Ancho disponible":widths[device]+" px"} · {zoom}% · Vista aislada</span><span>No se envían cambios a producción</span></footer>
  </section>
 </div>;
}
