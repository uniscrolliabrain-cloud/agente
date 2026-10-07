// PERSONAS_TYPES_V1 - tipos del modulo de personas (runtime).
//
// Estos tipos NO son schemas (esos viven en packages/domain). Son el
// ensamblado runtime: que produce el sistema cuando una persona entra
// en un turno (AgentSkin) y donde vive su grafo cognitivo (AgentNode).
//
// Ver: docs/audits/09-kernel-cognitivo/09z-personas.md (a crear)

import type {
  AgentPersona,
  AgentStats,
} from "../../../../../../packages/domain/src/agent-persona.ts";
import type { AgentMemory } from "../../../../../../packages/domain/src/agent.ts";
import type { Thought } from "../../../kernel/graph/thought.ts";
import type { Turn } from "../../../kernel/graph/turn.ts";

/**
 * AGENT_STATE_V1 - estado runtime de una persona.
 * Es lo que el kernel ensambla antes de abrir un turno y lo que actualiza
 * al cerrarlo. Vive en memoria durante la peticion, se persiste al cerrar.
 */
export interface AgentState {
  mood: "neutral" | "good" | "tired" | "focused" | "distracted";
  focus: string[];
  activeLanes: string[];
}

/**
 * AGENT_SKIN_V1 - ensamblado de la persona para un turno concreto.
 *
 * Una AgentPersona es estatica (vive en JSON). Un AgentSkin es dinamico
 * (se compone al abrir el chat): toma la persona, sus stats, su estado
 * actual, y produce el contexto que el LLM necesita para hablar como ella.
 *
 * No se persiste. Se compone y se descarta al cerrar el turno.
 */
export interface AgentSkin {
  personaId: string;
  persona: AgentPersona;
  stats: AgentStats;
  state: AgentState;
  nodeId: string;
}

/**
 * AGENT_NODE_V1 - grafo cognitivo de una persona.
 *
 * Cada persona tiene su propio nodo: sus Turns, sus Thoughts, su memoria.
 * Aislado de otros nodos por personaId. El kernel escribe aqui cuando la
 * persona esta activa.
 *
 * No se cachea entero (puede tener miles de thoughts). Se consulta por
 * partes: turns recientes, thoughts de un turno, memoria por categoria.
 */
export interface AgentNode {
  personaId: string;
  tenantId: string;
  owner: string;
  turns: Turn[];
  thoughts: Thought[];
  memory: AgentMemory[];
  lastActivityAt?: string;
}

/**
 * PERSONA_BUNDLE_V1 - bundle declarativo de personas de un tenant.
 *
 * Se carga al arrancar el server desde clientes/<tenant>/personas/*.json.
 * Se valida contra agentPersonaSchema. Si algun JSON no valida, ese
 * persona no se carga (fail-soft por persona, fail-closed por tenant si
 * todas fallan).
 */
export interface PersonaBundle {
  personas: AgentPersona[];
  stats: Record<string, AgentStats>;
}