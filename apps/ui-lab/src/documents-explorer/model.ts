export type Folder={id:string;name:string;parent:string|null;icon:string};
export type Doc={id:string;name:string;folder:string;author:string;kind:string;bytes:number;modified:string;favorite:boolean;shared:boolean;body:string};
export const folders:Folder[]=[...["Empresa","Equipo humano","Agentes IA","Proyectos","Clientes","SOPs"].map((name,i)=>({id:"f"+i,name,parent:null,icon:["empresa","equipo","agentes","proyectos","clientes","sops"][i]})),{id:"acme",name:"ACME",parent:"f4",icon:"empresa"},{id:"ops",name:"Operaciones",parent:"f3",icon:"proyectos"}];
export const initialDocs:Doc[]=[
["d1","Propuesta comercial — ACME.pdf","acme","LAIA","pdf",2400000,"2026-11-24T10:42:00",true,true],
["d2","Plan de operaciones — Noviembre.docx","ops","Marcos","docx",1100000,"2026-11-23T18:20:00",false,false],
["d3","SOP — Incorporación de clientes.md","f5","LAIA","md",84000,"2026-11-23T09:15:00",true,false],
["d4","Informe financiero mensual.xlsx","f0","Antonio","xlsx",856000,"2026-11-20T12:00:00",false,true],
["d5","Auditoría tecnológica.pdf","f0","LAIA","pdf",4200000,"2026-11-18T12:00:00",false,false],
["d6","Identidad visual AgntiaPro.png","f0","Empleado humano","png",8900000,"2026-11-17T12:00:00",false,false]
].map(([id,name,folder,author,kind,bytes,modified,favorite,shared])=>({id:String(id),name:String(name),folder:String(folder),author:String(author),kind:String(kind),bytes:Number(bytes),modified:String(modified),favorite:Boolean(favorite),shared:Boolean(shared),body:"Contenido sintético de demostración; no representa el archivo original."}));
export function pathOf(id:string,all:Folder[]):Folder[]{const result:Folder[]=[];const seen=new Set<string>();let current=all.find(f=>f.id===id);while(current&&!seen.has(current.id)){seen.add(current.id);result.unshift(current);const parent=current.parent;current=all.find(f=>f.id===parent);}return result;}
export const normalize=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export const size=(n:number)=>n>=1000000?(n/1000000).toFixed(1)+" MB":Math.round(n/1000)+" KB";

export const agents=["LAIA","Marcos","Antonio","Ana","Pedro","Juan"];
const demoAreas=[["laia","LAIA","f2","agentes"],["marcos","Marcos","f2","agentes"],["antonio","Antonio","f2","agentes"],["ana","Ana","f2","agentes"],["pedro","Pedro","f2","agentes"],["juan","Juan","f2","agentes"],["luis","Luis","f1","equipo"],["pilar","Pilar","f1","equipo"],["manuel","Manuel","f1","equipo"],["finance","Finanzas","f0","empresa"],["brand","Marca y comunicación","f0","empresa"],["onboarding","Incorporación","f5","sops"],["web","Actualización web","f3","proyectos"],["norte","Norte Studio","f4","clientes"],["templates","Plantillas","f0","empresa"]];
folders.push(...demoAreas.map(([id,name,parent,icon])=>({id,name,parent,icon})));
const examples=[["laia","LAIA","Briefing semanal","md"],["marcos","Marcos","Registro de operaciones","xlsx"],["antonio","Antonio","Previsión de tesorería","xlsx"],["ana","Ana","Plan de incorporación","docx"],["pedro","Pedro","Revisión de seguridad","pdf"],["juan","Juan","Calendario fiscal","xlsx"],["luis","Luis","Presupuesto trimestral","xlsx"],["pilar","Pilar","Guía de bienvenida","pdf"],["manuel","Manuel","Guion de presentación","docx"],["finance","Antonio","Balance mensual","xlsx"],["brand","Manuel","Guía editorial","pdf"],["onboarding","LAIA","Checklist de alta","md"],["web","Marcos","Plan de publicación","docx"],["norte","LAIA","Propuesta de servicios","pdf"],["templates","Pilar","Plantilla de reunión","docx"]];
initialDocs.push(...examples.flatMap(([folder,author,title,kind],i)=>[0,1].map(j=>({id:"demo-"+i+"-"+j,name:title+(j?" — revisión":"")+"."+kind,folder,author,kind,bytes:48000+i*17000+j*1000,modified:"2026-11-"+String(23-i%12).padStart(2,"0")+"T09:00:00",favorite:i%5===0&&j===0,shared:i%3===0,body:"Objetivo: "+title+".\nResponsable: "+author+".\\nPróximo paso: revisar el borrador y validar las acciones de la semana. Contenido ficticio de UI Lab."}))));
