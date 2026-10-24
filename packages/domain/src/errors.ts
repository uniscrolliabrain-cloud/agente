export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 401 | 403 | 404 | 409 | 410 | 413 | 422 | 429 | 500 | 501 | 502 | 503 = 400,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }
}
// INTEGRATIONS_OUTCOME_UNKNOWN_V1 - error comun para integraciones cuando
// la peticion pudo haber salido pero la respuesta se perdio.
export class OutcomeUnknownError extends Error {
  readonly code = "outcome_unknown";
  constructor(message = "La operacion pudo haber sucedido. Revisa el proveedor antes de reintentar.") {
    super(message);
    this.name = "OutcomeUnknownError";
  }
}