// KERNEL_STORE_STORE_V1 - StoreTurnStore persistente via Store interface.
// kind="cognitive-turns" y "cognitive-thoughts". tenantId obligatorio. SOC-2.
// Un Map hoy, PG manana. Misma interfaz TurnStore.
import { randomUUID } from "node:crypto";
import { thoughtSchema, type Thought } from "./thought.ts";
import { turnSchema, type Turn, type TurnCloseReason } from "./turn.ts";
import type { TurnStore } from "./store.ts";
export interface StorePort{put(kind:string,id:string,tenantId:string,data:unknown):Promise<void>;get(kind:string,id:string,tenantId:string):Promise<unknown>;list(kind:string,tenantId:string,limit:number):Promise<{id:string,data:unknown}[]>}
export class StoreTurnStore implements TurnStore{
 private readonly store:StorePort;constructor(store:StorePort){this.store=store}
 async openTurn(tenantId:string,owner:string,trigger:string):Promise<Turn>{
  const turn=turnSchema.parse({id:randomUUID(),tenantId,owner,startedAt:new Date().toISOString(),status:"open",triggers:[trigger]});
  await this.store.put("cognitive-turns",turn.id,tenantId,turn);return turn
 }
 async openChildTurn(tenantId:string,owner:string,parentTurnId:string,trigger:string):Promise<Turn>{
  const raw=await this.store.get("cognitive-turns",parentTurnId,tenantId);if(!raw)throw new Error(`Parent not found ${parentTurnId}`);
  const parent=turnSchema.parse(raw);if(parent.tenantId!==tenantId)throw new Error(`Tenant mismatch`);
  const child=turnSchema.parse({id:randomUUID(),tenantId,owner,parentTurnId,startedAt:new Date().toISOString(),status:"open",triggers:[trigger]});
  parent.childTurnIds.push(child.id);await this.store.put("cognitive-turns",parent.id,tenantId,parent);await this.store.put("cognitive-turns",child.id,tenantId,child);return child
 }
 async append(thought:Thought):Promise<Thought>{
  const parsed=thoughtSchema.parse(thought);const raw=await this.store.get("cognitive-turns",parsed.turnId,parsed.tenantId);if(!raw)throw new Error(`Turn not found ${parsed.turnId}`);
  const turn=turnSchema.parse(raw);if(turn.status!=="open")throw new Error(`Turn not open`);await this.store.put("cognitive-thoughts",parsed.id,parsed.tenantId,parsed);turn.thoughtIds.push(parsed.id);turn.quiescentAt=new Date().toISOString();await this.store.put("cognitive-turns",turn.id,turn.tenantId,turn);return parsed
 }
 async thoughtsOf(tenantId:string,turnId:string):Promise<Thought[]>{
  const raw=await this.store.get("cognitive-turns",turnId,tenantId);if(!raw)return[];const turn=turnSchema.parse(raw);const out:Thought[]=[];for(const tid of turn.thoughtIds){const td=await this.store.get("cognitive-thoughts",tid,tenantId);if(td)out.push(thoughtSchema.parse(td))}return out
 }
 async closeTurn(tenantId:string,turnId:string,reason:TurnCloseReason,closedBy:"presenter"|"quiescence"|"timeout"|"user"|"system"):Promise<Turn>{
  const raw=await this.store.get("cognitive-turns",turnId,tenantId);if(!raw)throw new Error(`Turn not found ${turnId}`);const turn=turnSchema.parse(raw);if(turn.status!=="open")return turn;turn.status="closed";turn.closedAt=new Date().toISOString();turn.closeReason=reason;turn.closedBy=closedBy;await this.store.put("cognitive-turns",turn.id,tenantId,turn);return turn
 }
 async getTurn(tenantId:string,turnId:string):Promise<Turn|undefined>{
  const raw=await this.store.get("cognitive-turns",turnId,tenantId);if(!raw)return undefined;return turnSchema.parse(raw)
 }
 async listTurns(tenantId:string,limit:number):Promise<Turn[]>{
  const rows=await this.store.list("cognitive-turns",tenantId,limit);return rows.map(r=>turnSchema.parse(r.data))
 }
}