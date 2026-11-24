// CHAT_UX_V2_CONTENT - copy de los chips, alineado con ChatPanel.
// Los roles y la cronología se leen de sus componentes reales.
export type ChatChip = { id: string; label: string; prompt: string };

export const CHIPS_DEFAULT: ChatChip[] = [
  { id: "resumen", label: "Resumen de mi negocio", prompt: "Dame un resumen de mi negocio." },
  { id: "email", label: "Redactar un email", prompt: "Redacta un email profesional." },
  { id: "doc", label: "Analizar un documento", prompt: "Analiza el ultimo documento que he subido." },
];

export const CHIPS_BY_ROLE: Record<string, ChatChip[]> = {
  legal: [
    { id: "clausula", label: "Revisar una clausula", prompt: "Revisa la clausula del ultimo contrato." },
    { id: "riesgo", label: "Analizar riesgo legal", prompt: "Analiza los riesgos legales del ultimo documento." },
    { id: "resumen", label: "Resumen de mi negocio", prompt: "Dame un resumen de mi negocio." },
  ],
  finanzas: [
    { id: "gastos", label: "Resumen de gastos", prompt: "Dame un resumen de gastos del mes." },
    { id: "factura", label: "Revisar una factura", prompt: "Revisa la ultima factura que he subido." },
    { id: "email", label: "Redactar un email", prompt: "Redacta un email profesional." },
  ],
  comercial: [
    { id: "lead", label: "Analizar un lead", prompt: "Analiza el ultimo lead que ha entrado." },
    { id: "propuesta", label: "Preparar propuesta", prompt: "Prepara una propuesta comercial." },
    { id: "email", label: "Redactar un email", prompt: "Redacta un email profesional." },
  ],
  marketing: [
    { id: "campana", label: "Resumen de campana", prompt: "Dame un resumen de la ultima campana." },
    { id: "post", label: "Preparar un post", prompt: "Prepara un post para redes." },
    { id: "doc", label: "Analizar un documento", prompt: "Analiza el ultimo documento que he subido." },
  ],
};
