// CIRCUIT_BREAKER_V1 — cortacircuitos por dominio/proveedor.
//
// Tres estados:
//   closed   — funcionamiento normal.
//   open     — falla el último N; rechaza llamadas sin intentar.
//   half-open — pasado el cooldown, deja pasar un intento de prueba.
//
// Ver: docs/audits/03-resiliencia/miniaudit.md ("Sin circuit breaker"),
// docs/audits/03-resiliencia/roadmap.md §8.

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitOptions {
  /** Fallos consecutivos antes de abrir. */
  failureThreshold: number;
  /** ms que permanece abierto antes de probar half-open. */
  openMs: number;
  /** ms máximos para half-open (si el intento de prueba no responde, se vuelve a abrir). */
  halfOpenTimeoutMs: number;
}

export const DEFAULT_CIRCUIT: CircuitOptions = {
  failureThreshold: 5,
  openMs: 30_000,
  halfOpenTimeoutMs: 10_000,
};

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private openedAt = 0;
  private halfOpenStartedAt = 0;

  constructor(
    readonly name: string,
    private readonly options: CircuitOptions = DEFAULT_CIRCUIT,
  ) {}

  getState(): CircuitState {
    // Si está abierto y ya pasó el cooldown, transiciona a half-open.
    if (this.state === "open" && Date.now() - this.openedAt >= this.options.openMs) {
      this.state = "half-open";
      this.halfOpenStartedAt = Date.now();
    }
    // Si está half-open y lleva demasiado, vuelve a open.
    if (
      this.state === "half-open" &&
      Date.now() - this.halfOpenStartedAt > this.options.halfOpenTimeoutMs
    ) {
      this.open();
    }
    return this.state;
  }

  /** Llama al handler. Si el circuito está abierto, lanza sin ejecutar. */
  async call<T>(operation: () => Promise<T>): Promise<T> {
    const current = this.getState();
    if (current === "open") {
      throw new CircuitOpenError(this.name);
    }
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.failures += 1;
    if (this.state === "half-open") {
      // Un solo fallo en half-open reabre.
      this.open();
      return;
    }
    if (this.failures >= this.options.failureThreshold) {
      this.open();
    }
  }

  private open(): void {
    this.state = "open";
    this.openedAt = Date.now();
    // CIRCUIT_ALERT_ON_OPEN_V1 - notifica al log cuando se abre.
    import("../log.ts")
      .then(({ logWarn }) => {
        logWarn("circuit.open", { circuit: this.name });
      })
      .catch(() => {});
    this.failures = 0;
  }

  /** Fuerza el cierre (útil en tests). */
  recordFailure(error: unknown): void {
    if (typeof (error as { status?: number })?.status === "number") {
      const s = (error as { status: number }).status;
      if (s >= 400 && s < 500 && s !== 408 && s !== 429) return;
    }
    this.onFailure();
  }
  recordSuccess(): void { this.onSuccess(); }

  reset(): void {
    this.state = "closed";
    this.failures = 0;
    this.openedAt = 0;
    this.halfOpenStartedAt = 0;
  }
}

export class CircuitOpenError extends Error {
  readonly code = "circuit_open";
  constructor(readonly circuitName: string) {
    super(`Circuito abierto para ${circuitName}`);
    this.name = "CircuitOpenError";
  }
}

/** Registro por nombre. Un breaker por proveedor (google, llm, whatsapp, stripe). */
export class CircuitRegistry {
  private readonly breakers = new Map<string, CircuitBreaker>();

  get(name: string, options?: CircuitOptions): CircuitBreaker {
    let breaker = this.breakers.get(name);
    if (!breaker) {
      breaker = new CircuitBreaker(name, options);
      this.breakers.set(name, breaker);
    }
    return breaker;
  }

  all(): CircuitBreaker[] {
    return [...this.breakers.values()];
  }
}

export const globalCircuits = new CircuitRegistry();
