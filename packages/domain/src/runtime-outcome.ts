import { z } from 'zod';
import { cognitiveRefSchema } from './cognitive-reference.ts';
import { CARD_ONTOLOGY_ID,CARD_ONTOLOGY_VERSION } from './card-ontology.ts';
/** Scoped runtime fact, never a semantic model assertion of business success. */
export const runtimeOutcomeSchema=z.strictObject({
 ontologyId:z.literal(CARD_ONTOLOGY_ID),ontologyVersion:z.literal(CARD_ONTOLOGY_VERSION),family:z.literal('outcome'),
 approvalDecisionId:z.literal('founder-20261116-card-ontology-001'),verifierVersion:z.literal('slow-job-receipt-v1'),
 scope:z.literal('slow_cognition_job'),jobId:z.string().min(1).max(200),state:z.enum(['completed','failed','cancelled']),
 observedAt:z.iso.datetime({offset:true}),receiptRef:cognitiveRefSchema.refine(r=>r.kind==='receipt','runtime outcome requires receipt'),
});
export type RuntimeOutcome=z.infer<typeof runtimeOutcomeSchema>;
