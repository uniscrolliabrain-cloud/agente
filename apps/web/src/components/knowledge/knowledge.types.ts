export const CATEGORIES = ["empresa", "cliente", "proceso", "preferencia", "rrhh", "producto", "otro"] as const;
export type Category = (typeof CATEGORIES)[number];
export type CategoryFilter = Category | "todas";
export type Presentation = "list" | "table" | "gallery";
export interface KnowledgeItem {
  id: string;
  text: string;
  category?: Category | null;
  tags?: string[] | null;
  source?: string | null;
  createdAt?: string;
}
export function getTitle(text: string): string {
  const first = text.trim().split(/\n/)[0] ?? "";
  return first.length > 85 ? first.slice(0, 82).trimEnd() + "…" : first || "Sin título";
}
export function getExcerpt(text: string): string {
  const trimmed = text.trim();
  const title = trimmed.split(/\n/)[0] ?? "";
  return trimmed.slice(title.length).trim().slice(0, 180);
}
export function relativeTime(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "";
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return Math.floor(ms / 60000) + " min";
  if (ms < 86400000) return Math.floor(ms / 3600000) + " h";
  return Math.floor(ms / 86400000) + " d";
}
