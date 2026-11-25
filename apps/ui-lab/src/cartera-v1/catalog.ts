export type Kind="Cliente"|"Proyecto"|"Lead"|"Campaña"|"Propuesta"|"Factura"|"Contrato"|"Soporte";
export type Entry={id:string;kind:Kind;title:string;client:string;amount:number;progress:number;status:string;cover:string;description:string};
export const covers=[["web","Software y web"],["sales","Ventas"],["money","Finanzas"],["meeting","Consultoría"],["campaign","Marketing"],["work","Operaciones"],["legal","Contratos"],["shop","Comercio"]] as const;
export const coverUrl=(key:string)=>key.startsWith("data:image/")?key:import.meta.env.BASE_URL+"cartera/"+key+".webp";
export const money=(n:number)=>n.toLocaleString("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0});
export const entries:Entry[]=[
{id:"acme",kind:"Proyecto",title:"Lanzamiento web ACME",client:"ACME",amount:42000,progress:78,status:"Pendiente",cover:"web",description:"La nueva web está preparada para la revisión de lanzamiento."},
{id:"sales",kind:"Proyecto",title:"Automatización de ventas",client:"Nortia Group",amount:58000,progress:64,status:"Activo",cover:"sales",description:"Automatización del seguimiento comercial y cualificación."},
{id:"audit",kind:"Proyecto",title:"Auditoría de operaciones",client:"Clínica Sol",amount:9500,progress:91,status:"Activo",cover:"work",description:"Revisión de procesos y oportunidades de mejora."},
{id:"client",kind:"Cliente",title:"ACME",client:"ACME",amount:0,progress:0,status:"Activo",cover:"meeting",description:"Relación empresarial y proyectos de transformación digital."},
{id:"proposal",kind:"Propuesta",title:"Consultoría Norte",client:"Consultoría Norte",amount:12500,progress:0,status:"Pendiente",cover:"meeting",description:"Propuesta preparada para revisión."},
{id:"campaign",kind:"Campaña",title:"Campaña Q1",client:"Restaurante Mar",amount:18000,progress:82,status:"En riesgo",cover:"campaign",description:"Creatividades preparadas; pendiente de respuesta."},
{id:"invoice",kind:"Factura",title:"Factura Laura Méndez",client:"Laura Méndez",amount:4800,progress:0,status:"Vencida",cover:"money",description:"Cobro pendiente de seguimiento."},
{id:"invoice2",kind:"Factura",title:"Factura ACME",client:"ACME",amount:12000,progress:0,status:"Pendiente",cover:"money",description:"Factura pendiente de cobro."},
{id:"lead",kind:"Lead",title:"Restaurante Mar",client:"Restaurante Mar",amount:8000,progress:0,status:"Nuevo",cover:"shop",description:"Oportunidad de digitalización comercial."},
{id:"lead2",kind:"Lead",title:"Tienda Luna",client:"Tienda Luna",amount:6500,progress:0,status:"Nuevo",cover:"shop",description:"Explorar presencia digital y ventas."},
{id:"legal",kind:"Contrato",title:"Expediente Juan Gestoría",client:"Juan Gestoría",amount:0,progress:0,status:"En riesgo",cover:"legal",description:"Documentación pendiente de revisión."}];
export const sections=[["Seguir trabajando",["Proyecto","Campaña"]],["Pendiente de ti",["Pendiente"]],["A punto de cobrar",["Factura"]],["Nuevos leads",["Lead"]],["En riesgo",["En riesgo","Vencida"]]] as const;
