// CHAT_TRANSVERSAL_V3 — datos sintéticos y tipos del laboratorio.
// Nada de aquí llama a un backend real: respuestas, ideas y actas son guion.
import laiaPortrait from "./assets/laia-videollamada.webp";

export const LAIA_PORTRAIT = laiaPortrait;

export type Role = "user" | "agent";

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  at: number;
}

export type CallMode = "voice" | "video";

export interface CallReport {
  id: string;
  mode: CallMode;
  seconds: number;
  ideas: string[];
}

export interface AudioNote {
  id: string;
  url: string;
  seconds: number;
  name: string;
}

export const SUGGESTIONS = [
  "¿Qué tengo pendiente hoy?",
  "Resume el estado del equipo",
  "Prepara un email para un cliente",
] as const;

export const QUICK_ACTION_COPY = "Datos de ejemplo · sin servicios conectados";

export const TENANT = "Taller Norte · demo";

/** Ideas que aparecen durante la sesión simulada, una cada seis segundos. */
export const CALL_IDEAS = [
  "El informe de tesorería de octubre sigue sin cerrar y bloquea la previsión.",
  "Compras negocia dos proveedores nuevos: conviene fijar criterio de aceptación.",
  "El equipo comercial pide una plantilla de seguimiento común.",
  "Decidir quién firma el cierre mensual antes del viernes.",
];

export const NEXT_STEP = "Enviar el borrador del cierre a Elena y confirmar la fecha.";

const REPLIES: Array<{ match: RegExp; text: string }> = [
  {
    match: /pendiente|hoy|tarea/i,
    text:
      "Hoy tienes tres frentes abiertos: cerrar la conciliación de octubre, revisar las dos propuestas de compras y responder a Elena sobre el informe mensual. Si quieres, empiezo por la conciliación y te dejo el resumen en el hilo.",
  },
  {
    match: /equipo|estado|resume/i,
    text:
      "El equipo va en línea con el plan: comercial ha cerrado cuatro cuentas esta semana, operaciones mantiene el SLA en el 96 % y finanzas espera tu visto bueno al cierre. El único riesgo visible es la dependencia de un proveedor único en logística.",
  },
  {
    match: /email|correo|cliente/i,
    text:
      "Puedo redactarlo contigo. Dime el tono y el objetivo y preparo un borrador breve: contexto, propuesta concreta y siguiente paso con fecha. No lo envío a nadie sin que lo revises.",
  },
];

export function replyFor(text: string): string {
  const found = REPLIES.find((reply) => reply.match.test(text));
  if (found) return found.text;
  return `Entendido. Trabajo sobre «${text.trim().slice(0, 90)}» con los datos de demostración de este laboratorio: te dejo el enfoque, los pasos y lo que necesitaría de ti para ejecutarlo de verdad.`;
}

export const ACTIONS = [
  { id: "file", label: "Subir archivo", group: "capture" as const },
  { id: "photos", label: "Subir fotos", group: "capture" as const },
  { id: "photo", label: "Hacer una foto", group: "capture" as const },
  { id: "video", label: "Subir vídeo", group: "capture" as const },
  { id: "record", label: "Grabar vídeo", group: "capture" as const },
  { id: "client", label: "Cliente", group: "business" as const, prompt: "Trabajemos con el cliente", placeholder: "Nombre del cliente" },
  { id: "project", label: "Proyecto", group: "business" as const, prompt: "Trabajemos en el proyecto", placeholder: "Nombre del proyecto" },
  { id: "sop", label: "Crear SOP", group: "business" as const, prompt: "Ayúdame a redactar un SOP para", placeholder: "Proceso que quieres documentar" },
  { id: "create-video", label: "Crear vídeo", group: "business" as const, prompt: "Ayúdame a preparar un guion para un vídeo sobre", placeholder: "Tema del vídeo" },
  { id: "web", label: "Buscar en la web", group: "business" as const, prompt: "Busca información sobre", placeholder: "Qué quieres buscar" },
];

export type ChatAction = (typeof ACTIONS)[number];

export function formatDuration(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;
}
