import { useMemo } from 'react';
import type { Client, Project, Ticket, Agent, Insight, MessageRow, PipelineStage, DateRange } from '../types';
const clients: Client[] = [
  { id:'1', name:'Roberto León', company:'León Constructora', ltv:'€15.4k', status:'riesgo', next:'Llamada rescate · guión IA', action:'Llamar', avatar:'RL', detail:'Silencio 12 días, 3 presupuestos sin respuesta.', amount:'€15.4k en juego' },
  { id:'2', name:'Marta Soler', company:'Soluciones Limpieza', ltv:'€4.2k', status:'oportunidad', next:'Enviar propuesta 3 planes + demo', action:'Enviar propuesta', avatar:'MS', detail:'60 msgs/día en WhatsApp. Upsell €8.4k.', amount:'€8.4k potencial' },
  { id:'3', name:'Javier Gil', company:'Gil Proyectos', ltv:'€12.4k', status:'estable', next:'Centralizar info · checklist obra', action:'Generar checklist', avatar:'JG', detail:'15 obras simultáneas. Tiempo respuesta 4h.', amount:'€12.4k pipeline' },
  { id:'4', name:'Ana Torres', company:'Clínica Torres', ltv:'€6.8k', status:'riesgo', next:'Fix bot fuera horario + disculpa', action:'Resolver con IA', avatar:'AT', detail:'Bot no responde fuera de horario 23%.', amount:'Ticket #8821' },
  { id:'5', name:'Sofia Navarro', company:'Navarro Retail', ltv:'€9.1k', status:'riesgo', next:'Revisar cobro duplicado Holded', action:'Revisar factura', avatar:'SN', detail:'Cobro duplicado. 2 facturas bloqueadas.', amount:'€1.240 duplicado' },
];
const projects: Project[] = [
  { name:'Tenerife Sur', pct:78, owner:'Marta', avatar:'MS', alert:'Retraso 1 día por secado', color:'#6D5BFF' },
  { name:'Residencial Las Palmas', pct:64, owner:'Javier Gil', avatar:'JG', alert:'Falta lechada · 15 obras', color:'#FF8A5B' },
  { name:'Tienda Centro Comercial', pct:91, owner:'Carlos', avatar:'CR', alert:'En tiempo', color:'#10B981' },
  { name:'Villa Tagoror', pct:42, owner:'Roberto', avatar:'RL', alert:'Esperando material', color:'#6D5BFF' },
  { name:'Oficinas ACME', pct:85, owner:'Sofia', avatar:'SN', alert:'Finalizando', color:'#6D5BFF' },
];
const tickets: Ticket[] = [
  { name:'Ana Torres', company:'Clínica Torres', issue:'Bot no responde', time:'18h', badge:'Soporte', badgeColor:'bg-[#DBEAFE] text-blue-700', urgency:'URGENCIA', dot:'bg-red-500' },
  { name:'Sofia Navarro', company:'Navarro Retail', issue:'Cobro duplicado riesgo churn', time:'5h', badge:'Reclamación', badgeColor:'bg-[#FFE4E6] text-red-700', urgency:'ALTA', dot:'bg-amber-400' },
  { name:'Roberto Díaz', company:'Díaz Instalaciones', issue:'Factura Holded no sync', time:'2d', badge:'Pagos', badgeColor:'bg-[#FEF3C7] text-amber-800', urgency:'MEDIA', dot:'bg-[#6D5BFF]' },
];
const agents: Agent[] = [
  { name:'Agente Obra', conf:94, tasks:3, status:'ok', desc:'Checklists, progreso, alertas' },
  { name:'Agente Presupuestos', conf:89, tasks:5, status:'ok', desc:'3 planes + demo, Holded' },
  { name:'Agente Soporte', conf:76, tasks:8, status:'warn', desc:'Fuera horario fallando · Ana Torres caso' },
];
const insights: Insight[] = [
  { tag:'Oportunidad automatización', body:'Detectamos: 60 msgs/día en Soluciones Limpieza = oportunidad automatización WhatsApp + Holded.', cta:'Crear flujo IA', variant:'light' },
  { tag:'Bloqueo facturación', body:'20 facturas/mes autónomos bloqueadas por sync. Holded API error 422.', cta:'Resolver sync', variant:'primary' },
  { tag:'Bot fuera horario', body:'Bot responde fuera de horario 23% fallando. Agente Soporte necesita re-entrenamiento.', cta:'Re-entrenar', variant:'ghost' },
];
const messageRows: MessageRow[] = [
  { name:'Soluciones Limpieza', msgs:60, pct:78 },
  { name:'ACME Obras', msgs:42, pct:55 },
  { name:'Clínica Torres', msgs:31, pct:40 },
];
const pipelineStages: PipelineStage[] = [
  { label:'Lead', val:6, w:'25%' },
  { label:'Presupuesto', val:8, w:'48%' },
  { label:'Obra', val:5, w:'62%' },
  { label:'Facturado', val:5, w:'92%' },
];
const retentionData: Record<DateRange, number[]> = {
  '7d': [68,70,69,71,74,80,82],
  '30d': [62,64,63,66,68,71,70,72,74,75,78,80,82],
  '90d': [58,60,61,60,62,64,63,66,68,70,69,71,73,75,78,80,82],
};
export function useCentroMandoData(range: DateRange) {
  const data = retentionData[range];
  const sparkPoints = useMemo(() => {
    const w = 120, h = 36;
    const max = Math.max(...data);
    const min = Math.min(...data);
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h - 2;
      return x + ',' + y;
    }).join(' ');
  }, [data]);
  return { clients, projects, tickets, agents, insights, messageRows, pipelineStages, retention: data, sparkPoints };
}
