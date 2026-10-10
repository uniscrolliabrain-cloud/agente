// 22-canva - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "brief.create", title: "brief.create", kind: "action" as const, risk: "low" as const },
  { id: "design.generate", title: "design.generate", kind: "action" as const, risk: "low" as const },
  { id: "asset.export", title: "asset.export", kind: "action" as const, risk: "low" as const },
  { id: "asset.publish", title: "asset.publish", kind: "action" as const, risk: "low" as const },
  { id: "brand.upload", title: "brand.upload", kind: "action" as const, risk: "low" as const },
  { id: "design.read", title: "design.read", kind: "action" as const, risk: "low" as const }
] as const;
