import { test } from "node:test";
import assert from "node:assert/strict";
import { EventType, type BaseEvent } from "@ag-ui/core";
import { publicTextEvent } from "../apps/server/src/engine/cognition/v2/public-text-event.ts";
test("C12 provider reasoning/state/custom/tool events cannot cross the public text boundary",()=>{
 for(const type of [EventType.REASONING_MESSAGE_CONTENT,EventType.REASONING_ENCRYPTED_VALUE,EventType.STATE_SNAPSHOT,EventType.CUSTOM,EventType.TOOL_CALL_ARGS,EventType.RUN_FINISHED]){
  assert.equal(publicTextEvent({type,messageId:"private",delta:"private",snapshot:{private:"reasoning"},name:"private",value:"private"} as BaseEvent),null);
 }
 const event={type:EventType.TEXT_MESSAGE_CONTENT,messageId:"answer",delta:"Public answer",rawEvent:{private:"reasoning"},privateReasoning:"private"} as BaseEvent;
 assert.deepEqual(publicTextEvent(event),{type:EventType.TEXT_MESSAGE_CONTENT,messageId:"answer",delta:"Public answer"});
 assert.throws(()=>publicTextEvent({type:EventType.TEXT_MESSAGE_START,messageId:"spoofed",role:"system"} as BaseEvent),/INVALID_PUBLIC_TEXT_EVENT/);
 assert.throws(()=>publicTextEvent({type:EventType.TEXT_MESSAGE_CONTENT,messageId:"invalid",delta:42} as unknown as BaseEvent),/INVALID_PUBLIC_TEXT_EVENT/);
});
