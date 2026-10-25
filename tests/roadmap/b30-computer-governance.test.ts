// B-30 - computer-use debe pasar por Governance, no eludir permisos.
// Requiere ComputerService completo + governance mock. Ficheros no en Repomix.
import { test } from "node:test";

test.skip("B-30: computer_command pasa por governance (requiere ComputerService)", () => {
  // TODO: cuando ComputerService este cableado, verificar que:
  //   1. governance.canExecuteTool deniega -> computer.execute NO se llama.
  //   2. governance.canExecuteTool permite -> computer.execute SI se llama.
  //   3. Cada ejecucion produce una trayectoria (objetivo, observacion, accion, resultado).
});