// 06-google-calendar - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "calendar.create", title: "calendar.create", kind: "action" as const, risk: "low" as const },
  { id: "calendar.reschedule", title: "calendar.reschedule", kind: "action" as const, risk: "low" as const },
  { id: "calendar.cancel", title: "calendar.cancel", kind: "action" as const, risk: "low" as const },
  { id: "calendar.add_participant", title: "calendar.add_participant", kind: "action" as const, risk: "low" as const },
  { id: "calendar.check_availability", title: "calendar.check_availability", kind: "action" as const, risk: "low" as const },
  { id: "calendar.block_time", title: "calendar.block_time", kind: "action" as const, risk: "low" as const },
  { id: "calendar.read", title: "calendar.read", kind: "action" as const, risk: "low" as const }
] as const;
