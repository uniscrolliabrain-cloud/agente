// KERNEL_TURN_STORE_V2 — contrato con tenantId explicito.
//
// Cambios respecto a V1:
//   - Todos los metodos reciben tenantId. Sin esto, el store persistente
//     tiene que escanear todos los tenants para encontrar un turno.
//   - openChildTurn: abre turno hijo de un turno padre.
//   - listTurns: lista turnos por tenant (para debug y presentacion).

import type { Thought } from "./thought.ts";
import type { Turn, TurnCloseReason } from "./turn.ts";

export interface TurnStore {
  openTurn(tenantId: string, owner: string, trigger: string): Promise<Turn>;
  openChildTurn(
    tenantId: string,
    owner: string,
    parentTurnId: string,
    trigger: string,
  ): Promise<Turn>;
  append(thought: Thought): Promise<Thought>;
  thoughtsOf(tenantId: string, turnId: string): Promise<Thought[]>;
  closeTurn(
    tenantId: string,
    turnId: string,
    reason: TurnCloseReason,
    closedBy: "presenter" | "quiescence" | "timeout" | "user" | "system",
  ): Promise<Turn>;
  getTurn(tenantId: string, turnId: string): Promise<Turn | undefined>;
  listTurns(tenantId: string, limit: number): Promise<Turn[]>;
}