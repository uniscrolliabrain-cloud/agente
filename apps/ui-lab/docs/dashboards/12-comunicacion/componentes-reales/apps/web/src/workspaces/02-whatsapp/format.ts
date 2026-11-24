// CHAT_FORMAT_V1

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

const yesterdayOf = (now: Date) => {
  const y = new Date(now)
  y.setDate(now.getDate() - 1)
  return y
}

export const dayKey = (iso: string) => new Date(iso).toDateString()

export const formatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })

export function formatThreadTime(iso: string, now = new Date()): string {
  const d = new Date(iso)
  if (sameDay(d, now)) return formatClock(iso)
  if (sameDay(d, yesterdayOf(now))) return "ayer"
  const days = (now.getTime() - d.getTime()) / 86_400_000
  if (days < 7) return d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "")
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "")
}

export function formatDayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso)
  if (sameDay(d, now)) return "Hoy"
  if (sameDay(d, yesterdayOf(now))) return "Ayer"
  return d
    .toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })
    .replace(/\./g, "")
}

export function formatRelative(iso: string, now = Date.now()): string {
  const min = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000))
  if (min < 1) return "ahora"
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  if (d < 7) return `hace ${d} d`
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "")
}
