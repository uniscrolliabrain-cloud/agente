import { statusTone } from "../../../../web/src/components/command-center/labels";

/** Traducir la semántica que ya publica el producto. Nunca decidir urgencia. */
const TONE_CLASS: Record<ReturnType<typeof statusTone>, string> = {
  live: "cce-tag--live",
  waiting: "cce-tag--warn",
  failed: "cce-tag--danger",
  done: "cce-tag--ok",
  idle: "",
};

export function taskToneClass(status: string): string {
  return TONE_CLASS[statusTone(status)];
}
