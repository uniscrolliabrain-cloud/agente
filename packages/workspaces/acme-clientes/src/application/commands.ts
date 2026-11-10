// acme-clientes - comandos.
// Sin comandos en E14: las vistas declaran `actions: []`, la UI no ofrece
// botones que el runtime no sepa ejecutar.
import type { WorkspaceCommandHandler } from "../../../src/contracts/index.ts";

export const COMMANDS: Readonly<Record<string, WorkspaceCommandHandler>> = {};
