// 05-google-drive - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "document.upload", title: "document.upload", kind: "action" as const, risk: "low" as const },
  { id: "document.move", title: "document.move", kind: "action" as const, risk: "low" as const },
  { id: "document.classify", title: "document.classify", kind: "action" as const, risk: "low" as const },
  { id: "document.link", title: "document.link", kind: "action" as const, risk: "low" as const },
  { id: "document.archive", title: "document.archive", kind: "action" as const, risk: "low" as const },
  { id: "document.search", title: "document.search", kind: "action" as const, risk: "low" as const },
  { id: "document.read", title: "document.read", kind: "action" as const, risk: "low" as const }
] as const;
