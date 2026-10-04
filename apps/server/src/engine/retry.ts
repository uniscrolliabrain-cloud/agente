// RETRY_V1 — backoff exponencial con jitter.
//
// Primitiva base del bloque 03. La usan model-chain, worker, google y computer.
//
// Ver: docs/audits/03-resiliencia/miniaudit.md ("Sin retry con backoff"),
// docs/audits/03-resiliencia/roadmap.md §8 ("el sistema reintenta con backoff").
//
// Reglas:
//   - Nunca reintentar errores deterministas (4xx, validación).
//   - Sí reintentar errores transitorios (5xx, timeouts, red).
//   - Jitter completo (no parcial): evita thundering herd cuando N tareas
//     fallan por el mismo proveedor caído y reintentan a la vez.

export interface RetryOptions {
  maxAttempts: number;
  baseMs: number;
  maxMs: number;
  /** Determina si un error merece reintento. Default: true para errores transitorios. */
  isRetryable?: (error: unknown) => boolean;
  /** Callback por cada intento fallido (útil para logging/métricas). */
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
  /** Signal externo (abort del worker, shutdown). */
  signal?: AbortSignal;
}

export function defaultIsRetryable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  // Abortos explícitos: no reintentar.
  if (error.name === "AbortError") return false;
  // Errores tipados con status 4xx: no reintentar.
  const status = (error as { status?: number }).status;
  if (typeof status === "number") {
    if (status >= 400 && status < 500 && status !== 408 && status !== 429) return false;
    if (status >= 500 || status === 408 || status === 429) return true;
  }
  // Errores de red / timeout / DNS.
  const message = error.message.toLowerCase();
  if (/timeout|econn|enotfound|eai_again|socket|network|aborted|fetch failed/.test(message)) {
    return true;
  }
  // Errores tipo OutcomeUnknownError del dominio: el efecto puede haber salido.
  if ((error as { outcomeUnknown?: boolean }).outcomeUnknown === true) return false;
  // Por defecto, no reintentar: preferimos declarar explícitamente qué es retryable.
  return false;
}

/** Jitter completo: un valor uniforme en [0, delay]. Evita sincronización de reintentos. */
function withFullJitter(delayMs: number): number {
  return Math.floor(Math.random() * delayMs);
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const isRetryable = options.isRetryable ?? defaultIsRetryable;
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    options.signal?.throwIfAborted();
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === options.maxAttempts) break;
      if (!isRetryable(error)) break;

      // Backoff exponencial: base * 2^(attempt-1), capado a maxMs.
      const expDelay = Math.min(options.maxMs, options.baseMs * 2 ** (attempt - 1));
      const delayMs = withFullJitter(expDelay);

      options.onRetry?.(attempt, delayMs, error);
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, delayMs);
        const abort = () => {
          clearTimeout(timer);
          reject(new Error("Aborted during retry backoff"));
        };
        options.signal?.addEventListener("abort", abort, { once: true });
      });
    }
  }
  throw lastError;
}
