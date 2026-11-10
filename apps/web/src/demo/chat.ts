// DEMO_CHAT_V1 - respuesta guionizada para el chat del demo.
//
// Mantiene la misma forma de eventos que el runtime real (SSE AG-UI): el
// componente de chat no distingue entre demo y backend.
import type { AgUiEvent } from "../api/chat";

export interface DemoChatInput {
  messages: { role: string; content: string }[];
}

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Cancelado", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      window.clearTimeout(timer);
      reject(new DOMException("Cancelado", "AbortError"));
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });

function replyFor(text: string): string {
  const prompt = text.toLowerCase();
  if (/(presupuesto|factura|importe|euro|€)/.test(prompt)) {
    return [
      "He preparado el presupuesto de Estudio Lumen: 8.400 € con entrega el 15 de noviembre.",
      "Supera el umbral de 5.000 €, así que queda en revisión y no sale hasta que lo apruebes.",
      "Lo tienes en Tareas, en «Necesita tu acción».",
    ].join(" ");
  }
  if (/(checkout|casa bot|landing|diseñ|disen)/.test(prompt)) {
    return [
      "El checkout de Casa Botànica está en tres pasos y validado a 390 px.",
      "Falta el test con diez personas (5 de noviembre) y la cesión de imagen de las fotos.",
      "He dejado la landing de otoño esperando ese dato para no publicar sin permiso.",
    ].join(" ");
  }
  if (/(soporte|ticket|semana|informe)/.test(prompt)) {
    return [
      "El resumen de soporte cierra con 18 tickets, 3 incidencias abiertas y 42 minutos de primera respuesta.",
      "El envío está programado para el lunes a las 09:00 y puedes revisarlo antes.",
    ].join(" ");
  }
  if (/(agente|equipo|quién|quien)/.test(prompt)) {
    return [
      "Hay cuatro agentes: Marta en soporte, Bruno en comercial, Nora en diseño y coherencia de marca, e Iker en operaciones.",
      "Iker está en pausa. Puedes ver objetivos, SOPs y memoria de cada uno en la pestaña Agentes.",
    ].join(" ");
  }
  if (/(hola|buenas|qué tal|que tal)/.test(prompt)) {
    return "Hola. Soy el agente del tenant demo Interfaz: todo lo que ves es sintético y puedes tocarlo sin miedo.";
  }
  return [
    "Estoy trabajando con el tenant demo Interfaz: tareas, documentos, WhatsApp, proyectos y agentes tienen datos de ejemplo.",
    "Dime qué quieres revisar y te llevo a la vista o preparo el borrador correspondiente.",
  ].join(" ");
}

export async function streamDemoChat(
  input: DemoChatInput,
  onEvent: (event: AgUiEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const last = [...input.messages].reverse().find((message) => message.role === "user");
  const text = replyFor(last?.content ?? "");
  const words = text.split(" ");
  const toolId = `tool-${Date.now()}`;

  onEvent({ type: "RUN_STARTED" });
  await wait(180, signal);
  onEvent({ type: "TOOL_CALL_START", toolCallId: toolId, toolCallName: "buscar_contexto" });
  await wait(260, signal);
  onEvent({ type: "TOOL_CALL_END", toolCallId: toolId });
  await wait(140, signal);

  let buffer = "";
  for (let index = 0; index < words.length; index += 3) {
    const delta = `${buffer ? " " : ""}${words.slice(index, index + 3).join(" ")}`;
    buffer += delta;
    onEvent({ type: "TEXT_MESSAGE_CONTENT", delta });
    await wait(22, signal);
  }
  onEvent({ type: "RUN_FINISHED" });
}
