// B2_TOOLS_REDUCER_V1 - reducer puro de tool calls por turno.
export interface ToolCall {
  id: string;
  name: string;
  status: "running" | "done" | "error";
  startedAt: number;
  endedAt?: number;
}

export type ToolsAction =
  | { type: "RUN_STARTED" }
  | { type: "TOOL_CALL_START"; id: string; name: string; at: number }
  | { type: "TOOL_CALL_END"; id: string; at: number; error?: boolean };

export function toolsReducer(state: ToolCall[], action: ToolsAction): ToolCall[] {
  switch (action.type) {
    case "RUN_STARTED":
      return [];
    case "TOOL_CALL_START":
      if (state.some((t) => t.id === action.id)) return state;
      return [
        ...state,
        { id: action.id, name: action.name, status: "running", startedAt: action.at },
      ];
    case "TOOL_CALL_END":
      return state.map((t) =>
        t.id === action.id
          ? { ...t, status: action.error ? "error" : "done", endedAt: action.at }
          : t,
      );
    default:
      return state;
  }
}