/**
 * KafkaSink (stub).
 *
 * Cuando Kafka entre:
 *   - Implementa EventSink.
 *   - Publica en topic `openmuse.events.<owner>`.
 *   - Particionado por `source.id` para mantener orden por entidad.
 *   - La firma HMAC se anade AQUI, no en el bus.
 */
export interface KafkaSink {}