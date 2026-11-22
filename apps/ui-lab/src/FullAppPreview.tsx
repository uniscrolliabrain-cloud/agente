import { lazy, Suspense } from "react";
import { demoUser } from "../../web/src/demo/fixtures";
import { DEMO_TOKEN } from "../../web/src/demo/tenant";
// Run the actual production App, not a manually recreated shell.
// The UI Lab must be hosted on a separate origin from production.
if (location.origin === "https://agntiapro.com" || location.origin === "https://www.agntiapro.com") {
  throw new Error("El UI Lab no puede ejecutarse en el origen de producción");
}

const RealApp=lazy(()=>import("../../web/src/App"));
export default function FullAppPreview(){
  // Only initialize the synthetic session when the full-app preview is selected.
  localStorage.setItem("agente_auth",JSON.stringify({token:DEMO_TOKEN,mode:"sample"}));
  localStorage.setItem("agente_user",JSON.stringify(demoUser));
  return <Suspense fallback={<div style={{padding:32}}>Preparando la aplicación original en modo demo…</div>}><RealApp/></Suspense>;}
