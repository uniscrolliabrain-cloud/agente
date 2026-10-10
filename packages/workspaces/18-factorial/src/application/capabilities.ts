// 18-factorial - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "employee.create", title: "employee.create", kind: "action" as const, risk: "low" as const },
  { id: "employee.read", title: "employee.read", kind: "action" as const, risk: "low" as const },
  { id: "leave.approve", title: "leave.approve", kind: "action" as const, risk: "low" as const },
  { id: "leave.reject", title: "leave.reject", kind: "action" as const, risk: "low" as const },
  { id: "attendance.record", title: "attendance.record", kind: "action" as const, risk: "low" as const },
  { id: "schedule.update", title: "schedule.update", kind: "action" as const, risk: "low" as const }
] as const;
