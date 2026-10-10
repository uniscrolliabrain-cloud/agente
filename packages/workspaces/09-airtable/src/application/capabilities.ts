// 09-airtable - declaracion de capacidades.
export const CAPABILITIES = [
  { id: "dataset.create_record", title: "dataset.create_record", kind: "action" as const, risk: "low" as const },
  { id: "dataset.update_record", title: "dataset.update_record", kind: "action" as const, risk: "low" as const },
  { id: "dataset.define_field", title: "dataset.define_field", kind: "action" as const, risk: "low" as const },
  { id: "dataset.relate_records", title: "dataset.relate_records", kind: "action" as const, risk: "low" as const },
  { id: "dataset.list_records", title: "dataset.list_records", kind: "action" as const, risk: "low" as const },
  { id: "dataset.filter_records", title: "dataset.filter_records", kind: "action" as const, risk: "low" as const }
] as const;
