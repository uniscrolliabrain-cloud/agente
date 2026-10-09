import { Crown, Crosshair, Layers, Shield, Sparkles, Users } from "lucide-react";
import type { ReactElement } from "react";
import type { AgentArchetype } from "./types";

export function getArchetypeIcon(archetype: AgentArchetype, size = 20): ReactElement {
  switch (archetype) {
    case "orchestrator": return <Crown size={size} />;
    case "guardian": return <Shield size={size} />;
    case "hunter": return <Crosshair size={size} />;
    case "architect": return <Layers size={size} />;
    case "strategist": return <Users size={size} />;
    default: return <Sparkles size={size} />;
  }
}