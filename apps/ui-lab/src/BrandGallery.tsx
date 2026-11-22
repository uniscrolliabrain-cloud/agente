import { BrandLockup, BrandMark } from "../../web/src/components/BrandMark";
import "../../web/src/design-system/agntia-tokens.css";
const colors=[["Marfil","#fcfaf6"],["Blanco","#ffffff"],["Carbón","#242421"],["Secundario","#6e6c66"],["Borde","#e6e1d8"],["Violeta","#6550dd"],["Lavanda","#f0ecfc"],["Oro","#b49665"]];
export default function BrandGallery(){return <div style={{padding:28,fontFamily:"Manrope,sans-serif",background:"#fcfaf6",color:"#242421",minHeight:620}}>
<div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}><BrandLockup markSize={44}/><BrandMark size={64}/></div>
<h1 style={{font:"400 42px Fraunces,serif",margin:"40px 0 8px"}}>Diseño que respira.</h1>
<p style={{fontSize:13,color:"#6e6c66",maxWidth:570}}>Muestrario de marca con componentes y valores de diseño del repositorio real. No sustituye la guía maestra.</p>
<h2 style={{font:"400 23px Fraunces,serif",marginTop:32}}>Paleta cromática</h2>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:12}}>{colors.map(([name,hex])=><div key={hex}><div style={{height:75,borderRadius:10,background:hex,border:"1px solid #e6e1d8"}}/><div style={{fontSize:12,marginTop:8,fontWeight:700}}>{name}</div><div style={{fontSize:10,color:"#6e6c66"}}>{hex}</div></div>)}</div>
<h2 style={{font:"400 23px Fraunces,serif",marginTop:32}}>Tipografía</h2>
<div style={{font:"400 32px Fraunces,serif"}}>Fraunces · Editorial</div><div style={{font:"500 17px Manrope,sans-serif",marginTop:12}}>Manrope · Interfaces, navegación y contenido</div>
</div>}