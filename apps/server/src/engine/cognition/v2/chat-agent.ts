import { AbstractAgent } from "@ag-ui/client";
import type { BaseEvent, RunAgentInput } from "@ag-ui/core";
import type { Observable } from "rxjs";
import type { CognitionV2Runtime } from "./runtime.ts";

/** CopilotKit AG-UI adapter: the opted-in tenant never falls back to ConversationAgent V1. */
export class CognitionV2ChatAgent extends AbstractAgent {
  constructor(private cognition: Pick<CognitionV2Runtime, "chat">, private owner: string) {
    super();
    // CopilotKit/AG-UI may extract run as a callback before invoking it.
    // Bind once so the scoped cognition runtime and owner are never lost.
    this.run = this.run.bind(this);
  }
  override clone(): CognitionV2ChatAgent {
    // The CopilotKit runner clones registered agents per request. AbstractAgent
    // copies only its own fields; custom tenant-scoped dependencies are lost.
    const copy = super.clone() as CognitionV2ChatAgent;
    copy.cognition = this.cognition;
    copy.owner = this.owner;
    copy.run = copy.run.bind(copy);
    return copy;
  }
  run(input: RunAgentInput): Observable<BaseEvent> {
    return this.cognition.chat(this.owner, input);
  }
}
