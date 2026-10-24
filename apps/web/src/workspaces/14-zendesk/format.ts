// ZENDESK_FORMAT_V1

const PALETTE = [
  { bg: "#E9E7FF", fg: "#6C5CD6" },
  { bg: "#FEF3C7", fg: "#92400E" },
  { bg: "#DCFCE7", fg: "#166534" },
  { bg: "#DBEAFE", fg: "#1E40AF" },
  { bg: "#FCE7F3", fg: "#9D174D" },
  { bg: "#E0F2FE", fg: "#075985" },
  { bg: "#FEE2E2", fg: "#991B1B" },
  { bg: "#F3E8FF", fg: "#6B21A8" },
];

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function colorFromCompany(company: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < company.length; i += 1) {
    hash = (hash * 31 + company.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function formatLtv(amount: number): string {
  return "EUR " + amount.toLocaleString("es-ES");
}

export function formatTicketDate(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days < 7) return d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");
}

export function formatRelative(iso: string, now = Date.now()): string {
  const ms = now - new Date(iso).getTime();
  if (ms < 60000) return "ahora";
  if (ms < 3600000) return "hace " + Math.floor(ms / 60000) + " min";
  if (ms < 86400000) return "hace " + Math.floor(ms / 3600000) + " h";
  return "hace " + Math.floor(ms / 86400000) + " d";
}