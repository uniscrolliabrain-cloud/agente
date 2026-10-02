/** Background errors are visible without logging provider payloads or credential-bearing URLs. */
// LOG_STRUCTURED_V1 - log JSON una linea por evento, listo para colector.
function emit(level: "info" | "warn" | "error", event: string, fields: Record<string, unknown>) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn" ) console.warn(line);
  else console.log(line);
}

export function logInfo(event: string, fields: Record<string, unknown> = {}) {
  emit("info", event, fields);
}

export function logWarn(event: string, fields: Record<string, unknown> = {}) {
  emit("warn", event, fields);
}

export function backgroundFailure(phase: string, error: unknown) {
  emit("error", "background_failure", {
    phase,
    error: error instanceof Error ? error.name : "Background operation failed",
    message: error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500),
  });
}

