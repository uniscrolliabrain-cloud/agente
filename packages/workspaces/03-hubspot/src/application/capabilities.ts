// 03-hubspot - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "crm.upsert_lead", title: "crm.upsert_lead", kind: "action" as const, risk: "low" as const },
  { id: "crm.upsert_contact", title: "crm.upsert_contact", kind: "action" as const, risk: "low" as const },
  { id: "crm.upsert_company", title: "crm.upsert_company", kind: "action" as const, risk: "low" as const },
  { id: "crm.qualify", title: "crm.qualify", kind: "action" as const, risk: "low" as const },
  { id: "crm.create_opportunity", title: "crm.create_opportunity", kind: "action" as const, risk: "low" as const },
  { id: "crm.move_stage", title: "crm.move_stage", kind: "action" as const, risk: "low" as const },
  { id: "crm.log_activity", title: "crm.log_activity", kind: "action" as const, risk: "low" as const },
  { id: "crm.list_segments", title: "crm.list_segments", kind: "action" as const, risk: "low" as const }
] as const;
