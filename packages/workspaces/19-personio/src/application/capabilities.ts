// 19-personio - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "position.open", title: "position.open", kind: "action" as const, risk: "low" as const },
  { id: "onboarding.start", title: "onboarding.start", kind: "action" as const, risk: "low" as const },
  { id: "onboarding.complete", title: "onboarding.complete", kind: "action" as const, risk: "low" as const },
  { id: "employment.close", title: "employment.close", kind: "action" as const, risk: "low" as const },
  { id: "lifecycle.read", title: "lifecycle.read", kind: "action" as const, risk: "low" as const },
  { id: "onboarding.progress", title: "onboarding.progress", kind: "action" as const, risk: "low" as const }
] as const;
