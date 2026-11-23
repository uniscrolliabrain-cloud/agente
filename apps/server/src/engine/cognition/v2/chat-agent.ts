import { AbstractAgent } from "@ag-ui/client";
import type { BaseEvent, RunAgentInput } from "@ag-ui/core";
import type { Observable } from "rxjs";
import type { CognitionV2Runtime } from "./runtime.ts";

/** CopilotKit AG-UI adapter: the opted-in tenant never falls back to ConversationAgent V1. */
export class CognitionV2ChatAgent extends AbstractAgent {
  constructor(private readonly cognition: CognitionV2Runtime, private readonly owner: string) {
    super();
  }
  run(input: RunAgentInput): Observable<BaseEvent> {
    return this.cognition.chat(this.owner, input);
  }
}
