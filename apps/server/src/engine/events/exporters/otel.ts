/**
 * OtelExporter (stub).
 *
 * Cuando OpenTelemetry entre:
 *   - Lee del EventSink.
 *   - Convierte cada SystemEvent en un span.
 *   - traceId se genera AQUI, no en el evento.
 *   - spanId = event.id.
 *   - attributes: type, source.kind, source.id, payload.projectId, payload.clientId.
 *   - Es un consumidor: nunca escribe de vuelta al bus.
 */
export interface OtelExporter {}