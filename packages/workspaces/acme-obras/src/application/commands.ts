// acme-obras - comandos.
// Sin comandos en E14: ninguna vista declara `actions`, asi que la UI no
// ofrece botones que no puedan ejecutarse (H24).
import type { WorkspaceCommandHandler } from "../../../src/contracts/index.ts";

export const COMMANDS: Readonly<Record<string, WorkspaceCommandHandler>> = {};
