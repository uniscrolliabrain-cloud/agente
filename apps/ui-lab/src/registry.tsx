import { lazy, type ComponentType } from "react";
import { memories,files,tasks } from "./fixtures";
const FullApp=lazy(()=>import("./FullAppPreview"));
const TopBar=lazy(()=>import("../../web/src/components/TopBarV2"));
const Chat=lazy(()=>import("../../web/src/components/ChatPanel"));
const Kpi=lazy(()=>import("../../web/src/components/KpiCard"));
const Brand=lazy(()=>import("./BrandGallery"));
const Landing=lazy(()=>import("./vendor/landing/Landing.jsx"));
const Studio=lazy(()=>import("./vendor/studio/BusinessCommandStudio"));
const Formation=lazy(()=>import("./formation/FormationWorkspace"));
const FormationV4=lazy(()=>import("./formation-v4/FormationV4Workspace"));
const LoginV3=lazy(()=>import("./login-v3/LoginV3"));
const Legal=lazy(()=>import("./legal/LegalV1"));

const Knowledge=lazy(()=>import("../../web/src/components/MemoryView"));

const Centro=lazy(()=>import("../../web/src/workspaces/35-centro-mando/CentroMandoWorkspace"));
const Tasks=lazy(()=>import("../../web/src/components/TasksView"));
const Docs=lazy(()=>import("../../web/src/components/DocumentsView"));
const Projects=lazy(()=>import("../../web/src/components/ProjectsView"));
const Team=lazy(()=>import("../../web/src/components/TeamView"));
const Users=lazy(()=>import("../../web/src/components/UsersView"));
const Comunicaciones=lazy(()=>import("./comunicaciones/ComunicacionesWorkspace"));
const Control=lazy(()=>import("../../web/src/components/ControlCenterView"));
const Today=lazy(()=>import("../../web/src/components/CommandCenterView"));
const TodayEditorial=lazy(()=>import("./command-center-editorial/CommandCenterEditorialPreview"));
const Operations=lazy(()=>import("../../web/src/components/VerticalSliceOperationsView"));
export type Preview={id:string;name:string;category:string;description:string;Component:ComponentType;status:"fixture"|"demo"|"api";};
export const previews:Preview[]=[
{id:"full-app",name:"Aplicación completa",category:"Aplicación",description:"App.tsx original, navegación y shell reales en tenant demo",Component:FullApp,status:"demo"},
{id:"landing",name:"Landing",category:"Público",description:"Landing real recuperada de la rama de diseño, aislada en UI Lab",Component:Landing,status:"demo"},
{id:"login-v3",name:"Login V3 · Acceso",category:"Público",description:"Acceso editorial V3: OAuth, LAIA sin cuenta, contraseña e invitación, sin servicios conectados",Component:LoginV3,status:"fixture"},
{id:"studio",name:"Estudio de Operaciones",category:"Trabajo",description:"Business Command Studio original recuperado como vista de laboratorio",Component:Studio,status:"demo"},
{id:"legal",name:"Legal V1 · Transparencia",category:"Público",description:"Lectura editorial de los seis documentos legales: índices reales, estados de borrador y banners de consentimiento sin simular acciones",Component:Legal,status:"fixture"},
{id:"formation",name:"Formación · Legacy",category:"Trabajo",description:"Interfaz anterior preservada para comparación y rollback",Component:Formation,status:"fixture"},
{id:"formation-v4",name:"Formación V4 · Editorial",category:"Trabajo",description:"Nueva biblioteca editorial con 12 lecciones de demostración, fotografía y fichas accesibles",Component:FormationV4,status:"fixture"},
{id:"brand",name:"Identidad visual",category:"Componentes",description:"Marca real y tokens visuales",Component:Brand,status:"demo"},
{id:"topbar",name:"Barra superior",category:"Componentes",description:"TopBarV2 original, sin backend",Component:()=> <TopBar status="ok" statusLabel="Agente activo" contextLabel="DEMO" onNewChat={()=>{}} onOpenPalette={()=>{}} onOpenMenu={()=>{}}/>,status:"demo"},
{id:"kpi",name:"Tarjetas KPI",category:"Componentes",description:"KpiCard original con datos sintéticos",Component:()=> <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:16,padding:24}}><Kpi label="Actividades" value={128} meta="+12 esta semana" icon="purple" series={[4,6,5,9,7,12]}/><Kpi label="Completadas" value={94} meta="Datos de ejemplo" icon="green" series={[2,3,6,7,8,11]}/><Kpi label="Pendientes" value={12} icon="orange" series={[8,7,6,7,5,4]}/></div>,status:"fixture"},
{id:"chat",name:"Chat",category:"Componentes",description:"ChatPanel original con conversación ficticia",Component:()=> <Chat chat={{messages:[],streaming:false,streamBuf:"",tools:[],error:null,send:()=>{},cancel:()=>{},threadId:"ui-lab"}} userName="Demo"/>,status:"fixture"},
{id:"knowledge",name:"Conocimiento",category:"Trabajo",description:"Biblioteca editorial C01",Component:()=> <Knowledge memories={memories}/>,status:"fixture"},
{id:"centro",name:"Centro de Mando",category:"Trabajo",description:"Workspace 35; inspeccionar dependencias",Component:Centro,status:"demo"},
{id:"today",name:"Inicio / Hoy",category:"Trabajo",description:"Vista original con API simulada en memoria",Component:Today,status:"demo"},
{id:"today-editorial",name:"Inicio · Editorial V2",category:"Trabajo",description:"Refinamiento editorial del Centro de Mando sobre los mismos datos demo, filtros, permisos y callbacks",Component:TodayEditorial,status:"demo"},
{id:"tasks",name:"Tareas",category:"Trabajo",description:"Componente original con tareas ficticias",Component:()=> <Tasks tasks={tasks} currentUserId={null} onOpenTask={()=>{}} onReviewTask={()=>{}}/>,status:"fixture"},
{id:"documents",name:"Documentos",category:"Trabajo",description:"Vista original con archivos ficticios",Component:()=> <Docs files={files}/>,status:"api"},
{id:"projects",name:"Proyectos",category:"Trabajo",description:"Vista original con API simulada en memoria",Component:()=> <Projects enabled={true}/>,status:"api"},
{id:"team",name:"Equipo",category:"Trabajo",description:"Vista original con sesión demo aislada",Component:Team,status:"api"},
{id:"users",name:"Usuarios",category:"Trabajo",description:"Vista original con API sintética del navegador",Component:()=> <Users currentUserId="ui-lab"/>,status:"api"},
{id:"comunicaciones",name:"Comunicación",category:"Canales",description:"WhatsApp Business, llamadas y SMS, Slack · demo agéntica con supervisión humana",Component:Comunicaciones,status:"demo"},
{id:"control",name:"Control de actividad",category:"Trabajo",description:"Vista original en modo desconectado",Component:()=> <Control enabled={true}/>,status:"api"},
{id:"operations",name:"Operaciones",category:"Trabajo",description:"Vista original con datos sintéticos del navegador",Component:()=> <Operations enabled={true}/>,status:"api"},
];
