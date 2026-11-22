import type { AgentTask } from "../../web/src/types/api";
import type { MemoryEntry, FileEntry } from "../../web/src/hooks/useWorkspaceData";
const now=new Date().toISOString();
export const memories:MemoryEntry[]=[
{id:"demo-1",text:"Manual de identidad de AgntiaPro\nPaleta marfil, violeta y carbón. Diseño editorial premium.",source:"UI Lab",createdAt:now},
{id:"demo-2",text:"Proceso de atención al cliente\nDocumentación de ejemplo para comprobar la biblioteca.",source:"UI Lab",createdAt:now},
{id:"demo-3",text:"Proyecto Aurora\nObjetivos, contexto y decisiones de diseño del proyecto.",source:"UI Lab",createdAt:now},
];
export const files:FileEntry[]=[{id:"demo-file-1",name:"Manual-de-marca.pdf",mimeType:"application/pdf",size:124000,createdAt:now}];
const base={prompt:"Vista de prueba",kind:"agent" as const,plan:[],evidence:[],input:{},state:{},createdAt:now,updatedAt:now,attempts:0,artifactIds:[]};
export const tasks:AgentTask[]=[
{id:"demo-task-1",title:"Revisar propuesta visual",status:"waiting_approval",...base},
{id:"demo-task-2",title:"Diseñar pantalla de conocimiento",status:"running",...base},
{id:"demo-task-3",title:"Preparar biblioteca de componentes",status:"queued",...base},
{id:"demo-task-4",title:"Auditoría de tipografía",status:"succeeded",...base},
];
