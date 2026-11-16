import type { Store } from '../../../db.ts';
import { CARD_ONTOLOGY_ID,CARD_ONTOLOGY_VERSION,cardOntologyAnnotationSchema,cardOntologyProposalSchema,
 resolveCardAssessments,unknownChromaticProfile,unknownCardDimensions,type CardOntologyProposal,type CardOntologyAnnotation } from '../../../../../../packages/domain/src/card-ontology.ts';
import type { CognitiveRef } from '../../../../../../packages/domain/src/cognitive-reference.ts';
import { digest } from '../v2/storage.ts';
import { ChromaticOntologyRegistry } from './ontology-registry.ts';
export const CARD_ONTOLOGY_DECISION='founder-20261116-card-ontology-001' as const;
export const approvedCardOntology={schemaVersion:'2.0' as const,ontologyId:CARD_ONTOLOGY_ID,version:CARD_ONTOLOGY_VERSION,status:'approved' as const,
 definitionDigest:'df014cf043a5d5ccfd6cef98ee7351ce6dba0713bd5f12cdc9c15ca94b697182',
 axes:[{id:'knowledge_strategy',positivePole:'explore',negativePole:'apply'},{id:'epistemic_work',positivePole:'generate',negativePole:'verify'},
 {id:'business_orientation',positivePole:'expand',negativePole:'protect'}],
 dimensions:Object.keys(unknownCardDimensions()),approvalReceiptId:CARD_ONTOLOGY_DECISION};
const approvalDigest=digest({...approvedCardOntology,status:'draft',approvalReceiptId:undefined});
export class CardOntologyService {
 readonly registry:ChromaticOntologyRegistry;
 constructor(readonly db:Store){
  this.registry=new ChromaticOntologyRegistry(db,{verify:async(id,hash)=>{
   if(id!==CARD_ONTOLOGY_DECISION||hash!==approvalDigest)return false;
   const receipt=await db.get<{ontologyDigest:string}>('system','ontology-approval-decisions',id);
   const revoked=await db.get('system','ontology-approval-revocations',id);
   return !revoked&&receipt?.ontologyDigest===approvalDigest;
  }});
 }
 async install():Promise<void>{
  // Trusted bootstrap records the founder's actual instruction. No model/API
  // input can create a new approval, change its digest or clear revocation.
  await this.db.insertIfAbsent('system','ontology-approval-decisions',{id:CARD_ONTOLOGY_DECISION,ontologyDigest:approvalDigest,
   source:'founder-conversation-2026-11-16',proposalCommit:'83ae5a0',instruction:'Vale aplica eso y sigue ejecutando en autonomo'});
  await this.registry.register(approvedCardOntology);
 }
 async assertApproved():Promise<void>{await this.registry.runtime(CARD_ONTOLOGY_ID,CARD_ONTOLOGY_VERSION);}
 async annotate(input:{slow?:unknown;evaluator?:{proposal:unknown;name:'rules'|'jev';version:string};evidence:CognitiveRef[];contextDigest:string;evaluatedAt:string}):Promise<CardOntologyAnnotation>{
  await this.install();await this.assertApproved();
  const assessments:CardOntologyAnnotation['assessments']=[];
  const add=(raw:unknown,evaluator:'slow'|'rules'|'jev',version:string)=>{
   const proposal=cardOntologyProposalSchema.parse(raw);
   const refs=[...proposal.evidenceRefs,...(proposal.targetGoalRef?[proposal.targetGoalRef]:[])];
   if(refs.some(r=>!input.evidence.some(e=>digest(e)===digest(r))))throw Error('UNANCHORED_ONTOLOGY_EVIDENCE');
   if(proposal.contextDigest&&proposal.contextDigest!==input.contextDigest)throw Error('ONTOLOGY_CONTEXT_MISMATCH');
   assessments.push({evaluator,evaluatorVersion:version,evaluatedAt:input.evaluatedAt,proposal});
  };
  if(input.slow)add(input.slow,'slow','slow-extraction-v1');
  if(input.evaluator)add(input.evaluator.proposal,input.evaluator.name,input.evaluator.version);
  if(!assessments.length)add({ontologyId:CARD_ONTOLOGY_ID,ontologyVersion:CARD_ONTOLOGY_VERSION,family:null,
   profile:unknownChromaticProfile(),dimensions:unknownCardDimensions(),evidenceRefs:input.evidence},'rules','abstention-v1');
  const resolved=resolveCardAssessments(assessments);
  return cardOntologyAnnotationSchema.parse({ontologyId:CARD_ONTOLOGY_ID,ontologyVersion:CARD_ONTOLOGY_VERSION,
   approvalDecisionId:CARD_ONTOLOGY_DECISION,review:'proposed',...resolved,assessments});
 }
}
export function emptyOntologyProposal(evidenceRefs:CognitiveRef[]):CardOntologyProposal{
 return {ontologyId:CARD_ONTOLOGY_ID,ontologyVersion:CARD_ONTOLOGY_VERSION,family:null,profile:unknownChromaticProfile(),dimensions:unknownCardDimensions(),evidenceRefs};
}
