// TESTS_LIFECYCLE_V1 — un after hook protegido no rompe el test runner.
// Cuando un before cuelga, node --test llama al after con estado parcial
// y el after revienta con TypeError sobre undefined. Este helper
// envuelve el cleanup para que sea idempotente y no se propague el error.

export type Cleanup = () => void | Promise<void>;

const cleanups: Cleanup[] = [];
let registered = false;

/**
 * Registra un recurso que se cerrará al final de la suite del archivo.
 * Si el test se cuelga y node --test aborta, los cleanups pendientes
 * se saltan silenciosamente sin TypeError.
 */
export function onCleanup(fn: Cleanup): void {
  cleanups.push(fn);
}

/**
 * Ejecuta todos los cleanups en orden inverso. Si uno falla, se registra
 * pero no impide los siguientes. Pensado para usarse desde `after()`.
 */
export async function runCleanups(): Promise<void> {
  for (const fn of cleanups.reverse()) {
    try {
      await fn();
    } catch (error) {
      console.error("[tests/helpers/lifecycle] cleanup failed:", error);
    }
  }
  cleanups.length = 0;
  registered = false;
}

/**
 * Helper que envuelve un after() para que sea idempotente.
 * Uso:
 *   before(async () => { db = await createStore(); onCleanup(() => db.close()); });
 *   after(protectedAfter(runCleanups));
 */
export function protectedAfter(fn: () => Promise<void>): () => Promise<void> {
  if (registered) return async () => {};
  registered = true;
  return async () => {
    try {
      await fn();
    } catch (error) {
      console.error("[tests/helpers/lifecycle] after failed:", error);
    }
  };
}
