// CHAT_UX_V2_FIXTURE - datos sinteticos y explicitos para la preview aislada.
// No representa actividad real, no llama a la API y no sustituye al fixture de
// produccion. Los textos son propuestas editoriales para revisar la interfaz.

import type { ToolCall } from "../../../web/src/lib/toolsReducer";
import type { ChatAttachment, ChatMessage } from "../../../web/src/types/api";

export const fixtureUserName = "Elena";

export type FixtureChip = { id: string; label: string; prompt: string };

// Copia literal de los chips de ChatPanel: la preview conserva copy y roles.
export const CHIPS_DEFAULT: FixtureChip[] = [
  { id: "resumen", label: "Resumen de mi negocio", prompt: "Dame un resumen de mi negocio." },
  { id: "email", label: "Redactar un email", prompt: "Redacta un email profesional." },
  { id: "doc", label: "Analizar un documento", prompt: "Analiza el ultimo documento que he subido." },
];

export const CHIPS_BY_ROLE: Record<string, FixtureChip[]> = {
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

// ROLE_SELECTOR_V1 conserva el selector; aqui los roles son locales para que la
// preview no consulte /api/agent/roles.
export const fixtureRoles = [
  { id: "legal", name: "Legal", active: true },
  { id: "finanzas", name: "Finanzas", active: true },
  { id: "comercial", name: "Comercial", active: true },
  { id: "marketing", name: "Marketing", active: true },
];

const shortConversation: ChatMessage[] = [
  {
    id: "seed-user-1",
    role: "user",
    content: "¿Tenemos lista la campaña de Caliza?",
    timestamp: "09:41",
  },
  {
    id: "seed-assistant-1",
    role: "assistant",
    content:
      "Marcos ha terminado la preparación y la propuesta está pendiente de tu revisión.\n\n**Antes de publicar**, conviene cerrar tres puntos:\n\n1. El público objetivo de la campaña.\n2. La llamada a la acción del formulario.\n3. La fecha de revisión con el cliente.\n\nPuedo preparar un borrador del correo para Marcos cuando quieras.",
    timestamp: "09:41",
  },
];

// Conversacion larga para QA de lectura, markdown, codigo, tablas y scroll.
const longConversation: ChatMessage[] = [
  ...shortConversation,
  {
    id: "seed-user-2",
    role: "user",
    content: "Muéstrame el resumen semanal y el estado de las tareas abiertas.",
    timestamp: "09:44",
  },
  {
    id: "seed-assistant-2",
    role: "assistant",
    content: [
      "He reunido el estado de la semana en un solo vistazo. Las cifras son **datos de ejemplo** de esta preview.",
      "",
      "| Área | Abiertas | En revisión |",
      "| --- | ---: | ---: |",
      "| Comercial | 4 | 2 |",
      "| Operaciones | 3 | 1 |",
      "| Finanzas | 2 | 1 |",
      "",
      "### Lo que requiere tu decisión",
      "",
      "- Aprobar la propuesta de Caliza antes del viernes.",
      "- Confirmar la fecha de la revisión de Bruma.",
      "- Revisar el borrador de la factura de Costa Nido.",
      "",
      "> Ningún envío se ha ejecutado: todo queda como borrador hasta tu aprobación.",
      "",
      "Si quieres que lo deje por escrito, puedo generar un resumen con este formato:",
      "",
      "```ts",
      "type Resumen = { area: string; abiertas: number; revision: number };",
      "const semana: Resumen[] = areas.map(contarTareas);",
      "```",
    ].join("\n"),
    timestamp: "09:44",
    tools: [
      {
        id: "tool-1",
        name: "consultar_proyectos",
        status: "done",
        startedAt: Date.now() - 4200,
        endedAt: Date.now() - 1800,
      },
      {
        id: "tool-2",
        name: "resumir_actividad",
        status: "done",
        startedAt: Date.now() - 1800,
        endedAt: Date.now() - 400,
      },
    ],
  },
  {
    id: "seed-user-3",
    role: "user",
    content: "Prepara un correo amable para Costa Nido, sin enviarlo.",
    timestamp: "09:46",
  },
  {
    id: "seed-assistant-3",
    role: "assistant",
    content:
      "Te propongo este borrador:\n\n> Hola, equipo de Costa Nido. Os escribimos para revisar el estado de la factura pendiente. Si necesitáis que os reenviemos la documentación, decidnoslo. Gracias.\n\nQueda **sin enviar** y sin destinatario asignado. Dime si ajusto el tono o añado el importe.",
    timestamp: "09:46",
  },
  {
    id: "seed-user-4",
    role: "user",
    content: "Perfecto. ¿Qué revisamos mañana en la reunión de dirección?",
    timestamp: "09:47",
  },
  {
    id: "seed-assistant-4",
    role: "assistant",
    content:
      "Propongo tres bloques, en este orden:\n\n- **Campaña de Caliza**: aprobación y fecha de publicación.\n- **Bruma**: evidencia de la validación de agenda.\n- **Costa Nido**: seguimiento de cobro y tono del correo.\n\nNo he reservado la sala ni he avisado a nadie; si quieres, lo preparo como borrador.",
    timestamp: "09:47",
  },
];

export type FixtureState = "home" | "conversation" | "long" | "streaming";

export function initialMessages(state: FixtureState): ChatMessage[] {
  if (state === "conversation" || state === "streaming") return shortConversation.map((m) => ({ ...m }));
  if (state === "long") return longConversation.map((m) => ({ ...m }));
  return [];
}

export const fixtureTimeline = [
  { eventId: "evt-1", state: "queued" as const, label: "Análisis en cola", at: "09:44:02" },
  { eventId: "evt-2", state: "running" as const, label: "Análisis iniciado", at: "09:44:05" },
  { eventId: "evt-3", state: "completed" as const, label: "Análisis guardado", at: "09:44:11" },
];

// Respuesta en streaming: markdown simple para que el texto se lea bien
// mientras llega por partes. No incluye tablas ni bloques largos.
export const streamingReply = [
  "He revisado la propuesta de Caliza con la información disponible.",
  "",
  "**Lo que está listo**",
  "",
  "- La estructura de la campaña.",
  "- El borrador del correo para Marcos.",
  "- La lista de revisión previa a publicar.",
  "",
  "**Lo que falta**",
  "",
  "Falta tu aprobación del público y de la llamada a la acción. No he publicado nada ni he avisado al cliente.",
  "",
  "Si quieres, preparo la versión final para que la revises.",
].join("\n");

export const streamingTools: ToolCall[] = [
  { id: "stream-tool-1", name: "consultar_proyectos", status: "running", startedAt: Date.now() },
];

// La fixture simula la subida sin red. Un nombre con "error" fuerza el estado
// de fallo para QA; queda documentado y no describe ninguna regla del producto.
export async function fixtureUpload(file: File): Promise<ChatAttachment> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  if (/error/i.test(file.name)) throw new Error("No se pudo subir el archivo (simulación)");
  return { id: `fixture-${file.name}`, name: file.name, size: file.size };
}
