// C05_ONTOLOGY_GATE_V2: no names/polarities/dimensions are invented here.
import { chromaticOntologyV2Schema } from "../../../../../../packages/domain/src/cognition-v2.ts";
import type { Store } from "../../../db.ts";
import { digest } from "../v2/storage.ts";
import { z } from "zod";
type Ontology = z.infer<typeof chromaticOntologyV2Schema>;
export interface OntologyApprovalAuthority {
  verify(receiptId: string, ontologyDigest: string): Promise<boolean>;
}
export class ChromaticOntologyRegistry {
  constructor(readonly db: Store, readonly authority: OntologyApprovalAuthority) {}
  async register(raw: unknown): Promise<string> {
    const ontology = chromaticOntologyV2Schema.parse(raw);
    if (ontology.status === "approved" && !await this.authority.verify(ontology.approvalReceiptId!, digest({ ...ontology, status: "draft", approvalReceiptId: undefined }))) throw Error("ONTOLOGY_APPROVAL_REQUIRED");
    const id = digest([ontology.ontologyId, ontology.version]);
    const existing = await this.db.get<{ id: string; ontology: Ontology }>("system", "chromatic-ontology-v2", id);
    if (existing && digest(existing.ontology) !== digest(ontology)) throw Error("ONTOLOGY_VERSION_CONFLICT");
    await this.db.insertIfAbsent("system", "chromatic-ontology-v2", { id, ontology });
    return id;
  }
  async runtime(ontologyId: string, version: string): Promise<Ontology> {
    const row = await this.db.get<{ ontology: Ontology }>("system", "chromatic-ontology-v2", digest([ontologyId, version]));
    if (!row || row.ontology.status !== "approved") throw Error("CHROMATIC_BLOCKED_DECISION");
    const o = row.ontology;
    if (!await this.authority.verify(o.approvalReceiptId!, digest({ ...o, status: "draft", approvalReceiptId: undefined }))) throw Error("ONTOLOGY_APPROVAL_REVOKED");
    return o;
  }
}
export function normalizeChromaticVector(ontology: Ontology, values: Readonly<Record<string, number>>) {
  if (ontology.status !== "approved") throw Error("CHROMATIC_BLOCKED_DECISION");
  const known = new Set(ontology.axes.map((a) => a.id));
  if (Object.keys(values).some((key) => !known.has(key))) throw Error("UNKNOWN_CHROMATIC_AXIS");
  return ontology.axes.map((a) => {
    const value = values[a.id] ?? 0;
    if (!Number.isFinite(value) || value < -1 || value > 1) throw Error("CHROMATIC_VALUE_OUT_OF_RANGE");
    return { axis: a.id, value: Math.round(value * 1e6) / 1e6 };
  });
}
