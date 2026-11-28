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
    const persisted = await this.db.get<{ ontology: Ontology }>("system", "chromatic-ontology-v2", id);
    if (!persisted || digest(persisted.ontology) !== digest(ontology)) throw Error("ONTOLOGY_VERSION_CONFLICT");
    return id;
  }
  async runtime(ontologyId: string, version: string): Promise<Ontology> {
    const requestedId = digest([ontologyId, version]);
    const row = await this.db.get<{ id: string; ontology: unknown }>("system", "chromatic-ontology-v2", requestedId);
    if (!row) throw Error("CHROMATIC_BLOCKED_DECISION");
    const parsed = chromaticOntologyV2Schema.safeParse(row.ontology);
    if (!parsed.success) throw Error("ONTOLOGY_STORED_INVALID");
    const o = parsed.data;
    if (row.id !== requestedId || o.ontologyId !== ontologyId || o.version !== version) throw Error("ONTOLOGY_BINDING_MISMATCH");
    if (o.status !== "approved") throw Error("CHROMATIC_BLOCKED_DECISION");
    if (!await this.authority.verify(o.approvalReceiptId!, digest({ ...o, status: "draft", approvalReceiptId: undefined }))) throw Error("ONTOLOGY_APPROVAL_REVOKED");
    return o;
  }
}
export function normalizeChromaticVector(ontology: Ontology, values: Readonly<Record<string, number | null>>) {
  if (ontology.status !== "approved") throw Error("CHROMATIC_BLOCKED_DECISION");
  const known = new Set(ontology.axes.map((a) => a.id));
  if (Object.keys(values).some((key) => !known.has(key))) throw Error("UNKNOWN_CHROMATIC_AXIS");
  return ontology.axes.map((a) => {
    const value = values[a.id];
    if (value === undefined || value === null) return { axis: a.id, value: null };
    if (!Number.isFinite(value) || value < -1 || value > 1) throw Error("CHROMATIC_VALUE_OUT_OF_RANGE");
    return { axis: a.id, value: Math.round(value * 1e6) / 1e6 };
  });
}
