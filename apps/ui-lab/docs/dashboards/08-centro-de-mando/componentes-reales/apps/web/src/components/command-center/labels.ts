// COMMAND_CENTER_LABELS_V1 - etiquetas y filtros del centro de mando.
import type { CompanyRole } from "../../api/company";

export type CommandFilter = "todo" | "aprobaciones" | "en-marcha" | "agentes" | "equipo";

export const ROLE_LABEL: Record<CompanyRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Miembro",
};

export function statusLabel(status: string): string {
  if (status === "running") return "En curso";
  if (status === "waiting_approval") return "Tu OK";
  if (status === "waiting_input") return "Falta dato";
  if (status === "queued") return "En cola";
  if (status === "scheduled") return "Programada";
  if (status === "paused") return "En pausa";
  if (status === "succeeded") return "Hecha";
  if (status === "failed") return "Error";
  return "Cancelada";
}

export function statusTone(status: string): "live" | "waiting" | "failed" | "done" | "idle" {
  if (status === "running") return "live";
  if (status === "waiting_approval" || status === "waiting_input") return "waiting";
  if (status === "failed") return "failed";
  if (status === "succeeded") return "done";
  return "idle";
}

export function humanKind(kind: string): string {
  if (kind === "sop") return "Proceso";
  if (kind === "document") return "Documento";
  if (kind === "monitor") return "Vigilancia";
  if (kind === "finance") return "Finanzas";
  if (kind === "plan") return "Plan";
  return "Tarea";
}

export function isWaiting(status: string): boolean {
  return status === "waiting_approval" || status === "waiting_input";
}

/** Una tarea requiere al owner tanto si espera una decision como si fallo. */
export function isAttention(status: string): boolean {
  return isWaiting(status) || status === "failed";
}

export function todayLabel(): string {
  const raw = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
