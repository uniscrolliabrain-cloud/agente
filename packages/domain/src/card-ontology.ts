import { z } from 'zod';
import { cognitiveRefSchema } from './cognitive-reference.ts';
export const CARD_ONTOLOGY_ID='agntiapro.cards' as const;
export const CARD_ONTOLOGY_VERSION='1.0.0' as const;
export const cardFamilySchema=z.enum(['observation','hypothesis','risk','opportunity','procedure','decision','outcome','knowledge_gap']);
const score=z.number().min(0).max(1);
const nullableScore=score.nullable();
const range=z.strictObject({min:z.number().nonnegative(),max:z.number().nonnegative()}).refine(v=>v.min<=v.max,'invalid range');
const money=z.strictObject({range,currency:z.string().regex(/^[A-Z]{3}$/)});
const quantity=z.strictObject({range,unit:z.string().min(1).max(40)});
export const chromaticProfileSchema=z.strictObject({
 knowledge_strategy:z.strictObject({explore:nullableScore,apply:nullableScore}),
 epistemic_work:z.strictObject({generate:nullableScore,verify:nullableScore}),
 business_orientation:z.strictObject({expand:nullableScore,protect:nullableScore}),
});
export const cardDimensionsSchema=z.strictObject({
 relevance:nullableScore,
 evidence_support:z.enum(['none','indirect','direct','corroborated']).nullable(),
 business_impact:z.strictObject({benefit:quantity.nullable(),harm:quantity.nullable(),horizonAt:z.iso.datetime({offset:true}).nullable()}).nullable(),
 urgency:z.strictObject({deadlineAt:z.iso.datetime({offset:true}),reason:z.string().min(1).max(300)}).nullable(),
 novelty:nullableScore,
 action_readiness:nullableScore,
 uncertainty:z.strictObject({data:nullableScore,assumptions:nullableScore,future:nullableScore}).nullable(),
 evidence_conflict:z.enum(['candidate','reviewed_conflict','resolved']).nullable(),
 freshness:z.strictObject({sourceObservedAt:z.iso.datetime({offset:true}),validUntil:z.iso.datetime({offset:true}).nullable()}).nullable(),
 resolution_cost:z.strictObject({timeMs:range.nullable(),money:money.nullable(),tokens:range.nullable()}).nullable(),
});
export function unknownChromaticProfile():z.infer<typeof chromaticProfileSchema>{return {knowledge_strategy:{explore:null,apply:null},epistemic_work:{generate:null,verify:null},business_orientation:{expand:null,protect:null}};}
export function unknownCardDimensions():z.infer<typeof cardDimensionsSchema>{return {relevance:null,evidence_support:null,business_impact:null,urgency:null,novelty:null,action_readiness:null,uncertainty:null,evidence_conflict:null,freshness:null,resolution_cost:null};}
export const cardOntologyProposalSchema=z.strictObject({
 ontologyId:z.literal(CARD_ONTOLOGY_ID),ontologyVersion:z.literal(CARD_ONTOLOGY_VERSION),
 family:cardFamilySchema.nullable(),profile:chromaticProfileSchema,dimensions:cardDimensionsSchema,
 evidenceRefs:z.array(cognitiveRefSchema).min(1).max(100),
 targetGoalRef:cognitiveRefSchema.optional(),contextDigest:z.string().min(1).max(200).optional(),
}).superRefine((v,ctx)=>{
 if ((v.dimensions.relevance!==null||v.dimensions.novelty!==null||v.dimensions.action_readiness!==null)&&!v.contextDigest)
  ctx.addIssue({code:'custom',message:'contextual dimensions require contextDigest'});
 const tenants=new Set(v.evidenceRefs.map(r=>r.tenantId));
 if(tenants.size!==1||(v.targetGoalRef&&!tenants.has(v.targetGoalRef.tenantId)))ctx.addIssue({code:'custom',message:'cross-tenant ontology references'});
});
export type CardOntologyProposal=z.infer<typeof cardOntologyProposalSchema>;
export const cardOntologyAssessmentSchema=z.strictObject({
 evaluator:z.enum(['slow','rules','jev','human']),evaluatorVersion:z.string().min(1).max(200),
 evaluatedAt:z.iso.datetime({offset:true}),proposal:cardOntologyProposalSchema,
});
export type CardOntologyAssessment=z.infer<typeof cardOntologyAssessmentSchema>;
export function resolveCardAssessments(assessments:CardOntologyAssessment[]){
 let disputed=false;
 const equal=(a:unknown,b:unknown):boolean=>{
  if(a===b)return true;
  if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return false;
  const x=a as Record<string,unknown>,y=b as Record<string,unknown>;
  const keys=Object.keys(x).sort();
  return keys.length===Object.keys(y).length&&keys.every(k=>Object.hasOwn(y,k)&&equal(x[k],y[k]));
 };
 const consensus=<T>(values:(T|null)[]):T|null=>{
  const known=values.filter(v=>v!==null) as T[];
  if(!known.length)return null;
  if(known.some(v=>!equal(v,known[0]))){disputed=true;return null;}
  return known[0];
 };
 let family=consensus(assessments.map(a=>a.proposal.family));
 if(family==='outcome'){family=null;disputed=true;}
 const profile=unknownChromaticProfile(),dimensions=unknownCardDimensions();
 for(const axis of Object.keys(profile) as (keyof typeof profile)[]){
  const values=profile[axis] as Record<string,number|null>;
  for(const pole of Object.keys(values))values[pole]=consensus(assessments.map(a=>(a.proposal.profile[axis] as Record<string,number|null>)[pole]));
 }
 for(const key of Object.keys(dimensions) as (keyof typeof dimensions)[])
  (dimensions as Record<string,unknown>)[key]=consensus(assessments.map(a=>a.proposal.dimensions[key]));
 return {family,profile,dimensions,disputed};
}
export const cardOntologyAnnotationSchema=z.strictObject({
 ontologyId:z.literal(CARD_ONTOLOGY_ID),ontologyVersion:z.literal(CARD_ONTOLOGY_VERSION),
 approvalDecisionId:z.literal('founder-20261116-card-ontology-001'),
 review:z.literal('proposed'),family:cardFamilySchema.nullable(),profile:chromaticProfileSchema,
 dimensions:cardDimensionsSchema,disputed:z.boolean(),
 assessments:z.array(cardOntologyAssessmentSchema).min(1).max(3),
}).superRefine((v,ctx)=>{
 const resolved=resolveCardAssessments(v.assessments);
 if(JSON.stringify(resolved)!==JSON.stringify({family:v.family,profile:v.profile,dimensions:v.dimensions,disputed:v.disputed}))
  ctx.addIssue({code:'custom',message:'ontology summary must match preserved assessments'});
});
export type CardOntologyAnnotation=z.infer<typeof cardOntologyAnnotationSchema>;
