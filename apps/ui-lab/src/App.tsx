import { Component, Suspense, useEffect, useState, type ReactNode } from "react";
import { Maximize2, Monitor, RotateCcw, Smartphone, Tablet, X } from "lucide-react";
import { previews } from "./registry";
import { DEMO_TOKEN } from "../../web/src/demo/tenant";
import { demoUser } from "../../web/src/demo/fixtures";
import { labVersions } from "./versions";
import { useLabVersion } from "./useLabVersion";
type Device="mobile"|"tablet"|"desktop"|"fluid";
const widths:Record<Device,number|undefined>={mobile:390,tablet:768,desktop:1440,fluid:undefined};
class PreviewBoundary extends Component<{children:ReactNode},{error:string|null}> {
  state={error:null as string|null};
  static getDerivedStateFromError(error:Error){return {error:error.message};}
  render(){return this.state.error?<div className="lab-failure"><h2>No se pudo renderizar esta vista</h2><p>{this.state.error}</p><p>Puede depender de un proveedor de datos o del shell de producción. No se ha sustituido por un mock inventado.</p></div>:this.props.children;}
}
export default function App(){
 const [active,setActive]=useState(()=>new URLSearchParams(location.search).get("view")||"full-app");
 const [device,setDevice]=useState<Device>("desktop");
 const [zoom,setZoom]=useState(100);
 const [key,setKey]=useState(0);
 const [full,setFull]=useState(false);
 const [compare,setCompare]=useState(false);
 const [comparisonId,setComparisonId]=useState("brand");
 const version=useLabVersion();
 const item=previews.find(p=>p.id===active)??previews[0];
 const select=(id:string)=>{setActive(id);setKey(k=>k+1);history.replaceState(null,"","?view="+encodeURIComponent(id));};
 useEffect(()=>{document.title="AgntiaPro UI Lab · "+item.name;},[item.name]);
 const Preview=item.Component;
 // Isolated preview frames always use the in-memory demo router. The network guard
 // in safety.ts blocks requests outside the local version manifest.
 if (new URLSearchParams(location.search).has("embed")) {
  if (location.hostname === "agntiapro.com" || location.hostname === "www.agntiapro.com") {
   throw new Error("UI Lab no puede usar el origen de producción");
  }
  localStorage.setItem("agente_auth", JSON.stringify({ token: DEMO_TOKEN, mode: "sample" }));
  localStorage.setItem("agente_user", JSON.stringify(demoUser));
 }
 if(new URLSearchParams(location.search).has("embed")) return <div className="lab-embed"><div className="lab-preview-badge">UI LAB · {item.status==="api"?"API NO CONECTADA":item.status==="fixture"?"DATOS FICTICIOS":"DEMO"}</div><PreviewBoundary><Suspense fallback={<div className="lab-loading">Cargando componente real…</div>}><Preview/></Suspense></PreviewBoundary></div>;
 return <div className={"lab-root "+(full?"lab-full":"")}>
  <section className="lab-stage">
    <header className="lab-topbar">
      <div className="lab-title"><span className="lab-kicker">VISTA PREVIA</span><h1>{item.name}</h1><small>{item.description}</small></div>
      <div className="lab-actions">
        <label className="lab-preview-picker"><span>Vista</span><select aria-label="Seleccionar pantalla de UI Lab" value={item.id} onChange={e=>select(e.target.value)}>{previews.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <div className="lab-devices" role="group" aria-label="Tamaño de pantalla">
          {([{id:"mobile",Icon:Smartphone,label:"Móvil"},{id:"tablet",Icon:Tablet,label:"Tablet"},{id:"desktop",Icon:Monitor,label:"PC"},{id:"fluid",Icon:ChevronDown,label:"Fluido"}] as const).map(({id,Icon,label})=><button key={id} title={label} aria-label={label} aria-pressed={device===id} className={device===id?"active":""} onClick={()=>setDevice(id)}><Icon size={17}/></button>)}
        </div>
        <select aria-label="Zoom" value={zoom} onChange={e=>setZoom(Number(e.target.value))}>{[50,75,90,100].map(z=><option value={z} key={z}>{z}%</option>)}</select>
        <button title={compare?"Cerrar comparación":"Comparar interfaces"} aria-pressed={compare} onClick={()=>setCompare(v=>!v)}>{compare?"Cerrar comparación":"Comparar"}</button>
        <button title="Comprobar si hay una versión ya publicada (no despliega)" aria-label="Comprobar versión publicada" onClick={()=>void version.check()}><RotateCcw size={15}/> <span className="lab-check-label">Buscar actualización</span></button>
        <button title="Recargar componente" aria-label="Recargar componente" onClick={()=>setKey(k=>k+1)}><RotateCcw size={17}/></button>
        <button title={full?"Salir de pantalla completa":"Pantalla completa"} aria-label={full?"Salir de pantalla completa":"Pantalla completa"} onClick={()=>setFull(f=>!f)}>{full?<X size={17}/>:<Maximize2 size={17}/>}</button>
      </div>
    </header>
    {version.updateAvailable && <div className="lab-update" role="status"><span>Nueva versión disponible: {version.latest?.version.slice(0,8)}</span><button onClick={()=>location.reload()}>Cargar actualización</button></div>}
    {compare && <div className="lab-compare-toolbar"><label htmlFor="lab-compare">Comparar con</label><select id="lab-compare" value={comparisonId} onChange={e=>setComparisonId(e.target.value)}>{previews.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><span>Comparación visual de vistas registradas, no un historial de versiones</span></div>}
    <div className={"lab-canvas "+(compare?"lab-canvas-compare":"")}>
      <div className="lab-viewport-wrap" style={{width:widths[device]?Math.min(widths[device]!,Math.max(320,window.innerWidth-32))*zoom/100:"100%",maxWidth:"100%"}}>
        <iframe key={item.id+"-"+key+"-"+device} title={"Vista "+item.name} className="lab-frame"
          style={{width:widths[device]??"100%",height:device==="desktop"?900:850,transform:widths[device]?`scale(${zoom/100})`:undefined,transformOrigin:"top left"}}
          src={"/?embed=1&view="+encodeURIComponent(item.id)} sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer"/>
      </div>
      {compare && <div className="lab-compare-frame"><div className="lab-compare-label">{previews.find(p=>p.id===comparisonId)?.name}</div><iframe key={comparisonId+"-"+device} title="Vista para comparar" className="lab-frame" src={"/?embed=1&view="+encodeURIComponent(comparisonId)} sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer"/></div>}
    </div>
    <footer className="lab-footer"><span>{device==="fluid"?"Ancho disponible":widths[device]+" px"} · {zoom}% · Vista aislada</span><span>Build: {version.initial?.version.slice(0,8)??"comprobando"} · {version.error?"Sin conexión al manifiesto":"Preview independiente"}</span></footer>
  </section>
 </div>;
}
